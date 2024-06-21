import { BattleCard, Card, CrashCard, Distance100Card, Distance200Card, Distance25Card, Distance50Card, Distance75Card, DistanceCard, EmptyCard, FlatCard, GasCard, HazardCard, LimitCard, RemedyCard, RepairCard, RollCard, SpareCard, StopCard, UnlimitedCard } from "./Card";
import { Game, Player, Tableau, Team } from "./Data";

function getNextPlayer(game: Game): Player {
    const playerOrder = getPlayerOrder(game.teams);
    const nextPlayerIndex = (playerOrder.indexOf(game.currentPlayer) + 1) % playerOrder.length;
    return playerOrder[nextPlayerIndex];
}

function getPlayerOrder(teams: Array<Team>): Array<Player> {
    const teamWithMostPlayers = Math.max(...teams.map(team => team.players.length));

    const playerOrder: Array<Player> = [];

    for (let playerIndex = 0; playerIndex < teamWithMostPlayers; playerIndex++) {
        for (let teamIndex = 0; teamIndex < teams.length; teamIndex++) {
            const player = teams[teamIndex].players[playerIndex];

            if (player !== undefined) {
                playerOrder.push(player);
            }
        }
    }

    return playerOrder;
}

export function playCard(card: Card, game: Game, targetTeam: Team) {
    // Remove card from hand
    game.currentPlayer.hand = game.currentPlayer.hand.filter(handCard => handCard !== card);

    if (canCardBePlayed(card, game, targetTeam)) {
        if (isInstanceOfDistanceCard(card)) {
            targetTeam.tableau.distanceArea.push(card as DistanceCard);
        } else if (card instanceof UnlimitedCard) {
            targetTeam.tableau.speedArea = card;
        } else if (isInstanceOfHazardCard(card) || isInstanceOfRemedyCard(card)) {
            targetTeam.tableau.battleArea = card;
        }
    } else {
        game.discard = card;
    }

    game.currentPlayer = getNextPlayer(game);
    // Draw a card
    game.currentPlayer.hand.push(game.deck.splice(0, 1)[0]);
}

export function canCardBePlayed(card: Card, game: Game, targetTeam?: Team) {
    const tableau = game.currentPlayer.team.tableau;

    if (isInstanceOfRemedyCard(card)) return canRemedyCardBePlayed(card, tableau.battleArea);
    if (isInstanceOfDistanceCard(card)) return canDistanceCardBePlayed(card as DistanceCard, tableau);
    if (card instanceof UnlimitedCard) return canUnlimitedCardBePlayed(tableau);
    if (isInstanceOfHazardCard(card)) {
        const targetTeams = targetTeam === undefined
            ? game.teams.filter(team => team !== game.currentPlayer.team)
            : [targetTeam];
        return canHazardCardBePlayed(card, targetTeams);
    }

    return false;
}

function isInstanceOfDistanceCard(card: Card): boolean {
    return card instanceof Distance25Card || card instanceof Distance50Card || card instanceof Distance75Card || card instanceof Distance100Card || card instanceof Distance200Card;
}

export function isInstanceOfHazardCard(card: Card): boolean {
    return card instanceof CrashCard || card instanceof EmptyCard || card instanceof FlatCard || card instanceof StopCard;
}

function isInstanceOfRemedyCard(card: Card): boolean {
    return card instanceof RepairCard || card instanceof GasCard || card instanceof SpareCard || card instanceof RollCard;
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

function canHazardCardBePlayed(hazardCard: HazardCard, teams: Array<Team>): boolean {
    for (const team of teams) {
        if (team.tableau.battleArea instanceof RollCard) return true;
    }

    return false;
}

function canRemedyCardBePlayed(remedyCard: RemedyCard, battleArea: BattleCard | null): boolean {
    if (remedyCard instanceof RollCard) return canRollCardBePlayed(battleArea);
    if (remedyCard instanceof GasCard && battleArea instanceof EmptyCard) return true;
    if (remedyCard instanceof RepairCard && battleArea instanceof CrashCard) return true;
    if (remedyCard instanceof SpareCard && battleArea instanceof EmptyCard) return true;

    return false;
}

function canRollCardBePlayed(battleArea: BattleCard | null): boolean {
    if (battleArea === null) return true;
    if (battleArea instanceof StopCard) return true;
    if (battleArea instanceof GasCard) return true;
    if (battleArea instanceof RepairCard) return true;
    if (battleArea instanceof SpareCard) return true;

    return false;
}
