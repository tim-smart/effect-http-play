import { Schema } from "@effect/schema"
import { ApiEndpoint, ApiGroup } from "effect-http"
import { User, UserIdFromString, UserWithSensitive } from "../Domain/User.js"
import { security } from "./Security.js"

export const accountsApiGroup = ApiGroup.make("Accounts").pipe(
  ApiGroup.addEndpoint(
    ApiEndpoint.post("createUser", "/users").pipe(
      ApiEndpoint.setResponseBody(UserWithSensitive.json),
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
      ApiEndpoint.setResponseBody(UserWithSensitive.json),
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
