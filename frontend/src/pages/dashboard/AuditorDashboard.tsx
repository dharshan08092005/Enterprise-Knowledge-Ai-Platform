import { motion } from "motion/react";
import {
    IconFileAnalytics,
    IconClock,
    IconArrowUpRight,
    IconArrowDownRight,
    IconDots,
    IconEye,
    IconDownload,
    IconFilter,
    IconUsers,
    IconAlertTriangle,
    IconShieldCheck,
    IconActivity,
    IconFileText,
    IconSearch,
    IconChevronRight,
} from "@tabler/icons-react";
import { useState } from "react";

// Stat Card Component
const StatCard = ({
    title,
    value,
    change,
    changeType,
    icon: Icon,
    gradient,
    delay = 0,
}: {
    title: string;
    value: string | number;
    change: string;
    changeType: "up" | "down" | "neutral";
    icon: React.ElementType;
    gradient: string;
    delay?: number;
}) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay }}
        whileHover={{ y: -4 }}
        className="relative group"
    >
        <div className="absolute inset-0 bg-accent/20 rounded-lg blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="relative p-6 rounded-lg bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 backdrop-blur-xl overflow-hidden">
            <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full ${gradient} opacity-20 blur-2xl`} />

            <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-lg ${gradient}`}>
                        <Icon className="w-6 h-6 text-white" />
                    </div>
                    <button className="p-1.5 rounded-lg hover:bg-gray-100 dark:bg-white/10 transition-colors">
                        <IconDots className="w-4 h-4 text-gray-500 dark:text-slate-400" />
                    </button>
                </div>

                <h3 className="text-sm font-medium text-gray-500 dark:text-slate-400 mb-1">{title}</h3>
                <div className="flex items-end justify-between">
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
                    <div className={`flex items-center gap-1 text-sm ${changeType === "up" ? "text-emerald-400" :
                        changeType === "down" ? "text-red-400" : "text-gray-500 dark:text-slate-400"
                        }`}>
                        {changeType === "up" ? (
                            <IconArrowUpRight className="w-4 h-4" />
                        ) : changeType === "down" ? (
                            <IconArrowDownRight className="w-4 h-4" />
                        ) : null}
                        <span>{change}</span>
                    </div>
                </div>
            </div>
        </div>
    </motion.div>
);

// Audit Log Row
const AuditLogRow = ({
    action,
    user,
    resource,
    timestamp,
    status,
}: {
    action: string;
    user: string;
    resource: string;
    timestamp: string;
    status: "success" | "warning" | "error";
}) => (
    <motion.tr
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        whileHover={{ backgroundColor: "rgba(255,255,255,0.02)" }}
        className="border-b border-gray-100 dark:border-white/5 cursor-pointer"
    >
        <td className="py-4 px-4">
            <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${status === "success" ? "bg-emerald-400" :
                    status === "warning" ? "bg-amber-400" : "bg-red-400"
                    }`} />
                <span className="text-sm text-gray-900 dark:text-white font-medium">{action}</span>
            </div>
        </td>
        <td className="py-4 px-4">
            <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-accent-gradient flex items-center justify-center text-xs font-medium text-white">
                    {user.charAt(0)}
                </div>
                <span className="text-sm text-gray-700 dark:text-gray-300">{user}</span>
            </div>
        </td>
        <td className="py-4 px-4">
            <span className="text-sm text-gray-500 dark:text-slate-400">{resource}</span>
        </td>
        <td className="py-4 px-4">
            <span className="text-sm text-gray-500 dark:text-slate-500">{timestamp}</span>
        </td>
        <td className="py-4 px-4">
            <button className="p-1.5 rounded-lg hover:bg-gray-100 dark:bg-white/10 transition-colors">
                <IconEye className="w-4 h-4 text-gray-500 dark:text-slate-400" />
            </button>
        </td>
    </motion.tr>
);

// Security Alert Card
const SecurityAlert = ({
    title,
    description,
    severity,
    time,
}: {
    title: string;
    description: string;
    severity: "high" | "medium" | "low";
    time: string;
}) => (
    <motion.div
        whileHover={{ x: 4 }}
        className={`p-4 rounded-lg border cursor-pointer transition-colors ${severity === "high"
            ? "bg-red-500/10 border-red-500/30 hover:border-red-500/50"
            : severity === "medium"
                ? "bg-amber-500/10 border-amber-500/30 hover:border-amber-500/50"
                : "bg-accent/10 border-accent/30 hover:border-accent/50"
            }`}
    >
        <div className="flex items-start gap-3">
            <div className={`p-2 rounded-lg ${severity === "high" ? "bg-red-500/20" :
                severity === "medium" ? "bg-amber-500/20" : "bg-accent/20"
                }`}>
                <IconAlertTriangle className={`w-4 h-4 ${severity === "high" ? "text-red-400" :
                    severity === "medium" ? "text-amber-400" : "text-accent"
                    }`} />
            </div>
            <div className="flex-1">
                <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">{title}</h4>
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${severity === "high" ? "bg-red-500/20 text-red-300" :
                        severity === "medium" ? "bg-amber-500/20 text-amber-300" : "bg-accent/20 text-accent opacity-80"
                        }`}>
                        {severity.toUpperCase()}
                    </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">{description}</p>
                <p className="text-xs text-gray-500 dark:text-slate-500 mt-2">{time}</p>
            </div>
        </div>
    </motion.div>
);

