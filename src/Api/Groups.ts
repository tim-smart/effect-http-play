import { Group, GroupIdFromString, GroupNotFound } from "../Domain/Group.js"
import { Schema } from "@effect/schema"
import { ApiEndpoint, ApiGroup } from "@effect/platform"
import { Unauthorized } from "../Domain/Policy.js"

export const groupsApi = ApiGroup.make("groups").pipe(
  ApiGroup.add(
    ApiEndpoint.post("create", "/").pipe(
      ApiEndpoint.success(Group.json),
      ApiEndpoint.payload(Group.jsonCreate),
    ),
  ),
  ApiGroup.add(
    ApiEndpoint.patch("update", "/:id").pipe(
      ApiEndpoint.path(Schema.Struct({ id: GroupIdFromString })),
      ApiEndpoint.success(Group.json),
      ApiEndpoint.payload(Group.jsonUpdate),
      ApiEndpoint.error(GroupNotFound),
    ),
  ),
  ApiGroup.addError(Unauthorized),
  ApiGroup.prefix("/groups"),
)
