import React from 'react';
import logo from './logo.svg';
import './App.css';
import { useState } from 'react';

export default function App({ prop }: any) {
  const [rollercoaster, setRollercoaster] = useState('Loading');

  const questionText = prop as Promise<string>;

  questionText.then(text => {
    setRollercoaster(text);
  });

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          {rollercoaster}
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}
