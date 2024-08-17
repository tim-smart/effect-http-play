import { SqlClient, SqlSchema } from "@effect/sql"
import { Context, Effect, Layer, pipe } from "effect"
import { Account, AccountId } from "../Domain/Account.js"
import { SqlLive } from "../Sql.js"
import { makeTestLayer } from "../lib/Layer.js"

export const make = Effect.gen(function* () {
  const sql = yield* SqlClient.SqlClient

  const insertSchema = SqlSchema.single({
    Request: Account.insert,
    Result: Account,
    execute: (accounts) => sql`
      insert into accounts ${sql.insert(accounts).returning("*")}
    `,
  })

  const insert = (account: typeof Account.insert.Type) =>
    insertSchema(account).pipe(
      Effect.orDie,
      Effect.withSpan("AccountsRepo.insert", { attributes: { account } }),
    )

  const findByIdSchema = SqlSchema.findOne({
    Request: AccountId,
    Result: Account,
    execute(id) {
      return sql`select * from accounts where id = ${id}`
    },
  })
  const findById = (id: typeof AccountId.Type) =>
    pipe(
      findByIdSchema(id),
      Effect.withSpan("AccountsRepo.findById", { attributes: { id } }),
    )

  return { insert, findById } as const
})

export class AccountsRepo extends Context.Tag("Accounts/AccountsRepo")<
  AccountsRepo,
  Effect.Effect.Success<typeof make>
>() {
  static Live = Layer.effect(AccountsRepo, make).pipe(Layer.provide(SqlLive))
  static Test = makeTestLayer(AccountsRepo)({})
}
