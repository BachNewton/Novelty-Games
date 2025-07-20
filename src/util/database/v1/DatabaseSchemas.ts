import { PetSave } from "../../../pets/data/PetSave";

export type ExampleTables = {
    words: { name: string; definition: string };
    numbers: { value: number; description: string };
};

export type PetsTables = {
    pets: PetSave;
};

export type DatabaseSchemas = {
    example: ExampleTables;
    pets: PetsTables;
};
