import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Check if user is already logged in on component mount
  useEffect(() => {
    const checkLoggedIn = async () => {
      try {
        const res = await axios.get('/api/user');
        setCurrentUser(res.data);
      } catch (err) {
        // User is not logged in, which is fine
        console.log('User not logged in');
      } finally {
        setLoading(false);
      }
    };

    checkLoggedIn();
  }, []);

  // Login function
  const login = async (email, password) => {
    try {
      setError('');
      const res = await axios.post('/api/login', { email, password });
      setCurrentUser(res.data);
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to login');
      return false;
    }
  };

  // Register function
  const register = async (username, email, password) => {
    try {
      setError('');
      await axios.post('/api/register', { username, email, password });
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to register');
      return false;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await axios.post('/api/logout');
      setCurrentUser(null);
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to logout');
      return false;
    }
  };

  // Update user data
  const updateUserData = (userData) => {
    setCurrentUser(userData);
  };

  const value = {
    currentUser,
    loading,
    error,
    login,
    register,
    logout,
    updateUserData
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 