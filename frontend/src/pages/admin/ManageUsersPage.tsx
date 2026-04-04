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

    IconLoader2,
    IconAlertTriangle,
    IconBuilding,
    IconShieldCheck,
    IconX,
    IconDownload,
    IconRefresh,
} from "@tabler/icons-react";
import { getToken } from "@/lib/auth";
import { fetchAllUsers, createUser as createUserApi, updateUserDepartment as updateDeptApi, type AdminUser } from "@/services/adminService";
import { getDepartments } from "@/services/departmentService";
import { CustomSelect } from "@/components/ui/CustomSelect";

// Types — mapped from backend
interface User {
    id: string;
    name: string;
    email: string;
    role: "USER" | "AUDITOR" | "ADMIN";
    status: "active" | "inactive";
    createdAt: string;
    lastLogin: string;
    departmentId: string | null;
    departmentName: string | null;
}

interface Department {
    _id: string;
    name: string;
    description?: string;
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
    departmentId: u.departmentId || null,
    departmentName: u.departmentName || null,
});

// Status Badge Component
const StatusBadge = ({ status }: { status: User["status"] }) => {
    const styles = {
        active: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
        inactive: "bg-red-500/20 text-red-400 border-red-500/30",
    };

    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full border ${styles[status]}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${status === "active" ? "bg-emerald-400" : "bg-red-400"}`} />
            {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
    );
};

// Role Badge Component
const RoleBadge = ({ role }: { role: User["role"] }) => {
    const styles: Record<string, string> = {
        USER: "bg-accent/20 text-accent border-accent/30",
        AUDITOR: "bg-amber-500/20 text-amber-400 border-amber-500/30",
        ADMIN: "bg-accent/20 text-accent border-accent/30",
    };

    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full border ${styles[role] || styles.USER}`}>
            <IconShieldCheck className="w-3 h-3" />
            {role}
        </span>
    );
};

// Department Badge
const DepartmentBadge = ({ name }: { name: string | null }) => {
    if (!name) return <span className="text-xs text-gray-500 dark:text-slate-500 italic">Unassigned</span>;
    return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full border bg-accent/20 text-accent border-accent/30">
            <IconBuilding className="w-3 h-3" />
            {name}
        </span>
    );
};

