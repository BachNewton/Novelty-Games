import { useState } from 'react';
import '../css/Home.css';
import Game from './Game';
import { DataType, Data, Rollercoaster } from '../logic/Data';
import { get as getFromRepo } from '../logic/Repository';
import { ProgressUpdater } from '../logic/ProgressUpdater';
import { deleteData as deleteDataFromDb, isDataStored as isDataStoredInDb } from '../logic/Database';
import Filter from './Filter';
import { RollercoasterFilter, deleteFilter, filter, saveFilter } from '../logic/FilterRepo';
import HomeButton from '../../ui/HomeButton';

interface HomeProps {
    onHomeButtonClicked: () => void;
}

interface State {
    ui: UiState;
    data: Promise<Array<Data>>;
    dataType: DataType;
    isDataStored: Map<DataType, boolean>;
}

enum UiState {
    HOME,
    GAME,
    FILTER
}

const progressUpdater = new ProgressUpdater();

const Home: React.FC<HomeProps> = ({ onHomeButtonClicked }) => {
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

    const onBackClicked = () => {
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
                state.isDataStored,
                state,
                setState,
                onHomeButtonClicked
            );
        case UiState.GAME:
            return <Game
                pendingData={state.data}
                dataType={state.dataType}
                onBackClicked={onBackClicked}
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
    isDataStored: Map<DataType, boolean>,
    state: State,
    setState: React.Dispatch<React.SetStateAction<State>>,
    onHomeButtonClicked: () => void
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
        <HomeButton onClick={onHomeButtonClicked} />
        <h2>❔ Kyle's Trivia Games 🤯</h2>
        <div><br /><br /><br /></div>
        {gameOptionsUi}
    </div>;
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
