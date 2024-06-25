import { useEffect, useState } from 'react';
import MilleBornesHome from './mille-bornes/ui/Home';
import TriviaHome from './trivia/ui/Home';

const APP_VERSION = 'v1.0.0';

interface HomeProps {
    updateListener: { onUpdateAvailable: () => void, onNoUpdateFound: () => void };
}

interface State {
    versionState: VersionState;
}

class HomeState implements State {
    versionState: VersionState;

    constructor(versionState: VersionState) {
        this.versionState = versionState;
    }
}

class TriviaState implements State {
    versionState: VersionState;

    constructor(versionState: VersionState) {
        this.versionState = versionState;
    }
}

class MilleBornesState implements State {
    versionState: VersionState;

    constructor(versionState: VersionState) {
        this.versionState = versionState;
    }
}

enum VersionState {
    CURRENT,
    UNKNOWN,
    OUTDATED,
    CHECKING
}

const Home: React.FC<HomeProps> = ({ updateListener }) => {
    const [state, setState] = useState<State>(new HomeState(VersionState.CHECKING));

    useEffect(() => {
        updateListener.onUpdateAvailable = () => {
            console.log('Newer version of the app is available');
            state.versionState = VersionState.OUTDATED;
            setState({ ...state });
        };

        updateListener.onNoUpdateFound = () => {
            console.log('No update of the app has been found');
            state.versionState = VersionState.CURRENT;
            setState({ ...state });
        };

        if (!navigator.onLine) {
            console.log('App if offline and can not check for updates');
            state.versionState = VersionState.UNKNOWN;
        }
    }, [state]);

    const onMilleBornesClick = () => {
        setState(new MilleBornesState(state.versionState));
    };

    const onTriviaClick = () => {
        setState(new TriviaState(state.versionState));
    };

    if (state instanceof MilleBornesState) {
        return <MilleBornesHome />;
    } else if (state instanceof TriviaState) {
        return <TriviaHome updateListener={updateListener} />;
    } else {
        return HomeUi(state.versionState, onMilleBornesClick, onTriviaClick);
    }
};

function HomeUi(versionState: VersionState, onMilleBornesClick: () => void, onTriviaClick: () => void) {
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
        <h2>🃏 Kyle's Novelty Games 🕹️</h2>
        <div>Created by: Kyle Hutchinson</div>
        <div><br /><br /><br /></div>
        <button style={buttonStyle} onClick={onTriviaClick}>Trivia ❔</button>
        <button style={buttonStyle} onClick={onMilleBornesClick}>Mille Bornes 🏎️</button>
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
