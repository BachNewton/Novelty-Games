import { Data, DataType, Question, Rollercoaster } from './Data';

export default function createQuestions(data: Array<Data>, dataType: DataType): Array<Question> {
    const coasters = data as Array<Rollercoaster>;

    const copiedCoasters = [...coasters];
    const shuffledCoasters = [];
    while (copiedCoasters.length > 0) {
        const randomIndex = Math.floor(Math.random() * copiedCoasters.length);
        shuffledCoasters.push(copiedCoasters.splice(randomIndex, 1)[0]);
    }

    return shuffledCoasters.map((coaster) => createQuestion(coasters, coaster));
}

function createQuestion(coasters: Array<Rollercoaster>, coasterAnswer: Rollercoaster): Question {
    const allParks = new Set([...coasters.map(coaster => coaster.park.name)]);

    const incorrectOptions = getOptions(3, allParks, coasterAnswer.park.name)

    const text = `Which park is the coaster "${coasterAnswer.name}" made by "${coasterAnswer.make}" in "${coasterAnswer.status.date.opened}" located in?`;
    const correctIndex = Math.floor(Math.random() * 4);
    const options = incorrectOptions.slice(0, correctIndex).concat(coasterAnswer.park.name).concat(incorrectOptions.slice(correctIndex));
    const imageUrl = coasterAnswer.mainPicture.url;

    return { text: text, options: options, correctIndex: correctIndex, imageUrl: imageUrl } as Question;
}

function getOptions(numberOfOptions: number, allOptions: Set<string>, isNot: string): Array<string> {
    const remainingOptions = [] as Array<string>;
    allOptions.delete(isNot);
    allOptions.forEach(value => {
        remainingOptions.push(value);
    });

    const options = [] as Array<string>;
    while (options.length < numberOfOptions) {
        const randomIndex = Math.floor(Math.random() * remainingOptions.length);
        options.push(remainingOptions.splice(randomIndex, 1)[0]);
    }

    return options;
}
