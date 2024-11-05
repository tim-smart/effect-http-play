import { GroupIdFromString, GroupNotFound } from "../Domain/Group.js"
import { Person, PersonIdFromString, PersonNotFound } from "../Domain/Person.js"
import { HttpApiEndpoint, HttpApiGroup, OpenApi } from "@effect/platform"
import { Authentication } from "../Accounts/Api.js"
import { Schema } from "effect"

export class PeopleApi extends HttpApiGroup.make("people")
  .add(
    HttpApiEndpoint.get("findById", "/:id")
      .setPath(Schema.Struct({ id: PersonIdFromString }))
      .addSuccess(Person.json)
      .addError(PersonNotFound),
  )
  .prefix("/people")
  .add(
    HttpApiEndpoint.post("create", "/groups/:groupId/people")
      .setPath(Schema.Struct({ groupId: GroupIdFromString }))
      .addSuccess(Person.json)
      .setPayload(Person.jsonCreate)
      .addError(GroupNotFound),
  )
  .middleware(Authentication)
  .annotate(OpenApi.Title, "People")
  .annotate(OpenApi.Description, "Manage people") {}
