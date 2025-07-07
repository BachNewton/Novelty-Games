export type ExampleTables = {
    words: { name: string; definition: string };
    numbers: { value: number; description: string };
}

export type UserTables = {
    profiles: { id: string; name: string };
};

export type DatabaseSchemas = {
    users: UserTables;
    example: ExampleTables;
};
