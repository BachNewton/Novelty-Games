import './App.css';
import { useState } from 'react';
import { Question } from './Data';

enum GameState {
  SHOW_QUESTION,
  SHOW_ANSWER_CORRECT,
  SHOW_ANSWER_INCORRECT
}

export default function App({ prop }: any) {
  const [activeQuestion, setActiveQuestion] = useState(0);
  const [questions, setQuestions] = useState([] as Array<Question>);
  const [gameState, setGameState] = useState(GameState.SHOW_QUESTION);
  const [lives, setLives] = useState(3);
  const [score, setScore] = useState(0);

  const pendingQuestions = prop as Promise<Array<Question>>;

  pendingQuestions.then(readyQuestions => {
    if (readyQuestions === questions) return;
    setQuestions(readyQuestions);
  });

  const ui = questions.length === 0
    ? LoadingUi()
    : QuestionUi(questions, activeQuestion, setActiveQuestion, gameState, setGameState, lives, setLives, score, setScore);

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

function QuestionUi(
  questions: Question[],
  activeQuestion: number,
  setActiveQuestion: React.Dispatch<React.SetStateAction<number>>,
  gameState: GameState,
  setGameState: React.Dispatch<React.SetStateAction<GameState>>,
  lives: number,
  setLives: React.Dispatch<React.SetStateAction<number>>,
  score: number,
  setScore: React.Dispatch<React.SetStateAction<number>>) {

  const question = questions[activeQuestion];

  const optionsUi = question.options.map((option, index) => {
    const onClick = () => {
      if (index === question.correctIndex) {
        setGameState(GameState.SHOW_ANSWER_CORRECT);
        setScore(score + 1);
      } else {
        setGameState(GameState.SHOW_ANSWER_INCORRECT);
        setLives(lives - 1);
      }

      setTimeout(() => {
        setGameState(GameState.SHOW_QUESTION);
        setActiveQuestion(activeQuestion + 1);
      }, 3000)
    };

    if (gameState === GameState.SHOW_QUESTION) {
      return <button key={index} onClick={onClick}>{option}</button>;
    } else {
      if (index === question.correctIndex) {
        return <button key={index} className='button-correct'>{option}</button>;
      } else if (gameState === GameState.SHOW_ANSWER_INCORRECT) {
        return <button key={index} className='button-incorrect'>{option}</button>;
      } else {
        return <button key={index}>{option}</button>;
      }
    }
  });

  const livesUi = new Array(lives).fill(0).map((_, index) => <span key={index}>❤️</span>);

  return <div>
    <p>{livesUi}</p>
    <p>Score: {score}</p>
    <p>
      {question.text}
    </p>
    {optionsUi}
  </div>;
}
