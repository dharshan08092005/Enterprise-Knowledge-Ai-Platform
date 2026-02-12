import { useState, useEffect } from "react";
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
    IconLoader2,
    IconAlertTriangle,
} from "@tabler/icons-react";
import { getToken } from "@/lib/auth";
import { fetchAllUsers, type AdminUser } from "@/services/adminService";

// Types — mapped from backend
interface User {
    id: string;
    name: string;
    email: string;
    role: "USER" | "AUDITOR" | "ADMIN";
    status: "active" | "inactive";
    createdAt: string;
    lastLogin: string;
}

// Convert backend user into the UI shape
const mapApiUser = (u: AdminUser): User => ({
    id: u._id,
    name: u.name,
    email: u.email,
    role: u.role,
    status: u.isActive !== false ? "active" : "inactive",
    createdAt: new Date(u.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }),
    lastLogin: "—",
});

// Status Badge Component
const StatusBadge = ({ status }: { status: User["status"] }) => {
    const styles = {
        active: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
        inactive: "bg-gray-500/20 text-gray-400 border-gray-500/30",
    };

    return (
        <span className={`px-2.5 py-1 text-xs font-medium rounded-full border ${styles[status]}`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
    );
};

// Role Badge Component
const RoleBadge = ({ role }: { role: User["role"] }) => {
    const styles = {
        USER: "bg-blue-500/20 text-blue-400 border-blue-500/30",
        AUDITOR: "bg-purple-500/20 text-purple-400 border-purple-500/30",
        ADMIN: "bg-pink-500/20 text-pink-400 border-pink-500/30",
    };

    return (
        <span className={`px-2.5 py-1 text-xs font-medium rounded-full border ${styles[role]}`}>
            {role}
        </span>
    );
};

// User Row Component
const UserRow = ({
    user,
    onEdit,
    onDelete,
    onToggleStatus,
}: {
    user: User;
    onEdit: (user: User) => void;
    onDelete: (user: User) => void;
    onToggleStatus: (user: User) => void;
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
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-sm font-semibold text-white">
                        {user.name.charAt(0)}
                    </div>
                    <div>
                        <p className="text-sm font-medium text-white">{user.name}</p>
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                            <IconMail className="w-3 h-3" />
                            {user.email}
                        </p>
                    </div>
                </div>
            </td>
            <td className="py-4 px-4">
                <RoleBadge role={user.role} />
            </td>
            <td className="py-4 px-4">
                <StatusBadge status={user.status} />
            </td>
            <td className="py-4 px-4">
                <div className="flex items-center gap-1 text-sm text-gray-400">
                    <IconCalendar className="w-4 h-4" />
                    {user.createdAt}
                </div>
            </td>
            <td className="py-4 px-4">
                <span className="text-sm text-gray-500">{user.lastLogin}</span>
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
                                    className="absolute right-0 top-full mt-1 w-44 bg-[#1a1a2e] border border-white/10 rounded-xl shadow-2xl z-20 overflow-hidden"
                                >
                                    <button
                                        onClick={() => { onEdit(user); setShowMenu(false); }}
                                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
                                    >
                                        <IconEdit className="w-4 h-4" />
                                        Edit User
                                    </button>
                                    <button
                                        onClick={() => { onToggleStatus(user); setShowMenu(false); }}
                                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
                                    >
                                        {user.status === "active" ? (
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
                                        onClick={() => { onDelete(user); setShowMenu(false); }}
                                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                                    >
                                        <IconTrash className="w-4 h-4" />
                                        Delete User
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

// Add User Modal
const AddUserModal = ({
    isOpen,
    onClose,
    onSubmit,
}: {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (user: Partial<User>) => void;
}) => {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        role: "USER" as User["role"],
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
        setFormData({ name: "", email: "", role: "USER" });
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
                                    <h3 className="text-lg font-semibold text-white">Add New User</h3>
                                    <button
                                        onClick={onClose}
                                        className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                                    >
                                        <IconX className="w-5 h-5 text-gray-400" />
                                    </button>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Full Name</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50"
                                        placeholder="Enter full name"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Email Address</label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50"
                                        placeholder="Enter email address"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Role</label>
                                    <div className="relative">
                                        <select
                                            value={formData.role}
                                            onChange={(e) => setFormData({ ...formData, role: e.target.value as User["role"] })}
                                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white appearance-none focus:outline-none focus:border-purple-500/50"
                                        >
                                            <option value="USER">User</option>
                                            <option value="AUDITOR">Auditor</option>
                                            <option value="ADMIN">Admin</option>
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
                                        className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl text-sm font-medium text-white shadow-lg shadow-purple-500/25"
                                    >
                                        Add User
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

export default function ManageUsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState<string>("all");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [showAddModal, setShowAddModal] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch real users from backend
    const loadUsers = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const token = getToken();
            if (!token) { setError("Authentication required"); return; }
            const data = await fetchAllUsers(token);
            setUsers(data.map(mapApiUser));
        } catch (err: any) {
            console.error("Failed to fetch users:", err);
            setError(err.response?.data?.message || err.message || "Failed to load users");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadUsers();
    }, []);

    // Filter users
    const filteredUsers = users.filter((user) => {
        const matchesSearch =
            user.name.toLowerCase().includes(search.toLowerCase()) ||
            user.email.toLowerCase().includes(search.toLowerCase());
        const matchesRole = roleFilter === "all" || user.role === roleFilter;
        const matchesStatus = statusFilter === "all" || user.status === statusFilter;
        return matchesSearch && matchesRole && matchesStatus;
    });

    // Stats
    const stats = {
        total: users.length,
        active: users.filter((u) => u.status === "active").length,
        inactive: users.filter((u) => u.status === "inactive").length,
        admins: users.filter((u) => u.role === "ADMIN").length,
    };

    const handleEdit = (user: User) => {
        console.log("Edit user:", user);
        // TODO: implement edit modal
    };

    const handleDelete = (user: User) => {
        if (confirm(`Are you sure you want to delete ${user.name}?`)) {
            setUsers(users.filter((u) => u.id !== user.id));
        }
    };

    const handleToggleStatus = (user: User) => {
        setUsers(users.map((u) =>
            u.id === user.id
                ? { ...u, status: u.status === "active" ? "inactive" as const : "active" as const }
                : u
        ));
    };

    const handleAddUser = (userData: Partial<User>) => {
        const newUser: User = {
            id: Date.now().toString(),
            name: userData.name || "",
            email: userData.email || "",
            role: userData.role || "USER",
            status: "active",
            createdAt: new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }),
            lastLogin: "Never",
        };
        setUsers([newUser, ...users]);
    };

    return (
        <div className="space-y-6">
            {/* Loading State */}
            {isLoading && (
                <div className="flex flex-col items-center justify-center py-20">
                    <IconLoader2 className="w-10 h-10 text-purple-400 animate-spin mb-3" />
                    <p className="text-gray-400">Loading users...</p>
                </div>
            )}

            {/* Error State */}
            {error && !isLoading && (
                <div className="p-6 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center gap-3">
                    <IconAlertTriangle className="w-6 h-6 text-red-400" />
                    <div>
                        <p className="text-red-400 font-medium">Failed to load users</p>
                        <p className="text-sm text-gray-400 mt-1">{error}</p>
                    </div>
                </div>
            )}

            {!isLoading && !error && (<>
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                    <div>
                        <h1 className="text-2xl font-bold text-white">Manage Users</h1>
                        <p className="text-gray-400 mt-1">View and manage all user accounts in your organization</p>
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
                            onClick={() => setShowAddModal(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl text-sm font-medium text-white shadow-lg shadow-purple-500/25"
                        >
                            <IconPlus className="w-4 h-4" />
                            Add User
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
                        { label: "Total Users", value: stats.total, color: "purple" },
                        { label: "Active", value: stats.active, color: "emerald" },
                        { label: "Inactive", value: stats.inactive, color: "gray" },
                        { label: "Admins", value: stats.admins, color: "amber" },
                    ].map((stat, index) => (
                        <div
                            key={index}
                            className="p-4 rounded-xl bg-white/5 border border-white/10"
                        >
                            <p className="text-sm text-gray-400">{stat.label}</p>
                            <p className={`text-2xl font-bold text-${stat.color}-400 mt-1`}>{stat.value}</p>
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
                            placeholder="Search users by name or email..."
                            className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50"
                        />
                    </div>

                    {/* Role Filter */}
                    <div className="relative">
                        <IconFilter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <select
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                            className="pl-10 pr-10 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white appearance-none focus:outline-none focus:border-purple-500/50"
                        >
                            <option value="all">All Roles</option>
                            <option value="USER">Users Only</option>
                            <option value="AUDITOR">Auditors Only</option>
                            <option value="ADMIN">Admins Only</option>
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
                        </select>
                        <IconChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={loadUsers}
                        className="p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors"
                    >
                        <IconRefresh className={`w-5 h-5 text-gray-400 ${isLoading ? "animate-spin" : ""}`} />
                    </motion.button>
                </motion.div>

                {/* Users Table */}
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
                                    <th className="py-4 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                                    <th className="py-4 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                                    <th className="py-4 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="py-4 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                                    <th className="py-4 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Last Login</th>
                                    <th className="py-4 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.map((user) => (
                                    <UserRow
                                        key={user.id}
                                        user={user}
                                        onEdit={handleEdit}
                                        onDelete={handleDelete}
                                        onToggleStatus={handleToggleStatus}
                                    />
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {filteredUsers.length === 0 && (
                        <div className="py-12 text-center">
                            <p className="text-gray-500">No users found matching your criteria</p>
                        </div>
                    )}

                    {/* Pagination */}
                    <div className="px-4 py-3 border-t border-white/10 flex items-center justify-between">
                        <p className="text-sm text-gray-500">
                            Showing {filteredUsers.length} of {users.length} users
                        </p>
                        <div className="flex items-center gap-2">
                            <button className="px-3 py-1.5 text-sm text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                                Previous
                            </button>
                            <button className="px-3 py-1.5 text-sm bg-purple-500/20 text-purple-300 rounded-lg">
                                1
                            </button>
                            <button className="px-3 py-1.5 text-sm text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                                2
                            </button>
                            <button className="px-3 py-1.5 text-sm text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                                Next
                            </button>
                        </div>
                    </div>
                </motion.div>

                {/* Add User Modal */}
                <AddUserModal
                    isOpen={showAddModal}
                    onClose={() => setShowAddModal(false)}
                    onSubmit={handleAddUser}
                />
            </>)}
        </div>
    );
}
