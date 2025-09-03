import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/theme.css';
import App from './App'; 

console.log('✅ main.tsx loaded');

const rootElement = document.getElementById('root');

if (!rootElement) {
  console.error('❌ root element not found in DOM');
} else {
  try {
    console.log('✅ ReactDOM.createRoot starting');
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    console.log('✅ React mounted successfully');
  } catch (err) {
    console.error('❌ React failed to mount:', err);
  }
}

window.onerror = function (message, source, lineno, colno, error) {
  console.error('❌ Global JS Error:', { message, source, lineno, colno, error });
};
