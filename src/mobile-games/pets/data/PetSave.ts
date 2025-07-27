export interface PetSave {
    id: string;
    state: State;
    nextCycle: number | null;
    interactionsThisCycle: number;
    discovered: boolean;
    friendship: number;
}

export enum State {
    AWAKE, ASLEEP
}
