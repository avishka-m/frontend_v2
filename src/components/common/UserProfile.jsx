import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { User, Mail, Phone, Briefcase } from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';
import { NOTIFICATION_TYPES } from '../../context/NotificationContext';

const UserProfile = () => {
  const { currentUser, updateUser } = useAuth();
  const { addNotification } = useNotification();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    username: currentUser?.username || '',
    email: currentUser?.email || '',
    firstName: currentUser?.firstName || '',
    lastName: currentUser?.lastName || '',
    phone: currentUser?.phone || ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // API call to update user profile would go here
      
      // Update local user context
      updateUser(formData);
      
      addNotification({
        type: NOTIFICATION_TYPES.SUCCESS,
        message: 'Profile updated',
        description: 'Your profile has been updated successfully.'
      });
    } catch (error) {
      addNotification({
        type: NOTIFICATION_TYPES.ERROR,
        message: 'Failed to update profile',
        description: error.message || 'An unexpected error occurred.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white shadow-md rounded-lg p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">User Profile</h1>
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Username */}
          <div className="col-span-2">
            <label className="block text-gray-700 font-medium mb-2">
              Username
              <input
                type="text"
                name="username"
                value={formData.username}
                className="mt-1 block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                disabled
              />
            </label>
            <p className="mt-1 text-sm text-gray-500">Username cannot be changed</p>
          </div>
          
          {/* First Name */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              First Name
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
            </label>
          </div>
          
          {/* Last Name */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Last Name
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
            </label>
          </div>
          
          {/* Email */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Email
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                required
              />
            </label>
          </div>
          
          {/* Phone */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Phone
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
            </label>
          </div>
          
          {/* Role */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Role
              <input
                type="text"
                value={currentUser?.role || 'User'}
                className="mt-1 block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                disabled
              />
            </label>
          </div>
          
          {/* Submit Button */}
          <div className="col-span-2 flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              disabled={loading}
            >
              {loading ? 'Updating...' : 'Update Profile'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default UserProfile;