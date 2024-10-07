import { removeRandomElement } from "../../../util/Randomizer";
import { Card, LimitCard } from "../Card";
import { Team } from "../Data";
import { isInstanceOfHazardCard } from "../Rules";
import { Bot } from "./Bot";

export const DumbBot: Bot = {
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

        console.log('playableCards:', playableCards);
        console.log('unplayableCards:', unplayableCards);

        if (playableCards.length > 0) {
            const selectedCard = removeRandomElement(playableCards);
            console.log('playing selectedCard:', selectedCard);

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
            console.log('discarding selectedCard:', selectedCard);
            playCard(selectedCard, null);
        }
    }
};
