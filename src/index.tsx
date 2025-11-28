import React from 'react';
import ReactDOM from 'react-dom/client';
import './css/index.css';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import reportWebVitals from './reportWebVitals';
import Home from './ui/Home';

// Fix viewport height for mobile devices (handles browser UI appearing/disappearing)
function setViewportHeight() {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
}

// Set initial viewport height
setViewportHeight();

// Update on resize and orientation change
window.addEventListener('resize', setViewportHeight);
window.addEventListener('orientationchange', () => {
  // Delay to ensure accurate height after orientation change
  setTimeout(setViewportHeight, 100);
});

// Also update after a short delay to catch any initial browser UI changes
setTimeout(setViewportHeight, 100);
setTimeout(setViewportHeight, 500);

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <Home />
  </React.StrictMode>
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://cra.link/PWA
serviceWorkerRegistration.register({
  onUpdate: (registration) => {
    // When service worker detects an update, skip waiting to activate immediately
    registration.waiting?.postMessage({ type: "SKIP_WAITING" });
    // The version check hook will detect the update via version.json comparison
  },
});

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
