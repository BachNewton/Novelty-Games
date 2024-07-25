import { useEffect, useState } from 'react';
import MilleBornesHome from '../mille-bornes/ui/Home';
import TriviaHome from '../trivia/ui/Home';

const APP_VERSION = 'v1.2.0';

interface HomeProps {
    updateListener: { onUpdateAvailable: () => void, onNoUpdateFound: () => void };
}

interface State { }

class HomeState implements State { }

class TriviaState implements State { }

class MilleBornesState implements State { }

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
        setState(new MilleBornesState());
    };

    const onTriviaClick = () => {
        setState(new TriviaState());
    };

    if (state instanceof MilleBornesState) {
        return <MilleBornesHome onHomeButtonClicked={onHomeButtonClicked} />;
    } else if (state instanceof TriviaState) {
        return <TriviaHome onHomeButtonClicked={onHomeButtonClicked} />;
    } else {
        return HomeUi(versionState, onMilleBornesClick, onTriviaClick);
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
        <button style={buttonStyle} onClick={onTriviaClick}>Trivia ❓</button>
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
