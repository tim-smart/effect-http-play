import { Effect, Option } from "effect"
import { Accounts } from "../Accounts.js"
import { accessTokenFromString } from "../Domain/AccessToken.js"
import { Unauthorized, withSystemActor } from "../Domain/Policy.js"
import { CurrentUser, UserId } from "../Domain/User.js"
import { HttpMiddleware, HttpServerRequest } from "@effect/platform"

const bearerLen = "Bearer ".length

export const makeSecurity = Effect.gen(function* () {
  const accounts = yield* Accounts
  const getUser = HttpServerRequest.HttpServerRequest.pipe(
    Effect.map((request) =>
      (request.headers.authorization || "").slice(bearerLen),
    ),
    Effect.map(accessTokenFromString),
    Effect.flatMap((accessToken) =>
      accounts.findUserByAccessToken(accessToken).pipe(
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
    ),
  )
  return HttpMiddleware.make(Effect.provideServiceEffect(CurrentUser, getUser))
})
