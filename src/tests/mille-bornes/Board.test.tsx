import { render, screen, fireEvent } from "@testing-library/react";
import Board from "../../mille-bornes/ui/Board";
import { TESTIING_LOCAL_ID, createTestingGame } from "./TestingUtil";
import { Communicator } from "../../mille-bornes/logic/Communicator";
import { FakeCommunicator } from "./FakeCommunicator";
import { CrashCard, RollCard, StopCard } from "../../mille-bornes/logic/Card";

describe('Board UI', () => {
    it('should allow a player to play a crash card against another team', () => {
        const game = createTestingGame();
        game.teams[0].players[0].hand = [new CrashCard()];
        game.teams[1].tableau.battleArea = [new RollCard()];

        const communicator: Communicator = new FakeCommunicator();

        const boardUi = <Board
            startingGame={game}
            localId={TESTIING_LOCAL_ID}
            communicator={communicator}
            onRoundOver={() => { }}
        />;

        render(boardUi);

        const imageElements = screen.getAllByRole<HTMLImageElement>('img');
        const crashCardElement = imageElements.find(element => element.src === 'http://localhost/MB-crash.svg')!;
        fireEvent.click(crashCardElement); // Select the CrashCard
        fireEvent.click(crashCardElement); // Confirm the CrashCard

        const otherTeamTableau = screen.getByText('Team Test Player 2');
        fireEvent.click(otherTeamTableau); // Select the team's tableau
        fireEvent.click(otherTeamTableau); // Confirm the team's tableau

        // Player 1 has an empty hand after using the CrashCard
        expect(game.teams[0].players[0].hand.length).toBe(0);

        // Team 2 has a CrashCard in their tableau's battleArea
        expect(game.teams[1].tableau.battleArea[1] instanceof CrashCard).toBe(true);
    });

    it('should allow a player to discard a crash card even if it is playable against another team', () => {
        const game = createTestingGame();
        game.teams[0].players[0].hand = [new CrashCard()];
        game.teams[1].tableau.battleArea = [new RollCard()];
        game.discard = new StopCard();

        const communicator: Communicator = new FakeCommunicator();

        const boardUi = <Board
            startingGame={game}
            localId={TESTIING_LOCAL_ID}
            communicator={communicator}
            onRoundOver={() => { }}
        />;

        render(boardUi);

        const imageElements = screen.getAllByRole<HTMLImageElement>('img');
        const crashCardElement = imageElements.find(element => element.src === 'http://localhost/MB-crash.svg')!;
        fireEvent.click(crashCardElement); // Select the CrashCard
        fireEvent.click(crashCardElement); // Confirm the CrashCard

        const stopCardElement = imageElements.find(element => element.src === 'http://localhost/MB-stop.svg')!;
        fireEvent.click(stopCardElement); // Select the StopCard in the discard pile
        fireEvent.click(stopCardElement); // Confirm the StopCard in the discard pile

        // Player 1 has an empty hand after using the CrashCard
        expect(game.teams[0].players[0].hand.length).toBe(0);

        // Team 2 still has a RollCard in their tableau's battleArea
        expect(game.teams[1].tableau.battleArea.length).toBe(1);
        expect(game.teams[1].tableau.battleArea[0] instanceof RollCard).toBe(true);

        // The CrashCard should be in the discard pile
        expect(game.discard.image).toBe('MB-crash.svg');
    });
});