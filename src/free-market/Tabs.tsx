export enum Tab {
    PROFILE, EXTRACT, MARKET, INVENT
}

interface TabsProps {
    currentTab: Tab;
    onClick: (selectedTab: Tab) => void;
}

const Tabs: React.FC<TabsProps> = ({ currentTab, onClick }) => {
    const border = '2px solid grey';

    const tabs = ['Profile', 'Extract', 'Market', 'Invent'].map((tabName, tabIndex) => {
        const tabStyle: React.CSSProperties = {
            borderTop: border,
            borderLeft: border,
            borderRight: border,
            textAlign: 'center'
        };

        if (tabIndex !== currentTab) {
            tabStyle.background = 'grey';
            tabStyle.borderBottom = border;
            tabStyle.cursor = 'pointer';
        }

        return <div style={tabStyle} onClick={() => onClick(tabIndex)}>{tabName}</div>;
    });

    return <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', margin: '1px' }}>
        {tabs}
    </div>;
};

export default Tabs;
