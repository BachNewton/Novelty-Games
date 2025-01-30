import { getRandomElement, removeRandomElement } from "../../../util/Randomizer";
import { createPiece, PieceType, PlayerColor, Treasure } from "../data/Piece";
import { State } from "../ui/Game";

const CORNER_PIECES_IN_PILE = 9;
const STRAIGHT_PIECES_IN_PILE = 13;

export function createStartingState(): State {
    const startingRed = createPiece(PieceType.CORNER, -Math.PI / 2);
    startingRed.startingColor = PlayerColor.RED;

    const startingBlue = createPiece(PieceType.CORNER, Math.PI);
    startingBlue.startingColor = PlayerColor.BLUE;

    const startingYellow = createPiece(PieceType.CORNER, 0);
    startingYellow.startingColor = PlayerColor.YELLOW;

    const startingGreen = createPiece(PieceType.CORNER, Math.PI / 2);
    startingGreen.startingColor = PlayerColor.GREEN;

    const trophyTreasure = createPiece(PieceType.T, Math.PI, Treasure.TROPHY);
    const daggerTreasure = createPiece(PieceType.T, Math.PI, Treasure.DAGGER);
    const moneyBagTreasure = createPiece(PieceType.T, -Math.PI / 2, Treasure.MONEY_BAG);
    const keyTreasure = createPiece(PieceType.T, -Math.PI / 2, Treasure.KEY);
    const gemTreasure = createPiece(PieceType.T, Math.PI, Treasure.GEM);
    const shieldTreasure = createPiece(PieceType.T, Math.PI / 2, Treasure.SHIELD);
    const bookTreasure = createPiece(PieceType.T, -Math.PI / 2, Treasure.BOOK);
    const crownTreasure = createPiece(PieceType.T, 0, Treasure.CROWN);
    const toolboxTreasure = createPiece(PieceType.T, Math.PI / 2, Treasure.TOOLBOX);
    const candleTreasure = createPiece(PieceType.T, Math.PI / 2, Treasure.CANDLE);
    const bottleTreasure = createPiece(PieceType.T, 0, Treasure.BOTTLE);
    const ringTreasure = createPiece(PieceType.T, 0, Treasure.RING);

    const rotations = [0, Math.PI / 2, Math.PI, -Math.PI / 2];

    const pile = [
        createPiece(PieceType.T, getRandomElement(rotations), Treasure.MAGE),
        createPiece(PieceType.T, getRandomElement(rotations), Treasure.BAT),
        createPiece(PieceType.T, getRandomElement(rotations), Treasure.TROLL),
        createPiece(PieceType.T, getRandomElement(rotations), Treasure.DRAGON),
        createPiece(PieceType.T, getRandomElement(rotations), Treasure.GHOST),
        createPiece(PieceType.T, getRandomElement(rotations), Treasure.UNICORN),
        createPiece(PieceType.CORNER, getRandomElement(rotations), Treasure.OWL),
        createPiece(PieceType.CORNER, getRandomElement(rotations), Treasure.CAT),
        createPiece(PieceType.CORNER, getRandomElement(rotations), Treasure.BUTTERFLY),
        createPiece(PieceType.CORNER, getRandomElement(rotations), Treasure.MOUSE),
        createPiece(PieceType.CORNER, getRandomElement(rotations), Treasure.LIZARD),
        createPiece(PieceType.CORNER, getRandomElement(rotations), Treasure.SPIDER)
    ];

    for (let i = 0; i < CORNER_PIECES_IN_PILE; i++) {
        pile.push(createPiece(PieceType.CORNER, getRandomElement(rotations)));
    }

    for (let i = 0; i < STRAIGHT_PIECES_IN_PILE; i++) {
        pile.push(createPiece(PieceType.STRAIGHT, getRandomElement(rotations)));
    }

    return {
        pieces: [
            [startingRed, removeRandomElement(pile), trophyTreasure, removeRandomElement(pile), daggerTreasure, removeRandomElement(pile), startingBlue],
            [removeRandomElement(pile), removeRandomElement(pile), removeRandomElement(pile), removeRandomElement(pile), removeRandomElement(pile), removeRandomElement(pile), removeRandomElement(pile)],
            [moneyBagTreasure, removeRandomElement(pile), keyTreasure, removeRandomElement(pile), gemTreasure, removeRandomElement(pile), shieldTreasure],
            [removeRandomElement(pile), removeRandomElement(pile), removeRandomElement(pile), removeRandomElement(pile), removeRandomElement(pile), removeRandomElement(pile), removeRandomElement(pile)],
            [bookTreasure, removeRandomElement(pile), crownTreasure, removeRandomElement(pile), toolboxTreasure, removeRandomElement(pile), candleTreasure],
            [removeRandomElement(pile), removeRandomElement(pile), removeRandomElement(pile), removeRandomElement(pile), removeRandomElement(pile), removeRandomElement(pile), removeRandomElement(pile)],
            [startingYellow, removeRandomElement(pile), bottleTreasure, removeRandomElement(pile), ringTreasure, removeRandomElement(pile), startingGreen]
        ],
        sparePiece: {
            piece: removeRandomElement(pile),
            position: { x: 0, y: 0 }
        }
    };
}
