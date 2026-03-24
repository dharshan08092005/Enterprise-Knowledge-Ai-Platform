import { useState, useEffect } from "react";
import { motion } from "motion/react";
import {
    IconSearch,
    IconPlus,
    IconBuilding,
    IconGlobe,
    IconLoader2,
    IconAlertTriangle,
    IconCircleCheck,
    IconCircleX,
    IconRefresh,
    IconEdit
} from "@tabler/icons-react";
import { getOrganizations, updateOrganization } from "@/services/organizationService";

interface Organization {
    _id: string;
    name: string;
    slug: string;
    domain?: string;
    isActive: boolean;
    subscriptionPlan: string;
    createdAt: string;
}

export default function OrganizationsPage() {
    const [organizations, setOrganizations] = useState<Organization[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState("");

    const loadOrgs = async () => {
        try {
            setIsLoading(true);
            const data = await getOrganizations();
            setOrganizations(data);
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to load organizations");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadOrgs();
    }, []);

    const handleToggleActive = async (org: Organization) => {
        try {
            const updated = await updateOrganization(org._id, { isActive: !org.isActive });
            setOrganizations(orgs => orgs.map(o => o._id === org._id ? updated : o));
        } catch (err) {
            alert("Failed to update organization");
        }
    };

    const filteredOrgs = organizations.filter(o =>
        o.name.toLowerCase().includes(search.toLowerCase()) ||
        o.slug.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Organizations</h1>
                    <p className="text-gray-500 dark:text-slate-400 mt-1">Manage all tenants and their subscription status</p>
                </div>
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-600 rounded-lg text-sm font-medium text-gray-900 dark:text-white shadow-lg shadow-blue-500/25"
                >
                    <IconPlus className="w-4 h-4" />
                    New Organization
                </motion.button>
            </div>

            {/* Filters */}
            <div className="flex gap-4">
                <div className="relative flex-1">
                    <IconSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 dark:text-slate-500" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search by name or slug..."
                        className="w-full pl-12 pr-4 py-3 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50"
                    />
                </div>
                <button
                    onClick={loadOrgs}
                    className="p-3 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg hover:bg-gray-100 dark:bg-white/10 transition-colors"
                >
                    <IconRefresh className={`w-5 h-5 text-gray-500 dark:text-slate-400 ${isLoading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20">
                    <IconLoader2 className="w-10 h-10 text-blue-400 animate-spin mb-3" />
                    <p className="text-gray-500 dark:text-slate-400">Loading organizations...</p>
                </div>
            ) : error ? (
                <div className="p-6 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center gap-3">
                    <IconAlertTriangle className="w-6 h-6 text-red-400" />
                    <p className="text-red-400">{error}</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredOrgs.map((org) => (
                        <motion.div
                            key={org._id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            whileHover={{ y: -5 }}
                            className="p-6 rounded-lg bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 hover:border-blue-500/30 transition-all group relative overflow-hidden"
                        >
                            {/* Decorative Background Blob */}
                            <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-500/10 blur-2xl rounded-full group-hover:bg-blue-500/20 transition-colors" />

                            <div className="flex items-start justify-between mb-4">
                                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-gray-900 dark:text-white shadow-lg shadow-blue-500/20">
                                    <IconBuilding className="w-6 h-6" />
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg border ${org.isActive
                                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                        : "bg-red-500/10 text-red-400 border-red-500/20"
                                        }`}>
                                        {org.isActive ? "Active" : "Inactive"}
                                    </span>
                                </div>
                            </div>

                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1 group-hover:text-blue-400 transition-colors">
                                {org.name}
                            </h3>
                            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-slate-500 mb-4">
                                <IconGlobe className="w-3.5 h-3.5" />
                                <span>{org.slug}.platform.com</span>
                            </div>

                            <div className="space-y-3 pt-4 border-t border-gray-100 dark:border-white/5">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-gray-500 dark:text-slate-500">Subscription</span>
                                    <span className="text-blue-400 font-semibold uppercase">{org.subscriptionPlan}</span>
                                </div>
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-gray-500 dark:text-slate-500">Joined</span>
                                    <span className="text-gray-700 dark:text-gray-300">
                                        {new Date(org.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>

                            <div className="mt-6 flex gap-2">
                                <button
                                    onClick={() => handleToggleActive(org)}
                                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-medium transition-all ${org.isActive
                                        ? "bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20"
                                        : "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20"
                                        }`}
                                >
                                    {org.isActive ? <IconCircleX size={16} /> : <IconCircleCheck size={16} />}
                                    {org.isActive ? "Suspend" : "Activate"}
                                </button>
                                <button className="p-2 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:text-white hover:bg-gray-100 dark:bg-white/10 transition-colors">
                                    <IconEdit size={16} />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}
