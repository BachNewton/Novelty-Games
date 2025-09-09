import GoIcon from '../icon/go.svg';
import ChanceIcon from '../icon/chance.svg';
import RailroadIcon from '../icon/railroad.svg';
import CommunityChestIcon from '../icon/community-chest.svg';
import TaxIcon from '../icon/tax.svg';
import JailIcon from '../icon/jail.svg';
import FreeParkingIcon from '../icon/free-parking.svg';
import GoToJailIcon from '../icon/go-to-jail.svg';
import ElectricUtilityIcon from '../icon/electric-utility.svg';
import WaterUtilityIcon from '../icon/water-utility.svg';

export interface MonopolyIcons {
    go: HTMLImageElement;
    chance: HTMLImageElement;
    railroad: HTMLImageElement;
    communityChest: HTMLImageElement;
    tax: HTMLImageElement;
    jail: HTMLImageElement;
    freeParking: HTMLImageElement;
    goToJail: HTMLImageElement;
    electricUtility: HTMLImageElement;
    waterUtility: HTMLImageElement;
}

export function createMonopolyIcons(): MonopolyIcons {
    const go = new Image();
    go.src = GoIcon;

    const chance = new Image();
    chance.src = ChanceIcon;

    const railroad = new Image();
    railroad.src = RailroadIcon;

    const communityChest = new Image();
    communityChest.src = CommunityChestIcon;

    const tax = new Image();
    tax.src = TaxIcon;

    const jail = new Image();
    jail.src = JailIcon;

    const freeParking = new Image();
    freeParking.src = FreeParkingIcon;

    const goToJail = new Image();
    goToJail.src = GoToJailIcon;

    const electricUtility = new Image();
    electricUtility.src = ElectricUtilityIcon;

    const waterUtility = new Image();
    waterUtility.src = WaterUtilityIcon;

    return {
        go,
        chance,
        railroad,
        communityChest,
        tax,
        jail,
        freeParking,
        goToJail,
        electricUtility,
        waterUtility
    };
}
