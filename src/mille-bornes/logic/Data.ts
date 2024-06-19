import { BattleCard, Card, DistanceCard, SafetyCard, SpeedCard } from "./Card";

export interface Game {
    deck: Array<Card>;
    discard: Card | null;
    players: Array<Player>;
    currentPlayer: Player;
}

export interface Tableau {
    battleArea: BattleCard | null;
    speedArea: SpeedCard | null;
    distanceArea: Array<DistanceCard>;
    safetyArea: Array<SafetyCard>;
}

export interface Player {
    name: string;
    hand: Array<Card>;
    tableau: Tableau;
    team: number;
}
