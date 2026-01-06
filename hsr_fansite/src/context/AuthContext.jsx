import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from "react-router-dom";

const AuthContext = createContext({});

const API_URL = 'http://localhost/api';

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
      setLoading(false);
    }
  }, []);

  const verifyToken = async (token) => {
    if (!token) {
      console.log('No token found');
      setLoading(false);
      return;
    }

    try {
      console.log('Verifying token...');
      const response = await axios.get(`${API_URL}/auth/verify.php`, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 5000 // 5 second timeout
      });

      if (response.data && response.data.user) {
        console.log('Token verification successful');
        setUser(response.data.user);
        setToken(token);
        // Ensure token is stored
        localStorage.setItem('token', token);
      } else {
        console.error('Invalid token response format');
        localStorage.removeItem('token');
        setUser(null);
      }
    } catch (error) {
      console.error('Token verification failed:', error.message);
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
        if (error.response.status === 401) {
          console.log('Token expired or invalid');
        }
      } else if (error.request) {
        console.error('No response received:', error.request);
      } else {
        console.error('Error setting up request:', error.message);
      }
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      console.log('Auth loading complete');
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    try {
      setError('');
      const response = await axios.post(`${API_URL}/auth/login.php`, {
        username: username.trim(),
        password: password
      }, {
        timeout: 10000 // 10 second timeout
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

  const register = async (username, password) => {
    try {
      const response = await axios.post(`${API_URL}/auth/register.php`, {
        username,
        password
      });
      localStorage.setItem('token', response.data.token);
      setUser(response.data.user);
      return { success: true };
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