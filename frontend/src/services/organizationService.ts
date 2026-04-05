import apiClient from "./apiClient";

export const getOrganizations = async () => {
    const res = await apiClient.get("/organizations");
    return res.data;
};

export const updateOrganization = async (id: string, data: any) => {
    const res = await apiClient.patch(`/organizations/${id}`, data);
    return res.data;
};

export const getMyOrganization = async () => {
    const res = await apiClient.get("/organizations/my-org");
    return res.data;
};

export const updateMyOrgSettings = async (data: any) => {
    const res = await apiClient.patch("/organizations/my-org/settings", data);
    return res.data;
};

export const testAiConfig = async (data: any) => {
    const res = await apiClient.post("/organizations/test-ai-config", data);
    return res.data;
};
