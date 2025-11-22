interface TabsProps {
    tabs: string[];
    selectedTabIndex: number | null;
    onTabSelected: (index: number) => void;
    fontScale: number;
    useAltColor?: boolean;
}

const Tabs: React.FC<TabsProps> = ({ tabs, selectedTabIndex: selectedTab, onTabSelected, fontScale, useAltColor }) => {
    const tabsUi = tabs.map((text, index) => <div
        key={index}
        style={getTabStyle(index, selectedTab, fontScale, useAltColor ? 'var(--novelty-orange)' : 'var(--novelty-blue)')}
        onClick={() => onTabSelected(index)}
    >{text}</div>);

    return <div style={{ display: 'grid', gridTemplateColumns: `repeat(${tabs.length}, 1fr)` }}>
        {tabsUi}
    </div>
};

function getTabStyle(index: number, selectedTab: number | null, fontScale: number, color: string): React.CSSProperties {
    const selected = index === selectedTab;

    return {
        border: '1px solid white',
        backgroundColor: selected ? color : undefined,
        padding: '5px',
        cursor: 'pointer',
        textAlign: 'center',
        fontSize: `${fontScale}em`
    };
}

export default Tabs;
