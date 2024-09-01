import '../css/PokemonTypeIcon.css';
import { PokemonType } from "../data/PokemonData";
import BugImage from '../images/pokemon/bug.svg';
import DarkImage from '../images/pokemon/dark.svg';
import DragonImage from '../images/pokemon/dragon.svg';
import ElectricImage from '../images/pokemon/electric.svg';
import FairyImage from '../images/pokemon/fairy.svg';
import FightingImage from '../images/pokemon/fighting.svg';
import FireImage from '../images/pokemon/fire.svg';
import FlyingImage from '../images/pokemon/flying.svg';
import GhostImage from '../images/pokemon/ghost.svg';
import GrassImage from '../images/pokemon/grass.svg';
import GroundImage from '../images/pokemon/ground.svg';
import IceImage from '../images/pokemon/ice.svg';
import NormalImage from '../images/pokemon/normal.svg';
import PoisonImage from '../images/pokemon/poison.svg';
import PsychicImage from '../images/pokemon/psychic.svg';
import RockImage from '../images/pokemon/rock.svg';
import SteelImage from '../images/pokemon/steel.svg';
import WaterImage from '../images/pokemon/water.svg';

interface PokemonTypeIconProps {
    type: PokemonType;
}

const PokemonTypeIcon: React.FC<PokemonTypeIconProps> = ({ type }) => {
    return <div className={`icon ${type}`}>
        <img src={getSrc(type)} />
    </div>;
};

function getSrc(type: PokemonType): string {
    switch (type) {
        case PokemonType.BUG:
            return BugImage;
        case PokemonType.DARK:
            return DarkImage;
        case PokemonType.DRAGON:
            return DragonImage;
        case PokemonType.ELECTRIC:
            return ElectricImage;
        case PokemonType.FAIRY:
            return FairyImage;
        case PokemonType.FIGHTING:
            return FightingImage;
        case PokemonType.FIRE:
            return FireImage;
        case PokemonType.FLYING:
            return FlyingImage;
        case PokemonType.GHOST:
            return GhostImage;
        case PokemonType.GRASS:
            return GrassImage;
        case PokemonType.GROUND:
            return GroundImage;
        case PokemonType.ICE:
            return IceImage;
        case PokemonType.NORMAL:
            return NormalImage;
        case PokemonType.POISON:
            return PoisonImage;
        case PokemonType.PSYCHIC:
            return PsychicImage;
        case PokemonType.ROCK:
            return RockImage;
        case PokemonType.STEEL:
            return SteelImage;
        case PokemonType.WATER:
            return WaterImage;
    }
}

export default PokemonTypeIcon;
