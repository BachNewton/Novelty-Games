import { AceCard, BattleCard, Card, CrashCard, Distance200Card, DistanceCard, EmergencyCard, EmptyCard, FlatCard, GasCard, HazardCard, LimitCard, RemedyCard, RepairCard, RollCard, SafetyCard, SealantCard, SpareCard, SpeedCard, StopCard, TankerCard, UnlimitedCard } from "./Card";
import { Game, Player, Tableau, Team } from "./Data";

const MAX_TARGET_DISTANCE = 1000;
const TARGET_DISTANCE = 750;

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

export function playCard(card: Card, game: Game, targetTeam: Team | null, onRoundOver: (game: Game) => void) {
    // Remove card from hand
    const indexOfPlayedCard = game.currentPlayer.hand.indexOf(card);
    if (indexOfPlayedCard !== -1) {
        // Local player
        game.currentPlayer.hand.splice(indexOfPlayedCard, 1);
    } else {
        // If the card can't be found, this must be an online players.
        // If so, we'll look for the card using its image and remove it like that.
        const playedCard = game.currentPlayer.hand.find(handCard => handCard.image === card.image) as Card;
        game.currentPlayer.hand = game.currentPlayer.hand.filter(handCard => handCard !== playedCard);
    }

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
        if (card instanceof DistanceCard) {
            targetTeam.tableau.distanceArea.push(card as DistanceCard);
        } else if (card instanceof UnlimitedCard) {
            targetTeam.tableau.speedArea.push(card);
        } else if (card instanceof LimitCard) {
            const playerWithCoupFourré = getPlayerWithCoupFourré(card, targetTeam, () => game.discard = card);

            if (playerWithCoupFourré === null) {
                targetTeam.tableau.speedArea.push(card);
            } else {
                handleCoupFourré(playerWithCoupFourré);
            }
        } else if (card instanceof HazardCard) {
            const playerWithCoupFourré = getPlayerWithCoupFourré(card, targetTeam, () => game.discard = card);

            if (playerWithCoupFourré === null) {
                targetTeam.tableau.battleArea.push(card);
            } else {
                handleCoupFourré(playerWithCoupFourré);
            }
        } else if (card instanceof RemedyCard) {
            targetTeam.tableau.battleArea.push(card);
        } else if (card instanceof SafetyCard) {
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

    const doAllPlayersHaveNoCards = game.teams.every(team => team.players.every(player => player.hand.length === 0));
    if (doAllPlayersHaveNoCards) {
        onRoundOver(game);
    } else {
        // Loop through the player order until we get to a player who still has cards to play
        while (game.currentPlayer.hand.length === 0) {
            game.currentPlayer = getNextPlayer(game);
        }
    }
}

export function canCardBePlayed(card: Card, game: Game, targetTeam?: Team) {
    const tableau = getCurrentPlayerTeam(game).tableau;
    const targetTeams = targetTeam === undefined
        ? game.teams.filter(team => team !== getCurrentPlayerTeam(game))
        : [targetTeam];

    if (card instanceof RemedyCard) return canRemedyCardBePlayed(card, getVisibleBattleCard(tableau.battleArea), tableau.safetyArea);
    if (card instanceof DistanceCard) return canDistanceCardBePlayed(card as DistanceCard, tableau, game.teams, game.extention);
    if (card instanceof UnlimitedCard) return canUnlimitedCardBePlayed(getVisibleSpeedCard(tableau.speedArea));
    if (card instanceof LimitCard) return canLimitCardBePlayed(targetTeams);
    if (card instanceof HazardCard) return canHazardCardBePlayed(card, targetTeams);
    if (card instanceof SafetyCard) return true; // Safety cards can always be played

    return false;
}

function canDistanceCardBePlayed(distanceCard: DistanceCard, tableau: Tableau, teams: Array<Team>, extention: boolean): boolean {
    const battleArea = getVisibleBattleCard(tableau.battleArea);
    const speedArea = getVisibleSpeedCard(tableau.speedArea)
    const speedAreaLimit = speedArea === null ? 200 : speedArea.limit;

    // A max of 2 Distance200Cards can be played per hand
    if (distanceCard instanceof Distance200Card && tableau.distanceArea.filter(distanceCard => distanceCard instanceof Distance200Card).length >= 2) return false;

    if (getTotalDistance(tableau.distanceArea) + distanceCard.amount > getTargetDistance(teams, extention)) return false;

    if (battleArea instanceof RollCard && speedAreaLimit >= distanceCard.amount) return true;
    if (hasSafetyCard(tableau.safetyArea, EmergencyCard) && (battleArea === null || battleArea instanceof RemedyCard || battleArea instanceof StopCard)) return true;

    return false;
}

function canUnlimitedCardBePlayed(speedArea: SpeedCard | null): boolean {
    if (speedArea instanceof LimitCard) return true;

    return false;
}

export function canLimitCardBePlayed(teams: Array<Team>): boolean {
    for (const team of teams) {
        if (hasSafetyCard(team.tableau.safetyArea, EmergencyCard)) continue;

        const speedArea = getVisibleSpeedCard(team.tableau.speedArea)
        if (speedArea === null || speedArea instanceof UnlimitedCard) return true;
    }

    return false;
}

export function canHazardCardBePlayed(hazardCard: HazardCard, teams: Array<Team>): boolean {
    for (const team of teams) {
        const safetyArea = team.tableau.safetyArea;

        // You can't play a hazard card on a player who has the safety card to block it
        if (hazardCard instanceof FlatCard && hasSafetyCard(safetyArea, SealantCard)) continue;
        if (hazardCard instanceof CrashCard && hasSafetyCard(safetyArea, AceCard)) continue;
        if (hazardCard instanceof EmptyCard && hasSafetyCard(safetyArea, TankerCard)) continue;
        if (hazardCard instanceof StopCard && hasSafetyCard(safetyArea, EmergencyCard)) continue;

        // You can't play a hazard card on a player who already has a hazard card to deal with
        if (getVisibleBattleCard(team.tableau.battleArea) instanceof HazardCard) continue;

        // You can only play a hazard card on a player who has a roll or an Emergency card
        if (getVisibleBattleCard(team.tableau.battleArea) instanceof RollCard || hasSafetyCard(safetyArea, EmergencyCard)) return true;
    }

    return false;
}

function canRemedyCardBePlayed(remedyCard: RemedyCard, battleArea: BattleCard | null, safetyArea: Array<SafetyCard>): boolean {
    if (remedyCard instanceof RollCard) return canRollCardBePlayed(battleArea, safetyArea);
    if (remedyCard instanceof GasCard && battleArea instanceof EmptyCard) return true;
    if (remedyCard instanceof RepairCard && battleArea instanceof CrashCard) return true;
    if (remedyCard instanceof SpareCard && battleArea instanceof FlatCard) return true;

    return false;
}

function canRollCardBePlayed(battleArea: BattleCard | null, safetyArea: Array<SafetyCard>): boolean {
    // You can't play a RollCard if you already have an EmergencyCard in play.
    if (hasSafetyCard(safetyArea, EmergencyCard)) return false;

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

export function hasSafetyCard(safetyCards: Card[], safetyCardType: typeof SafetyCard): boolean {
    return safetyCards.find(safetyCard => safetyCard instanceof safetyCardType) !== undefined;
}

function getPlayerWithCoupFourré(attackingCard: HazardCard | LimitCard, targetTeam: Team, updateDiscardPile: () => void): Player | null {
    const playCoupFourré = (player: Player, safetyCard: SafetyCard) => {
        player.hand.splice(player.hand.indexOf(safetyCard), 1);
        safetyCard.coupFourré = true;
        targetTeam.tableau.safetyArea.push(safetyCard);
        updateDiscardPile();
    };

    const getPlayerWith = (safetyCardType: typeof SafetyCard) => targetTeam.players.find(player => hasSafetyCard(player.hand, safetyCardType));

    if (attackingCard instanceof CrashCard) {
        const playerWithAce = getPlayerWith(AceCard);

        if (playerWithAce !== undefined) {
            playCoupFourré(playerWithAce, playerWithAce.hand.find(card => card instanceof AceCard) as SafetyCard);
            return playerWithAce;
        }
    }

    if (attackingCard instanceof EmptyCard) {
        const playerWithTanker = getPlayerWith(TankerCard);

        if (playerWithTanker !== undefined) {
            playCoupFourré(playerWithTanker, playerWithTanker.hand.find(card => card instanceof TankerCard) as SafetyCard);
            return playerWithTanker;
        }
    }

    if (attackingCard instanceof StopCard || attackingCard instanceof LimitCard) {
        const playerWithEmergency = getPlayerWith(EmergencyCard);

        if (playerWithEmergency !== undefined) {
            playCoupFourré(playerWithEmergency, playerWithEmergency.hand.find(card => card instanceof EmergencyCard) as SafetyCard);
            targetTeam.tableau.speedArea = [];
            return playerWithEmergency;
        }
    }

    if (attackingCard instanceof FlatCard) {
        const playerWithSealant = getPlayerWith(SealantCard);

        if (playerWithSealant !== undefined) {
            playCoupFourré(playerWithSealant, playerWithSealant.hand.find(card => card instanceof SealantCard) as SafetyCard);
            return playerWithSealant;
        }
    }

    return null;
}

export function getTotalDistance(distanceArea: Array<DistanceCard>): number {
    return distanceArea.reduce((accumulator: number, distanceCard: DistanceCard) => accumulator + distanceCard.amount, 0);
}

function getTargetDistance(teams: Array<Team>, extention: boolean): number {
    if (extention || (teams.length === 2 && teams[0].players.length === 2 && teams[1].players.length === 2)) {
        return MAX_TARGET_DISTANCE;
    } else {
        return TARGET_DISTANCE;
    }
}

export function isGameAtMaxTargetDistance(teams: Array<Team>): boolean {
    return getTargetDistance(teams, false) === getTargetDistance(teams, true);
}

export function getRemainingDistance(distanceArea: Array<DistanceCard>, teams: Array<Team>, extention: boolean): number {
    return getTargetDistance(teams, extention) - getTotalDistance(distanceArea);
}
