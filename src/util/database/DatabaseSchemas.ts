import { PetSave } from "../../mobile-games/pets/data/PetSave";

export type ExampleTables = {
    words: { name: string; definition: string };
    numbers: { value: number; description: string };
};

export type PetsTables = {
    pets: PetSave;
    interations: { id: string }
};

export type FortniteFestivalTables = {
    owned: { superKey: string; };
};

export type DatabaseSchemas = {
    example: ExampleTables;
    pets: PetsTables;
    fortniteFestival: FortniteFestivalTables;
};

