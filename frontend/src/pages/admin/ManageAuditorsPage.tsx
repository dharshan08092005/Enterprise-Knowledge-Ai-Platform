import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
    IconSearch,
    IconFilter,
    IconPlus,
    IconEdit,
    IconTrash,
    IconDotsVertical,
    IconUserCheck,
    IconUserOff,
    IconMail,
    IconCalendar,
    IconShieldCheck,
    IconX,
    IconChevronDown,
    IconDownload,
    IconRefresh,
    IconUserPlus,
    IconFileAnalytics,
    IconClock,
} from "@tabler/icons-react";

// Types
interface Auditor {
    id: string;
    name: string;
    email: string;
    department: string;
    status: "active" | "inactive" | "pending";
    assignedAudits: number;
    completedAudits: number;
    createdAt: string;
    lastActive: string;
    avatar?: string;
}

// Mock data
const mockAuditors: Auditor[] = [
    { id: "1", name: "Mike Johnson", email: "mike@example.com", department: "Security", status: "active", assignedAudits: 12, completedAudits: 45, createdAt: "2024-01-20", lastActive: "3 hours ago" },
    { id: "2", name: "Lisa Taylor", email: "lisa@example.com", department: "Compliance", status: "active", assignedAudits: 8, completedAudits: 32, createdAt: "2024-01-18", lastActive: "6 hours ago" },
    { id: "3", name: "David Chen", email: "david@example.com", department: "Finance", status: "active", assignedAudits: 5, completedAudits: 28, createdAt: "2023-12-05", lastActive: "1 day ago" },
    { id: "4", name: "Rachel Green", email: "rachel@example.com", department: "IT", status: "inactive", assignedAudits: 0, completedAudits: 15, createdAt: "2023-11-15", lastActive: "30 days ago" },
    { id: "5", name: "Tom Wilson", email: "tom@example.com", department: "Security", status: "pending", assignedAudits: 0, completedAudits: 0, createdAt: "2024-02-05", lastActive: "Never" },
];

// Status Badge Component
const StatusBadge = ({ status }: { status: Auditor["status"] }) => {
    const styles = {
        active: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
        inactive: "bg-gray-500/20 text-gray-400 border-gray-500/30",
        pending: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    };

    return (
        <span className={`px-2.5 py-1 text-xs font-medium rounded-full border ${styles[status]}`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
    );
};

// Department Badge Component
const DepartmentBadge = ({ department }: { department: string }) => {
    const colors: Record<string, string> = {
        Security: "bg-red-500/20 text-red-400 border-red-500/30",
        Compliance: "bg-blue-500/20 text-blue-400 border-blue-500/30",
        Finance: "bg-green-500/20 text-green-400 border-green-500/30",
        IT: "bg-purple-500/20 text-purple-400 border-purple-500/30",
        Operations: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    };

    return (
        <span className={`px-2.5 py-1 text-xs font-medium rounded-full border ${colors[department] || "bg-gray-500/20 text-gray-400 border-gray-500/30"}`}>
            {department}
        </span>
    );
};

// Auditor Row Component
const AuditorRow = ({
    auditor,
    onEdit,
    onDelete,
    onToggleStatus,
}: {
    auditor: Auditor;
    onEdit: (auditor: Auditor) => void;
    onDelete: (auditor: Auditor) => void;
    onToggleStatus: (auditor: Auditor) => void;
}) => {
    const [showMenu, setShowMenu] = useState(false);

    return (
        <motion.tr
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            whileHover={{ backgroundColor: "rgba(255,255,255,0.02)" }}
            className="border-b border-white/5 group"
        >
            <td className="py-4 px-4">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-sm font-semibold text-white">
                            {auditor.name.charAt(0)}
                        </div>
                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-purple-500 border-2 border-[#1a1a2e]" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-white">{auditor.name}</p>
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                            <IconMail className="w-3 h-3" />
                            {auditor.email}
                        </p>
                    </div>
                </div>
            </td>
            <td className="py-4 px-4">
                <DepartmentBadge department={auditor.department} />
            </td>
            <td className="py-4 px-4">
                <StatusBadge status={auditor.status} />
            </td>
            <td className="py-4 px-4">
                <div className="flex items-center gap-4">
                    <div className="text-center">
                        <p className="text-lg font-semibold text-white">{auditor.assignedAudits}</p>
                        <p className="text-xs text-gray-500">Assigned</p>
                    </div>
                    <div className="text-center">
                        <p className="text-lg font-semibold text-emerald-400">{auditor.completedAudits}</p>
                        <p className="text-xs text-gray-500">Completed</p>
                    </div>
                </div>
            </td>
            <td className="py-4 px-4">
                <div className="flex items-center gap-1 text-sm text-gray-400">
                    <IconClock className="w-4 h-4" />
                    {auditor.lastActive}
                </div>
            </td>
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
                                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                    className="absolute right-0 top-full mt-1 w-48 bg-[#1a1a2e] border border-white/10 rounded-xl shadow-2xl z-20 overflow-hidden"
                                >
                                    <button
                                        onClick={() => { onEdit(auditor); setShowMenu(false); }}
                                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
                                    >
                                        <IconEdit className="w-4 h-4" />
                                        Edit Auditor
                                    </button>
                                    <button
                                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
                                    >
                                        <IconFileAnalytics className="w-4 h-4" />
                                        View Audits
                                    </button>
                                    <button
                                        onClick={() => { onToggleStatus(auditor); setShowMenu(false); }}
                                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
                                    >
                                        {auditor.status === "active" ? (
                                            <>
                                                <IconUserOff className="w-4 h-4" />
                                                Deactivate
                                            </>
                                        ) : (
                                            <>
                                                <IconUserCheck className="w-4 h-4" />
                                                Activate
                                            </>
                                        )}
                                    </button>
                                    <button
                                        onClick={() => { onDelete(auditor); setShowMenu(false); }}
                                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                                    >
                                        <IconTrash className="w-4 h-4" />
                                        Remove Auditor
                                    </button>
                                </motion.div>
                            </>
                        )}
                    </AnimatePresence>
                </div>
            </td>
        </motion.tr>
    );
};

