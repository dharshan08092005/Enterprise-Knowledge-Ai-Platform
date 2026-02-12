import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:5000/api",
    withCredentials: true
});

export interface DocumentResponse {
    _id: string;
    title: string;
    fileName: string;
    filePath: string;
    mimeType: string;
    size: number;
    status: "uploaded" | "processing" | "active";
    accessScope: "public" | "department" | "restricted";
    ownerId: string;
    createdAt: string;
    updatedAt: string;
}

export const fetchDocuments = async (token: string): Promise<DocumentResponse[]> => {
    const res = await api.get("/documents", {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    return res.data;
};

export const fetchDocumentById = async (token: string, id: string): Promise<DocumentResponse> => {
    const res = await api.get(`/documents/${id}`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    return res.data;
};

export const deleteDocument = async (token: string, id: string): Promise<void> => {
    await api.delete(`/documents/${id}`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
};

export const uploadDocument = async (token: string, formData: FormData): Promise<{ documentId: string; jobId: string; status: string }> => {
    const res = await api.post("/documents", formData, {
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data"
        }
    });
    return res.data;
};
