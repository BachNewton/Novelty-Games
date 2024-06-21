import { BattleCard, Card, DistanceCard, SafetyCard, SpeedCard } from "./Card";

export interface Game {
    deck: Array<Card>;
    discard: Card | null;
    teams: Array<Team>;
    currentPlayer: Player;
}

export interface Team {
    players: Array<Player>;
    tableau: Tableau;
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
    team: Team;
}
