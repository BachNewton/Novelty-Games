import { removeRandomElement, shuffleArray } from '../../util/Randomizer';
import { Airplane, Data, DataType, FestivalSong, Flag, Rollercoaster, Song } from '../data/Data';
import { Pokemon } from '../data/PokemonData';
import { FortniteFestivalQuestion, ImageQuestion, MultiImageQuestion, MusicQuestion, Question } from '../data/QuestionData';

export function createQuestions(data: Array<Data>, dataType: DataType): Array<Question> {
    const shuffledData = shuffleArray(data);

    // if (dataType === DataType.POKEMON) {
    //     const optionsPool = new Set([...data]);
    //     return shuffledData.map((questionTarget) => createMultiImageQuestion(optionsPool, questionTarget, dataType));
    // }

    const optionsPool = getOptionsPool(dataType, data);
    return shuffledData.map((questionTarget) => createQuestion(optionsPool, questionTarget, dataType));
}

function createMultiImageQuestion(optionsPool: Set<Data>, questionTarget: Data, dataType: DataType) {
    const targetStat = removeRandomElement(['HP', 'Attack', 'Defense', 'Special-Attack', 'Special-Defense', 'Speed']);

    const otherOptions = getOptions(3, optionsPool, questionTarget) as Array<Pokemon>;

    const getSorter = () => {
        if (targetStat === 'HP') {
            return (a: Pokemon, b: Pokemon) => b.stats.hp - a.stats.hp;
        } else if (targetStat === 'Attack') {
            return (a: Pokemon, b: Pokemon) => b.stats.attack - a.stats.attack;
        } else if (targetStat === 'Defense') {
            return (a: Pokemon, b: Pokemon) => b.stats.defense - a.stats.defense;
        } else if (targetStat === 'Special-Attack') {
            return (a: Pokemon, b: Pokemon) => b.stats.specialAttack - a.stats.specialAttack;
        } else if (targetStat === 'Special-Defense') {
            return (a: Pokemon, b: Pokemon) => b.stats.specialDefense - a.stats.specialDefense;
        } else {
            return (a: Pokemon, b: Pokemon) => b.stats.speed - a.stats.speed;
        }
    };

    const answer = otherOptions.concat(questionTarget as Pokemon).sort(getSorter())[0];

    const correctIndex = Math.floor(Math.random() * 4);

    const allOptions = otherOptions.concat(questionTarget as Pokemon).filter(it => it !== answer);

    const options = allOptions.slice(0, correctIndex).concat(answer).concat(allOptions.slice(correctIndex));

    return new MultiImageQuestion(
        `Which of these Pokémon has the highest ${targetStat} stat?`,
        options.map(it => it.imageUrl),
        correctIndex
    );
}

function getOptionsPool(dataType: DataType, data: Array<Data>): Set<string> {
    switch (dataType) {
        case DataType.ROLLERCOASTERS:
            return new Set([...(data as Array<Rollercoaster>).map(coaster => coaster.park.name)]);
        case DataType.MUSIC:
            return new Set([...(data as Array<Song>).map(song => song.Artist)]);
        case DataType.FORTNITE_FESTIVAL:
            return new Set([...(data as Array<FestivalSong>).map(song => song.artist)]);
        case DataType.FLAG_GAME:
            return new Set([...(data as Array<Flag>).map(flag => flag.name)]);
        case DataType.POKEMON:
            return new Set([...(data as Array<Pokemon>).map(pokemon => pokemon.name)]);
        case DataType.AIRPLANES:
            return new Set([...(data as Array<Airplane>).map(airplane => airplane.name)]);
        default:
            throw new Error('Unsupported DataType: ' + dataType);
    }
}

function createQuestion(optionsPool: Set<string>, answer: Data, dataType: DataType): Question {
    const incorrectOptions = getOptions(3, optionsPool, getIsNot(dataType, answer));

    const text = getQuestionText(answer, dataType);
    const correctIndex = Math.floor(Math.random() * 4);
    const options = incorrectOptions.slice(0, correctIndex).concat(getCorrectOption(dataType, answer)).concat(incorrectOptions.slice(correctIndex));
    const imageUrl = getImageUrl(answer, dataType);

    switch (dataType) {
        case DataType.FORTNITE_FESTIVAL:
            return new FortniteFestivalQuestion(text, options, correctIndex, imageUrl, (answer as FestivalSong).sampleMp3!!);
        case DataType.MUSIC:
            return new MusicQuestion(text, options, correctIndex, imageUrl, (answer as Song).Spotify);
        case DataType.ROLLERCOASTERS:
        case DataType.FLAG_GAME:
        case DataType.POKEMON:
        case DataType.AIRPLANES:
            return new ImageQuestion(text, options, correctIndex, imageUrl);
        default:
            throw new Error('Unsupported DataType: ' + dataType);
    }
}

