import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from "react-router-dom";

const AuthContext = createContext({});

const API_URL = import.meta.env.VITE_API_URL || '/api';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      verifyToken(storedToken);
    } else {
      // Auto-login for localhost development
      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        console.log('Localhost detected: Attempting auto-login for testing...');
        autoLoginForDev();
      } else {
        setLoading(false);
      }
    }
  }, []);

  const autoLoginForDev = async () => {
    try {
      const result = await login('testuser', 'password123', 'dev-token-bypass');
      if (result.success) {
        console.log('Auto-login successful.');
      }
    } catch (err) {
      console.error('Auto-login failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const verifyToken = async (token) => {
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get(`${API_URL}/auth/verify.php`, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 5000
      });

      if (response.data && response.data.user) {
        setUser(response.data.user);
        setToken(token);
        localStorage.setItem('token', token);
      } else {
        localStorage.removeItem('token');
        setUser(null);
      }
    } catch (error) {
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password, cfToken) => {
    try {
      setError('');
      const response = await axios.post(`${API_URL}/auth/login.php`, {
        username: username.trim(),
        password: password,
        cf_token: cfToken
      }, {
        timeout: 10000
      });

      if (response.data && response.data.token && response.data.user) {
        const { token, user } = response.data;
        localStorage.setItem('token', token);
        setToken(token);
        setUser(user);
        return { success: true };
      } else {
        throw new Error('Invalid response format from server');
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Login failed'
      };
    }
  };

  const register = async (username, password, cfToken) => {
    try {
      const response = await axios.post(`${API_URL}/auth/register.php`, {
        username,
        password,
        cf_token: cfToken
      });
      if (response.data && response.data.token) {
        localStorage.setItem('token', response.data.token);
        setUser(response.data.user);
        return { success: true };
      }
      return { success: false, error: 'Registration succeeded but no token returned' };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Registration failed'
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};