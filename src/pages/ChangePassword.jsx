import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { ArrowPathIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

const ChangePassword = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { success, error: showError } = useNotification();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validate passwords match
    if (formData.newPassword !== formData.confirmPassword) {
      setError('New password and confirmation do not match.');
      showError('New password and confirmation do not match.');
      return;
    }

    // Validate password strength
    if (formData.newPassword.length < 8) {
      setError('Password must be at least 8 characters long.');
      showError('Password must be at least 8 characters long.');
      return;
    }

    try {
      setLoading(true);

      await authService.changePassword({
        current_password: formData.currentPassword,
        new_password: formData.newPassword,
      });

      success('Password changed successfully. Please log in with your new password.');
      
      // Log the user out after a successful password change
      setTimeout(() => {
        logout();
        navigate('/login');
      }, 2000);
    } catch (err) {
      console.error('Error changing password:', err);
      const errorMessage = err.response?.data?.detail || 'Failed to change password. Please try again.';
      setError(errorMessage);
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Change Password</h1>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Current Password
            </label>
            <input
              id="currentPassword"
              name="currentPassword"
              type="password"
              className="form-control"
              value={formData.currentPassword}
              onChange={handleInputChange}
              required
              autoComplete="current-password"
            />
          </div>

          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
              New Password
            </label>
            <input
              id="newPassword"
              name="newPassword"
              type="password"
              className="form-control"
              value={formData.newPassword}
              onChange={handleInputChange}
              required
              autoComplete="new-password"
            />
            <p className="mt-1 text-xs text-gray-500">Password must be at least 8 characters long.</p>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Confirm New Password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              className="form-control"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              required
              autoComplete="new-password"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => navigate('/profile')}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center">
                  <ArrowPathIcon className="w-4 h-4 mr-2 animate-spin" />
                  Changing Password...
                </span>
              ) : (
                'Change Password'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;