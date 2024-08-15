import { SqlClient, SqlResolver, SqlSchema } from "@effect/sql"
import { Context, Effect, Layer, pipe, Redacted } from "effect"
import { ApiKey, User, UserId } from "../Domain/User.js"
import { SqlLive } from "../Sql.js"

export const make = Effect.gen(function* () {
  const sql = yield* SqlClient.SqlClient

  const insertSchema = SqlSchema.single({
    Request: User.insert,
    Result: User,
    execute: (users) => sql`
      insert into users ${sql.insert(users).returning("*")}
    `,
  })

  const insert = (user: typeof User.insert.Type) =>
    insertSchema(user).pipe(
      Effect.orDie,
      Effect.withSpan("UsersRepo.insert", { attributes: { user } }),
    )

  const findByIdResolver = yield* SqlResolver.findById("Users/Users/findById", {
    Id: UserId,
    Result: User,
    ResultId(result) {
      return result.id
    },
    execute(requests) {
      return sql`select * from users where ${sql.in("id", requests)}`
    },
  })
  const findById = (id: typeof UserId.Type) =>
    pipe(
      findByIdResolver.execute(id),
      Effect.withSpan("UsersId.findById", { attributes: { id } }),
    )

  const findByApiKeyResolver = yield* SqlResolver.findById(
    "Users/Users/findByApiKey",
    {
      Id: ApiKey,
      Result: User,
      ResultId(result) {
        return Redacted.value(result.apiKey)
      },
      execute(requests) {
        return sql`select * from users where ${sql.in("apiKey", requests)}`
      },
    },
  )
  const findByApiKey = (apiKey: typeof ApiKey.Type) =>
    pipe(
      findByApiKeyResolver.execute(apiKey),
      Effect.withSpan("UsersId.findByApiKey", { attributes: { apiKey } }),
    )

  return { insert, findById, findByApiKey } as const
})

export class UsersRepo extends Context.Tag("Accounts/UsersRepo")<
  UsersRepo,
  Effect.Effect.Success<typeof make>
>() {
  static Live = Layer.effect(UsersRepo, make).pipe(Layer.provide(SqlLive))
}
