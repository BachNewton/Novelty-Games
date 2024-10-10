import { useState } from "react";
import HomeButton from "../../ui/HomeButton";
import Game2D from "./Game2D";
import { GameWorldType } from "../worlds/GameWorldType";

interface HomeProps {
    onHomeButtonClicked: () => void;
}

interface UiState { }
class MenuUiState implements UiState { }
class CarnivalUiState implements UiState { }
class WigglersState implements UiState { }

const Home: React.FC<HomeProps> = ({ onHomeButtonClicked }) => {
    const [uiState, setUiState] = useState<UiState>(new MenuUiState());

    const onCarnivalClick = () => {
        setUiState(new CarnivalUiState());
    }

    const onWigglersClick = () => {
        setUiState(new WigglersState());
    };

    return Ui(uiState, onHomeButtonClicked, onCarnivalClick, onWigglersClick);
};

function Ui(uiState: UiState, onHomeButtonClicked: () => void, onWigglersClick: () => void, onCarnivalClick: () => void) {
    if (uiState instanceof MenuUiState) {
        return MenuUi(onHomeButtonClicked, onCarnivalClick, onWigglersClick);
    } else if (uiState instanceof CarnivalUiState) {
        return <Game2D goHome={onHomeButtonClicked} gameWorldType={GameWorldType.CARNIVAL} />;
    } else if (uiState instanceof WigglersState) {
        return <Game2D goHome={onHomeButtonClicked} gameWorldType={GameWorldType.WIGGLERS} />;
    } else {
        throw new Error('UiState not supported: ' + uiState);
    }
}

function MenuUi(onHomeButtonClicked: () => void, onWigglersClick: () => void, onCarnivalClick: () => void) {
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
    </div>;
}

export default Home;
