import { AceCard, BattleCard, Card, CrashCard, Distance100Card, Distance200Card, Distance25Card, Distance50Card, Distance75Card, DistanceCard, EmergencyCard, EmptyCard, FlatCard, GasCard, HazardCard, LimitCard, RemedyCard, RepairCard, RollCard, SafetyCard, SealantCard, SpareCard, SpeedCard, StopCard, TankerCard, UnlimitedCard } from "./Card";
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

export function playCard(card: Card, game: Game, targetTeam: Team | null) {
    // Remove card from hand
    game.currentPlayer.hand = game.currentPlayer.hand.filter(handCard => handCard !== card);

    let wasSafetyCardOrCoupFourréPlayed = false;

    const drawACard = (player: Player) => {
        const nextCard = game.deck.pop();
        if (nextCard !== undefined) {
            player.hand.push(nextCard);
        }
    };

    const handleCoupFourré = (playerWithCoupFourré: Player) => {
        drawACard(playerWithCoupFourré);
        game.currentPlayer = playerWithCoupFourré;
        wasSafetyCardOrCoupFourréPlayed = true;
    };

    if (targetTeam && canCardBePlayed(card, game, targetTeam)) {
        if (isInstanceOfDistanceCard(card)) {
            targetTeam.tableau.distanceArea.push(card as DistanceCard);
        } else if (card instanceof UnlimitedCard) {
            targetTeam.tableau.speedArea.push(card);
        } else if (card instanceof LimitCard) {
            const playerWithCoupFourré = getPlayerWithCoupFourré(card, targetTeam);

            if (playerWithCoupFourré === null) {
                targetTeam.tableau.speedArea.push(card);
            } else {
                handleCoupFourré(playerWithCoupFourré);
            }
        } else if (isInstanceOfHazardCard(card)) {
            const playerWithCoupFourré = getPlayerWithCoupFourré(card, targetTeam);

            if (playerWithCoupFourré === null) {
                targetTeam.tableau.battleArea.push(card);
            } else {
                handleCoupFourré(playerWithCoupFourré);
            }
        } else if (isInstanceOfRemedyCard(card)) {
            targetTeam.tableau.battleArea.push(card);
        } else if (isInstanceOfSafteyCard(card)) {
            targetTeam.tableau.safetyArea.push(card as SafetyCard);

            const battleCard = getVisibleBattleCard(targetTeam.tableau.battleArea);

            if (
                (card instanceof AceCard && battleCard instanceof CrashCard) ||
                (card instanceof SealantCard && battleCard instanceof FlatCard) ||
                (card instanceof EmergencyCard && battleCard instanceof StopCard) ||
                (card instanceof TankerCard && battleCard instanceof EmptyCard)
            ) {
                // Remove the top card
                targetTeam.tableau.battleArea.pop();
            }

            if (card instanceof EmergencyCard) {
                // Remove all cards from the Speed Area
                targetTeam.tableau.speedArea = [];
            }

            wasSafetyCardOrCoupFourréPlayed = true;
        }
    } else {
        game.discard = card;
    }

    // Only move to the next player if a safety card or a coup-fourré wasn't played
    if (!wasSafetyCardOrCoupFourréPlayed) {
        game.currentPlayer = getNextPlayer(game);
    }

    drawACard(game.currentPlayer);
}

export function canCardBePlayed(card: Card, game: Game, targetTeam?: Team) {
    const tableau = getCurrentPlayerTeam(game).tableau;
    const targetTeams = targetTeam === undefined
        ? game.teams.filter(team => team !== getCurrentPlayerTeam(game))
        : [targetTeam];

    if (isInstanceOfRemedyCard(card)) return canRemedyCardBePlayed(card, getVisibleBattleCard(tableau.battleArea));
    if (isInstanceOfDistanceCard(card)) return canDistanceCardBePlayed(card as DistanceCard, tableau);
    if (card instanceof UnlimitedCard) return canUnlimitedCardBePlayed(getVisibleSpeedCard(tableau.speedArea));
    if (card instanceof LimitCard) return canLimitCardBePlayed(targetTeams);
    if (isInstanceOfHazardCard(card)) return canHazardCardBePlayed(card, targetTeams);
    if (isInstanceOfSafteyCard(card)) return true; // Safety cards can always be played

    return false;
}

function isInstanceOfSafteyCard(card: Card): boolean {
    return card instanceof AceCard || card instanceof TankerCard || card instanceof SealantCard || card instanceof EmergencyCard;
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
    const battleArea = getVisibleBattleCard(tableau.battleArea);
    const speedArea = getVisibleSpeedCard(tableau.speedArea)
    const speedAreaLimit = speedArea === null ? 200 : speedArea.limit;

    if (battleArea instanceof RollCard && speedAreaLimit >= distanceCard.amount) return true;
    if (hasEmergencyCard(tableau.safetyArea) && (battleArea === null || isInstanceOfRemedyCard(battleArea) || battleArea instanceof StopCard)) return true;

    return false;
}

