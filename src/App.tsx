import './App.css';
import { useState } from 'react';
import { Question } from './Data';

interface GameState {
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
  SHOW_ANSWER_INCORRECT
}

export default function App({ prop }: any) {
  const [gameState, setGameState] = useState({ uiState: UiState.LOADING } as GameState)

  const pendingQuestions = prop as Promise<Array<Question>>;

  pendingQuestions.then(readyQuestions => {
    if (readyQuestions === gameState.questions) return;

    setGameState({
      questions: readyQuestions,
      activeQuestion: 0,
      uiState: UiState.SHOW_QUESTION,
      lives: 3,
      score: 0
    } as GameState);
  });

  const ui = gameState.uiState === UiState.LOADING
    ? LoadingUi()
    : QuestionUi(gameState, setGameState)

  return (
    <div className="App">
      <header className="App-header">
        {ui}
      </header>
    </div>
  );
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
        setGameState({ ...gameState });
      }, 3000)
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
    <p>
      {question.text}
    </p>
    {optionsUi}
  </div>;
}
