import { useState } from 'react';
import '../css/Home.css';
import Game from './Game';
import { DataType, Data } from '../logic/Data';
import { get as getFromRepo } from '../logic/Repository';

const APP_VERSION = 'v3.0.0';

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
        state.data = getFromRepo(DataType.MUSIC);
        state.dataType = DataType.MUSIC;
        state.ui = UiState.GAME;
        setState({ ...state });
    };

    const onFlagGameClick = () => {
        alert('Flag Game is not ready yet. Please come back later.');
    };

    const onPokemonClick = () => {
        state.data = getFromRepo(DataType.POKEMON_ALL);
        state.dataType = DataType.POKEMON;
        state.ui = UiState.GAME;
        setState({ ...state });
    };

    const onHomeClicked = () => {
        state.ui = UiState.HOME;
        setState({ ...state });
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
                <button onClick={onFlagGameClick}>Flag Game 🎌</button>
                <button onClick={onPokemonClick}>Pokémon 👾</button>
            </div>
        );
    } else {
        return <Game pendingData={state.data} dataType={state.dataType} onHomeClicked={onHomeClicked} />;
    }
};

export default Home;
