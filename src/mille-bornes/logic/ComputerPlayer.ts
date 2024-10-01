import { Communicator } from "./Communicator";
import { Game, PlayerType, Team } from "./Data";
import { canCardBePlayed, getCurrentPlayerTeam, playCard } from "./Rules";
import { DumbBot } from "./bots/DumbBot";

/** @returns true if the current player is local and is also a computer and the comupter hasn't already taken its turn */
export function shouldComputerPlayerTakeItsTurn(game: Game, localId: string, canComputerPlayerMove: boolean): boolean {
    return game.currentPlayer.localId === localId && game.currentPlayer.type === PlayerType.COMPUTER && canComputerPlayerMove
}

export function takeComputerPlayerTurn(
    game: Game,
    onRoundOver: (game: Game) => void,
    communicator: Communicator,
    checkIfTargetDistanceReached: (targetTeam: Team, shouldCallExtention: () => boolean) => void
) {
    const currentPlayer = game.currentPlayer;

    const computerHand = currentPlayer.hand;
    const currentPlayerTeam = getCurrentPlayerTeam(game);
    const otherTeams = game.teams.filter(team => team !== currentPlayerTeam);
    const callExtention = false; // The computer will never call an extention

    DumbBot.decideMove(
        computerHand,
        currentPlayerTeam,
        otherTeams,
        (card, targetTeam) => canCardBePlayed(card, game, targetTeam),
        (card, targetTeam) => {
            playCard(card, game, targetTeam, onRoundOver);
            checkIfTargetDistanceReached(currentPlayerTeam, () => callExtention);
            communicator.playCard(card, targetTeam, callExtention);
        }
    );
}
