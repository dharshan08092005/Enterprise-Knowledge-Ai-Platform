import axios from "axios";

const API_URL = "http://localhost:5000/api/auth";

// Axios instance
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true // 🔴 REQUIRED for refresh token cookie
});

// Signup
export const signup = async (data: {
  name: string;
  email: string;
  password: string;
}) => {
  const res = await api.post("/signup", data);
  return res.data;
};

// Login
export const login = async (data: {
  email: string;
  password: string;
}) => {
  const res = await api.post("/login", data);
  return res.data;
};

// Get current user
export const getMe = async (token: string) => {
  const res = await api.get("/me", {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return res.data;
};
