import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:5000/api",
    withCredentials: true
});

export interface AuditLogUser {
    _id: string;
    name: string;
    email: string;
}

export interface AuditLogEntry {
    _id: string;
    userId: AuditLogUser | null;
    action: string;
    resourceType: string;
    resourceId: string;
    metadata: Record<string, any>;
    createdAt: string;
    updatedAt: string;
}

export interface AuditLogsResponse {
    logs: AuditLogEntry[];
    total: number;
    page: number;
    totalPages: number;
}

export const fetchAuditLogs = async (
    token: string,
    params?: {
        limit?: number;
        page?: number;
        action?: string;
        resourceType?: string;
    }
): Promise<AuditLogsResponse> => {
    const res = await api.get("/admin/logs", {
        headers: {
            Authorization: `Bearer ${token}`
        },
        params
    });

    return res.data;
};

// ─── Settings Types ────────────────────────────────────────
export interface SystemSettings {
    _id: string;
    database: {
        mongoUri: string;
        mongoDbName: string;
    };
    llm: {
        provider: string;
        apiKey: string;
        model: string;
        baseUrl: string;
        maxTokens: number;
        temperature: number;
    };
    embedding: {
        provider: string;
        apiKey: string;
        model: string;
        baseUrl: string;
    };
    vectorDb: {
        provider: string;
        apiKey: string;
        host: string;
        indexName: string;
    };
    storage: {
        provider: string;
        bucket: string;
        region: string;
        accessKey: string;
        secretKey: string;
        endpoint: string;
    };
    security: {
        jwtSecret: string;
        jwtExpiresIn: string;
        refreshTokenExpiresIn: string;
        maxLoginAttempts: number;
        lockoutDuration: number;
    };
    email: {
        provider: string;
        host: string;
        port: number;
        user: string;
        password: string;
        from: string;
        apiKey: string;
    };
    general: {
        appName: string;
        appUrl: string;
        maxFileSize: number;
        allowedFileTypes: string[];
        maintenanceMode: boolean;
    };
    createdAt: string;
    updatedAt: string;
}

export const fetchSettings = async (token: string): Promise<SystemSettings> => {
    const res = await api.get("/admin/settings", {
        headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
};

export const updateSettings = async (
    token: string,
    settings: Partial<SystemSettings>
): Promise<{ message: string; settings: SystemSettings }> => {
    const res = await api.put("/admin/settings", settings, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
};

export const testServiceConnection = async (
    token: string,
    service: string
): Promise<{ success: boolean; message: string }> => {
    const res = await api.post(
        "/admin/settings/test-connection",
        { service },
        { headers: { Authorization: `Bearer ${token}` } }
    );
    return res.data;
};

// ─── User Management Types ────────────────────────────────
export interface AdminUser {
    _id: string;
    name: string;
    email: string;
    role: "USER" | "AUDITOR" | "ADMIN";
    isActive: boolean;
    createdAt: string;
}

export const fetchAllUsers = async (token: string): Promise<AdminUser[]> => {
    const res = await api.get("/admin/users/users", {
        headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
};

export const fetchAuditors = async (token: string): Promise<AdminUser[]> => {
    const res = await api.get("/admin/users/users/auditors", {
        headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
};
