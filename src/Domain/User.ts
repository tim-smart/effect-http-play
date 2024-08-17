import { Schema } from "@effect/schema"
import { Model } from "@effect/sql"
import { Account, AccountId } from "./Account.js"
import { Email } from "./Email.js"
import { Context } from "effect"
import { VariantSchema } from "@effect/experimental"
import { AccessToken } from "./AccessToken.js"

export const UserId = Schema.Number.pipe(Schema.brand("UserId"))
export type UserId = typeof UserId.Type

export const UserIdFromString = Schema.NumberFromString.pipe(
  Schema.compose(UserId),
)

export class User extends Model.Class<User>("User")({
  id: Model.Generated(UserId),
  accountId: Model.GeneratedByApp(AccountId),
  email: Email,
  accessToken: Model.Sensitive(AccessToken),
  createdAt: Model.DateTimeInsert,
  updatedAt: Model.DateTimeUpdate,
}) {}

export class UserWithSensitive extends Model.Class<UserWithSensitive>(
  "UserWithSensitive",
)({
  ...User[VariantSchema.TypeId],
  accessToken: AccessToken,
  account: Account,
}) {}

export class CurrentUser extends Context.Tag("Domain/User/CurrentUser")<
  CurrentUser,
  User
>() {}
