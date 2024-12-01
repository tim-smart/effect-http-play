import { GroupIdFromString, GroupNotFound } from "../Domain/Group.js"
import { Person, PersonIdFromString, PersonNotFound } from "../Domain/Person.js"
import {
  HttpApiEndpoint,
  HttpApiGroup,
  HttpApiSchema,
  OpenApi,
} from "@effect/platform"
import { Authentication } from "../Accounts/Api.js"

export class PeopleApi extends HttpApiGroup.make("people")
  .add(
    HttpApiEndpoint.get(
      "findById",
    )`/${HttpApiSchema.param("id", PersonIdFromString)}`
      .addSuccess(Person.json)
      .addError(PersonNotFound),
  )
  .prefix("/people")
  .add(
    HttpApiEndpoint.post(
      "create",
    )`/groups/${HttpApiSchema.param("groupId", GroupIdFromString)}/people`
      .addSuccess(Person.json)
      .setPayload(Person.jsonCreate)
      .addError(GroupNotFound),
  )
  .middleware(Authentication)
  .annotate(OpenApi.Title, "People")
  .annotate(OpenApi.Description, "Manage people") {}
