import { useState } from "react";
import HomeButton from "../../ui/HomeButton";

interface HomeProps {
    onHomeButtonClicked: () => void;
}

interface UiState { }
class MenuUiState implements UiState { }

const Home: React.FC<HomeProps> = ({ onHomeButtonClicked }) => {
    const [uiState, setUiState] = useState<UiState>(new MenuUiState());

    const onForTheStats2Click = () => {
        window.alert('Work in progress!');
    }

    return Ui(uiState, onHomeButtonClicked, onForTheStats2Click);
};

function Ui(uiState: UiState, onHomeButtonClicked: () => void, onForTheStats2Click: () => void) {
    if (uiState instanceof MenuUiState) {
        return MenuUi(onHomeButtonClicked, onForTheStats2Click);
    } else {
        throw new Error('UiState not supported: ' + uiState);
    }
}

function MenuUi(onHomeButtonClicked: () => void, onForTheStats2Click: () => void) {
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
        <div style={{ fontSize: '1.75em', marginBottom: '1em' }}>🔧 Tools 🔨</div>
        <button style={buttonStyle} onClick={onForTheStats2Click}>For The Stats 2 👑</button>
    </div>;
}

export default Home;
