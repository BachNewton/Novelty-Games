export enum Tab {
    PROFILE, EXTRACT, MARKET, INVENT
}

interface TabsProps {
    currentTab: Tab;
    onClick: (selectedTab: Tab) => void;
}

const Tabs: React.FC<TabsProps> = ({ currentTab, onClick }) => {
    const borderGrey = '2px solid grey';
    const borderWhite = '2px solid white';

    const tabs = ['Profile', 'Extract', 'Market', 'Invent'].map((tabName, tabIndex) => {
        const tabStyle: React.CSSProperties = {
            borderTop: borderWhite,
            borderLeft: borderWhite,
            borderRight: borderWhite,
            textAlign: 'center'
        };

        if (tabIndex !== currentTab) {
            tabStyle.background = 'grey';
            tabStyle.borderBottom = borderGrey;
            tabStyle.borderTop = borderGrey
            tabStyle.cursor = 'pointer';
        }

        return <div style={tabStyle} onClick={() => onClick(tabIndex)}>{tabName}</div>;
    });

    return <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', margin: '0px 1px' }}>
        {tabs}
    </div>;
};

export default Tabs;
