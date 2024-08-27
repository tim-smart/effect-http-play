import { HttpApi, OpenApi } from "@effect/platform"
import { accountsApi } from "./Api/Accounts.js"
import { groupsApi } from "./Api/Groups.js"
import { peopleApi } from "./Api/People.js"

export const api = HttpApi.empty.pipe(
  HttpApi.addGroup(accountsApi),
  HttpApi.addGroup(groupsApi),
  HttpApi.addGroup(peopleApi),
  OpenApi.annotate({ title: "Groups API" }),
)
