import Card from './card.js';

/**
 * handEvaluator - Evaluates and compares poker hands
 * 
 * Uses a robust ranking system where each hand is represented as:
 * [handRank, ...tiebreakers]
 * - handRank: 0-8 (High Card, Pair, Two Pair, Trips, Straight, Flush, Full House, Quads, Straight Flush)
 * - tiebreakers: Array of card values used to break ties
 * 
 * This allows for clean lexicographic comparison.
 */
class handEvaluator {
    constructor(communityCards) {
        this.communityCards = communityCards || [];
    }

    /**
     * Evaluates a hand and returns a numeric value for comparison
     * @param {playerHand} hand - The player's hand (hole cards)
     * @returns {number|null} - Numeric value representing hand strength, or null if invalid
     */
    evaluateHandNumberValue(hand) {
        const allCards = this._getAllCards(hand);
        if (allCards.length < 2) {
            return null;
        }

        // Get the best 5-card hand
        const bestHand = this._getBestFiveCardHand(allCards);
        if (!bestHand) {
            return null;
        }

        // Convert to numeric value for backward compatibility
        return this._handRankToNumber(bestHand);
    }

    /**
     * Returns the better hand between two hands
     * @param {playerHand} hand1 - First hand
     * @param {playerHand} hand2 - Second hand
     * @returns {playerHand|null} - The better hand, or null if they're equal
     */
    returnBestHand(hand1, hand2) {
        const rank1 = this._evaluateHand(hand1);
        const rank2 = this._evaluateHand(hand2);

        if (!rank1 && !rank2) return null;
        if (!rank1) return hand2;
        if (!rank2) return hand1;

        const comparison = this._compareHandRanks(rank1, rank2);
        if (comparison > 0) return hand1;
        if (comparison < 0) return hand2;
        return null; // Equal hands
    }

    /**
     * Returns a string description of the hand
     * @param {playerHand} hand - The player's hand
     * @returns {string} - String description of the hand
     */
    evaluateHandForString(hand) {
        // Preflop (no community cards)
        if (this.communityCards.length === 0) {
            return this._preflopString(hand);
        }

        const rank = this._evaluateHand(hand);
        if (!rank) {
            return "Invalid Hand";
        }

        return this._rankToString(rank);
    }

    /**
     * Gets the current number of cards on the board
     * @returns {number}
     */
    currentNumCardsOnBoard() {
        return this.communityCards ? this.communityCards.length : 0;
    }

    /**
     * Gets the current board
     * @returns {Array<Card>}
     */
    getCurrentBoard() {
        return this.communityCards;
    }

    /**
     * Updates the board with new community cards
     * @param {Array<Card>} newBoard - New community cards
     */
    updateBoard(newBoard) {
        this.communityCards = newBoard || [];
    }

    // ========== Private Methods ==========

    /**
     * Gets all cards (community + hole cards)
     * @private
     */
    _getAllCards(hand) {
        const cards = [...this.communityCards];
        if (hand) {
            cards.push(hand.getHoleCard1());
            cards.push(hand.getHoleCard2());
        }
        return cards;
    }

    /**
     * Evaluates a hand and returns its rank
     * @private
     */
    _evaluateHand(hand) {
        const allCards = this._getAllCards(hand);
        if (allCards.length < 2) {
            return null;
        }
        return this._getBestFiveCardHand(allCards);
    }

    /**
     * Finds the best 5-card hand from 2-7 cards
     * @private
     */
    _getBestFiveCardHand(cards) {
        // Need at least 5 cards to make a hand (or 2 for preflop)
        if (cards.length < 2) return null;
        if (cards.length < 5) {
            // Preflop - just return high card or pair
            return this._evaluatePreflop(cards);
        }

        // Try all combinations of 5 cards from the available cards
        const combinations = this._getCombinations(cards, 5);
        let bestRank = null;

        for (const combo of combinations) {
            const rank = this._evaluateFiveCards(combo);
            if (!bestRank || this._compareHandRanks(rank, bestRank) > 0) {
                bestRank = rank;
            }
        }

        return bestRank;
    }

