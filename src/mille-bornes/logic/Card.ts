import MB_25 from '../images/MB-25.svg';
import MB_50 from '../images/MB-50.svg';
import MB_75 from '../images/MB-75.svg';
import MB_100 from '../images/MB-100.svg';
import MB_200 from '../images/MB-200.svg';
import MB_ROLL from '../images/MB-roll.svg';
import MB_STOP from '../images/MB-stop.svg';
import MB_ACE from '../images/MB-ace.svg';
import MB_EMERGENCY from '../images/MB-emergency.svg';
import MB_SEALANT from '../images/MB-sealant.svg';
import MB_TANKER from '../images/MB-tanker.svg';
import MB_UNLIMITED from '../images/MB-unlimited.svg';
import MB_LIMIT from '../images/MB-limit.svg';
import MB_CRASH from '../images/MB-crash.svg';
import MB_EMPTY from '../images/MB-empty.svg';
import MB_FLAT from '../images/MB-flat.svg';
import MB_GAS from '../images/MB-gas.svg';
import MB_REPAIR from '../images/MB-repair.svg';
import MB_SPARE from '../images/MB-spare.svg';

export interface Card {
    image: string;
}

export interface BattleCard extends Card { }
export interface HazardCard extends BattleCard { }

export class RemedyCard implements BattleCard {
    image: string;

    constructor(image: string) {
        this.image = image;
    }
}

export interface SpeedCard extends Card {
    limit: number;
}
export interface SafetyCard extends Card {
    coupFourré: boolean;
}
export interface DistanceCard extends Card {
    amount: number;
}

export class CrashCard implements HazardCard {
    image: string;

    constructor() {
        this.image = MB_CRASH;
    }
}

export class EmptyCard implements HazardCard {
    image: string;

    constructor() {
        this.image = MB_EMPTY;
    }
}

export class FlatCard implements HazardCard {
    image: string;

    constructor() {
        this.image = MB_FLAT;
    }
}

export class GasCard extends RemedyCard {
    constructor() {
        super(MB_GAS);
    }
}

export class RepairCard extends RemedyCard {
    constructor() {
        super(MB_REPAIR);
    }
}

export class SpareCard extends RemedyCard {
    constructor() {
        super(MB_SPARE);
    }
}

export class RollCard extends RemedyCard {
    constructor() {
        super(MB_ROLL);
    }
}

export class StopCard implements HazardCard {
    image: string;

    constructor() {
        this.image = MB_STOP;
    }
}

export class Distance25Card implements DistanceCard {
    image: string;
    amount: number;

    constructor() {
        this.image = MB_25;
        this.amount = 25;
    }
}

export class Distance50Card implements DistanceCard {
    image: string;
    amount: number;

    constructor() {
        this.image = MB_50;
        this.amount = 50;
    }
}

export class Distance75Card implements DistanceCard {
    image: string;
    amount: number;

    constructor() {
        this.image = MB_75;
        this.amount = 75;
    }
}

export class Distance100Card implements DistanceCard {
    image: string;
    amount: number;

    constructor() {
        this.image = MB_100;
        this.amount = 100;
    }
}

export class Distance200Card implements DistanceCard {
    image: string;
    amount: number;

    constructor() {
        this.image = MB_200;
        this.amount = 200;
    }
}

export class AceCard implements SafetyCard {
    image: string;
    coupFourré: boolean;

    constructor() {
        this.image = MB_ACE;
        this.coupFourré = false;
    }
}

export class EmergencyCard implements SafetyCard {
    image: string;
    coupFourré: boolean;

    constructor() {
        this.image = MB_EMERGENCY;
        this.coupFourré = false;
    }
}

export class SealantCard implements SafetyCard {
    image: string;
    coupFourré: boolean;

    constructor() {
        this.image = MB_SEALANT;
        this.coupFourré = false;
    }
}

export class TankerCard implements SafetyCard {
    image: string;
    coupFourré: boolean;

    constructor() {
        this.image = MB_TANKER;
        this.coupFourré = false;
    }
}

export class UnlimitedCard implements SpeedCard {
    image: string;
    limit: number;

    constructor() {
        this.image = MB_UNLIMITED;
        this.limit = 200;
    }
}

export class LimitCard implements SpeedCard {
    image: string;
    limit: number;

    constructor() {
        this.image = MB_LIMIT;
        this.limit = 50;
    }
}

export function createCard(image: string): Card {
    switch (image) {
        case MB_CRASH:
            return new CrashCard();
        case MB_EMPTY:
            return new EmptyCard();
        case MB_FLAT:
            return new FlatCard();
        case MB_GAS:
            return new GasCard();
        case MB_REPAIR:
            return new RepairCard();
        case MB_SPARE:
            return new SpareCard();
        case MB_ROLL:
            return new RollCard();
        case MB_STOP:
            return new StopCard();
        case MB_25:
            return new Distance25Card();
        case MB_50:
            return new Distance50Card();
        case MB_75:
            return new Distance75Card();
        case MB_100:
            return new Distance100Card();
        case MB_200:
            return new Distance200Card();
        case MB_ACE:
            return new AceCard();
        case MB_EMERGENCY:
            return new EmergencyCard();
        case MB_SEALANT:
            return new SealantCard();
        case MB_TANKER:
            return new TankerCard();
        case MB_UNLIMITED:
            return new UnlimitedCard();
        case MB_LIMIT:
            return new LimitCard();
        default:
            throw new Error('Image not supported: ' + image);
    }
}
