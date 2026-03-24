import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:5000/api",
    withCredentials: true
});

const getAuthHeaders = () => {
    return {
        headers: { Authorization: `Bearer ${localStorage.getItem("accessToken") || localStorage.getItem("token")}` }
    };
};

export const getOrganizationDirectory = async () => {
    const response = await api.get("/users/directory", getAuthHeaders());
    return response.data;
};
