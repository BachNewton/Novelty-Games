import { Pet } from "../data/Pet";
import { COLORS } from "./Home";
import Overview from "./Overview";
import Welcome from "./Welcome";

interface MenuProps {
    selection: MenuOption;
    pets: Pet[];
    seenInteractions: Set<string>;
}

export enum MenuOption {
    WELCOME, OVERVIEW
}

const Menu: React.FC<MenuProps> = ({ selection, pets, seenInteractions }) => {
    return <div style={{ padding: '15px' }}>
        {contentUi(selection, pets, seenInteractions)}
    </div>;
};

function contentUi(selection: MenuOption, pets: Pet[], seenInteractions: Set<string>): JSX.Element {
    switch (selection) {
        case MenuOption.WELCOME:
            return <Welcome />;
        case MenuOption.OVERVIEW:
            return <Overview pets={pets} seenInteractions={seenInteractions} />;
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
