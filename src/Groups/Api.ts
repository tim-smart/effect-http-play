import { Group, GroupIdFromString, GroupNotFound } from "../Domain/Group.js"
import {
  HttpApiEndpoint,
  HttpApiGroup,
  HttpApiSchema,
  OpenApi,
} from "@effect/platform"
import { Authentication } from "../Accounts/Api.js"

export class GroupsApi extends HttpApiGroup.make("groups")
  .add(
    HttpApiEndpoint.post("create", "/")
      .addSuccess(Group.json)
      .setPayload(Group.jsonCreate),
  )
  .add(
    HttpApiEndpoint.patch(
      "update",
    )`/${HttpApiSchema.param("id", GroupIdFromString)}`
      .addSuccess(Group.json)
      .setPayload(Group.jsonUpdate)
      .addError(GroupNotFound),
  )
  .middleware(Authentication)
  .prefix("/groups")
  .annotate(OpenApi.Title, "Groups")
  .annotate(OpenApi.Description, "Manage groups") {}
