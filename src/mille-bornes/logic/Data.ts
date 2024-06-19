import { BattleCard, Card, DistanceCard, SafetyCard, SpeedCard } from "./Card";

export interface Game {
    deck: Array<Card>;
    hand: Array<Card>;
    tableau: Tableau;
}

export interface Tableau {
    battleArea: BattleCard | null;
    speedArea: SpeedCard | null;
    distanceArea: Array<DistanceCard>;
    safetyArea: Array<SafetyCard>;
}
