import { ApiBuilder, HttpMiddleware, HttpServer } from "@effect/platform"
import { Layer } from "effect"
import { NodeHttpServer } from "@effect/platform-node"
import { createServer } from "http"
import { api } from "./Api.js"
import { HttpAccountsLive } from "./Accounts/Http.js"
import { HttpGroupsLive } from "./Groups/Http.js"
import { HttpPeopleLive } from "./People/Http.js"

export const HttpLive = ApiBuilder.serve(api, HttpMiddleware.logger).pipe(
  HttpServer.withLogAddress,
  Layer.provide(HttpAccountsLive),
  Layer.provide(HttpGroupsLive),
  Layer.provide(HttpPeopleLive),
  Layer.provide(NodeHttpServer.layer(createServer, { port: 3000 })),
)
