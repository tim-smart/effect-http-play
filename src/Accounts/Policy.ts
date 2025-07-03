import { Effect } from "effect"
import { User, UserId } from "../Domain/User.js"
import { policy } from "../Domain/Policy.js"

export class AccountsPolicy extends Effect.Service<AccountsPolicy>()(
  "Accounts/Policy",
  {
    effect: Effect.gen(function* () {
      const canUpdate = (toUpdate: User) =>
        policy("User", "update", (actor) =>
          Effect.succeed(actor.id === toUpdate.id),
        )

      const canRead = (toRead: UserId) =>
        policy("User", "read", (actor) => Effect.succeed(actor.id === toRead))

      const canReadSensitive = (toRead: UserId) =>
        policy("User", "readSensitive", (actor) =>
          Effect.succeed(actor.id === toRead),
        )

      return { canUpdate, canRead, canReadSensitive } as const
    }),
  },
) {}
