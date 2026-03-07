import axios from "axios";

const API_URL = "http://localhost:5000/api/organizations";

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

export const getOrganizations = async () => {
    const res = await api.get("/");
    return res.data;
};

export const updateOrganization = async (id: string, data: any) => {
    const res = await api.patch(`/${id}`, data);
    return res.data;
};
