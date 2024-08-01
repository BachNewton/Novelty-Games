import '../css/Game.css';
import { useEffect, useState } from 'react';
import { Data, DataType } from '../data/Data';
import { createQuestions } from '../logic/QuestionCreator';
import { Question as QuestionData } from '../data/QuestionData';
import { ProgressListener, ProgressEvent } from '../logic/ProgressUpdater';
import { getGameName } from './Home';
import Question, { AnswerResult } from './Question';

interface GameProps {
  pendingData: Promise<Array<Data>>;
  dataType: DataType;
  onBackClicked: () => void;
  progressListener: ProgressListener;
}

interface GameState {
  data: Array<Data>;
  dataType: DataType;
  questions: Array<QuestionData>;
  activeQuestion: number;
  uiState: UiState;
  lives: number;
  score: number;
  highScore: number;
  hardcoreHighScore: number;
  isNewHighScore: boolean;
  disableImages: boolean;
  usedImages: boolean;
  progressEvent: ProgressEvent;
}

interface UiState { }
class LoadingUiState implements UiState { }
class GameOverUiState implements UiState { }
class QuestionUiState implements UiState {
  state: QuestionState;

  constructor(state: QuestionState) {
    this.state = state;
  }
}

export enum QuestionState {
  SHOW_QUESTION,
  SHOW_ANSWER_CORRECT,
  SHOW_ANSWER_INCORRECT
}

const POST_QUESTION_DELAY = 1000;
const MAX_LIVES = 3;
const HIGH_SCORE_KEY_POSTFIX = '_HIGH_SCORE_KEY';
const HIGH_SCORE_HARDCORE_KEY_POSTFIX = HIGH_SCORE_KEY_POSTFIX + '_HARDCORE';
const DISABLE_IMAGES_KEY = 'DISABLE_IMAGES_KEY';

