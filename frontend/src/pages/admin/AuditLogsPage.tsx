import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
    IconSearch,
    IconFilter,
    IconRefresh,
    IconLoader2,
    IconAlertTriangle,
    IconChevronDown,
    IconDownload,
    IconFileAnalytics,
    IconUser,
    IconLogin,
    IconLogout,
    IconUpload,
    IconShieldCheck,
    IconX,
    IconClock,
    IconArrowRight,
    IconChevronLeft,
    IconChevronRight,
    IconActivity,
    IconBriefcase,
    IconAlertCircle,
    IconCircleCheck,
    IconPlayerPlay,
    IconRotateClockwise,
    IconSkull,
} from "@tabler/icons-react";
import { getToken } from "@/lib/auth";
import { fetchAuditLogs, type AuditLogEntry } from "@/services/adminService";

// ─── Action Configuration ────────────────────────────────────────────────────
interface ActionConfig {
    label: string;
    icon: typeof IconUser;
    color: string;
    bgColor: string;
    borderColor: string;
}

const ACTION_CONFIG: Record<string, ActionConfig> = {
    USER_SIGNUP: {
        label: "User Signup",
        icon: IconUser,
        color: "text-emerald-400",
        bgColor: "bg-emerald-500/15",
        borderColor: "border-emerald-500/30",
    },
    USER_LOGIN: {
        label: "User Login",
        icon: IconLogin,
        color: "text-blue-400",
        bgColor: "bg-blue-500/15",
        borderColor: "border-blue-500/30",
    },
    LOGIN_FAILED: {
        label: "Login Failed",
        icon: IconAlertCircle,
        color: "text-red-400",
        bgColor: "bg-red-500/15",
        borderColor: "border-red-500/30",
    },
    AUTH_LOGIN_FAILED: {
        label: "Auth Failed",
        icon: IconAlertTriangle,
        color: "text-red-400",
        bgColor: "bg-red-500/15",
        borderColor: "border-red-500/30",
    },
    USER_LOGOUT: {
        label: "User Logout",
        icon: IconLogout,
        color: "text-gray-400",
        bgColor: "bg-gray-500/15",
        borderColor: "border-gray-500/30",
    },
    DOCUMENT_UPLOAD_QUEUED: {
        label: "Doc Uploaded",
        icon: IconUpload,
        color: "text-purple-400",
        bgColor: "bg-purple-500/15",
        borderColor: "border-purple-500/30",
    },
    JOB_CREATED: {
        label: "Job Created",
        icon: IconBriefcase,
        color: "text-cyan-400",
        bgColor: "bg-cyan-500/15",
        borderColor: "border-cyan-500/30",
    },
    JOB_STARTED: {
        label: "Job Started",
        icon: IconPlayerPlay,
        color: "text-amber-400",
        bgColor: "bg-amber-500/15",
        borderColor: "border-amber-500/30",
    },
    JOB_COMPLETED: {
        label: "Job Completed",
        icon: IconCircleCheck,
        color: "text-emerald-400",
        bgColor: "bg-emerald-500/15",
        borderColor: "border-emerald-500/30",
    },
    JOB_FAILED: {
        label: "Job Failed",
        icon: IconSkull,
        color: "text-red-400",
        bgColor: "bg-red-500/15",
        borderColor: "border-red-500/30",
    },
    JOB_RETRY_SCHEDULED: {
        label: "Job Retry",
        icon: IconRotateClockwise,
        color: "text-orange-400",
        bgColor: "bg-orange-500/15",
        borderColor: "border-orange-500/30",
    },
};

const DEFAULT_ACTION_CONFIG: ActionConfig = {
    label: "Unknown",
    icon: IconActivity,
    color: "text-gray-400",
    bgColor: "bg-gray-500/15",
    borderColor: "border-gray-500/30",
};

const getActionConfig = (action: string): ActionConfig => {
    return ACTION_CONFIG[action] || { ...DEFAULT_ACTION_CONFIG, label: action };
};

