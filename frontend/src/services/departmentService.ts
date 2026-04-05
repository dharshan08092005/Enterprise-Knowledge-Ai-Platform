import apiClient from "./apiClient";

export const getDepartments = async () => {
    const res = await apiClient.get("/departments");
    return res.data;
};

export const createDepartment = async (data: { name: string; description?: string }) => {
    const res = await apiClient.post("/departments", data);
    return res.data;
};
