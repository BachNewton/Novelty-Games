import { getRandomElement, removeRandomElement, removeRandomElements } from "../../../util/Randomizer";
import { createPiece, PieceType } from "../data/Piece";
import { Player, PlayerColor, PlayerPosition } from "../data/Player";
import { TOTAL_TREASURE, Treasure } from "../data/Treasure";
import { State } from "../ui/Game";

const CORNER_PIECES_IN_PILE = 9;
const STRAIGHT_PIECES_IN_PILE = 13;

export function createStartingState(players: Player[]): State {
    const treasurePile: Treasure[] = Array.from({ length: TOTAL_TREASURE }, (_, index) => index);

    setupPlayers(players, treasurePile);

    const startingRed = createPiece(PieceType.CORNER, -Math.PI / 2);

    const startingBlue = createPiece(PieceType.CORNER, Math.PI);

    const startingYellow = createPiece(PieceType.CORNER, 0);

    const startingGreen = createPiece(PieceType.CORNER, Math.PI / 2);

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
        },
        players: players,
        currentPlayerIndex: 0
    };
}

function setupPlayers(players: Player[], treasurePile: Treasure[]) {
    const treasurePileLength = treasurePile.length;

    for (const player of players) {
        player.position = getPlayerStartingPosition(player);
        player.treasurePile = removeRandomElements(treasurePile, treasurePileLength / players.length);
    }
}

function getPlayerStartingPosition(player: Player): PlayerPosition {
    switch (player.color) {
        case PlayerColor.RED:
            return { x: 0, y: 0 };
        case PlayerColor.BLUE:
            return { x: 6, y: 0 };
        case PlayerColor.YELLOW:
            return { x: 0, y: 6 };
        case PlayerColor.GREEN:
            return { x: 6, y: 6 };
    }
}
