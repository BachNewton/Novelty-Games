export type Square = Property | Other;

export interface Property {
    type: 'property';
    name: string;
    color: string;
    price: number;
}

export interface Other {
    type: 'other';
    name: string;
}
