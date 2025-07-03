import { HttpApiScalar, HttpLayerRouter } from "@effect/platform"
import { Layer } from "effect"
import { NodeHttpServer } from "@effect/platform-node"
import { createServer } from "http"
import { Api } from "./Api.js"
import { HttpAccountsLive } from "./Accounts/Http.js"
import { HttpGroupsLive } from "./Groups/Http.js"
import { HttpPeopleLive } from "./People/Http.js"

const ApiRoutes = Layer.provide(
  HttpLayerRouter.addHttpApi(Api, {
    openapiPath: "/openapi.json",
  }),
  [HttpAccountsLive, HttpGroupsLive, HttpPeopleLive],
)

const DocsRoute = HttpApiScalar.layerHttpLayerRouter({
  api: Api,
  path: "/docs",
})

const AllRoutes = Layer.mergeAll(ApiRoutes, DocsRoute).pipe(
  Layer.provide(HttpLayerRouter.cors()),
)

export const HttpLive = HttpLayerRouter.serve(AllRoutes).pipe(
  Layer.provide(NodeHttpServer.layer(createServer, { port: 3000 })),
)
