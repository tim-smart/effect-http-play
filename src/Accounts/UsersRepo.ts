import { SqlClient, SqlResolver, SqlSchema } from "@effect/sql"
import { Context, Effect, Layer, pipe, Redacted } from "effect"
import { User, UserId } from "../Domain/User.js"
import { SqlLive } from "../Sql.js"
import { AccessToken } from "../Domain/AccessToken.js"
import { Schema } from "@effect/schema"

export const make = Effect.gen(function* () {
  const sql = yield* SqlClient.SqlClient

  const insertSchema = SqlSchema.single({
    Request: User.insert,
    Result: User,
    execute: (users) =>
      sql`insert into users ${sql.insert(users).returning("*")}`,
  })

  const insert = (user: typeof User.insert.Type) =>
    insertSchema(user).pipe(
      Effect.orDie,
      Effect.withSpan("UsersRepo.insert", { attributes: { user } }),
    )

  const updateSchema = SqlSchema.single({
    Request: User.update,
    Result: User,
    execute: (user) =>
      sql`update users set ${sql.update(user, ["id"]).returning("*")} where id = ${user.id}`,
  })

  const update = (user: typeof User.update.Type) =>
    updateSchema(user).pipe(
      Effect.orDie,
      Effect.withSpan("UsersRepo.update", { attributes: { user } }),
    )

  const findByIdResolver = yield* SqlResolver.findById(
    "Accounts/UsersRepo/findById",
    {
      Id: UserId,
      Result: User,
      ResultId: (result) => result.id,
      execute: (requests) =>
        sql`select * from users where ${sql.in("id", requests)}`,
    },
  )
  const findById = (id: typeof UserId.Type) =>
    pipe(
      findByIdResolver.execute(id),
      Effect.orDie,
      Effect.withSpan("UsersRepo.findById", { attributes: { id } }),
    )

  const findByApiKeyResolver = yield* SqlResolver.findById(
    "Users/Users/findByApiKey",
    {
      Id: AccessToken,
      Result: User,
      ResultId: (result) => Redacted.value(result.apiKey),
      execute: (requests) =>
        sql`select * from users where ${sql.in("apiKey", requests)}`,
    },
  )
  const findByApiKey = (apiKey: AccessToken) =>
    pipe(
      findByApiKeyResolver.execute(apiKey),
      Effect.orDie,
      Effect.withSpan("UsersRepo.findByApiKey", { attributes: { apiKey } }),
    )

  return { insert, update, findById, findByApiKey } as const
})

export class UsersRepo extends Effect.Tag("Accounts/UsersRepo")<
  UsersRepo,
  Effect.Effect.Success<typeof make>
>() {
  static Live = Layer.effect(UsersRepo, make).pipe(Layer.provide(SqlLive))
}
