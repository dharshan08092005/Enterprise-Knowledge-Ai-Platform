import apiClient from "./apiClient";

export const getMe = async () => {
    const res = await apiClient.get("/users/me");
    return res.data;
};

export const updateMe = async (data: any) => {
    const res = await apiClient.patch("/users/me", data);
    return res.data;
};

export const getOrganizationDirectory = async () => {
    const res = await apiClient.get("/users/directory");
    return res.data;
};
