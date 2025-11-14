interface TabsProps {
    tabs: string[];
    selectedTabIndex: number | null;
    onTabSelected: (index: number) => void;
    fontScale: number;
}

const Tabs: React.FC<TabsProps> = ({ tabs, selectedTabIndex: selectedTab, onTabSelected, fontScale }) => {
    const tabsUi = tabs.map((text, index) => <div
        key={index}
        style={getTabStyle(index, selectedTab, fontScale)}
        onClick={() => onTabSelected(index)}
    >{text}</div>);

    return <div style={{ display: 'grid', gridTemplateColumns: `repeat(${tabs.length}, 1fr)` }}>
        {tabsUi}
    </div>
};

function getTabStyle(index: number, selectedTab: number | null, fontScale: number): React.CSSProperties {
    const selected = index === selectedTab;

    return {
        border: '1px solid white',
        backgroundColor: selected ? 'var(--novelty-blue)' : undefined,
        padding: '5px',
        cursor: 'pointer',
        textAlign: 'center',
        fontSize: `${fontScale}em`
    };
}

export default Tabs;
