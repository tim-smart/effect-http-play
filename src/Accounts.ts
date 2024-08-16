import { SqlClient } from "@effect/sql"
import { AccountsRepo } from "./Accounts/AccountsRepo.js"
import { UsersRepo } from "./Accounts/UsersRepo.js"
import { User, UserId } from "./Domain/User.js"
import { Account } from "./Domain/Account.js"
import { Effect, Layer, pipe } from "effect"
import { Uuid } from "./Uuid.js"
import { SqlLive } from "./Sql.js"
import { AccessToken } from "./Domain/AccessToken.js"
import { policyRequire } from "./Domain/Policy.js"

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
            apiKey: AccessToken.make(apiKey),
          }),
        ),
      ),
      sql.withTransaction,
      Effect.orDie,
      Effect.withSpan("Accounts.createUser", { attributes: { user } }),
      policyRequire("User", "create"),
    )

  const updateUser = (id: UserId, user: Partial<typeof User.jsonUpdate.Type>) =>
    userRepo.findById(id).pipe(
      Effect.flatten,
      Effect.andThen((previous) =>
        userRepo.update(
          User.update.make({
            ...previous,
            ...user,
            id,
          }),
        ),
      ),
      sql.withTransaction,
      Effect.catchTag("SqlError", (err) => Effect.die(err)),
      Effect.withSpan("Accounts.updateUser", { attributes: { id, user } }),
      policyRequire("User", "update"),
    )

  const findUserByApiKey = (apiKey: AccessToken) =>
    pipe(
      userRepo.findByApiKey(apiKey),
      Effect.withSpan("Accounts.findUserByApiKey", {
        attributes: { apiKey },
      }),
      policyRequire("User", "read"),
    )

  const findUserById = (id: UserId) =>
    pipe(
      userRepo.findById(id),
      Effect.withSpan("Accounts.findUserById", {
        attributes: { id },
      }),
      policyRequire("User", "read"),
    )

  return { createUser, updateUser, findUserByApiKey, findUserById } as const
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
