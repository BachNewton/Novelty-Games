import React from 'react';
import ReactDOM from 'react-dom/client';
import './css/index.css';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import reportWebVitals from './reportWebVitals';
import Home from './ui/Home';
// import io from 'socket.io-client';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

const updateListener = { onUpdateAvailable: () => { }, onNoUpdateFound: () => { } };

// const socket = io('http://35.184.159.91/');

// socket.on('connect', () => {
//   console.log('Connected to server');
// });

// socket.on('disconnect', () => {
//   console.log('Disconnected from server');
// });

root.render(
  <React.StrictMode>
    <Home updateListener={updateListener} />
  </React.StrictMode>
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://cra.link/PWA
serviceWorkerRegistration.register({
  onUpdate: (registration) => {
    registration.waiting?.postMessage({ type: "SKIP_WAITING" });
    updateListener.onUpdateAvailable();
  },
  onNoUpdateFound: () => { updateListener.onNoUpdateFound(); }
});

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
