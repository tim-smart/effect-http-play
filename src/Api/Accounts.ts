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
      ApiEndpoint.success(UserWithSensitive.json),
      ApiEndpoint.payload(User.jsonCreate),
    ),
  ),
  ApiGroup.add(
    ApiEndpoint.patch("updateUser", "/users/:id").pipe(
      ApiEndpoint.path(Schema.Struct({ id: UserIdFromString })),
      ApiEndpoint.success(User.json),
      ApiEndpoint.error(UserNotFound),
      ApiEndpoint.payload(Schema.partialWith(User.jsonUpdate, { exact: true })),
    ),
  ),
  ApiGroup.add(
    ApiEndpoint.get("getUserMe", "/users/me").pipe(
      ApiEndpoint.success(UserWithSensitive.json),
    ),
  ),
  ApiGroup.add(
    ApiEndpoint.get("getUser", "/users/:id").pipe(
      ApiEndpoint.path(Schema.Struct({ id: UserIdFromString })),
      ApiEndpoint.success(User.json),
      ApiEndpoint.error(UserNotFound),
    ),
  ),
  ApiGroup.addError(Unauthorized),
)
