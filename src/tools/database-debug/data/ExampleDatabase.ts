import { Table } from "../../../util/database/v2/Table";

interface Person {
    firstName: string;
    lastName: string;
}

interface Car {
    make: string;
    year: number;
}

interface Computer {
    brand: string;
    cpu: string;
}

interface Office {
    location: string;
    headcount: number;
}

export type ExampleDatabase = {
    people: Table<Person>;
    cars: Table<Car>;
    computers: Table<Computer>;
    offices: Table<Office>;
};
