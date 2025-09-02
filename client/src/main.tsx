import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './styles/theme.css';
import Home from './pages/Home';
import CreateNFT from './pages/CreateNFT';
import Profile from './pages/Profile';


console.log('✅ main.tsx loaded');

const App: React.FC = () => {
  console.log('✅ App component initialized');

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/create" element={<CreateNFT />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </BrowserRouter>
  );
};

const rootElement = document.getElementById('root');

if (!rootElement) {
  console.error('❌ root element not found in DOM');
} else {
  try {
    console.log('✅ ReactDOM.createRoot starting');
    const root = ReactDOM.createRoot(rootElement);
    root.render(<App />);
    console.log('✅ React mounted successfully');
  } catch (err) {
    console.error('❌ React failed to mount:', err);
  }
}


window.onerror = function (message, source, lineno, colno, error) {
  console.error('❌ Global JS Error:', { message, source, lineno, colno, error });
};
