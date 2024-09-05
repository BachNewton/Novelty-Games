import { removeRandomElement } from "../../util/Randomizer";
import { Card, LimitCard } from "./Card";
import { Game, PlayerType, Team } from "./Data";
import { canCardBePlayed, getCurrentPlayerTeam, isInstanceOfHazardCard, playCard } from "./Rules";

/** @returns true if the current player is local and is also a computer and the comupter hasn't already taken its turn */
export function shouldComputerPlayerTakeItsTurn(game: Game, localId: string, canComputerPlayerMove: boolean): boolean {
    return game.currentPlayer.localId === localId && game.currentPlayer.type === PlayerType.COMPUTER && canComputerPlayerMove
}

export function takeComputerPlayerTurn(game: Game, onRoundOver: (game: Game) => void) {
    const currentPlayer = game.currentPlayer;

    const computerHand = currentPlayer.hand;
    const currentPlayerTeam = getCurrentPlayerTeam(game);
    const otherTeams = game.teams.filter(team => team !== currentPlayerTeam);

    decideMove(
        computerHand,
        currentPlayerTeam,
        otherTeams,
        (card, targetTeam) => canCardBePlayed(card, game, targetTeam),
        (card, targetTeam) => playCard(card, game, targetTeam, onRoundOver)
    );
}

function decideMove(
    myHand: Array<Card>,
    myTeam: Team,
    otherTeams: Array<Team>,
    canCardBePlayed: (card: Card, targetTeam?: Team) => boolean,
    playCard: (card: Card, targetTeam: Team | null) => void
) {
    const playableCards = myHand.filter(card => canCardBePlayed(card));
    const unplayableCards = myHand.filter(card => !canCardBePlayed(card));

    console.log('playableCards:', playableCards);
    console.log('unplayableCards:', unplayableCards);

    if (playableCards.length > 0) {
        const selectedCard = removeRandomElement(playableCards);
        console.log('selectedCard:', selectedCard);

        if (isInstanceOfHazardCard(selectedCard) || selectedCard instanceof LimitCard) {
            const validTargetTeams = otherTeams.filter(otherTeam => canCardBePlayed(selectedCard, otherTeam));
            const targetTeam = removeRandomElement(validTargetTeams);
            console.log('targetTeam:', targetTeam);

            playCard(selectedCard, targetTeam);
        } else {
            playCard(selectedCard, myTeam);
        }
    } else {
        const selectedCard = removeRandomElement(unplayableCards);
        console.log('selectedCard:', selectedCard);
        playCard(selectedCard, myTeam);
    }
}
