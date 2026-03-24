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

export const createChannel = async (data: any) => {
    const response = await api.post("/channels", data, getAuthHeaders());
    return response.data;
};

export const getMyChannels = async () => {
    const response = await api.get("/channels", getAuthHeaders());
    return response.data;
};

export const getChannelMessages = async (channelId: string) => {
    const response = await api.get(`/channels/${channelId}/messages`, getAuthHeaders());
    return response.data;
};
