import { useEffect, useState } from 'react';

const APP_VERSION = 'v1.0.0';

interface HomeProps {
    updateListener: { onUpdateAvailable: () => void, onNoUpdateFound: () => void };
}

interface State {
    ui: UiState;
    versionState: VersionState;
}

enum UiState {
    HOME,
    GAME,
    FILTER
}

enum VersionState {
    CURRENT,
    UNKNOWN,
    OUTDATED,
    CHECKING
}

const Home: React.FC<HomeProps> = ({ updateListener }) => {
    const [state, setState] = useState({ ui: UiState.HOME, versionState: VersionState.CHECKING } as State);

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

    return HomeUi(state.versionState);
};

function HomeUi(
    versionState: VersionState
) {
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
        <button style={buttonStyle}>Trivia ❔</button>
        <button style={buttonStyle}>Mille Bornes 🏎️</button>
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
