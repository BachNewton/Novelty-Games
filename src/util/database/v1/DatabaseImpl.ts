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

        addAll: (tableName, data) => indexedDB.addAll(tableName as string, data),

        getAll: (tableName) => indexedDB.getAll(tableName as string),

        deleteRow: (tableName, condition) => indexedDB.deleteRow(tableName as string, condition),

        delete: () => indexedDB.delete()
    };
}
