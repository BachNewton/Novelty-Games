export interface PetSave {
    id: string;
    state: State;
    nextCycle: number;
}

enum State {
    AWAKE, SLEEPING
}
