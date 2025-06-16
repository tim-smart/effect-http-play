import { SqlClient } from "@effect/sql"
import { Effect, Layer, Option, pipe, Scope } from "effect"
import { AccountsRepo } from "./Accounts/AccountsRepo.js"
import { UsersRepo } from "./Accounts/UsersRepo.js"
import { AccessToken, accessTokenFromString } from "./Domain/AccessToken.js"
import { Account } from "./Domain/Account.js"
import { policyRequire } from "./Domain/Policy.js"
import { User, UserId, UserNotFound, UserWithSensitive } from "./Domain/User.js"
import { SqlLive, SqlTest } from "./Sql.js"
import { Uuid } from "./Uuid.js"

export class Accounts extends Effect.Service<Accounts>()("Accounts", {
  effect: Effect.gen(function* () {
    const sql = yield* SqlClient.SqlClient
    const accountRepo = yield* AccountsRepo
    const userRepo = yield* UsersRepo
    const uuid = yield* Uuid

    const createUser = Effect.fn("Accounts.createUser")(
      function* (user: typeof User.jsonCreate.Type) {
        yield* Effect.annotateCurrentSpan("user", user)
        const account = yield* accountRepo.insert(Account.insert.make({}))
        const accessToken = accessTokenFromString(yield* uuid.generate)
        const inserted = yield* userRepo.insert(
          User.insert.make({
            ...user,
            accountId: account.id,
            accessToken,
          }),
        )
        return new UserWithSensitive({
          ...inserted,
          account,
        })
      },
      sql.withTransaction,
      Effect.scoped,
      Effect.orDie,
      policyRequire("User", "create"),
    )

    const updateUser = Effect.fn("Accounts.updateUser")(
      function* (id: UserId, user: typeof User.jsonUpdate.Type) {
        const previous = yield* userRepo.findById(id)
        if (Option.isNone(previous)) {
          return yield* new UserNotFound({ id })
        }
        return yield* userRepo.update({
          ...previous.value,
          ...user,
          id,
          updatedAt: undefined,
        })
      },
      sql.withTransaction,
      Effect.catchTag("SqlError", (err) => Effect.die(err)),
      policyRequire("User", "update"),
    )

    const findUserByAccessToken = (apiKey: AccessToken) =>
      pipe(
        userRepo.findByAccessToken(apiKey),
        Effect.withSpan("Accounts.findUserByAccessToken"),
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

    const embellishUser = (user: User) =>
      pipe(
        accountRepo.findById(user.accountId),
        Effect.flatten,
        Effect.map((account) => new UserWithSensitive({ ...user, account })),
        Effect.orDie,
        Effect.withSpan("Accounts.embellishUser", {
          attributes: { id: user.id },
        }),
        policyRequire("User", "readSensitive"),
      )

    return {
      createUser,
      updateUser,
      findUserByAccessToken,
      findUserById,
      embellishUser,
    } as const
  }),
  dependencies: [
    SqlLive,
    AccountsRepo.Default,
    UsersRepo.Default,
    Uuid.Default,
  ],
}) {
  static Test = this.DefaultWithoutDependencies.pipe(
    Layer.provideMerge(SqlTest),
    Layer.provideMerge(Uuid.Test),
  )
}
