import { ApiEndpoint, ApiGroup } from "effect-http"
import { security } from "./Security.js"
import { GroupIdFromString } from "../Domain/Group.js"
import { Schema } from "@effect/schema"
import { Person } from "../Domain/Person.js"

export const peopleApiGroup = ApiGroup.make("People").pipe(
  ApiGroup.addEndpoint(
    ApiEndpoint.post("createPerson", "/groups/:groupId/people").pipe(
      ApiEndpoint.setRequestPath(Schema.Struct({ groupId: GroupIdFromString })),
      ApiEndpoint.setResponseBody(Person.json),
      ApiEndpoint.setRequestBody(Person.jsonCreate),
      ApiEndpoint.setSecurity(security),
    ),
  ),
)
