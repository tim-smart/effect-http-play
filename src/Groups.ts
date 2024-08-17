import { Cause, Effect, Layer, pipe } from "effect"
import { GroupsRepo } from "./Groups/Repo.js"
import { AccountId } from "./Domain/Account.js"
import { Group, GroupId } from "./Domain/Group.js"
import { policyRequire } from "./Domain/Policy.js"

const make = Effect.gen(function* () {
  const repo = yield* GroupsRepo

  const create = (group: typeof Group.jsonCreate.Type, ownerId: AccountId) =>
    pipe(
      repo.insert(
        Group.insert.make({
          ...group,
          ownerId,
        }),
      ),
      Effect.withSpan("Groups.create", { attributes: { group } }),
      policyRequire("Group", "create"),
    )

  const update = (
    group: Group,
    update: Partial<typeof Group.jsonUpdate.Type>,
  ) =>
    pipe(
      repo.update(
        Group.update.make({
          ...group,
          ...update,
          updatedAt: undefined,
        }),
      ),
      Effect.withSpan("Groups.update", {
        attributes: { id: group.id, update },
      }),
      policyRequire("Group", "update"),
    )

  const findById = (id: GroupId) =>
    pipe(
      repo.findById(id),
      Effect.withSpan("Groups.findById", { attributes: { id } }),
      policyRequire("Group", "read"),
    )

  const with_ = <A, E, R>(
    id: GroupId,
    f: (group: Group) => Effect.Effect<A, E, R>,
  ): Effect.Effect<A, E | Cause.NoSuchElementException, R> =>
    pipe(
      repo.findById(id),
      Effect.flatten,
      Effect.flatMap(f),
      Effect.withSpan("Groups.with", { attributes: { id } }),
    )

  return { create, update, findById, with: with_ } as const
})

export class Groups extends Effect.Tag("Groups")<
  Groups,
  Effect.Effect.Success<typeof make>
>() {
  static layer = Layer.effect(Groups, make)
  static Live = this.layer.pipe(Layer.provide(GroupsRepo.Live))
}

export const withGroup = <A, E, R>(
  id: GroupId,
  f: (group: Group, groups: typeof Groups.Service) => Effect.Effect<A, E, R>,
) =>
  Groups.pipe(
    Effect.flatMap((groups) => groups.with(id, (group) => f(group, groups))),
  )
