import { wmsApi } from './apiConfig';

export const authService = {
  login: (credentials) => {
    // Convert to form data format as required by FastAPI's token endpoint
    const formData = new URLSearchParams();
    formData.append('username', credentials.username);
    formData.append('password', credentials.password);
    
    return wmsApi.post('/auth/token', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
  },

  getCurrentUser: () => wmsApi.get('/auth/me'),

  logout: () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  },

  refreshToken: () => wmsApi.post('/auth/refresh'),
};
