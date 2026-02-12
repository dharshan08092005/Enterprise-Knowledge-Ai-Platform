import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
    IconSettings,
    IconDatabase,
    IconBrain,
    IconCloud,
    IconLock,
    IconMail,
    IconWorld,
    IconLoader2,
    IconAlertTriangle,
    IconCheck,
    IconRefresh,
    IconChevronDown,
    IconEye,
    IconEyeOff,
    IconPlugConnected,
    IconServer,
    IconVectorTriangle,
    IconDeviceFloppy,
    IconX,
} from "@tabler/icons-react";
import { getToken } from "@/lib/auth";
import {
    fetchSettings,
    updateSettings as updateSettingsApi,
    testServiceConnection,
    type SystemSettings,
} from "@/services/adminService";

// ─── Section Config ──────────────────────────────────────────────────────────
interface SectionConfig {
    key: string;
    label: string;
    description: string;
    icon: typeof IconDatabase;
    color: string;
    gradient: string;
}

const SECTIONS: SectionConfig[] = [
    {
        key: "database",
        label: "Database",
        description: "MongoDB connection and database settings",
        icon: IconDatabase,
        color: "emerald",
        gradient: "from-emerald-500/20 to-teal-500/10",
    },
    {
        key: "llm",
        label: "LLM Provider",
        description: "Large Language Model configuration",
        icon: IconBrain,
        color: "purple",
        gradient: "from-purple-500/20 to-pink-500/10",
    },
    {
        key: "embedding",
        label: "Embeddings",
        description: "Text embedding model configuration",
        icon: IconVectorTriangle,
        color: "blue",
        gradient: "from-blue-500/20 to-cyan-500/10",
    },
    {
        key: "vectorDb",
        label: "Vector Database",
        description: "Vector store for semantic search",
        icon: IconServer,
        color: "amber",
        gradient: "from-amber-500/20 to-orange-500/10",
    },
    {
        key: "storage",
        label: "File Storage",
        description: "Document storage provider settings",
        icon: IconCloud,
        color: "cyan",
        gradient: "from-cyan-500/20 to-blue-500/10",
    },
    {
        key: "security",
        label: "Security",
        description: "JWT, authentication and security policies",
        icon: IconLock,
        color: "red",
        gradient: "from-red-500/20 to-pink-500/10",
    },
    {
        key: "email",
        label: "Email / SMTP",
        description: "Email sending and notification settings",
        icon: IconMail,
        color: "pink",
        gradient: "from-pink-500/20 to-rose-500/10",
    },
    {
        key: "general",
        label: "General",
        description: "Application name, URL and file settings",
        icon: IconWorld,
        color: "gray",
        gradient: "from-gray-500/20 to-slate-500/10",
    },
];

// ─── Field Definitions per Section ───────────────────────────────────────────
interface FieldDef {
    key: string;
    label: string;
    type: "text" | "password" | "number" | "select" | "toggle" | "tags";
    placeholder?: string;
    options?: { label: string; value: string }[];
    sensitive?: boolean;
    helperText?: string;
    min?: number;
    max?: number;
    step?: number;
}

