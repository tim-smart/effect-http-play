import { ApiEndpoint, ApiGroup, Security } from "effect-http"
import { User, UserId, UserIdFromString } from "../Domain/User.js"
import { Effect, Option, Redacted } from "effect"
import { Accounts } from "../Accounts.js"
import { AccessToken } from "../Domain/AccessToken.js"
import { Schema } from "@effect/schema"
import { Unauthorized, withSystemActor } from "../Domain/Policy.js"

const security = Security.bearer().pipe(
  Security.map((token) => AccessToken.make(Redacted.make(token))),
  Security.mapEffect((apiKey) =>
    Accounts.findUserByApiKey(apiKey).pipe(
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

export const accountsApiGroup = ApiGroup.make("Accounts").pipe(
  ApiGroup.addEndpoint(
    ApiEndpoint.post("createUser", "/users").pipe(
      ApiEndpoint.setResponseBody(User.json),
      ApiEndpoint.setRequestBody(User.jsonCreate),
    ),
  ),
  ApiGroup.addEndpoint(
    ApiEndpoint.patch("updateUser", "/users/:id").pipe(
      ApiEndpoint.setRequestPath(Schema.Struct({ id: UserIdFromString })),
      ApiEndpoint.setResponseBody(User.json),
      ApiEndpoint.setRequestBody(
        Schema.partialWith(User.jsonUpdate, { exact: true }),
      ),
      ApiEndpoint.setSecurity(security),
    ),
  ),
  ApiGroup.addEndpoint(
    ApiEndpoint.get("getUserMe", "/users/me").pipe(
      ApiEndpoint.setResponseBody(User.json),
      ApiEndpoint.setSecurity(security),
    ),
  ),
  ApiGroup.addEndpoint(
    ApiEndpoint.get("getUser", "/users/:id").pipe(
      ApiEndpoint.setRequestPath(Schema.Struct({ id: UserIdFromString })),
      ApiEndpoint.setResponseBody(User.json),
      ApiEndpoint.setSecurity(security),
    ),
  ),
)
