import { NodeContext } from "@effect/platform-node"
import { SqliteClient, SqliteMigrator } from "@effect/sql-sqlite-node"
import { Config, Layer } from "effect"
import { fileURLToPath } from "url"

const ClientLive = SqliteClient.layer({
  filename: Config.succeed("data/db.sqlite"),
})

const MigratorLive = SqliteMigrator.layer({
  loader: SqliteMigrator.fromFileSystem(
    fileURLToPath(new URL("./migrations", import.meta.url)),
  ),
}).pipe(Layer.provide(NodeContext.layer))

export const SqlLive = MigratorLive.pipe(Layer.provideMerge(ClientLive))
