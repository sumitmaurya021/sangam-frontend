import axios from 'axios';

// Create a configured axios instance
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  withCredentials: true // For devise sessions and cookies
});

// Add a request interceptor for adding tokens if necessary (e.g. CSRF tokens or Bearer tokens)
apiClient.interceptors.request.use(
  (config) => {
    // You can read token from localStorage here if using token-based auth
    // const token = localStorage.getItem('token');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor for handling global errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized, etc.
    if (error.response && error.response.status === 401) {
      // e.g. redirect to login or clear user state
    }
    return Promise.reject(error);
  }
);

export default apiClient;
