import { GroupIdFromString, GroupNotFound } from "../Domain/Group.js"
import { Schema } from "@effect/schema"
import { Person } from "../Domain/Person.js"
import { Unauthorized } from "../Domain/Policy.js"
import { ApiEndpoint, ApiGroup } from "@effect/platform"

export const peopleApi = ApiGroup.make("people").pipe(
  ApiGroup.add(
    ApiEndpoint.post("create", "/groups/:groupId/people").pipe(
      ApiEndpoint.setPathSchema(Schema.Struct({ groupId: GroupIdFromString })),
      ApiEndpoint.setSuccess(Person.json),
      ApiEndpoint.setPayload(Person.jsonCreate),
      ApiEndpoint.setError(GroupNotFound),
    ),
  ),
  ApiGroup.addError(Unauthorized),
)
