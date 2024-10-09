import { render, screen, fireEvent } from "@testing-library/react";
import Board from "../../mille-bornes/ui/Board";
import { TESTIING_LOCAL_ID, createTestingGame } from "./TestingUtil";
import { FakeCommunicator } from "./FakeCommunicator";
import { AceCard, Card, CrashCard, Distance100Card, RollCard, StopCard } from "../../mille-bornes/logic/Card";
import { Team } from "../../mille-bornes/logic/Data";

describe('Board UI', () => {
    it('should allow a player to play a crash card against another team', () => {
        const game = createTestingGame();
        game.teams[0].players[0].hand = [new CrashCard()];
        game.teams[1].tableau.battleArea = [new RollCard()];

        const boardUi = <Board
            startingGame={game}
            localId={TESTIING_LOCAL_ID}
            communicator={new FakeCommunicator()}
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

        const boardUi = <Board
            startingGame={game}
            localId={TESTIING_LOCAL_ID}
            communicator={new FakeCommunicator()}
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

    it('should show a hazard card in the discard pile if a coup-fourré is played to prevent it', () => {
        const game = createTestingGame();
        game.teams[0].players[0].hand = [new CrashCard()];
        game.teams[1].players[0].hand = [new AceCard()];
        game.teams[1].tableau.battleArea = [new RollCard()];

        const boardUi = <Board
            startingGame={game}
            localId={TESTIING_LOCAL_ID}
            communicator={new FakeCommunicator()}
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

        // Team 2 still has a RollCard in their tableau's battleArea
        expect(game.teams[1].tableau.battleArea.length).toBe(1);
        expect(game.teams[1].tableau.battleArea[0] instanceof RollCard).toBe(true);

        // Team 2 should have played an AceCard as a coup-fourré
        const playedAceCard = game.teams[1].tableau.safetyArea.find(safetyCard => safetyCard instanceof AceCard);
        expect(playedAceCard).not.toBeUndefined();
        expect(playedAceCard?.coupFourré).toBe(true);

        // The CrashCard should be in the discard pile
        expect(game.discard?.image).toBe('MB-crash.svg');
    });

    it('should give the correct info to the communicator when playing a distance card', () => {
        const game = createTestingGame();
        const distanceCard = new Distance100Card();
        game.teams[0].players[0].hand = [distanceCard];
        game.teams[0].tableau.battleArea = [new RollCard()];

        let communicatorCard: Card | null = null;
        let communicatorTargetTeam: Team | null = null;
        let communicatorIsExtentionCalled: boolean | undefined = undefined;

        const communicator = new FakeCommunicator((card, targetTeam, isExtentionCalled) => {
            communicatorCard = card;
            communicatorTargetTeam = targetTeam;
            communicatorIsExtentionCalled = isExtentionCalled;
        });

        const boardUi = <Board
            startingGame={game}
            localId={TESTIING_LOCAL_ID}
            communicator={communicator}
            onRoundOver={() => { }}
        />;

        render(boardUi);

        const imageElements = screen.getAllByRole<HTMLImageElement>('img');
        const distance100CardElement = imageElements.find(element => element.src === 'http://localhost/MB-100.svg')!;
        fireEvent.click(distance100CardElement); // Select the Distance100Card
        fireEvent.click(distance100CardElement); // Confirm the Distance100Card

        // The DistanceCard should be in the team's distanceArea
        expect(game.teams[0].tableau.distanceArea[0]).toBe(distanceCard);

        // Info given to the communicator should be correct
        expect(communicatorCard).toBe(distanceCard);
        expect(communicatorTargetTeam).toBe(game.teams[0]);
        expect(communicatorIsExtentionCalled).toBe(false);
    });
});
