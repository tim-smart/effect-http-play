import { SqlClient, SqlSchema } from "@effect/sql"
import { Context, Effect, Layer } from "effect"
import { Group } from "../Domain/Group.js"
import { SqlLive } from "../Sql.js"

const make = Effect.gen(function* () {
  const sql = yield* SqlClient.SqlClient

  const insertSchema = SqlSchema.single({
    Request: Group.insert,
    Result: Group,
    execute: (group) =>
      sql`insert into groups ${sql.insert(group).returning("*")}`,
  })
  const insert = (group: typeof Group.insert.Type) =>
    insertSchema(group).pipe(
      Effect.orDie,
      Effect.withSpan("GroupsRepo.insert", { attributes: { group } }),
    )

  return { insert } as const
})

export class GroupsRepo extends Context.Tag("Groups/Repo")<
  GroupsRepo,
  Effect.Effect.Success<typeof make>
>() {
  static Live = Layer.effect(GroupsRepo, make).pipe(Layer.provide(SqlLive))
}
