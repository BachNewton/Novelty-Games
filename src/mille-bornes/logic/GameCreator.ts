import { shuffleArray } from '../../util/Randomizer';
import { Game, Player, Team } from './Data';
import { AceCard, Card, CrashCard, Distance100Card, Distance200Card, Distance25Card, Distance50Card, Distance75Card, EmergencyCard, EmptyCard, FlatCard, GasCard, LimitCard, RepairCard, RollCard, SealantCard, SpareCard, StopCard, TankerCard, UnlimitedCard } from './Card';
import { LobbyTeam } from '../ui/Lobby';

export function createGame(lobbyTeams: Array<LobbyTeam>): Game {
    let deck = shuffleArray(createDeck());
    deck = deck.filter(card => card instanceof LimitCard).concat(deck.filter(card => !(card instanceof LimitCard)));

    const teams: Array<Team> = lobbyTeams.map((lobbyTeam, lobbyIndex) => {
        const team: Team = {
            tableau: {
                battleArea: null,
                speedArea: null,
                distanceArea: [],
                safetyArea: []
            },
            players: [],
            color: lobbyIndex === 0 ? 'blue' : lobbyIndex === 1 ? 'red' : 'green',
            id: Math.random().toString()
        };

        const players = lobbyTeam.players.map((lobbyPlayer, playerIndex) => {
            const player: Player = {
                name: lobbyPlayer.name,
                localId: lobbyPlayer.localId,
                teamId: team.id,
                hand: deck.splice(0, 6).concat(lobbyIndex === 0 && playerIndex === 0 ? deck.splice(0, 1) : [])
            };

            return player;
        });

        team.players = players;

        return team;
    });

    return { deck: deck, discard: null, teams: teams, currentPlayer: teams[0].players[0] };
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