// User Row Component
const UserRow = ({
    user,
    onEdit,
    onDelete,
    onToggleStatus,
    onChangeDepartment,
}: {
    user: User;
    onEdit: (user: User) => void;
    onDelete: (user: User) => void;
    onToggleStatus: (user: User) => void;
    onChangeDepartment: (user: User) => void;
}) => {
    const [showMenu, setShowMenu] = useState(false);

    return (
        <motion.tr
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            whileHover={{ backgroundColor: "rgba(255,255,255,0.02)" }}
            className="border-b border-gray-100 dark:border-white/5 group"
        >
            <td className="py-4 px-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center text-sm font-semibold text-white">
                        {user.name.charAt(0)}
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</p>
                        <p className="text-xs text-gray-500 dark:text-slate-500 flex items-center gap-1">
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
                <DepartmentBadge name={user.departmentName} />
            </td>
            <td className="py-4 px-4">
                <StatusBadge status={user.status} />
            </td>
            <td className="py-4 px-4">
                <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-slate-400">
                    <IconCalendar className="w-4 h-4" />
                    {user.createdAt}
                </div>
            </td>
            <td className="py-4 px-4">
                <span className="text-sm text-gray-500 dark:text-slate-500">{user.lastLogin}</span>
            </td>
            <td className="py-4 px-4">
                <div className="relative">
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setShowMenu(!showMenu)}
                        className="p-2 rounded-lg hover:bg-gray-100 dark:bg-white/10 transition-colors opacity-0 group-hover:opacity-100"
                    >
                        <IconDotsVertical className="w-4 h-4 text-gray-500 dark:text-slate-400" />
                    </motion.button>

                    <AnimatePresence>
                        {showMenu && (
                            <>
                                <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                    className="absolute right-0 top-full mt-1 w-52 bg-white dark:bg-[#1a1a2e] border border-gray-200 dark:border-white/10 rounded-lg shadow-xl z-20 overflow-hidden"
                                >
                                    <button
                                        onClick={() => { onChangeDepartment(user); setShowMenu(false); }}
                                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-white dark:bg-white/5 hover:text-gray-900 dark:text-white transition-colors"
                                    >
                                        <IconBuilding className="w-4 h-4" />
                                        Change Department
                                    </button>
                                    <button
                                        onClick={() => { onEdit(user); setShowMenu(false); }}
                                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-white dark:bg-white/5 hover:text-gray-900 dark:text-white transition-colors"
                                    >
                                        <IconEdit className="w-4 h-4" />
                                        Edit User
                                    </button>
                                    <button
                                        onClick={() => { onToggleStatus(user); setShowMenu(false); }}
                                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-white dark:bg-white/5 hover:text-gray-900 dark:text-white transition-colors"
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
    departments,
}: {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (user: Partial<User> & { departmentId: string }) => void;
    departments: Department[];
}) => {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        role: "USER" as User["role"],
        departmentId: "",
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.departmentId) {
            alert("Please select a department");
            return;
        }
        onSubmit(formData);
        setFormData({ name: "", email: "", role: "USER", departmentId: "" });
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
                        <div className="bg-white dark:bg-[#1a1a2e] border border-gray-200 dark:border-white/10 rounded-lg shadow-xl overflow-hidden">
                            <div className="p-6 border-b border-gray-200 dark:border-white/10">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Add New User</h3>
                                    <button
                                        onClick={onClose}
                                        className="p-2 rounded-lg hover:bg-gray-100 dark:bg-white/10 transition-colors"
                                    >
                                        <IconX className="w-5 h-5 text-gray-500 dark:text-slate-400" />
                                    </button>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-500 dark:text-slate-400 mb-2">Full Name</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-3 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:border-accent/50 transition-all shadow-sm"
                                        placeholder="Enter full name"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-500 dark:text-slate-400 mb-2">Email Address</label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full px-4 py-3 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:border-accent/50 transition-all shadow-sm"
                                        placeholder="Enter email address"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-500 dark:text-slate-400 mb-2">Role</label>
                                    <CustomSelect
                                        value={formData.role}
                                        onChange={(val) => setFormData({ ...formData, role: val as User["role"] })}
                                        options={[
                                            { value: "USER", label: "User" },
                                            { value: "AUDITOR", label: "Auditor" }
                                        ]}
                                    />
                                </div>

                                {/* Department — Required */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-500 dark:text-slate-400 mb-2">
                                        Department <span className="text-red-400">*</span>
                                    </label>
                                    <CustomSelect
                                        value={formData.departmentId}
                                        onChange={(val) => setFormData({ ...formData, departmentId: val })}
                                        placeholder="Select a department"
                                        icon={IconBuilding}
                                        options={departments.map(d => ({ value: d._id, label: d.name }))}
                                    />
                                    {departments.length === 0 && (
                                        <p className="text-xs text-amber-400 mt-1">
                                            No departments found. Please create departments first.
                                        </p>
                                    )}
                                </div>

                                <div className="p-4 bg-accent/10 border border-accent/20 rounded-lg">
                                    <p className="text-xs text-accent">
                                        <strong>Note:</strong> The initial password will be the username (the portion of the email before the @). Users can change this after logging in.
                                    </p>
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="flex-1 px-4 py-3 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:bg-white/10 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        type="submit"
                                        disabled={departments.length === 0}
                                        className="flex-1 px-4 py-3 bg-accent-gradient rounded-lg text-sm font-medium text-white shadow-accent disabled:opacity-50 disabled:cursor-not-allowed"
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

// Change Department Modal
const ChangeDepartmentModal = ({
    isOpen,
    onClose,
    user,
    departments,
    onSubmit,
}: {
    isOpen: boolean;
    onClose: () => void;
    user: User | null;
    departments: Department[];
    onSubmit: (userId: string, departmentId: string) => void;
}) => {
    const [selectedDept, setSelectedDept] = useState("");

    useEffect(() => {
        if (user?.departmentId) {
            setSelectedDept(user.departmentId);
        } else {
            setSelectedDept("");
        }
    }, [user]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !selectedDept) return;
        onSubmit(user.id, selectedDept);
        onClose();
    };

    if (!user) return null;

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
                        <div className="bg-white dark:bg-[#1a1a2e] border border-gray-200 dark:border-white/10 rounded-lg shadow-xl overflow-hidden">
                            <div className="p-6 border-b border-gray-200 dark:border-white/10">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Change Department</h3>
                                    <button
                                        onClick={onClose}
                                        className="p-2 rounded-lg hover:bg-gray-100 dark:bg-white/10 transition-colors"
                                    >
                                        <IconX className="w-5 h-5 text-gray-500 dark:text-slate-400" />
                                    </button>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                                {/* User info */}
                                <div className="p-4 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center text-sm font-semibold text-white">
                                        {user.name.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</p>
                                        <p className="text-xs text-gray-500 dark:text-slate-400">{user.email}</p>
                                    </div>
                                </div>

                                {/* Current department */}
                                {user.departmentName && (
                                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-slate-400">
                                        <IconBuilding className="w-4 h-4" />
                                        Current: <span className="text-accent font-medium">{user.departmentName}</span>
                                    </div>
                                )}

                                {/* New department */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-500 dark:text-slate-400 mb-2">
                                        New Department <span className="text-red-400">*</span>
                                    </label>
                                    <CustomSelect
                                        value={selectedDept}
                                        onChange={setSelectedDept}
                                        placeholder="Select a department"
                                        icon={IconBuilding}
                                        options={departments.map(d => ({ value: d._id, label: d.name }))}
                                    />
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="flex-1 px-4 py-3 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:bg-white/10 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        type="submit"
                                        className="flex-1 px-4 py-3 bg-accent-gradient rounded-lg text-sm font-medium text-white shadow-accent"
                                    >
                                        Update Department
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
    const [departments, setDepartments] = useState<Department[]>([]);
    const [showDeptModal, setShowDeptModal] = useState(false);
    const [selectedUserForDept, setSelectedUserForDept] = useState<User | null>(null);

    // Fetch departments
    const loadDepartments = async () => {
        try {
            const data = await getDepartments();
            setDepartments(data);
        } catch (err) {
            console.error("Failed to fetch departments:", err);
        }
    };

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
        loadDepartments();
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

    const handleAddUser = async (userData: Partial<User> & { departmentId: string }) => {
        try {
            const token = getToken();
            if (!token) return;

            const res = await createUserApi(token, {
                email: userData.email!,
                name: userData.name!,
                role: userData.role!,
                departmentId: userData.departmentId,
            });

            const newUser = mapApiUser(res);
            setUsers([newUser, ...users]);
        } catch (err: any) {
            alert(err.response?.data?.message || "Failed to create user");
        }
    };

    const handleChangeDepartment = (user: User) => {
        setSelectedUserForDept(user);
        setShowDeptModal(true);
    };

    const handleUpdateDepartment = async (userId: string, departmentId: string) => {
        try {
            const token = getToken();
            if (!token) return;

            const res = await updateDeptApi(token, userId, departmentId);

            // Update user in local state
            setUsers(users.map((u) =>
                u.id === userId
                    ? { ...u, departmentId: res.user.departmentId, departmentName: res.user.departmentName }
                    : u
            ));
        } catch (err: any) {
            alert(err.response?.data?.message || "Failed to update department");
        }
    };

    return (
        <div className="space-y-6">
            {/* Loading State */}
            {isLoading && (
                <div className="flex items-center justify-center py-20">
                    <div className="text-center">
                        <IconLoader2 className="w-8 h-8 text-accent animate-spin mx-auto mb-4" />
                        <p className="text-gray-500 dark:text-slate-400">Loading users...</p>
                    </div>
                </div>
            )}

            {/* Error State */}
            {error && !isLoading && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-6 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center gap-4"
                >
                    <IconAlertTriangle className="w-6 h-6 text-red-400 flex-shrink-0" />
                    <div className="flex-1">
                        <p className="text-sm font-medium text-red-400">Failed to load users</p>
                        <p className="text-xs text-red-300/70 mt-1">{error}</p>
                    </div>
                    <button
                        onClick={loadUsers}
                        className="px-4 py-2 bg-red-500/20 border border-red-500/30 rounded-lg text-sm text-red-300 hover:bg-red-500/30 transition-colors"
                    >
                        Retry
                    </button>
                </motion.div>
            )}

            {/* Main Content */}
            {!isLoading && !error && (<>
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">User Management</h1>
                        <p className="text-gray-500 dark:text-slate-400 mt-1">Manage users, roles, and departments</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:bg-white/10 transition-colors"
                        >
                            <IconDownload className="w-4 h-4" />
                            Export
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setShowAddModal(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-accent-gradient rounded-lg text-sm font-medium text-white shadow-accent"
                        >
                            <IconPlus className="w-4 h-4" />
                            Add User
                        </motion.button>
                    </div>
                </motion.div>

                {/* Stats */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="grid grid-cols-2 md:grid-cols-4 gap-4"
                >
                    {[
                        { label: 'Total Users', value: stats.total, color: 'accent' },
                        { label: 'Active', value: stats.active, color: 'emerald' },
                        { label: 'Inactive', value: stats.inactive, color: 'red' },
                        { label: 'Admins', value: stats.admins, color: 'accent' },
                    ].map((stat, i) => (
                        <div key={i} className="p-4 rounded-lg bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 transition-all hover:bg-white/[0.08]">
                            <div className={`w-8 h-8 rounded-lg ${stat.color === 'accent' ? 'bg-accent/20' : `bg-${stat.color}-500/20`} flex items-center justify-center mb-3`}>
                                <div className={`w-3 h-3 rounded-full ${stat.color === 'accent' ? 'bg-accent' : `bg-${stat.color}-500`}`} />
                            </div>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                            <p className="text-sm text-gray-500 dark:text-slate-400">{stat.label}</p>
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
                        <IconSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 dark:text-slate-500" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search users by name or email..."
                            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:border-accent/50 transition-all shadow-sm"
                        />
                    </div>

                    {/* Role Filter */}
                    <CustomSelect
                        className="w-48"
                        icon={IconFilter}
                        value={roleFilter}
                        onChange={setRoleFilter}
                        options={[
                            { value: "all", label: "All Roles" },
                            { value: "USER", label: "Users Only" },
                            { value: "AUDITOR", label: "Auditors Only" },
                            { value: "ADMIN", label: "Admins Only" }
                        ]}
                    />

                    {/* Status Filter */}
                    <CustomSelect
                        className="w-48"
                        icon={IconShieldCheck}
                        value={statusFilter}
                        onChange={setStatusFilter}
                        options={[
                            { value: "all", label: "All Status" },
                            { value: "active", label: "Active" },
                            { value: "inactive", label: "Inactive" }
                        ]}
                    />

                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={loadUsers}
                        className="p-3 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg hover:bg-gray-100 dark:bg-white/10 transition-colors"
                    >
                        <IconRefresh className={`w-5 h-5 text-gray-500 dark:text-slate-400 ${isLoading ? "animate-spin" : ""}`} />
                    </motion.button>
                </motion.div>

                {/* Users Table */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="rounded-lg bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 overflow-hidden"
                >
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-200 dark:border-white/10 text-left">
                                    <th className="py-4 px-4 text-xs font-medium text-gray-500 dark:text-slate-500 uppercase tracking-wider">User</th>
                                    <th className="py-4 px-4 text-xs font-medium text-gray-500 dark:text-slate-500 uppercase tracking-wider">Role</th>
                                    <th className="py-4 px-4 text-xs font-medium text-gray-500 dark:text-slate-500 uppercase tracking-wider">Department</th>
                                    <th className="py-4 px-4 text-xs font-medium text-gray-500 dark:text-slate-500 uppercase tracking-wider">Status</th>
                                    <th className="py-4 px-4 text-xs font-medium text-gray-500 dark:text-slate-500 uppercase tracking-wider">Created</th>
                                    <th className="py-4 px-4 text-xs font-medium text-gray-500 dark:text-slate-500 uppercase tracking-wider">Last Login</th>
                                    <th className="py-4 px-4 text-xs font-medium text-gray-500 dark:text-slate-500 uppercase tracking-wider"></th>
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
                                        onChangeDepartment={handleChangeDepartment}
                                    />
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {filteredUsers.length === 0 && (
                        <div className="py-12 text-center">
                            <p className="text-gray-500 dark:text-slate-500">No users found matching your criteria</p>
                        </div>
                    )}

                    {/* Pagination */}
                    <div className="px-4 py-3 border-t border-gray-200 dark:border-white/10 flex items-center justify-between">
                        <p className="text-sm text-gray-500 dark:text-slate-500">
                            Showing {filteredUsers.length} of {users.length} users
                        </p>
                        <div className="flex items-center gap-2">
                            <button className="px-3 py-1.5 text-sm text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:text-white hover:bg-gray-100 dark:bg-white/10 rounded-lg transition-colors">
                                Previous
                            </button>
                            <button className="px-3 py-1.5 text-sm bg-blue-500/20 text-blue-300 rounded-lg">
                                1
                            </button>
                            <button className="px-3 py-1.5 text-sm text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:text-white hover:bg-gray-100 dark:bg-white/10 rounded-lg transition-colors">
                                2
                            </button>
                            <button className="px-3 py-1.5 text-sm text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:text-white hover:bg-gray-100 dark:bg-white/10 rounded-lg transition-colors">
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
                    departments={departments}
                />

                {/* Change Department Modal */}
                <ChangeDepartmentModal
                    isOpen={showDeptModal}
                    onClose={() => { setShowDeptModal(false); setSelectedUserForDept(null); }}
                    user={selectedUserForDept}
                    departments={departments}
                    onSubmit={handleUpdateDepartment}
                />
            </>)}
        </div>
    );
}
