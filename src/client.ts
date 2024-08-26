import { ApiClient } from "@effect/platform"
import { NodeHttpClient, NodeRuntime } from "@effect/platform-node"
import { Effect } from "effect"
import { api } from "./Api.js"
import { Email } from "./Domain/Email.js"

Effect.gen(function* () {
  const client = yield* ApiClient.make(api, {
    baseUrl: "http://localhost:3000",
  })
  const user = yield* client.accounts.createUser({
    payload: {
      email: Email.make("joe@example.com"),
    },
  })
  console.log(user)
}).pipe(Effect.provide(NodeHttpClient.layerUndici), NodeRuntime.runMain)
