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
          const storedUsername = localStorage.getItem('username');
          const storedRole = localStorage.getItem('userRole');
          const storedFirstName = localStorage.getItem('userFirstName');
          const storedLastName = localStorage.getItem('userLastName');
          const storedEmail = localStorage.getItem('userEmail');
          
          if (storedUsername && storedRole) {
            // Set user data from localStorage
            setCurrentUser({
              username: storedUsername,
              role: storedRole,
              firstName: storedFirstName || '',
              lastName: storedLastName || '',
              email: storedEmail || '',
              fullName: `${storedFirstName || ''} ${storedLastName || ''}`.trim() || storedUsername
            });
            setAuthenticated(true);
            
            // Try to fetch fresh data from API
            try {
              const userData = await authService.getCurrentUser();
              setCurrentUser(prevUser => ({
                ...prevUser,
                ...userData,
                fullName: `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || userData.username
              }));
            } catch (err) {
              // Continue with localStorage data if API fails
              console.log('Failed to fetch fresh user data, using cached data');
            }
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
      
      // Store user data in localStorage
      localStorage.setItem('username', userData.username);
      localStorage.setItem('userRole', userData.role);
      localStorage.setItem('userFirstName', userData.firstName || '');
      localStorage.setItem('userLastName', userData.lastName || '');
      localStorage.setItem('userEmail', userData.email || '');
      
      // Set current user with complete data
      setCurrentUser({
        id: userData.id,
        username: userData.username,
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        role: userData.role,
        fullName: `${userData.firstName} ${userData.lastName}`.trim()
      });
      
      setAuthenticated(true);
      setError(null);
      
      return userData;
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.detail || 'Failed to login. Please check your credentials.');
      setAuthenticated(false);
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
    localStorage.removeItem('userFirstName');
    localStorage.removeItem('userLastName');
    localStorage.removeItem('userEmail');
    setCurrentUser(null);
    setAuthenticated(false);
    setError(null);
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