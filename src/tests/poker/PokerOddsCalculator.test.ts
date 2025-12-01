import { createPokerOddsCalculator } from "../../board-games/poker/logic/PokerOddsCalculator";
import { Card, Suit } from "../../board-games/poker/data/Card";
import { Player } from "../../board-games/poker/data/Player";

describe('PokerOddsCalculator', () => {
    let calculator: ReturnType<typeof createPokerOddsCalculator>;

    beforeEach(() => {
        calculator = createPokerOddsCalculator();
    });

    // Helper function to create a card
    const createCard = (rank: string, suit: Suit): Card => ({
        rank,
        suit
    });

    // Helper function to create a player with cards
    const createPlayer = (
        name: string,
        card1: Card | null,
        card2: Card | null,
        lastAction: string | null = null
    ): Player => ({
        name,
        card1,
        card2,
        isTurn: false,
        stack: 1000,
        lastAction,
        inPot: 0,
        showCards: false,
        handEvaluation: ''
    });

    describe('Player filtering', () => {
        it('should calculate odds with 3 players when there are 4 players but 1 has folded', () => {
            // Create a new calculator to avoid cache interference
            const testCalculator = createPokerOddsCalculator();

            const player1Card1 = createCard('A', Suit.HEARTS);
            const player1Card2 = createCard('K', Suit.HEARTS);

            const player2Card1 = createCard('Q', Suit.DIAMONDS);
            const player2Card2 = createCard('J', Suit.DIAMONDS);

            const player3Card1 = createCard('10', Suit.CLUBS);
            const player3Card2 = createCard('9', Suit.CLUBS);

            const player4Card1 = createCard('8', Suit.SPADES);
            const player4Card2 = createCard('7', Suit.SPADES);

            // Baseline: 3 active players
            const threePlayers: Player[] = [
                createPlayer('Player 1', player1Card1, player1Card2, null),
                createPlayer('Player 2', player2Card1, player2Card2, null),
                createPlayer('Player 3', player3Card1, player3Card2, null)
            ];

            // Test case: 4 players with 1 folded
            const fourPlayersWithFolded: Player[] = [
                createPlayer('Player 1', player1Card1, player1Card2, null), // Active
                createPlayer('Player 2', player2Card1, player2Card2, null), // Active
                createPlayer('Player 3', player3Card1, player3Card2, null), // Active
                createPlayer('Player 4', player4Card1, player4Card2, 'Folded') // Folded
            ];

            const board: Card[] = [];

            // Calculate with 3 players (baseline)
            const resultWith3Players = testCalculator.calculate(player1Card1, player1Card2, board, threePlayers);

            // Create a new calculator to avoid cache
            const testCalculator2 = createPokerOddsCalculator();

            // Calculate with 4 players where 1 is folded
            const resultWithFolded = testCalculator2.calculate(player1Card1, player1Card2, board, fourPlayersWithFolded);

            // Both should return valid results
            expect(resultWith3Players).not.toBeNull();
            expect(resultWithFolded).not.toBeNull();

            // The results should be the same (or very close) because both use numPlayers = 3
            // Using a tolerance to account for simulation randomness (within 1 percentage point)
            const difference = Math.abs(resultWithFolded! - resultWith3Players!);
            expect(difference).toBeLessThan(1);
        });

        it('should calculate odds with 3 players when there are 4 players but one has no cards', () => {
            // Create a new calculator to avoid cache interference
            const testCalculator = createPokerOddsCalculator();

            const player1Card1 = createCard('A', Suit.HEARTS);
            const player1Card2 = createCard('K', Suit.HEARTS);

            const player2Card1 = createCard('Q', Suit.DIAMONDS);
            const player2Card2 = createCard('J', Suit.DIAMONDS);

            const player3Card1 = createCard('10', Suit.CLUBS);
            const player3Card2 = createCard('9', Suit.CLUBS);

            // Baseline: 3 active players
            const threePlayers: Player[] = [
                createPlayer('Player 1', player1Card1, player1Card2, null),
                createPlayer('Player 2', player2Card1, player2Card2, null),
                createPlayer('Player 3', player3Card1, player3Card2, null)
            ];

            // Test case: 4 players with 1 having no cards
            const fourPlayersWithNoCards: Player[] = [
                createPlayer('Player 1', player1Card1, player1Card2, null), // Active
                createPlayer('Player 2', player2Card1, player2Card2, null), // Active
                createPlayer('Player 3', player3Card1, player3Card2, null), // Active
                createPlayer('Player 4', null, null, null) // No cards - not in hand
            ];

            const board: Card[] = [];

            // Calculate with 3 players (baseline)
            const resultWith3Players = testCalculator.calculate(player1Card1, player1Card2, board, threePlayers);

            // Create a new calculator to avoid cache
            const testCalculator2 = createPokerOddsCalculator();

            // Calculate with 4 players where 1 has no cards
            const resultWithNoCards = testCalculator2.calculate(player1Card1, player1Card2, board, fourPlayersWithNoCards);

            // Both should return valid results
            expect(resultWith3Players).not.toBeNull();
            expect(resultWithNoCards).not.toBeNull();

            // The results should be the same (or very close) because both use numPlayers = 3
            // Using a tolerance to account for simulation randomness (within 1 percentage point)
            const difference = Math.abs(resultWithNoCards! - resultWith3Players!);
            expect(difference).toBeLessThan(1);
        });

        it('should calculate different odds for 3 vs 4 active players', () => {
            // Create a new calculator to avoid cache interference
            const testCalculator = createPokerOddsCalculator();

            const player1Card1 = createCard('A', Suit.HEARTS);
            const player1Card2 = createCard('K', Suit.HEARTS);

            const player2Card1 = createCard('Q', Suit.DIAMONDS);
            const player2Card2 = createCard('J', Suit.DIAMONDS);

            const player3Card1 = createCard('10', Suit.CLUBS);
            const player3Card2 = createCard('9', Suit.CLUBS);

            const player4Card1 = createCard('8', Suit.SPADES);
            const player4Card2 = createCard('7', Suit.SPADES);

            // 3 active players
            const threePlayers: Player[] = [
                createPlayer('Player 1', player1Card1, player1Card2, null),
                createPlayer('Player 2', player2Card1, player2Card2, null),
                createPlayer('Player 3', player3Card1, player3Card2, null)
            ];

            // 4 active players (all have cards and haven't folded)
            const fourPlayers: Player[] = [
                createPlayer('Player 1', player1Card1, player1Card2, null),
                createPlayer('Player 2', player2Card1, player2Card2, null),
                createPlayer('Player 3', player3Card1, player3Card2, null),
                createPlayer('Player 4', player4Card1, player4Card2, null)
            ];

            const board: Card[] = [];

            // Calculate with 3 players
            const resultWith3Players = testCalculator.calculate(player1Card1, player1Card2, board, threePlayers);

            // Create a new calculator to avoid cache
            const testCalculator2 = createPokerOddsCalculator();

            // Calculate with 4 players
            const resultWith4Players = testCalculator2.calculate(player1Card1, player1Card2, board, fourPlayers);

            // Both should return valid results
            expect(resultWith3Players).not.toBeNull();
            expect(resultWith4Players).not.toBeNull();

            // The results should be different because different numPlayers values were used
            // With 4 players, the win percentage should generally be lower than with 3 players
            expect(resultWith4Players).toBeLessThan(resultWith3Players!);
        });
    });
});

