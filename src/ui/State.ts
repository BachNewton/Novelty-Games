import { FreeMarketSave } from "../free-market/data/FreeMarketSave";
import { FreeMarketCommunicator } from "../free-market/logic/FreeMarketCommunicator";
import { Storer } from "../util/Storage";
import { Communicator as MilleBornesCommunicator } from '../board-games/mille-bornes/logic/Communicator';
import { LabyrinthCommunicator } from "../board-games/labyrinth/logic/LabyrinthCommunicator";

export interface State { }

export class HomeState implements State { }

export class TriviaState implements State { }

export class Game2DState implements State { }

export class Game3DState implements State { }

export class ToolsState implements State { }

export class FreeMarketState implements State {
    communicator: FreeMarketCommunicator;
    storer: Storer<FreeMarketSave>;

    constructor(communicator: FreeMarketCommunicator, storer: Storer<FreeMarketSave>) {
        this.communicator = communicator;
        this.storer = storer;
    }
}

export class BoardGamesState implements State { }

export class MilleBornesState extends BoardGamesState {
    communicator: MilleBornesCommunicator;

    constructor(communicator: MilleBornesCommunicator) {
        super();

        this.communicator = communicator;
    }
}

export class LabyrinthState extends BoardGamesState {
    communicator: LabyrinthCommunicator;

    constructor(communicator: LabyrinthCommunicator) {
        super();

        this.communicator = communicator;
    }
}

export enum VersionState {
    CURRENT,
    UNKNOWN,
    OUTDATED,
    CHECKING
}
