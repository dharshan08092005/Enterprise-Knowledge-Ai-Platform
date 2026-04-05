import apiClient from "./apiClient";

export interface DocumentResponse {
    _id: string;
    title: string;
    fileName: string;
    filePath: string;
    mimeType: string;
    size: number;
    status: "uploaded" | "processing" | "active" | "failed" | "deactivated" | "superseded";
    version?: number;
    supersededBy?: string;
    accessScope: "public" | "department" | "restricted" | "private" | "team" | "organization";
    ownerId: string;
    createdAt: string;
    updatedAt: string;
}

export const fetchDocuments = async (token?: string): Promise<DocumentResponse[]> => {
    const res = await apiClient.get("/documents", {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined
    });
    return res.data;
};

export const fetchDocumentById = async (token?: string, id?: string): Promise<DocumentResponse> => {
    const res = await apiClient.get(`/documents/${id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined
    });
    return res.data;
};

export const deleteDocument = async (token?: string, id?: string): Promise<void> => {
    await apiClient.delete(`/documents/${id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined
    });
};

export const uploadDocument = async (token?: string, formData?: FormData): Promise<{ documentId: string; jobId: string; status: string }> => {
    const res = await apiClient.post("/documents", formData, {
        headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            "Content-Type": "multipart/form-data"
        }
    });
    return res.data;
};

export const updateDocumentStatus = async (token?: string, id?: string, status?: string): Promise<void> => {
    await apiClient.patch(`/documents/${id}/status`, { status }, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined
    });
};

export const viewDocument = async (token?: string, id?: string): Promise<Blob> => {
    const res = await apiClient.get(`/documents/${id}/view`, {
        responseType: "blob",
        headers: token ? { Authorization: `Bearer ${token}` } : undefined
    });
    return res.data;
};
