import Rollercoaster from './Data';

interface Question {
    text: string;
    options: Array<string>;
    correctIndex: number;
}

export default function createQuestion(coasters: Array<Rollercoaster>): Question {
    const allParks = new Set([...coasters.map(coaster => coaster.park.name)]);
    const coasterAnswer = getRandomCoaster(coasters);
    const incorrectOptions = getOptions(3, allParks, coasterAnswer.park.name)

    console.log(incorrectOptions, coasterAnswer.park.name);

    const text = `Which park is the coaster "${coasterAnswer.name}" made by "${coasterAnswer.make}" from?`;
    const correctIndex = Math.floor(Math.random() * 4);
    const options = incorrectOptions.slice(0, correctIndex).concat(coasterAnswer.park.name).concat(incorrectOptions.slice(correctIndex));

    console.log(text, options, correctIndex);

    return { text: text, options: options, correctIndex: correctIndex } as Question;
}

function getOptions(numberOfOptions: number, allOptions: Set<string>, isNot: string): Array<string> {
    const remainingOptions = [] as Array<string>;
    allOptions.forEach(value => {
        if (value !== isNot) remainingOptions.push(value);
    });

    const options = [] as Array<string>;
    while (options.length < numberOfOptions) {
        const randomIndex = Math.floor(Math.random() * remainingOptions.length);
        options.push(remainingOptions.splice(randomIndex)[0]);
    }

    return options;
}

function getRandomCoaster(coasters: Array<Rollercoaster>): Rollercoaster {
    const randomIndex = Math.floor(Math.random() * coasters.length);
    return coasters[randomIndex];
}
