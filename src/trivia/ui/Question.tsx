import { CSSProperties } from 'react';
import { FortniteFestivalQuestion, ImageQuestion, MusicQuestion, PokemonMultiImageQuestion, Question as QuestionData } from '../data/QuestionData';
import AsyncImage from './AsyncImage';
import { QuestionState } from './Game';
import MusicPlayer from './MusicPlayer';

interface QuestionProps {
    uiState: QuestionState;
    question: QuestionData;
    questionNumber: number;
    totalQuestions: number;
    disableImages: boolean;
    score: number,
    lives: number;
    MAX_LIVES: number;
    onImageSectionClick: () => void;
    onQuestionAnswered: (result: AnswerResult) => void;
    HighScoreUi: () => JSX.Element;
}

export enum AnswerResult {
    CORRECT,
    INCORRECT
}

const Question: React.FC<QuestionProps> = ({
    uiState,
    question,
    questionNumber,
    totalQuestions,
    disableImages,
    score,
    lives,
    MAX_LIVES,
    onImageSectionClick,
    onQuestionAnswered,
    HighScoreUi
}) => {
    return <div style={{ height: '100vh', width: '100vw', display: 'flex', flexDirection: 'column', justifyContent: 'space-evenly', textAlign: 'center' }}>
        {StatsUi(score, lives, MAX_LIVES, HighScoreUi)}
        {QuestionUi(question, questionNumber, disableImages, totalQuestions, onImageSectionClick)}
        {OptionsUi(question, uiState, onQuestionAnswered)}
    </div>;
};

function QuestionUi(question: QuestionData, questionNumber: number, disableImages: boolean, totalQuestions: number, onImageSectionClick: () => void) {
    const imageUi = question instanceof ImageQuestion
        ? <AsyncImage src={question.imageUrl} disableImages={disableImages} onClick={onImageSectionClick} />
        : <></>;

    return <div>
        <div style={{ zIndex: 1, position: 'relative' }}>
            <div>Question #{questionNumber.toLocaleString()} of {totalQuestions.toLocaleString()}</div>
            {imageUi}
        </div>
        {MusicPlayerUi(question)}
        <div style={{ margin: '0 0.5em' }}>
            {question.text}
        </div>
    </div>;
}

function OptionsUi(question: QuestionData, uiState: QuestionState, onQuestionAnswered: (result: AnswerResult) => void) {
    const onOptionClick = (index: number) => {
        if (index === question.correctIndex) {
            onQuestionAnswered(AnswerResult.CORRECT);
        } else {
            onQuestionAnswered(AnswerResult.INCORRECT);
        }
    };

    if (question instanceof PokemonMultiImageQuestion) {
        return <div style={{ display: 'flex', justifyContent: 'center', padding: '0 10px' }}>
            {PokemonMultiImageQuestionUi(question, uiState, onOptionClick)}
        </div>;
    } else if (question instanceof ImageQuestion) {
        return <div style={{ display: 'flex', flexDirection: 'column', padding: '0 0.5em' }}>
            {ImageQuestionUi(question, uiState, onOptionClick)}
        </div>;
    } else {
        throw new Error('Unsupported Question: ' + question);
    }
}

function PokemonMultiImageQuestionUi(question: PokemonMultiImageQuestion, uiState: QuestionState, onOptionClick: (index: number) => void) {
    const images = question.options.map((it, index) => {
        const imageStyle: CSSProperties = {
            width: '100%',
            height: '100%',
            borderWidth: '1px',
            borderStyle: 'solid',
            boxSizing: 'border-box',
            borderRadius: '30px'
        };

        const textStyle: CSSProperties = {
            display: uiState === QuestionState.SHOW_QUESTION ? 'none' : 'block',
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            background: 'rgba(0, 0, 0, 0.75)',
            padding: '15px',
            borderRadius: '30px',
            fontSize: '1.25em',
            borderWidth: '1px',
            borderStyle: 'solid',
            borderColor: 'white'
        };

        if (uiState === QuestionState.SHOW_QUESTION) {
            imageStyle.borderColor = 'white';
        } else {
            if (index === question.correctIndex) {
                imageStyle.borderColor = 'lime';
                textStyle.borderColor = 'lime';
            } else if (uiState === QuestionState.SHOW_ANSWER_INCORRECT) {
                imageStyle.borderColor = 'red';
                textStyle.borderColor = 'red';
            } else {
                imageStyle.borderColor = 'white';
            }
        }

        const image = <img
            src={it.imageUrl}
            onClick={() => { if (uiState === QuestionState.SHOW_QUESTION) onOptionClick(index) }}
            style={imageStyle}
        />;

        return <div style={{ position: 'relative' }} key={index}>
            {image}
            <div style={textStyle}>{question.optionStatGetters[index]()}</div>
        </div>;
    });

    return <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr', gap: '10px' }}>{images}</div>;
}

function ImageQuestionUi(question: ImageQuestion, uiState: QuestionState, onOptionClick: (index: number) => void) {
    const ui = question.options.map((option, index) => {
        const buttonStyle: React.CSSProperties = {
            padding: '0.25em',
            marginBottom: '0.75em',
            fontSize: '1em'
        };

        if (uiState === QuestionState.SHOW_QUESTION) {
            return <button style={buttonStyle} key={index} onClick={() => onOptionClick(index)}>{option}</button>;
        } else {
            if (index === question.correctIndex) {
                return <button style={buttonStyle} key={index} className='button-correct'>{option}</button>;
            } else if (uiState === QuestionState.SHOW_ANSWER_INCORRECT) {
                return <button style={buttonStyle} key={index} className='button-incorrect'>{option}</button>;
            } else {
                return <button style={buttonStyle} key={index}>{option}</button>;
            }
        }
    });

    return <div style={{ display: 'flex', flexDirection: 'column', padding: '0 0.5em' }}>{ui}</div>;
}

function StatsUi(score: number, lives: number, MAX_LIVES: number, HighScoreUi: () => JSX.Element) {
    let livesString = '';
    for (let i = 0; i < MAX_LIVES; i++) {
        livesString += i < lives ? '❤️' : '🖤';
    }
    const livesUi = <span>{livesString}</span>

    return <div style={{ display: 'flex', justifyContent: 'space-evenly', zIndex: 1 }}>
        <p>Score: {score}</p>
        <p>{livesUi}</p>
        {HighScoreUi()}
    </div>;
}

function MusicPlayerUi(question: QuestionData): JSX.Element {
    if (question instanceof FortniteFestivalQuestion) {
        return <audio preload='none' controls src={question.audioLink} style={{ height: '21px' }} />;
    } else if (question instanceof MusicQuestion) {
        return <div style={{ display: 'flex', justifyContent: 'center' }}>
            <MusicPlayer id={question.spotifyId} />
        </div>;
    } else {
        return <></>;
    }
}

export default Question;
