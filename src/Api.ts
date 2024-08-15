import { Api } from "effect-http"
import { accountsApiGroup } from "./Api/Accounts.js"

export const api = Api.make().pipe(Api.addGroup(accountsApiGroup))
export type Api = typeof api
