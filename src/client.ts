import { ApiClient } from "@effect/platform"
import { Effect } from "effect"
import { api } from "./Api.js"
import { Email } from "./Domain/Email.js"
import { NodeHttpClient, NodeRuntime } from "@effect/platform-node"

Effect.gen(function* () {
  const client = yield* ApiClient.make(api, {
    baseUrl: "http://localhost:3000",
  })
  const user = yield* client.accounts.createUser({
    payload: {
      email: Email.make("john@example.com"),
    },
  })
  console.log(user)
}).pipe(Effect.provide(NodeHttpClient.layerUndici), NodeRuntime.runMain)
