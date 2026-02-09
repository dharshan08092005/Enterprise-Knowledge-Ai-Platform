import { useState, useEffect, type JSX } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
    IconSearch,
    IconFilter,
    IconUpload,
    IconFileTypePdf,
    IconFileTypeDoc,
    IconFileTypeTxt,
    IconFileTypeXls,
    IconFileTypeCsv,
    IconFile,
    IconDotsVertical,
    IconTrash,
    IconDownload,
    IconEdit,
    IconEye,
    IconRefresh,
    IconAlertTriangle,
    IconCheck,
    IconLoader2,
    IconX,
    IconChevronDown,
    IconCalendar,
    IconUser,
    IconLock,
    IconWorld,
    IconUsers,
    IconClock,
    IconFolder,
    IconGridDots,
    IconList,
    IconCloudUpload,
    IconFileCheck,
} from "@tabler/icons-react";
import { getUserRole, getToken } from "@/lib/auth";
import { fetchKnowledgeBase } from "@/services/knowledgeBaseService";

// Types
interface Document {
    id: string;
    title: string;
    fileName: string;
    fileType: "pdf" | "doc" | "docx" | "txt" | "xls" | "xlsx" | "csv" | "other";
    fileSize: number;
    status: "processing" | "active" | "failed";
    uploadDate: Date;
    owner?: {
        id: string;
        name: string;
        email: string;
    };
    accessScope: "private" | "team" | "organization" | "public" | "restricted" | "department";
    processingError?: string;
    processedChunks?: number;
    totalChunks?: number;
    tags?: string[];
}

// Helper functions
const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const formatDate = (date: Date): string => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    if (diff < 1000 * 60 * 60) return `${Math.floor(diff / (1000 * 60))} min ago`;
    if (diff < 1000 * 60 * 60 * 24) return `${Math.floor(diff / (1000 * 60 * 60))} hours ago`;
    if (diff < 1000 * 60 * 60 * 24 * 7) return `${Math.floor(diff / (1000 * 60 * 60 * 24))} days ago`;
    return date.toLocaleDateString();
};

// File Icon Component
const FileIcon = ({ type, size = 24 }: { type: Document["fileType"]; size?: number }) => {
    const iconClass = `w-${size === 24 ? 6 : 5} h-${size === 24 ? 6 : 5}`;
    const icons: Record<Document["fileType"], JSX.Element> = {
        pdf: <IconFileTypePdf className={`${iconClass} text-red-400`} />,
        doc: <IconFileTypeDoc className={`${iconClass} text-blue-400`} />,
        docx: <IconFileTypeDoc className={`${iconClass} text-blue-400`} />,
        txt: <IconFileTypeTxt className={`${iconClass} text-gray-400`} />,
        xls: <IconFileTypeXls className={`${iconClass} text-green-400`} />,
        xlsx: <IconFileTypeXls className={`${iconClass} text-green-400`} />,
        csv: <IconFileTypeCsv className={`${iconClass} text-emerald-400`} />,
        other: <IconFile className={`${iconClass} text-gray-400`} />,
    };
    return icons[type] || icons.other;
};

// Status Badge Component
const StatusBadge = ({ status, progress }: { status: Document["status"]; progress?: number }) => {
    if (status === "processing") {
        return (
            <div className="flex items-center gap-2">
                <span className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-full">
                    <IconLoader2 className="w-3 h-3 animate-spin" />
                    Processing
                </span>
                {progress !== undefined && (
                    <div className="w-20 h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-300"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                )}
            </div>
        );
    }

    if (status === "active") {
        return (
            <span className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full">
                <IconCheck className="w-3 h-3" />
                Active
            </span>
        );
    }

    return (
        <span className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-red-500/20 text-red-400 border border-red-500/30 rounded-full">
            <IconAlertTriangle className="w-3 h-3" />
            Failed
        </span>
    );
};

