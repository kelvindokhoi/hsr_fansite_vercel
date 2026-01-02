import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AudioProvider } from './context/AudioContext';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import About from './pages/About';
import Credits from './pages/Credits';
import Login from './pages/Login';
import CharacterListPage from './pages/CharacterListPage';
import WarpSimulator from './pages/WarpSimulator';
import EditCharactersPage from './pages/EditCharactersPage';
import MusicSettings from './components/MusicSettings';
import './css/App.css';

function App() {
  return (
    <AuthProvider>  {/* Wrap your app with AuthProvider */}
      <AudioProvider>
        <div className="app-container">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/credits" element={<Credits />} />
            <Route path="/login" element={<Login />} />
            {/* Protected routes */}
            <Route
              path="/character-list"
              element={
                <ProtectedRoute>
                  <CharacterListPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/gacha-pulling"
              element={
                <ProtectedRoute>
                  <WarpSimulator />
                </ProtectedRoute>
              }
            />
            <Route
              path="/edit-characters"
              element={
                <ProtectedRoute>
                  <EditCharactersPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/warp-simulator"
              element={
                <ProtectedRoute>
                  <WarpSimulator />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={
              <div>
                <h2>404: Page not found</h2>
                <p>Current path: {window.location.pathname}</p>
                <p>Available routes:</p>
                <ul>
                  <li>/</li>
                  <li>/about</li>
                  <li>/credits</li>
                  <li>/login</li>
                  <li>/characters</li>
                  <li>/gacha-pulling</li>
                  <li>/edit-characters</li>
                  <li>/warp-simulator</li>
                </ul>
              </div>
            } />
          </Routes>
          <MusicSettings />
        </div>
      </AudioProvider>
    </AuthProvider>
  );
}

export default App;