    /**
     * Evaluates preflop (2 cards only)
     * @private
     */
    _evaluatePreflop(cards) {
        if (cards.length !== 2) return null;
        const [card1, card2] = cards.sort((a, b) => b.getNumber() - a.getNumber());

        if (card1.getNumber() === card2.getNumber()) {
            // Pair
            return [1, card1.getNumber()];
        } else {
            // High card
            return [0, card1.getNumber(), card2.getNumber()];
        }
    }

    /**
     * Evaluates exactly 5 cards
     * @private
     */
    _evaluateFiveCards(cards) {
        // Sort cards by rank (descending)
        const sorted = [...cards].sort((a, b) => b.getNumber() - a.getNumber());
        const ranks = sorted.map(c => c.getNumber());
        const suits = sorted.map(c => c.getSuit());

        // Check for straight flush first (includes royal flush)
        const straightFlush = this._checkStraightFlush(sorted);
        if (straightFlush) return straightFlush;

        // Check for four of a kind
        const quads = this._checkFourOfAKind(ranks);
        if (quads) return quads;

        // Check for full house
        const fullHouse = this._checkFullHouse(ranks);
        if (fullHouse) return fullHouse;

        // Check for flush
        const flush = this._checkFlush(sorted, suits);
        if (flush) return flush;

        // Check for straight
        const straight = this._checkStraight(ranks);
        if (straight) return straight;

        // Check for three of a kind
        const trips = this._checkThreeOfAKind(ranks);
        if (trips) return trips;

        // Check for two pair
        const twoPair = this._checkTwoPair(ranks);
        if (twoPair) return twoPair;

        // Check for pair
        const pair = this._checkPair(ranks);
        if (pair) return pair;

        // High card
        return [0, ...ranks];
    }

    /**
     * Checks for straight flush
     * @private
     */
    _checkStraightFlush(cards) {
        // Group by suit
        const suitGroups = {};
        for (const card of cards) {
            const suit = card.getSuit();
            if (!suitGroups[suit]) {
                suitGroups[suit] = [];
            }
            suitGroups[suit].push(card);
        }

        // Check each suit group for a straight
        for (const suit in suitGroups) {
            const suitCards = suitGroups[suit];
            if (suitCards.length >= 5) {
                // Sort by rank
                suitCards.sort((a, b) => a.getNumber() - b.getNumber());
                const straight = this._checkStraightInCards(suitCards);
                if (straight) {
                    return [8, straight]; // Straight flush rank 8
                }
            }
        }

        return null;
    }

    /**
     * Checks for straight in a set of cards (handles wheel A-2-3-4-5)
     * Returns the highest straight found, or null if none
     * @private
     */
    _checkStraightInCards(cards) {
        const ranks = cards.map(c => c.getNumber());
        const uniqueRanks = [...new Set(ranks)].sort((a, b) => a - b);

        let highestStraight = null;

        // Check for wheel (A-2-3-4-5) - Ace can be low
        if (uniqueRanks.includes(14) && uniqueRanks.includes(2) &&
            uniqueRanks.includes(3) && uniqueRanks.includes(4) && uniqueRanks.includes(5)) {
            highestStraight = 5; // Wheel high card is 5
        }

        // Check for regular straight (need at least 5 unique ranks)
        if (uniqueRanks.length >= 5) {
            // Check all possible 5-card sequences, starting from the highest
            for (let i = uniqueRanks.length - 5; i >= 0; i--) {
                let consecutive = true;
                for (let j = 1; j < 5; j++) {
                    if (uniqueRanks[i + j] !== uniqueRanks[i] + j) {
                        consecutive = false;
                        break;
                    }
                }
                if (consecutive) {
                    const highCard = uniqueRanks[i + 4];
                    if (!highestStraight || highCard > highestStraight) {
                        highestStraight = highCard;
                    }
                    break; // Found highest straight, no need to check lower ones
                }
            }
        }

        // Also check for A-high straight (10-J-Q-K-A) - this is the highest
        if (uniqueRanks.includes(10) && uniqueRanks.includes(11) &&
            uniqueRanks.includes(12) && uniqueRanks.includes(13) && uniqueRanks.includes(14)) {
            return 14; // Ace high straight (royal flush)
        }

        return highestStraight;
    }

