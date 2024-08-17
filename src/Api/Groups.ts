import { ApiEndpoint, ApiGroup } from "effect-http"
import { security } from "./Security.js"
import { Group, GroupIdFromString } from "../Domain/Group.js"
import { Schema } from "@effect/schema"

export const groupsApiGroup = ApiGroup.make("Groups").pipe(
  ApiGroup.addEndpoint(
    ApiEndpoint.post("createGroup", "/groups").pipe(
      ApiEndpoint.setResponseBody(Group.json),
      ApiEndpoint.setRequestBody(Group.jsonCreate),
      ApiEndpoint.setSecurity(security),
    ),
  ),
  ApiGroup.addEndpoint(
    ApiEndpoint.patch("updateGroup", "/groups/:id").pipe(
      ApiEndpoint.setRequestPath(Schema.Struct({ id: GroupIdFromString })),
      ApiEndpoint.setResponseBody(Group.json),
      ApiEndpoint.setRequestBody(Group.jsonUpdate),
      ApiEndpoint.setSecurity(security),
    ),
  ),
)
