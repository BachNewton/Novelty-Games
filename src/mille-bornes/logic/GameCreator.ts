import { shuffleArray } from '../../util/Randomizer';
import { Game, Player } from './Data';
import { AceCard, Card, CrashCard, Distance100Card, Distance200Card, Distance25Card, Distance50Card, Distance75Card, EmergencyCard, EmptyCard, FlatCard, GasCard, LimitCard, RepairCard, RollCard, SealantCard, SpareCard, StopCard, TankerCard, UnlimitedCard } from './Card';

export function startGame(): Game {
    const deck = shuffleArray(createDeck());

    const kyle: Player = {
        name: 'Kyle',
        hand: deck.splice(0, 6),
        tableau: {
            battleArea: new RollCard(),
            speedArea: new LimitCard(),
            distanceArea: [new Distance25Card(), new Distance50Card(), new Distance50Card(), new Distance50Card(), new Distance75Card(), new Distance75Card(), new Distance75Card(), new Distance75Card(), new Distance200Card()],
            safetyArea: [new AceCard()]
        },
        team: 1
    };

    const players: Array<Player> = [
        kyle,
        {
            name: 'Eric',
            hand: deck.splice(0, 6),
            tableau: {
                battleArea: new StopCard(),
                speedArea: new UnlimitedCard(),
                distanceArea: [new Distance25Card(), new Distance25Card(), new Distance75Card(), new Distance100Card(), new Distance100Card(), new Distance100Card(), new Distance100Card(), new Distance100Card(), new Distance100Card()],
                safetyArea: [new EmergencyCard(), new TankerCard(), new SealantCard()]
            },
            team: 2
        }
    ];

    return { deck: deck, discard: null, players: players, currentPlayer: kyle };
}

function createDeck(): Array<Card> {
    const deck: Array<Card> = [];

    const distance25Cards = Array.from({ length: 10 }, () => new Distance25Card());
    const distance50Cards = Array.from({ length: 10 }, () => new Distance50Card());
    const distance75Cards = Array.from({ length: 10 }, () => new Distance75Card());
    const distance100Cards = Array.from({ length: 12 }, () => new Distance100Card());
    const distance200Cards = Array.from({ length: 4 }, () => new Distance200Card());

    const rollCards = Array.from({ length: 14 }, () => new RollCard());
    const stopCards = Array.from({ length: 5 }, () => new StopCard());

    const limitCards = Array.from({ length: 4 }, () => new LimitCard());
    const unlimitedCards = Array.from({ length: 6 }, () => new UnlimitedCard());

    const emptyCards = Array.from({ length: 3 }, () => new EmptyCard());
    const flatCards = Array.from({ length: 3 }, () => new FlatCard());
    const crashCards = Array.from({ length: 3 }, () => new CrashCard());

    const repairCards = Array.from({ length: 6 }, () => new RepairCard());
    const gasCards = Array.from({ length: 6 }, () => new GasCard());
    const spareCards = Array.from({ length: 6 }, () => new SpareCard());

    // const aceCard = new AceCard();
    // const emergencyCard = new EmergencyCard();
    // const sealantCard = new SealantCard();
    // const tankerCard = new TankerCard();

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
        // aceCard,
        // emergencyCard,
        // sealantCard,
        // tankerCard
    );
}
