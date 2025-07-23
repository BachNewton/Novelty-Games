export interface PetSave {
    id: string;
    state: State;
    nextCycle: number | null;
    discovered: boolean;
}

export enum State {
    AWAKE, ASLEEP
}
