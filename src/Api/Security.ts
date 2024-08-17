import { Effect, Option } from "effect"
import { Security } from "effect-http"
import { Accounts } from "../Accounts.js"
import { accessTokenFromString } from "../Domain/AccessToken.js"
import { Unauthorized, withSystemActor } from "../Domain/Policy.js"
import { UserId } from "../Domain/User.js"

export const security = Security.bearer().pipe(
  Security.map(accessTokenFromString),
  Security.mapEffect((accessToken) =>
    Accounts.findUserByAccessToken(accessToken).pipe(
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
