import { Schema } from "@effect/schema"
import { Model } from "@effect/sql"

export const PersonId = Schema.Number.pipe(Schema.brand("PersonId"))

export class Person extends Model.Class<Person>("Person")({
  id: Model.Generated(PersonId),
  firstName: Schema.NonEmptyTrimmedString,
  lastName: Schema.NonEmptyTrimmedString,
  createdAt: Model.DateTimeInsertFromDate,
  updatedAt: Model.DateTimeUpdateFromDate,
}) {}

export class PersonJson extends Schema.Class<PersonJson>("PersonJson")(
  Person.json,
) {}
