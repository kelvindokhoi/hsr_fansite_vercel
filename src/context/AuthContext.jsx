// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import axios from 'axios';

const AuthContext = createContext({});

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost/hsrapp/api';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(`${API_URL}/auth/verify.php`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.data.user) {
          setUser(response.data.user);
        } else {
          localStorage.removeItem('token');
          setUser(null);
        }
      } catch (err) {
        console.error('Auth verification failed:', err);
        localStorage.removeItem('token');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (username, password) => {
    try {
      setError('');
      const response = await axios.post(`${API_URL}/auth/login.php`, {
        username,
        password
      });

      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        setUser(response.data.user);
        return { success: true };
      } else {
        throw new Error(response.data.error || 'Login failed');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Login failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const register = async (username, password) => {
    try {
      setError('');
      const response = await axios.post(`${API_URL}/auth/register.php`, {
        username,
        password
      });

      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        setUser(response.data.user);
        return { success: true };
      } else {
        throw new Error(response.data.error || 'Registration failed');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Registration failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const logout = async () => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/login');
  };

  // Keep these for backward compatibility if needed, but they might need PHP implementation
  const resetPassword = async (email) => {
    setError('Reset password not implemented in PHP backend yet.');
    return { success: false, error: 'Not implemented' };
  };

  const updateProfile = async (updates) => {
    setError('Update profile not implemented in PHP backend yet.');
    return { success: false, error: 'Not implemented' };
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    signIn: login, // Alises for compatibility
    signUp: register,
    signOut: logout,
    resetPassword,
    updateProfile
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};