import { ApiEndpoint, ApiGroup, Security } from "effect-http"
import { ApiKey, User } from "../Domain/User.js"
import { Effect, Redacted } from "effect"
import { Accounts } from "../Accounts.js"

const security = Security.bearer().pipe(
  Security.map((token) => ApiKey.make(Redacted.make(token))),
  Security.mapEffect((apiKey) =>
    Accounts.findUserByApiKey(apiKey).pipe(Effect.flatten),
  ),
)

export const accountsApiGroup = ApiGroup.make("Accounts").pipe(
  ApiGroup.addEndpoint(
    ApiEndpoint.post("createUser", "/users").pipe(
      ApiEndpoint.setRequestBody(User.jsonCreate),
      ApiEndpoint.setResponseBody(User.json),
    ),
  ),
  ApiGroup.addEndpoint(
    ApiEndpoint.get("getUserMe", "/users/me").pipe(
      ApiEndpoint.setResponseBody(User.json),
      ApiEndpoint.setSecurity(security),
    ),
  ),
)
