import { shuffleArray } from '../../util/Randomizer';
import { Game, Tableau } from './Data';
import { AceCard, Card, CrashCard, Distance100Card, Distance200Card, Distance25Card, Distance50Card, Distance75Card, EmergencyCard, EmptyCard, FlatCard, GasCard, LimitCard, RepairCard, RollCard, SealantCard, SpareCard, StopCard, TankerCard, UnlimitedCard } from './Card';

export function startGame(): Game {
    const deck = shuffleArray(createDeck());
    const hand = deck.splice(0, 6);
    const tableau: Tableau = {
        battleArea: null,
        speedArea: null,
        distanceArea: [new Distance25Card(), new Distance25Card(), new Distance50Card(), new Distance75Card(), new Distance100Card(), new Distance100Card(), new Distance100Card(), new Distance200Card(), new Distance200Card()],
        safetyArea: [new AceCard(), new TankerCard()]
    };

    return { deck: deck, hand: hand, tableau: tableau };
}

function createDeck(): Array<Card> {
    const deck: Array<Card> = [];

    const distance25Cards = new Array(10).fill(new Distance25Card());
    const distance50Cards = new Array(10).fill(new Distance50Card());
    const distance75Cards = new Array(10).fill(new Distance75Card());
    const distance100Cards = new Array(12).fill(new Distance100Card());
    const distance200Cards = new Array(4).fill(new Distance200Card());

    const rollCards = new Array(14).fill(new RollCard());
    const stopCards = new Array(5).fill(new StopCard());

    const limitCards = new Array(4).fill(new LimitCard());
    const unlimitedCards = new Array(6).fill(new UnlimitedCard());

    const emptyCards = new Array(3).fill(new EmptyCard());
    const flatCards = new Array(3).fill(new FlatCard());
    const crashCards = new Array(3).fill(new CrashCard());

    const repairCards = new Array(6).fill(new RepairCard());
    const gasCards = new Array(6).fill(new GasCard());
    const spareCards = new Array(6).fill(new SpareCard());

    const aceCard = new AceCard();
    const emergencyCard = new EmergencyCard();
    const sealantCard = new SealantCard();
    const tankerCard = new TankerCard();

    return deck.concat(
        distance25Cards,
        distance50Cards,
        distance75Cards,
        distance100Cards,
        distance200Cards,
        rollCards,
        stopCards,
        limitCards,
        unlimitedCards,
        emptyCards,
        flatCards,
        crashCards,
        repairCards,
        gasCards,
        spareCards,
        aceCard,
        emergencyCard,
        sealantCard,
        tankerCard
    );
}
