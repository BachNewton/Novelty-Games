import { useState } from "react";
import HomeButton from "../../ui/HomeButton";
import Game3D from "./Game3D";
import ToddlerCompanionApp from "../toddler/ToddlerCompanionApp";

interface HomeProps {
    onHomeButtonClicked: () => void;
}

interface UiState { }
class MenuUiState implements UiState { }
class Game3DState implements UiState { }
class ToddlerState implements UiState { }

const Home: React.FC<HomeProps> = ({ onHomeButtonClicked }) => {
    const [uiState, setUiState] = useState<UiState>(new MenuUiState());

    const onMarbleClick = () => {
        setUiState(new Game3DState());
    };

    const onToddlerClick = () => {
        setUiState(new ToddlerState());
    };

    return Ui(uiState, onHomeButtonClicked, onMarbleClick, onToddlerClick);
};

function Ui(uiState: UiState, onHomeButtonClicked: () => void, onMarbleClick: () => void, onToddlerClick: () => void) {
    if (uiState instanceof MenuUiState) {
        return MenuUi(onHomeButtonClicked, onMarbleClick, onToddlerClick);
    } else if (uiState instanceof Game3DState) {
        return <Game3D />;
    } else if (uiState instanceof ToddlerState) {
        return <ToddlerCompanionApp />;
    } else {
        throw new Error('UiState not supported: ' + uiState);
    }
}

function MenuUi(onHomeButtonClicked: () => void, onMarbleClick: () => void, onToddlerClick: () => void) {
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
    </div>;
}

export default Home;
