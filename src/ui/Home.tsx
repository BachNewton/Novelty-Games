import { useEffect, useState } from 'react';
import MilleBornesHome from '../board-games/mille-bornes/ui/Home';
import TriviaHome from '../trivia/ui/Home';
import Games2DHome from '../game-2D/ui/Home';
import Games3DHome from '../game-3D/ui/Home';
import ToolsHome from '../tools/ui/Home';
import { getRoute, Route } from './Routing';
import FreeMarket from '../free-market/ui/FreeMarket';
import { NewtorkCommunicator as MilleBornesNetworkCommunicator } from '../board-games/mille-bornes/logic/NewtorkCommunicator';
import { createFreeMarketCommunicator } from '../free-market/logic/FreeMarketCommunicator';
import { createStorer } from '../util/Storage';
import { FreeMarketSave } from '../free-market/data/FreeMarketSave';
import SubMenu from './SubMenu';
import { State, VersionState, HomeState, MilleBornesState, TriviaState, Game2DState, Game3DState, ToolsState, BoardGamesState, FreeMarketState, LabyrinthState } from './State';
import Labyrinth from '../board-games/labyrinth/ui/Labyrinth';
import ProfileUi from './Profile';
import { createLabyrinthCommunicator } from '../board-games/labyrinth/logic/LabyrinthCommunicator';

const APP_VERSION = 'v3.2.7';

interface HomeProps {
    updateListener: { onUpdateAvailable: () => void, onNoUpdateFound: () => void };
}

interface OnClickHandlers {
    onHomeButtonClick: () => void;
    onMilleBornesClick: () => void;
    onTriviaClick: () => void;
    on2DGamesClick: () => void;
    on3DGamesClick: () => void;
    onToolsClick: () => void;
    onFreeMarketClick: () => void;
    onBoardGamesClick: () => void;
    onLabyrinthClick: () => void;
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

    const onClickHandlers: OnClickHandlers = {
        onHomeButtonClick: () => setState(new HomeState()),
        onMilleBornesClick: () => {
            const communicator = new MilleBornesNetworkCommunicator();
            setState(new MilleBornesState(communicator));
        },
        onTriviaClick: () => setState(new TriviaState()),
        on2DGamesClick: () => setState(new Game2DState()),
        on3DGamesClick: () => setState(new Game3DState()),
        onToolsClick: () => setState(new ToolsState()),
        onFreeMarketClick: () => setState(createFreeMarketState()),
        onBoardGamesClick: () => setState(new BoardGamesState()),
        onLabyrinthClick: () => setState(createLabyrinthState())
    };

    if (state instanceof TriviaState) {
        return <TriviaHome onHomeButtonClicked={onClickHandlers.onHomeButtonClick} />;
    } else if (state instanceof Game2DState) {
        return <Games2DHome onHomeButtonClicked={onClickHandlers.onHomeButtonClick} />;
    } else if (state instanceof Game3DState) {
        return <Games3DHome onHomeButtonClicked={onClickHandlers.onHomeButtonClick} />;
    } else if (state instanceof ToolsState) {
        return <ToolsHome onHomeButtonClicked={onClickHandlers.onHomeButtonClick} />;
    } else if (state instanceof FreeMarketState) {
        return <FreeMarket communicator={state.communicator} storer={state.storer} />;
    } else if (state instanceof BoardGamesState) {
        return boardGamesUi(state, onClickHandlers);
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
        bottom: 0,
        left: 0,
        color: 'grey',
        fontSize: '12px'
    };

    const buttonStyle: React.CSSProperties = {
        width: '75%',
        fontSize: '1.5em',
        margin: '0.5em',
        padding: '0.5em'
    };

    return <div style={{ color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <div style={versionStateStyle}>{versionStateUi(versionState)}</div>
        <ProfileUi />
        <code style={versionLabelStyle}>{APP_VERSION}</code>
        <div style={{ fontSize: '2em', fontWeight: 'bold', marginBottom: '2px' }}>🕹️ Novelty Games 🎰</div>
        <div>Created by: Kyle Hutchinson</div>
        <div><br /></div>
        <button style={buttonStyle} onClick={onClickHandlers.onTriviaClick}>Trivia 🤔</button>
        <button style={buttonStyle} onClick={onClickHandlers.onBoardGamesClick}>Board Games 🎲</button>
        <button style={buttonStyle} onClick={onClickHandlers.on2DGamesClick}>2D Games 🟦</button>
        <button style={buttonStyle} onClick={onClickHandlers.on3DGamesClick}>3D Games 🧊</button>
        <button style={buttonStyle} onClick={onClickHandlers.onToolsClick}>Tools 🔨</button>
        <button style={buttonStyle} onClick={onClickHandlers.onFreeMarketClick}>Free Market 💸</button>
    </div>;
}

function versionStateUi(versionState: VersionState) {
    switch (versionState) {
        case VersionState.CHECKING:
            return <>☁️ Checking for updates...</>;
        case VersionState.CURRENT:
            return <>✔️ Up-to-date</>;
        case VersionState.OUTDATED:
            return <button style={{ fontSize: '1em' }} onClick={() => { window.location.reload() }}>🔄 Update App</button>;
        case VersionState.UNKNOWN:
            return <>✖️ Offline</>;
    }
}

function boardGamesUi(boardGamesState: BoardGamesState, onClickHandlers: OnClickHandlers): JSX.Element {
    if (boardGamesState instanceof MilleBornesState) {
        return <MilleBornesHome onHomeButtonClicked={onClickHandlers.onHomeButtonClick} communicator={boardGamesState.communicator} />;
    } else if (boardGamesState instanceof LabyrinthState) {
        return <Labyrinth communicator={boardGamesState.communicator} />;
    }

    return <SubMenu
        onHomeButtonClicked={onClickHandlers.onHomeButtonClick}
        header='🃏 Board Games 🎲'
        menuItems={[
            { buttonText: 'Mille Bornes 🏎️', onClick: onClickHandlers.onMilleBornesClick },
            { buttonText: 'Labyrinth 🧩', onClick: onClickHandlers.onLabyrinthClick }
        ]}
    />;
}

function getInitialState(): State {
    const route = getRoute();

    switch (route) {
        case Route.MARBLE_GAME:
        case Route.KNIGHT_GAME:
            return new Game3DState();
        case Route.FREE_MARKET:
            return createFreeMarketState();
        case Route.LABYRINTH:
            return createLabyrinthState();
        case Route.CAT:
            return new Game2DState();
        case Route.MUSIC_PLAYER:
            return new ToolsState();
        default:
            return new HomeState();
    }
}

function createFreeMarketState(): FreeMarketState {
    const communicator = createFreeMarketCommunicator();
    const storer = createStorer<FreeMarketSave>();

    return new FreeMarketState(communicator, storer);
}

function createLabyrinthState(): LabyrinthState {
    const communicator = createLabyrinthCommunicator();

    return new LabyrinthState(communicator);
}

export default Home;
