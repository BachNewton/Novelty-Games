import { useEffect, useState } from "react";
import HorizontalLine from "./HorizontalLine";
import { Route, updateRoute } from "../../ui/Routing";
import Tabs, { Tab } from "./Tabs";
import Invent from "./Invent";
import { FreeMarketCommunicator } from "../logic/FreeMarketCommunicator";
import Patent from "./Patent";
import { StorageKey, Storer } from "../../util/Storage";
import { FreeMarketSave } from "../data/FreeMarketSave";
import Loading from "./Loading";
import Dialog from "../../util/ui/Dialog";
import NewProfile from "./NewProfile";

interface FreeMarketProps {
    communicator: FreeMarketCommunicator;
    storer: Storer<FreeMarketSave>;
}

interface State { }

class LoadingState implements State { }

class NewProfileState implements State { }

class ReadyState implements State {
    save: FreeMarketSave

    constructor(save: FreeMarketSave) {
        this.save = save;
    }
}

const FreeMarket: React.FC<FreeMarketProps> = ({ communicator, storer }) => {
    const [tab, setTab] = useState(Tab.PROFILE);
    const [state, setState] = useState<State>(new LoadingState());

    useEffect(() => {
        updateRoute(Route.FREE_MARKET);

        storer.load(StorageKey.FREE_MARKET)
            .then(save => setState(new ReadyState(save)))
            .catch(() => setState(new NewProfileState()));
    }, []);

    return <div style={{ color: 'white', fontSize: '1.333em' }}>
        <Tabs currentTab={tab} onClick={selectedTab => setTab(selectedTab)} />

        <div style={{ margin: '15px' }}>
            {tabContentUi(tab, state, communicator, storer, readyState => setState(readyState))}
        </div>
    </div>;
};

function tabContentUi(
    tab: Tab,
    state: State,
    communicator: FreeMarketCommunicator,
    storer: Storer<FreeMarketSave>,
    updateState: (readyState: ReadyState) => void
): JSX.Element {
    if (state instanceof NewProfileState) {
        const content: JSX.Element = <NewProfile
            communicator={communicator}
            storer={storer}
            onComplete={save => updateState(new ReadyState(save))}
        />;

        return <Dialog isOpen={true} content={content} />;
    } else if (state instanceof ReadyState) {
        return readyUi(tab, state.save, communicator);
    } else {
        return <Loading />;
    }
}

function readyUi(tab: Tab, save: FreeMarketSave, communicator: FreeMarketCommunicator): JSX.Element {
    switch (tab) {
        case Tab.PROFILE:
            return profileUi(save);
        case Tab.EXTRACT:
            return extractUi();
        case Tab.MARKET:
            return marketUi();
        case Tab.PATENT:
            return <Patent communicator={communicator} />
        case Tab.INVENT:
            return <Invent communicator={communicator} inventor={save.inventor} />;
    }
}

function profileUi(save: FreeMarketSave): JSX.Element {
    const inventoryItemStyle: React.CSSProperties = {
        border: '2px solid white',
        padding: '5px'
    };

    return <>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', fontSize: '1.25em', fontWeight: 'bold', alignItems: 'center' }}>
            <div>Inventor:</div>
            <div style={{ textAlign: 'right' }}>{save.inventor.name}</div>
            <div>Money:</div>
            <div style={{ textAlign: 'right' }}>${save.money}</div>
        </div>

        <HorizontalLine />

        <div style={{ fontWeight: 'bold', marginBottom: '10px', fontSize: '1.25em', textAlign: 'center' }}>Inventory</div>

        <div>// Placeholder</div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(8.5em, 1fr))' }}>
            <div style={inventoryItemStyle}>🔥 Fire x 4</div>
            <div style={inventoryItemStyle}>💧 Water x 1</div>
            <div style={inventoryItemStyle}>🪵 Wood x 7</div>
            <div style={inventoryItemStyle}>🪨 Stone x 1</div>
            <div style={inventoryItemStyle}>⛏️ Metal x 3</div>
            <div style={inventoryItemStyle}>⚡ Electricity x 12</div>
        </div>
    </>;
}

function extractUi(): JSX.Element {
    const rawMaterials = ['🔥 Fire', '💧 Water', '🪵 Wood', '🪨 Stone', '⛏️ Metal', '⚡ Electricity'];
    const rawMaterialsUi = createCards(rawMaterials, true);

    return <div>
        <div style={{ fontWeight: 'bold', marginBottom: '10px', fontSize: '1.25em', textAlign: 'center' }}>Raw Materials</div>
        <div>// Placeholder</div>
        {rawMaterialsUi}
    </div>;
}

function marketUi(): JSX.Element {
    const marketItems = ['📄 Paper - $5', '💡 Light Blub - $12'];
    const marketItemsUi = createCards(marketItems, false);

    return <div>
        <div style={{ fontWeight: 'bold', marginBottom: '10px', fontSize: '1.25em', textAlign: 'center' }}>The Market</div>
        <div>// Placeholder</div>
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
