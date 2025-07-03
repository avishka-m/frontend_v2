import { createContext, useState, useEffect } from 'react';
import { authService } from '../services';

// Create the auth context
const AuthContext = createContext();

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [authenticated, setAuthenticated] = useState(false);

  // Attempt to load user from local storage on mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        setLoading(true);
        
        // Check if token exists
        if (authService.isAuthenticated()) {
          try {
            // Fetch real user data from the API
            const userData = await authService.getCurrentUser();
            setCurrentUser(userData);
            setAuthenticated(true);
          } catch (err) {
            // Fallback to basic data if API fails
            setCurrentUser({
              username: localStorage.getItem('username') || 'User',
              role: localStorage.getItem('userRole') || 'clerk',
            });
            setAuthenticated(true);
          }
        }
      } catch (err) {
        console.error('Failed to load user:', err);
        setError('Failed to authenticate user. Please log in again.');
        setAuthenticated(false);
        authService.logout();
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  // Login function
  const login = async (username, password) => {
    try {
      setLoading(true);
      setError(null);
      
      const userData = await authService.login(username, password);
      
      // Store user data
      localStorage.setItem('username', username);
      localStorage.setItem('userRole', userData.role || 'clerk');
      
      // Try to get the full user profile
      try {
        const fullProfile = await authService.getCurrentUser();
        setCurrentUser(fullProfile);
      } catch (err) {
        // Fallback to basic data if API fails
        setCurrentUser({
          username,
          role: userData.role || 'clerk',
        });
      }
      
      setAuthenticated(true);
      return userData;
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.detail || 'Failed to login. Please check your credentials.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    authService.logout();
    localStorage.removeItem('username');
    localStorage.removeItem('userRole');
    setCurrentUser(null);
    setAuthenticated(false);
  };

  // Update user function
  const updateUser = (userData) => {
    setCurrentUser(prev => ({
      ...prev,
      ...userData,
    }));
    
    // Update local storage if needed
    if (userData.username) {
      localStorage.setItem('username', userData.username);
    }
    if (userData.role) {
      localStorage.setItem('userRole', userData.role);
    }
  };

  // Our own isAuthenticated function that uses the authenticated state
  const isAuthenticated = () => {
    return authenticated && authService.isAuthenticated();
  };

  // Context value
  const value = {
    currentUser,
    loading,
    error,
    login,
    logout,
    updateUser,
    isAuthenticated,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;