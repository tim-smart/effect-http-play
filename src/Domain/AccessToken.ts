import { Schema } from "@effect/schema"

export const AccessToken = Schema.Redacted(Schema.String).pipe(
  Schema.brand("AccessToken"),
)

export type AccessToken = typeof AccessToken.Type
