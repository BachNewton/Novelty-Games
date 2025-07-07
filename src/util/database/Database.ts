export interface DatabaseAddRequest {
    openDatabase: Promise<void>;
    add: Promise<void>[];
    transactionComplete: Promise<void>;
}

export interface Database<Tables> {
    add: <T extends keyof Tables>(
        tableName: T,
        ...data: Tables[T][]
    ) => DatabaseAddRequest;

    get: <T extends keyof Tables>(
        tableName: T
    ) => Promise<Tables[T][]>;

    delete: () => Promise<void>;
}
