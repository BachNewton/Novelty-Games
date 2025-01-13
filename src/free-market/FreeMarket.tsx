import { useState } from "react";
import Tabs, { Tab } from "./Tabs";
import HorizontalLine from "./HorizontalLine";

const FreeMarket: React.FC = () => {
    const [tab, setTab] = useState(Tab.PROFILE);

    return <div style={{ color: 'white', fontSize: '1.333em' }}>
        <Tabs currentTab={tab} onClick={selectedTab => setTab(selectedTab)} />

        <div style={{ margin: '10px' }}>
            {tabContentUi(tab)}
        </div>
    </div>;
};

function tabContentUi(tab: Tab): JSX.Element {
    switch (tab) {
        case Tab.PROFILE:
            return profileUi();
        case Tab.EXTRACT:
            return extractUi();
        case Tab.MARKET:
            return marketUi();
        case Tab.INVENT:
            return <div>// TODO</div>
    }
}

function profileUi(): JSX.Element {
    const inventoryItemStyle: React.CSSProperties = {
        border: '2px solid white',
        padding: '5px'
    };

    return <div style={{ margin: '10px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', fontSize: '1.5em', fontWeight: 'bold' }}>
            <div>Inventor:</div>
            <div style={{ textAlign: 'right' }}>Landon</div>
            <div>Money:</div>
            <div style={{ textAlign: 'right' }}>$1,234</div>
        </div>

        <HorizontalLine />

        <div style={{ fontWeight: 'bold', marginBottom: '10px', fontSize: '1.25em', textAlign: 'center' }}>Inventory</div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(8.5em, 1fr))' }}>
            <div style={inventoryItemStyle}>🔥 Fire x 4</div>
            <div style={inventoryItemStyle}>💧 Water x 1</div>
            <div style={inventoryItemStyle}>🪵 Wood x 7</div>
            <div style={inventoryItemStyle}>🪨 Stone x 1</div>
            <div style={inventoryItemStyle}>⛏️ Metal x 3</div>
            <div style={inventoryItemStyle}>⚡ Electricity x 12</div>
        </div>
    </div>;
}

function extractUi(): JSX.Element {
    const rawMaterials = ['🔥 Fire', '💧 Water', '🪵 Wood', '🪨 Stone', '⛏️ Metal', '⚡ Electricity'];
    const rawMaterialsUi = createCards(rawMaterials, true);

    return <div>
        <div style={{ fontWeight: 'bold', marginBottom: '10px', fontSize: '1.25em', textAlign: 'center' }}>Raw Materials</div>

        {rawMaterialsUi}
    </div>;
}

function marketUi(): JSX.Element {
    const marketItems = ['📄 Paper - $5', '💡 Light Blub - $12'];
    const marketItemsUi = createCards(marketItems, false);

    return <div>
        <div style={{ fontWeight: 'bold', marginBottom: '10px', fontSize: '1.25em', textAlign: 'center' }}>The Market</div>

        {marketItemsUi}
    </div>;
}

function createCards(names: string[], isRaw: boolean): JSX.Element[] {
    const cardStyle: React.CSSProperties = {
        border: '2px solid white',
        padding: '5px',
        marginTop: '15px',
        display: 'flex',
        justifyContent: 'space-between'
    };

    const buttonText = isRaw ? 'Extract' : 'Buy';

    return names.map((name, index) => <div key={index} style={cardStyle}>
        {name}
        <button style={{ fontSize: '1em' }}>{buttonText}</button>
    </div>);
}

export default FreeMarket;
