interface TabsProps {
    tabs: string[];
    selectedTabIndex: number;
    onTabSelected: (index: number) => void;
}

const Tabs: React.FC<TabsProps> = ({ tabs, selectedTabIndex: selectedTab, onTabSelected }) => {
    const tabsUi = tabs.map((text, index) => <div
        key={index}
        style={getTabStyle(index, selectedTab)}
        onClick={() => onTabSelected(index)}
    >{text}</div>);

    return <div style={{ display: 'grid', gridTemplateColumns: `repeat(${tabs.length}, 1fr)` }}>
        {tabsUi}
    </div>
};

function getTabStyle(index: number, selectedTab: number): React.CSSProperties {
    const selected = index === selectedTab;

    return {
        border: '1px solid white',
        backgroundColor: selected ? 'var(--novelty-blue)' : undefined,
        padding: '5px',
        cursor: 'pointer',
        textAlign: 'center',
        fontSize: '1.5em'
    };
}

export default Tabs;
