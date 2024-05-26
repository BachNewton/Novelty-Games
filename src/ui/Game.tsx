import '../css/Game.css';
import { useState } from 'react';
import { Data, DataType, Question } from '../logic/Data';
import createQuestions from '../logic/QuestionCreator';
import AsyncImage from './AsyncImage';

interface GameProps {
  pendingData: Promise<Array<Data>>;
  dataType: DataType;
  onHomeClicked: () => void;
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

const Game: React.FC<GameProps> = ({ pendingData, dataType, onHomeClicked }) => {
  const [gameState, setGameState] = useState({ uiState: UiState.LOADING } as GameState)

  pendingData.then(readyData => {
    if (readyData === gameState.data) return;

    resetGame(readyData, dataType, setGameState);
  });

  return (
    <div className="Game">
      <button id='home-button' onClick={onHomeClicked}>🏠</button>
      <header className="Game-header">
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
  if (gameState.uiState === UiState.LOADING) {
    return LoadingUi();
  } else if (gameState.uiState === UiState.GAME_OVER) {
    return GameOverUi(gameState, setGameState);
  } else {
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

function LoadingUi() {
  return <p>Loading...</p>
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
    const flipped = !gameState.disableImages;
    localStorage.setItem(DISABLE_IMAGES_KEY, flipped.toString());
    gameState.disableImages = flipped;

    if (!gameState.disableImages) {
      gameState.usedImages = true;
    }

    setGameState({ ...gameState });
  };

  return <div>
    {StatsUi(gameState)}
    <p style={{ marginBottom: 0, marginTop: 0 }}>Question #{gameState.activeQuestion + 1} of {gameState.questions.length}</p>
    <AsyncImage src={question.imageUrl} disableImages={gameState.disableImages} onClick={onImageSectionClick} />
    <p style={{ marginTop: 0 }}>
      {question.text}
    </p>
    {optionsUi}
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
