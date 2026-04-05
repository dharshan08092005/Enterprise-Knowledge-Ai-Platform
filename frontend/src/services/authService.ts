import apiClient from "./apiClient";

// Signup
export const signup = async (data: {
  name: string;
  email: string;
  password: string;
  organizationName?: string;
  organizationSlug?: string;
}) => {
  const res = await apiClient.post("/auth/signup", data);
  return res.data;
};

// Login
export const login = async (data: {
  email: string;
  password: string;
}) => {
  const res = await apiClient.post("/auth/login", data);
  return res.data;
};

// Get current user
export const getMe = async (token: string) => {
  const res = await apiClient.get("/auth/me", {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return res.data;
};
