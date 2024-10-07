import { removeRandomElement } from "../../../util/Randomizer";
import { Card, RemedyCard, SafetyCard } from "../Card";
import { Team } from "../Data";
import { getRemainingDistance } from "../Rules";
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
            //
        } else {
            //
        }
    }
};

function choosePlayableCard(
    playableCards: Card[],
    myTeam: Team,
    otherTeams: Team[],
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

    const remedyCards = playableCards.filter(card => card instanceof RemedyCard);
    if (remedyCards.length > 0) {
        const choosenCard = removeRandomElement(remedyCards);

        return {
            card: choosenCard,
            targetTeam: myTeam
        };
    }

    throw new Error("Function not implemented.");
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

function chooseDiscardCard(unplayableCards: Card[]) {
    //
}
