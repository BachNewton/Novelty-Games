import { EmergencyCard } from "../../mille-bornes/logic/Card";
import { Player, PlayerType, Team, Game } from "../../mille-bornes/logic/Data";

export const TESTIING_LOCAL_ID = 'TESTING_LOCAL_ID';

export function createTestingGame(): Game {
    const teamId = 'teamId';

    const player: Player = {
        name: 'Test Player',
        hand: [],
        teamId: teamId,
        localId: TESTIING_LOCAL_ID,
        type: PlayerType.HUMAN
    };

    const team: Team = {
        players: [player],
        tableau: {
            battleArea: [],
            speedArea: [],
            distanceArea: [],
            safetyArea: [new EmergencyCard()]
        },
        color: '',
        id: teamId,
        accumulatedScore: -1
    };

    const game: Game = {
        deck: [],
        discard: null,
        teams: [team],
        currentPlayer: player,
        extention: false
    };

    return game;
}
