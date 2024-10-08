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

export class HazardCard implements BattleCard {
    image: string;

    constructor(image: string) {
        this.image = image;
    }
}

export class RemedyCard implements BattleCard {
    image: string;

    constructor(image: string) {
        this.image = image;
    }
}

export interface SpeedCard extends Card {
    limit: number;
}

export class SafetyCard implements Card {
    image: string;
    coupFourré: boolean;

    constructor(image: string) {
        this.image = image;
        this.coupFourré = false;
    }
}

export class DistanceCard implements Card {
    image: string;
    amount: number;

    constructor(image: string, amount: number) {
        this.image = image;
        this.amount = amount;
    }
}

export class CrashCard extends HazardCard {
    constructor() {
        super(MB_CRASH);
    }
}

export class EmptyCard extends HazardCard {
    constructor() {
        super(MB_EMPTY);
    }
}

export class FlatCard extends HazardCard {
    constructor() {
        super(MB_FLAT);
    }
}

export class StopCard extends HazardCard {
    constructor() {
        super(MB_STOP);
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

export class Distance25Card extends DistanceCard {
    constructor() {
        super(MB_25, 25);
    }
}

export class Distance50Card extends DistanceCard {
    constructor() {
        super(MB_50, 50);
    }
}

export class Distance75Card extends DistanceCard {
    constructor() {
        super(MB_75, 75);
    }
}

export class Distance100Card extends DistanceCard {
    constructor() {
        super(MB_100, 100);
    }
}

export class Distance200Card extends DistanceCard {
    constructor() {
        super(MB_200, 200);
    }
}

export class AceCard extends SafetyCard {
    constructor() {
        super(MB_ACE);
    }
}

export class EmergencyCard extends SafetyCard {
    constructor() {
        super(MB_EMERGENCY);
    }
}

export class SealantCard extends SafetyCard {
    constructor() {
        super(MB_SEALANT);
    }
}

export class TankerCard extends SafetyCard {
    constructor() {
        super(MB_TANKER);
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
