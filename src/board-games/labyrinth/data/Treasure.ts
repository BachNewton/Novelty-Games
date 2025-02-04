import TrophyImage from '../images/treasures/trophy.png';
import DaggerImage from '../images/treasures/dagger.png';
import MoneyBagImage from '../images/treasures/money-bag.png';
import BookImage from '../images/treasures/book.png';
import BottleImage from '../images/treasures/bottle.png';
import CandleImage from '../images/treasures/candle.png';
import CrownImage from '../images/treasures/crown.png';
import GemImage from '../images/treasures/gem.png';
import KeyImage from '../images/treasures/key.png';
import RingImage from '../images/treasures/ring.png';
import ShieldImage from '../images/treasures/shield.png';
import ToolboxImage from '../images/treasures/toolbox.png';
import BatImage from '../images/treasures/bat.png';
import ButterflyImage from '../images/treasures/butterfly.png';
import CatImage from '../images/treasures/cat.png';
import DragonImage from '../images/treasures/dragon.png';
import GhostImage from '../images/treasures/ghost.png';
import LizardImage from '../images/treasures/lizard.png';
import MageImage from '../images/treasures/mage.png';
import MouseImage from '../images/treasures/mouse.png';
import OwlImage from '../images/treasures/owl.png';
import SpiderImage from '../images/treasures/spider.png';
import TrollImage from '../images/treasures/troll.png';
import UnicornImage from '../images/treasures/unicorn.png';

export const TOTAL_TREASURE = 24;

export enum Treasure {
    TROPHY,
    DAGGER,
    MONEY_BAG,
    BOOK,
    BOTTLE,
    CANDLE,
    CROWN,
    GEM,
    KEY,
    RING,
    SHIELD,
    TOOLBOX,
    BAT,
    BUTTERFLY,
    CAT,
    DRAGON,
    GHOST,
    LIZARD,
    MAGE,
    MOUSE,
    OWL,
    SPIDER,
    TROLL,
    UNICORN
}

export function getTreasureImage(treasure: Treasure): string {
    switch (treasure) {
        case Treasure.TROPHY:
            return TrophyImage;
        case Treasure.DAGGER:
            return DaggerImage;
        case Treasure.MONEY_BAG:
            return MoneyBagImage;
        case Treasure.BOOK:
            return BookImage;
        case Treasure.BOTTLE:
            return BottleImage;
        case Treasure.CANDLE:
            return CandleImage;
        case Treasure.CROWN:
            return CrownImage;
        case Treasure.GEM:
            return GemImage;
        case Treasure.KEY:
            return KeyImage;
        case Treasure.RING:
            return RingImage;
        case Treasure.SHIELD:
            return ShieldImage;
        case Treasure.TOOLBOX:
            return ToolboxImage;
        case Treasure.BAT:
            return BatImage;
        case Treasure.BUTTERFLY:
            return ButterflyImage;
        case Treasure.CAT:
            return CatImage;
        case Treasure.DRAGON:
            return DragonImage;
        case Treasure.GHOST:
            return GhostImage;
        case Treasure.LIZARD:
            return LizardImage;
        case Treasure.MAGE:
            return MageImage;
        case Treasure.MOUSE:
            return MouseImage;
        case Treasure.OWL:
            return OwlImage;
        case Treasure.SPIDER:
            return SpiderImage;
        case Treasure.TROLL:
            return TrollImage;
        case Treasure.UNICORN:
            return UnicornImage;
    }
}
