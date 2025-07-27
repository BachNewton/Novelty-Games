export interface PetSave {
    id: string;
    state: State;
    nextCycle: number | null;
    discovered: boolean;
    friendship: number;
}

export enum State {
    AWAKE, ASLEEP
}