const Game: React.FC<GameProps> = ({ pendingData, dataType, onBackClicked, progressListener }) => {
  const [gameState, setGameState] = useState({ uiState: new LoadingUiState() } as GameState);

  useEffect(() => {
    progressListener.setListener(event => {
      gameState.progressEvent = event;
      setGameState({ ...gameState });
    });
  }, [progressListener]);

  useEffect(() => {
    pendingData.then(readyData => resetGame(readyData, dataType, setGameState));
  }, [pendingData]);

  const onEnableImagesButtonClicked = () => {
    gameState.disableImages = false;
    gameState.usedImages = true;
    localStorage.setItem(DISABLE_IMAGES_KEY, gameState.disableImages.toString());

    setGameState({ ...gameState });
  };

  const enableImagesButton = gameState.disableImages
    ? <button onClick={onEnableImagesButtonClicked}>🖼️</button>
    : <></>;

  return (
    <div style={{ color: 'white', fontSize: '1.25em' }}>
      <div className='top-left'>
        <button onClick={onBackClicked}>⬅️</button>
        {enableImagesButton}
      </div>
      <div style={{ width: '100vw', height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        {Ui(gameState, setGameState)}
      </div>
    </div>
  );
};

function resetGame(data: Array<Data>, dataType: DataType, setGameState: React.Dispatch<React.SetStateAction<GameState>>) {
  const savedHighScore = localStorage.getItem(getHighScoreKey(dataType));
  const savedHardcoreHighScore = localStorage.getItem(getHardcoreHighScoreKey(dataType));
  const savedDisableImages = localStorage.getItem(DISABLE_IMAGES_KEY);

  const highScore = savedHighScore === null ? 0 : parseInt(savedHighScore);
  const hardcoreHighScore = savedHardcoreHighScore === null ? 0 : parseInt(savedHardcoreHighScore);

  const disableImages = savedDisableImages === 'true' ? true : false;

  setGameState({
    data: data,
    dataType: dataType,
    questions: createQuestions(data, dataType),
    activeQuestion: 0,
    uiState: new QuestionUiState(QuestionState.SHOW_QUESTION) as UiState,
    lives: MAX_LIVES,
    score: 0,
    highScore: highScore,
    hardcoreHighScore: hardcoreHighScore,
    isNewHighScore: false,
    disableImages: disableImages,
    usedImages: !disableImages
  } as GameState);
}

function getHighScoreKey(dataType: DataType): string {
  return dataType + HIGH_SCORE_KEY_POSTFIX;
}

function getHardcoreHighScoreKey(dataType: DataType): string {
  return dataType + HIGH_SCORE_HARDCORE_KEY_POSTFIX;
}

function Ui(gameState: GameState, setGameState: React.Dispatch<React.SetStateAction<GameState>>): JSX.Element {
  if (gameState.uiState instanceof LoadingUiState) {
    return LoadingUi(gameState);
  } else if (gameState.uiState instanceof GameOverUiState) {
    return GameOverUi(gameState, setGameState);
  } else if (gameState.uiState instanceof QuestionUiState) {
    return QuestionUi(gameState, setGameState, gameState.uiState);
  } else {
    throw new Error('Unsupported UiState: ' + gameState.uiState);
  }
}

function GameOverUi(gameState: GameState, setGameState: React.Dispatch<React.SetStateAction<GameState>>) {
  const playAgain = () => {
    resetGame(gameState.data, gameState.dataType, setGameState);
  };

  const newHighScoreUi = gameState.isNewHighScore
    ? <p>New High Score!</p>
    : <></>;

  return <div style={{ textAlign: 'center' }}>
    <p>{getGameName(gameState.dataType)}</p>
    Game Over!
    <p>Final Score: {gameState.score}</p>
    {HighScoreUi(gameState)}
    {newHighScoreUi}
    <button onClick={playAgain} style={{ fontSize: '1em' }}>Play again</button>
  </div>;
}

function HighScoreUi(gameState: GameState): JSX.Element {
  const highScoreHardcore = gameState.usedImages ? '' : ' 😈';
  const highScore = gameState.usedImages ? gameState.highScore : gameState.hardcoreHighScore;

  return <p>High Score: {highScore}{highScoreHardcore}</p>;
}

function LoadingUi(gameState: GameState) {
  const loadingPercent = gameState.progressEvent === undefined
    ? 0
    : (gameState.progressEvent.current * 100 / gameState.progressEvent.total).toFixed(1);

  return <div>Loading... {loadingPercent}%</div>;
}

function QuestionUi(gameState: GameState, setGameState: React.Dispatch<React.SetStateAction<GameState>>, uiState: QuestionUiState) {
  const onDisableImages = () => {
    gameState.disableImages = true;
    localStorage.setItem(DISABLE_IMAGES_KEY, gameState.disableImages.toString());

    setGameState({ ...gameState });
  };

  const onQuestionAnswered = (result: AnswerResult) => {
    if (result === AnswerResult.CORRECT) {
      gameState.uiState = new QuestionUiState(QuestionState.SHOW_ANSWER_CORRECT);
      gameState.score++;

      if (gameState.score > gameState.highScore) {
        gameState.highScore++;
        gameState.isNewHighScore = true;
        localStorage.setItem(getHighScoreKey(gameState.dataType), gameState.highScore.toString());
      }

      if (gameState.score > gameState.hardcoreHighScore && !gameState.usedImages) {
        gameState.hardcoreHighScore++;
        gameState.isNewHighScore = true;
        localStorage.setItem(getHardcoreHighScoreKey(gameState.dataType), gameState.hardcoreHighScore.toString());
      }

      setGameState({ ...gameState });
    } else {
      gameState.uiState = new QuestionUiState(QuestionState.SHOW_ANSWER_INCORRECT);
      gameState.lives--;
      setGameState({ ...gameState });
    }

    setTimeout(() => {
      gameState.uiState = new QuestionUiState(QuestionState.SHOW_QUESTION);
      gameState.activeQuestion++;

      if (gameState.lives === 0 || gameState.activeQuestion >= gameState.questions.length) {
        gameState.uiState = new GameOverUiState();
      }

      setGameState({ ...gameState });
    }, POST_QUESTION_DELAY);
  };

  return <Question
    uiState={uiState.state}
    question={gameState.questions[gameState.activeQuestion]}
    questionNumber={gameState.activeQuestion + 1}
    totalQuestions={gameState.questions.length}
    disableImages={gameState.disableImages}
    score={gameState.score}
    lives={gameState.lives}
    MAX_LIVES={MAX_LIVES}
    onImageSectionClick={onDisableImages}
    onQuestionAnswered={onQuestionAnswered}
    HighScoreUi={() => HighScoreUi(gameState)}
  />;
}

export default Game;
