import React from 'react';
import './App.css';
import { useState } from 'react';
import { Question } from './Data';

export default function App({ prop }: any) {
  const [rollercoaster, setRollercoaster] = useState('Loading...');
  const [options, setOptions] = useState([] as Array<string>);

  const question = prop as Promise<Question>;

  question.then(question => {
    setRollercoaster(question.text);
    setOptions(question.options)
  });

  return (
    <div className="App">
      <header className="App-header">
        <p>
          {rollercoaster}
        </p>
        {options.map(option => <button key={option}>{option}</button>)}
      </header>
    </div>
  );
}
