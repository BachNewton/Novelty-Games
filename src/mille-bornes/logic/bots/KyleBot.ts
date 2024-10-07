import { removeRandomElement } from "../../../util/Randomizer";
import { Card, DistanceCard, HazardCard, LimitCard, RemedyCard, SafetyCard, UnlimitedCard } from "../Card";
import { Team } from "../Data";
import { getRemainingDistance, getTotalDistance } from "../Rules";
import { Bot } from "./Bot";

interface Choice {
    card: Card;
    targetTeam: Team | null;
}

export const KyleBot: Bot = {
    decideMove: (
        myHand: Card[],
        myTeam: Team,
        otherTeams: Team[],
        canCardBePlayed: (card: Card, targetTeam?: Team | undefined) => boolean,
        playCard: (card: Card, targetTeam: Team | null) => void,
        gameIsExtended: boolean
    ) => {
        const playableCards = myHand.filter(card => canCardBePlayed(card));
        const unplayableCards = myHand.filter(card => !canCardBePlayed(card));

        if (playableCards.length > 0) {
            const choice = choosePlayableCard(playableCards, myTeam, otherTeams, canCardBePlayed, gameIsExtended);
            playCard(choice.card, choice.targetTeam);
        } else {
            const choice = chooseUnplayableCards(unplayableCards);
            playCard(choice.card, choice.targetTeam);
        }
    }
};

function choosePlayableCard(
    playableCards: Card[],
    myTeam: Team,
    otherTeams: Team[],
    canCardBePlayed: (card: Card, targetTeam?: Team | undefined) => boolean,
    gameIsExtended: boolean
): Choice {
    const safetyCards = playableCards.filter(card => card instanceof SafetyCard);
    if (safetyCards.length > 0 && isAtLeastOneTeamOneCardAwayFromEndingTheRound(myTeam, otherTeams, gameIsExtended)) {
        const choosenCard = removeRandomElement(safetyCards);

        return {
            card: choosenCard,
            targetTeam: myTeam
        };
    }

    const hazardCards = playableCards.filter(card => card instanceof HazardCard);
    if (hazardCards.length > 0) {
        const offensiveChoice = chooseOffensiveCard(otherTeams, hazardCards, canCardBePlayed);

        if (offensiveChoice !== null) {
            return offensiveChoice;
        }
    }

    const remedyCards = playableCards.filter(card => card instanceof RemedyCard);
    if (remedyCards.length > 0) {
        const choosenCard = remedyCards.shift() as RemedyCard;

        return {
            card: choosenCard,
            targetTeam: myTeam
        };
    }

    const distanceCards = playableCards.filter(card => card instanceof DistanceCard) as DistanceCard[];
    if (distanceCards.length > 0) {
        const has200CardBeenPlayed = distanceCards.find(card => card.amount === 200) !== undefined;

        const rankedCards = distanceCards.sort((card1, card2) => {
            const card1Value = card1.amount === 200 && has200CardBeenPlayed ? card1.amount : 75 - 1;
            const card2Value = card2.amount === 200 && has200CardBeenPlayed ? card1.amount : 75 - 1;

            return card2Value - card1Value;
        });

        const choosenCard = rankedCards.shift() as DistanceCard;

        return {
            card: choosenCard,
            targetTeam: myTeam
        };
    }

    const limitCards = playableCards.filter(card => card instanceof LimitCard);
    if (limitCards.length > 0) {
        const offensiveChoice = chooseOffensiveCard(otherTeams, limitCards, canCardBePlayed);

        if (offensiveChoice !== null) {
            return offensiveChoice;
        }
    }

    const unlimitedCards = playableCards.filter(card => card instanceof UnlimitedCard);
    if (unlimitedCards.length > 0) {
        const choosenCard = limitCards.shift() as UnlimitedCard;

        return {
            card: choosenCard,
            targetTeam: myTeam
        };
    }

    throw new Error('Invalid state! Some choice ought to have been made!');
}

function isAtLeastOneTeamOneCardAwayFromEndingTheRound(
    myTeam: Team,
    otherTeams: Team[],
    gameIsExtended: boolean
): boolean {
    const teams = otherTeams.concat(myTeam);

    return teams.map(team => {
        return getRemainingDistance(
            team.tableau.distanceArea,
            teams,
            gameIsExtended
        );
    }).some(remainingDistance => remainingDistance <= 200);
}

function sortByFurthestFirst(teams: Team[]): Team[] {
    return teams.sort((team1, team2) => {
        return getTotalDistance(team2.tableau.distanceArea) - getTotalDistance(team1.tableau.distanceArea);
    });
}

function chooseOffensiveCard(
    otherTeams: Team[],
    offensiveCards: HazardCard[] | LimitCard[],
    canCardBePlayed: (card: Card, targetTeam?: Team | undefined) => boolean
): Choice | null {
    const furthestTeamFirst = sortByFurthestFirst(otherTeams);

    while (furthestTeamFirst.length > 0) {
        const targetTeam = furthestTeamFirst.shift() as Team;

        for (const offensiveCard of offensiveCards) {
            if (canCardBePlayed(offensiveCard, targetTeam)) {
                return {
                    card: offensiveCard,
                    targetTeam: targetTeam
                };
            }
        }
    }

    return null;
}

function chooseUnplayableCards(unplayableCards: Card[]): Choice {
    const choosenCard = removeRandomElement(unplayableCards);

    return {
        card: choosenCard,
        targetTeam: null
    };
}
