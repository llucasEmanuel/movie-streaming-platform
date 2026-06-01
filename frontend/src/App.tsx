import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Home } from './pages/Home';
import { MovieDetail } from './pages/MovieDetail';
import cinema_logo from './assets/cinema_logo.png';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app">
        <header className="app-header">
          <img src={cinema_logo} alt="Cinema Logo" width="300" />
        </header>

        <main className="app-main">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/movie/:movieId" element={<MovieDetail />} />
          </Routes>
        </main>

        <footer className="app-footer">
          <p>&copy; 2026 Movie Streaming Platform. Todos os direitos reservados.</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;