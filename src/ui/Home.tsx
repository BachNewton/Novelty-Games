import { useState } from 'react';
import '../css/Home.css';
import App from './App';
import { DataType, Rollercoaster } from '../logic/Data';
import { get as getFromRepo } from '../logic/Repository';

const APP_VERSION = 'v1.3.0';

interface State {
    ui: UiState,
    coasters: Promise<Array<Rollercoaster>>
}

enum UiState {
    HOME,
    ROLLERCOASTERS
}

const Home: React.FC = () => {
    const [state, setState] = useState({ ui: UiState.HOME } as State);

    const onRollercoastersClick = () => {
        state.coasters = getFromRepo(DataType.ROLLERCOASTERS);
        state.ui = UiState.ROLLERCOASTERS;
        setState({ ...state });
    };

    const onMusicClick = () => {
        alert('Work in progress. Please come back later.');
    };

    if (state.ui === UiState.HOME) {
        return (
            <div className='Home'>
                <code id='version-label'>{APP_VERSION}</code>
                <h3>🃏 Kyle's Novelty Trivia Games 🕹️</h3>
                <div>Created by: Kyle Hutchinson</div>
                <div><br /><br /><br /></div>
                <button onClick={onRollercoastersClick}>Rollercoasters 🎢</button>
                <button onClick={onMusicClick}>Music 🎵</button>
            </div>
        );
    } else {
        return <App prop={state.coasters} />;
    }
};

export default Home;
