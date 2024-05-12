import './App.css';
import { useState } from 'react';
import { Question } from './Data';

export default function App({ prop }: any) {
  const [question, setQuestion] = useState({
    text: "Loading...",
    options: [] as Array<string>,
  } as Question);

  const pendingQuestion = prop as Promise<Question>;

  pendingQuestion.then(readyQuestion => {
    setQuestion(readyQuestion);
  });

  const optionsUi = question.options.map((option, index) => {
    const onClick = () => {
      if (index === question.correctIndex) {
        console.log('Correct!');
      } else {
        console.log('Incorrect!');
      }
    };

    return <button key={index} onClick={onClick}>{option}</button>;
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
