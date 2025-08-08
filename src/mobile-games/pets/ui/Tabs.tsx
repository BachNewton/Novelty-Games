import { Pet } from "../data/Pet";
import { COLORS } from "./Home";

interface TabsProps {
    pets: Pet[];
    selectedTab: number;
    onTabSelected: (index: number | null) => void;
}

const Tabs: React.FC<TabsProps> = ({ pets, selectedTab, onTabSelected }) => {
    const tabs = [
        // <div
        //     key='menu'
        //     style={getTabStyle(selectedTab, 0)}
        //     onClick={() => onTabSelected(null)}
        // >
        //     Menu
        // </div>,
        ...pets.map((pet, index) => {
            const name = pet.discovered ? pet.name : '???';
            return <div
                key={index}
                style={getTabStyle(selectedTab, index)}
                onClick={() => onTabSelected(index)}
            >
                {name}
            </div>;
        })
    ];

    return <div style={{ display: 'flex', overflow: 'auto', backgroundColor: COLORS.surface }}>
        {tabs}
    </div>;
};

function getTabStyle(selectedTab: number | null, index: number): React.CSSProperties {
    return {
        ...getTabBorderStyle(selectedTab, index),
        padding: '7.5px',
        userSelect: 'none',
        flex: '0 0 4em',
        textAlign: 'center'
    };
}

function getTabBorderStyle(selectedTab: number | null, tabIndex: number): React.CSSProperties {
    const borderRadius = '15px';
    const lightWidth = '2px';
    const strongWidth = '4px';
    const lightBorder = `${lightWidth} solid white`;
    const strongBorder = `${strongWidth} solid ${COLORS.secondary}`;

    if (tabIndex === selectedTab || selectedTab === null) {
        return {
            borderTop: `${lightWidth} solid ${COLORS.secondary}`,
            background: `linear-gradient(0deg, ${COLORS.surface}, ${COLORS.primary})`
        };
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
        borderRight: lightBorder,
        borderBottom: strongBorder,
        borderLeft: lightBorder
    };
}

export default Tabs;
