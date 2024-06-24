import { BattleCard, Card, DistanceCard, SafetyCard, SpeedCard, createCard } from "./Card";

export interface Game {
    deck: Array<Card>;
    discard: Card | null;
    teams: Array<Team>;
    currentPlayer: Player;
    extention: boolean;
}

export interface Team {
    players: Array<Player>;
    tableau: Tableau;
    color: string;
    id: string;
}

export function createTeam(team: Team): Team {
    team.players = team.players.map(player => {
        player.hand = player.hand.map(card => createCard(card.image));

        return player;
    });

    return team;
}

export interface Tableau {
    battleArea: Array<BattleCard>;
    speedArea: Array<SpeedCard>;
    distanceArea: Array<DistanceCard>;
    safetyArea: Array<SafetyCard>;
}

export interface Player {
    name: string;
    hand: Array<Card>;
    teamId: string;
    localId: string;
}
