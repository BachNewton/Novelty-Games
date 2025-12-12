import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as R from '../routes/routes';
import ProfileUi from './Profile';
import { APP_VERSION } from '../Versioning';
import Button from '../util/ui/Button';

const BUTTON_BORDER_RADIUS = 20;
const BUTTON_MARGIN = '7px';
const BUTTON_WIDTH = '315px';

const BUTTON_STYLE: React.CSSProperties = {
    width: BUTTON_WIDTH,
    fontSize: '1.5em',
    margin: BUTTON_MARGIN,
    padding: '10px',
    borderRadius: `${BUTTON_BORDER_RADIUS}px`,
    cursor: 'pointer'
};

enum VersionState {
    CURRENT,
    UNKNOWN,
    OUTDATED,
    CHECKING,
    INSTALLING
}

interface HomeMenuProps {
    updateCallbacks: {
        setOnUpdateAvailable: (callback: () => void) => void;
        setOnUpdateReady: (callback: () => void) => void;
        setOnNoUpdateFound: (callback: () => void) => void;
        setOnOffline: (callback: () => void) => void;
    };
}

const HomeMenu: React.FC<HomeMenuProps> = ({ updateCallbacks }) => {
    const navigate = useNavigate();
    const [versionState, setVersionState] = useState(VersionState.CHECKING);

    useEffect(() => {
        updateCallbacks.setOnUpdateAvailable(() => {
            console.log('Newer version of the app is available - installing...');
            setVersionState(VersionState.INSTALLING);
        });

        updateCallbacks.setOnUpdateReady(() => {
            console.log('Update is ready to install');
            setVersionState(VersionState.OUTDATED);
        });

        updateCallbacks.setOnNoUpdateFound(() => {
            console.log('No update of the app has been found');
            setVersionState(VersionState.CURRENT);
        });

        updateCallbacks.setOnOffline(() => {
            console.log('App is offline and can not check for updates');
            setVersionState(VersionState.UNKNOWN);
        });
    }, [updateCallbacks]);

    const versionStateStyle: React.CSSProperties = {
        position: 'fixed',
        top: '10px',
        left: '10px'
    };

    const versionLabelStyle: React.CSSProperties = {
        position: 'fixed',
        bottom: 0,
        left: 0,
        color: 'grey',
        fontSize: '12px'
    };

    return (
        <div style={{ color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100dvh' }}>
            <div style={versionStateStyle}>{versionStateUi(versionState)}</div>
            <ProfileUi />
            <code style={versionLabelStyle}>{APP_VERSION}</code>
            <div style={{ fontSize: '2em', fontWeight: 'bold', marginBottom: '2px' }}>Novelty Games</div>
            <div>Created by: Kyle Hutchinson</div>
            <div><br /></div>
            <button style={BUTTON_STYLE} onClick={() => navigate(R.TRIVIA.fullPath)}>Trivia</button>
            <button style={BUTTON_STYLE} onClick={() => navigate(R.BOARD_GAMES.fullPath)}>Board Games</button>
            <div style={{ display: 'flex', width: BUTTON_WIDTH, height: '4.5em', gap: '10px', margin: BUTTON_MARGIN }}>
                <Button fontScale={1.5} borderRadius={BUTTON_BORDER_RADIUS} onClick={() => navigate(R.GAMES_2D.fullPath)}>2D Games</Button>
                <Button fontScale={1.5} borderRadius={BUTTON_BORDER_RADIUS} onClick={() => navigate(R.GAMES_3D.fullPath)}>3D Games</Button>
            </div>
            <button style={BUTTON_STYLE} onClick={() => navigate(R.MOBILE_GAMES.fullPath)}>Mobile Games</button>
            <button style={BUTTON_STYLE} onClick={() => navigate(R.TOOLS.fullPath)}>Tools</button>
        </div>
    );
};

async function handleUpdateAppClick(): Promise<void> {
    if ('serviceWorker' in navigator) {
        try {
            const registration = await navigator.serviceWorker.ready;
            if (registration.waiting) {
                registration.waiting.postMessage({ type: 'SKIP_WAITING' });
                await new Promise(resolve => setTimeout(resolve, 500));
            }
        } catch (error) {
            console.warn('Error checking service worker before reload:', error);
        }
    }
    window.location.reload();
}

function versionStateUi(versionState: VersionState) {
    switch (versionState) {
        case VersionState.CHECKING:
            return <>Checking for updates...</>;
        case VersionState.CURRENT:
            return <>Up-to-date</>;
        case VersionState.INSTALLING:
            return <>Installing update...</>;
        case VersionState.OUTDATED:
            return <Button
                onClick={handleUpdateAppClick}
                fontScale={1.25}
            >
                <div style={{ padding: '2px' }}>Update App</div>
            </Button>;
        case VersionState.UNKNOWN:
            return <>Offline</>;
    }
}

export default HomeMenu;
