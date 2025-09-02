import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import CreateNFT from './pages/CreateNFT';
import Profile from './pages/Profile';
import Mint from './pages/Mint';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/create" element={<CreateNFT />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/mint/:id" element={<Mint />} />
      </Routes>
    </Router>
  );
};

export default App;
