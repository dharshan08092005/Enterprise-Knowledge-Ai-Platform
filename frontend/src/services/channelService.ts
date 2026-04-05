import apiClient from "./apiClient";

const getAuthHeaders = () => {
    return {
        headers: { Authorization: `Bearer ${localStorage.getItem("accessToken") || localStorage.getItem("token")}` }
    };
};

export const createChannel = async (data: any) => {
    const response = await apiClient.post("/channels", data, getAuthHeaders());
    return response.data;
};

export const getMyChannels = async () => {
    const response = await apiClient.get("/channels", getAuthHeaders());
    return response.data;
};

export const getChannelMessages = async (channelId: string) => {
    const response = await apiClient.get(`/channels/${channelId}/messages`, getAuthHeaders());
    return response.data;
};
