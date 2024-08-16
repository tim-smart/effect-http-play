import { Schema } from "@effect/schema"
import { Model } from "@effect/sql"
import { AccountId } from "./Account.js"
import { Email } from "./Email.js"
import { AccessToken } from "./AccessToken.js"
import { Context } from "effect"

export const UserId = Schema.Number.pipe(Schema.brand("UserId"))
export type UserId = typeof UserId.Type

export const UserIdFromString = Schema.NumberFromString.pipe(
  Schema.compose(UserId),
)

export class User extends Model.Class<User>("User")({
  id: Model.Generated(UserId),
  accountId: Model.GeneratedByApp(AccountId),
  apiKey: Model.Sensitive(AccessToken),
  email: Email,
  createdAt: Model.DateTimeInsert,
  updatedAt: Model.DateTimeUpdate,
}) {}

export class CurrentUser extends Context.Tag("Domain/User/CurrentUser")<
  CurrentUser,
  User
>() {}
