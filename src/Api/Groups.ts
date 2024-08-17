import { ApiEndpoint, ApiGroup } from "effect-http"
import { security } from "./Security.js"
import { Group } from "../Domain/Group.js"

export const groupsApiGroup = ApiGroup.make("Groups").pipe(
  ApiGroup.addEndpoint(
    ApiEndpoint.post("createGroup", "/groups").pipe(
      ApiEndpoint.setResponseBody(Group.json),
      ApiEndpoint.setRequestBody(Group.jsonCreate),
      ApiEndpoint.setSecurity(security),
    ),
  ),
)
