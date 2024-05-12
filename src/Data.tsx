export interface Rollercoaster {
    name: string;
    make: string;
    model: string;
    status: Status;
    park: Park;
    country: string;
}

interface Status {
    state: string
}

interface Park {
    name: string;
}

export interface Question {
    text: string;
    options: Array<string>;
    correctIndex: number;
}
