import { Pet } from "../data/Pet";
import { COLORS } from "./Home";

interface TabsProps {
    pets: Pet[];
    selectedTab: number;
    onTabSelected: (index: number) => void;
}

const Tabs: React.FC<TabsProps> = ({ pets, selectedTab, onTabSelected }) => {
    const tabs = pets.map((pet, index) => {
        const borderStyle = getTabBorderStyle(selectedTab, index);

        const name = pet.discovered ? pet.name : '???';

        return <div
            key={index}
            style={{ ...borderStyle, padding: '7.5px', userSelect: 'none', flex: '0 0 4em', textAlign: 'center' }}
            onClick={() => onTabSelected(index)}
        >
            {name}
        </div>;
    });

    return <div style={{ display: 'flex', overflow: 'auto', backgroundColor: COLORS.surface }}>
        {tabs}
    </div>;
};

function getTabBorderStyle(selectedTab: number, tabIndex: number): React.CSSProperties {
    const borderRadius = '15px';
    const lightWidth = '2px';
    const strongWidth = '4px';
    const lightBorder = `${lightWidth} solid white`;
    const strongBorder = `${strongWidth} solid ${COLORS.secondary}`;

    if (tabIndex === selectedTab) {
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
