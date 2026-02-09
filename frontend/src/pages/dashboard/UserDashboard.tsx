import { motion } from "motion/react";
import {
    IconMessageCircle,
    IconDatabase,
    IconClock,
    IconSparkles,
    IconArrowUpRight,
    IconFileText,
    IconSearch,
    IconBulb,
    IconHistory,
    IconBookmark,
    IconStar,
} from "@tabler/icons-react";
import { Link } from "react-router-dom";

// Quick Action Card
const QuickActionCard = ({
    icon: Icon,
    title,
    description,
    gradient,
    to,
}: {
    icon: React.ElementType;
    title: string;
    description: string;
    gradient: string;
    to: string;
}) => (
    <Link to={to}>
        <motion.div
            whileHover={{ scale: 1.02, y: -4 }}
            whileTap={{ scale: 0.98 }}
            className="relative group p-6 rounded-2xl bg-white/5 border border-white/10 overflow-hidden hover:border-purple-500/30 transition-all duration-300 cursor-pointer h-full"
        >
            <div className={`absolute inset-0 ${gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
            <div className="relative z-10">
                <div className={`inline-flex p-3 rounded-xl ${gradient} mb-4`}>
                    <Icon className="w-6 h-6 text-white" />
                </div>
                <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
                    {title}
                    <IconArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </h4>
                <p className="text-sm text-gray-400">{description}</p>
            </div>
        </motion.div>
    </Link>
);

// Recent Query Item
const RecentQueryItem = ({
    query,
    time,
    category,
}: {
    query: string;
    time: string;
    category: string;
}) => (
    <motion.div
        whileHover={{ x: 4, backgroundColor: "rgba(255,255,255,0.05)" }}
        className="flex items-start gap-4 p-4 rounded-xl cursor-pointer transition-colors"
    >
        <div className="p-2.5 rounded-xl bg-purple-500/20">
            <IconMessageCircle className="w-5 h-5 text-purple-400" />
        </div>
        <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{query}</p>
            <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-gray-500">{time}</span>
                <span className="w-1 h-1 rounded-full bg-gray-600" />
                <span className="text-xs text-purple-400">{category}</span>
            </div>
        </div>
        <IconBookmark className="w-4 h-4 text-gray-500 hover:text-purple-400 transition-colors" />
    </motion.div>
);

// Suggested Topic
const SuggestedTopic = ({
    title,
    queries,
    icon: Icon,
}: {
    title: string;
    queries: number;
    icon: React.ElementType;
}) => (
    <motion.div
        whileHover={{ scale: 1.02 }}
        className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 hover:border-purple-500/30 cursor-pointer transition-all"
    >
        <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20">
            <Icon className="w-4 h-4 text-purple-400" />
        </div>
        <div className="flex-1">
            <p className="text-sm font-medium text-white">{title}</p>
            <p className="text-xs text-gray-500">{queries} related queries</p>
        </div>
    </motion.div>
);

export default function UserDashboard() {
    const recentQueries = [
        { query: "What are the Q4 revenue projections?", time: "10 min ago", category: "Finance" },
        { query: "Summarize the latest product updates", time: "1 hour ago", category: "Product" },
        { query: "Company policy on remote work", time: "2 hours ago", category: "HR" },
        { query: "Technical documentation for API v2", time: "Yesterday", category: "Engineering" },
    ];

    const suggestedTopics = [
        { title: "Financial Reports", queries: 156, icon: IconFileText },
        { title: "Product Documentation", queries: 89, icon: IconDatabase },
        { title: "HR Policies", queries: 45, icon: IconBulb },
    ];

    return (
        <div className="space-y-8">
            {/* Welcome Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-600/20 via-pink-600/20 to-blue-600/20 border border-white/10 p-8"
            >
                {/* Background decorations */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-pink-500/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

                <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-2 text-purple-300 mb-2">
                            <IconClock className="w-4 h-4" />
                            <span className="text-sm">Good morning</span>
                        </div>
                        <h1 className="text-3xl font-bold text-white mb-2">
                            What would you like to know today?
                        </h1>
                        <p className="text-gray-400 max-w-xl">
                            Ask questions about your enterprise knowledge base. I can help with documents, policies, reports, and more.
                        </p>
                    </div>

                    {/* Quick Search */}
                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        className="w-full lg:w-auto"
                    >
                        <Link to="/ask">
                            <div className="flex items-center gap-3 px-6 py-4 bg-white/10 border border-white/20 rounded-2xl hover:bg-white/15 transition-colors cursor-pointer">
                                <IconSearch className="w-5 h-5 text-gray-400" />
                                <span className="text-gray-400">Ask anything...</span>
                                <div className="flex items-center gap-1 ml-4">
                                    <kbd className="px-2 py-1 text-xs font-medium text-gray-500 bg-white/10 rounded">⌘</kbd>
                                    <kbd className="px-2 py-1 text-xs font-medium text-gray-500 bg-white/10 rounded">K</kbd>
                                </div>
                            </div>
                        </Link>
                    </motion.div>
                </div>
            </motion.div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <QuickActionCard
                    icon={IconSparkles}
                    title="Ask AI"
                    description="Start a conversation with your enterprise AI assistant"
                    gradient="bg-gradient-to-br from-purple-500 to-pink-500"
                    to="/ask"
                />
                <QuickActionCard
                    icon={IconDatabase}
                    title="Knowledge Base"
                    description="Browse documents and data sources"
                    gradient="bg-gradient-to-br from-blue-500 to-cyan-500"
                    to="/knowledge"
                />
                <QuickActionCard
                    icon={IconHistory}
                    title="Query History"
                    description="View and revisit your past conversations"
                    gradient="bg-gradient-to-br from-emerald-500 to-teal-500"
                    to="/history"
                />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Queries */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="lg:col-span-2 p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl"
                >
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20">
                                <IconHistory className="w-5 h-5 text-purple-400" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-white">Recent Queries</h3>
                                <p className="text-sm text-gray-400">Your conversation history</p>
                            </div>
                        </div>
                        <Link to="/history" className="text-sm text-purple-400 hover:text-purple-300 transition-colors">
                            View all
                        </Link>
                    </div>

                    <div className="space-y-1">
                        {recentQueries.map((query, index) => (
                            <RecentQueryItem key={index} {...query} />
                        ))}
                    </div>
                </motion.div>

                {/* Suggested Topics */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl"
                >
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20">
                            <IconBulb className="w-5 h-5 text-amber-400" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-white">Popular Topics</h3>
                            <p className="text-sm text-gray-400">Trending in your org</p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        {suggestedTopics.map((topic, index) => (
                            <SuggestedTopic key={index} {...topic} />
                        ))}
                    </div>

                    <div className="mt-6 p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20">
                        <div className="flex items-center gap-2 mb-2">
                            <IconStar className="w-4 h-4 text-amber-400" />
                            <span className="text-sm font-medium text-white">Pro Tip</span>
                        </div>
                        <p className="text-xs text-gray-400">
                            Try asking follow-up questions to get more detailed answers from the AI.
                        </p>
                    </div>
                </motion.div>
            </div>

            {/* AI Assistant Banner */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="relative overflow-hidden rounded-2xl border border-purple-500/20 p-6"
            >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 via-pink-600/10 to-blue-600/10" />
                <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl" />

                <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 animate-float">
                            <IconSparkles className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h4 className="font-semibold text-white">Need help getting started?</h4>
                            <p className="text-sm text-gray-400">
                                Ask me anything about company policies, documentation, or reports.
                            </p>
                        </div>
                    </div>
                    <Link to="/ask">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl text-sm font-medium text-white shadow-lg shadow-purple-500/25 whitespace-nowrap"
                        >
                            Start Chatting
                        </motion.button>
                    </Link>
                </div>
            </motion.div>
        </div>
    );
}
