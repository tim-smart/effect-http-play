import { GroupIdFromString, GroupNotFound } from "../Domain/Group.js"
import { Schema } from "@effect/schema"
import { Person } from "../Domain/Person.js"
import { Unauthorized } from "../Domain/Policy.js"
import { ApiEndpoint, ApiGroup } from "@effect/platform"

export const peopleApi = ApiGroup.make("people").pipe(
  ApiGroup.prefix("/people"),
  ApiGroup.add(
    ApiEndpoint.post("create", "/groups/:groupId/people").pipe(
      ApiEndpoint.path(Schema.Struct({ groupId: GroupIdFromString })),
      ApiEndpoint.success(Person.json),
      ApiEndpoint.payload(Person.jsonCreate),
      ApiEndpoint.error(GroupNotFound),
    ),
  ),
  ApiGroup.addError(Unauthorized),
)
