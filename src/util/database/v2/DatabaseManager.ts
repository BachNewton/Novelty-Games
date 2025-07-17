import { ExampleDatabase } from "../../../tools/database-debug/data/ExampleDatabase";
import { createIndexedDb } from "../IndexedDb";
import { createTable } from "./Table";

export interface DatabaseManager {
    exampleDatabase: ExampleDatabase;
}

export function createDatabaseManager(): DatabaseManager {
    const exampleIndexedDb = createIndexedDb('example-v2', ['people', 'cars', 'computers', 'offices']);

    return {
        exampleDatabase: {
            delete: () => exampleIndexedDb.delete(),
            people: createTable(exampleIndexedDb, 'people'),
            cars: createTable(exampleIndexedDb, 'cars'),
            computers: createTable(exampleIndexedDb, 'computers'),
            offices: createTable(exampleIndexedDb, 'offices'),
        }
    };
}
