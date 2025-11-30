import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import HSRLogo from '../assets/hsr_logo.png';
import HSRLogoCastorice from '../assets/HSR_Logo_Castorice.png'
import PillNav from '../components/PillNav';
import GradientText from '../components/GradientText';
import DotGrid from '../components/DotGrid';
import UserMenu from '../components/UserMenu';
import '../css/Login.css';
import StellarJadePNG from '../assets/Item_Stellar_Jade.png';

function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = isLogin
      ? await login(username, password)
      : await register(username, password);

    setLoading(false);

    if (result.success) {
      navigate('/');
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="login-page">
      <DotGrid 
        dotSize={2} 
        gap={15} 
        baseColor="#5227FF" 
        activeColor="#5227FF" 
        proximity={120} 
        shockRadius={250} 
        shockStrength={5} 
        resistance={750} 
        returnDuration={1.5}
      />
      
      <PillNav
        logo={HSRLogoCastorice} 
        logoAlt="Honkai: Star Rail Logo"
        items={[
          { label: 'Home', href: '/' },
          { label: 'About', href: '/about' },
          { label: 'Character List', href: '/character-list' },
          { label: 'Gacha Pulling', href: '/gacha-pulling' },
          { label: 'Credits', href: '/credits' }
        ]}
        activeHref="/login" 
        className="custom-nav" 
        baseColor="#753eceff" 
        pillColor="#ffffff" 
        hoveredPillTextColor="#ffffff" 
        pillTextColor="#000000"
      />
      
      <div className="login-container">
        <div className="login-card">
          <GradientText 
            colors={["#40ffaa", "#4079ff", "#40ffaa", "#4079ff", "#40ffaa"]} 
            animationSpeed={3} 
            showBorder={false} 
            className="login-title"
          >
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </GradientText>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                minLength={3}
                placeholder="Enter username"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                placeholder="Enter password"
              />
            </div>

            {error && <div className="error-message">{error}</div>}

            <button type="submit" className="submit-button" disabled={loading}>
              {loading ? 'Please wait...' : (isLogin ? 'Login' : 'Sign Up')}
            </button>
          </form>

          <div className="toggle-form">
            <p>
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button 
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError('');
                }}
                className="toggle-button"
              >
                {isLogin ? 'Sign Up' : 'Login'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;