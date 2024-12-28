import { useState } from "react";
import HomeButton from "../../ui/HomeButton";
import Game3D from "./Game3D";
import ToddlerCompanionApp from "../toddler/ToddlerCompanionApp";
import { getRoute, ROUTES } from "../../ui/Routing";

interface HomeProps {
    onHomeButtonClicked: () => void;
}

interface UiState { }
class MenuUiState implements UiState { }
class ToddlerState implements UiState { }
class Game3DState implements UiState {
    game: Game;

    constructor(game: Game) {
        this.game = game;
    }
}

export enum Game {
    MARBLE, KNIGHT
}

const Home: React.FC<HomeProps> = ({ onHomeButtonClicked }) => {
    const [uiState, setUiState] = useState<UiState>(getInitialUiState());

    const onMarbleClick = () => {
        setUiState(new Game3DState(Game.MARBLE));
    };

    const onKnightClick = () => {
        setUiState(new Game3DState(Game.KNIGHT));
    };

    const onToddlerClick = () => {
        setUiState(new ToddlerState());
    };

    return Ui(uiState, onHomeButtonClicked, onMarbleClick, onToddlerClick, onKnightClick);
};

function Ui(uiState: UiState, onHomeButtonClicked: () => void, onMarbleClick: () => void, onToddlerClick: () => void, onKnightClick: () => void) {
    if (uiState instanceof MenuUiState) {
        return MenuUi(onHomeButtonClicked, onMarbleClick, onToddlerClick, onKnightClick);
    } else if (uiState instanceof Game3DState) {
        return <Game3D game={uiState.game} />;
    } else if (uiState instanceof ToddlerState) {
        return <ToddlerCompanionApp />;
    } else {
        throw new Error('UiState not supported: ' + uiState);
    }
}

function MenuUi(onHomeButtonClicked: () => void, onMarbleClick: () => void, onToddlerClick: () => void, onKnightClick: () => void) {
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
        <HomeButton onClick={onHomeButtonClicked} />
        <div style={{ fontSize: '1.75em', marginBottom: '1em' }}>🎮 3D Games 🧊</div>
        <button style={buttonStyle} onClick={onMarbleClick}>Marble 🌐</button>
        <button style={buttonStyle} onClick={onToddlerClick}>Toddler Companion App 👶</button>
        <button style={buttonStyle} onClick={onKnightClick}>Knight ⚔️</button>
    </div>;
}

function getInitialUiState(): UiState {
    const route = getRoute();

    switch (route) {
        case ROUTES.MARBLE_GAME:
            return new Game3DState(Game.MARBLE);
        default:
            return new MenuUiState();
    }
}

export default Home;
