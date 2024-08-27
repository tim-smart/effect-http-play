import { ApiSecurity } from "@effect/platform"

export const security = ApiSecurity.apiKey({
  in: "cookie",
  key: "token",
})
