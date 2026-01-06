import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import '../css/UserMenu.css';

function UserMenu() {
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
      <button onClick={handleLogout} className="logout-button">
        Logout
      </button>
    </div>
  );
}

export default UserMenu;