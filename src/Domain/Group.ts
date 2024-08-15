import { Schema } from "@effect/schema"
import { Model } from "@effect/sql"

export const GroupId = Schema.Number.pipe(Schema.brand("GroupId"))

export class Group extends Model.Class<Group>("Group")({
  id: Model.Generated(GroupId),
  name: Schema.NonEmptyTrimmedString,
  createdAt: Model.DateTimeInsertFromDate,
  updatedAt: Model.DateTimeUpdateFromDate,
}) {}

export class GroupJson extends Schema.Class<GroupJson>("GroupJson")(
  Group.json,
) {}
