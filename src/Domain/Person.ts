import { Schema } from "@effect/schema"
import { Model } from "@effect/sql"
import { GroupId } from "./Group.js"

export const PersonId = Schema.Number.pipe(Schema.brand("PersonId"))

export class Person extends Model.Class<Person>("Person")({
  id: Model.Generated(PersonId),
  groupId: Model.FieldExcept("update", "jsonUpdate")(GroupId),
  firstName: Schema.NonEmptyTrimmedString,
  lastName: Schema.NonEmptyTrimmedString,
  dateOfBirth: Model.DateTimeFromDate.pipe(
    Schema.optionalWith({ as: "Option" }),
  ),
  createdAt: Model.DateTimeInsert,
  updatedAt: Model.DateTimeUpdate,
}) {}
