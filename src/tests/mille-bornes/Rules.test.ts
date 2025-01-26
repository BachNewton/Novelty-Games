import { AceCard, EmergencyCard, RollCard, SafetyCard, SealantCard, TankerCard } from "../../board-games/mille-bornes/logic/Card";
import { canCardBePlayed, hasSafetyCard } from "../../board-games/mille-bornes/logic/Rules";
import { createTestingGame } from "./TestingUtil";

describe('canCardBePlayed function from Rules', () => {
    it('should not allow RollCard to be played when EmergencyCard has been played', () => {
        const rollCard = new RollCard();

        const game = createTestingGame();
        game.teams[0].tableau.safetyArea = [new EmergencyCard()];

        const isCardPlayable = canCardBePlayed(rollCard, game);

        // A RollCard should not be played when an EmergencyCard has been played.
        expect(isCardPlayable).toBe(false);
    });
});

describe('hasSafetyCard function from Rules', () => {
    it('should correctly determine if a specific SafetyCard is in an Array', () => {
        const safetyCardsEmpty: SafetyCard[] = [];
        expect(hasSafetyCard(safetyCardsEmpty, AceCard)).toBe(false);

        const safetyCardsWithAce: SafetyCard[] = [new AceCard()];
        expect(hasSafetyCard(safetyCardsWithAce, AceCard)).toBe(true);

        const safetyCardsWithoutEmergency: SafetyCard[] = [new AceCard(), new SealantCard(), new TankerCard()];
        expect(hasSafetyCard(safetyCardsWithoutEmergency, EmergencyCard)).toBe(false);

        expect(hasSafetyCard(safetyCardsWithoutEmergency, SealantCard)).toBe(true);
        expect(hasSafetyCard(safetyCardsWithoutEmergency, TankerCard)).toBe(true);
    });
});
