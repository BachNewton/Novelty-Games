import { EmergencyCard, RollCard } from "../../mille-bornes/logic/Card";
import { Game, Player, PlayerType, Team } from "../../mille-bornes/logic/Data";
import { canCardBePlayed } from "../../mille-bornes/logic/Rules";

describe('canCardBePlayed  function from Rules', () => {
    it('should not allow RollCard to be played when EmergencyCard has been played', () => {
        const rollCard = new RollCard();

        const teamId = 'teamId';

        const player: Player = {
            name: 'Test Player',
            hand: [],
            teamId: teamId,
            localId: 'localId',
            type: PlayerType.HUMAN
        };

        const team: Team = {
            players: [player],
            tableau: {
                battleArea: [],
                speedArea: [],
                distanceArea: [],
                safetyArea: [new EmergencyCard()]
            },
            color: '',
            id: teamId,
            accumulatedScore: -1
        };

        const game: Game = {
            deck: [],
            discard: null,
            teams: [team],
            currentPlayer: player,
            extention: false
        };

        const isCardPlayable = canCardBePlayed(rollCard, game);

        // A RollCard should not be played when an EmergencyCard has been played.
        expect(isCardPlayable).toBe(false);
    });
});
