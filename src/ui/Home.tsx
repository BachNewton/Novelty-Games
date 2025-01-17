import { useEffect, useState } from 'react';
import MilleBornesHome from '../mille-bornes/ui/Home';
import TriviaHome from '../trivia/ui/Home';
import { Communicator as MilleBornesCommunicator } from '../mille-bornes/logic/Communicator';
import Games2DHome from '../game-2D/ui/Home';
import Games3DHome from '../game-3D/ui/Home';
import ToolsHome from '../tools/ui/Home';
import { getRoute, Route } from './Routing';
import FreeMarket from '../free-market/ui/FreeMarket';
import { NewtorkCommunicator as MilleBornesNetworkCommunicator } from '../mille-bornes/logic/NewtorkCommunicator';
import { createFreeMarketCommunicator, FreeMarketCommunicator } from '../free-market/logic/FreeMarketCommunicator';
import { createStorer, Storer } from '../util/Storage';
import { FreeMarketSave } from '../free-market/data/FreeMarketSave';

const APP_VERSION = 'v2.11.10';

interface HomeProps {
    updateListener: { onUpdateAvailable: () => void, onNoUpdateFound: () => void };
}

interface State { }

class HomeState implements State { }

class TriviaState implements State { }

class MilleBornesState implements State {
    communicator: MilleBornesCommunicator;

    constructor(communicator: MilleBornesCommunicator) {
        this.communicator = communicator;
    }
}

class Game2DState implements State { }

class Game3DState implements State { }

class ToolsState implements State { }

class FreeMarketState implements State {
    communicator: FreeMarketCommunicator;
    storer: Storer<FreeMarketSave>;

    constructor(communicator: FreeMarketCommunicator, storer: Storer<FreeMarketSave>) {
        this.communicator = communicator;
        this.storer = storer;
    }
}

enum VersionState {
    CURRENT,
    UNKNOWN,
    OUTDATED,
    CHECKING
}

interface OnClickHandlers {
    onMilleBornesClick: () => void;
    onTriviaClick: () => void;
    on2DGamesClick: () => void;
    on3DGamesClick: () => void;
    onToolsClick: () => void;
    onFreeMarketClick: () => void;
}

const Home: React.FC<HomeProps> = ({ updateListener }) => {
    const [state, setState] = useState<State>(getInitialState());
    const [versionState, setVersionSate] = useState(VersionState.CHECKING);

    useEffect(() => {
        updateListener.onUpdateAvailable = () => {
            console.log('Newer version of the app is available');
            setVersionSate(VersionState.OUTDATED);
        };

        updateListener.onNoUpdateFound = () => {
            console.log('No update of the app has been found');
            setVersionSate(VersionState.CURRENT);
        };

        if (!navigator.onLine) {
            console.log('App if offline and can not check for updates');
            setVersionSate(VersionState.UNKNOWN);
        }
    }, [state]);

    const onHomeButtonClicked = () => {
        setState(new HomeState());
    };

    const onClickHandlers: OnClickHandlers = {
        onMilleBornesClick: () => {
            const communicator = new MilleBornesNetworkCommunicator();
            setState(new MilleBornesState(communicator));
        },
        onTriviaClick: () => {
            setState(new TriviaState());
        },
        on2DGamesClick: () => {
            setState(new Game2DState());
        },
        on3DGamesClick: () => {
            setState(new Game3DState());
        },
        onToolsClick: () => {
            setState(new ToolsState());
        },
        onFreeMarketClick: () => {
            setState(createFreeMarketState());
        }
    };

    if (state instanceof MilleBornesState) {
        return <MilleBornesHome onHomeButtonClicked={onHomeButtonClicked} communicator={state.communicator} />;
    } else if (state instanceof TriviaState) {
        return <TriviaHome onHomeButtonClicked={onHomeButtonClicked} />;
    } else if (state instanceof Game2DState) {
        return <Games2DHome onHomeButtonClicked={onHomeButtonClicked} />;
    } else if (state instanceof Game3DState) {
        return <Games3DHome onHomeButtonClicked={onHomeButtonClicked} />;
    } else if (state instanceof ToolsState) {
        return <ToolsHome onHomeButtonClicked={onHomeButtonClicked} />;
    } else if (state instanceof FreeMarketState) {
        return <FreeMarket communicator={state.communicator} storer={state.storer} />;
    } else {
        return HomeUi(versionState, onClickHandlers);
    }
};

function HomeUi(versionState: VersionState, onClickHandlers: OnClickHandlers) {
    const versionStateStyle: React.CSSProperties = {
        position: 'fixed',
        top: '0.25em',
        left: '0.25em'
    };

    const versionLabelStyle: React.CSSProperties = {
        position: 'fixed',
        top: 0,
        right: 0,
        color: 'grey',
        fontSize: '10px'
    };

    const buttonStyle: React.CSSProperties = {
        width: '75%',
        fontSize: '1.5em',
        margin: '0.5em',
        padding: '0.5em'
    };

    return <div style={{ color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <div style={versionStateStyle}>{VersionStateUi(versionState)}</div>
        <code style={versionLabelStyle}>{APP_VERSION}</code>
        <h1>🃏 Novelty Games 🕹️</h1>
        <div>Created by: Kyle Hutchinson</div>
        <div><br /></div>
        <button style={buttonStyle} onClick={onClickHandlers.onTriviaClick}>Trivia 🤔</button>
        <button style={buttonStyle} onClick={onClickHandlers.onMilleBornesClick}>Mille Bornes 🏎️</button>
        <button style={buttonStyle} onClick={onClickHandlers.on2DGamesClick}>2D Games 🟦</button>
        <button style={buttonStyle} onClick={onClickHandlers.on3DGamesClick}>3D Games 🧊</button>
        <button style={buttonStyle} onClick={onClickHandlers.onToolsClick}>Tools 🔨</button>
        <button style={buttonStyle} onClick={onClickHandlers.onFreeMarketClick}>Free Market 💸</button>
    </div>;
}

function VersionStateUi(versionState: VersionState) {
    switch (versionState) {
        case VersionState.CHECKING:
            return <>☁️ Checking for updates...</>;
        case VersionState.CURRENT:
            return <>✔️ Up-to-date</>;
        case VersionState.OUTDATED:
            return <button onClick={() => { window.location.reload() }}>🔄 Update App</button>;
        case VersionState.UNKNOWN:
            return <>✖️ Offline</>;
    }
}

function getInitialState(): State {
    const route = getRoute();

    switch (route) {
        case Route.MARBLE_GAME:
        case Route.KNIGHT_GAME:
            return new Game3DState();
        case Route.FREE_MARKET:
            return createFreeMarketState();
        default:
            return new HomeState();
    }
}

function createFreeMarketState(): FreeMarketState {
    const communicator = createFreeMarketCommunicator();
    const storer = createStorer<FreeMarketSave>();

    return new FreeMarketState(communicator, storer);
}

export default Home;
