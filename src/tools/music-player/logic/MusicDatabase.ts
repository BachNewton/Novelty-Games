import { createDatabase } from "../../../util/database/IndexedDbDatabase";
import { Database } from "../../../util/database/Database";
import { ExampleTables } from "../../../util/database/DatabaseSchemas";

export function createMusicDatabase(): Database<ExampleTables> {
    return createDatabase('example', []);
}
