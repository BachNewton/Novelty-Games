import { createIndexedDb } from "../IndexedDb";
import { Database } from "./Database";
import { DatabaseSchemas } from "./DatabaseSchemas";

export function createDatabase<Name extends keyof DatabaseSchemas>(
    databaseName: Name,
    tableNames: (keyof DatabaseSchemas[Name])[]
): Database<DatabaseSchemas[Name]> {
    const indexedDB = createIndexedDb(databaseName, tableNames as string[]);

    return {
        add: (tableName, data) => indexedDB.add(tableName as string, data),

        get: (tableName) => indexedDB.getAll(tableName as string),

        delete: () => indexedDB.delete()
    };
}
