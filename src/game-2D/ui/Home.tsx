import { useState } from "react";
import HomeButton from "../../ui/HomeButton";
import Game2D from "./Game2D";
import { GameWorldType } from "../worlds/GameWorldType";
import { getRoute, Route } from "../../ui/Routing";

interface HomeProps {
    onHomeButtonClicked: () => void;
}

interface UiState { }
class MenuUiState implements UiState { }
class CarnivalUiState implements UiState { }
class WigglersState implements UiState { }
class CatState implements UiState { }
class PlatformerState implements UiState { }

interface ButtonClickedHandlers {
    onHomeButtonClicked: () => void;
    onWigglersClick: () => void;
    onCarnivalClick: () => void;
    onCatClick: () => void;
    onPlatformerClick: () => void;
}

const Home: React.FC<HomeProps> = ({ onHomeButtonClicked }) => {
    const [uiState, setUiState] = useState<UiState>(getInitialUiState());

    const buttonClickedHandlers: ButtonClickedHandlers = {
        onHomeButtonClicked: onHomeButtonClicked,
        onWigglersClick: () => {
            setUiState(new WigglersState());
        },
        onCarnivalClick: () => {
            setUiState(new CarnivalUiState());
        },
        onCatClick: () => {
            setUiState(new CatState());
        },
        onPlatformerClick: () => {
            setUiState(new PlatformerState());
        }
    };

    return Ui(uiState, buttonClickedHandlers);
};

function Ui(uiState: UiState, buttonClickedHandlers: ButtonClickedHandlers) {
    if (uiState instanceof MenuUiState) {
        return MenuUi(buttonClickedHandlers);
    } else if (uiState instanceof CarnivalUiState) {
        return <Game2D goHome={buttonClickedHandlers.onHomeButtonClicked} gameWorldType={GameWorldType.CARNIVAL} />;
    } else if (uiState instanceof WigglersState) {
        return <Game2D goHome={buttonClickedHandlers.onHomeButtonClicked} gameWorldType={GameWorldType.WIGGLERS} />;
    } else if (uiState instanceof CatState) {
        return <Game2D goHome={buttonClickedHandlers.onHomeButtonClicked} gameWorldType={GameWorldType.CAT} />;
    } else if (uiState instanceof PlatformerState) {
        return <Game2D goHome={buttonClickedHandlers.onHomeButtonClicked} gameWorldType={GameWorldType.PLATFORMER} />;
    } else {
        throw new Error('UiState not supported: ' + uiState);
    }
}

function MenuUi(buttonClickedHandlers: ButtonClickedHandlers) {
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
        <HomeButton onClick={buttonClickedHandlers.onHomeButtonClicked} />
        <div style={{ fontSize: '1.75em', marginBottom: '1em' }}>🟠 2D Games 🟦</div>
        <button style={buttonStyle} onClick={buttonClickedHandlers.onCarnivalClick}>Carnival 🎠</button>
        <button style={buttonStyle} onClick={buttonClickedHandlers.onWigglersClick}>Wigglers 👹</button>
        <button style={buttonStyle} onClick={buttonClickedHandlers.onCatClick}>Cat 🐈</button>
        <button style={buttonStyle} onClick={buttonClickedHandlers.onPlatformerClick}>Platformer 🦘</button>
    </div>;
}

function getInitialUiState(): UiState {
    const route = getRoute();

    switch (route) {
        case Route.CAT:
            return new CatState();
        case Route.PLATFORMER:
            return new PlatformerState();
        default:
            return new MenuUiState();
    }
}

export default Home;
