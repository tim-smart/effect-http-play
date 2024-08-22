import { ApiBuilder } from "@effect/platform"
import { api } from "../Api.js"
import { Effect, Layer, pipe } from "effect"
import { policyUse } from "../Domain/Policy.js"
import { makeSecurity } from "../Api/Security.js"
import { Groups } from "../Groups.js"
import { PeoplePolicy } from "./Policy.js"
import { Accounts } from "../Accounts.js"
import { People } from "../People.js"

export const HttpPeopleLive = ApiBuilder.group(api, "people", (handlers) =>
  Effect.gen(function* () {
    const groups = yield* Groups
    const people = yield* People
    const policy = yield* PeoplePolicy
    const security = yield* makeSecurity

    return handlers.pipe(
      ApiBuilder.handle("create", ({ payload, path }) =>
        groups.with(path.groupId, (group) =>
          pipe(
            people.create(group.id, payload),
            policyUse(policy.canCreate(group, payload)),
          ),
        ),
      ),
      ApiBuilder.middleware(security),
    )
  }),
).pipe(
  Layer.provide(Accounts.Live),
  Layer.provide(Groups.Live),
  Layer.provide(People.Live),
  Layer.provide(PeoplePolicy.Live),
)
