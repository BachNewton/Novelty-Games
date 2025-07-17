import { ExampleDatabase } from "../../../tools/database-debug/data/ExampleDatabase";
import { createTable } from "./Table";

export interface DatabaseManager {
    exampleDatabase: ExampleDatabase;
}

export function createDatabaseManager(): DatabaseManager {
    const databaseNames = {
        example: 'example-v2'
    };

    return {
        exampleDatabase: {
            people: createTable(databaseNames.example, 'people'),
            cars: createTable(databaseNames.example, 'cars'),
            computers: createTable(databaseNames.example, 'computers'),
            offices: createTable(databaseNames.example, 'offices')
        }
    };
}
