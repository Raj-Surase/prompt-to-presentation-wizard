import axios from 'axios';

// Create axios instance with base URL
// Use environment variable if available, otherwise fallback to hardcoded value
const API_URL = import.meta.env.VITE_API_URL || 'http://192.168.31.26:5000';

console.log('API URL:', API_URL); // Helpful for debugging

// Session storage key
const SESSION_STORAGE_KEY = 'auth_session';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const session = localStorage.getItem(SESSION_STORAGE_KEY);
    if (session) {
      try {
        const { access_token } = JSON.parse(session);
        if (access_token) {
          config.headers.Authorization = `Bearer ${access_token}`;
        }
      } catch (error) {
        console.error('Failed to parse auth session:', error);
        localStorage.removeItem(SESSION_STORAGE_KEY);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Error codes that should trigger session invalidation
const INVALID_AUTH_CODES = [401, 403];

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const statusCode = error.response?.status;
    
    // Handle authentication errors
    if (statusCode && INVALID_AUTH_CODES.includes(statusCode)) {
      // Clear invalid session
      localStorage.removeItem(SESSION_STORAGE_KEY);
      
      // You could implement token refresh here if needed
      // For now, we'll just log the user out
      
      // Optionally redirect to login page
      if (window.location.pathname !== '/auth') {
        console.log('Authentication error, redirecting to login page');
        // Wait a short delay to allow any current operations to complete
        setTimeout(() => {
          window.location.href = '/auth';
        }, 100);
      }
    }
    
    // Format error messages consistently
    if (error.response?.data) {
      const errorMessage = error.response.data.error || 'An unexpected error occurred';
      console.error(`API Error (${statusCode}):`, errorMessage);
    } else {
      console.error('API Connection Error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default api; 