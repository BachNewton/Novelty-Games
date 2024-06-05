import { Data, DataType, Flag, Pokemon, Question, Rollercoaster, Song } from './Data';

export default function createQuestions(data: Array<Data>, dataType: DataType): Array<Question> {
    const copiedData = [...data];
    const shuffledData = [];

    while (copiedData.length > 0) {
        const randomIndex = Math.floor(Math.random() * copiedData.length);
        shuffledData.push(copiedData.splice(randomIndex, 1)[0]);
    }

    const optionsPool = getOptionsPool(dataType, data);
    return shuffledData.map((answer) => createQuestion(optionsPool, answer, dataType));
}

function getOptionsPool(dataType: DataType, data: Array<Data>): Set<string> {
    switch (dataType) {
        case DataType.ROLLERCOASTERS:
            return new Set([...(data as Array<Rollercoaster>).map(coaster => coaster.park.name)]);
        case DataType.MUSIC:
            return new Set([...(data as Array<Song>).map(song => song.Artist)]);
        case DataType.FLAG_GAME:
            return new Set([...(data as Array<Flag>).map(flag => flag.name)]);
        case DataType.POKEMON:
            return new Set([...(data as Array<Pokemon>).map(pokemon => pokemon.formattedName)]);
        default:
            throw new Error('Unsupported DataType: ' + dataType);
    }
}

function createQuestion(optionsPool: Set<string>, answer: Data, dataType: DataType): Question {
    const incorrectOptions = getOptions(3, optionsPool, getIsNot(dataType, answer))

    const text = getQuestionText(answer, dataType);
    const correctIndex = Math.floor(Math.random() * 4);
    const options = incorrectOptions.slice(0, correctIndex).concat(getCorrectOption(dataType, answer)).concat(incorrectOptions.slice(correctIndex));
    const imageUrl = getImageUrl(answer, dataType);

    return { text: text, options: options, correctIndex: correctIndex, imageUrl: imageUrl } as Question;
}

function getIsNot(dataType: DataType, answer: Data): string {
    switch (dataType) {
        case DataType.ROLLERCOASTERS:
            return (answer as Rollercoaster).park.name;
        case DataType.MUSIC:
            return (answer as Song).Artist;
        case DataType.FLAG_GAME:
            return (answer as Flag).name;
        case DataType.POKEMON:
            return (answer as Pokemon).formattedName;
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
        case DataType.FLAG_GAME:
            return 'Name this flag!';
        case DataType.POKEMON:
            return "Who's that Pokémon?!";
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
        case DataType.FLAG_GAME:
            const flag = answer as Flag;
            return flag.name;
        case DataType.POKEMON:
            const pokemon = answer as Pokemon;
            return pokemon.formattedName;
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
        case DataType.FLAG_GAME:
            const flag = answer as Flag;
            return flag.imageUrl;
        case DataType.POKEMON:
            const pokemon = answer as Pokemon;
            return pokemon.sprites.other['official-artwork'].front_default;
        default:
            throw new Error('Unsupported DataType: ' + dataType);
    }
}

function getOptions(numberOfOptions: number, optionsPool: Set<string>, isNot: string): Array<string> {
    const remainingOptions = [] as Array<string>;

    optionsPool.forEach(option => {
        if (option === isNot) return;

        remainingOptions.push(option);
    });

    const options = [] as Array<string>;
    while (options.length < numberOfOptions) {
        const randomIndex = Math.floor(Math.random() * remainingOptions.length);
        options.push(remainingOptions.splice(randomIndex, 1)[0]);
    }

    return options;
}
