import { DatabaseSync } from "node:sqlite";
import * as sqliteVec from "sqlite-vec";

const sqlite = new DatabaseSync("atlas.db",{
    allowExtension: true
});

sqlite.loadExtension(sqliteVec.getLoadablePath());

// Recommended settings
sqlite.exec(`
PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;
`);

export {sqlite};
