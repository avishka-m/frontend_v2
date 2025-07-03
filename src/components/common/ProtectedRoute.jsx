import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // If authentication is still loading, show a loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  // Check if user is authenticated
  if (!isAuthenticated()) {
    // Redirect to login page, but save the location they were trying to access
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // User is authenticated, render the protected component
  return children;
};

export default ProtectedRoute;