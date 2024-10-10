import { useEffect, useState } from 'react';
import MilleBornesHome from '../mille-bornes/ui/Home';
import TriviaHome from '../trivia/ui/Home';
import { Communicator } from '../mille-bornes/logic/Communicator';
import { NewtorkCommunicator } from '../mille-bornes/logic/NewtorkCommunicator';
import Games2DHome from '../game-2D/ui/Home';
import ToolsHome from '../tools/ui/Home';

const APP_VERSION = 'v1.15.0';

interface HomeProps {
    updateListener: { onUpdateAvailable: () => void, onNoUpdateFound: () => void };
}

interface State { }

class HomeState implements State { }

class TriviaState implements State { }

class MilleBornesState implements State {
    communicator: Communicator;

    constructor(communicator: Communicator) {
        this.communicator = communicator;
    }
}

class Game2DState implements State { }

class ToolsState implements State { }

enum VersionState {
    CURRENT,
    UNKNOWN,
    OUTDATED,
    CHECKING
}

const Home: React.FC<HomeProps> = ({ updateListener }) => {
    const [state, setState] = useState<State>(new HomeState());
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

    const onMilleBornesClick = () => {
        const communicator = new NewtorkCommunicator();
        setState(new MilleBornesState(communicator));
    };

    const onTriviaClick = () => {
        setState(new TriviaState());
    };

    const on2DGamesClick = () => {
        setState(new Game2DState());
    };

    const onToolsClick = () => {
        setState(new ToolsState());
    };

    if (state instanceof MilleBornesState) {
        return <MilleBornesHome onHomeButtonClicked={onHomeButtonClicked} communicator={state.communicator} />;
    } else if (state instanceof TriviaState) {
        return <TriviaHome onHomeButtonClicked={onHomeButtonClicked} />;
    } else if (state instanceof Game2DState) {
        return <Games2DHome onHomeButtonClicked={onHomeButtonClicked} />;
    } else if (state instanceof ToolsState) {
        return <ToolsHome onHomeButtonClicked={onHomeButtonClicked} />;
    } else {
        return HomeUi(versionState, onMilleBornesClick, onTriviaClick, on2DGamesClick, onToolsClick);
    }
};

function HomeUi(versionState: VersionState, onMilleBornesClick: () => void, onTriviaClick: () => void, on2DGamesClick: () => void, onToolsClick: () => void) {
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
        margin: '0.75em',
        padding: '0.5em'
    };

    return <div style={{ color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <div style={versionStateStyle}>{VersionStateUi(versionState)}</div>
        <code style={versionLabelStyle}>{APP_VERSION}</code>
        <h1>🃏 Novelty Games 🕹️</h1>
        <div>Created by: Kyle Hutchinson</div>
        <div><br /></div>
        <button style={buttonStyle} onClick={onTriviaClick}>Trivia 🤔</button>
        <button style={buttonStyle} onClick={onMilleBornesClick}>Mille Bornes 🏎️</button>
        <button style={buttonStyle} onClick={on2DGamesClick}>2D Games 🟦</button>
        <button style={buttonStyle} onClick={() => window.alert('Work in progress!')}>3D Games 🧊</button>
        <button style={buttonStyle} onClick={onToolsClick}>Tools 🔨</button>
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

export default Home;