const SECTION_FIELDS: Record<string, FieldDef[]> = {
    database: [
        { key: "mongoUri", label: "MongoDB URI", type: "password", placeholder: "mongodb+srv://...", sensitive: true, helperText: "Full connection string including credentials" },
        { key: "mongoDbName", label: "Database Name", type: "text", placeholder: "enterprise_ai_db", helperText: "Overrides database in URI if specified" },
    ],
    llm: [
        {
            key: "provider", label: "Provider", type: "select", options: [
                { label: "OpenAI", value: "openai" },
                { label: "Anthropic (Claude)", value: "anthropic" },
                { label: "Google (Gemini)", value: "google" },
                { label: "Azure OpenAI", value: "azure" },
                { label: "Ollama (Local)", value: "ollama" },
                { label: "Custom", value: "custom" },
            ]
        },
        { key: "apiKey", label: "API Key", type: "password", placeholder: "sk-...", sensitive: true },
        { key: "model", label: "Model", type: "text", placeholder: "gpt-4", helperText: "Model identifier, e.g. gpt-4, claude-3-opus, gemini-pro" },
        { key: "baseUrl", label: "Base URL (Optional)", type: "text", placeholder: "https://api.openai.com/v1", helperText: "Custom API base URL for self-hosted or proxy" },
        { key: "maxTokens", label: "Max Tokens", type: "number", placeholder: "4096", min: 256, max: 128000, step: 256 },
        { key: "temperature", label: "Temperature", type: "number", placeholder: "0.7", min: 0, max: 2, step: 0.1 },
    ],
    embedding: [
        {
            key: "provider", label: "Provider", type: "select", options: [
                { label: "OpenAI", value: "openai" },
                { label: "Cohere", value: "cohere" },
                { label: "HuggingFace", value: "huggingface" },
                { label: "Custom", value: "custom" },
            ]
        },
        { key: "apiKey", label: "API Key", type: "password", placeholder: "sk-...", sensitive: true },
        { key: "model", label: "Model", type: "text", placeholder: "text-embedding-3-small" },
        { key: "baseUrl", label: "Base URL (Optional)", type: "text", placeholder: "https://api.openai.com/v1" },
    ],
    vectorDb: [
        {
            key: "provider", label: "Provider", type: "select", options: [
                { label: "None", value: "none" },
                { label: "Pinecone", value: "pinecone" },
                { label: "Qdrant", value: "qdrant" },
                { label: "Weaviate", value: "weaviate" },
                { label: "Chroma", value: "chroma" },
                { label: "Milvus", value: "milvus" },
            ]
        },
        { key: "apiKey", label: "API Key", type: "password", placeholder: "Enter API key", sensitive: true },
        { key: "host", label: "Host / Endpoint", type: "text", placeholder: "https://xxx.pinecone.io" },
        { key: "indexName", label: "Index / Collection Name", type: "text", placeholder: "enterprise-docs" },
    ],
    storage: [
        {
            key: "provider", label: "Provider", type: "select", options: [
                { label: "Local Storage", value: "local" },
                { label: "AWS S3", value: "s3" },
                { label: "Google Cloud Storage", value: "gcs" },
                { label: "Azure Blob", value: "azure-blob" },
                { label: "Supabase", value: "supabase" },
            ]
        },
        { key: "bucket", label: "Bucket Name", type: "text", placeholder: "my-bucket" },
        { key: "region", label: "Region", type: "text", placeholder: "us-east-1" },
        { key: "accessKey", label: "Access Key", type: "password", placeholder: "AKIA...", sensitive: true },
        { key: "secretKey", label: "Secret Key", type: "password", placeholder: "Enter secret key", sensitive: true },
        { key: "endpoint", label: "Endpoint (Optional)", type: "text", placeholder: "https://..." },
    ],
    security: [
        { key: "jwtSecret", label: "JWT Secret", type: "password", placeholder: "Enter JWT secret", sensitive: true },
        { key: "jwtExpiresIn", label: "JWT Expiry", type: "text", placeholder: "7d", helperText: "e.g. 1h, 7d, 30d" },
        { key: "refreshTokenExpiresIn", label: "Refresh Token Expiry", type: "text", placeholder: "30d" },
        { key: "maxLoginAttempts", label: "Max Login Attempts", type: "number", placeholder: "5", min: 1, max: 20 },
        { key: "lockoutDuration", label: "Lockout Duration (min)", type: "number", placeholder: "15", min: 1, max: 1440 },
    ],
    email: [
        {
            key: "provider", label: "Provider", type: "select", options: [
                { label: "None", value: "none" },
                { label: "SMTP", value: "smtp" },
                { label: "SendGrid", value: "sendgrid" },
                { label: "AWS SES", value: "ses" },
                { label: "Mailgun", value: "mailgun" },
            ]
        },
        { key: "host", label: "SMTP Host", type: "text", placeholder: "smtp.gmail.com" },
        { key: "port", label: "Port", type: "number", placeholder: "587", min: 1, max: 65535 },
        { key: "user", label: "Username", type: "text", placeholder: "user@example.com" },
        { key: "password", label: "Password", type: "password", placeholder: "Enter password", sensitive: true },
        { key: "from", label: "From Address", type: "text", placeholder: "noreply@enterprise.ai" },
        { key: "apiKey", label: "API Key (SendGrid/Mailgun)", type: "password", placeholder: "SG...", sensitive: true },
    ],
    general: [
        { key: "appName", label: "Application Name", type: "text", placeholder: "Enterprise AI" },
        { key: "appUrl", label: "Application URL", type: "text", placeholder: "https://your-domain.com" },
        { key: "maxFileSize", label: "Max File Size (MB)", type: "number", placeholder: "50", min: 1, max: 500 },
        { key: "maintenanceMode", label: "Maintenance Mode", type: "toggle", helperText: "When enabled, only admins can access the platform" },
    ],
};

