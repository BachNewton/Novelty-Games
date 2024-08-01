import { Question as QuestionData } from '../logic/QuestionCreator';
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
    return <div>
        <div style={{ zIndex: 1, position: 'relative' }}>
            <div>Question #{questionNumber.toLocaleString()} of {totalQuestions.toLocaleString()}</div>
            <AsyncImage src={question.imageUrl} disableImages={disableImages} onClick={onImageSectionClick} />
        </div>
        {MusicPlayerUi(question)}
        <div style={{ margin: '0 0.5em' }}>
            {question.text}
        </div>
    </div>;
}

function OptionsUi(question: QuestionData, uiState: QuestionState, onQuestionAnswered: (result: AnswerResult) => void) {
    const ui = question.options.map((option, index) => {
        const onClick = () => {
            if (index === question.correctIndex) {
                onQuestionAnswered(AnswerResult.CORRECT);
            } else {
                onQuestionAnswered(AnswerResult.INCORRECT);
            }
        };

        const buttonStyle: React.CSSProperties = {
            padding: '0.25em',
            marginBottom: '0.75em',
            fontSize: '1em'
        };

        if (uiState === QuestionState.SHOW_QUESTION) {
            return <button style={buttonStyle} key={index} onClick={onClick}>{option}</button>;
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

function MusicPlayerUi(question: QuestionData) {
    if (question.audioLink !== null) {
        return <audio preload='none' controls src={question.audioLink} style={{ height: '21px' }} />;
    }

    if (question.spotifyId === null) return <></>;

    return <div style={{ display: 'flex', justifyContent: 'center' }}>
        <MusicPlayer id={question.spotifyId} />
    </div>;
}

export default Question;
