import {
  ApiBuilder,
  ApiSwagger,
  HttpMiddleware,
  HttpServer,
} from "@effect/platform"
import { Layer } from "effect"
import { NodeHttpServer } from "@effect/platform-node"
import { createServer } from "http"
import { api } from "./Api.js"
import { HttpAccountsLive } from "./Accounts/Http.js"
import { HttpGroupsLive } from "./Groups/Http.js"
import { HttpPeopleLive } from "./People/Http.js"

const ApiLive = ApiBuilder.api(api).pipe(
  Layer.provide(HttpAccountsLive),
  Layer.provide(HttpGroupsLive),
  Layer.provide(HttpPeopleLive),
)

export const HttpLive = ApiBuilder.serve(HttpMiddleware.logger).pipe(
  Layer.provide(ApiSwagger.layer()),
  Layer.provide(ApiBuilder.middlewareCors()),
  Layer.provide(ApiLive),
  HttpServer.withLogAddress,
  Layer.provide(NodeHttpServer.layer(createServer, { port: 3000 })),
)
