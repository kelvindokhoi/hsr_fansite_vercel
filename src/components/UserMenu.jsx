import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import '../css/UserMenu.css';

function UserMenu({ stellarJadeIcon }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleLogin = () => {
    navigate('/login');
  };

  if (!user) {
    return (
      <div className="user-menu-logged-out">
        <button onClick={handleLogin} className="login-button">
          Login
        </button>
      </div>
    );
  }

  return (
    <div className="user-menu">
      <span className="username">{user.username}</span>
      <div className="stellar-jade-container">
        {stellarJadeIcon ? (
          <img src={stellarJadeIcon} alt="Stellar Jade" className="stellar-jade-icon" />
        ) : (
          <span className="stellar-jade-emoji">💎</span>
        )}
        <span className="stellar-jade-amount">{user.stellar_jade_balance}</span>
      </div>
      <button onClick={handleLogout} className="logout-button">
        Logout
      </button>
    </div>
  );
}

export default UserMenu;