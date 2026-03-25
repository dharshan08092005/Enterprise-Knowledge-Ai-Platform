import axios from "axios";

const API_URL = "http://localhost:5000/api/users";

const api = axios.create({
    baseURL: API_URL,
    withCredentials: true
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const getMe = async () => {
    const res = await api.get("/me");
    return res.data;
};

export const updateMe = async (data: any) => {
    const res = await api.patch("/me", data);
    return res.data;
};

export const getOrganizationDirectory = async () => {
    const res = await api.get("/directory");
    return res.data;
};
