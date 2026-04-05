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
            className="relative group p-6 rounded-lg border overflow-hidden transition-all duration-300 cursor-pointer h-full"
            style={{ background: 'var(--bg-card)', borderColor: 'var(--border-primary)' }}
        >
            <div className={`absolute inset-0 ${gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
            <div className="relative z-10">
                <div className={`inline-flex p-3 rounded-lg ${gradient} mb-4`}>
                    <Icon className="w-6 h-6 text-white" />
                </div>
                <h4 className="font-semibold mb-2 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                    {title}
                    <IconArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </h4>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{description}</p>
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
        className="flex items-start gap-4 p-4 rounded-lg cursor-pointer transition-colors"
    >
        <div className="p-2.5 rounded-lg bg-accent/20">
            <IconMessageCircle className="w-5 h-5 text-accent" />
        </div>
        <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{query}</p>
            <div className="flex items-center gap-2 mt-1">
                <span className="text-xs" style={{ color: 'var(--text-disabled)' }}>{time}</span>
                <span className="w-1 h-1 rounded-full bg-gray-600" />
                <span className="text-xs text-accent opacity-80">{category}</span>
            </div>
        </div>
        <IconBookmark className="w-4 h-4 text-gray-500 dark:text-slate-500 hover:text-accent transition-colors" />
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
        className="flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border-primary)' }}
    >
        <div className="p-2 rounded-lg bg-accent/20">
            <Icon className="w-4 h-4 text-accent" />
        </div>
        <div className="flex-1">
            <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{title}</p>
            <p className="text-xs" style={{ color: 'var(--text-disabled)' }}>{queries} related queries</p>
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
                className="relative overflow-hidden rounded-3xl border p-8"
                style={{ background: 'var(--gradient-card)', borderColor: 'var(--border-primary)' }}
            >
                {/* Background decorations */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-accent/15 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />

                <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                    <div>
                    <div className="flex items-center gap-2 text-accent mb-1 opacity-80">
                        <IconClock className="w-4 h-4" />
                        <span className="text-sm">Last updated: 2 minutes ago</span>
                    </div>
                        <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                            What would you like to know today?
                        </h1>
                        <p className="max-w-xl" style={{ color: 'var(--text-secondary)' }}>
                            Ask questions about your enterprise knowledge base. I can help with documents, policies, reports, and more.
                        </p>
                    </div>

                    {/* Quick Search */}
                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        className="w-full lg:w-auto"
                    >
                        <Link to="/ask">
                            <div className="flex items-center gap-3 px-6 py-4 rounded-lg transition-colors cursor-pointer" style={{ background: 'var(--bg-input)', border: '1px solid var(--border-primary)' }}>
                                <IconSearch className="w-5 h-5" style={{ color: 'var(--text-muted)' }} />
                                <span style={{ color: 'var(--text-muted)' }}>Ask anything...</span>
                                <div className="flex items-center gap-1 ml-4">
                                    <kbd className="px-2 py-1 text-xs font-medium text-gray-500 dark:text-slate-500 bg-gray-100 dark:bg-white/10 rounded">⌘</kbd>
                                    <kbd className="px-2 py-1 text-xs font-medium text-gray-500 dark:text-slate-500 bg-gray-100 dark:bg-white/10 rounded">K</kbd>
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
                    gradient="bg-accent-gradient"
                    to="/ask"
                />
                <QuickActionCard
                    icon={IconDatabase}
                    title="Knowledge Base"
                    description="Browse documents and data sources"
                    gradient="bg-accent-gradient"
                    to="/knowledge"
                />
                <QuickActionCard
                    icon={IconHistory}
                    title="Query History"
                    description="View and revisit your past conversations"
                    gradient="bg-accent-gradient"
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
                    className="lg:col-span-2 p-6 rounded-lg border backdrop-blur-xl"
                    style={{ background: 'var(--bg-card)', borderColor: 'var(--border-primary)' }}
                >
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-accent/20">
                                <IconHistory className="w-5 h-5 text-accent" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Recent Queries</h3>
                                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Your conversation history</p>
                            </div>
                        </div>
                        <Link to="/history" className="text-sm text-accent hover:opacity-80 transition-colors">
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
                    className="p-6 rounded-lg border backdrop-blur-xl"
                    style={{ background: 'var(--bg-card)', borderColor: 'var(--border-primary)' }}
                >
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-amber-500/20 to-orange-500/20">
                            <IconBulb className="w-5 h-5 text-amber-400" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Popular Topics</h3>
                            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Trending in your org</p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        {suggestedTopics.map((topic, index) => (
                            <SuggestedTopic key={index} {...topic} />
                        ))}
                    </div>

                    <div className="mt-6 p-4 rounded-lg bg-accent/10 border border-accent/30">
                        <div className="flex items-center gap-2 mb-2">
                            <IconStar className="w-4 h-4 text-amber-400" />
                            <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Pro Tip</span>
                        </div>
                        <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
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
                className="relative overflow-hidden rounded-lg p-6"
                style={{ border: '1px solid var(--border-primary)', background: 'var(--gradient-card)' }}
            >
                <div className="absolute inset-0 bg-accent/10" />
                <div className="absolute top-0 right-0 w-64 h-64 bg-accent/20 rounded-full blur-2xl" />

                <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-lg bg-accent-gradient animate-float">
                            <IconSparkles className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h4 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Need help getting started?</h4>
                            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                                Ask me anything about company policies, documentation, or reports.
                            </p>
                        </div>
                    </div>
                    <Link to="/ask">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="px-6 py-2.5 bg-accent-gradient rounded-lg text-sm font-medium text-white shadow-accent whitespace-nowrap"
                        >
                            Start Chatting
                        </motion.button>
                    </Link>
                </div>
            </motion.div>
        </div>
    );
}
