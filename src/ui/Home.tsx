import { useEffect, useState } from 'react';
import MilleBornesHome from '../board-games/mille-bornes/ui/Home';
import TriviaHome from '../trivia/ui/Home';
import Games2DHome from '../game-2D/ui/Home';
import Games3DHome from '../game-3D/ui/Home';
import ToolsHome from '../tools/ui/Home';
import { getRoute, Route } from './Routing';
import FreeMarket from '../mobile-games/free-market/ui/FreeMarket';
import Pets from '../mobile-games/pets/ui/Home';
import ToddlerTreasureHunt from '../mobile-games/toddler-treasure-hunt/ui/Home';
import { NewtorkCommunicator as MilleBornesNetworkCommunicator } from '../board-games/mille-bornes/logic/NewtorkCommunicator';
import { createFreeMarketCommunicator } from '../mobile-games/free-market/logic/FreeMarketCommunicator';
import { createStorer } from '../util/Storage';
import { FreeMarketSave } from '../mobile-games/free-market/data/FreeMarketSave';
import SubMenu from './SubMenu';
import { State, VersionState, HomeState, MilleBornesState, TriviaState, Game2DState, Game3DState, ToolsState, BoardGamesState, FreeMarketState, LabyrinthState, PetsState, MobileGamesState, ToddlerTreasureHuntState } from './State';
import Labyrinth from '../board-games/labyrinth/ui/Labyrinth';
import ProfileUi from './Profile';
import { createLabyrinthCommunicator } from '../board-games/labyrinth/logic/LabyrinthCommunicator';
import { APP_VERSION } from '../Versioning';
import Button from '../util/ui/Button';
import { createPetsDatabase } from '../mobile-games/pets/logic/PetsDatabase';
import { createPetsDebugger } from '../mobile-games/pets/logic/PetsDebugger';

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

interface HomeProps {
    updateListener: { onUpdateAvailable: () => void, onNoUpdateFound: () => void };
}

interface OnClickHandlers {
    onHomeButtonClick: () => void;
    onMilleBornesClick: () => void;
    onTriviaClick: () => void;
    on2DGamesClick: () => void;
    on3DGamesClick: () => void;
    onMobileGamesClick: () => void;
    onToolsClick: () => void;
    onFreeMarketClick: () => void;
    onBoardGamesClick: () => void;
    onLabyrinthClick: () => void;
    onPetsClick: () => void;
    onToddlerTreasureHuntClick: () => void;
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
        onMobileGamesClick: () => setState(new MobileGamesState()),
        onLabyrinthClick: () => setState(createLabyrinthState()),
        onPetsClick: () => setState(new PetsState()),
        onToddlerTreasureHuntClick: () => setState(new ToddlerTreasureHuntState())
    };

    if (state instanceof TriviaState) {
        return <TriviaHome onHomeButtonClicked={onClickHandlers.onHomeButtonClick} />;
    } else if (state instanceof Game2DState) {
        return <Games2DHome onHomeButtonClicked={onClickHandlers.onHomeButtonClick} />;
    } else if (state instanceof Game3DState) {
        return <Games3DHome onHomeButtonClicked={onClickHandlers.onHomeButtonClick} />;
    } else if (state instanceof MobileGamesState) {
        return mobileGamesUi(state, onClickHandlers);
    } else if (state instanceof ToolsState) {
        return <ToolsHome onHomeButtonClicked={onClickHandlers.onHomeButtonClick} />;
    } else if (state instanceof BoardGamesState) {
        return boardGamesUi(state, onClickHandlers);
    } else {
        return HomeUi(versionState, onClickHandlers);
    }
};

function HomeUi(versionState: VersionState, onClickHandlers: OnClickHandlers) {
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

    return <div style={{ color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100dvh' }}>
        <div style={versionStateStyle}>{versionStateUi(versionState)}</div>
        <ProfileUi />
        <code style={versionLabelStyle}>{APP_VERSION}</code>
        <div style={{ fontSize: '2em', fontWeight: 'bold', marginBottom: '2px' }}>🕹️ Novelty Games 🎰</div>
        <div>Created by: Kyle Hutchinson</div>
        <div><br /></div>
        <button style={BUTTON_STYLE} onClick={onClickHandlers.onTriviaClick}>Trivia 🤔</button>
        <button style={BUTTON_STYLE} onClick={onClickHandlers.onBoardGamesClick}>Board Games 🎲</button>
        <div style={{ display: 'flex', width: BUTTON_WIDTH, height: '4.5em', gap: '10px', margin: BUTTON_MARGIN }}>
            <Button fontScale={1.5} borderRadius={BUTTON_BORDER_RADIUS} onClick={onClickHandlers.on2DGamesClick}>2D Games 🟦</Button>
            <Button fontScale={1.5} borderRadius={BUTTON_BORDER_RADIUS} onClick={onClickHandlers.on3DGamesClick}>3D Games 🧊</Button>
        </div>
        <button style={BUTTON_STYLE} onClick={onClickHandlers.onMobileGamesClick}>Mobile Games 📱</button>
        <button style={BUTTON_STYLE} onClick={onClickHandlers.onToolsClick}>Tools 🔨</button>
    </div>;
}

function versionStateUi(versionState: VersionState) {
    switch (versionState) {
        case VersionState.CHECKING:
            return <>☁️ Checking for updates...</>;
        case VersionState.CURRENT:
            return <>✔️ Up-to-date</>;
        case VersionState.OUTDATED:
            return <Button
                onClick={() => window.location.reload()}
                fontScale={1.25}
            >
                <div style={{ padding: '2px' }}>🔄 Update App</div>
            </Button>;
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

function mobileGamesUi(mobileGamesState: MobileGamesState, onClickHandlers: OnClickHandlers): JSX.Element {
    if (mobileGamesState instanceof FreeMarketState) {
        return <FreeMarket communicator={mobileGamesState.communicator} storer={mobileGamesState.storer} />;
    } else if (mobileGamesState instanceof PetsState) {
        const petsDatabase = createPetsDatabase();

        return <Pets
            database={petsDatabase}
            petsDebugger={createPetsDebugger(petsDatabase)}
        />;
    } else if (mobileGamesState instanceof ToddlerTreasureHuntState) {
        return <ToddlerTreasureHunt />;
    }

    return <SubMenu
        onHomeButtonClicked={onClickHandlers.onHomeButtonClick}
        header='📶 Mobile Games 📱'
        menuItems={[
            { buttonText: 'Free Market 💸', onClick: onClickHandlers.onFreeMarketClick },
            { buttonText: 'Pets 🐾', onClick: onClickHandlers.onPetsClick },
            { buttonText: 'Toddler Treasure Hunt 🐞', onClick: onClickHandlers.onToddlerTreasureHuntClick }
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
        case Route.PLATFORMER:
            return new Game2DState();
        case Route.MUSIC_PLAYER:
        case Route.FORTNITE_FESTIVAL:
            return new ToolsState();
        case Route.PETS:
            return new PetsState();
        case Route.TODDLER_TREASURE_HUNT:
            return new ToddlerTreasureHuntState();
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
