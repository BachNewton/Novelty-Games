import MB_25 from '../images/MB-25.svg';
import MB_50 from '../images/MB-50.svg';
import MB_75 from '../images/MB-75.svg';
import MB_100 from '../images/MB-100.svg';
import MB_200 from '../images/MB-200.svg';
import MB_ROLL from '../images/MB-roll.svg';
import { Card, CardType } from './Data';
import { shuffleArray } from '../../util/Randomizer';
import { Game } from '../logic/Data';

export function startGame(): Game {
    const deck = shuffleArray(createDeck());
    const hand = deck.splice(0, 6);

    return { deck: deck, hand: hand };
}

function createDeck(): Array<Card> {
    const deck: Array<Card> = [];

    const distance25: Card = { type: CardType.DISTANCE, image: MB_25 };
    const distance50: Card = { type: CardType.DISTANCE, image: MB_50 };
    const distance75: Card = { type: CardType.DISTANCE, image: MB_75 };
    const distance100: Card = { type: CardType.DISTANCE, image: MB_100 };
    const distance200: Card = { type: CardType.DISTANCE, image: MB_200 };

    const roll: Card = { type: CardType.REMEDIES, image: MB_ROLL };

    const distance25s: Array<Card> = new Array(10).fill(distance25);
    const distance50s = new Array(10).fill(distance50);
    const distance75s = new Array(10).fill(distance75);
    const distance100s = new Array(12).fill(distance100);
    const distance200s = new Array(4).fill(distance200);

    const rolls = new Array(14).fill(roll);

    return deck.concat(distance25s, distance50s, distance75s, distance100s, distance200s, rolls);
}
