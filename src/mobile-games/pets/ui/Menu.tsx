import { Pet } from "../data/Pet";
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

export default Menu;
