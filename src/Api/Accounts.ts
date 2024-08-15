import { ApiEndpoint, ApiGroup } from "effect-http"
import { User } from "../Domain/User.js"

export const accountsApiGroup = ApiGroup.make("Accounts").pipe(
  ApiGroup.addEndpoint(
    ApiEndpoint.post("createUser", "/users").pipe(
      ApiEndpoint.setRequestBody(User.jsonCreate),
      ApiEndpoint.setResponseBody(User.json),
    ),
  ),
)