// ─── Resource Type Badge ─────────────────────────────────────────────────────
const RESOURCE_COLORS: Record<string, { color: string; bg: string; border: string }> = {
    auth: { color: "text-blue-400", bg: "bg-blue-500/15", border: "border-blue-500/30" },
    document: { color: "text-purple-400", bg: "bg-purple-500/15", border: "border-purple-500/30" },
    job: { color: "text-amber-400", bg: "bg-amber-500/15", border: "border-amber-500/30" },
};

const ResourceTypeBadge = ({ type }: { type: string }) => {
    const config = RESOURCE_COLORS[type] || { color: "text-gray-400", bg: "bg-gray-500/15", border: "border-gray-500/30" };
    return (
        <span className={`px-2 py-0.5 text-xs font-medium rounded-md border ${config.color} ${config.bg} ${config.border}`}>
            {type || "—"}
        </span>
    );
};

// ─── Time Formatting ─────────────────────────────────────────────────────────
const formatRelativeTime = (date: string): string => {
    const now = new Date();
    const d = new Date(date);
    const diff = now.getTime() - d.getTime();

    if (diff < 1000 * 60) return "Just now";
    if (diff < 1000 * 60 * 60) return `${Math.floor(diff / (1000 * 60))}m ago`;
    if (diff < 1000 * 60 * 60 * 24) return `${Math.floor(diff / (1000 * 60 * 60))}h ago`;
    if (diff < 1000 * 60 * 60 * 24 * 7) return `${Math.floor(diff / (1000 * 60 * 60 * 24))}d ago`;
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

const formatFullDateTime = (date: string): string => {
    return new Date(date).toLocaleString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    });
};


