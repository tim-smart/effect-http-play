import { Context, Effect, Layer, Redacted } from "effect"
import * as Api from "uuid"

const make = Effect.gen(function* () {
  const generate = Effect.sync(() => Api.v7())
  const generateRedacted = generate.pipe(Effect.map(Redacted.make))

  return { generate, generateRedacted } as const
})

export class Uuid extends Context.Tag("Uuid")<
  Uuid,
  Effect.Effect.Success<typeof make>
>() {
  static Live = Layer.effect(Uuid, make)
}
