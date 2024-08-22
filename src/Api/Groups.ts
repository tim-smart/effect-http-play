import { Group, GroupIdFromString, GroupNotFound } from "../Domain/Group.js"
import { Schema } from "@effect/schema"
import { ApiEndpoint, ApiGroup } from "@effect/platform"
import { Unauthorized } from "../Domain/Policy.js"

export const groupsApi = ApiGroup.make("groups").pipe(
  ApiGroup.add(
    ApiEndpoint.post("create", "/").pipe(
      ApiEndpoint.setSuccess(Group.json),
      ApiEndpoint.setPayload(Group.jsonCreate),
    ),
  ),
  ApiGroup.add(
    ApiEndpoint.patch("update", "/:id").pipe(
      ApiEndpoint.setPathSchema(Schema.Struct({ id: GroupIdFromString })),
      ApiEndpoint.setSuccess(Group.json),
      ApiEndpoint.setPayload(Group.jsonUpdate),
      ApiEndpoint.setError(GroupNotFound),
    ),
  ),
  ApiGroup.addError(Unauthorized),
  ApiGroup.prefix("/groups"),
)
