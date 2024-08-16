import { assert, describe, it } from "@effect/vitest"
import { Accounts } from "app/Accounts"
import { AccountsRepo } from "app/Accounts/AccountsRepo"
import { UsersRepo } from "app/Accounts/UsersRepo"
import { Account, AccountId } from "app/Domain/Account"
import { Email } from "app/Domain/Email"
import { withSystemActor } from "app/Domain/Policy"
import { User, UserId } from "app/Domain/User"
import { makeTestLayer } from "app/lib/Layer"
import { Effect, Layer, pipe } from "effect"

const TestLive = Accounts.Test.pipe(
  Layer.provide(
    makeTestLayer(AccountsRepo)({
      insert: (account) =>
        Effect.succeed(new Account({ ...account, id: AccountId.make(1) })),
    }),
  ),
  Layer.provide(
    makeTestLayer(UsersRepo)({
      insert: (user) =>
        Effect.succeed(new User({ ...user, id: UserId.make(1) })),
    }),
  ),
)

describe("Accounts", () => {
  it.effect("createUser", () =>
    Effect.gen(function* () {
      const accounts = yield* Accounts
      const user = yield* pipe(
        accounts.createUser({ email: Email.make("test@example.com") }),
        withSystemActor,
      )
      assert.strictEqual(user.id, 1)
    }).pipe(Effect.provide(TestLive)),
  )
})