import { Schema } from "@effect/schema"
import { Model } from "@effect/sql"
import { AccountId } from "./Account.js"
import { Email } from "./Email.js"

export const UserId = Schema.Number.pipe(Schema.brand("UserId"))

export const ApiKey = Schema.Redacted(Schema.String).pipe(
  Schema.brand("ApiKey"),
)

export class User extends Model.Class<User>("User")({
  id: Model.Generated(UserId),
  accountId: Model.GeneratedByApp(AccountId),
  apiKey: Model.FieldNoJson(ApiKey),
  email: Email,
  createdAt: Model.DateTimeInsert,
  updatedAt: Model.DateTimeUpdate,
}) {}
