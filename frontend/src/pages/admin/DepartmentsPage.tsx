import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
    IconUsers,
    IconPlus,
    IconSearch,
    IconRefresh,
    IconLoader2,
    IconAlertTriangle,
    IconChevronRight,
    IconSettings,
    IconX
} from "@tabler/icons-react";
import { getDepartments, createDepartment } from "@/services/departmentService";

interface Department {
    _id: string;
    name: string;
    description?: string;
    createdAt: string;
}

export default function DepartmentsPage() {
    const [departments, setDepartments] = useState<Department[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState("");

    const [newDept, setNewDept] = useState({ name: "", description: "" });

    const loadDepts = async () => {
        try {
            setIsLoading(true);
            const data = await getDepartments();
            setDepartments(data);
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to load departments");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadDepts();
    }, []);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setIsCreating(true);
            const data = await createDepartment(newDept);
            setDepartments([data, ...departments]);
            setShowModal(false);
            setNewDept({ name: "", description: "" });
        } catch (err) {
            alert("Failed to create department");
        } finally {
            setIsCreating(false);
        }
    };

    const filteredDepts = departments.filter(d =>
        d.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Departments</h1>
                    <p className="text-gray-500 dark:text-slate-400 mt-1">Organize your team members and knowledge base access</p>
                </div>
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-accent-gradient rounded-lg text-sm font-medium text-white shadow-accent"
                >
                    <IconPlus className="w-4 h-4" />
                    Add Department
                </motion.button>
            </div>

            {/* Filters */}
            <div className="flex gap-4">
                <div className="relative flex-1">
                    <IconSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 dark:text-slate-500" />
                    <input
                        type="text"
                        value={search}
                        placeholder="Search departments..."
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:border-accent/50 transition-all shadow-sm"
                    />
                </div>
                <button
                    onClick={loadDepts}
                    className="p-3 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg hover:bg-gray-100 dark:bg-white/10 transition-colors"
                >
                    <IconRefresh className={`w-5 h-5 text-gray-500 dark:text-slate-400 ${isLoading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20">
                    <IconLoader2 className="w-10 h-10 text-accent animate-spin mb-3" />
                    <p className="text-gray-500 dark:text-slate-400">Loading departments...</p>
                </div>
            ) : error ? (
                <div className="p-6 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center gap-3">
                    <IconAlertTriangle className="w-6 h-6 text-red-400" />
                    <p className="text-red-400">{error}</p>
                </div>
            ) : filteredDepts.length === 0 ? (
                <div className="py-20 text-center border-2 border-dashed border-gray-100 dark:border-white/5 rounded-3xl">
                    <div className="w-16 h-16 bg-white dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                        <IconUsers className="w-8 h-8 text-gray-600" />
                    </div>
                    <h3 className="text-gray-900 dark:text-white font-medium">No departments found</h3>
                    <p className="text-gray-500 dark:text-slate-500 text-sm mt-1">Get started by creating your first department</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredDepts.map((dept) => (
                        <motion.div
                            key={dept._id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-5 rounded-lg bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 flex items-center justify-between group hover:bg-white/[0.07] transition-all cursor-pointer"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center text-accent group-hover:bg-accent group-hover:text-white transition-all shadow-sm group-hover:shadow-accent">
                                    <IconUsers className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-gray-900 dark:text-white font-semibold">{dept.name}</h3>
                                    <p className="text-xs text-gray-500 dark:text-slate-500 line-clamp-1">{dept.description || 'No description provided'}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button className="p-2 opacity-0 group-hover:opacity-100 text-gray-500 dark:text-slate-500 hover:text-gray-900 dark:text-white transition-all">
                                    <IconSettings size={18} />
                                </button>
                                <IconChevronRight className="w-5 h-5 text-gray-700 group-hover:text-gray-500 dark:text-slate-400 transition-colors" />
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Create Modal */}
            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowModal(false)}
                            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="relative w-full max-w-md bg-white dark:bg-[#1a1a2e] border border-gray-200 dark:border-white/10 rounded-3xl shadow-xl overflow-hidden"
                        >
                            <div className="p-6 border-b border-gray-200 dark:border-white/10 flex items-center justify-between">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">New Department</h2>
                                <button onClick={() => setShowModal(false)} className="text-gray-500 dark:text-slate-500 hover:text-gray-900 dark:text-white transition-colors">
                                    <IconX />
                                </button>
                            </div>
                            <form onSubmit={handleCreate} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-500 dark:text-slate-400 mb-2">Department Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={newDept.name}
                                        onChange={e => setNewDept({ ...newDept, name: e.target.value })}
                                        className="w-full px-4 py-3 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-accent/50 transition-all shadow-sm"
                                        placeholder="e.g. Sales, Engineering..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-500 dark:text-slate-400 mb-2">Description</label>
                                    <textarea
                                        value={newDept.description}
                                        onChange={e => setNewDept({ ...newDept, description: e.target.value })}
                                        className="w-full px-4 py-3 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-accent/50 min-h-[100px] transition-all shadow-sm"
                                        placeholder="Brief purpose of this department..."
                                    />
                                </div>
                                <button
                                    disabled={isCreating}
                                    className="w-full py-4 bg-accent-gradient rounded-lg text-white font-bold shadow-accent disabled:opacity-50 transition-all"
                                >
                                    {isCreating ? "Creating..." : "Create Department"}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