// ─── Detail Modal Component ──────────────────────────────────────────────────
const DetailModal = ({
    log,
    onClose,
}: {
    log: AuditLogEntry;
    onClose: () => void;
}) => {
    const config = getActionConfig(log.action);
    const Icon = config.icon;

    return (
        <>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg z-50"
            >
                <div className="bg-[#1a1a2e] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
                    {/* Header */}
                    <div className="p-6 border-b border-white/10">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className={`p-2.5 rounded-xl ${config.bgColor} border ${config.borderColor}`}>
                                    <Icon className={`w-5 h-5 ${config.color}`} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-white">{config.label}</h3>
                                    <p className="text-xs text-gray-500 mt-0.5">{formatFullDateTime(log.createdAt)}</p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                            >
                                <IconX className="w-5 h-5 text-gray-400" />
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 space-y-4">
                        {/* Action & Resource */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1.5">Action</p>
                                <code className="text-sm text-white bg-white/5 px-2 py-1 rounded-md font-mono">{log.action}</code>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1.5">Resource Type</p>
                                <ResourceTypeBadge type={log.resourceType} />
                            </div>
                        </div>

                        {/* User */}
                        <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1.5">User</p>
                            {log.userId ? (
                                <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-xs font-semibold text-white flex-shrink-0">
                                        {log.userId.name?.charAt(0) || "?"}
                                    </div>
                                    <div>
                                        <p className="text-sm text-white font-medium">{log.userId.name}</p>
                                        <p className="text-xs text-gray-500">{log.userId.email}</p>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-sm text-gray-500 italic">System / Anonymous</p>
                            )}
                        </div>

                        {/* Resource ID */}
                        {log.resourceId && (
                            <div>
                                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1.5">Resource ID</p>
                                <code className="text-xs text-gray-300 bg-white/5 px-2 py-1 rounded-md font-mono break-all">{log.resourceId}</code>
                            </div>
                        )}

                        {/* Metadata */}
                        {log.metadata && Object.keys(log.metadata).length > 0 && (
                            <div>
                                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1.5">Metadata</p>
                                <div className="bg-black/30 rounded-xl border border-white/5 p-4 overflow-auto max-h-48">
                                    <pre className="text-xs text-gray-300 font-mono whitespace-pre-wrap">{JSON.stringify(log.metadata, null, 2)}</pre>
                                </div>
                            </div>
                        )}

                        {/* Timestamps */}
                        <div className="pt-2 border-t border-white/5">
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                <IconClock className="w-3.5 h-3.5" />
                                <span>Log ID: {log._id}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </>
    );
};

// ─── Log Row Component ───────────────────────────────────────────────────────
const LogRow = ({
    log,
    onView,
}: {
    log: AuditLogEntry;
    onView: () => void;
}) => {
    const config = getActionConfig(log.action);
    const Icon = config.icon;

    return (
        <motion.tr
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            whileHover={{ backgroundColor: "rgba(255,255,255,0.02)" }}
            className="border-b border-white/5 group cursor-pointer"
            onClick={onView}
        >
            {/* Timeline dot + Action */}
            <td className="py-4 px-4">
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl ${config.bgColor} border ${config.borderColor} flex-shrink-0`}>
                        <Icon className={`w-4 h-4 ${config.color}`} />
                    </div>
                    <div className="min-w-0">
                        <p className="text-sm font-medium text-white">{config.label}</p>
                        <p className="text-xs text-gray-500 font-mono truncate">{log.action}</p>
                    </div>
                </div>
            </td>

            {/* User */}
            <td className="py-4 px-4">
                {log.userId ? (
                    <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-500/80 to-pink-500/80 flex items-center justify-center text-xs font-semibold text-white flex-shrink-0">
                            {log.userId.name?.charAt(0) || "?"}
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm text-white truncate">{log.userId.name}</p>
                            <p className="text-xs text-gray-500 truncate">{log.userId.email}</p>
                        </div>
                    </div>
                ) : (
                    <span className="text-sm text-gray-500 italic">System</span>
                )}
            </td>

            {/* Resource Type */}
            <td className="py-4 px-4">
                <ResourceTypeBadge type={log.resourceType} />
            </td>

            {/* Timestamp */}
            <td className="py-4 px-4">
                <div className="flex items-center gap-1.5 text-sm text-gray-400">
                    <IconClock className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{formatRelativeTime(log.createdAt)}</span>
                </div>
            </td>

            {/* View Arrow */}
            <td className="py-4 px-4">
                <motion.div
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    whileHover={{ x: 3 }}
                >
                    <IconArrowRight className="w-4 h-4 text-gray-400" />
                </motion.div>
            </td>
        </motion.tr>
    );
};

// ─── Main Page Component ─────────────────────────────────────────────────────
export default function AuditLogsPage() {
    const [logs, setLogs] = useState<AuditLogEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState("");
    const [actionFilter, setActionFilter] = useState("all");
    const [resourceFilter, setResourceFilter] = useState("all");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalLogs, setTotalLogs] = useState(0);
    const [selectedLog, setSelectedLog] = useState<AuditLogEntry | null>(null);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const ITEMS_PER_PAGE = 20;

    // Fetch logs
    const loadLogs = async (page = 1, showLoading = true) => {
        try {
            if (showLoading) setIsLoading(true);
            else setIsRefreshing(true);
            setError(null);

            const token = getToken();
            if (!token) {
                setError("Authentication required");
                return;
            }

            const data = await fetchAuditLogs(token, {
                page,
                limit: ITEMS_PER_PAGE,
                action: actionFilter !== "all" ? actionFilter : undefined,
                resourceType: resourceFilter !== "all" ? resourceFilter : undefined,
            });

            setLogs(data.logs);
            setTotalPages(data.totalPages);
            setTotalLogs(data.total);
            setCurrentPage(data.page);
        } catch (err: any) {
            console.error("Failed to fetch audit logs:", err);
            setError(err.response?.data?.message || err.message || "Failed to load audit logs");
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        setCurrentPage(1);
        loadLogs(1);
    }, [actionFilter, resourceFilter]);

    // Client-side search filter on already loaded logs
    const filteredLogs = logs.filter((log) => {
        if (!search) return true;
        const q = search.toLowerCase();
        return (
            log.action.toLowerCase().includes(q) ||
            log.resourceType?.toLowerCase().includes(q) ||
            log.userId?.name?.toLowerCase().includes(q) ||
            log.userId?.email?.toLowerCase().includes(q) ||
            log._id.toLowerCase().includes(q) ||
            JSON.stringify(log.metadata || {}).toLowerCase().includes(q)
        );
    });

    // Stats
    const stats = {
        total: totalLogs,
        authEvents: logs.filter((l) => l.resourceType === "auth").length,
        jobEvents: logs.filter((l) => l.resourceType === "job").length,
        docEvents: logs.filter((l) => l.resourceType === "document").length,
    };

    const handlePageChange = (page: number) => {
        if (page < 1 || page > totalPages) return;
        loadLogs(page);
    };

    const handleRefresh = () => {
        loadLogs(currentPage, false);
    };

    // Generate page numbers for pagination
    const getPageNumbers = () => {
        const pages: (number | string)[] = [];
        if (totalPages <= 7) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            pages.push(1);
            if (currentPage > 3) pages.push("...");
            for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
                pages.push(i);
            }
            if (currentPage < totalPages - 2) pages.push("...");
            pages.push(totalPages);
        }
        return pages;
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
                <div>
                    <h1 className="text-2xl font-bold text-white">Audit Logs</h1>
                    <p className="text-gray-400 mt-1">Monitor system activity and security events</p>
                </div>

                <div className="flex items-center gap-3">
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-gray-300 hover:bg-white/10 transition-colors"
                    >
                        <IconDownload className="w-4 h-4" />
                        Export
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleRefresh}
                        disabled={isRefreshing}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl text-sm font-medium text-white shadow-lg shadow-purple-500/25 disabled:opacity-50"
                    >
                        <IconRefresh className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
                        Refresh
                    </motion.button>
                </div>
            </motion.div>

            {/* Stats Cards */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="grid grid-cols-2 md:grid-cols-4 gap-4"
            >
                {[
                    { label: "Total Events", value: stats.total, icon: IconFileAnalytics, color: "purple", gradient: "from-purple-500/20 to-pink-500/10" },
                    { label: "Auth Events", value: stats.authEvents, icon: IconShieldCheck, color: "blue", gradient: "from-blue-500/20 to-cyan-500/10" },
                    { label: "Job Events", value: stats.jobEvents, icon: IconBriefcase, color: "amber", gradient: "from-amber-500/20 to-orange-500/10" },
                    { label: "Doc Events", value: stats.docEvents, icon: IconUpload, color: "emerald", gradient: "from-emerald-500/20 to-teal-500/10" },
                ].map((stat, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 + index * 0.05 }}
                        className={`p-4 rounded-xl bg-gradient-to-br ${stat.gradient} border border-white/10 relative overflow-hidden`}
                    >
                        <div className="absolute top-3 right-3 opacity-20">
                            <stat.icon className={`w-10 h-10 text-${stat.color}-400`} />
                        </div>
                        <div className="relative z-10">
                            <p className="text-sm text-gray-400">{stat.label}</p>
                            <p className={`text-2xl font-bold text-white mt-1`}>{stat.value}</p>
                        </div>
                    </motion.div>
                ))}
            </motion.div>

            {/* Filters */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex flex-col md:flex-row gap-4"
            >
                {/* Search */}
                <div className="relative flex-1">
                    <IconSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search logs by action, user, resource..."
                        className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 transition-colors"
                    />
                </div>

                {/* Action Filter */}
                <div className="relative">
                    <IconFilter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <select
                        value={actionFilter}
                        onChange={(e) => setActionFilter(e.target.value)}
                        className="pl-10 pr-10 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white appearance-none focus:outline-none focus:border-purple-500/50"
                    >
                        <option value="all">All Actions</option>
                        <optgroup label="Authentication">
                            <option value="USER_SIGNUP">User Signup</option>
                            <option value="USER_LOGIN">User Login</option>
                            <option value="LOGIN_FAILED">Login Failed</option>
                            <option value="AUTH_LOGIN_FAILED">Auth Failed</option>
                        </optgroup>
                        <optgroup label="Documents">
                            <option value="DOCUMENT_UPLOAD_QUEUED">Doc Uploaded</option>
                        </optgroup>
                        <optgroup label="Jobs">
                            <option value="JOB_CREATED">Job Created</option>
                            <option value="JOB_STARTED">Job Started</option>
                            <option value="JOB_COMPLETED">Job Completed</option>
                            <option value="JOB_FAILED">Job Failed</option>
                            <option value="JOB_RETRY_SCHEDULED">Job Retry</option>
                        </optgroup>
                    </select>
                    <IconChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>

                {/* Resource Type Filter */}
                <div className="relative">
                    <IconActivity className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <select
                        value={resourceFilter}
                        onChange={(e) => setResourceFilter(e.target.value)}
                        className="pl-10 pr-10 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white appearance-none focus:outline-none focus:border-purple-500/50"
                    >
                        <option value="all">All Resources</option>
                        <option value="auth">Auth</option>
                        <option value="document">Document</option>
                        <option value="job">Job</option>
                    </select>
                    <IconChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
            </motion.div>

            {/* Loading State */}
            {isLoading && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center py-16"
                >
                    <IconLoader2 className="w-12 h-12 text-purple-400 animate-spin mb-4" />
                    <p className="text-gray-400">Loading audit logs...</p>
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
                            <p className="text-red-400 font-medium">Failed to load audit logs</p>
                            <p className="text-sm text-gray-400 mt-1">{error}</p>
                        </div>
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => loadLogs(1)}
                        className="mt-4 px-4 py-2 bg-red-500/20 border border-red-500/30 rounded-xl text-sm text-red-400 hover:bg-red-500/30 transition-colors"
                    >
                        Try Again
                    </motion.button>
                </motion.div>
            )}

            {/* Logs Table */}
            {!isLoading && !error && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="rounded-2xl bg-white/5 border border-white/10 overflow-hidden"
                >
                    {/* Live indicator bar */}
                    <div className="px-4 py-2.5 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                            <span className="text-xs text-gray-400">
                                Showing {filteredLogs.length} of {totalLogs} events
                            </span>
                        </div>
                        <span className="text-xs text-gray-500">
                            Page {currentPage} of {totalPages}
                        </span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-white/10 text-left">
                                    <th className="py-3.5 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Event</th>
                                    <th className="py-3.5 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                                    <th className="py-3.5 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Resource</th>
                                    <th className="py-3.5 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                                    <th className="py-3.5 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
                                </tr>
                            </thead>
                            <tbody>
                                <AnimatePresence>
                                    {filteredLogs.map((log) => (
                                        <LogRow
                                            key={log._id}
                                            log={log}
                                            onView={() => setSelectedLog(log)}
                                        />
                                    ))}
                                </AnimatePresence>
                            </tbody>
                        </table>
                    </div>

                    {filteredLogs.length === 0 && (
                        <div className="py-16 text-center">
                            <IconFileAnalytics className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                            <p className="text-gray-500">No audit logs found</p>
                            <p className="text-sm text-gray-600 mt-1">Try adjusting your filters or search query</p>
                        </div>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="px-4 py-3 border-t border-white/10 flex items-center justify-between">
                            <p className="text-sm text-gray-500">
                                Page {currentPage} of {totalPages} ({totalLogs} total events)
                            </p>
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors disabled:opacity-30 disabled:pointer-events-none"
                                >
                                    <IconChevronLeft className="w-4 h-4" />
                                </button>

                                {getPageNumbers().map((page, idx) => (
                                    typeof page === "number" ? (
                                        <button
                                            key={idx}
                                            onClick={() => handlePageChange(page)}
                                            className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${page === currentPage
                                                ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                                                : "text-gray-400 hover:text-white hover:bg-white/10"
                                                }`}
                                        >
                                            {page}
                                        </button>
                                    ) : (
                                        <span key={idx} className="px-2 text-gray-500">…</span>
                                    )
                                ))}

                                <button
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors disabled:opacity-30 disabled:pointer-events-none"
                                >
                                    <IconChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}
                </motion.div>
            )}

            {/* Detail Modal */}
            <AnimatePresence>
                {selectedLog && (
                    <DetailModal
                        log={selectedLog}
                        onClose={() => setSelectedLog(null)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