// Promote User Modal
const PromoteUserModal = ({
    isOpen,
    onClose,
    onSubmit,
}: {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: { email: string; department: string }) => void;
}) => {
    const [formData, setFormData] = useState({
        email: "",
        department: "Security",
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
        setFormData({ email: "", department: "Security" });
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
                        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-50"
                    >
                        <div className="bg-[#1a1a2e] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
                            <div className="p-6 border-b border-white/10">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20">
                                            <IconUserPlus className="w-5 h-5 text-purple-400" />
                                        </div>
                                        <h3 className="text-lg font-semibold text-white">Promote to Auditor</h3>
                                    </div>
                                    <button
                                        onClick={onClose}
                                        className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                                    >
                                        <IconX className="w-5 h-5 text-gray-400" />
                                    </button>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                                <p className="text-sm text-gray-400">
                                    Enter the email of an existing user to promote them to Auditor role.
                                </p>

                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">User Email</label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50"
                                        placeholder="user@example.com"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Audit Department</label>
                                    <div className="relative">
                                        <select
                                            value={formData.department}
                                            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white appearance-none focus:outline-none focus:border-purple-500/50"
                                        >
                                            <option value="Security">Security</option>
                                            <option value="Compliance">Compliance</option>
                                            <option value="Finance">Finance</option>
                                            <option value="IT">IT</option>
                                            <option value="Operations">Operations</option>
                                        </select>
                                        <IconChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm font-medium text-gray-300 hover:bg-white/10 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        type="submit"
                                        className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl text-sm font-medium text-white shadow-lg shadow-purple-500/25"
                                    >
                                        Promote User
                                    </motion.button>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default function ManageAuditorsPage() {
    const [auditors, setAuditors] = useState<Auditor[]>(mockAuditors);
    const [search, setSearch] = useState("");
    const [departmentFilter, setDepartmentFilter] = useState<string>("all");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [showPromoteModal, setShowPromoteModal] = useState(false);

    // Filter auditors
    const filteredAuditors = auditors.filter((auditor) => {
        const matchesSearch =
            auditor.name.toLowerCase().includes(search.toLowerCase()) ||
            auditor.email.toLowerCase().includes(search.toLowerCase());
        const matchesDepartment = departmentFilter === "all" || auditor.department === departmentFilter;
        const matchesStatus = statusFilter === "all" || auditor.status === statusFilter;
        return matchesSearch && matchesDepartment && matchesStatus;
    });

    // Stats
    const stats = {
        total: auditors.length,
        active: auditors.filter((a) => a.status === "active").length,
        totalAudits: auditors.reduce((sum, a) => sum + a.completedAudits, 0),
        avgAudits: Math.round(auditors.reduce((sum, a) => sum + a.completedAudits, 0) / auditors.length),
    };

    const handleEdit = (auditor: Auditor) => {
        console.log("Edit auditor:", auditor);
    };

    const handleDelete = (auditor: Auditor) => {
        if (confirm(`Are you sure you want to remove ${auditor.name} as an auditor?`)) {
            setAuditors(auditors.filter((a) => a.id !== auditor.id));
        }
    };

    const handleToggleStatus = (auditor: Auditor) => {
        setAuditors(auditors.map((a) =>
            a.id === auditor.id
                ? { ...a, status: a.status === "active" ? "inactive" : "active" }
                : a
        ));
    };

    const handlePromoteUser = (data: { email: string; department: string }) => {
        const newAuditor: Auditor = {
            id: Date.now().toString(),
            name: data.email.split("@")[0].replace(/\./g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
            email: data.email,
            department: data.department,
            status: "pending",
            assignedAudits: 0,
            completedAudits: 0,
            createdAt: new Date().toISOString().split("T")[0],
            lastActive: "Never",
        };
        setAuditors([newAuditor, ...auditors]);
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
                    <h1 className="text-2xl font-bold text-white">Manage Auditors</h1>
                    <p className="text-gray-400 mt-1">View and manage auditor accounts and their assignments</p>
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
                        onClick={() => setShowPromoteModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl text-sm font-medium text-white shadow-lg shadow-purple-500/25"
                    >
                        <IconPlus className="w-4 h-4" />
                        Add Auditor
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
                    { label: "Total Auditors", value: stats.total, icon: IconShieldCheck, color: "purple" },
                    { label: "Active", value: stats.active, icon: IconUserCheck, color: "emerald" },
                    { label: "Total Audits Completed", value: stats.totalAudits, icon: IconFileAnalytics, color: "blue" },
                    { label: "Avg Audits/Auditor", value: stats.avgAudits, icon: IconCalendar, color: "amber" },
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
                        <p className={`text-2xl font-bold text-white`}>{stat.value}</p>
                        <p className="text-sm text-gray-400">{stat.label}</p>
                    </div>
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
                        placeholder="Search auditors by name or email..."
                        className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50"
                    />
                </div>

                {/* Department Filter */}
                <div className="relative">
                    <IconFilter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <select
                        value={departmentFilter}
                        onChange={(e) => setDepartmentFilter(e.target.value)}
                        className="pl-10 pr-10 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white appearance-none focus:outline-none focus:border-purple-500/50"
                    >
                        <option value="all">All Departments</option>
                        <option value="Security">Security</option>
                        <option value="Compliance">Compliance</option>
                        <option value="Finance">Finance</option>
                        <option value="IT">IT</option>
                        <option value="Operations">Operations</option>
                    </select>
                    <IconChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>

                {/* Status Filter */}
                <div className="relative">
                    <IconShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="pl-10 pr-10 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white appearance-none focus:outline-none focus:border-purple-500/50"
                    >
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="pending">Pending</option>
                    </select>
                    <IconChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>

                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors"
                >
                    <IconRefresh className="w-5 h-5 text-gray-400" />
                </motion.button>
            </motion.div>

            {/* Auditors Table */}
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
                                <th className="py-4 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Auditor</th>
                                <th className="py-4 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                                <th className="py-4 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="py-4 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Audits</th>
                                <th className="py-4 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Last Active</th>
                                <th className="py-4 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredAuditors.map((auditor) => (
                                <AuditorRow
                                    key={auditor.id}
                                    auditor={auditor}
                                    onEdit={handleEdit}
                                    onDelete={handleDelete}
                                    onToggleStatus={handleToggleStatus}
                                />
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredAuditors.length === 0 && (
                    <div className="py-12 text-center">
                        <p className="text-gray-500">No auditors found matching your criteria</p>
                    </div>
                )}

                {/* Pagination */}
                <div className="px-4 py-3 border-t border-white/10 flex items-center justify-between">
                    <p className="text-sm text-gray-500">
                        Showing {filteredAuditors.length} of {auditors.length} auditors
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

            {/* Promote User Modal */}
            <PromoteUserModal
                isOpen={showPromoteModal}
                onClose={() => setShowPromoteModal(false)}
                onSubmit={handlePromoteUser}
            />
        </div>
    );
}
