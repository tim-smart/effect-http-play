import { Schema } from "@effect/schema"
import {
  User,
  UserIdFromString,
  UserNotFound,
  UserWithSensitive,
} from "../Domain/User.js"
import { ApiEndpoint, ApiGroup, OpenApi } from "@effect/platform"
import { Unauthorized } from "../Domain/Policy.js"
import { security } from "./Security.js"

export const accountsApi = ApiGroup.make("accounts").pipe(
  ApiGroup.add(
    ApiEndpoint.patch("updateUser", "/users/:id").pipe(
      ApiEndpoint.setPath(Schema.Struct({ id: UserIdFromString })),
      ApiEndpoint.setSuccess(User.json),
      ApiEndpoint.addError(UserNotFound),
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
      ApiEndpoint.setPath(Schema.Struct({ id: UserIdFromString })),
      ApiEndpoint.setSuccess(User.json),
      ApiEndpoint.addError(UserNotFound),
    ),
  ),
  ApiGroup.annotateEndpoints(OpenApi.Security, security),
  ApiGroup.addError(Unauthorized),
  // unauthenticated
  ApiGroup.add(
    ApiEndpoint.post("createUser", "/users").pipe(
      ApiEndpoint.setSuccess(UserWithSensitive.json),
      ApiEndpoint.setPayload(User.jsonCreate),
    ),
  ),
  OpenApi.annotate({
    title: "Accounts",
    description: "Manage user accounts",
  }),
)
