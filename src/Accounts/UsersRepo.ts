import { SqlClient, SqlSchema } from "@effect/sql"
import { Effect, Layer, pipe } from "effect"
import { User, UserId } from "../Domain/User.js"
import { SqlLive } from "../Sql.js"
import { AccessToken } from "../Domain/AccessToken.js"
import { makeTestLayer } from "../lib/Layer.js"

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

  const findByIdSchema = SqlSchema.findOne({
    Request: UserId,
    Result: User,
    execute: (id) => sql`select * from users where id = ${id}`,
  })
  const findById = (id: typeof UserId.Type) =>
    pipe(
      findByIdSchema(id),
      Effect.orDie,
      Effect.withSpan("UsersRepo.findById", { attributes: { id } }),
    )

  const findByApiKeySchema = SqlSchema.findOne({
    Request: AccessToken,
    Result: User,
    execute: (key) => sql`select * from users where apiKey = ${key}`,
  })
  const findByApiKey = (apiKey: AccessToken) =>
    pipe(
      findByApiKeySchema(apiKey),
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
  static Test = makeTestLayer(UsersRepo)({})
}
