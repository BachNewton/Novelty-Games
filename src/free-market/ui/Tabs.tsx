export enum Tab {
    PROFILE, EXTRACT, MARKET, PATENT, INVENT
}

interface TabsProps {
    currentTab: Tab;
    onClick: (selectedTab: Tab) => void;
}

const Tabs: React.FC<TabsProps> = ({ currentTab, onClick }) => {
    const borderGrey = '2px solid grey';
    const borderWhite = '2px solid white';

    const tabs = ['Profile', 'Extract', 'Market', 'Patent', 'Invent'].map((tabName, tabIndex) => {
        const tabStyle: React.CSSProperties = {
            borderTop: borderWhite,
            borderLeft: borderWhite,
            borderRight: borderWhite,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
        };

        if (tabIndex !== currentTab) {
            tabStyle.background = 'grey';
            tabStyle.borderBottom = borderGrey;
            tabStyle.borderTop = borderGrey
            tabStyle.cursor = 'pointer';
        }

        return <div key={tabIndex} style={tabStyle} onClick={() => onClick(tabIndex)}>{tabName}</div>;
    });

    return <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr', margin: '0px 1px', height: '2em' }}>
        {tabs}
    </div>;
};

export default Tabs;
