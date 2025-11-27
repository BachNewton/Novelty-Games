import { FreeMarketSave } from "../mobile-games/free-market/data/FreeMarketSave";
import { FreeMarketCommunicator } from "../mobile-games/free-market/logic/FreeMarketCommunicator";
import { Storer } from "../util/Storage";
import { Communicator as MilleBornesCommunicator } from '../board-games/mille-bornes/logic/Communicator';
import { LabyrinthCommunicator } from "../board-games/labyrinth/logic/LabyrinthCommunicator";

export interface State { }

export class HomeState implements State { }

export class TriviaState implements State { }

export class Game2DState implements State { }

export class Game3DState implements State { }

export class ToolsState implements State { }

export class MobileGamesState implements State { }

export class FreeMarketState extends MobileGamesState {
    communicator: FreeMarketCommunicator;
    storer: Storer<FreeMarketSave>;

    constructor(communicator: FreeMarketCommunicator, storer: Storer<FreeMarketSave>) {
        super();

        this.communicator = communicator;
        this.storer = storer;
    }
}

export class PetsState extends MobileGamesState { }

export class ToddlerTreasureHuntState extends MobileGamesState { }

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

export class MonopolyState extends BoardGamesState { }

export class PokerState extends BoardGamesState { }

export enum VersionState {
    CURRENT,
    UNKNOWN,
    OUTDATED,
    CHECKING
}
