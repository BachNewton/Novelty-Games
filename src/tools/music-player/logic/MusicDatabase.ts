import { createDatabase, Database } from "../../../util/database/Database";
import { UserTables } from "../../../util/database/DatabaseSchemas";

export function createMusicDatabase(): Database<UserTables> {
    return createDatabase('users', ['profiles']);
}
