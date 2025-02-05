export enum Tab {
    PROFILE, EXTRACT, CRAFT, MARKET, PATENT, INVENT
}

interface TabsProps {
    currentTab: Tab;
    onClick: (selectedTab: Tab) => void;
}

const TAB_HEIGHT = '2em';

const Tabs: React.FC<TabsProps> = ({ currentTab, onClick }) => {
    const borderGrey = '2px solid grey';
    const borderWhite = '2px solid white';

    const tabs = ['👤', '⚒️', '🔧', '🏛️', '®️', '💡'].map((tabName, tabIndex) => {
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

    return <div>
        <div style={{ height: TAB_HEIGHT }} />

        <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr 1fr',
            height: TAB_HEIGHT,
            position: 'fixed',
            left: 0,
            top: 0,
            width: '100%',
            background: 'linear-gradient(0deg, grey, var(--novelty-blue))',
            boxShadow: 'black 0px 10px 20px',
            zIndex: 1
        }}>
            {tabs}
        </div>
    </div>;
};

export default Tabs;
