import { useState } from "react";
import HomeButton from "../../ui/HomeButton";
import MusicPlayerHome from "../music-player/ui/Home";
import FortniteFestivalHome, { getFestivalSongs } from "../fortnite-festival/ui/Home";
import DatabaseDebugHome from "../database-debug/ui/Home";
import { getRoute, Route } from "../../ui/Routing";
import { createNetworkService, NetworkedApplication } from "../../util/networking/NetworkService";
import { FestivalSong } from "../../trivia/data/Data";
import { createDatabase } from "../../util/database/IndexedDbDatabase";

interface HomeProps {
    onHomeButtonClicked: () => void;
}

interface UiState { }
class MenuUiState implements UiState { }
class MusicPlayerUiState implements UiState { }
class FortniteFestivalUiState implements UiState {
    loadingSongs: Promise<Array<FestivalSong>> = getFestivalSongs();
}
class DatabaseDebugUiState implements UiState { }

interface OnClickHandlers {
    onHomeButtonClicked: () => void;
    onForTheStats2Click: () => void;
    onMusicPlayerClick: () => void;
    onFortniteFestivalClick: () => void;
    onDatabaseDebugClick: () => void;
}

const Home: React.FC<HomeProps> = ({ onHomeButtonClicked }) => {
    const [uiState, setUiState] = useState<UiState>(getInitialState());

    const onClickHandlers: OnClickHandlers = {
        onHomeButtonClicked: onHomeButtonClicked,
        onForTheStats2Click: () => window.alert('Work in progress!'),
        onMusicPlayerClick: () => setUiState(new MusicPlayerUiState()),
        onFortniteFestivalClick: () => setUiState(new FortniteFestivalUiState()),
        onDatabaseDebugClick: () => setUiState(new DatabaseDebugUiState())
    };

    return Ui(uiState, onClickHandlers);
};

function Ui(uiState: UiState, onClickHandlers: OnClickHandlers) {
    if (uiState instanceof MenuUiState) {
        return MenuUi(onClickHandlers);
    } else if (uiState instanceof MusicPlayerUiState) {
        return <MusicPlayerHome
            networkService={createNetworkService(NetworkedApplication.MUSIC_PLAYER)}
        />;
    } else if (uiState instanceof FortniteFestivalUiState) {
        return <FortniteFestivalHome loadingSongs={uiState.loadingSongs} />;
    } else if (uiState instanceof DatabaseDebugUiState) {
        return <DatabaseDebugHome database={createDatabase('example', ['numbers', 'words'])} />;
    } else {
        throw new Error('UiState not supported: ' + uiState);
    }
}

function MenuUi(onClickHandlers: OnClickHandlers) {
    const containerStyle: React.CSSProperties = {
        color: 'white',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
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
        <button style={buttonStyle} onClick={onClickHandlers.onFortniteFestivalClick}>Fortnite Festival Difficulty Ranking 🎛️</button>
        <button style={buttonStyle} onClick={onClickHandlers.onDatabaseDebugClick}>Database Debug 📦</button>
    </div>;
}

function getInitialState(): UiState {
    const route = getRoute();

    switch (route) {
        case Route.MUSIC_PLAYER:
            return new MusicPlayerUiState();
        case Route.FORTNITE_FESTIVAL:
            return new FortniteFestivalUiState();
        default:
            return new MenuUiState();
    }
}

export default Home;
