import '../css/PokemonTypeIcon.css';
import { PokemonType } from "../data/PokemonData";
import BugImage from '../images/pokemon/new/40px-Bug_icon.png';
import DarkImage from '../images/pokemon/new/40px-Dark_icon.png';
import DragonImage from '../images/pokemon/new/40px-Dragon_icon.png';
import ElectricImage from '../images/pokemon/new/40px-Electric_icon.png';
import FairyImage from '../images/pokemon/new/40px-Fairy_icon.png';
import FightingImage from '../images/pokemon/new/40px-Fighting_icon.png';
import FireImage from '../images/pokemon/new/40px-Fire_icon.png';
import FlyingImage from '../images/pokemon/new/40px-Flying_icon.png';
import GhostImage from '../images/pokemon/new/40px-Ghost_icon.png';
import GrassImage from '../images/pokemon/new/40px-Grass_icon.png';
import GroundImage from '../images/pokemon/new/40px-Ground_icon.png';
import IceImage from '../images/pokemon/new/40px-Ice_icon.png';
import NormalImage from '../images/pokemon/new/40px-Normal_icon.png';
import PoisonImage from '../images/pokemon/new/40px-Poison_icon.png';
import PsychicImage from '../images/pokemon/new/40px-Psychic_icon.png';
import RockImage from '../images/pokemon/new/40px-Rock_icon.png';
import SteelImage from '../images/pokemon/new/40px-Steel_icon.png';
import WaterImage from '../images/pokemon/new/40px-Water_icon.png';

const ICON_SIZE = 40;

interface PokemonTypeIconProps {
    type: PokemonType;
}

const PokemonTypeIcon: React.FC<PokemonTypeIconProps> = ({ type }) => {
    return <div style={{
        padding: '2px 2px 2px 4px',
        margin: '2px 2px',
        borderRadius: '15px',
        display: 'inline-flex',
        backgroundImage: `linear-gradient(105deg, ${getColor(type)} ${ICON_SIZE + 10}px, #5A5A5A ${ICON_SIZE + 10 + 1}px, #5A5A5A)`,
        alignItems: 'center',
        width: '8em'
    }}>
        <img height={ICON_SIZE} width={ICON_SIZE} src={getSrc(type)} alt='' />
        <span style={{ margin: '0 auto 0 auto', fontSize: '1.5em' }}>{capitalizeFirstLetter(type)}</span>
    </div>;
};

function capitalizeFirstLetter(word: string): string {
    return word.charAt(0).toUpperCase() + word.slice(1);
}

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

function getColor(type: PokemonType): string {
    switch (type) {
        case PokemonType.BUG:
            return '#91A119';
        case PokemonType.DARK:
            return '#624D4E';
        case PokemonType.DRAGON:
            return '#5060E1';
        case PokemonType.ELECTRIC:
            return '#FAC000';
        case PokemonType.FAIRY:
            return '#EF70EF';
        case PokemonType.FIGHTING:
            return '#FF8000';
        case PokemonType.FIRE:
            return '#E62829';
        case PokemonType.FLYING:
            return '#81B9EF';
        case PokemonType.GHOST:
            return '#704170';
        case PokemonType.GRASS:
            return '#3FA129';
        case PokemonType.GROUND:
            return '#915121';
        case PokemonType.ICE:
            return '#3DCEF3';
        case PokemonType.NORMAL:
            return '#9FA19F';
        case PokemonType.POISON:
            return '#9141CB';
        case PokemonType.PSYCHIC:
            return '#EF4179';
        case PokemonType.ROCK:
            return '#AFA981';
        case PokemonType.STEEL:
            return '#60A1B8';
        case PokemonType.WATER:
            return '#2980EF';
    }
}

export default PokemonTypeIcon;
