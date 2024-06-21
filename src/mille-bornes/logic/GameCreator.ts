import { shuffleArray } from '../../util/Randomizer';
import { Game, Player, Team } from './Data';
import { AceCard, Card, CrashCard, Distance100Card, Distance200Card, Distance25Card, Distance50Card, Distance75Card, EmergencyCard, EmptyCard, FlatCard, GasCard, LimitCard, RepairCard, RollCard, SealantCard, SpareCard, StopCard, TankerCard, UnlimitedCard } from './Card';

export function startGame(): Game {
    const deck = shuffleArray(createDeck());

    const kyleTeam: Team = {
        tableau: {
            battleArea: null,
            speedArea: null,
            distanceArea: [],
            safetyArea: []
        },
        players: [],
        color: 'blue'
    };
    const kyle: Player = {
        name: 'Kyle',
        hand: deck.splice(0, 6),
        team: kyleTeam
    };
    const elliott: Player = {
        name: 'Elliott',
        hand: [],
        team: kyleTeam
    };
    kyleTeam.players.push(kyle, elliott);

    const ericTeam: Team = {
        tableau: {
            battleArea: null,
            speedArea: null,
            distanceArea: [],
            safetyArea: []
        },
        players: [],
        color: 'red'
    };
    const eric: Player = {
        name: 'Eric',
        hand: deck.splice(0, 6),
        team: ericTeam
    };
    ericTeam.players.push(eric);

    const garyTeam: Team = {
        tableau: {
            battleArea: null,
            speedArea: null,
            distanceArea: [],
            safetyArea: []
        },
        players: [],
        color: 'green'
    };
    const gary: Player = {
        name: 'Gary',
        hand: deck.splice(0, 6),
        team: garyTeam
    };
    garyTeam.players.push(gary);

    const teams = [kyleTeam, ericTeam, garyTeam];

    return { deck: deck, discard: null, teams: teams, currentPlayer: kyle };
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
