import { Api } from "@effect/platform"
import { accountsApi } from "./Api/Accounts.js"
import { groupsApi } from "./Api/Groups.js"
import { peopleApi } from "./Api/People.js"

export const api = Api.empty.pipe(
  Api.addGroup(accountsApi),
  Api.addGroup(groupsApi),
  Api.addGroup(peopleApi),
)
