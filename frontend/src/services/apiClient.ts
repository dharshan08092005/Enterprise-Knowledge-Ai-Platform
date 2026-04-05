import axios from "axios";

// This will use VITE_API_BASE_URL from .env file or Vercel environment variables
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true // Required for sending/receiving HTTP-Only cookies
});

// Automatically add token to headers if it exists in localStorage
apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem("accessToken") || localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default apiClient;
