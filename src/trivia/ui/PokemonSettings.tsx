import { useState } from "react";

const POKEMON_QUESTION_TYPE_SECTION_KEY = 'POKEMON_QUESTION_TYPE_SECTION_KEY';

export enum PokemonQuestionType {
    WHO = 'WHO', STAT = 'STAT', TYPE = 'TYPE'
}

interface PokemonSettingsProps {
    questionTypeGetter: PokemonSettingsQuestionTypeGetter;
}

const PokemonSettings: React.FC<PokemonSettingsProps> = ({ questionTypeGetter }) => {
    const [questionTypeSelection, setQuestionTypeSection] = useState(getPokemonQuestionTypeSelection());

    questionTypeGetter.get = () => questionTypeSelection;

    const onChange = (e: React.FormEvent<HTMLDivElement>) => {
        const value = (e.target as HTMLInputElement).value;
        setQuestionTypeSection(value as PokemonQuestionType);
    };

    return <div>
        <h1>Pokémon Settings</h1>
        <h3>Select which question type you'd like to use</h3>
        <div onChange={onChange}>
            <input type="radio" value={PokemonQuestionType.WHO} name="questionType" defaultChecked={questionTypeSelection === PokemonQuestionType.WHO} />
            Who's that Pokémon?!
            <br />
            <input type="radio" value={PokemonQuestionType.STAT} name="questionType" defaultChecked={questionTypeSelection === PokemonQuestionType.STAT} />
            Which of these Pokémon has the highest stat?
            <br />
            <input type="radio" value={PokemonQuestionType.TYPE} name="questionType" defaultChecked={questionTypeSelection === PokemonQuestionType.TYPE} />
            Pokémon type effectiveness!
        </div>
    </div>;
};

export interface PokemonSettingsQuestionTypeGetter {
    get: (() => PokemonQuestionType) | null;
}

export function savePokemonQuestionTypeSelection(questionType: PokemonQuestionType) {
    localStorage.setItem(POKEMON_QUESTION_TYPE_SECTION_KEY, JSON.stringify(questionType));
}

export function getPokemonQuestionTypeSelection(): PokemonQuestionType {
    const storedValue = localStorage.getItem(POKEMON_QUESTION_TYPE_SECTION_KEY);

    if (storedValue === null) return PokemonQuestionType.TYPE;

    return JSON.parse(storedValue) as PokemonQuestionType;
}

export default PokemonSettings;
