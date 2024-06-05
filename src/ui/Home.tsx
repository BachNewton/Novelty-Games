import { useState } from 'react';
import '../css/Home.css';
import Game from './Game';
import { DataType, Data } from '../logic/Data';
import { get as getFromRepo } from '../logic/Repository';
import { ProgressUpdater } from '../logic/ProgressUpdater';
import { deleteData as deleteDataFromDb, isDataStored as isDataStoredInDb } from '../logic/Database';

const APP_VERSION = 'v3.2.1';

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
    const [refreshDataStoredNeeded, setRefreshDataStoredNeeded] = useState(true);

    if (refreshDataStoredNeeded) {
        for (const dataTypeName in DataType) {
            const dataType = dataTypeName as DataType

            isDataStoredInDb(dataType).then(isStored => {
                state.isDataStored.set(dataType, isStored);
                setState({ ...state });
            });
        }

        setRefreshDataStoredNeeded(false);
    }

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
        if (confirmedDelete(DataType.ROLLERCOASTERS) === false) return;

        deleteDataFromDb(DataType.ROLLERCOASTERS);
        state.isDataStored.set(DataType.ROLLERCOASTERS, false);
        setState({ ...state });
    };

    const onDeleteMusicClick = () => {
        if (confirmedDelete(DataType.MUSIC) === false) return;

        deleteDataFromDb(DataType.MUSIC);
        state.isDataStored.set(DataType.MUSIC, false);
        setState({ ...state });
    };

    const onDeletePokemonClick = () => {
        if (confirmedDelete(DataType.POKEMON) === false) return;

        deleteDataFromDb(DataType.POKEMON_ALL);
        deleteDataFromDb(DataType.POKEMON);
        state.isDataStored.set(DataType.POKEMON_ALL, false);
        state.isDataStored.set(DataType.POKEMON, false);
        setState({ ...state });
    };

    const deleteRollercoastersButtonUi = state.isDataStored.get(DataType.ROLLERCOASTERS) === true
        ? <button className='delete-button' onClick={onDeleteRollercoastersClick}>🗑️</button>
        : <></>;

    const deleteMusicButtonUi = state.isDataStored.get(DataType.MUSIC) === true
        ? <button className='delete-button' onClick={onDeleteMusicClick}>🗑️</button>
        : <></>;

    const deletePokemonButtonUi = state.isDataStored.get(DataType.POKEMON_ALL) === true || state.isDataStored.get(DataType.POKEMON) === true
        ? <button className='delete-button' onClick={onDeletePokemonClick}>🗑️</button>
        : <></>;

    const onHomeClicked = () => {
        state.ui = UiState.HOME;
        setRefreshDataStoredNeeded(true);
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
                    <button className='play-button' onClick={onRollercoastersClick}>{getGameName(DataType.ROLLERCOASTERS)}</button>
                    {deleteRollercoastersButtonUi}
                </div>
                <div className='game-option'>
                    <button className='play-button' onClick={onMusicClick}>{getGameName(DataType.MUSIC)}</button>
                    {deleteMusicButtonUi}
                </div>
                <div className='game-option'>
                    <button className='play-button' onClick={onFlagGameClick}>{getGameName(DataType.FLAG_GAME)}</button>
                </div>
                <div className='game-option'>
                    <button className='play-button' onClick={onPokemonClick}>{getGameName(DataType.POKEMON)}</button>
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

function confirmedDelete(dataType: DataType): boolean {
    const gameName = getGameName(dataType);
    return window.confirm(`Are you sure you want to delete your stored data for ${gameName}? Your High Score will NOT be deleted.`);
}

function getGameName(dataType: DataType): string {
    switch (dataType) {
        case DataType.ROLLERCOASTERS:
            return 'Rollercoasters 🎢';
        case DataType.MUSIC:
            return 'Music 🎵';
        case DataType.FLAG_GAME:
            return 'Flag Game 🎌';
        case DataType.POKEMON:
            return 'Pokémon 👾';
        default:
            throw new Error('Unsupported DataType: ' + dataType);
    }
}

export default Home;
