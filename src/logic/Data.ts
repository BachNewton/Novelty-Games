export interface Data { }

export interface Rollercoaster extends Data {
    name: string;
    make: string;
    model: string;
    status: Status;
    park: Park;
    country: string;
    mainPicture: MainPicture;
}

interface Status {
    state: string;
    date: Date;
}

interface Date {
    opened: string;
}

interface Park {
    name: string;
}

interface MainPicture {
    url: string;
}

export interface Song extends Data {
    Name: string;
}

export interface Question {
    text: string;
    options: Array<string>;
    correctIndex: number;
    imageUrl: string;
}

export enum DataType {
    ROLLERCOASTERS = 'ROLLERCOASTERS',
    MUSIC = 'MUSIC'
}
