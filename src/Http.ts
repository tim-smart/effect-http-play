import { RouterBuilder } from "effect-http"
import { NodeSwaggerFiles } from "effect-http-node"
import { api } from "./Api.js"
import { Accounts } from "./Accounts.js"
import { HttpMiddleware, HttpServer } from "@effect/platform"
import { Effect, Layer } from "effect"
import { NodeHttpServer } from "@effect/platform-node"
import { createServer } from "http"
import { policyUse, withSystemActor } from "./Domain/Policy.js"
import { AccountsPolicy } from "./Accounts/Policy.js"
import { CurrentUser } from "./Domain/User.js"

export const HttpLive = RouterBuilder.make(api).pipe(
  RouterBuilder.handle("createUser", ({ body }) =>
    withSystemActor(Accounts.createUser(body)),
  ),
  RouterBuilder.handle("updateUser", ({ body, path }, user) =>
    Accounts.updateUser(path.id, body).pipe(
      policyUse(AccountsPolicy.canUpdate(path.id)),
      Effect.provideService(CurrentUser, user),
    ),
  ),
  RouterBuilder.handle("getUserMe", (_, user) => Effect.succeed(user)),
  RouterBuilder.handle("getUser", (_, actor) =>
    Accounts.findUserById(_.path.id).pipe(
      Effect.flatten,
      policyUse(AccountsPolicy.canRead(_.path.id)),
      Effect.provideService(CurrentUser, actor),
    ),
  ),
  RouterBuilder.build,
  HttpMiddleware.cors(),
  HttpServer.serve(HttpMiddleware.logger),
  HttpServer.withLogAddress,
  Layer.provide(NodeSwaggerFiles.SwaggerFilesLive),
  Layer.provide(NodeHttpServer.layer(createServer, { port: 3000 })),
  Layer.provide(Accounts.Live),
  Layer.provide(AccountsPolicy.Live),
)
