import { useEffect, useState } from 'react';
import '../css/Home.css';
import Game from './Game';
import { DataType, Data, Rollercoaster } from '../logic/Data';
import { get as getFromRepo } from '../logic/Repository';
import { ProgressUpdater } from '../logic/ProgressUpdater';
import { deleteData as deleteDataFromDb, isDataStored as isDataStoredInDb } from '../logic/Database';
import Filter from './Filter';
import { RollercoasterFilter, deleteFilter, filter, saveFilter } from '../logic/FilterRepo';

const APP_VERSION = 'v5.2.0';

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
                state,
                setState
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
    state: State,
    setState: React.Dispatch<React.SetStateAction<State>>
) {
    const gameOptionsUi = [DataType.ROLLERCOASTERS, DataType.MUSIC, DataType.FLAG_GAME, DataType.POKEMON, DataType.FORTNITE_FESTIVAL].map((dataType, index) => {
        const onGameClick = () => {
            const data = getFromRepo(getRepoBaseDataType(dataType), progressUpdater);
            state.data = hasFilter(dataType) ? filter(data as Promise<Array<Rollercoaster>>) : data;
            state.dataType = dataType;
            state.ui = UiState.GAME;

            setState({ ...state });
        };

        const onDeleteClick = () => {
            if (confirmedDelete(dataType) === false) return;

            deleteData(dataType, state);
            if (dataType === DataType.POKEMON) deleteData(DataType.POKEMON_ALL, state);

            setState({ ...state });
        };

        const onFilterClick = () => {
            state.data = getFromRepo(DataType.ROLLERCOASTERS, progressUpdater);
            state.ui = UiState.FILTER;
            setState({ ...state });
        };

        const filterButtonUi = hasFilter(dataType) && isDataStored.get(dataType) === true
            ? <button className='option-button' onClick={onFilterClick}>⚙️</button>
            : <></>;

        const deleteButtonUi = isDataStored.get(dataType) === true || (dataType === DataType.POKEMON && isDataStored.get(DataType.POKEMON_ALL) === true)
            ? <button className='option-button' onClick={onDeleteClick}>🗑️</button>
            : <></>;

        return <div className='game-option' key={index}>
            <button className='play-button' onClick={onGameClick}>{getGameName(dataType)}</button>
            {filterButtonUi}
            {deleteButtonUi}
        </div>
    });

    return <div className='Home'>
        <div id='version-state'>{VersionStateUi(versionState)}</div>
        <code id='version-label'>{APP_VERSION}</code>
        <h3>🃏 Kyle's Novelty Trivia Games 🕹️</h3>
        <div>Created by: Kyle Hutchinson</div>
        <div><br /><br /><br /></div>
        {gameOptionsUi}
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

function deleteData(dataType: DataType, state: State) {
    deleteDataFromDb(dataType);
    if (hasFilter(dataType)) deleteFilter();

    state.isDataStored.set(dataType, false);
}

export function getGameName(dataType: DataType): string {
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
        case DataType.POKEMON_ALL:
        case DataType.FORTNITE_FESTIVAL:
            return false;
        default:
            throw new Error('Unsupported DataType: ' + dataType);
    }
}

export default Home;
