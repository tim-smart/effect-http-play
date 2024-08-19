import { Api } from "effect-http"
import { accountsApiGroup } from "./Api/Accounts.js"
import { groupsApiGroup } from "./Api/Groups.js"
import { peopleApiGroup } from "./Api/People.js"

export const api = Api.make().pipe(
  Api.addGroup(accountsApiGroup),
  Api.addGroup(groupsApiGroup),
  Api.addGroup(peopleApiGroup),
)
export type Api = typeof api
