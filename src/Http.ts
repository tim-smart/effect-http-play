import { RouterBuilder } from "effect-http"
import { NodeSwaggerFiles } from "effect-http-node"
import { api } from "./Api.js"
import { Accounts } from "./Accounts.js"
import { HttpMiddleware, HttpServer } from "@effect/platform"
import { Effect, Layer, pipe } from "effect"
import { NodeHttpServer } from "@effect/platform-node"
import { createServer } from "http"
import { policyUse, withSystemActor } from "./Domain/Policy.js"
import { AccountsPolicy } from "./Accounts/Policy.js"
import { Groups, withGroup } from "./Groups.js"
import { GroupsPolicy } from "./Groups/Policy.js"
import { People } from "./People.js"
import { PeoplePolicy } from "./People/Policy.js"

export const HttpLive = RouterBuilder.make(api).pipe(
  RouterBuilder.handle("createUser", ({ body }) =>
    withSystemActor(Accounts.createUser(body)),
  ),
  RouterBuilder.handle("updateUser", ({ body, path }, user) =>
    Accounts.updateUser(path.id, body).pipe(
      policyUse(user, AccountsPolicy.canUpdate(path.id)),
    ),
  ),
  RouterBuilder.handle("getUserMe", (_, user) =>
    Accounts.embellishUser(user).pipe(withSystemActor),
  ),
  RouterBuilder.handle("getUser", (_, user) =>
    Accounts.findUserById(_.path.id).pipe(
      Effect.flatten,
      policyUse(user, AccountsPolicy.canRead(_.path.id)),
    ),
  ),
  RouterBuilder.handle("createGroup", ({ body }, user) =>
    Groups.create(user.accountId, body).pipe(
      policyUse(user, GroupsPolicy.canCreate(body)),
    ),
  ),
  RouterBuilder.handle("updateGroup", ({ body, path }, user) =>
    withGroup(path.id, (group, groups) =>
      pipe(
        groups.update(group, body),
        policyUse(user, GroupsPolicy.canUpdate(group)),
      ),
    ),
  ),
  RouterBuilder.handle("createPerson", ({ body, path }, user) =>
    withGroup(path.groupId, (group) =>
      People.create(path.groupId, body).pipe(
        policyUse(user, PeoplePolicy.canCreate(group, body)),
      ),
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
  Layer.provide(Groups.Live),
  Layer.provide(GroupsPolicy.Live),
  Layer.provide(People.Live),
  Layer.provide(PeoplePolicy.Live),
)