export default function AuditorDashboard() {
    const [selectedPeriod, setSelectedPeriod] = useState("7d");

    const stats = [
        {
            title: "Total Audit Events",
            value: "24,847",
            change: "+18.2%",
            changeType: "up" as const,
            icon: IconFileAnalytics,
            gradient: "bg-accent-gradient",
        },
        {
            title: "Active Users",
            value: "1,234",
            change: "+5.4%",
            changeType: "up" as const,
            icon: IconUsers,
            gradient: "bg-accent-gradient",
        },
        {
            title: "Security Alerts",
            value: "12",
            change: "-3",
            changeType: "down" as const,
            icon: IconAlertTriangle,
            gradient: "bg-gradient-to-br from-amber-500 to-orange-500",
        },
        {
            title: "Compliance Score",
            value: "98.5%",
            change: "+0.5%",
            changeType: "up" as const,
            icon: IconShieldCheck,
            gradient: "bg-gradient-to-br from-emerald-500 to-teal-500",
        },
    ];

    const auditLogs = [
        { action: "Document Upload", user: "John Doe", resource: "Q4_Report.pdf", timestamp: "2 min ago", status: "success" as const },
        { action: "AI Query", user: "Sarah Smith", resource: "Knowledge Base", timestamp: "5 min ago", status: "success" as const },
        { action: "Failed Login", user: "Unknown", resource: "Auth System", timestamp: "12 min ago", status: "error" as const },
        { action: "Permission Change", user: "Admin", resource: "User: mike@corp.com", timestamp: "1 hour ago", status: "warning" as const },
        { action: "Model Training", user: "System", resource: "GPT-4 Fine-tune", timestamp: "2 hours ago", status: "success" as const },
        { action: "Data Export", user: "Jane Wilson", resource: "Analytics Report", timestamp: "3 hours ago", status: "success" as const },
    ];

    const securityAlerts = [
        { title: "Multiple Failed Logins", description: "5 failed attempts from IP 192.168.1.45", severity: "high" as const, time: "12 min ago" },
        { title: "Unusual Data Access", description: "Large volume of queries from user mike@corp.com", severity: "medium" as const, time: "1 hour ago" },
        { title: "New Device Login", description: "sarah@corp.com logged in from new device", severity: "low" as const, time: "3 hours ago" },
    ];

    return (
        <div className="space-y-8">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
                <div>
                    <div className="flex items-center gap-2 text-accent mb-1 opacity-80">
                        <IconClock className="w-4 h-4" />
                        <span className="text-sm">Last updated: 2 minutes ago</span>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Audit Dashboard</h1>
                    <p className="text-gray-500 dark:text-slate-400 mt-1">Monitor system activity, security events, and compliance</p>
                </div>

                <div className="flex items-center gap-3">
                    {/* Period Selector */}
                    <div className="flex items-center gap-1 p-1 bg-white dark:bg-white/5 rounded-lg border border-gray-200 dark:border-white/10">
                        {["24h", "7d", "30d", "90d"].map((period) => (
                            <button
                                key={period}
                                onClick={() => setSelectedPeriod(period)}
                                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${selectedPeriod === period
                                    ? "bg-accent/20 text-accent font-bold"
                                    : "text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:text-white"
                                    }`}
                            >
                                {period}
                            </button>
                        ))}
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:bg-white/10 transition-colors"
                    >
                        <IconFilter className="w-4 h-4" />
                        Filters
                    </motion.button>

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex items-center gap-2 px-4 py-2 bg-accent-gradient rounded-lg text-sm font-medium text-white shadow-accent"
                    >
                        <IconDownload className="w-4 h-4" />
                        Export
                    </motion.button>
                </div>
            </motion.div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                    <StatCard key={stat.title} {...stat} delay={index * 0.1} />
                ))}
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Audit Logs Table */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="lg:col-span-2 rounded-lg bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 backdrop-blur-xl overflow-hidden"
                >
                    <div className="p-6 border-b border-gray-200 dark:border-white/10">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-accent/20">
                                    <IconActivity className="w-5 h-5 text-accent" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Audit Logs</h3>
                                    <p className="text-sm text-gray-500 dark:text-slate-400">Real-time activity monitoring</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <div className="relative">
                                    <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 dark:text-slate-500" />
                                    <input
                                        type="text"
                                        placeholder="Search logs..."
                                        className="pl-9 pr-4 py-2 w-48 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:border-accent/50"
                                    />
                                </div>
                                <button className="text-sm text-accent hover:opacity-80 transition-colors flex items-center gap-1">
                                    View all
                                    <IconChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-200 dark:border-white/10 text-left">
                                    <th className="py-3 px-4 text-xs font-medium text-gray-500 dark:text-slate-500 uppercase tracking-wider">Action</th>
                                    <th className="py-3 px-4 text-xs font-medium text-gray-500 dark:text-slate-500 uppercase tracking-wider">User</th>
                                    <th className="py-3 px-4 text-xs font-medium text-gray-500 dark:text-slate-500 uppercase tracking-wider">Resource</th>
                                    <th className="py-3 px-4 text-xs font-medium text-gray-500 dark:text-slate-500 uppercase tracking-wider">Time</th>
                                    <th className="py-3 px-4 text-xs font-medium text-gray-500 dark:text-slate-500 uppercase tracking-wider"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {auditLogs.map((log, index) => (
                                    <AuditLogRow key={index} {...log} />
                                ))}
                            </tbody>
                        </table>
                    </div>
                </motion.div>

                {/* Security Alerts */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="p-6 rounded-lg bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 backdrop-blur-xl"
                >
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-gradient-to-br from-red-500/20 to-orange-500/20">
                                <IconAlertTriangle className="w-5 h-5 text-red-400" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Security Alerts</h3>
                                <p className="text-sm text-gray-500 dark:text-slate-400">Requires attention</p>
                            </div>
                        </div>
                        <span className="px-2.5 py-1 text-xs font-medium bg-red-500/20 text-red-300 rounded-full">
                            {securityAlerts.length} Active
                        </span>
                    </div>

                    <div className="space-y-3">
                        {securityAlerts.map((alert, index) => (
                            <SecurityAlert key={index} {...alert} />
                        ))}
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full mt-4 py-2.5 text-sm font-medium text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:text-white bg-white dark:bg-white/5 hover:bg-gray-100 dark:bg-white/10 rounded-lg border border-gray-200 dark:border-white/10 transition-colors"
                    >
                        View All Alerts
                    </motion.button>
                </motion.div>
            </div>

            {/* Quick Reports */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
            >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Reports</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { title: "User Activity Report", icon: IconUsers, color: "accent" },
                        { title: "Security Audit", icon: IconShieldCheck, color: "emerald" },
                        { title: "Compliance Report", icon: IconFileText, color: "accent" },
                        { title: "Access Logs", icon: IconActivity, color: "amber" },
                    ].map((report, index) => (
                        <motion.button
                            key={index}
                            whileHover={{ scale: 1.02, y: -2 }}
                            whileTap={{ scale: 0.98 }}
                            className="flex items-center gap-4 p-4 rounded-lg bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 hover:border-accent/30 transition-all text-left"
                        >
                            <div className={`p-2.5 rounded-lg bg-${report.color === 'accent' ? 'accent/20' : report.color + '-500/20'}`}>
                                <report.icon className={`w-5 h-5 ${report.color === 'accent' ? 'text-accent' : 'text-' + report.color + '-400'}`} />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900 dark:text-white">{report.title}</p>
                                <p className="text-xs text-gray-500 dark:text-slate-500">Generate report</p>
                            </div>
                            <IconDownload className="w-4 h-4 text-gray-500 dark:text-slate-500" />
                        </motion.button>
                    ))}
                </div>
            </motion.div>
        </div>
    );
}