// ─── Password Field with Toggle ──────────────────────────────────────────────
const PasswordField = ({
    value,
    onChange,
    placeholder,
}: {
    value: string;
    onChange: (val: string) => void;
    placeholder?: string;
}) => {
    const [visible, setVisible] = useState(false);
    const isMasked = value?.startsWith("••••");

    return (
        <div className="relative">
            <input
                type={visible && !isMasked ? "text" : "password"}
                value={value || ""}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full px-4 py-2.5 pr-10 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 transition-colors font-mono"
            />
            <button
                type="button"
                onClick={() => setVisible(!visible)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
            >
                {visible ? <IconEyeOff className="w-4 h-4" /> : <IconEye className="w-4 h-4" />}
            </button>
        </div>
    );
};

// ─── Settings Section Component ──────────────────────────────────────────────
const SettingsSection = ({
    section,
    data,
    onChange,
    onTestConnection,
    isTesting,
    testResult,
}: {
    section: SectionConfig;
    data: Record<string, any>;
    onChange: (key: string, value: any) => void;
    onTestConnection: () => void;
    isTesting: boolean;
    testResult: { success: boolean; message: string } | null;
}) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const fields = SECTION_FIELDS[section.key] || [];
    const Icon = section.icon;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl bg-white/[0.03] border border-white/10 overflow-hidden"
        >
            {/* Section Header */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full p-5 flex items-center justify-between hover:bg-white/[0.02] transition-colors"
            >
                <div className="flex items-center gap-4">
                    <div className={`p-2.5 rounded-xl bg-gradient-to-br ${section.gradient} border border-white/10`}>
                        <Icon className={`w-5 h-5 text-${section.color}-400`} />
                    </div>
                    <div className="text-left">
                        <h3 className="text-sm font-semibold text-white">{section.label}</h3>
                        <p className="text-xs text-gray-500 mt-0.5">{section.description}</p>
                    </div>
                </div>
                <motion.div
                    animate={{ rotate: isExpanded ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                >
                    <IconChevronDown className="w-5 h-5 text-gray-400" />
                </motion.div>
            </button>

            {/* Expanded Content */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                    >
                        <div className="px-5 pb-5 space-y-4 border-t border-white/5 pt-4">
                            {fields.map((field) => (
                                <div key={field.key}>
                                    <label className="flex items-center justify-between mb-1.5">
                                        <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">{field.label}</span>
                                        {field.sensitive && (
                                            <span className="text-xs text-amber-400/60 flex items-center gap-1">
                                                <IconLock className="w-3 h-3" />
                                                Encrypted
                                            </span>
                                        )}
                                    </label>

                                    {field.type === "password" && (
                                        <PasswordField
                                            value={data[field.key] || ""}
                                            onChange={(val) => onChange(field.key, val)}
                                            placeholder={field.placeholder}
                                        />
                                    )}

                                    {field.type === "text" && (
                                        <input
                                            type="text"
                                            value={data[field.key] || ""}
                                            onChange={(e) => onChange(field.key, e.target.value)}
                                            placeholder={field.placeholder}
                                            className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 transition-colors"
                                        />
                                    )}

                                    {field.type === "number" && (
                                        <input
                                            type="number"
                                            value={data[field.key] ?? ""}
                                            onChange={(e) => onChange(field.key, Number(e.target.value))}
                                            placeholder={field.placeholder}
                                            min={field.min}
                                            max={field.max}
                                            step={field.step}
                                            className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 transition-colors"
                                        />
                                    )}

                                    {field.type === "select" && (
                                        <div className="relative">
                                            <select
                                                value={data[field.key] || ""}
                                                onChange={(e) => onChange(field.key, e.target.value)}
                                                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white appearance-none focus:outline-none focus:border-purple-500/50 transition-colors"
                                            >
                                                {field.options?.map((opt) => (
                                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                                ))}
                                            </select>
                                            <IconChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                        </div>
                                    )}

                                    {field.type === "toggle" && (
                                        <button
                                            onClick={() => onChange(field.key, !data[field.key])}
                                            className={`relative w-12 h-6 rounded-full transition-colors ${data[field.key] ? "bg-purple-500" : "bg-white/10"
                                                }`}
                                        >
                                            <motion.div
                                                className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-lg"
                                                animate={{ left: data[field.key] ? "26px" : "2px" }}
                                                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                            />
                                        </button>
                                    )}

                                    {field.helperText && (
                                        <p className="text-xs text-gray-500 mt-1">{field.helperText}</p>
                                    )}
                                </div>
                            ))}

                            {/* Test Connection Button */}
                            {["database", "llm", "embedding", "vectorDb", "storage", "email"].includes(section.key) && (
                                <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={onTestConnection}
                                        disabled={isTesting}
                                        className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-gray-300 hover:bg-white/10 transition-colors disabled:opacity-50"
                                    >
                                        {isTesting ? (
                                            <IconLoader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <IconPlugConnected className="w-4 h-4" />
                                        )}
                                        Test Connection
                                    </motion.button>

                                    {testResult && (
                                        <motion.span
                                            initial={{ opacity: 0, x: 10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className={`flex items-center gap-1.5 text-xs font-medium ${testResult.success ? "text-emerald-400" : "text-red-400"
                                                }`}
                                        >
                                            {testResult.success ? (
                                                <IconCheck className="w-3.5 h-3.5" />
                                            ) : (
                                                <IconX className="w-3.5 h-3.5" />
                                            )}
                                            {testResult.message}
                                        </motion.span>
                                    )}
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

// ─── Main Settings Page ──────────────────────────────────────────────────────
export default function AdminSettingsPage() {
    const [settings, setSettings] = useState<SystemSettings | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [saveMessage, setSaveMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
    const [testResults, setTestResults] = useState<Record<string, { success: boolean; message: string } | null>>({});
    const [testingService, setTestingService] = useState<string | null>(null);
    const [hasChanges, setHasChanges] = useState(false);

    // Load settings
    const loadSettings = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const token = getToken();
            if (!token) {
                setError("Authentication required");
                return;
            }
            const data = await fetchSettings(token);
            setSettings(data);
        } catch (err: any) {
            console.error("Failed to fetch settings:", err);
            setError(err.response?.data?.message || err.message || "Failed to load settings");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadSettings();
    }, []);

    // Handle field change
    const handleFieldChange = (section: string, key: string, value: any) => {
        if (!settings) return;
        setSettings({
            ...settings,
            [section]: {
                ...(settings as any)[section],
                [key]: value,
            },
        });
        setHasChanges(true);
        setSaveMessage(null);
    };

    // Save settings
    const handleSave = async () => {
        if (!settings) return;
        try {
            setIsSaving(true);
            setSaveMessage(null);
            const token = getToken();
            if (!token) return;

            // Send only the section data (not _id, timestamps, etc.)
            const payload: any = {};
            for (const section of SECTIONS) {
                payload[section.key] = (settings as any)[section.key];
            }

            const result = await updateSettingsApi(token, payload);
            setSettings(result.settings);
            setHasChanges(false);
            setSaveMessage({ type: "success", text: "Settings saved successfully!" });

            // Clear success message after 4 seconds
            setTimeout(() => setSaveMessage(null), 4000);
        } catch (err: any) {
            setSaveMessage({ type: "error", text: err.response?.data?.message || "Failed to save settings" });
        } finally {
            setIsSaving(false);
        }
    };

    // Test connection
    const handleTestConnection = async (service: string) => {
        try {
            setTestingService(service);
            setTestResults((prev) => ({ ...prev, [service]: null }));
            const token = getToken();
            if (!token) return;

            const result = await testServiceConnection(token, service);
            setTestResults((prev) => ({ ...prev, [service]: result }));
        } catch (err: any) {
            setTestResults((prev) => ({
                ...prev,
                [service]: { success: false, message: err.message || "Connection test failed" },
            }));
        } finally {
            setTestingService(null);
        }
    };

    return (
        <div className="space-y-6 max-w-4xl">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
                <div className="flex items-center gap-4">
                    <div className="p-3 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/10 border border-white/10">
                        <IconSettings className="w-7 h-7 text-purple-400" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white">Platform Settings</h1>
                        <p className="text-gray-400 mt-0.5">Configure integrations, security and application behavior</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={loadSettings}
                        disabled={isLoading}
                        className="flex items-center gap-2 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-gray-300 hover:bg-white/10 transition-colors disabled:opacity-50"
                    >
                        <IconRefresh className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
                        Reload
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleSave}
                        disabled={isSaving || !hasChanges}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${hasChanges
                            ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/25"
                            : "bg-white/5 text-gray-500 border border-white/10 cursor-not-allowed"
                            }`}
                    >
                        {isSaving ? (
                            <>
                                <IconLoader2 className="w-4 h-4 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <IconDeviceFloppy className="w-4 h-4" />
                                Save Changes
                            </>
                        )}
                    </motion.button>
                </div>
            </motion.div>

            {/* Save Message */}
            <AnimatePresence>
                {saveMessage && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, height: 0 }}
                        animate={{ opacity: 1, y: 0, height: "auto" }}
                        exit={{ opacity: 0, y: -10, height: 0 }}
                        className={`p-4 rounded-xl border flex items-center gap-3 ${saveMessage.type === "success"
                            ? "bg-emerald-500/10 border-emerald-500/20"
                            : "bg-red-500/10 border-red-500/20"
                            }`}
                    >
                        {saveMessage.type === "success" ? (
                            <IconCheck className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                        ) : (
                            <IconAlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
                        )}
                        <span className={`text-sm font-medium ${saveMessage.type === "success" ? "text-emerald-400" : "text-red-400"}`}>
                            {saveMessage.text}
                        </span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Unsaved changes indicator */}
            <AnimatePresence>
                {hasChanges && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-2"
                    >
                        <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                        <span className="text-sm text-amber-400">You have unsaved changes</span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Loading State */}
            {isLoading && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center py-20"
                >
                    <IconLoader2 className="w-12 h-12 text-purple-400 animate-spin mb-4" />
                    <p className="text-gray-400">Loading settings...</p>
                </motion.div>
            )}

            {/* Error State */}
            {error && !isLoading && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-6 rounded-2xl bg-red-500/10 border border-red-500/20"
                >
                    <div className="flex items-center gap-3">
                        <IconAlertTriangle className="w-6 h-6 text-red-400" />
                        <div>
                            <p className="text-red-400 font-medium">Failed to load settings</p>
                            <p className="text-sm text-gray-400 mt-1">{error}</p>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Settings Sections */}
            {!isLoading && !error && settings && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="space-y-4"
                >
                    {SECTIONS.map((section, index) => (
                        <motion.div
                            key={section.key}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.05 * index }}
                        >
                            <SettingsSection
                                section={section}
                                data={(settings as any)[section.key] || {}}
                                onChange={(key, value) => handleFieldChange(section.key, key, value)}
                                onTestConnection={() => handleTestConnection(section.key)}
                                isTesting={testingService === section.key}
                                testResult={testResults[section.key] || null}
                            />
                        </motion.div>
                    ))}
                </motion.div>
            )}

            {/* Bottom spacer for scroll */}
            <div className="h-8" />
        </div>
    );
}
