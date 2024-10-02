import { Card } from "../Card";
import { Team } from "../Data";

export interface Bot {
    decideMove: (
        myHand: Array<Card>,
        myTeam: Team,
        otherTeams: Array<Team>,
        canCardBePlayed: (card: Card, targetTeam?: Team) => boolean,
        playCard: (card: Card, targetTeam: Team | null) => void
    ) => void;
}
