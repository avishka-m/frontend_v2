import { useContext } from 'react';
import AuthContext from '../context/AuthContext';

export const useAuth = () => {
  const context = useContext(AuthContext);
  
  // If context is undefined, it means the component is not wrapped in AuthProvider
  if (context === undefined) {
    console.warn('useAuth must be used within an AuthProvider');
    return null; // Return null instead of throwing to prevent crashes
  }
  
  return context;
};