// Access Scope Badge
const AccessScopeBadge = ({ scope }: { scope: Document["accessScope"] }) => {
    const config: Record<Document["accessScope"], { icon: typeof IconLock; label: string; color: string }> = {
        private: { icon: IconLock, label: "Private", color: "gray" },
        team: { icon: IconUsers, label: "Team", color: "blue" },
        organization: { icon: IconFolder, label: "Organization", color: "purple" },
        public: { icon: IconWorld, label: "Public", color: "emerald" },
        restricted: { icon: IconLock, label: "Restricted", color: "red" },
        department: { icon: IconUsers, label: "Department", color: "amber" },
    };

    const { icon: Icon, label, color } = config[scope] || config.restricted;

    return (
        <span className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-${color}-500/20 text-${color}-400 border border-${color}-500/30 rounded-full`}>
            <Icon className="w-3 h-3" />
            {label}
        </span>
    );
};

// Document Row Component
const DocumentRow = ({
    doc,
    isAdmin,
    onView,
    onEdit,
    onDelete,
    onRetry,
}: {
    doc: Document;
    isAdmin: boolean;
    onView: () => void;
    onEdit: () => void;
    onDelete: () => void;
    onRetry: () => void;
}) => {
    const [showMenu, setShowMenu] = useState(false);
    const [showError, setShowError] = useState(false);
    const progress = doc.totalChunks ? Math.round((doc.processedChunks || 0) / doc.totalChunks * 100) : 0;

    return (
        <>
            <motion.tr
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                whileHover={{ backgroundColor: "rgba(255,255,255,0.02)" }}
                className="border-b border-white/5 group"
            >
                {/* Document Info */}
                <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                            <FileIcon type={doc.fileType} />
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-medium text-white truncate max-w-xs">{doc.title}</p>
                            <p className="text-xs text-gray-500 truncate">{doc.fileName} • {formatFileSize(doc.fileSize)}</p>
                            {doc.tags && doc.tags.length > 0 && (
                                <div className="flex items-center gap-1 mt-1">
                                    {doc.tags.slice(0, 3).map((tag) => (
                                        <span key={tag} className="px-1.5 py-0.5 text-xs text-gray-400 bg-white/5 rounded">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </td>

                {/* Status */}
                <td className="py-4 px-4">
                    <StatusBadge status={doc.status} progress={doc.status === "processing" ? progress : undefined} />
                    {doc.status === "failed" && doc.processingError && (
                        <button
                            onClick={() => setShowError(!showError)}
                            className="mt-1 text-xs text-red-400 hover:text-red-300 flex items-center gap-1"
                        >
                            <IconAlertTriangle className="w-3 h-3" />
                            View error
                        </button>
                    )}
                </td>

                {/* Upload Date */}
                <td className="py-4 px-4">
                    <div className="flex items-center gap-1.5 text-sm text-gray-400">
                        <IconCalendar className="w-4 h-4" />
                        {formatDate(doc.uploadDate)}
                    </div>
                </td>

                {/* Owner (Admin only) */}
                {isAdmin && doc.owner && (
                    <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-xs font-medium text-white">
                                {doc.owner.name?.charAt(0) || "?"}
                            </div>
                            <div>
                                <p className="text-sm text-white">{doc.owner.name || "Unknown"}</p>
                                <p className="text-xs text-gray-500">{doc.owner.email || ""}</p>
                            </div>
                        </div>
                    </td>
                )}

                {/* Access Scope */}
                <td className="py-4 px-4">
                    <AccessScopeBadge scope={doc.accessScope} />
                </td>

                {/* Actions */}
                <td className="py-4 px-4">
                    <div className="relative">
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setShowMenu(!showMenu)}
                            className="p-2 rounded-lg hover:bg-white/10 transition-colors opacity-0 group-hover:opacity-100"
                        >
                            <IconDotsVertical className="w-4 h-4 text-gray-400" />
                        </motion.button>

                        <AnimatePresence>
                            {showMenu && (
                                <>
                                    <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        className="absolute right-0 top-full mt-1 w-44 bg-[#1a1a2e] border border-white/10 rounded-xl shadow-2xl z-20 overflow-hidden"
                                    >
                                        <button
                                            onClick={() => { onView(); setShowMenu(false); }}
                                            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-300 hover:bg-white/5 transition-colors"
                                        >
                                            <IconEye className="w-4 h-4" />
                                            View Details
                                        </button>
                                        <button
                                            onClick={() => { onEdit(); setShowMenu(false); }}
                                            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-300 hover:bg-white/5 transition-colors"
                                        >
                                            <IconEdit className="w-4 h-4" />
                                            Edit
                                        </button>
                                        <button className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-300 hover:bg-white/5 transition-colors">
                                            <IconDownload className="w-4 h-4" />
                                            Download
                                        </button>
                                        {doc.status === "failed" && (
                                            <button
                                                onClick={() => { onRetry(); setShowMenu(false); }}
                                                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-blue-400 hover:bg-blue-500/10 transition-colors"
                                            >
                                                <IconRefresh className="w-4 h-4" />
                                                Retry Processing
                                            </button>
                                        )}
                                        <button
                                            onClick={() => { onDelete(); setShowMenu(false); }}
                                            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                                        >
                                            <IconTrash className="w-4 h-4" />
                                            Delete
                                        </button>
                                    </motion.div>
                                </>
                            )}
                        </AnimatePresence>
                    </div>
                </td>
            </motion.tr>

            {/* Processing Error Row */}
            <AnimatePresence>
                {showError && doc.processingError && (
                    <motion.tr
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                    >
                        <td colSpan={isAdmin ? 6 : 5} className="px-4 pb-4">
                            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                                <div className="flex items-start gap-3">
                                    <IconAlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-red-400">Processing Error</p>
                                        <p className="text-sm text-gray-400 mt-1">{doc.processingError}</p>
                                        <div className="flex items-center gap-2 mt-3">
                                            <motion.button
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={onRetry}
                                                className="px-3 py-1.5 text-xs font-medium text-blue-400 bg-blue-500/20 border border-blue-500/30 rounded-lg hover:bg-blue-500/30 transition-colors"
                                            >
                                                <IconRefresh className="w-3 h-3 inline mr-1" />
                                                Retry
                                            </motion.button>
                                            <motion.button
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={() => setShowError(false)}
                                                className="px-3 py-1.5 text-xs font-medium text-gray-400 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors"
                                            >
                                                Dismiss
                                            </motion.button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </td>
                    </motion.tr>
                )}
            </AnimatePresence>
        </>
    );
};

// Upload Modal Component
const UploadModal = ({
    isOpen,
    onClose,
}: {
    isOpen: boolean;
    onClose: () => void;
}) => {
    const [dragOver, setDragOver] = useState(false);
    const [files, setFiles] = useState<File[]>([]);
    const [accessScope, setAccessScope] = useState<Document["accessScope"]>("team");

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        const droppedFiles = Array.from(e.dataTransfer.files);
        setFiles([...files, ...droppedFiles]);
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const selectedFiles = Array.from(e.target.files);
            setFiles([...files, ...selectedFiles]);
        }
    };

    const removeFile = (index: number) => {
        setFiles(files.filter((_, i) => i !== index));
    };

    const handleUpload = () => {
        // TODO: Implement actual upload
        console.log("Uploading files:", files, "with scope:", accessScope);
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
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
                                        <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20">
                                            <IconCloudUpload className="w-5 h-5 text-purple-400" />
                                        </div>
                                        <h3 className="text-lg font-semibold text-white">Upload Documents</h3>
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
                            <div className="p-6 space-y-6">
                                {/* Drop Zone */}
                                <div
                                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                                    onDragLeave={() => setDragOver(false)}
                                    onDrop={handleDrop}
                                    className={`relative p-8 border-2 border-dashed rounded-xl text-center transition-all ${dragOver
                                        ? "border-purple-500 bg-purple-500/10"
                                        : "border-white/20 hover:border-white/30"
                                        }`}
                                >
                                    <input
                                        type="file"
                                        multiple
                                        onChange={handleFileSelect}
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                        accept=".pdf,.doc,.docx,.txt,.xls,.xlsx,.csv"
                                    />
                                    <IconCloudUpload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                    <p className="text-white font-medium">Drag & drop files here</p>
                                    <p className="text-sm text-gray-500 mt-1">or click to browse</p>
                                    <p className="text-xs text-gray-600 mt-3">
                                        Supported: PDF, DOC, DOCX, TXT, XLS, XLSX, CSV
                                    </p>
                                </div>

                                {/* Selected Files */}
                                {files.length > 0 && (
                                    <div className="space-y-2">
                                        <p className="text-sm font-medium text-gray-400">Selected Files ({files.length})</p>
                                        <div className="max-h-40 overflow-y-auto space-y-2 scrollbar-thin">
                                            {files.map((file, index) => (
                                                <div
                                                    key={index}
                                                    className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
                                                >
                                                    <div className="flex items-center gap-3 min-w-0">
                                                        <IconFileCheck className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                                                        <div className="min-w-0">
                                                            <p className="text-sm text-white truncate">{file.name}</p>
                                                            <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => removeFile(index)}
                                                        className="p-1 hover:bg-white/10 rounded transition-colors"
                                                    >
                                                        <IconX className="w-4 h-4 text-gray-400" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Access Scope */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Access Scope</label>
                                    <div className="relative">
                                        <select
                                            value={accessScope}
                                            onChange={(e) => setAccessScope(e.target.value as Document["accessScope"])}
                                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white appearance-none focus:outline-none focus:border-purple-500/50"
                                        >
                                            <option value="private">Private - Only you</option>
                                            <option value="team">Team - Your team members</option>
                                            <option value="organization">Organization - Everyone in org</option>
                                            <option value="public">Public - Anyone with link</option>
                                        </select>
                                        <IconChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                    </div>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="p-6 border-t border-white/10 flex gap-3">
                                <button
                                    onClick={onClose}
                                    className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm font-medium text-gray-300 hover:bg-white/10 transition-colors"
                                >
                                    Cancel
                                </button>
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handleUpload}
                                    disabled={files.length === 0}
                                    className={`flex-1 px-4 py-3 rounded-xl text-sm font-medium transition-all ${files.length > 0
                                        ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/25"
                                        : "bg-white/10 text-gray-500 cursor-not-allowed"
                                        }`}
                                >
                                    Upload {files.length > 0 ? `(${files.length})` : ""}
                                </motion.button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default function KnowledgeBase() {
    const [documents, setDocuments] = useState<Document[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [scopeFilter, setScopeFilter] = useState<string>("all");
    const [viewMode, setViewMode] = useState<"list" | "grid">("list");
    const [showUploadModal, setShowUploadModal] = useState(false);

    const userRole = getUserRole();
    const isAdmin = userRole === "ADMIN";

    // Fetch documents from API
    useEffect(() => {
        const loadDocuments = async () => {
            try {
                setIsLoading(true);
                setError(null);
                const token = getToken();
                if (!token) {
                    setError("Authentication required");
                    return;
                }
                const data = await fetchKnowledgeBase(token);
                // Map API response to Document interface
                const mappedDocs: Document[] = data.map((doc: any) => ({
                    id: doc.id,
                    title: doc.title,
                    fileName: doc.fileName || "Unknown",
                    fileType: getFileType(doc.fileName || doc.mimeType),
                    fileSize: doc.fileSize || 0,
                    status: doc.status as Document["status"],
                    uploadDate: new Date(doc.uploadDate),
                    owner: doc.owner,
                    accessScope: mapAccessScope(doc.accessScope),
                }));
                setDocuments(mappedDocs);
            } catch (err: any) {
                console.error("Failed to fetch documents:", err);
                setError(err.message || "Failed to load documents");
            } finally {
                setIsLoading(false);
            }
        };
        loadDocuments();
    }, []);

    // Helper function to determine file type from filename/mimeType
    const getFileType = (fileName: string): Document["fileType"] => {
        const ext = fileName?.split(".").pop()?.toLowerCase() || "";
        const mimeMap: Record<string, Document["fileType"]> = {
            pdf: "pdf",
            doc: "doc",
            docx: "docx",
            txt: "txt",
            xls: "xls",
            xlsx: "xlsx",
            csv: "csv",
        };
        return mimeMap[ext] || "other";
    };

    // Helper function to map backend accessScope to frontend values
    const mapAccessScope = (scope: string): Document["accessScope"] => {
        const scopeMap: Record<string, Document["accessScope"]> = {
            public: "public",
            department: "department",
            restricted: "restricted",
            private: "private",
            team: "team",
            organization: "organization",
        };
        return scopeMap[scope] || "restricted";
    };

    // Filter documents
    const filteredDocuments = documents.filter((doc) => {
        const matchesSearch =
            doc.title.toLowerCase().includes(search.toLowerCase()) ||
            doc.fileName.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter === "all" || doc.status === statusFilter;
        const matchesScope = scopeFilter === "all" || doc.accessScope === scopeFilter;
        return matchesSearch && matchesStatus && matchesScope;
    });

    // Stats
    const stats = {
        total: documents.length,
        active: documents.filter((d) => d.status === "active").length,
        processing: documents.filter((d) => d.status === "processing").length,
        failed: documents.filter((d) => d.status === "failed").length,
    };

    const handleDelete = (doc: Document) => {
        if (confirm(`Are you sure you want to delete "${doc.title}"?`)) {
            setDocuments(documents.filter((d) => d.id !== doc.id));
        }
    };

    const handleRetry = (doc: Document) => {
        setDocuments(documents.map((d) =>
            d.id === doc.id
                ? { ...d, status: "processing" as const, processingError: undefined, processedChunks: 0 }
                : d
        ));
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
                    <h1 className="text-2xl font-bold text-white">Knowledge Base</h1>
                    <p className="text-gray-400 mt-1">Manage your documents and data sources</p>
                </div>

                <div className="flex items-center gap-3">
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-gray-300 hover:bg-white/10 transition-colors"
                    >
                        <IconRefresh className="w-4 h-4" />
                        Sync
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setShowUploadModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl text-sm font-medium text-white shadow-lg shadow-purple-500/25"
                    >
                        <IconUpload className="w-4 h-4" />
                        Upload Documents
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
                    { label: "Total Documents", value: stats.total, icon: IconFolder, color: "purple" },
                    { label: "Active", value: stats.active, icon: IconCheck, color: "emerald" },
                    { label: "Processing", value: stats.processing, icon: IconClock, color: "blue" },
                    { label: "Failed", value: stats.failed, icon: IconAlertTriangle, color: "red" },
                ].map((stat, index) => (
                    <div
                        key={index}
                        className="p-4 rounded-xl bg-white/5 border border-white/10"
                    >
                        <div className="flex items-center gap-3 mb-2">
                            <div className={`p-2 rounded-lg bg-${stat.color}-500/20`}>
                                <stat.icon className={`w-4 h-4 text-${stat.color}-400`} />
                            </div>
                        </div>
                        <p className="text-2xl font-bold text-white">{stat.value}</p>
                        <p className="text-sm text-gray-400">{stat.label}</p>
                    </div>
                ))}
            </motion.div>

            {/* Filters & View Toggle */}
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
                        placeholder="Search documents..."
                        className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50"
                    />
                </div>

                {/* Status Filter */}
                <div className="relative">
                    <IconFilter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="pl-10 pr-10 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white appearance-none focus:outline-none focus:border-purple-500/50"
                    >
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="processing">Processing</option>
                        <option value="failed">Failed</option>
                    </select>
                    <IconChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>

                {/* Scope Filter */}
                <div className="relative">
                    <IconLock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <select
                        value={scopeFilter}
                        onChange={(e) => setScopeFilter(e.target.value)}
                        className="pl-10 pr-10 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white appearance-none focus:outline-none focus:border-purple-500/50"
                    >
                        <option value="all">All Access</option>
                        <option value="private">Private</option>
                        <option value="team">Team</option>
                        <option value="organization">Organization</option>
                        <option value="public">Public</option>
                    </select>
                    <IconChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>

                {/* View Toggle */}
                <div className="flex items-center gap-1 p-1 bg-white/5 border border-white/10 rounded-xl">
                    <button
                        onClick={() => setViewMode("list")}
                        className={`p-2 rounded-lg transition-colors ${viewMode === "list" ? "bg-purple-500/20 text-purple-300" : "text-gray-400 hover:text-white"
                            }`}
                    >
                        <IconList className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => setViewMode("grid")}
                        className={`p-2 rounded-lg transition-colors ${viewMode === "grid" ? "bg-purple-500/20 text-purple-300" : "text-gray-400 hover:text-white"
                            }`}
                    >
                        <IconGridDots className="w-5 h-5" />
                    </button>
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
                    <p className="text-gray-400">Loading documents...</p>
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
                            <p className="text-red-400 font-medium">Failed to load documents</p>
                            <p className="text-sm text-gray-400 mt-1">{error}</p>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Documents Table */}
            {!isLoading && !error && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="rounded-2xl bg-white/5 border border-white/10 overflow-hidden"
                >
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-white/10 text-left">
                                    <th className="py-4 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Document</th>
                                    <th className="py-4 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="py-4 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Upload Date</th>
                                    {isAdmin && (
                                        <th className="py-4 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Owner</th>
                                    )}
                                    <th className="py-4 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Access</th>
                                    <th className="py-4 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredDocuments.map((doc) => (
                                    <DocumentRow
                                        key={doc.id}
                                        doc={doc}
                                        isAdmin={isAdmin}
                                        onView={() => console.log("View:", doc)}
                                        onEdit={() => console.log("Edit:", doc)}
                                        onDelete={() => handleDelete(doc)}
                                        onRetry={() => handleRetry(doc)}
                                    />
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {filteredDocuments.length === 0 && (
                        <div className="py-12 text-center">
                            <IconFolder className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                            <p className="text-gray-500">No documents found</p>
                            <p className="text-sm text-gray-600 mt-1">Upload your first document to get started</p>
                        </div>
                    )}

                    {/* Pagination */}
                    <div className="px-4 py-3 border-t border-white/10 flex items-center justify-between">
                        <p className="text-sm text-gray-500">
                            Showing {filteredDocuments.length} of {documents.length} documents
                        </p>
                        <div className="flex items-center gap-2">
                            <button className="px-3 py-1.5 text-sm text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                                Previous
                            </button>
                            <button className="px-3 py-1.5 text-sm bg-purple-500/20 text-purple-300 rounded-lg">
                                1
                            </button>
                            <button className="px-3 py-1.5 text-sm text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                                Next
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Upload Modal */}
            <UploadModal
                isOpen={showUploadModal}
                onClose={() => setShowUploadModal(false)}
            />
        </div>
    );
}
