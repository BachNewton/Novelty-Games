import { useEffect, useState } from "react";
import HorizontalLine from "./HorizontalLine";
import { Route, updateRoute } from "../../ui/Routing";
import Tabs, { Tab } from "./Tabs";
import Invent from "./Invent";
import { FreeMarketCommunicator } from "../logic/FreeMarketCommunicator";
import Patent from "./Patent";
import { StorageKey, Storer } from "../../util/Storage";
import { FreeMarketSave, SAVE_VERSION } from "../data/FreeMarketSave";
import Dialog from "../../util/ui/Dialog";
import NewProfile from "./NewProfile";
import Extract from './Extract';
import { format } from "../logic/NumberFormatter";
import { RAW_MATERIALS_MAPPED } from "../data/Component";
import Loading from "../../util/ui/Loading";

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
            .then(save => {
                if (save.version !== SAVE_VERSION) throw new Error();

                setState(new ReadyState(save));
            })
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
        return <Dialog isOpen={true}>
            <NewProfile
                communicator={communicator}
                storer={storer}
                onComplete={save => updateState(new ReadyState(save))}
            />
        </Dialog>;
    } else if (state instanceof ReadyState) {
        return readyUi(tab, state.save, communicator, storer);
    } else {
        return <Loading />;
    }
}

function readyUi(tab: Tab, save: FreeMarketSave, communicator: FreeMarketCommunicator, storer: Storer<FreeMarketSave>): JSX.Element {
    switch (tab) {
        case Tab.PROFILE:
            return profileUi(save);
        case Tab.EXTRACT:
            return <Extract save={save} storer={storer} />;
        case Tab.CRAFT:
            return <div>// TODO - Craft</div>;
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
        display: 'flex',
        justifyContent: 'space-between',
        border: '2px solid var(--novelty-blue)',
        padding: '5px',
        margin: '5px',
        borderRadius: '15px',
        background: 'rgba(0, 0, 0, 0.3)'
    };

    const inventoryUi = save.inentory.map((componentQuantity, index) => {
        const rawMaterial = RAW_MATERIALS_MAPPED.get(componentQuantity.componentId);
        const name = rawMaterial?.name ?? '(Unkown)';

        return <div key={index} style={inventoryItemStyle}>
            <div style={{ marginRight: '15px' }}>{name}</div>
            <div>x{format(componentQuantity.quantity)}</div>
        </div>;
    });

    return <>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', fontSize: '1.25em', fontWeight: 'bold', alignItems: 'center' }}>
            <div>Inventor:</div>
            <div style={{ textAlign: 'right' }}>{save.inventor.name}</div>
            <div>Money:</div>
            <div style={{ textAlign: 'right' }}>${format(save.money)}</div>
        </div>

        <HorizontalLine />

        <div style={{ fontWeight: 'bold', marginBottom: '15px', fontSize: '1.5em', textAlign: 'center' }}>Inventory</div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(9.5em, 1fr))' }}>
            {inventoryUi}
        </div>
    </>;
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
