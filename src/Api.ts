import { Api } from "effect-http"
import { accountsApiGroup } from "./Api/Accounts.js"
import { groupsApiGroup } from "./Api/Groups.js"

export const api = Api.make().pipe(
  Api.addGroup(accountsApiGroup),
  Api.addGroup(groupsApiGroup),
)
export type Api = typeof api
