import { SqlClient } from "@effect/sql"
import { AccountsRepo } from "./Accounts/AccountsRepo.js"
import { UsersRepo } from "./Accounts/UsersRepo.js"
import { ApiKey, User } from "./Domain/User.js"
import { Account } from "./Domain/Account.js"
import { Effect, Layer } from "effect"
import { Uuid } from "./Uuid.js"
import { SqlLive } from "./Sql.js"

const make = Effect.gen(function* () {
  const sql = yield* SqlClient.SqlClient
  const accountRepo = yield* AccountsRepo
  const userRepo = yield* UsersRepo
  const uuid = yield* Uuid

  const createUser = (user: typeof User.jsonCreate.Type) =>
    accountRepo.insert(Account.insert.make({})).pipe(
      Effect.tap((account) => Effect.annotateCurrentSpan("account", account)),
      Effect.bindTo("account"),
      Effect.bind("apiKey", () => uuid.generateRedacted),
      Effect.andThen(({ account, apiKey }) =>
        userRepo.insert(
          User.insert.make({
            ...user,
            accountId: account.id,
            apiKey: ApiKey.make(apiKey),
          }),
        ),
      ),
      sql.withTransaction,
      Effect.orDie,
      Effect.withSpan("Accounts.createUser", { attributes: { user } }),
    )

  const findUserByApiKey = userRepo.findByApiKey

  return { createUser, findUserByApiKey } as const
})

export class Accounts extends Effect.Tag("Accounts")<
  Accounts,
  Effect.Effect.Success<typeof make>
>() {
  static Live = Layer.effect(Accounts, make).pipe(
    Layer.provide(SqlLive),
    Layer.provide(AccountsRepo.Live),
    Layer.provide(UsersRepo.Live),
    Layer.provide(Uuid.Live),
  )
}
