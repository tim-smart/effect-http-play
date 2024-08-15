import { Schema } from "@effect/schema"
import { Api, ApiEndpoint, ApiGroup } from "effect-http"

const groups = ApiGroup.make("Groups").pipe(
  ApiGroup.addEndpoint(
    ApiEndpoint.post("createGroup", "/groups").pipe(
      ApiEndpoint.setRequestBody(
        Schema.Struct({
          name: Schema.String,
        }),
      ),
    ),
  ),
)

Api.make().pipe(Api.addGroup(groups))
