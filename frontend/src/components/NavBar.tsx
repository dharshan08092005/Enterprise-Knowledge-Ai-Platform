import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
    IconSearch,
    IconBell,
    IconSettings,
    IconChevronDown,
    IconMoon,
    IconSun,
    IconLogout,
    IconUser,
    IconSparkles,
} from "@tabler/icons-react";
import { getUserFromToken, logout } from "@/lib/auth";
import { Link } from "react-router-dom";
import { useTheme } from "@/lib/ThemeContext";

interface NavBarProps {
    title?: string;
    subtitle?: string;
}

export default function NavBar({ title = "Dashboard", subtitle }: NavBarProps) {
    const [showNotifications, setShowNotifications] = useState(false);
    const [showProfile, setShowProfile] = useState(false);
    const [searchFocused, setSearchFocused] = useState(false);
    const { isDark, toggleTheme } = useTheme();

    // Get user info from JWT token
    const user = getUserFromToken();
    const userName = user?.name || user?.email?.split('@')[0] || 'User';
    const userEmail = user?.email || 'user@example.com';
    const userRole = user?.role || 'USER';
    const userInitial = userName.charAt(0).toUpperCase();

    const notifications = [
        {
            id: 1,
            title: "New AI Model Available",
            message: "GPT-4 Turbo is ready for deployment",
            time: "2 min ago",
            unread: true,
            type: "success",
        },
        {
            id: 2,
            title: "Knowledge Base Updated",
            message: "15 new documents processed successfully",
            time: "1 hour ago",
            unread: true,
            type: "info",
        },
        {
            id: 3,
            title: "System Alert",
            message: "High API usage detected on Project Alpha",
            time: "3 hours ago",
            unread: false,
            type: "warning",
        },
    ];

    const unreadCount = notifications.filter((n) => n.unread).length;

    return (
        <header className="h-16 px-6 flex items-center justify-between glass-dark border-b sticky top-0 z-40" style={{ borderColor: 'var(--border-secondary)', background: 'var(--bg-navbar)' }}>
            {/* Left Section - Title */}
            <div className="flex items-center gap-4">
                <div>
                    <h1 className="text-lg font-semibold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                        {title}
                        {title === "Dashboard" && (
                            <span className="px-2 py-0.5 text-xs font-medium rounded-full" style={{ background: 'var(--badge-bg)', color: 'var(--badge-text)', border: '1px solid var(--badge-border)' }}>
                                Pro
                            </span>
                        )}
                    </h1>
                    {subtitle && (
                        <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{subtitle}</p>
                    )}
                </div>
            </div>

            {/* Center Section - Search */}
            <div className="flex-1 max-w-xl mx-8 hidden md:block">
                <motion.div
                    className={`relative transition-all duration-300 ${searchFocused ? "scale-105" : ""
                        }`}
                >
                    <div
                        className={`absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 blur-xl transition-opacity duration-300 ${searchFocused ? "opacity-100" : "opacity-0"
                            }`}
                    />
                    <div className="relative flex items-center">
                        <IconSearch className="absolute left-4 w-5 h-5" style={{ color: 'var(--text-muted)' }} />
                        <input
                            type="text"
                            placeholder="Search anything... ⌘K"
                            className="w-full pl-12 pr-4 py-2.5 rounded-xl text-sm focus:outline-none transition-all duration-300"
                            style={{ background: 'var(--bg-input)', border: '1px solid var(--border-primary)', color: 'var(--text-primary)' }}
                            onFocus={() => setSearchFocused(true)}
                            onBlur={() => setSearchFocused(false)}
                        />
                        <div className="absolute right-3 flex items-center gap-1">
                            <kbd className="px-2 py-1 text-xs font-medium text-gray-500 bg-white/5 rounded border border-white/10">
                                ⌘
                            </kbd>
                            <kbd className="px-2 py-1 text-xs font-medium text-gray-500 bg-white/5 rounded border border-white/10">
                                K
                            </kbd>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Right Section - Actions */}
            <div className="flex items-center gap-2">
                {/* AI Assistant Button */}
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl text-sm font-medium text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-shadow duration-300"
                >
                    <IconSparkles className="w-4 h-4" />
                    <span>Ask AI</span>
                </motion.button>

                {/* Theme Toggle */}
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={toggleTheme}
                    className="p-2.5 rounded-xl transition-all duration-300"
                    style={{ background: 'var(--bg-card)', border: '1px solid var(--border-primary)', color: 'var(--text-secondary)' }}
                    title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                >
                    {isDark ? (
                        <IconSun className="w-5 h-5 text-amber-400" />
                    ) : (
                        <IconMoon className="w-5 h-5 text-indigo-500" />
                    )}
                </motion.button>

                {/* Notifications */}
                <div className="relative">
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => {
                            setShowNotifications(!showNotifications);
                            setShowProfile(false);
                        }}
                        className="relative p-2.5 rounded-xl transition-all duration-300"
                        style={{ background: 'var(--bg-card)', border: '1px solid var(--border-primary)', color: 'var(--text-secondary)' }}
                    >
                        <IconBell className="w-5 h-5" />
                        {unreadCount > 0 && (
                            <span className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center text-xs font-bold text-white bg-gradient-to-r from-pink-500 to-red-500 rounded-full">
                                {unreadCount}
                            </span>
                        )}
                    </motion.button>

                    <AnimatePresence>
                        {showNotifications && (
                            <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                transition={{ duration: 0.2 }}
                                className="absolute right-0 mt-2 w-80 rounded-2xl shadow-2xl overflow-hidden"
                                style={{ background: 'var(--bg-modal)', border: '1px solid var(--border-primary)' }}
                            >
                                <div className="p-4" style={{ borderBottom: '1px solid var(--border-primary)' }}>
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Notifications</h3>
                                        <span className="text-xs cursor-pointer" style={{ color: 'var(--accent-primary)' }}>
                                            Mark all as read
                                        </span>
                                    </div>
                                </div>
                                <div className="max-h-80 overflow-y-auto">
                                    {notifications.map((notification) => (
                                        <motion.div
                                            key={notification.id}
                                            whileHover={{ backgroundColor: "rgba(255,255,255,0.05)" }}
                                            className={`p-4 cursor-pointer ${notification.unread ? "bg-purple-500/5" : ""
                                                }`}
                                            style={{ borderBottom: '1px solid var(--border-secondary)' }}
                                        >
                                            <div className="flex gap-3">
                                                <div
                                                    className={`w-2 h-2 mt-2 rounded-full flex-shrink-0 ${notification.type === "success"
                                                        ? "status-online"
                                                        : notification.type === "warning"
                                                            ? "status-warning"
                                                            : "bg-purple-500"
                                                        }`}
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                                                        {notification.title}
                                                    </p>
                                                    <p className="text-xs mt-0.5 line-clamp-2" style={{ color: 'var(--text-muted)' }}>
                                                        {notification.message}
                                                    </p>
                                                    <p className="text-xs mt-1" style={{ color: 'var(--text-disabled)' }}>
                                                        {notification.time}
                                                    </p>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                                <div className="p-3" style={{ borderTop: '1px solid var(--border-primary)' }}>
                                    <button className="w-full py-2 text-sm font-medium text-purple-400 hover:text-purple-300 transition-colors">
                                        View all notifications
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Settings */}
                <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-2.5 rounded-xl transition-all duration-300"
                    style={{ background: 'var(--bg-card)', border: '1px solid var(--border-primary)', color: 'var(--text-secondary)' }}
                >
                    <IconSettings className="w-5 h-5" />
                </motion.button>

                {/* Profile Dropdown */}
                <div className="relative ml-2">
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                            setShowProfile(!showProfile);
                            setShowNotifications(false);
                        }}
                        className="flex items-center gap-3 pl-3 pr-2 py-1.5 rounded-xl transition-all duration-300"
                        style={{ background: 'var(--bg-card)', border: '1px solid var(--border-primary)' }}
                    >
                        <div className="relative">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-sm font-semibold text-white">
                                {userInitial}
                            </div>
                            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full status-online" style={{ border: '2px solid var(--bg-navbar)' }} />
                        </div>
                        <div className="hidden sm:block text-left">
                            <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{userName}</p>
                            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{userRole}</p>
                        </div>
                        <IconChevronDown
                            className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${showProfile ? "rotate-180" : ""
                                }`}
                        />
                    </motion.button>

                    <AnimatePresence>
                        {showProfile && (
                            <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                transition={{ duration: 0.2 }}
                                className="absolute right-0 mt-2 w-56 rounded-2xl shadow-2xl overflow-hidden"
                                style={{ background: 'var(--bg-modal)', border: '1px solid var(--border-primary)' }}
                            >
                                <div className="p-4" style={{ borderBottom: '1px solid var(--border-primary)' }}>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg font-semibold text-white" style={{ background: 'var(--avatar-gradient)' }}>
                                            {userInitial}
                                        </div>
                                        <div>
                                            <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{userName}</p>
                                            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                                                {userEmail}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-2">
                                    <Link to="/profile">
                                        <motion.button
                                            whileHover={{ backgroundColor: 'var(--bg-card-hover)' }}
                                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors"
                                            style={{ color: 'var(--text-secondary)' }}
                                        >
                                            <IconUser className="w-4 h-4" />
                                            <span>View Profile</span>
                                        </motion.button>
                                    </Link>
                                    <Link to="/settings">
                                        <motion.button
                                            whileHover={{ backgroundColor: 'var(--bg-card-hover)' }}
                                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors"
                                            style={{ color: 'var(--text-secondary)' }}
                                        >
                                            <IconSettings className="w-4 h-4" />
                                            <span>Settings</span>
                                        </motion.button>
                                    </Link>
                                </div>
                                <div className="p-2" style={{ borderTop: '1px solid var(--border-primary)' }}>
                                    <motion.button
                                        whileHover={{ backgroundColor: "rgba(239,68,68,0.1)" }}
                                        onClick={logout}
                                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-400 hover:text-red-300 transition-colors"
                                    >
                                        <IconLogout className="w-4 h-4" />
                                        <span>Sign Out</span>
                                    </motion.button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </header>
    );
}