function canUnlimitedCardBePlayed(speedArea: SpeedCard | null): boolean {
    if (speedArea instanceof LimitCard) return true;

    return false;
}

function canLimitCardBePlayed(teams: Array<Team>): boolean {
    for (const team of teams) {
        if (hasEmergencyCard(team.tableau.safetyArea)) continue;

        const speedArea = getVisibleSpeedCard(team.tableau.speedArea)
        if (speedArea === null || speedArea instanceof UnlimitedCard) return true;
    }

    return false;
}

function canHazardCardBePlayed(hazardCard: HazardCard, teams: Array<Team>): boolean {
    for (const team of teams) {
        if (hazardCard instanceof FlatCard && hasSealantCard(team.tableau.safetyArea)) continue;
        if (hazardCard instanceof CrashCard && hasAceCard(team.tableau.safetyArea)) continue;
        if (hazardCard instanceof EmptyCard && hasTankerCard(team.tableau.safetyArea)) continue;
        if (hazardCard instanceof StopCard && hasEmergencyCard(team.tableau.safetyArea)) continue;

        if (getVisibleBattleCard(team.tableau.battleArea) instanceof RollCard || hasEmergencyCard(team.tableau.safetyArea)) return true;
    }

    return false;
}

function canRemedyCardBePlayed(remedyCard: RemedyCard, battleArea: BattleCard | null): boolean {
    if (remedyCard instanceof RollCard) return canRollCardBePlayed(battleArea);
    if (remedyCard instanceof GasCard && battleArea instanceof EmptyCard) return true;
    if (remedyCard instanceof RepairCard && battleArea instanceof CrashCard) return true;
    if (remedyCard instanceof SpareCard && battleArea instanceof FlatCard) return true;

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

export function getCurrentPlayerTeam(game: Game): Team {
    return game.teams.find(team => team.id === game.currentPlayer.teamId) as Team;
}

export function getVisibleBattleCard(battleArea: Array<BattleCard>): BattleCard | null {
    return battleArea[battleArea.length - 1] || null;
}

export function getVisibleSpeedCard(speedArea: Array<SpeedCard>): SpeedCard | null {
    return speedArea[speedArea.length - 1] || null;
}

function hasAceCard(cards: Array<Card>): boolean {
    return cards.find(card => card instanceof AceCard) !== undefined;
}

function hasSealantCard(cards: Array<Card>): boolean {
    return cards.find(card => card instanceof SealantCard) !== undefined;
}

function hasEmergencyCard(cards: Array<Card>): boolean {
    return cards.find(card => card instanceof EmergencyCard) !== undefined;
}

function hasTankerCard(cards: Array<Card>): boolean {
    return cards.find(card => card instanceof TankerCard) !== undefined;
}

function getPlayerWithCoupFourré(attackingCard: HazardCard | LimitCard, targetTeam: Team): Player | null {
    const playCoupFourré = (player: Player, safetyCard: SafetyCard) => {
        player.hand.splice(player.hand.indexOf(safetyCard), 1);
        safetyCard.coupFourré = true;
        targetTeam.tableau.safetyArea.push(safetyCard);
    };

    if (attackingCard instanceof CrashCard) {
        const playerWithAce = targetTeam.players.find(player => hasAceCard(player.hand));

        if (playerWithAce !== undefined) {
            playCoupFourré(playerWithAce, playerWithAce.hand.find(card => card instanceof AceCard) as SafetyCard);
            return playerWithAce;
        }
    }

    if (attackingCard instanceof EmptyCard) {
        const playerWithTanker = targetTeam.players.find(player => hasTankerCard(player.hand));

        if (playerWithTanker !== undefined) {
            playCoupFourré(playerWithTanker, playerWithTanker.hand.find(card => card instanceof TankerCard) as SafetyCard);
            return playerWithTanker;
        }
    }

    if (attackingCard instanceof StopCard || attackingCard instanceof LimitCard) {
        const playerWithEmergency = targetTeam.players.find(player => hasEmergencyCard(player.hand));

        if (playerWithEmergency !== undefined) {
            playCoupFourré(playerWithEmergency, playerWithEmergency.hand.find(card => card instanceof EmergencyCard) as SafetyCard);
            targetTeam.tableau.speedArea = [];
            return playerWithEmergency;
        }
    }

    if (attackingCard instanceof FlatCard) {
        const playerWithSealant = targetTeam.players.find(player => hasSealantCard(player.hand));

        if (playerWithSealant !== undefined) {
            playCoupFourré(playerWithSealant, playerWithSealant.hand.find(card => card instanceof SealantCard) as SafetyCard);
            return playerWithSealant;
        }
    }

    return null;
}
