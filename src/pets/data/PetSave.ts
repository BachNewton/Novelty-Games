export interface PetSave {
    id: string;
    state: State;
    nextCycle: number;
    discovered: boolean;
}

export enum State {
    AWAKE, SLEEPING
}
