import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

/**
 * RoleBasedRoute component for role-based access control
 * @param {Object} props
 * @param {JSX.Element} props.children - Child component to render if authorized
 * @param {string|string[]} props.allowedRoles - Single role or array of roles allowed to access this route
 * @param {string} [props.redirectPath='/login'] - Path to redirect to if not authorized
 */
const RoleBasedRoute = ({ 
  children, 
  allowedRoles, 
  redirectPath = '/login' 
}) => {
  const { currentUser, isAuthenticated } = useAuth();
  
  // If user is not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to={redirectPath} replace />;
  }
  
  // Convert allowedRoles to array if it's a string
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
  
  // Check if the user's role is included in the allowed roles
  // Allow access if allowedRoles includes 'all' or the user's actual role
  if (roles.includes('all') || roles.includes(currentUser?.role)) {
    return children;
  }
  
  // Redirect to dashboard if role doesn't match
  return <Navigate to="/dashboard" replace />;
};

export default RoleBasedRoute;