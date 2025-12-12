import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './css/index.css';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import reportWebVitals from './reportWebVitals';
import App from './ui/App';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

// Create callbacks for update notifications
let onUpdateAvailableCallback: () => void = () => { };
let onUpdateReadyCallback: () => void = () => { };
let onNoUpdateFoundCallback: () => void = () => { };
let onOfflineCallback: () => void = () => { };

const updateCallbacks = {
  setOnUpdateAvailable: (callback: () => void) => {
    onUpdateAvailableCallback = callback;
  },
  setOnUpdateReady: (callback: () => void) => {
    onUpdateReadyCallback = callback;
  },
  setOnNoUpdateFound: (callback: () => void) => {
    onNoUpdateFoundCallback = callback;
  },
  setOnOffline: (callback: () => void) => {
    onOfflineCallback = callback;
  },
};

root.render(
  <React.StrictMode>
    <BrowserRouter basename="/Novelty-Games">
      <App updateCallbacks={updateCallbacks} />
    </BrowserRouter>
  </React.StrictMode>
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://cra.link/PWA
serviceWorkerRegistration.register({
  versionCheckCallbacks: {
    onUpdateAvailable: () => {
      onUpdateAvailableCallback();
    },
    onUpdateReady: () => {
      onUpdateReadyCallback();
    },
    onUpToDate: () => {
      onNoUpdateFoundCallback();
    },
    onOffline: () => {
      onOfflineCallback();
    },
    onCheckFailed: () => {
      // If version check fails (network error, etc.), 
      // we can't determine update status, so leave UI in checking state
    },
  },
});

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
