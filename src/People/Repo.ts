import { SqlClient, SqlSchema } from "@effect/sql"
import { Context, Effect, Layer } from "effect"
import { Person } from "../Domain/Person.js"
import { SqlLive } from "../Sql.js"

const make = Effect.gen(function* () {
  const sql = yield* SqlClient.SqlClient

  const insertSchema = SqlSchema.single({
    Request: Person.insert,
    Result: Person,
    execute: (person) =>
      sql`insert into people ${sql.insert(person).returning("*")}`,
  })
  const insert = (person: typeof Person.insert.Type) =>
    insertSchema(person).pipe(
      Effect.orDie,
      Effect.withSpan("PeopleRepo.insert", { attributes: { person } }),
    )

  return { insert } as const
})

export class PeopleRepo extends Context.Tag("People/Repo")<
  PeopleRepo,
  Effect.Effect.Success<typeof make>
>() {
  static Live = Layer.effect(PeopleRepo, make).pipe(Layer.provide(SqlLive))
}
