import { Group, GroupIdFromString, GroupNotFound } from "../Domain/Group.js"
import { Schema } from "@effect/schema"
import { ApiEndpoint, ApiGroup, OpenApi } from "@effect/platform"
import { Unauthorized } from "../Domain/Policy.js"
import { security } from "./Security.js"

export const groupsApi = ApiGroup.make("groups").pipe(
  ApiGroup.add(
    ApiEndpoint.post("create", "/").pipe(
      ApiEndpoint.setSuccess(Group.json),
      ApiEndpoint.setPayload(Group.jsonCreate),
    ),
  ),
  ApiGroup.add(
    ApiEndpoint.patch("update", "/:id").pipe(
      ApiEndpoint.setPath(Schema.Struct({ id: GroupIdFromString })),
      ApiEndpoint.setSuccess(Group.json),
      ApiEndpoint.setPayload(Group.jsonUpdate),
      ApiEndpoint.addError(GroupNotFound),
    ),
  ),
  ApiGroup.prefix("/groups"),
  ApiGroup.addError(Unauthorized),
  OpenApi.annotate({
    title: "Groups",
    description: "Manage groups",
    security,
  }),
)
