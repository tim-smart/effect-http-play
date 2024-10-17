import { Effect } from "effect"
import { policy } from "../Domain/Policy.js"
import { Group } from "../Domain/Group.js"

export class GroupsPolicy extends Effect.Service<GroupsPolicy>()(
  "Groups/Policy",
  {
    effect: Effect.gen(function* () {
      const canCreate = (_group: typeof Group.jsonCreate.Type) =>
        policy("Group", "create", (_actor) => Effect.succeed(true))

      const canUpdate = (group: Group) =>
        policy("Group", "update", (actor) =>
          Effect.succeed(group.ownerId === actor.accountId),
        )

      return { canCreate, canUpdate } as const
    }),
  },
) {}
