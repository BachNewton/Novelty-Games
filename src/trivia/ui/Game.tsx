import '../css/Game.css';
import { useEffect, useState } from 'react';
import { Data, DataType } from '../logic/Data';
import { createQuestions, Question } from '../logic/QuestionCreator';
import AsyncImage from './AsyncImage';
import { ProgressListener, ProgressEvent } from '../logic/ProgressUpdater';
import MusicPlayer from './MusicPlayer';
import { getGameName } from './Home';

interface GameProps {
  pendingData: Promise<Array<Data>>;
  dataType: DataType;
  onBackClicked: () => void;
  progressListener: ProgressListener;
}

interface GameState {
  data: Array<Data>;
  dataType: DataType;
  questions: Array<Question>;
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

enum UiState {
  LOADING,
  SHOW_QUESTION,
  SHOW_ANSWER_CORRECT,
  SHOW_ANSWER_INCORRECT,
  GAME_OVER
}

const POST_QUESTION_DELAY = 1000;
const MAX_LIVES = 3;
const HIGH_SCORE_KEY_POSTFIX = '_HIGH_SCORE_KEY';
const HIGH_SCORE_HARDCORE_KEY_POSTFIX = HIGH_SCORE_KEY_POSTFIX + '_HARDCORE';
const DISABLE_IMAGES_KEY = 'DISABLE_IMAGES_KEY';

const Game: React.FC<GameProps> = ({ pendingData, dataType, onBackClicked, progressListener }) => {
  const [gameState, setGameState] = useState({ uiState: UiState.LOADING } as GameState)

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
    <div className="Game">
      <div className='top-left'>
        <button onClick={onBackClicked}>⬅️</button>
        {enableImagesButton}
      </div>
      <header>
        {Ui(gameState, setGameState)}
      </header>
    </div>
  );
};

export default Game;

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
    uiState: UiState.SHOW_QUESTION,
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
  switch (gameState.uiState) {
    case UiState.LOADING:
      return LoadingUi(gameState);
    case UiState.GAME_OVER:
      return GameOverUi(gameState, setGameState);
    default:
      return QuestionUi(gameState, setGameState);
  }
}

function GameOverUi(gameState: GameState, setGameState: React.Dispatch<React.SetStateAction<GameState>>) {
  const playAgain = () => {
    resetGame(gameState.data, gameState.dataType, setGameState);
  };

  const newHighScoreUi = gameState.isNewHighScore
    ? <p>New High Score!</p>
    : <></>;

  return <div>
    <p>{getGameName(gameState.dataType)}</p>
    Game Over!
    <p>Final Score: {gameState.score}</p>
    {HighScoreUi(gameState)}
    {newHighScoreUi}
    <button onClick={playAgain}>Play again</button>
  </div>;
}

function HighScoreUi(gameState: GameState) {
  const highScoreHardcore = gameState.usedImages ? '' : ' 😈';
  const highScore = gameState.usedImages ? gameState.highScore : gameState.hardcoreHighScore;

  return <p>High Score: {highScore}{highScoreHardcore}</p>;
}

function LoadingUi(gameState: GameState) {
  const loadingPercent = gameState.progressEvent === undefined
    ? 0
    : (gameState.progressEvent.current * 100 / gameState.progressEvent.total).toFixed(1);

  return <p>Loading... {loadingPercent}%</p>;
}

function QuestionUi(gameState: GameState, setGameState: React.Dispatch<React.SetStateAction<GameState>>) {
  const question = gameState.questions[gameState.activeQuestion];

  const optionsUi = question.options.map((option, index) => {
    const onClick = () => {
      if (index === question.correctIndex) {
        gameState.uiState = UiState.SHOW_ANSWER_CORRECT;
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
        gameState.uiState = UiState.SHOW_ANSWER_INCORRECT;
        gameState.lives--;
        setGameState({ ...gameState });
      }

      setTimeout(() => {
        gameState.uiState = UiState.SHOW_QUESTION;
        gameState.activeQuestion++;

        if (gameState.lives === 0 || gameState.activeQuestion >= gameState.questions.length) {
          gameState.uiState = UiState.GAME_OVER;
        }

        setGameState({ ...gameState });
      }, POST_QUESTION_DELAY);
    };

    if (gameState.uiState === UiState.SHOW_QUESTION) {
      return <button key={index} onClick={onClick}>{option}</button>;
    } else {
      if (index === question.correctIndex) {
        return <button key={index} className='button-correct'>{option}</button>;
      } else if (gameState.uiState === UiState.SHOW_ANSWER_INCORRECT) {
        return <button key={index} className='button-incorrect'>{option}</button>;
      } else {
        return <button key={index}>{option}</button>;
      }
    }
  });

  const onImageSectionClick = () => {
    gameState.disableImages = true;
    localStorage.setItem(DISABLE_IMAGES_KEY, gameState.disableImages.toString());

    setGameState({ ...gameState });
  };

  return <div>
    <div style={{ position: 'relative', zIndex: 1 }}>
      {StatsUi(gameState)}
      <p style={{ marginBottom: 0, marginTop: 0 }}>Question #{(gameState.activeQuestion + 1).toLocaleString()} of {gameState.questions.length.toLocaleString()}</p>
      <AsyncImage src={question.imageUrl} disableImages={gameState.disableImages} onClick={onImageSectionClick} />
    </div>
    {MusicPlayerUi(question)}
    <p style={{ marginTop: 0, marginLeft: '0.4em', marginRight: '0.4em' }}>
      {question.text}
    </p>
    {optionsUi}
  </div>;
}

function MusicPlayerUi(question: Question) {
  if (question.audioLink !== null) {
    return <audio preload='none' controls src={question.audioLink} style={{ height: '21px' }} />;
  }

  if (question.spotifyId === null) return <></>;

  return <div style={{ display: 'flex', justifyContent: 'center' }}>
    <MusicPlayer id={question.spotifyId} />
  </div>;
}

function StatsUi(gameState: GameState) {
  let livesString = '';
  for (let i = 0; i < MAX_LIVES; i++) {
    livesString += i < gameState.lives ? '❤️' : '🖤';
  }
  const livesUi = <span>{livesString}</span>

  return <div style={{ display: 'flex', justifyContent: 'space-evenly' }}>
    <p>Score: {gameState.score}</p>
    <p>{livesUi}</p>
    {HighScoreUi(gameState)}
  </div>;
}
