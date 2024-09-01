import { randomInt, removeRandomElement, shuffleArray } from '../../util/Randomizer';
import { Airplane, Data, DataType, FestivalSong, Flag, Rollercoaster, Song } from '../data/Data';
import { Pokemon, PokemonType } from '../data/PokemonData';
import { FortniteFestivalQuestion, ImageQuestion, MusicQuestion, PokemonMultiImageQuestion, PokemonTypeQuestion, Question } from '../data/QuestionData';
import { PokemonQuestionType, getPokemonQuestionTypeSelection } from '../ui/PokemonSettings';
import { getEffectiveness } from './PokemonTypeCalculator';

export function createQuestions(data: Array<Data>, dataType: DataType): Array<Question> {
    const shuffledData = shuffleArray(data);

    if (dataType === DataType.POKEMON && getPokemonQuestionTypeSelection() === PokemonQuestionType.STAT) {
        // return shuffledData.map(questionTarget => createPokemonTypeQuestion(questionTarget as Pokemon));
        const optionsPool = new Set([...data]) as Set<Pokemon>;
        return shuffledData.map(questionTarget => createPokemonMultiImageQuestion(optionsPool, questionTarget as Pokemon));
    }

    const optionsPool = getOptionsPool(dataType, data);
    return shuffledData.map(questionTarget => createQuestion(optionsPool, questionTarget, dataType));
}

function getPokemonStatValue(pokemon: Pokemon, targetStat: String): number {
    if (targetStat === 'HP') {
        return pokemon.stats.hp;
    } else if (targetStat === 'Attack') {
        return pokemon.stats.attack;
    } else if (targetStat === 'Defense') {
        return pokemon.stats.defense;
    } else if (targetStat === 'Special-Attack') {
        return pokemon.stats.specialAttack;
    } else if (targetStat === 'Special-Defense') {
        return pokemon.stats.specialDefense;
    } else {
        return pokemon.stats.speed;
    }
}

function createPokemonTypeQuestion(questionTarget: Pokemon): PokemonTypeQuestion {
    const targetType = removeRandomElement(Object.values(PokemonType));
    const options = ['4x', '2x', '1x', '0.5x', '0.25x', '0x'];
    const effectiveness = getEffectiveness(targetType, questionTarget.typing) + 'x';
    const correctIndex = options.indexOf(effectiveness);

    return new PokemonTypeQuestion(
        'What is the effectiveness of this attacking type against this Pokémon?',
        options,
        correctIndex,
        questionTarget.imageUrl,
        targetType
    );
}

function createPokemonMultiImageQuestion(optionsPool: Set<Pokemon>, questionTarget: Pokemon): PokemonMultiImageQuestion {
    const targetStat = removeRandomElement(['HP', 'Attack', 'Defense', 'Special-Attack', 'Special-Defense', 'Speed']);

    const otherOptions = getOptions(3, optionsPool as Set<Pokemon>, (option: Pokemon) => {
        return getPokemonStatValue(questionTarget, targetStat) === getPokemonStatValue(option, targetStat);
    }, (option1: Pokemon, option2: Pokemon) => {
        return getPokemonStatValue(option1, targetStat) === getPokemonStatValue(option2, targetStat);
    });

    const answer = otherOptions.concat(questionTarget).sort((a, b) => getPokemonStatValue(b, targetStat) - getPokemonStatValue(a, targetStat))[0];

    const correctIndex = randomInt(4);

    const allOptions = otherOptions.concat(questionTarget).filter(it => it !== answer);

    const options = allOptions.slice(0, correctIndex).concat(answer).concat(allOptions.slice(correctIndex));

    const optionStatGetters = options.map(option => {
        return () => getPokemonStatValue(option, targetStat);
    });

    return new PokemonMultiImageQuestion(
        `Which of these Pokémon has the highest ${targetStat} stat?`,
        options,
        correctIndex,
        optionStatGetters
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
    const incorrectOptions = getOptions(3, optionsPool, (option: String) => {
        return option === getOptionProperty(dataType, answer);
    }, (option1: Data, option2: Data) => {
        return option1 === option2;
    });

    const text = getQuestionText(answer, dataType);
    const correctIndex = randomInt(4);
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

function getOptionProperty(dataType: DataType, option: Data): string {
    switch (dataType) {
        case DataType.ROLLERCOASTERS:
            return (option as Rollercoaster).park.name;
        case DataType.MUSIC:
            return (option as Song).Artist;
        case DataType.FORTNITE_FESTIVAL:
            return (option as FestivalSong).artist;
        case DataType.FLAG_GAME:
            return (option as Flag).name;
        case DataType.POKEMON:
            return (option as Pokemon).name;
        case DataType.AIRPLANES:
            return (option as Airplane).name;
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

function getOptions<T>(
    numberOfOptions: number,
    optionsPool: Set<T>,
    filterCriteria: (option: T) => boolean,
    isPropertyMatch: (option1: T, option2: T) => boolean
): Array<T> {
    const remainingOptions = [] as Array<T>;

    optionsPool.forEach(option => {
        if (filterCriteria(option)) return;

        remainingOptions.push(option);
    });

    const options = [] as Array<T>;
    while (options.length < numberOfOptions) {
        const option = removeRandomElement(remainingOptions);

        // If this option has a property which matches another already choosen option, then skip this option.
        if (options.find(it => isPropertyMatch(it, option)) !== undefined) continue;

        options.push(option);
    }

    return options;
}
