import { Pet } from "../data/Pet";
import { COLORS } from "./Home";
import Overview from "./Overview";
import PetMap from "./PetMap";
import Welcome from "./Welcome";

interface MenuProps {
    selection: MenuOption;
    pets: Pet[];
    seenInteractions: Set<string>;
    onGoToPet: (petId: string) => void;
}

export enum MenuOption {
    WELCOME, OVERVIEW, MAP
}

const Menu: React.FC<MenuProps> = ({ selection, pets, seenInteractions, onGoToPet }) => {
    // The map is the one option that wants the whole area, edge to edge.
    const isFullBleed = selection === MenuOption.MAP;

    return <div style={{ padding: isFullBleed ? '0px' : '15px', height: isFullBleed ? '100%' : undefined }}>
        {contentUi(selection, pets, seenInteractions, onGoToPet)}
    </div>;
};

function contentUi(
    selection: MenuOption,
    pets: Pet[],
    seenInteractions: Set<string>,
    onGoToPet: (petId: string) => void
): JSX.Element {
    switch (selection) {
        case MenuOption.WELCOME:
            return <Welcome />;
        case MenuOption.OVERVIEW:
            return <Overview pets={pets} seenInteractions={seenInteractions} />;
        case MenuOption.MAP:
            return <PetMap pets={pets} onGoToPet={onGoToPet} />;
    }
}

export function menuBannerUi(text: string, fontScale: number): JSX.Element {
    return <div style={{
        fontSize: `${fontScale}em`,
        fontWeight: 'bold',
        textAlign: 'center',
        background: `linear-gradient(to right, ${COLORS.primary} 0%, ${COLORS.secondary} 50%, ${COLORS.primary} 100%)`,
        padding: '5px',
        borderRadius: '10px'
    }}>{text}</div>
}

export default Menu;
