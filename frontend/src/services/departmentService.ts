import axios from "axios";

const API_URL = "http://localhost:5000/api/departments";

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

export const getDepartments = async () => {
    const res = await api.get("/");
    return res.data;
};

export const createDepartment = async (data: { name: string; description?: string }) => {
    const res = await api.post("/", data);
    return res.data;
};
