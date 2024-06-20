import { Card, Distance100Card, Distance200Card, Distance25Card, Distance50Card, Distance75Card, DistanceCard, GasCard, LimitCard, RepairCard, RollCard, SpareCard, StopCard, UnlimitedCard } from "./Card";
import { Game, Tableau } from "./Data";

export function playCard(card: Card, game: Game) {
    // Remove card from hand
    game.currentPlayer.hand = game.currentPlayer.hand.filter(handCard => handCard !== card);

    if (canCardBePlayed(card, game.currentPlayer.tableau)) {
        if (card instanceof RollCard) {
            game.currentPlayer.tableau.battleArea = card;
        } else if (isInstanceOfDistanceCard(card)) {
            game.currentPlayer.tableau.distanceArea.push(card as DistanceCard);
        } else if (card instanceof UnlimitedCard) {
            game.currentPlayer.tableau.speedArea = card;
        }
    } else {
        game.discard = card;
    }
}

function canCardBePlayed(card: Card, tableau: Tableau) {
    if (card instanceof RollCard) return canRollCardBePlayed(tableau);
    if (isInstanceOfDistanceCard(card)) return canDistanceCardBePlayed(card as DistanceCard, tableau);
    if (card instanceof UnlimitedCard) return canUnlimitedCardBePlayed(tableau);

    return false;
}

function isInstanceOfDistanceCard(card: Card): boolean {
    return card instanceof Distance25Card || card instanceof Distance50Card || card instanceof Distance75Card || card instanceof Distance100Card || card instanceof Distance200Card;
}

function canRollCardBePlayed(tableau: Tableau): boolean {
    const battleArea = tableau.battleArea;

    if (battleArea === null) return true;
    if (battleArea instanceof StopCard) return true;
    if (battleArea instanceof GasCard) return true;
    if (battleArea instanceof RepairCard) return true;
    if (battleArea instanceof SpareCard) return true;

    return false;
}

function canDistanceCardBePlayed(distanceCard: DistanceCard, tableau: Tableau): boolean {
    const battleArea = tableau.battleArea;
    const speedAreaLimit = tableau.speedArea === null ? 200 : tableau.speedArea.limit;

    if (battleArea instanceof RollCard && speedAreaLimit >= distanceCard.amount) return true;

    return false;
}

function canUnlimitedCardBePlayed(tableau: Tableau): boolean {
    if (tableau.speedArea instanceof LimitCard) return true;

    return false;
}