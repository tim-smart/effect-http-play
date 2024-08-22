import { Schema } from "@effect/schema"
import {
  User,
  UserIdFromString,
  UserNotFound,
  UserWithSensitive,
} from "../Domain/User.js"
import { ApiEndpoint, ApiGroup } from "@effect/platform"
import { Unauthorized } from "../Domain/Policy.js"

export const accountsApi = ApiGroup.make("accounts").pipe(
  ApiGroup.add(
    ApiEndpoint.post("createUser", "/users").pipe(
      ApiEndpoint.setSuccess(UserWithSensitive.json),
      ApiEndpoint.setPayload(User.jsonCreate),
    ),
  ),
  ApiGroup.add(
    ApiEndpoint.patch("updateUser", "/users/:id").pipe(
      ApiEndpoint.setPathSchema(Schema.Struct({ id: UserIdFromString })),
      ApiEndpoint.setSuccess(User.json),
      ApiEndpoint.setError(UserNotFound),
      ApiEndpoint.setPayload(
        Schema.partialWith(User.jsonUpdate, { exact: true }),
      ),
    ),
  ),
  ApiGroup.add(
    ApiEndpoint.get("getUserMe", "/users/me").pipe(
      ApiEndpoint.setSuccess(UserWithSensitive.json),
    ),
  ),
  ApiGroup.add(
    ApiEndpoint.get("getUser", "/users/:id").pipe(
      ApiEndpoint.setPathSchema(Schema.Struct({ id: UserIdFromString })),
      ApiEndpoint.setSuccess(User.json),
      ApiEndpoint.setError(UserNotFound),
    ),
  ),
  ApiGroup.addError(Unauthorized),
)
