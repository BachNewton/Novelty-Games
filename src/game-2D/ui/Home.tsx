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

const Home: React.FC<HomeProps> = ({ onHomeButtonClicked }) => {
    const [uiState, setUiState] = useState<UiState>(getInitialUiState());

    const onCarnivalClick = () => {
        setUiState(new CarnivalUiState());
    }

    const onWigglersClick = () => {
        setUiState(new WigglersState());
    };

    const onCatClick = () => {
        setUiState(new CatState());
    };

    return Ui(uiState, onHomeButtonClicked, onCarnivalClick, onWigglersClick, onCatClick);
};

function Ui(uiState: UiState, onHomeButtonClicked: () => void, onWigglersClick: () => void, onCarnivalClick: () => void, onCatClick: () => void) {
    if (uiState instanceof MenuUiState) {
        return MenuUi(onHomeButtonClicked, onCarnivalClick, onWigglersClick, onCatClick);
    } else if (uiState instanceof CarnivalUiState) {
        return <Game2D goHome={onHomeButtonClicked} gameWorldType={GameWorldType.CARNIVAL} />;
    } else if (uiState instanceof WigglersState) {
        return <Game2D goHome={onHomeButtonClicked} gameWorldType={GameWorldType.WIGGLERS} />;
    } else if (uiState instanceof CatState) {
        return <Game2D goHome={onHomeButtonClicked} gameWorldType={GameWorldType.CAT} />;
    } else {
        throw new Error('UiState not supported: ' + uiState);
    }
}

function MenuUi(onHomeButtonClicked: () => void, onWigglersClick: () => void, onCarnivalClick: () => void, onCatClick: () => void) {
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
        <div style={{ fontSize: '1.75em', marginBottom: '1em' }}>🟠 2D Games 🟦</div>
        <button style={buttonStyle} onClick={onCarnivalClick}>Carnival 🎠</button>
        <button style={buttonStyle} onClick={onWigglersClick}>Wigglers 👹</button>
        <button style={buttonStyle} onClick={onCatClick}>Cat 🐈</button>
    </div>;
}

function getInitialUiState(): UiState {
    const route = getRoute();

    switch (route) {
        case Route.CAT:
            return new CatState();
        default:
            return new MenuUiState();
    }
}

export default Home;
