import { Effect, Layer } from "effect"
import { GroupsRepo } from "./Groups/Repo.js"
import { Group } from "./Domain/Group.js"
import { policyRequire } from "./Domain/Policy.js"

const make = Effect.gen(function* () {
  const repo = yield* GroupsRepo

  const create = (group: typeof Group.jsonCreate.Type) =>
    repo.insert(Group.insert.make(group)).pipe(policyRequire("Group", "create"))

  return { create } as const
})

export class Groups extends Effect.Tag("Groups")<
  Groups,
  Effect.Effect.Success<typeof make>
>() {
  static layer = Layer.effect(Groups, make)
  static Live = this.layer.pipe(Layer.provide(GroupsRepo.Live))
}
