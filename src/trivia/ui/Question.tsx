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
    onDisableImages: () => void;
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
    onDisableImages,
    onQuestionAnswered,
    HighScoreUi
}) => {
    const optionsUi = question.options.map((option, index) => {
        const onClick = () => {
            if (index === question.correctIndex) {
                onQuestionAnswered(AnswerResult.CORRECT);
            } else {
                onQuestionAnswered(AnswerResult.INCORRECT);
            }
        };

        const buttonStyle: React.CSSProperties = {
            width: '100%',
            height: '100%',
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

    const onImageSectionClick = () => {
        onDisableImages();
    };

    return <div style={{ height: '100vh', width: '100vw', textAlign: 'center', display: 'grid', justifyItems: 'center', alignItems: 'center' }}>
        <div style={{ position: 'relative', zIndex: 1, width: '100%' }}>
            {StatsUi(score, lives, MAX_LIVES, HighScoreUi)}
            <p style={{ marginBottom: 0, marginTop: 0 }}>Question #{questionNumber.toLocaleString()} of {totalQuestions.toLocaleString()}</p>
            <AsyncImage src={question.imageUrl} disableImages={disableImages} onClick={onImageSectionClick} />
        </div>
        {MusicPlayerUi(question)}
        <div>
            {question.text}
        </div>
        {optionsUi}
    </div>;
};

function StatsUi(score: number, lives: number, MAX_LIVES: number, HighScoreUi: () => JSX.Element) {
    let livesString = '';
    for (let i = 0; i < MAX_LIVES; i++) {
        livesString += i < lives ? '❤️' : '🖤';
    }
    const livesUi = <span>{livesString}</span>

    return <div style={{ display: 'flex', justifyContent: 'space-evenly' }}>
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
