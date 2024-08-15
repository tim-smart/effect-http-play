import { Schema } from "@effect/schema"
import { Model } from "@effect/sql"

export const AccountId = Schema.Number.pipe(Schema.brand("AccountId"))

export class Account extends Model.Class<Account>("Account")({
  id: Model.Generated(AccountId),
  createdAt: Model.DateTimeInsert,
  updatedAt: Model.DateTimeUpdate,
}) {}
