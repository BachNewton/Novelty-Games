import { useEffect, useState } from 'react';
import '../css/Home.css';
import Game from './Game';
import { DataType, Data, Rollercoaster } from '../logic/Data';
import { get as getFromRepo } from '../logic/Repository';
import { ProgressUpdater } from '../logic/ProgressUpdater';
import { deleteData as deleteDataFromDb, isDataStored as isDataStoredInDb } from '../logic/Database';
import Filter from './Filter';
import { RollercoasterFilter, deleteFilter, filter, saveFilter } from '../logic/FilterRepo';

const APP_VERSION = 'v4.6.1';

interface HomeProps {
    updateListener: { onUpdateAvailable: () => void, onNoUpdateFound: () => void };
}

interface State {
    ui: UiState;
    data: Promise<Array<Data>>;
    dataType: DataType;
    isDataStored: Map<DataType, boolean>;
    versionState: VersionState;
}

enum UiState {
    HOME,
    GAME,
    FILTER
}

enum VersionState {
    CURRENT,
    UNKNOWN,
    OUTDATED,
    CHECKING
}

const progressUpdater = new ProgressUpdater();

const Home: React.FC<HomeProps> = ({ updateListener }) => {
    const [state, setState] = useState({ ui: UiState.HOME, isDataStored: new Map(), versionState: VersionState.CHECKING } as State);
    const [refreshDataStoredNeeded, setRefreshDataStoredNeeded] = useState(true);

    useEffect(() => {
        updateListener.onUpdateAvailable = () => {
            console.log('Newer version of the app is available');
            state.versionState = VersionState.OUTDATED;
            setState({ ...state });
        };

        updateListener.onNoUpdateFound = () => {
            console.log('No update of the app has been found');
            state.versionState = VersionState.CURRENT;
            setState({ ...state });
        };

        if (!navigator.onLine) {
            console.log('App if offline and can not check for updates');
            state.versionState = VersionState.UNKNOWN;
        }
    }, [state]);

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

    const onGameClickMap = getOnGameClickMap(
        [DataType.ROLLERCOASTERS, DataType.MUSIC, DataType.FLAG_GAME, DataType.POKEMON],
        state,
        setState
    );

    const onFilterRollercoastersClick = () => {
        state.data = getFromRepo(DataType.ROLLERCOASTERS, progressUpdater);
        state.ui = UiState.FILTER;
        setState({ ...state });
    };

    const onDeleteRollercoastersClick = () => {
        if (confirmedDelete(DataType.ROLLERCOASTERS) === false) return;

        deleteDataFromDb(DataType.ROLLERCOASTERS);
        deleteFilter();
        state.isDataStored.set(DataType.ROLLERCOASTERS, false);
        setState({ ...state });
    };

    const onDeleteMusicClick = () => {
        if (confirmedDelete(DataType.MUSIC) === false) return;

        deleteDataFromDb(DataType.MUSIC);
        state.isDataStored.set(DataType.MUSIC, false);
        setState({ ...state });
    };

    const onDeleteFlagGameClick = () => {
        if (confirmedDelete(DataType.FLAG_GAME) === false) return;

        deleteDataFromDb(DataType.FLAG_GAME);
        state.isDataStored.set(DataType.FLAG_GAME, false);
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

    const onHomeClicked = () => {
        state.ui = UiState.HOME;
        setRefreshDataStoredNeeded(true);
        setState({ ...state });
    };

    const onFilterCancelClicked = () => {
        state.ui = UiState.HOME;
        setState({ ...state });
    };

    const onFilterConfirmClicked = (rollercoasterFilter: RollercoasterFilter) => {
        saveFilter(rollercoasterFilter);
        state.ui = UiState.HOME;
        setState({ ...state });
    };

    switch (state.ui) {
        case UiState.HOME:
            return HomeUi(
                state.versionState,
                state.isDataStored,
                onGameClickMap,
                onFilterRollercoastersClick,
                onDeleteRollercoastersClick,
                onDeleteMusicClick,
                onDeleteFlagGameClick,
                onDeletePokemonClick
            );
        case UiState.GAME:
            return <Game
                pendingData={state.data}
                dataType={state.dataType}
                onHomeClicked={onHomeClicked}
                progressListener={progressUpdater}
            />;
        case UiState.FILTER:
            return <Filter
                pendingCoasters={state.data as Promise<Array<Rollercoaster>>}
                onCancel={onFilterCancelClicked}
                onConfirm={onFilterConfirmClicked}
            />;
    }
};

function HomeUi(
    versionState: VersionState,
    isDataStored: Map<DataType, boolean>,
    onGameClickMap: Map<DataType, () => void>,
    onFilterRollercoastersClick: () => void,
    onDeleteRollercoastersClick: () => void,
    onDeleteMusicClick: () => void,
    onDeleteFlagGameClick: () => void,
    onDeletePokemonClick: () => void
) {

    const filterRollercoastersButtonUi = isDataStored.get(DataType.ROLLERCOASTERS) === true
        ? <button className='option-button' onClick={onFilterRollercoastersClick}>⚙️</button>
        : <></>;

    const deleteRollercoastersButtonUi = isDataStored.get(DataType.ROLLERCOASTERS) === true
        ? <button className='option-button' onClick={onDeleteRollercoastersClick}>🗑️</button>
        : <></>;

    const deleteMusicButtonUi = isDataStored.get(DataType.MUSIC) === true
        ? <button className='option-button' onClick={onDeleteMusicClick}>🗑️</button>
        : <></>;

    const deleteFlagGameButtonUi = isDataStored.get(DataType.FLAG_GAME) === true
        ? <button className='option-button' onClick={onDeleteFlagGameClick}>🗑️</button>
        : <></>;

    const deletePokemonButtonUi = isDataStored.get(DataType.POKEMON_ALL) === true || isDataStored.get(DataType.POKEMON) === true
        ? <button className='option-button' onClick={onDeletePokemonClick}>🗑️</button>
        : <></>;

    return <div className='Home'>
        <div id='version-state'>{VersionStateUi(versionState)}</div>
        <code id='version-label'>{APP_VERSION}</code>
        <h3>🃏 Kyle's Novelty Trivia Games 🕹️</h3>
        <div>Created by: Kyle Hutchinson</div>
        <div><br /><br /><br /></div>
        <div className='game-option'>
            <button className='play-button' onClick={onGameClickMap.get(DataType.ROLLERCOASTERS)}>{getGameName(DataType.ROLLERCOASTERS)}</button>
            {filterRollercoastersButtonUi}
            {deleteRollercoastersButtonUi}
        </div>
        <div className='game-option'>
            <button className='play-button' onClick={onGameClickMap.get(DataType.MUSIC)}>{getGameName(DataType.MUSIC)}</button>
            {deleteMusicButtonUi}
        </div>
        <div className='game-option'>
            <button className='play-button' onClick={onGameClickMap.get(DataType.FLAG_GAME)}>{getGameName(DataType.FLAG_GAME)}</button>
            {deleteFlagGameButtonUi}
        </div>
        <div className='game-option'>
            <button className='play-button' onClick={onGameClickMap.get(DataType.POKEMON)}>{getGameName(DataType.POKEMON)}</button>
            {deletePokemonButtonUi}
        </div>
    </div>;
}

function VersionStateUi(versionState: VersionState) {
    switch (versionState) {
        case VersionState.CHECKING:
            return <>☁️ Checking for updates...</>;
        case VersionState.CURRENT:
            return <>✔️ Up-to-date</>;
        case VersionState.OUTDATED:
            return <button onClick={() => { window.location.reload() }}>🔄 Update App</button>;
        case VersionState.UNKNOWN:
            return <>✖️ Offline</>;
    }
}

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
        case DataType.FORTNITE_FESTIVAL:
            return 'Fortnite Festival 👨‍🎤';
        default:
            throw new Error('Unsupported DataType: ' + dataType);
    }
}

