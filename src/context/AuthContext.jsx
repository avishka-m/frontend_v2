import { createContext, useState, useEffect } from 'react';
import { authService } from '../services';
import { useNotifications } from './NotificationContext';

// Create the auth context
const AuthContext = createContext();

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [authenticated, setAuthenticated] = useState(false);
  const { addNotification } = useNotifications();

  // Attempt to load user from local storage on mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        setLoading(true);
        
        // Check if token exists
        if (authService.isAuthenticated()) {
          // Try to fetch fresh data from API first
          try {
            const userData = await authService.getCurrentUser();
            const userFirstName = userData.firstName || userData.name?.split(' ')[0] || '';
            const userLastName = userData.lastName || userData.name?.split(' ').slice(1).join(' ') || '';
            
            setCurrentUser({
              ...userData,
              fullName: userData.name || `${userFirstName} ${userLastName}`.trim() || userData.username
            });
            setAuthenticated(true);
            
            // Update localStorage with fresh data
            localStorage.setItem('username', userData.username);
            localStorage.setItem('userRole', userData.role);
            localStorage.setItem('userFirstName', userFirstName);
            localStorage.setItem('userLastName', userLastName);
            localStorage.setItem('userEmail', userData.email || '');
            
          } catch (err) {
            // If API fails, try to use cached data from localStorage
            console.log('API failed, using cached user data:', err.message);
            const storedUsername = localStorage.getItem('username');
            const storedRole = localStorage.getItem('userRole');
            const storedFirstName = localStorage.getItem('userFirstName');
            const storedLastName = localStorage.getItem('userLastName');
            const storedEmail = localStorage.getItem('userEmail');
            
            if (storedUsername && storedRole) {
              setCurrentUser({
                username: storedUsername,
                role: storedRole,
                firstName: storedFirstName || '',
                lastName: storedLastName || '',
                email: storedEmail || '',
                fullName: `${storedFirstName || ''} ${storedLastName || ''}`.trim() || storedUsername
              });
              setAuthenticated(true);
            } else {
              // No valid cached data, clear everything
              authService.logout();
              setAuthenticated(false);
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
      console.log('AuthContext: Starting login process for:', username);
      setLoading(true);
      setError(null);
      
      const userData = await authService.login(username, password);
      console.log('AuthContext: Login service returned:', userData);
      
      // Store user data in localStorage - handle both complete and partial user data
      const userFirstName = userData.firstName || userData.name?.split(' ')[0] || '';
      const userLastName = userData.lastName || userData.name?.split(' ').slice(1).join(' ') || '';
      
      localStorage.setItem('username', userData.username);
      localStorage.setItem('userRole', userData.role || 'User');
      localStorage.setItem('userFirstName', userFirstName);
      localStorage.setItem('userLastName', userLastName);
      localStorage.setItem('userEmail', userData.email || '');
      
      // Set current user with complete data
      const currentUserData = {
        id: userData.id,
        username: userData.username,
        firstName: userFirstName,
        lastName: userLastName,
        email: userData.email || '',
        role: userData.role || 'User',
        fullName: userData.name || `${userFirstName} ${userLastName}`.trim() || userData.username
      };
      
      console.log('AuthContext: Setting current user:', currentUserData);
      setCurrentUser(currentUserData);
      setAuthenticated(true);
      setError(null);
      
      // Show success notification
      addNotification({
        type: 'success',
        message: 'Login Successful!',
        description: `Welcome back, ${currentUserData.fullName || currentUserData.username}!`
      });
      
      console.log('AuthContext: Login successful');
      return true; // Return success boolean
    } catch (err) {
      console.error('AuthContext: Login error:', err);
      setError(err.message || 'Failed to login. Please check your credentials.');
      setAuthenticated(false);
      
      // Show error notification
      addNotification({
        type: 'error',
        message: 'Login Failed',
        description: err.message || 'Please check your credentials and try again.'
      });
      
      return false; // Return failure boolean
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