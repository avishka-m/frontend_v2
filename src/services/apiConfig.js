import axios from "axios";

// API URLs from environment variables
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8002/api/v1";
const CHATBOT_API_URL =
  import.meta.env.VITE_CHATBOT_API_URL ||
  "http://localhost:8002/api/v1/chatbot";

// Create main API instance
export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Create chatbot API instance
export const chatbotApi = axios.create({
  baseURL: CHATBOT_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor for authentication
const addAuthInterceptor = (axiosInstance) => {
  axiosInstance.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Add response interceptor for handling errors
  axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("username");
        localStorage.removeItem("userRole");
        window.location.href = "/login";
      }

      // Handle chatbot-specific errors
      if (error.response?.data?.detail) {
        error.message = error.response.data.detail;
      } else if (!error.response) {
        error.message = "Network error. Please check your connection.";
      }

      return Promise.reject(error);
    }
  );
};

// Apply interceptors to both instances
addAuthInterceptor(api);
addAuthInterceptor(chatbotApi);

export default api;
