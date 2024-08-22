import { ApiBuilder } from "@effect/platform"
import { api } from "../Api.js"
import { Accounts } from "../Accounts.js"
import { AccountsPolicy } from "./Policy.js"
import { Effect, Layer, Option, pipe } from "effect"
import { policyUse, withSystemActor } from "../Domain/Policy.js"
import { CurrentUser, UserNotFound } from "../Domain/User.js"
import { makeSecurity } from "../Api/Security.js"

export const HttpAccountsLive = ApiBuilder.group(api, "accounts", (handlers) =>
  Effect.gen(function* () {
    const accounts = yield* Accounts
    const policy = yield* AccountsPolicy
    const security = yield* makeSecurity

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
      ApiBuilder.middleware(security),
      // unprotected
      ApiBuilder.handle("createUser", ({ payload }) =>
        withSystemActor(accounts.createUser(payload)),
      ),
    )
  }),
).pipe(Layer.provide(Accounts.Live), Layer.provide(AccountsPolicy.Live))