function getOnGameClickMap(
    dataTypes: Array<DataType>,
    state: State,
    setState: React.Dispatch<React.SetStateAction<State>>
): Map<DataType, () => void> {
    const onGameClickMap = new Map<DataType, () => void>();

    for (const dataType of dataTypes) {
        onGameClickMap.set(dataType, () => {
            const data = getFromRepo(getRepoBaseDataType(dataType), progressUpdater);
            state.data = hasFilter(dataType) ? filter(data as Promise<Array<Rollercoaster>>) : data;
            state.dataType = dataType;
            state.ui = UiState.GAME;

            setState({ ...state });
        });
    }

    return onGameClickMap;
}

function getRepoBaseDataType(dataType: DataType): DataType {
    switch (dataType) {
        case DataType.POKEMON:
            return DataType.POKEMON_ALL;
        case DataType.ROLLERCOASTERS:
        case DataType.MUSIC:
        case DataType.FLAG_GAME:
        case DataType.FORTNITE_FESTIVAL:
            return dataType;
        default:
            throw new Error('Unsupported DataType: ' + dataType);
    }
}

function hasFilter(dataType: DataType): boolean {
    switch (dataType) {
        case DataType.ROLLERCOASTERS:
            return true;
        case DataType.MUSIC:
        case DataType.FLAG_GAME:
        case DataType.POKEMON:
        case DataType.FORTNITE_FESTIVAL:
            return false;
        default:
            throw new Error('Unsupported DataType: ' + dataType);
    }
}

export default Home;
