import axios from "axios";

const API_URL = "http://localhost:5000/api";

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
    const res = await api.get("/organizations");
    return res.data;
};

export const updateOrganization = async (id: string, data: any) => {
    const res = await api.patch(`/organizations/${id}`, data);
    return res.data;
};

export const getMyOrganization = async () => {
    const res = await api.get("/organizations/my-org");
    return res.data;
};

export const updateMyOrgSettings = async (data: any) => {
    const res = await api.patch("/organizations/my-org/settings", data);
    return res.data;
};

export const testAiConfig = async (data: any) => {
    const res = await api.post("/organizations/test-ai-config", data);
    return res.data;
};
