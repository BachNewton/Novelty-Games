import { Player, PlayerType, Team, Game } from "../../mille-bornes/logic/Data";

export const TESTIING_LOCAL_ID = 'TESTING_LOCAL_ID';

export function createTestingGame(): Game {
    const teamId1 = 'teamId1';
    const teamId2 = 'teamId2';

    const player1: Player = {
        name: 'Test Player 1',
        hand: [],
        teamId: teamId1,
        localId: TESTIING_LOCAL_ID,
        type: PlayerType.HUMAN
    };

    const player2: Player = {
        name: 'Test Player 2',
        hand: [],
        teamId: teamId2,
        localId: TESTIING_LOCAL_ID,
        type: PlayerType.HUMAN
    };

    const team1: Team = {
        players: [player1],
        tableau: {
            battleArea: [],
            speedArea: [],
            distanceArea: [],
            safetyArea: []
        },
        color: 'blue',
        id: teamId1,
        accumulatedScore: -1
    };

    const team2: Team = {
        players: [player2],
        tableau: {
            battleArea: [],
            speedArea: [],
            distanceArea: [],
            safetyArea: []
        },
        color: 'red',
        id: teamId2,
        accumulatedScore: -1
    };

    const game: Game = {
        deck: [],
        discard: null,
        teams: [team1, team2],
        currentPlayer: player1,
        extention: false
    };

    return game;
}