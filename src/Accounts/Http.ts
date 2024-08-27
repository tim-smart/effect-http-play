import { ApiBuilder } from "@effect/platform"
import { Effect, Layer, Option, pipe } from "effect"
import { Accounts } from "../Accounts.js"
import { api } from "../Api.js"
import { policyUse, withSystemActor } from "../Domain/Policy.js"
import { CurrentUser, UserNotFound } from "../Domain/User.js"
import { AccountsPolicy } from "./Policy.js"
import { security } from "../Api/Security.js"

export const HttpAccountsLive = ApiBuilder.group(api, "accounts", (handlers) =>
  Effect.gen(function* () {
    const accounts = yield* Accounts
    const policy = yield* AccountsPolicy

    return handlers.pipe(
      ApiBuilder.handle("updateUser", ({ payload, path }) =>
        pipe(
          accounts.updateUser(path.id, payload),
          policyUse(policy.canUpdate(path.id)),
        ),
      ),
      ApiBuilder.handle("getUserMe", () =>
        CurrentUser.pipe(
          Effect.flatMap(accounts.embellishUser),
          withSystemActor,
        ),
      ),
      ApiBuilder.handle("getUser", ({ path }) =>
        pipe(
          accounts.findUserById(path.id),
          Effect.flatMap(
            Option.match({
              onNone: () => new UserNotFound({ id: path.id }),
              onSome: Effect.succeed,
            }),
          ),
          policyUse(policy.canRead(path.id)),
        ),
      ),
      accounts.httpSecurity,
      // unprotected
      ApiBuilder.handle("createUser", ({ payload }) =>
        accounts.createUser(payload).pipe(
          withSystemActor,
          Effect.tap((user) =>
            ApiBuilder.securitySetCookie(security, user.accessToken),
          ),
        ),
      ),
    )
  }),
).pipe(Layer.provide(Accounts.Live), Layer.provide(AccountsPolicy.Live))
