import { screen, fireEvent } from "@testing-library/react";
import { Player, PlayerType, Team, Game } from "../../board-games/mille-bornes/logic/Data";

export const TESTIING_LOCAL_ID = 'TESTING_LOCAL_ID';

export function createTestingGame(): Game {
    const teamId1 = 'teamId1';
    const teamId2 = 'teamId2';

    const player1: Player = {
        name: 'Test Player 1',
        hand: [],
        teamId: teamId1,
        localId: TESTIING_LOCAL_ID,
        type: PlayerType.HUMAN,
        botType: null
    };

    const player2: Player = {
        name: 'Test Player 2',
        hand: [],
        teamId: teamId2,
        localId: TESTIING_LOCAL_ID,
        type: PlayerType.HUMAN,
        botType: null
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
        accumulatedScore: 0
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
        accumulatedScore: 0
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

export function doubleClickImage(imageSrc: string) {
    const imageElements = screen.getAllByRole<HTMLImageElement>('img');
    // Extract just the filename from the expected src
    const expectedFilename = imageSrc.split('/').pop()!;
    const imageElement = imageElements.find(element => element.src.includes(expectedFilename))!;
    fireEvent.click(imageElement);
    fireEvent.click(imageElement);
}
