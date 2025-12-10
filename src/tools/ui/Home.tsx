import { useState } from "react";
import HomeButton from "../../ui/HomeButton";
import MusicPlayerHome from "../music-player/ui/Home";
import FortniteFestivalHome, { getFestivalSongs } from "../fortnite-festival/ui/Home";
import DatabaseDebugHome from "../database-debug/ui/Home";
import WinterCylingHome from "../winter-cycling/ui/Home";
import FractalExplorerHome from "../fractal-explorer/ui/Home";
import { getRoute, Route } from "../../ui/Routing";
import { createNetworkService, NetworkedApplication, NetworkService } from "../../util/networking/NetworkService";
import { FestivalSong } from "../../trivia/data/Data";
import { createDatabase } from "../../util/database/DatabaseImpl";
import { MusicIndex } from "../music-player/logic/MusicIndex";
import { createWinterCyclingNetworking, WinterCyclingNetworking } from "../winter-cycling/logic/WinterCyclingNetworking";

interface HomeProps {
    onHomeButtonClicked: () => void;
}

type UiState =
    | MenuUiState
    | MusicPlayerUiState
    | FortniteFestivalUiState
    | DatabaseDebugUiState
    | WinterCylingUiState
    | FractalExplorerUiState;

interface MenuUiState {
    type: 'Menu';
}

interface MusicPlayerUiState {
    type: 'MusicPlayer';
    networkService: NetworkService<void>;
    musicIndexPromise: Promise<MusicIndex>;
}

interface FortniteFestivalUiState {
    type: 'FortniteFestival';
    loadingSongs: Promise<Array<FestivalSong>>;
}

interface DatabaseDebugUiState {
    type: 'DatabaseDebug';
}

interface WinterCylingUiState {
    type: 'WinterCycling';
    networking: WinterCyclingNetworking;
}

interface FractalExplorerUiState {
    type: 'FractalExplorer';
}

interface OnClickHandlers {
    onHomeButtonClicked: () => void;
    onForTheStats2Click: () => void;
    onMusicPlayerClick: () => void;
    onFortniteFestivalClick: () => void;
    onDatabaseDebugClick: () => void;
    onWinterCyclingClick: () => void;
    onFractalExplorerClick: () => void;
}

const Home: React.FC<HomeProps> = ({ onHomeButtonClicked }) => {
    const [uiState, setUiState] = useState<UiState>(getInitialState());

    const onClickHandlers: OnClickHandlers = {
        onHomeButtonClicked: onHomeButtonClicked,
        onForTheStats2Click: () => window.alert('Work in progress!'),
        onMusicPlayerClick: () => setUiState(createMusicPlayerUiState()),
        onFortniteFestivalClick: () => setUiState(createFortniteFestivalUiState()),
        onDatabaseDebugClick: () => setUiState(createDatabaseDebugUiState()),
        onWinterCyclingClick: () => setUiState(createWinterCyclingUiState()),
        onFractalExplorerClick: () => setUiState(createFractalExplorerUiState())
    };

    return Ui(uiState, onClickHandlers);
};

function Ui(uiState: UiState, onClickHandlers: OnClickHandlers) {
    switch (uiState.type) {
        case 'Menu':
            return MenuUi(onClickHandlers);
        case 'MusicPlayer':
            return <MusicPlayerHome
                networkService={uiState.networkService}
                musicIndexPromise={uiState.musicIndexPromise}
            />;
        case 'FortniteFestival':
            return <FortniteFestivalHome loadingSongs={uiState.loadingSongs} />;
        case 'DatabaseDebug':
            return <DatabaseDebugHome
                database={createDatabase('example', ['numbers', 'words'])}
            />;
        case 'WinterCycling':
            return <WinterCylingHome networking={uiState.networking} />;
        case 'FractalExplorer':
            return <FractalExplorerHome />;
    }
}

function MenuUi(onClickHandlers: OnClickHandlers) {
    const containerStyle: React.CSSProperties = {
        color: 'white',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100dvh',
        flexDirection: 'column'
    };

    const buttonStyle: React.CSSProperties = {
        width: '75%',
        fontSize: '1.5em',
        margin: '0.75em',
        padding: '0.5em'
    };

    return <div style={containerStyle}>
        <HomeButton onClick={onClickHandlers.onHomeButtonClicked} />
        <div style={{ fontSize: '1.75em', marginBottom: '1em' }}>🔧 Tools 🔨</div>
        <button style={buttonStyle} onClick={onClickHandlers.onForTheStats2Click}>For The Stats 2 👑</button>
        <button style={buttonStyle} onClick={onClickHandlers.onMusicPlayerClick}>Music Player 🎶</button>
        <button style={buttonStyle} onClick={onClickHandlers.onFortniteFestivalClick}>Fortnite Festival Difficulty Rankings 🎛️</button>
        <button style={buttonStyle} onClick={onClickHandlers.onDatabaseDebugClick}>Database Debug 📦</button>
        <button style={buttonStyle} onClick={onClickHandlers.onWinterCyclingClick}>Winter Cycling ❄️</button>
        <button style={buttonStyle} onClick={onClickHandlers.onFractalExplorerClick}>Fractal Explorer 🌀</button>
    </div>;
}

function getInitialState(): UiState {
    const route = getRoute();

    switch (route) {
        case Route.MUSIC_PLAYER:
            return createMusicPlayerUiState();
        case Route.FORTNITE_FESTIVAL:
            return createFortniteFestivalUiState();
        case Route.WINTER_CYCLING:
            return createWinterCyclingUiState();
        case Route.FRACTAL_EXPLORER:
            return createFractalExplorerUiState();
        default:
            return createMenuUiState();
    }
}

function createMusicPlayerUiState(): MusicPlayerUiState {
    return {
        type: 'MusicPlayer',
        networkService: createNetworkService(NetworkedApplication.MUSIC_PLAYER),
        musicIndexPromise: new Promise((resolve) => {
            import(/* webpackChunkName: "MusicIndex" */ '../music-player/logic/MusicIndex')
                .then(({ createMusicIndex }) => {
                    console.log('Loaded the MusicIndex module');
                    resolve(createMusicIndex());
                });
        })
    };
}

function createFortniteFestivalUiState(): FortniteFestivalUiState {
    return {
        type: 'FortniteFestival',
        loadingSongs: getFestivalSongs()
    };
}

function createDatabaseDebugUiState(): DatabaseDebugUiState {
    return {
        type: 'DatabaseDebug'
    };
}

function createWinterCyclingUiState(): WinterCylingUiState {
    return {
        type: 'WinterCycling',
        networking: createWinterCyclingNetworking()
    };
}

function createMenuUiState(): MenuUiState {
    return {
        type: 'Menu'
    };
}

function createFractalExplorerUiState(): FractalExplorerUiState {
    return {
        type: 'FractalExplorer'
    };
}

export default Home;
