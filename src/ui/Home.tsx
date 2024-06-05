import { useEffect, useState } from 'react';
import '../css/Home.css';
import Game from './Game';
import { DataType, Data } from '../logic/Data';
import { get as getFromRepo } from '../logic/Repository';
import { ProgressUpdater } from '../logic/ProgressUpdater';
import { isDataStored as isDataStoredInDb } from '../logic/Database';

const APP_VERSION = 'v3.2.0';

interface State {
    ui: UiState,
    data: Promise<Array<Data>>,
    dataType: DataType,
    isDataStored: Map<DataType, boolean>
}

enum UiState {
    HOME,
    GAME
}

const progressUpdater = new ProgressUpdater();

const Home: React.FC = () => {
    const [state, setState] = useState({ ui: UiState.HOME, isDataStored: new Map() } as State);

    useEffect(() => {
        for (const dataTypeName in DataType) {
            const dataType = dataTypeName as DataType
            isDataStoredInDb(dataType).then(isStored => {
                state.isDataStored.set(dataType, isStored);
                setState({ ...state });
            });
        }
    }, [state.ui]);

    const onRollercoastersClick = () => {
        state.data = getFromRepo(DataType.ROLLERCOASTERS, progressUpdater);
        state.dataType = DataType.ROLLERCOASTERS;
        state.ui = UiState.GAME;
        setState({ ...state });
    };

    const onMusicClick = () => {
        state.data = getFromRepo(DataType.MUSIC, progressUpdater);
        state.dataType = DataType.MUSIC;
        state.ui = UiState.GAME;
        setState({ ...state });
    };

    const onFlagGameClick = () => {
        alert('Flag Game is not ready yet. Please come back later.');
    };

    const onPokemonClick = () => {
        state.data = getFromRepo(DataType.POKEMON_ALL, progressUpdater);
        state.dataType = DataType.POKEMON;
        state.ui = UiState.GAME;
        setState({ ...state });
    };

    const onDeleteRollercoastersClick = () => {
        //
    };

    const onDeleteMusicClick = () => {
        //
    };

    const onDeletePokemonClick = () => {
        //
    };

    const deleteRollercoastersButtonUi = state.isDataStored.get(DataType.ROLLERCOASTERS) === true
        ? <button className='delete-button' onClick={onDeleteRollercoastersClick}>🗑️</button>
        : <></>;

    const deleteMusicButtonUi = state.isDataStored.get(DataType.MUSIC) === true
        ? <button className='delete-button' onClick={onDeleteMusicClick}>🗑️</button>
        : <></>;

    const deletePokemonButtonUi = state.isDataStored.get(DataType.POKEMON_ALL) === true && state.isDataStored.get(DataType.POKEMON) === true
        ? <button className='delete-button' onClick={onDeletePokemonClick}>🗑️</button>
        : <></>;

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
                <div className='game-option'>
                    <button className='play-button' onClick={onRollercoastersClick}>Rollercoasters 🎢</button>
                    {deleteRollercoastersButtonUi}
                </div>
                <div className='game-option'>
                    <button className='play-button' onClick={onMusicClick}>Music 🎵</button>
                    {deleteMusicButtonUi}
                </div>
                <div className='game-option'>
                    <button className='play-button' onClick={onFlagGameClick}>Flag Game 🎌</button>
                </div>
                <div className='game-option'>
                    <button className='play-button' onClick={onPokemonClick}>Pokémon 👾</button>
                    {deletePokemonButtonUi}
                </div>
            </div>
        );
    } else {
        return <Game
            pendingData={state.data}
            dataType={state.dataType}
            onHomeClicked={onHomeClicked}
            progressListener={progressUpdater}
        />;
    }
};

export default Home;