function getIsNot(dataType: DataType, answer: Data): string {
    switch (dataType) {
        case DataType.ROLLERCOASTERS:
            return (answer as Rollercoaster).park.name;
        case DataType.MUSIC:
            return (answer as Song).Artist;
        case DataType.FORTNITE_FESTIVAL:
            return (answer as FestivalSong).artist;
        case DataType.FLAG_GAME:
            return (answer as Flag).name;
        case DataType.POKEMON:
            return (answer as Pokemon).name;
        case DataType.AIRPLANES:
            return (answer as Airplane).name;
        default:
            throw new Error('Unsupported DataType: ' + dataType);
    }
}

function getQuestionText(answer: Data, dataType: DataType): string {
    switch (dataType) {
        case DataType.ROLLERCOASTERS:
            const coaster = answer as Rollercoaster;
            return `Which park is the coaster "${coaster.name}" made by "${coaster.make}" in "${coaster.status.date.opened}" located in?`;
        case DataType.MUSIC:
            const song = answer as Song;
            return `Which artist created the song "${song.Name}" in "${song.Year}"?`;
        case DataType.FORTNITE_FESTIVAL:
            const festivalSong = answer as FestivalSong;
            return `Which artist created the song "${festivalSong.name}" in "${festivalSong.year}"?`;
        case DataType.FLAG_GAME:
            return 'Name this flag!';
        case DataType.POKEMON:
            return "Who's that Pokémon?!";
        case DataType.AIRPLANES:
            return 'What is the make and model of this airplane?';
        default:
            throw new Error('Unsupported DataType: ' + dataType);
    }
}

function getCorrectOption(dataType: DataType, answer: Data): string {
    switch (dataType) {
        case DataType.ROLLERCOASTERS:
            const coaster = answer as Rollercoaster;
            return coaster.park.name;
        case DataType.MUSIC:
            const song = answer as Song;
            return song.Artist;
        case DataType.FORTNITE_FESTIVAL:
            const festivalSong = answer as FestivalSong;
            return festivalSong.artist;
        case DataType.FLAG_GAME:
            const flag = answer as Flag;
            return flag.name;
        case DataType.POKEMON:
            const pokemon = answer as Pokemon;
            return pokemon.name;
        case DataType.AIRPLANES:
            const airplane = answer as Airplane;
            return airplane.name;
        default:
            throw new Error('Unsupported DataType: ' + dataType);
    }
}

function getImageUrl(answer: Data, dataType: DataType): string {
    switch (dataType) {
        case DataType.ROLLERCOASTERS:
            const coaster = answer as Rollercoaster;
            return coaster.mainPicture.url;
        case DataType.MUSIC:
            const song = answer as Song;
            return song.imageUrl;
        case DataType.FORTNITE_FESTIVAL:
            const festivalSong = answer as FestivalSong;
            return festivalSong.albumArt;
        case DataType.FLAG_GAME:
            const flag = answer as Flag;
            return flag.imageUrl;
        case DataType.POKEMON:
            const pokemon = answer as Pokemon;
            return pokemon.imageUrl;
        case DataType.AIRPLANES:
            const airplane = answer as Airplane;
            return airplane.imageUrl;
        default:
            throw new Error('Unsupported DataType: ' + dataType);
    }
}

function getOptions<T>(numberOfOptions: number, optionsPool: Set<T>, isNot: T): Array<T> {
    const remainingOptions = [] as Array<T>;

    optionsPool.forEach(option => {
        if (option === isNot) return;

        remainingOptions.push(option);
    });

    const options = [] as Array<T>;
    while (options.length < numberOfOptions) {
        options.push(removeRandomElement(remainingOptions));
    }

    return options;
}
