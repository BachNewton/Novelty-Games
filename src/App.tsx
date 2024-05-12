import './App.css';
import { useState } from 'react';
import { Question } from './Data';

enum GameState {
  SHOW_QUESTION,
  SHOW_ANSWER_CORRECT,
  SHOW_ANSWER_INCORRECT
}

export default function App({ prop }: any) {
  const [gameState, setGameState] = useState(GameState.SHOW_QUESTION);
  const [question, setQuestion] = useState({
    text: "Loading...",
    options: [] as Array<string>,
  } as Question);

  const pendingQuestion = prop as Promise<Question>;

  pendingQuestion.then(readyQuestion => {
    if (readyQuestion === question) return;
    setQuestion(readyQuestion);
  });

  const optionsUi = question.options.map((option, index) => {
    const onClick = () => {
      if (index === question.correctIndex) {
        setGameState(GameState.SHOW_ANSWER_CORRECT);
      } else {
        setGameState(GameState.SHOW_ANSWER_INCORRECT);
      }
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

  return (
    <div className="App">
      <header className="App-header">
        <p>
          {question.text}
        </p>
        {optionsUi}
      </header>
    </div>
  );
}
