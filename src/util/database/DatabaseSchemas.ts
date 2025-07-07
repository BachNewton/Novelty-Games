export type ExampleTables = {
    words: { name: string; definition: string };
    numbers: { value: number; description: string };
}

export type DatabaseSchemas = {
    example: ExampleTables;
};
