import { Group, GroupIdFromString, GroupNotFound } from "../Domain/Group.js"
import { Schema } from "@effect/schema"
import { ApiEndpoint, ApiGroup, OpenApi } from "@effect/platform"
import { Unauthorized } from "../Domain/Policy.js"
import { security } from "./Security.js"

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
  ApiGroup.prefix("/groups"),
  ApiGroup.addError(Unauthorized),
  OpenApi.annotate({
    title: "Groups",
    description: "Manage groups",
    security,
  }),
)
