import { Card } from "../Card";
import { Team } from "../Data";
import { Bot } from "./Bot";

export const KyleBot: Bot = {
    decideMove: (
        myHand: Card[],
        myTeam: Team,
        otherTeams: Team[],
        canCardBePlayed: (card: Card, targetTeam?: Team | undefined) => boolean,
        playCard: (card: Card, targetTeam: Team | null) => void
    ) => {
        throw new Error("Function not implemented.");
    }
};
