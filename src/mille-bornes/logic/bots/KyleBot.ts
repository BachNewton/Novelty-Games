import { removeRandomElement } from "../../../util/Randomizer";
import { getTeamName } from "../../ui/UiUtil";
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
            console.log('KyleBot - choosing a playable card from:', playableCards);
            const choice = choosePlayableCard(playableCards, myTeam, otherTeams, canCardBePlayed, gameIsExtended);

            if (choice !== null) {
                console.log('KyleBot - I choose to play:', choice.card, 'on team:', choice.targetTeam);
                playCard(choice.card, choice.targetTeam);
                return;
            }
        }

        if (unplayableCards.length > 0) {
            console.log('KyleBot - choosing a card to discard from:', unplayableCards);
            const choice = chooseUnplayableCards(unplayableCards);
            console.log('KyleBot - I choose to discard:', choice.card);
            playCard(choice.card, choice.targetTeam);
            return;
        }

        console.log('KyleBot - there is nothing I want to play and nothing to discard. I must have only have Saftey card remaining.');
        const safetyCard = playableCards.shift() as SafetyCard;
        console.log('KyleBot - I choose to play:', safetyCard);
        playCard(safetyCard, myTeam);
    }
};

function choosePlayableCard(
    playableCards: Card[],
    myTeam: Team,
    otherTeams: Team[],
    canCardBePlayed: (card: Card, targetTeam?: Team | undefined) => boolean,
    gameIsExtended: boolean
): Choice | null {
    console.log('KyleBot - considering safety cards');
    const safetyCards = playableCards.filter(card => card instanceof SafetyCard);
    if (safetyCards.length > 0) {
        if (isAtLeastOneTeamOneCardAwayFromEndingTheRound(myTeam, otherTeams, gameIsExtended)) {
            console.log('KyleBot - some team is one card away from ending the round so I will play my safety card now');
            const choosenCard = removeRandomElement(safetyCards);

            return {
                card: choosenCard,
                targetTeam: myTeam
            };
        } else {
            console.log('KyleBot - not the time to play a safety card');
        }
    } else {
        console.log('KyleBot - no safety cards to be played');
    }

    console.log('KyleBot - considering hazard cards');
    const hazardCards = playableCards.filter(card => card instanceof HazardCard);
    if (hazardCards.length > 0) {
        console.log('KyleBot - choosing a hazard card to play');
        const offensiveChoice = chooseOffensiveCard(otherTeams, hazardCards, canCardBePlayed);

        if (offensiveChoice !== null) {
            return offensiveChoice;
        }
    }
    console.log('KyleBot - no hazard cards can be played');

    console.log('KyleBot - considering remedy cards');
    const remedyCards = playableCards.filter(card => card instanceof RemedyCard);
    if (remedyCards.length > 0) {
        console.log('KyleBot - choosing a remedy card to play');
        const choosenCard = remedyCards.shift() as RemedyCard;

        return {
            card: choosenCard,
            targetTeam: myTeam
        };
    }
    console.log('KyleBot - no remedy cards can be played');

    console.log('KyleBot - considering distance cards');
    const distanceCards = playableCards.filter(card => card instanceof DistanceCard) as DistanceCard[];
    if (distanceCards.length > 0) {
        const has200CardBeenPlayed = myTeam.tableau.distanceArea.find(card => card.amount === 200) !== undefined;
        console.log('KyleBot - has a 200 card already been played?', has200CardBeenPlayed, 'if so, this will influence influence our decision');

        const rankedCards = distanceCards.sort((card1, card2) => {
            const card1Value = calculateDistanceCardValue(card1, has200CardBeenPlayed);
            const card2Value = calculateDistanceCardValue(card2, has200CardBeenPlayed);

            return card2Value - card1Value;
        });
        console.log('KyleBot - I have valued my playable distance cards in this order:', rankedCards.map(card => card.amount));

        const choosenCard = rankedCards.shift() as DistanceCard;

        return {
            card: choosenCard,
            targetTeam: myTeam
        };
    }
    console.log('KyleBot - no distance cards can be played');

    console.log('KyleBot - considering limit cards');
    const limitCards = playableCards.filter(card => card instanceof LimitCard);
    if (limitCards.length > 0) {
        const offensiveChoice = chooseOffensiveCard(otherTeams, limitCards, canCardBePlayed);

        if (offensiveChoice !== null) {
            return offensiveChoice;
        }
    }
    console.log('KyleBot - no limit cards can be played');

    console.log('KyleBot - considering unlimited cards');
    const unlimitedCards = playableCards.filter(card => card instanceof UnlimitedCard);
    if (unlimitedCards.length > 0) {
        const choosenCard = unlimitedCards.shift() as UnlimitedCard;

        return {
            card: choosenCard,
            targetTeam: myTeam
        };
    }
    console.log('KyleBot - no unlimited cards can be played');

    console.log('KyleBot - there is nothing I want to play at this time');
    return null;
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
    }).some(remainingDistance => remainingDistance === 200 || remainingDistance <= 100);
}

function calculateDistanceCardValue(card: DistanceCard, has200CardBeenPlayed: boolean): number {
    return card.amount === 200 && !has200CardBeenPlayed ? 75 - 1 : card.amount;
}

function chooseOffensiveCard(
    otherTeams: Team[],
    offensiveCards: HazardCard[] | LimitCard[],
    canCardBePlayed: (card: Card, targetTeam?: Team | undefined) => boolean
): Choice | null {
    const furthestTeamFirst = sortByFurthestFirst(otherTeams);
    console.log('KyleBot - considering teams in the order of their distance:', furthestTeamFirst.map(team => getTeamName(team)));

    while (furthestTeamFirst.length > 0) {
        const targetTeam = furthestTeamFirst.shift() as Team;
        console.log(`KyleBot - determining if ${getTeamName(targetTeam)} can be targeted`);

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

function sortByFurthestFirst(teams: Team[]): Team[] {
    return teams.sort((team1, team2) => {
        return getTotalDistance(team2.tableau.distanceArea) - getTotalDistance(team1.tableau.distanceArea);
    });
}

function chooseUnplayableCards(unplayableCards: Card[]): Choice {
    console.log('KyleBot - I will randomly choose a card to discard');
    const choosenCard = removeRandomElement(unplayableCards);

    return {
        card: choosenCard,
        targetTeam: null
    };
}
