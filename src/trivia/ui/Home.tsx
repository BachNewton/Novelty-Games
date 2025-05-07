import { useState } from 'react';
import '../css/Home.css';
import Game from './Game';
import { DataType, Data, Rollercoaster, FestivalSong } from '../data/Data';
import { get as getFromRepo } from '../logic/Repository';
import { ProgressUpdater } from '../logic/ProgressUpdater';
import { deleteData as deleteDataFromDb, isDataStored as isDataStoredInDb } from '../logic/Database';
import Filter, { RollercoasterFilterGetter } from './Filter';
import { RollercoasterFilter, deleteFilter, filter, saveFilter } from '../logic/FilterRepo';
import HomeButton from '../../ui/HomeButton';
import SettingsPage from './SettingsPage';
import PokemonSettings, { PokemonQuestionType, PokemonSettingsQuestionTypeGetter, savePokemonQuestionTypeSelection } from './PokemonSettings';

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
    SETTINGS
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

    const onSettingsPageCancelClicked = () => {
        state.ui = UiState.HOME;
        setState({ ...state });
    };

    const onFilterConfirmClicked = (rollercoasterFilter: RollercoasterFilter | undefined) => {
        if (rollercoasterFilter === undefined) return;

        saveFilter(rollercoasterFilter);
        state.ui = UiState.HOME;
        setState({ ...state });
    };

    const onPokemonConfirmClicked = (pokemonQuestionType: PokemonQuestionType | undefined) => {
        if (pokemonQuestionType === undefined) return;

        savePokemonQuestionTypeSelection(pokemonQuestionType);
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
        case UiState.SETTINGS:
            return getSettingsUi(state.dataType, state.data, onSettingsPageCancelClicked, onFilterConfirmClicked, onPokemonConfirmClicked);
    }
};

function getSettingsUi(
    dataType: DataType,
    data: Promise<Data>,
    onSettingsPageCancelClicked: () => void,
    onFilterConfirmClicked: (rollercoasterFilter: RollercoasterFilter | undefined) => void,
    onPokemonConfirmClicked: (pokemonQuestionType: PokemonQuestionType | undefined) => void
): JSX.Element {
    if (dataType === DataType.ROLLERCOASTERS) {
        const rollercoasterFilterGetter: RollercoasterFilterGetter = { get: null };
        const pendingCoasters = data as Promise<Array<Rollercoaster>>;
        const pendingFilterUi = pendingCoasters.then(coasters => {
            return <Filter
                coasters={coasters}
                rollercoasterFilterGetter={rollercoasterFilterGetter}
            />;
        });

        return <SettingsPage
            content={pendingFilterUi}
            onCancel={onSettingsPageCancelClicked}
            onConfirm={() => onFilterConfirmClicked(rollercoasterFilterGetter.get?.())}
        />;
    } else if (dataType === DataType.POKEMON) {
        const questionTypeGetter: PokemonSettingsQuestionTypeGetter = { get: null };
        const content = Promise.resolve(<PokemonSettings questionTypeGetter={questionTypeGetter} />);
        return <SettingsPage
            content={content}
            onCancel={onSettingsPageCancelClicked}
            onConfirm={() => onPokemonConfirmClicked(questionTypeGetter.get?.())}
        />;
    } else {
        throw new Error('DataType: ' + dataType + ', has no SettingsUi!');
    }
}

function HomeUi(
    isDataStored: Map<DataType, boolean>,
    state: State,
    setState: React.Dispatch<React.SetStateAction<State>>,
    onHomeButtonClicked: () => void
) {
    const gameOptionsUi = [
        DataType.ROLLERCOASTERS,
        DataType.MUSIC,
        DataType.FLAG_GAME,
        DataType.POKEMON,
        DataType.FORTNITE_FESTIVAL,
        DataType.AIRPLANES
    ].map((dataType, index) => {
        const onGameClick = () => {
            const data = getFromRepo(getRepoBaseDataType(dataType), progressUpdater);

            if (dataType === DataType.ROLLERCOASTERS) {
                state.data = filter(data as Promise<Array<Rollercoaster>>);
            } else if (dataType === DataType.FORTNITE_FESTIVAL) {
                state.data = (data as Promise<Array<FestivalSong>>).then(songs => songs.filter(song => song.artist !== 'Epic Games'));
            }

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

        const onSettingsClick = () => {
            if (dataType === DataType.ROLLERCOASTERS) {
                state.data = getFromRepo(DataType.ROLLERCOASTERS, progressUpdater);
            }

            state.dataType = dataType;
            state.ui = UiState.SETTINGS;
            setState({ ...state });
        };

        const filterButtonUi = hasSettings(dataType) && isDataStored.get(dataType) === true
            ? <button className='option-button' onClick={onSettingsClick}>⚙️</button>
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
        <h2>🤔 Kyle's Trivia Games 🤯</h2>
        <div><br /></div>
        {gameOptionsUi}
    </div>;
}


function confirmedDelete(dataType: DataType): boolean {
    const gameName = getGameName(dataType);
    return window.confirm(`Are you sure you want to delete your stored data for ${gameName}? Your High Score will NOT be deleted.`);
}

function deleteData(dataType: DataType, state: State) {
    deleteDataFromDb(dataType);
    if (dataType === DataType.ROLLERCOASTERS) deleteFilter();

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
        case DataType.AIRPLANES:
            return 'Airplanes ✈️';
        default:
            throw new Error('Unsupported DataType: ' + dataType);
    }
}

function getRepoBaseDataType(dataType: DataType): DataType {
    switch (dataType) {
        case DataType.POKEMON:
            return DataType.POKEMON_ALL;
        case DataType.AIRPLANES:
            return DataType.AIRPLANES_ALL;
        case DataType.ROLLERCOASTERS:
        case DataType.MUSIC:
        case DataType.FLAG_GAME:
        case DataType.FORTNITE_FESTIVAL:
            return dataType;
        default:
            throw new Error('Unsupported DataType: ' + dataType);
    }
}

function hasSettings(dataType: DataType): boolean {
    switch (dataType) {
        case DataType.ROLLERCOASTERS:
        case DataType.POKEMON:
            return true;
        case DataType.MUSIC:
        case DataType.FLAG_GAME:
        case DataType.POKEMON_ALL:
        case DataType.FORTNITE_FESTIVAL:
        case DataType.AIRPLANES:
        case DataType.AIRPLANES_ALL:
            return false;
        default:
            throw new Error('Unsupported DataType: ' + dataType);
    }
}

export default Home;
