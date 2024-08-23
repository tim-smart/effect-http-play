import { ApiBuilder } from "@effect/platform"
import { Effect, Option } from "effect"
import { Accounts } from "../Accounts.js"
import { accessTokenFromString } from "../Domain/AccessToken.js"
import { Unauthorized, withSystemActor } from "../Domain/Policy.js"
import { CurrentUser, UserId } from "../Domain/User.js"
import { security } from "../Api/Security.js"

export const securityMiddleware = Effect.gen(function* () {
  const accounts = yield* Accounts
  return ApiBuilder.middlewareSecurity(security, CurrentUser, (token) =>
    accounts.findUserByAccessToken(accessTokenFromString(token)).pipe(
      withSystemActor,
      Effect.flatMap(
        Option.match({
          onNone: () =>
            new Unauthorized({
              actorId: UserId.make(-1),
              entity: "Http",
              action: "login",
            }),
          onSome: Effect.succeed,
        }),
      ),
    ),
  )
})