    /**
     * Checks for four of a kind
     * @private
     */
    _checkFourOfAKind(ranks) {
        const counts = this._countRanks(ranks);
        for (const rank in counts) {
            if (counts[rank] === 4) {
                const quadRank = parseInt(rank);
                const kicker = ranks.find(r => r !== quadRank);
                return [7, quadRank, kicker];
            }
        }
        return null;
    }

    /**
     * Checks for full house
     * @private
     */
    _checkFullHouse(ranks) {
        const counts = this._countRanks(ranks);
        let tripsRank = null;
        let pairRank = null;

        for (const rank in counts) {
            const num = parseInt(rank);
            if (counts[rank] === 3) {
                if (!tripsRank || num > tripsRank) {
                    tripsRank = num;
                }
            } else if (counts[rank] === 2) {
                if (!pairRank || num > pairRank) {
                    pairRank = num;
                }
            }
        }

        if (tripsRank && pairRank) {
            return [6, tripsRank, pairRank];
        }
        return null;
    }

    /**
     * Checks for flush
     * @private
     */
    _checkFlush(cards, suits) {
        const suitCounts = {};
        for (const suit of suits) {
            suitCounts[suit] = (suitCounts[suit] || 0) + 1;
        }

        for (const suit in suitCounts) {
            if (suitCounts[suit] >= 5) {
                const flushCards = cards.filter(c => c.getSuit() === suit)
                    .sort((a, b) => b.getNumber() - a.getNumber())
                    .slice(0, 5);
                return [5, ...flushCards.map(c => c.getNumber())];
            }
        }
        return null;
    }

    /**
     * Checks for straight
     * @private
     */
    _checkStraight(ranks) {
        const highCard = this._checkStraightInCards(
            ranks.map(r => ({ getNumber: () => r, getSuit: () => 's' }))
        );
        if (highCard) {
            return [4, highCard];
        }
        return null;
    }

    /**
     * Checks for three of a kind
     * @private
     */
    _checkThreeOfAKind(ranks) {
        const counts = this._countRanks(ranks);
        let tripsRank = null;

        for (const rank in counts) {
            if (counts[rank] === 3) {
                const num = parseInt(rank);
                if (!tripsRank || num > tripsRank) {
                    tripsRank = num;
                }
            }
        }

        if (tripsRank) {
            const kickers = ranks.filter(r => r !== tripsRank)
                .sort((a, b) => b - a)
                .slice(0, 2);
            return [3, tripsRank, ...kickers];
        }
        return null;
    }

    /**
     * Checks for two pair
     * @private
     */
    _checkTwoPair(ranks) {
        const counts = this._countRanks(ranks);
        const pairs = [];

        for (const rank in counts) {
            if (counts[rank] === 2) {
                pairs.push(parseInt(rank));
            }
        }

        if (pairs.length >= 2) {
            pairs.sort((a, b) => b - a);
            const highPair = pairs[0];
            const lowPair = pairs[1];
            const kicker = ranks.find(r => r !== highPair && r !== lowPair);
            return [2, highPair, lowPair, kicker];
        }
        return null;
    }

    /**
     * Checks for pair
     * @private
     */
    _checkPair(ranks) {
        const counts = this._countRanks(ranks);
        let pairRank = null;

        for (const rank in counts) {
            if (counts[rank] === 2) {
                const num = parseInt(rank);
                if (!pairRank || num > pairRank) {
                    pairRank = num;
                }
            }
        }

        if (pairRank) {
            const kickers = ranks.filter(r => r !== pairRank)
                .sort((a, b) => b - a)
                .slice(0, 3);
            return [1, pairRank, ...kickers];
        }
        return null;
    }

    /**
     * Counts occurrences of each rank
     * @private
     */
    _countRanks(ranks) {
        const counts = {};
        for (const rank of ranks) {
            counts[rank] = (counts[rank] || 0) + 1;
        }
        return counts;
    }

