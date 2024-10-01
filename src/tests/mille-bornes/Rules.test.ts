import { RollCard } from "../../mille-bornes/logic/Card";
import { canCardBePlayed } from "../../mille-bornes/logic/Rules";
import { createTestingGame } from "./TestingUtil";

describe('canCardBePlayed function from Rules', () => {
    it('should not allow RollCard to be played when EmergencyCard has been played', () => {
        const rollCard = new RollCard();
        const game = createTestingGame();

        const isCardPlayable = canCardBePlayed(rollCard, game);

        // A RollCard should not be played when an EmergencyCard has been played.
        expect(isCardPlayable).toBe(false);
    });
});
