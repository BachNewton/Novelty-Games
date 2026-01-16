import { render, screen, fireEvent } from "@testing-library/react";
import Board from "../../board-games/mille-bornes/ui/Board";
import { TESTIING_LOCAL_ID, createTestingGame, doubleClickImage } from "./TestingUtil";
import { FakeCommunicator } from "./FakeCommunicator";
import { AceCard, Card, CrashCard, Distance100Card, Distance50Card, RollCard, StopCard, UnlimitedCard } from "../../board-games/mille-bornes/logic/Card";
import { Game, Team } from "../../board-games/mille-bornes/logic/Data";

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

        doubleClickImage('http://localhost/MB-crash.svg');

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

        doubleClickImage('http://localhost/MB-crash.svg');

        // Double click the StopCard in the discard pile
        doubleClickImage('http://localhost/MB-stop.svg');

        // Player 1 has an empty hand after using the CrashCard
        expect(game.teams[0].players[0].hand.length).toBe(0);

        // Team 2 still has a RollCard in their tableau's battleArea
        expect(game.teams[1].tableau.battleArea.length).toBe(1);
        expect(game.teams[1].tableau.battleArea[0] instanceof RollCard).toBe(true);

        // The CrashCard should be in the discard pile
        expect(game.discard.image).toContain('MB-crash.svg');
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

        doubleClickImage('http://localhost/MB-crash.svg');

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
        expect(game.discard?.image).toContain('MB-crash.svg');
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

        doubleClickImage('http://localhost/MB-100.svg');

        // The DistanceCard should be in the team's distanceArea
        expect(game.teams[0].tableau.distanceArea[0]).toBe(distanceCard);

        // Info given to the communicator should be correct
        expect(communicatorCard).toBe(distanceCard);
        expect(communicatorTargetTeam).toBe(game.teams[0]);
        expect(communicatorIsExtentionCalled).toBe(false);
    });

    it('should allow the user to call a race extention', () => {
        const game = createTestingGame();
        const distanceCard = new Distance50Card();
        // Player should have at least 2 cards so the round doesn't end after the last card is played
        game.teams[0].players[0].hand = [distanceCard, new StopCard()];
        game.teams[0].tableau.battleArea = [new RollCard()];

        // Distance at 700
        game.teams[0].tableau.distanceArea = [new Distance100Card(), new Distance100Card(), new Distance100Card(), new Distance100Card(), new Distance100Card(), new Distance100Card(), new Distance100Card()];

        let communicatorCard: Card | null = null;
        let communicatorTargetTeam: Team | null = null;
        let communicatorIsExtentionCalled: boolean | undefined = undefined;

        const communicator = new FakeCommunicator((card, targetTeam, isExtentionCalled) => {
            communicatorCard = card;
            communicatorTargetTeam = targetTeam;
            communicatorIsExtentionCalled = isExtentionCalled;
        });

        let onRoundOverGame: Game | null = null;
        const onRoundOver = (game: Game) => onRoundOverGame = game;

        const boardUi = <Board
            startingGame={game}
            localId={TESTIING_LOCAL_ID}
            communicator={communicator}
            onRoundOver={onRoundOver}
        />;

        render(boardUi);

        // An additional distance of 50 should end the race
        doubleClickImage('http://localhost/MB-50.svg');

        const extentionDialogElement = screen.getByText('Would you like to to call an extention?');
        expect(extentionDialogElement).toBeVisible();

        // The communicator should not have received anything yet
        expect(communicatorCard).toBeNull();
        expect(communicatorTargetTeam).toBeNull();
        expect(communicatorIsExtentionCalled).toBeUndefined();

        const yesButton = screen.getByText('Yes');
        fireEvent.click(yesButton);

        // The communicator should have now received info
        expect(communicatorCard).toBe(distanceCard);
        expect(communicatorTargetTeam).toBe(game.teams[0]);
        expect(communicatorIsExtentionCalled).toBe(true);

        // Extention Dialog is gone now
        expect(extentionDialogElement).not.toBeVisible();

        const raceExtentionAnnouncement = screen.getByText(/A race extention has been called/);
        expect(raceExtentionAnnouncement).toBeVisible();

        // onRoundOver should not have been called
        expect(onRoundOverGame).toBeNull();
    });

    it('should allow the user to decline a race extention', () => {
        const game = createTestingGame();
        const distanceCard = new Distance50Card();
        // Player should have at least 2 cards so the round doesn't end after the last card is played
        game.teams[0].players[0].hand = [distanceCard, new StopCard()];
        game.teams[0].tableau.battleArea = [new RollCard()];

        // Distance at 700
        game.teams[0].tableau.distanceArea = [new Distance100Card(), new Distance100Card(), new Distance100Card(), new Distance100Card(), new Distance100Card(), new Distance100Card(), new Distance100Card()];

        let communicatorCard: Card | null = null;
        let communicatorTargetTeam: Team | null = null;
        let communicatorIsExtentionCalled: boolean | undefined = undefined;

        const communicator = new FakeCommunicator((card, targetTeam, isExtentionCalled) => {
            communicatorCard = card;
            communicatorTargetTeam = targetTeam;
            communicatorIsExtentionCalled = isExtentionCalled;
        });

        let onRoundOverGame: Game | null = null;
        const onRoundOver = (game: Game) => onRoundOverGame = game;

        const boardUi = <Board
            startingGame={game}
            localId={TESTIING_LOCAL_ID}
            communicator={communicator}
            onRoundOver={onRoundOver}
        />;

        render(boardUi);

        // An additional distance of 50 should end the race
        doubleClickImage('http://localhost/MB-50.svg');

        const extentionDialogElement = screen.getByText('Would you like to to call an extention?');
        expect(extentionDialogElement).toBeVisible();

        // The communicator should not have received anything yet
        expect(communicatorCard).toBeNull();
        expect(communicatorTargetTeam).toBeNull();
        expect(communicatorIsExtentionCalled).toBeUndefined();

        const noButton = screen.getByText('No');
        fireEvent.click(noButton);

        // The communicator should have now received info
        expect(communicatorCard).toBe(distanceCard);
        expect(communicatorTargetTeam).toBe(game.teams[0]);
        expect(communicatorIsExtentionCalled).toBe(false);

        // onRoundOver should have been called
        expect(onRoundOverGame).toBe(game);
    });
});