    /**
     * Generates all combinations of k elements from array
     * @private
     */
    _getCombinations(arr, k) {
        if (k === 0) return [[]];
        if (k > arr.length) return [];
        if (k === arr.length) return [arr];

        const combinations = [];

        function combine(start, combo) {
            if (combo.length === k) {
                combinations.push([...combo]);
                return;
            }
            for (let i = start; i < arr.length; i++) {
                combo.push(arr[i]);
                combine(i + 1, combo);
                combo.pop();
            }
        }

        combine(0, []);
        return combinations;
    }

    /**
     * Compares two hand ranks lexicographically
     * @private
     */
    _compareHandRanks(rank1, rank2) {
        for (let i = 0; i < Math.max(rank1.length, rank2.length); i++) {
            const val1 = rank1[i] || 0;
            const val2 = rank2[i] || 0;
            if (val1 > val2) return 1;
            if (val1 < val2) return -1;
        }
        return 0;
    }

    /**
     * Converts hand rank array to numeric value for backward compatibility
     * @private
     */
    _handRankToNumber(rank) {
        if (!rank || rank.length === 0) return null;

        const handType = rank[0];
        let value = handType;

        // Add tiebreakers as decimal places
        const multipliers = [0.01, 0.0001, 0.000001, 0.00000001, 0.0000000001];
        for (let i = 1; i < rank.length && i <= multipliers.length; i++) {
            value += rank[i] * multipliers[i - 1];
        }

        return value;
    }

    /**
     * Converts hand rank to string description
     * @private
     */
    _rankToString(rank) {
        if (!rank || rank.length === 0) return "Invalid Hand";

        const handType = rank[0];
        const values = rank.slice(1);

        switch (handType) {
            case 8: // Straight Flush
                const high = values[0];
                if (high === 14) {
                    return "Royal Flush";
                }
                const low = high === 5 ? 1 : high - 4; // Handle wheel
                return `Straight Flush: ${Card.numberToString(high)} to ${Card.numberToString(low)}`;

            case 7: // Four of a Kind
                return `Four of a Kind: ${Card.numberToString(values[0])}'s, ${Card.numberToString(values[1])} high`;

            case 6: // Full House
                return `Full House: ${Card.numberToString(values[0])}'s full of ${Card.numberToString(values[1])}'s`;

            case 5: // Flush
                const flushCards = values.map(v => Card.numberToString(v)).join(", ");
                return `Flush: ${flushCards}`;

            case 4: // Straight
                const straightHigh = values[0];
                const straightLow = straightHigh === 5 ? 1 : straightHigh - 4;
                return `Straight: ${Card.numberToString(straightHigh)} to ${Card.numberToString(straightLow)}`;

            case 3: // Three of a Kind
                return `Three of a Kind: ${Card.numberToString(values[0])}'s, ${Card.numberToString(values[1])}, ${Card.numberToString(values[2])} high`;

            case 2: // Two Pair
                return `Two Pair: ${Card.numberToString(values[0])}'s & ${Card.numberToString(values[1])}'s, ${Card.numberToString(values[2])} high`;

            case 1: // Pair
                return `Pair of: ${Card.numberToString(values[0])}'s, ${Card.numberToString(values[1])}, ${Card.numberToString(values[2])}, ${Card.numberToString(values[3])} high`;

            case 0: // High Card
                const highCards = values.map(v => Card.numberToString(v)).join(", ");
                return `High Card: ${highCards}`;

            default:
                return "Invalid Hand";
        }
    }

    /**
     * Returns preflop string description
     * @private
     */
    _preflopString(hand) {
        const card1 = hand.getHoleCard1();
        const card2 = hand.getHoleCard2();
        const num1 = card1.getNumber();
        const num2 = card2.getNumber();

        if (num1 === num2) {
            return `Pair of: ${Card.numberToString(num1)}'s`;
        } else {
            const high = num1 > num2 ? card1 : card2;
            const low = num1 > num2 ? card2 : card1;
            return `High Card: ${high.cardToString()}, ${low.cardToString()}`;
        }
    }
}

export default handEvaluator;
