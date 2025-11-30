import handEvaluator from '../../../poker-server/handEvaluator.js';
import Card from '../../../poker-server/card.js';
import playerHand from '../../../poker-server/playerHand.js';

describe('handEvaluator', () => {
    // Helper function to create a hand
    const createHand = (card1, card2) => {
        return new playerHand(card1, card2);
    };

    // Helper function to create a card
    const card = (suit, number) => {
        return new Card(suit, number);
    };

    describe('Preflop (no community cards)', () => {
        test('should return high card string for two different cards', () => {
            const evaluator = new handEvaluator([]);
            const hand = createHand(card('s', 14), card('h', 13)); // Ace, King
            const result = evaluator.evaluateHandForString(hand);
            expect(result).toContain('High Card');
            expect(result).toContain('Ace');
            expect(result).toContain('King');
        });

        test('should return pair string for pocket pair', () => {
            const evaluator = new handEvaluator([]);
            const hand = createHand(card('s', 14), card('h', 14)); // Pocket Aces
            const result = evaluator.evaluateHandForString(hand);
            expect(result).toContain('Pair');
            expect(result).toContain("Ace's");
        });
    });

    describe('High Card', () => {
        test('should evaluate high card correctly', () => {
            const board = [card('s', 2), card('h', 5), card('d', 7), card('c', 9), card('s', 11)];
            const evaluator = new handEvaluator(board);
            const hand = createHand(card('s', 3), card('h', 4)); // No pair, just high card
            const handValue = evaluator.evaluateHandNumberValue(hand);
            expect(handValue).toBeGreaterThanOrEqual(0);
            expect(handValue).toBeLessThan(1);
        });

        test('should return high card string', () => {
            const board = [card('s', 2), card('h', 5), card('d', 7), card('c', 9), card('s', 11)];
            const evaluator = new handEvaluator(board);
            const hand = createHand(card('s', 3), card('h', 4));
            const result = evaluator.evaluateHandForString(hand);
            expect(result).toContain('High Card');
        });
    });

    describe('Pair', () => {
        test('should evaluate pair correctly', () => {
            const board = [card('s', 2), card('h', 4), card('d', 6), card('c', 8), card('s', 10)];
            const evaluator = new handEvaluator(board);
            const hand = createHand(card('s', 2), card('h', 3)); // Pair of 2s
            const handValue = evaluator.evaluateHandNumberValue(hand);
            expect(handValue).toBeGreaterThanOrEqual(1);
            expect(handValue).toBeLessThan(2);
        });

        test('should return pair string', () => {
            const board = [card('s', 2), card('h', 4), card('d', 6), card('c', 8), card('s', 10)];
            const evaluator = new handEvaluator(board);
            const hand = createHand(card('s', 2), card('h', 3));
            const result = evaluator.evaluateHandForString(hand);
            expect(result).toContain('Pair');
            expect(result).toContain("Two's");
        });

        test('should compare pairs correctly - higher pair wins', () => {
            const board = [card('s', 2), card('h', 4), card('d', 6), card('c', 8), card('s', 10)];
            const evaluator = new handEvaluator(board);
            const hand1 = createHand(card('s', 2), card('h', 3)); // Pair of 2s
            const hand2 = createHand(card('s', 4), card('h', 5)); // Pair of 4s
            const best = evaluator.returnBestHand(hand1, hand2);
            expect(best).toBe(hand2);
        });
    });

    describe('Two Pair', () => {
        test('should evaluate two pair correctly', () => {
            const board = [card('s', 2), card('h', 2), card('d', 4), card('c', 4), card('s', 10)];
            const evaluator = new handEvaluator(board);
            const hand = createHand(card('s', 3), card('h', 5)); // Two pair: 2s and 4s
            const handValue = evaluator.evaluateHandNumberValue(hand);
            expect(handValue).toBeGreaterThanOrEqual(2);
            expect(handValue).toBeLessThan(3);
        });

        test('should return two pair string', () => {
            const board = [card('s', 2), card('h', 2), card('d', 4), card('c', 4), card('s', 10)];
            const evaluator = new handEvaluator(board);
            const hand = createHand(card('s', 3), card('h', 5));
            const result = evaluator.evaluateHandForString(hand);
            expect(result).toContain('Two Pair');
        });

        test('should compare two pairs correctly - higher pair wins', () => {
            const board = [card('s', 2), card('h', 2), card('d', 4), card('c', 4), card('s', 10)];
            const evaluator = new handEvaluator(board);
            const hand1 = createHand(card('s', 3), card('h', 5)); // Two pair: 2s and 4s
            const hand2 = createHand(card('s', 5), card('h', 5)); // Two pair: 5s and 4s
            const best = evaluator.returnBestHand(hand1, hand2);
            expect(best).toBe(hand2);
        });
    });

    describe('Three of a Kind (Trips)', () => {
        test('should evaluate trips correctly', () => {
            const board = [card('s', 2), card('h', 2), card('d', 2), card('c', 4), card('s', 10)];
            const evaluator = new handEvaluator(board);
            const hand = createHand(card('s', 3), card('h', 5)); // Trips: 2s
            const handValue = evaluator.evaluateHandNumberValue(hand);
            expect(handValue).toBeGreaterThanOrEqual(3);
            expect(handValue).toBeLessThan(4);
        });

        test('should return trips string', () => {
            const board = [card('s', 2), card('h', 2), card('d', 2), card('c', 4), card('s', 10)];
            const evaluator = new handEvaluator(board);
            const hand = createHand(card('s', 3), card('h', 5));
            const result = evaluator.evaluateHandForString(hand);
            expect(result).toContain('Three of a Kind');
            expect(result).toContain("Two's");
        });

        test('should compare trips correctly - higher trips wins', () => {
            const board = [card('s', 2), card('h', 2), card('d', 2), card('c', 4), card('s', 4)];
            const evaluator = new handEvaluator(board);
            const hand1 = createHand(card('s', 3), card('h', 5)); // Trips: 2s
            const hand2 = createHand(card('s', 4), card('h', 5)); // Trips: 4s
            const best = evaluator.returnBestHand(hand1, hand2);
            expect(best).toBe(hand2);
        });
    });

    describe('Straight', () => {
        test('should evaluate straight correctly', () => {
            const board = [card('s', 2), card('h', 3), card('d', 4), card('c', 5), card('s', 10)];
            const evaluator = new handEvaluator(board);
            const hand = createHand(card('s', 6), card('h', 7)); // Straight: 2-6
            const handValue = evaluator.evaluateHandNumberValue(hand);
            expect(handValue).toBeGreaterThanOrEqual(4);
            expect(handValue).toBeLessThan(5);
        });

        test('should return straight string', () => {
            const board = [card('s', 2), card('h', 3), card('d', 4), card('c', 5), card('s', 10)];
            const evaluator = new handEvaluator(board);
            const hand = createHand(card('s', 6), card('h', 7));
            const result = evaluator.evaluateHandForString(hand);
            expect(result).toContain('Straight');
        });

        test('should handle wheel straight (A-2-3-4-5)', () => {
            const board = [card('s', 2), card('h', 3), card('d', 4), card('c', 5), card('s', 10)];
            const evaluator = new handEvaluator(board);
            const hand = createHand(card('s', 14), card('h', 7)); // Wheel: A-2-3-4-5
            const handValue = evaluator.evaluateHandNumberValue(hand);
            expect(handValue).toBeGreaterThanOrEqual(4);
            expect(handValue).toBeLessThan(5);
            const result = evaluator.evaluateHandForString(hand);
            expect(result).toContain('Straight');
        });

        test('should handle high straight (10-J-Q-K-A)', () => {
            const board = [card('s', 10), card('h', 11), card('d', 12), card('c', 13), card('s', 2)];
            const evaluator = new handEvaluator(board);
            const hand = createHand(card('s', 14), card('h', 3)); // Straight: 10-A
            const handValue = evaluator.evaluateHandNumberValue(hand);
            expect(handValue).toBeGreaterThanOrEqual(4);
            expect(handValue).toBeLessThan(5);
        });

        test('should compare straights correctly - higher straight wins', () => {
            const board = [card('s', 2), card('h', 3), card('d', 4), card('c', 5), card('s', 6)];
            const evaluator = new handEvaluator(board);
            const hand1 = createHand(card('s', 7), card('h', 8)); // Straight: 2-6
            const hand2 = createHand(card('s', 7), card('h', 8)); // Straight: 3-7
            // Both should be the same, but let's test different scenario
            const board2 = [card('s', 3), card('h', 4), card('d', 5), card('c', 6), card('s', 10)];
            const evaluator2 = new handEvaluator(board2);
            const hand3 = createHand(card('s', 7), card('h', 8)); // Straight: 3-7
            const hand4 = createHand(card('s', 2), card('h', 6)); // Straight: 2-6
            const best = evaluator2.returnBestHand(hand3, hand4);
            expect(best).toBe(hand3); // 3-7 beats 2-6
        });
    });

    describe('Flush', () => {
        test('should evaluate flush correctly', () => {
            const board = [card('s', 2), card('s', 4), card('s', 6), card('s', 8), card('s', 10)];
            const evaluator = new handEvaluator(board);
            const hand = createHand(card('h', 3), card('h', 5)); // Flush: all spades
            const handValue = evaluator.evaluateHandNumberValue(hand);
            expect(handValue).toBeGreaterThanOrEqual(5);
            expect(handValue).toBeLessThan(6);
        });

        test('should return flush string', () => {
            const board = [card('s', 2), card('s', 4), card('s', 6), card('s', 8), card('s', 10)];
            const evaluator = new handEvaluator(board);
            const hand = createHand(card('h', 3), card('h', 5));
            const result = evaluator.evaluateHandForString(hand);
            expect(result).toContain('Flush');
        });

        test('should compare flushes correctly - higher flush wins', () => {
            const board = [card('s', 2), card('s', 4), card('s', 6), card('s', 8), card('s', 10)];
            const evaluator = new handEvaluator(board);
            const hand1 = createHand(card('s', 3), card('h', 5)); // Flush with 10 high
            const hand2 = createHand(card('s', 14), card('h', 5)); // Flush with Ace high
            const best = evaluator.returnBestHand(hand1, hand2);
            expect(best).toBe(hand2);
        });
    });

    describe('Full House', () => {
        test('should evaluate full house correctly', () => {
            const board = [card('s', 2), card('h', 2), card('d', 2), card('c', 4), card('s', 4)];
            const evaluator = new handEvaluator(board);
            const hand = createHand(card('s', 3), card('h', 5)); // Full house: 2s full of 4s
            const handValue = evaluator.evaluateHandNumberValue(hand);
            expect(handValue).toBeGreaterThanOrEqual(6);
            expect(handValue).toBeLessThan(7);
        });

        test('should return full house string', () => {
            const board = [card('s', 2), card('h', 2), card('d', 2), card('c', 4), card('s', 4)];
            const evaluator = new handEvaluator(board);
            const hand = createHand(card('s', 3), card('h', 5));
            const result = evaluator.evaluateHandForString(hand);
            expect(result).toContain('Full House');
            expect(result).toContain("Two's full of Four's");
        });

        test('should compare full houses correctly - higher trips wins', () => {
            const board = [card('s', 2), card('h', 2), card('d', 2), card('c', 4), card('s', 4)];
            const evaluator = new handEvaluator(board);
            const hand1 = createHand(card('s', 3), card('h', 5)); // Full house: 2s full of 4s
            const hand2 = createHand(card('s', 4), card('h', 4)); // Full house: 4s full of 2s
            const best = evaluator.returnBestHand(hand1, hand2);
            expect(best).toBe(hand2);
        });
    });

    describe('Four of a Kind (Quads)', () => {
        test('should evaluate quads correctly', () => {
            const board = [card('s', 2), card('h', 2), card('d', 2), card('c', 2), card('s', 10)];
            const evaluator = new handEvaluator(board);
            const hand = createHand(card('s', 3), card('h', 5)); // Quads: 2s
            const handValue = evaluator.evaluateHandNumberValue(hand);
            expect(handValue).toBeGreaterThanOrEqual(7);
            expect(handValue).toBeLessThan(8);
        });

        test('should return quads string', () => {
            const board = [card('s', 2), card('h', 2), card('d', 2), card('c', 2), card('s', 10)];
            const evaluator = new handEvaluator(board);
            const hand = createHand(card('s', 3), card('h', 5));
            const result = evaluator.evaluateHandForString(hand);
            expect(result).toContain('Four of a Kind');
            expect(result).toContain("Two's");
        });

        test('should compare quads correctly - higher kicker wins when same quads', () => {
            // Both hands have quads of 2s, compare kickers
            const board = [card('s', 2), card('h', 2), card('d', 2), card('c', 2), card('s', 10)];
            const evaluator = new handEvaluator(board);
            const hand1 = createHand(card('s', 3), card('h', 5)); // Quads: 2s, 10 kicker
            const hand2 = createHand(card('s', 14), card('h', 5)); // Quads: 2s, Ace kicker
            const best = evaluator.returnBestHand(hand1, hand2);
            expect(best).toBe(hand2); // Ace kicker beats 10 kicker
        });

        test('should compare quads with different kickers', () => {
            const board = [card('s', 2), card('h', 2), card('d', 2), card('c', 2), card('s', 10)];
            const evaluator = new handEvaluator(board);
            const hand1 = createHand(card('s', 3), card('h', 5)); // Quads: 2s, 10 kicker
            const hand2 = createHand(card('s', 14), card('h', 5)); // Quads: 2s, Ace kicker
            const best = evaluator.returnBestHand(hand1, hand2);
            expect(best).toBe(hand2);
        });
    });

    describe('Straight Flush', () => {
        test('should evaluate straight flush correctly', () => {
            const board = [card('s', 2), card('s', 3), card('s', 4), card('s', 5), card('h', 10)];
            const evaluator = new handEvaluator(board);
            const hand = createHand(card('s', 6), card('h', 7)); // Straight flush: 2-6 of spades
            const handValue = evaluator.evaluateHandNumberValue(hand);
            expect(handValue).toBeGreaterThanOrEqual(8);
        });

        test('should return straight flush string', () => {
            const board = [card('s', 2), card('s', 3), card('s', 4), card('s', 5), card('h', 10)];
            const evaluator = new handEvaluator(board);
            const hand = createHand(card('s', 6), card('h', 7));
            const result = evaluator.evaluateHandForString(hand);
            expect(result).toContain('Straight Flush');
        });

        test('should handle wheel straight flush (A-2-3-4-5)', () => {
            const board = [card('s', 2), card('s', 3), card('s', 4), card('s', 5), card('h', 10)];
            const evaluator = new handEvaluator(board);
            const hand = createHand(card('s', 14), card('h', 7)); // Wheel straight flush
            const handValue = evaluator.evaluateHandNumberValue(hand);
            expect(handValue).toBeGreaterThanOrEqual(8);
            const result = evaluator.evaluateHandForString(hand);
            expect(result).toContain('Straight Flush');
        });

        test('should handle royal flush (10-J-Q-K-A)', () => {
            const board = [card('s', 10), card('s', 11), card('s', 12), card('s', 13), card('h', 2)];
            const evaluator = new handEvaluator(board);
            const hand = createHand(card('s', 14), card('h', 3)); // Royal flush
            const handValue = evaluator.evaluateHandNumberValue(hand);
            expect(handValue).toBeGreaterThanOrEqual(8);
            const result = evaluator.evaluateHandForString(hand);
            expect(result).toContain('Straight Flush');
        });

        test('should compare straight flushes correctly - higher straight flush wins', () => {
            const board = [card('s', 2), card('s', 3), card('s', 4), card('s', 5), card('s', 6)];
            const evaluator = new handEvaluator(board);
            const hand1 = createHand(card('s', 7), card('h', 8)); // Straight flush: 2-6
            const hand2 = createHand(card('s', 7), card('h', 8)); // Straight flush: 3-7
            // Both should be the same, but let's test different scenario
            const board2 = [card('s', 3), card('s', 4), card('s', 5), card('s', 6), card('h', 10)];
            const evaluator2 = new handEvaluator(board2);
            const hand3 = createHand(card('s', 7), card('h', 8)); // Straight flush: 3-7
            const hand4 = createHand(card('s', 2), card('h', 6)); // Straight flush: 2-6
            const best = evaluator2.returnBestHand(hand3, hand4);
            expect(best).toBe(hand3); // 3-7 beats 2-6
        });
    });

    describe('Hand Comparison', () => {
        test('should return null when hands are equal', () => {
            const board = [card('s', 2), card('h', 4), card('d', 6), card('c', 8), card('s', 10)];
            const evaluator = new handEvaluator(board);
            const hand1 = createHand(card('s', 3), card('h', 5));
            const hand2 = createHand(card('c', 3), card('d', 5)); // Same cards, different suits
            const best = evaluator.returnBestHand(hand1, hand2);
            expect(best).toBeNull();
        });

        test('should correctly rank different hand types', () => {
            // Test pair beats high card - board has no pairs or straights, one hand has pair in hole cards
            const board1 = [card('s', 3), card('h', 5), card('d', 7), card('c', 9), card('s', 11)];
            const evaluator1 = new handEvaluator(board1);
            const highCard = createHand(card('s', 2), card('h', 4)); // High card only (no straight possible)
            const pair = createHand(card('s', 10), card('h', 10)); // Pair of 10s (using hole cards)

            // Verify both hands are evaluated correctly first
            const highCardValue = evaluator1.evaluateHandNumberValue(highCard);
            const pairValue = evaluator1.evaluateHandNumberValue(pair);

            // Pair should have value >= 1, high card should have value < 1
            expect(pairValue).toBeGreaterThanOrEqual(1);
            expect(highCardValue).toBeLessThan(1);
            expect(pairValue).toBeGreaterThan(highCardValue);

            expect(evaluator1.returnBestHand(pair, highCard)).toBe(pair);

            // Test two pair beats pair - board has pair of 2s, one hand adds another pair
            const board2 = [card('s', 2), card('h', 2), card('d', 4), card('c', 6), card('s', 8)];
            const evaluator2 = new handEvaluator(board2);
            const pair2 = createHand(card('s', 3), card('h', 5)); // Pair of 2s (using board's pair)
            const twoPair = createHand(card('s', 4), card('h', 4)); // Two pair: 2s and 4s
            expect(evaluator2.returnBestHand(twoPair, pair2)).toBe(twoPair);

            // Test trips beats two pair - board has pair of 2s, one hand makes trips
            const board3 = [card('s', 2), card('h', 2), card('d', 4), card('c', 4), card('s', 6)];
            const evaluator3 = new handEvaluator(board3);
            const twoPair2 = createHand(card('s', 3), card('h', 5)); // Two pair: 2s and 4s
            const trips = createHand(card('s', 2), card('h', 3)); // Trips: 2s (using board's pair + hole card)
            expect(evaluator3.returnBestHand(trips, twoPair2)).toBe(trips);
        });
    });

    describe('Edge Cases', () => {
        test('should handle empty board', () => {
            const evaluator = new handEvaluator([]);
            const hand = createHand(card('s', 14), card('h', 13));
            const result = evaluator.evaluateHandForString(hand);
            expect(result).toBeDefined();
        });

        test('should handle flop (3 cards)', () => {
            const board = [card('s', 2), card('h', 4), card('d', 6)];
            const evaluator = new handEvaluator(board);
            const hand = createHand(card('s', 2), card('h', 3)); // Pair of 2s
            const handValue = evaluator.evaluateHandNumberValue(hand);
            expect(handValue).toBeGreaterThanOrEqual(1);
            expect(handValue).toBeLessThan(2);
        });

        test('should handle turn (4 cards)', () => {
            const board = [card('s', 2), card('h', 4), card('d', 6), card('c', 8)];
            const evaluator = new handEvaluator(board);
            const hand = createHand(card('s', 2), card('h', 3)); // Pair of 2s
            const handValue = evaluator.evaluateHandNumberValue(hand);
            expect(handValue).toBeGreaterThanOrEqual(1);
            expect(handValue).toBeLessThan(2);
        });

        test('should handle river (5 cards)', () => {
            const board = [card('s', 2), card('h', 4), card('d', 6), card('c', 8), card('s', 10)];
            const evaluator = new handEvaluator(board);
            const hand = createHand(card('s', 2), card('h', 3)); // Pair of 2s
            const handValue = evaluator.evaluateHandNumberValue(hand);
            expect(handValue).toBeGreaterThanOrEqual(1);
            expect(handValue).toBeLessThan(2);
        });

        test('should handle duplicate cards in hand and board', () => {
            const board = [card('s', 2), card('h', 2), card('d', 2), card('c', 4), card('s', 10)];
            const evaluator = new handEvaluator(board);
            const hand = createHand(card('s', 2), card('h', 3)); // Four of a kind: 2s
            const handValue = evaluator.evaluateHandNumberValue(hand);
            expect(handValue).toBeGreaterThanOrEqual(7);
            expect(handValue).toBeLessThan(8);
        });

        test('should handle straight with duplicate ranks', () => {
            const board = [card('s', 2), card('h', 2), card('d', 3), card('c', 4), card('s', 5)];
            const evaluator = new handEvaluator(board);
            const hand = createHand(card('s', 6), card('h', 7)); // Straight: 2-6 (skipping duplicate 2)
            const handValue = evaluator.evaluateHandNumberValue(hand);
            expect(handValue).toBeGreaterThanOrEqual(4);
            expect(handValue).toBeLessThan(5);
        });
    });

    describe('Helper Functions', () => {
        test('currentNumCardsOnBoard should return correct count', () => {
            const board = [card('s', 2), card('h', 4), card('d', 6)];
            const evaluator = new handEvaluator(board);
            expect(evaluator.currentNumCardsOnBoard()).toBe(3);
        });

        test('currentNumCardsOnBoard should return 0 for empty board', () => {
            const evaluator = new handEvaluator([]);
            expect(evaluator.currentNumCardsOnBoard()).toBe(0);
        });

        test('currentNumCardsOnBoard should return 0 for null board', () => {
            const evaluator = new handEvaluator(null);
            expect(evaluator.currentNumCardsOnBoard()).toBe(0);
        });

        test('getCurrentBoard should return the board', () => {
            const board = [card('s', 2), card('h', 4), card('d', 6)];
            const evaluator = new handEvaluator(board);
            expect(evaluator.getCurrentBoard()).toBe(board);
        });
    });
});

