import { Pet } from "../data/Pet";
import { COLORS } from "./Home";
import PawIcon from "../icons/paw.svg";

interface TabsProps {
    pets: Pet[];
    selectedTab: number;
    onTabSelected: (index: number | null) => void;
}

const Tabs: React.FC<TabsProps> = ({ pets, selectedTab, onTabSelected }) => {
    return <div style={{ display: 'flex' }}>
        {menuUi(selectedTab)}

        <div style={{ display: 'flex', overflow: 'auto', backgroundColor: COLORS.surface }}>
            {tabsUi(pets, selectedTab, onTabSelected)}
        </div>
    </div>;
};

function tabsUi(pets: Pet[], selectedTab: number, onTabSelected: (index: number | null) => void): JSX.Element[] {
    return pets.map((pet, index) => {
        const name = pet.discovered ? pet.name : '???';

        return <div
            key={index}
            style={getTabStyle(selectedTab, index)}
            onClick={() => onTabSelected(index)}
        >
            {name}
        </div>;
    });
}

function menuUi(selectedTab: number | null): JSX.Element {
    return <div style={{ ...getTabStyle(selectedTab, null), backgroundColor: COLORS.surface }}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%' }}>
            <img src={PawIcon} alt="Menu" style={{ height: '1.5em' }} />
        </div>
    </div>;
}

function getTabStyle(selectedTab: number | null, index: number | null): React.CSSProperties {
    return {
        ...getTabBorderStyle(selectedTab, index),
        padding: '7.5px',
        userSelect: 'none',
        flex: index === null ? '0 0 2.5em' : '0 0 4em',
        textAlign: 'center'
    };
}

function getTabBorderStyle(selectedTab: number | null, tabIndex: number | null): React.CSSProperties {
    const borderRadius = '15px';
    const lightWidth = '2px';
    const strongWidth = '4px';
    const lightBorder = `${lightWidth} solid white`;
    const strongBorder = `${strongWidth} solid ${COLORS.secondary}`;

    if (tabIndex === selectedTab || (selectedTab === null && tabIndex === -1)) {
        return {
            borderTop: `${lightWidth} solid ${COLORS.secondary}`,
            background: `linear-gradient(0deg, ${COLORS.surface}, ${COLORS.primary})`,
            borderLeft: tabIndex === 0 ? strongBorder : undefined
        };
    } else if (selectedTab === null) {
        // return {};
    } else if (tabIndex === selectedTab - 1) {
        return {
            borderTop: lightBorder,
            borderRight: strongBorder,
            borderBottom: strongBorder,
            borderLeft: lightBorder,
            borderBottomRightRadius: borderRadius,
            backgroundClip: 'border-box'
        };
    } else if (tabIndex === selectedTab + 1) {
        return {
            borderTop: lightBorder,
            borderLeft: strongBorder,
            borderBottom: strongBorder,
            borderRight: lightBorder,
            borderBottomLeftRadius: borderRadius,
            backgroundClip: 'border-box'
        };
    }

    return {
        borderTop: lightBorder,
        borderRight: tabIndex === null && selectedTab === 0 ? undefined : lightBorder,
        borderBottom: strongBorder,
        borderLeft: lightBorder
    };
}

export default Tabs;
