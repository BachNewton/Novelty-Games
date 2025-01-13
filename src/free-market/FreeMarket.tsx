import { useState } from "react";
import Tabs, { Tab } from "./Tabs";

const FreeMarket: React.FC = () => {
    const [tab, setTab] = useState(Tab.PROFILE);

    const rawMaterials = ['🔥 Fire', '💧 Water', '🪵 Wood', '🪨 Stone', '⛏️ Metal', '⚡ Electricity'];
    const rawMaterialsUi = createCards(rawMaterials, true);

    const marketItems = ['📄 Paper - $5', '💡 Light Blub - $12'];
    const marketItemsUi = createCards(marketItems, false);

    return <div style={{ color: 'white', fontSize: '1.333em' }}>
        <Tabs currentTab={tab} onClick={selectedTab => setTab(selectedTab)} />

        <div style={{ margin: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: '1.25em', fontWeight: 'bold' }}>
                <div>
                    Inventor: Kyle
                </div>
                <div>
                    Money: $1,234
                </div>
            </div>
            <div>
                <button style={{ fontSize: '1em', display: 'block', width: '100%' }}>Labor</button>
                <div style={{ height: '10px' }}></div>
                <button style={{ fontSize: '1em', display: 'block', width: '100%' }}>Invent</button>
            </div>
        </div>

        {createLine()}

        <div style={{ margin: '15px' }}>
            <div style={{ fontWeight: 'bold' }}>Inventory</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
                <div>🔥 Fire x 4</div>
                <div>💧 Water x 1</div>
                <div>🪵 Wood x 7</div>
                <div>⛏️ Metal x 3</div>
            </div>
        </div>

        {createLine()}

        <div style={{ margin: '15px' }}>
            <div style={{ fontWeight: 'bold' }}>Raw Materials</div>
            {rawMaterialsUi}
        </div>

        {createLine()}

        <div style={{ margin: '15px' }}>
            <div style={{ fontWeight: 'bold' }}>The Market</div>
            {marketItemsUi}
        </div>
    </div>;
};

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

function createLine(): JSX.Element {
    return <div style={{ borderTop: '2px solid white' }}></div>;
}

export default FreeMarket;
