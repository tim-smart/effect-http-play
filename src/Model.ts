import * as Variant from "./Variant.js"
import * as Schema from "@effect/schema/Schema"
import * as DateTime from "effect/DateTime"
import { LazyArg } from "effect/Function"

export const { Class, Struct, Field } = Variant.factory({
  variants: ["select", "insert", "update", "json", "jsonCreate", "jsonUpdate"],
  defaultVariant: "select",
})

export interface PrimaryKey<S extends Schema.Schema.All>
  extends Variant.Field<{
    readonly select: S
    readonly update: S
    readonly json: S
  }> {}

export const PrimaryKey = <S extends Schema.Schema.All>(
  schema: S,
): PrimaryKey<S> =>
  Field({
    select: schema,
    update: schema,
    json: schema,
  })

export interface FieldNoInsert<S extends Schema.Schema.All>
  extends Variant.Field<{
    readonly select: S
    readonly update: S
    readonly json: S
    readonly jsonUpdate: S
  }> {}

export const FieldNoInsert = <S extends Schema.Schema.All>(
  schema: S,
): FieldNoInsert<S> =>
  Field({
    select: schema,
    update: schema,
    json: schema,
    jsonUpdate: schema,
  })

export interface FieldNoJson<S extends Schema.Schema.All>
  extends Variant.Field<{
    readonly select: S
    readonly insert: S
    readonly update: S
  }> {}

export const FieldNoJson = <S extends Schema.Schema.All>(
  schema: S,
): FieldNoJson<S> =>
  Field({
    select: schema,
    insert: schema,
    update: schema,
  })

export interface DateTimeFromDate
  extends Schema.transform<
    typeof Schema.ValidDateFromSelf,
    typeof Schema.DateTimeUtcFromSelf
  > {}

export const DateTimeFromDate: DateTimeFromDate = Schema.transform(
  Schema.ValidDateFromSelf,
  Schema.DateTimeUtcFromSelf,
  {
    decode: DateTime.unsafeFromDate,
    encode: DateTime.toDateUtc,
  },
)

const DateTimeWithNow = DateTimeFromDate.pipe(
  Schema.optionalWith({ default: DateTime.unsafeNow }),
)

export interface CreatedAt
  extends Variant.Field<{
    readonly select: DateTimeFromDate
    readonly insert: Schema.optionalWith<
      DateTimeFromDate,
      { default: LazyArg<DateTime.Utc> }
    >
    readonly json: typeof Schema.DateTimeUtc
  }> {}

export const CreatedAt: CreatedAt = Field({
  select: DateTimeFromDate,
  insert: DateTimeWithNow,
  json: Schema.DateTimeUtc,
})

export interface UpdatedAt
  extends Variant.Field<{
    readonly select: DateTimeFromDate
    readonly insert: Schema.optionalWith<
      DateTimeFromDate,
      { default: LazyArg<DateTime.Utc> }
    >
    readonly update: Schema.optionalWith<
      DateTimeFromDate,
      { default: LazyArg<DateTime.Utc> }
    >
    readonly json: typeof Schema.DateTimeUtc
  }> {}

export const UpdatedAt: UpdatedAt = Field({
  select: DateTimeFromDate,
  insert: DateTimeWithNow,
  update: DateTimeWithNow,
  json: Schema.DateTimeUtc,
})
