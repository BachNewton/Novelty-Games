import { Card, GasCard, RepairCard, RollCard, SpareCard, StopCard } from "./Card";
import { Tableau } from "./Data";

export function playCard(card: Card, tableau: Tableau) {
    if (card instanceof RollCard && canRollCardBePlayed(tableau)) {
        tableau.battleArea = card;
    }
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
