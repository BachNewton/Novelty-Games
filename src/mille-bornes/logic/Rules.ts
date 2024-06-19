import { Card, Distance100Card, Distance200Card, Distance25Card, Distance50Card, Distance75Card, DistanceCard, GasCard, RepairCard, RollCard, SpareCard, StopCard } from "./Card";
import { Game, Tableau } from "./Data";

export function playCard(card: Card, game: Game) {
    // Remove card from hand
    game.hand = game.hand.filter(handCard => handCard !== card);

    if (canCardBePlayed(card, game.tableau)) {
        if (card instanceof RollCard) {
            game.tableau.battleArea = card;
        } else if (isInstanceOfDistanceCard(card)) {
            game.tableau.distanceArea.push(card as DistanceCard);
        }
    } else {
        game.discard = card;
    }
}

function canCardBePlayed(card: Card, tableau: Tableau) {
    if (card instanceof RollCard) return canRollCardBePlayed(tableau);
    if (isInstanceOfDistanceCard(card)) return canDistanceCardBePlayed(card as DistanceCard, tableau);

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

    if (battleArea instanceof RollCard) return true;
    if (tableau.speedArea && tableau.speedArea.limit >= distanceCard.amount) return true;

    return false;
}
