import { Schema } from "@effect/schema"

export const Email = Schema.String.pipe(
  Schema.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/),
  Schema.brand("Email"),
  Schema.annotations({ identifier: "Email" }),
)

export type Email = typeof Email.Type
