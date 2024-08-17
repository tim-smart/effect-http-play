import { SqlClient, SqlSchema } from "@effect/sql"
import { Context, Effect, Layer } from "effect"
import { Group, GroupId } from "../Domain/Group.js"
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

  const updateSchema = SqlSchema.single({
    Request: Group.update,
    Result: Group,
    execute: (group) =>
      sql`update groups set ${sql.update(group, ["id"])} where id = ${group.id} returning *`,
  })
  const update = (group: typeof Group.update.Type) =>
    updateSchema(group).pipe(
      Effect.orDie,
      Effect.withSpan("GroupsRepo.update", { attributes: { group } }),
    )

  const findByIdSchema = SqlSchema.findOne({
    Request: GroupId,
    Result: Group,
    execute: (id) => sql`select * from groups where id = ${id}`,
  })
  const findById = (id: GroupId) =>
    findByIdSchema(id).pipe(
      Effect.orDie,
      Effect.withSpan("GroupsRepo.findById", { attributes: { id } }),
    )

  return { insert, update, findById } as const
})

export class GroupsRepo extends Context.Tag("Groups/Repo")<
  GroupsRepo,
  Effect.Effect.Success<typeof make>
>() {
  static Live = Layer.effect(GroupsRepo, make).pipe(Layer.provide(SqlLive))
}
