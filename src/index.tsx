import React from 'react';
import ReactDOM from 'react-dom/client';
import './css/index.css';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import reportWebVitals from './reportWebVitals';
import Home from './ui/Home';
import { setServiceWorkerRegistration } from './util/ServiceWorkerManager';

// Fix viewport height for mobile devices (handles browser UI appearing/disappearing)
function setViewportHeight() {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
}

// Set initial viewport height immediately (before React renders)
setViewportHeight();

// Update on resize and orientation change
window.addEventListener('resize', setViewportHeight);
window.addEventListener('orientationchange', () => {
  // Delay to ensure accurate height after orientation change
  setTimeout(setViewportHeight, 100);
});

// Update once after a short delay to catch browser UI changes on initial load
// This is important on mobile when the browser UI (address bar, etc.) appears/disappears
setTimeout(setViewportHeight, 100);

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
    // Store the registration so the update button can use it
    setServiceWorkerRegistration(registration);
    // Don't auto-activate - let the user click the update button
    // The version check hook will detect the update via version.json comparison
  },
  onSuccess: (registration) => {
    // Store the registration even on initial success
    setServiceWorkerRegistration(registration);
  },
});

// Also try to get and store the registration from navigator.serviceWorker.ready
// This ensures we have it even if the callbacks haven't fired yet
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.ready.then((registration) => {
    setServiceWorkerRegistration(registration);
  }).catch(() => {
    // Ignore errors - registration will be stored via callbacks
  });
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
