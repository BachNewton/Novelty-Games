import { Data, DataType, Question, Rollercoaster, Song } from './Data';

export default function createQuestions(data: Array<Data>, dataType: DataType): Array<Question> {
    const copiedData = [...data];
    const shuffledData = [];

    while (copiedData.length > 0) {
        const randomIndex = Math.floor(Math.random() * copiedData.length);
        shuffledData.push(copiedData.splice(randomIndex, 1)[0]);
    }

    const optionsPool = getOptionsPool(data, dataType);
    return shuffledData.map((coasterAnswer) => createQuestion(optionsPool, coasterAnswer as Rollercoaster, dataType));
}

function getOptionsPool(data: Array<Data>, dataType: DataType,): Set<string> {
    if (dataType === DataType.ROLLERCOASTERS) {
        const coasters = data as Array<Rollercoaster>;
        return new Set([...coasters.map(coaster => coaster.park.name)]);
    } else {
        const songs = data as Array<Song>;
        return new Set([...songs.map(song => song.Artist)]);
    }
}

function createQuestion(optionsPool: Set<string>, answer: Data, dataType: DataType): Question {
    const incorrectOptions = getOptions(3, optionsPool, getIsNot(answer, dataType))

    const text = getQuestionText(answer, dataType);
    const correctIndex = Math.floor(Math.random() * 4);
    const options = incorrectOptions.slice(0, correctIndex).concat(getCorrectOption(answer, dataType)).concat(incorrectOptions.slice(correctIndex));
    const imageUrl = getImageUrl(answer, dataType);

    return { text: text, options: options, correctIndex: correctIndex, imageUrl: imageUrl } as Question;
}

function getIsNot(answer: Data, dataType: DataType): string {
    if (dataType === DataType.ROLLERCOASTERS) {
        const coaster = answer as Rollercoaster;
        return coaster.park.name;
    } else {
        const song = answer as Song;
        return song.Artist;
    }
}

function getQuestionText(answer: Data, dataType: DataType): string {
    if (dataType === DataType.ROLLERCOASTERS) {
        const coaster = answer as Rollercoaster;
        return `Which park is the coaster "${coaster.name}" made by "${coaster.make}" in "${coaster.status.date.opened}" located in?`;
    } else {
        const song = answer as Song;
        return `Which artist created the song "${song.Name}" in "${song.Year}"?`;
    }
}

function getCorrectOption(answer: Data, dataType: DataType): string {
    if (dataType === DataType.ROLLERCOASTERS) {
        const coaster = answer as Rollercoaster;
        return coaster.park.name;
    } else {
        const song = answer as Song;
        return song.Artist;
    }
}

function getImageUrl(answer: Data, dataType: DataType): string {
    if (dataType === DataType.ROLLERCOASTERS) {
        const coaster = answer as Rollercoaster;
        return coaster.mainPicture.url;
    } else {
        const song = answer as Song;
        return song.imageUrl;
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
