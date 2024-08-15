import { NodeRuntime } from "@effect/platform-node"
import { Layer, Logger } from "effect"
import { HttpLive } from "./Http.js"

HttpLive.pipe(Layer.provide(Logger.pretty), Layer.launch, NodeRuntime.runMain)
