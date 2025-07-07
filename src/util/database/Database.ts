export interface Database<Tables> {
    add: <T extends keyof Tables>(
        tableName: T,
        data: Tables[T]
    ) => Promise<void>;

    get: <T extends keyof Tables>(
        tableName: T
    ) => Promise<Tables[T][]>;

    delete: () => Promise<void>;
}
