import {
  HttpApiEndpoint,
  HttpApiGroup,
  HttpApiMiddleware,
  HttpApiSchema,
  HttpApiSecurity,
  OpenApi,
} from "@effect/platform"
import {
  CurrentUser,
  User,
  UserIdFromString,
  UserNotFound,
  UserWithSensitive,
} from "../Domain/User.js"
import { Schema } from "effect"
import { Unauthorized } from "../Domain/Policy.js"

export class Authentication extends HttpApiMiddleware.Tag<Authentication>()(
  "Accounts/Api/Authentication",
  {
    provides: CurrentUser,
    failure: Unauthorized,
    security: {
      cookie: HttpApiSecurity.apiKey({
        in: "cookie",
        key: "token",
      }),
    },
  },
) {}

export class AccountsApi extends HttpApiGroup.make("accounts")
  .add(
    HttpApiEndpoint.patch(
      "updateUser",
    )`/users/${HttpApiSchema.param("id", UserIdFromString)}`
      .addSuccess(User.json)
      .addError(UserNotFound)
      .setPayload(Schema.partialWith(User.jsonUpdate, { exact: true })),
  )
  .add(
    HttpApiEndpoint.get("getUserMe", "/users/me").addSuccess(
      UserWithSensitive.json,
    ),
  )
  .add(
    HttpApiEndpoint.get(
      "getUser",
    )`/users/${HttpApiSchema.param("id", UserIdFromString)}`
      .addSuccess(User.json)
      .addError(UserNotFound),
  )
  .middlewareEndpoints(Authentication)
  // unauthenticated
  .add(
    HttpApiEndpoint.post("createUser", "/users")
      .addSuccess(UserWithSensitive.json)
      .setPayload(User.jsonCreate),
  )
  .annotate(OpenApi.Title, "Accounts")
  .annotate(OpenApi.Description, "Manage user accounts") {}
