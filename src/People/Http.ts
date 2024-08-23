import { ApiBuilder } from "@effect/platform"
import { Effect, Layer, pipe } from "effect"
import { Accounts } from "../Accounts.js"
import { api } from "../Api.js"
import { securityMiddleware } from "../Http/Security.js"
import { policyUse } from "../Domain/Policy.js"
import { Groups } from "../Groups.js"
import { People } from "../People.js"
import { PeoplePolicy } from "./Policy.js"

export const HttpPeopleLive = ApiBuilder.group(api, "people", (handlers) =>
  Effect.gen(function* () {
    const groups = yield* Groups
    const people = yield* People
    const policy = yield* PeoplePolicy

    return handlers.pipe(
      ApiBuilder.handle("create", ({ payload, path }) =>
        groups.with(path.groupId, (group) =>
          pipe(
            people.create(group.id, payload),
            policyUse(policy.canCreate(group, payload)),
          ),
        ),
      ),
      yield* securityMiddleware,
    )
  }),
).pipe(
  Layer.provide(Accounts.Live),
  Layer.provide(Groups.Live),
  Layer.provide(People.Live),
  Layer.provide(PeoplePolicy.Live),
)