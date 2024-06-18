import MB_25 from '../images/MB-25.svg';
import MB_50 from '../images/MB-50.svg';
import MB_75 from '../images/MB-75.svg';
import MB_100 from '../images/MB-100.svg';
import MB_200 from '../images/MB-200.svg';
import MB_ROLL from '../images/MB-roll.svg';
import MB_ACE from '../images/MB-ace.svg';
import MB_EMERGENCY from '../images/MB-emergency.svg';
import MB_SEALANT from '../images/MB-sealant.svg';
import MB_TANKER from '../images/MB-tanker.svg';
import MB_UNLIMITED from '../images/MB-unlimited.svg';
import MB_LIMIT from '../images/MB-limit.svg';

export interface Card {
    image: string;
}

export interface BattleCard extends Card { }
export interface HazardCard extends BattleCard { }
export interface RemedyCard extends BattleCard { }
export interface SpeedCard extends Card {
    limit: number;
}
export interface SafetyCard extends Card {
    coupFourré: boolean;
}
export interface DistanceCard extends Card {
    amount: number;
}

export class RollCard implements RemedyCard {
    image: string;

    constructor() {
        this.image = MB_ROLL;
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
