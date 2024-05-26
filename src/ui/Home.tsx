import { useState } from 'react';
import '../css/Home.css';
import Game from './Game';
import { DataType, Data } from '../logic/Data';
import { get as getFromRepo } from '../logic/Repository';

const APP_VERSION = 'v2.0.0';

interface State {
    ui: UiState,
    data: Promise<Array<Data>>,
    dataType: DataType
}

enum UiState {
    HOME,
    GAME
}

const Home: React.FC = () => {
    const [state, setState] = useState({ ui: UiState.HOME } as State);

    const onRollercoastersClick = () => {
        state.data = getFromRepo(DataType.ROLLERCOASTERS);
        state.dataType = DataType.ROLLERCOASTERS;
        state.ui = UiState.GAME;
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
        return <Game pendingData={state.data} dataType={state.dataType} />;
    }
};

export default Home;
