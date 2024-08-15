import { RouterBuilder } from "effect-http"
import { NodeSwaggerFiles } from "effect-http-node"
import { api } from "./Api.js"
import { Accounts } from "./Accounts.js"
import { HttpMiddleware, HttpServer } from "@effect/platform"
import { Effect, Layer } from "effect"
import { NodeHttpServer } from "@effect/platform-node"
import { createServer } from "http"

export const HttpLive = RouterBuilder.make(api).pipe(
  RouterBuilder.handle("createUser", ({ body }) => Accounts.createUser(body)),
  RouterBuilder.handle("getUserMe", (_, user) => Effect.succeed(user)),
  RouterBuilder.build,
  HttpMiddleware.cors(),
  HttpServer.serve(HttpMiddleware.logger),
  HttpServer.withLogAddress,
  Layer.provide(NodeSwaggerFiles.SwaggerFilesLive),
  Layer.provide(NodeHttpServer.layer(createServer, { port: 3000 })),
  Layer.provide(Accounts.Live),
)
