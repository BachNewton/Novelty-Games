export interface Database<Tables> {
    add: <T extends keyof Tables>(
        tableName: T,
        data: Tables[T]
    ) => Promise<void>;

    getAll: <T extends keyof Tables>(
        tableName: T
    ) => Promise<Tables[T][]>;

    deleteRow: <T extends keyof Tables>(
        tableName: T,
        condition: (data: Tables[T]) => boolean
    ) => void;

    delete: () => Promise<void>;
}
