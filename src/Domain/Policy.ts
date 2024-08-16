import { Effect } from "effect"
import { CurrentUser, User, UserId } from "../Domain/User.js"
import { Schema } from "@effect/schema"
import { HttpServerRespondable, HttpServerResponse } from "@effect/platform"

export class Unauthorized extends Schema.TaggedError<Unauthorized>()(
  "Unauthorized",
  {
    actorId: UserId,
    entity: Schema.String,
    action: Schema.String,
  },
) {
  [HttpServerRespondable.symbol]() {
    return HttpServerResponse.empty({ status: 401 })
  }

  get message() {
    return `Actor (${this.actorId}) is not authorized to perform action ${`"${this.action}"`} on entity ${`"${this.entity}"`}`
  }
}

export const TypeId: unique symbol = Symbol.for("Domain/Policy/AuthorizedActor")
export type TypeId = typeof TypeId

export interface AuthorizedActor<Entity extends string, Action extends string> {
  readonly [TypeId]: {
    readonly _Entity: Entity
    readonly _Action: Action
  }
  readonly id: UserId
}

export const authorizedActor = (id: UserId): AuthorizedActor<any, any> => ({
  [TypeId]: {
    _Action: "",
    _Entity: "",
  },
  id,
})

export const systemActor: AuthorizedActor<any, any> = authorizedActor(
  UserId.make(0),
)

export const policy = <Entity extends string, Action extends string, E, R>(
  entity: Entity,
  action: Action,
  f: (actor: User) => Effect.Effect<boolean, E, R>,
): Effect.Effect<
  AuthorizedActor<Entity, Action>,
  E | Unauthorized,
  R | CurrentUser
> =>
  CurrentUser.pipe(
    Effect.flatMap((actor) =>
      f(actor).pipe(
        Effect.flatMap((can) =>
          can
            ? Effect.succeed(authorizedActor(actor.id))
            : Effect.fail(
                new Unauthorized({
                  actorId: actor.id,
                  entity,
                  action,
                }),
              ),
        ),
      ),
    ),
  )

export const policyUse =
  <Actor extends AuthorizedActor<any, any>, E, R>(
    policy: Effect.Effect<Actor, E, R>,
  ) =>
  <A, E2, R2>(
    effect: Effect.Effect<A, E2, R2>,
  ): Effect.Effect<A, E | E2, Exclude<R2, Actor> | R> =>
    policy.pipe(Effect.zipRight(effect)) as any

export const policyRequire =
  <Entity extends string, Action extends string>(
    _entity: Entity,
    _action: Action,
  ) =>
  <A, E, R>(
    effect: Effect.Effect<A, E, R>,
  ): Effect.Effect<A, E, R | AuthorizedActor<Entity, Action>> =>
    effect

export const withSystemActor = <A, E, R>(
  effect: Effect.Effect<A, E, R>,
): Effect.Effect<A, E, Exclude<R, AuthorizedActor<any, any>>> => effect as any
