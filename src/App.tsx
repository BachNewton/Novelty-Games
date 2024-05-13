import './App.css';
import { useState } from 'react';
import { Question, Rollercoaster } from './Data';
import createQuestions from './Game';

interface GameState {
  coasters: Array<Rollercoaster>,
  questions: Array<Question>,
  activeQuestion: number,
  uiState: UiState,
  lives: number,
  score: number
}

enum UiState {
  LOADING,
  SHOW_QUESTION,
  SHOW_ANSWER_CORRECT,
  SHOW_ANSWER_INCORRECT,
  GAME_OVER
}

export default function App({ prop }: any) {
  const [gameState, setGameState] = useState({ uiState: UiState.LOADING } as GameState)

  const pendingCoasters = prop as Promise<Array<Rollercoaster>>;

  pendingCoasters.then(readyCoasters => {
    if (readyCoasters === gameState.coasters) return;

    resetGame(readyCoasters, setGameState);
  });

  return (
    <div className="App">
      <header className="App-header">
        {Ui(gameState, setGameState)}
      </header>
    </div>
  );
}

function resetGame(coasters: Array<Rollercoaster>, setGameState: React.Dispatch<React.SetStateAction<GameState>>) {
  setGameState({
    coasters: coasters,
    questions: createQuestions(coasters),
    activeQuestion: 0,
    uiState: UiState.SHOW_QUESTION,
    lives: 3,
    score: 0
  } as GameState);
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
    resetGame(gameState.coasters, setGameState);
  };

  return <div>
    Game Over!
    <p>Final Score: {gameState.score}</p>
    <button onClick={playAgain}>Play again</button>
  </div>;
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
      }, 2000)
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

  const livesUi = new Array(gameState.lives).fill(0).map((_, index) => <span key={index}>❤️</span>);

  return <div>
    <p>{livesUi}</p>
    <p>Score: {gameState.score}</p>
    <p>Question #{gameState.activeQuestion + 1} of {gameState.questions.length}</p>
    <p>
      {question.text}
    </p>
    {optionsUi}
  </div>;
}
