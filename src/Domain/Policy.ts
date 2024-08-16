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

export interface AuthorizedActor<Entity extends string, Action extends string>
  extends User {
  readonly [TypeId]: {
    readonly _Entity: Entity
    readonly _Action: Action
  }
  readonly id: UserId
}

export const authorizedActor = (user: User): AuthorizedActor<any, any> =>
  user as any

export const policy = <Entity extends string, Action extends string, E, R>(
  entity: Entity,
  action: Action,
  f: (actor: User) => Effect.Effect<boolean, E, R>,
): Effect.Effect<
  AuthorizedActor<Entity, Action>,
  E | Unauthorized,
  R | CurrentUser
> =>
  Effect.flatMap(CurrentUser, (actor) =>
    Effect.flatMap(f(actor), (can) =>
      can
        ? Effect.succeed(authorizedActor(actor))
        : Effect.fail(
            new Unauthorized({
              actorId: actor.id,
              entity,
              action,
            }),
          ),
    ),
  )

export const policyUse =
  <Actor extends AuthorizedActor<any, any>, E, R>(
    user: User,
    policy: Effect.Effect<Actor, E, R>,
  ) =>
  <A, E2, R2>(
    effect: Effect.Effect<A, E2, R2>,
  ): Effect.Effect<A, E | E2, Exclude<Exclude<R2, Actor> | R, CurrentUser>> =>
    policy.pipe(
      Effect.zipRight(effect),
      Effect.provideService(CurrentUser, user),
    ) as any

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
