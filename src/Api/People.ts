import { GroupIdFromString, GroupNotFound } from "../Domain/Group.js"
import { Schema } from "@effect/schema"
import { Person } from "../Domain/Person.js"
import { Unauthorized } from "../Domain/Policy.js"
import { ApiEndpoint, ApiGroup, OpenApi } from "@effect/platform"
import { security } from "./Security.js"

export const peopleApi = ApiGroup.make("people").pipe(
  ApiGroup.prefix("/people"),
  ApiGroup.add(
    ApiEndpoint.post("create", "/groups/:groupId/people").pipe(
      ApiEndpoint.setPath(Schema.Struct({ groupId: GroupIdFromString })),
      ApiEndpoint.setSuccess(Person.json),
      ApiEndpoint.setPayload(Person.jsonCreate),
      ApiEndpoint.addError(GroupNotFound),
    ),
  ),
  ApiGroup.addError(Unauthorized),
  OpenApi.annotate({
    title: "People",
    description: "Manage people",
    security,
  }),
)
