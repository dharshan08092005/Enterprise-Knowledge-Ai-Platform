import { motion } from "motion/react";
import {
  IconBrain,
  IconDatabase,
  IconMessageCircle,
  IconTrendingUp,
  IconArrowUpRight,
  IconArrowDownRight,
  IconDots,
  IconSparkles,
  IconClock,
  IconUsers,
  IconFileText,
  IconChartBar,
} from "@tabler/icons-react";

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
  changeType: "up" | "down";
  icon: React.ElementType;
  gradient: string;
  delay?: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    whileHover={{ y: -4, scale: 1.02 }}
    className="relative group"
  >
    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    <div className="relative p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl overflow-hidden">
      {/* Background gradient orb */}
      <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full ${gradient} opacity-20 blur-3xl`} />

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className={`p-3 rounded-xl ${gradient}`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          <button className="p-1.5 rounded-lg hover:bg-white/10 transition-colors">
            <IconDots className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        <h3 className="text-sm font-medium text-gray-400 mb-1">{title}</h3>
        <div className="flex items-end justify-between">
          <p className="text-3xl font-bold text-white">{value}</p>
          <div className={`flex items-center gap-1 text-sm ${changeType === "up" ? "text-emerald-400" : "text-red-400"
            }`}>
            {changeType === "up" ? (
              <IconArrowUpRight className="w-4 h-4" />
            ) : (
              <IconArrowDownRight className="w-4 h-4" />
            )}
            <span>{change}</span>
          </div>
        </div>
      </div>
    </div>
  </motion.div>
);

// Activity Item Component
const ActivityItem = ({
  icon: Icon,
  title,
  description,
  time,
  iconBg,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  time: string;
  iconBg: string;
}) => (
  <motion.div
    whileHover={{ x: 4 }}
    className="flex items-start gap-4 p-4 rounded-xl hover:bg-white/5 transition-colors cursor-pointer"
  >
    <div className={`p-2.5 rounded-xl ${iconBg}`}>
      <Icon className="w-5 h-5 text-white" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium text-white truncate">{title}</p>
      <p className="text-xs text-gray-400 mt-0.5">{description}</p>
    </div>
    <span className="text-xs text-gray-500 whitespace-nowrap">{time}</span>
  </motion.div>
);

// Mini Chart Component (Visual representation)
const MiniChart = () => (
  <div className="flex items-end gap-1 h-16">
    {[40, 70, 45, 90, 65, 80, 55, 95, 70, 85, 60, 75].map((height, i) => (
      <motion.div
        key={i}
        initial={{ height: 0 }}
        animate={{ height: `${height}%` }}
        transition={{ duration: 0.5, delay: i * 0.05 }}
        className="flex-1 rounded-t bg-gradient-to-t from-purple-500 to-pink-500 opacity-80 hover:opacity-100 transition-opacity"
      />
    ))}
  </div>
);

// Quick Action Card
const QuickActionCard = ({
  icon: Icon,
  title,
  description,
  gradient,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  gradient: string;
}) => (
  <motion.button
    whileHover={{ scale: 1.02, y: -2 }}
    whileTap={{ scale: 0.98 }}
    className="relative group p-5 rounded-2xl bg-white/5 border border-white/10 text-left overflow-hidden hover:border-purple-500/30 transition-colors"
  >
    <div className={`absolute inset-0 ${gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
    <div className="relative z-10">
      <div className={`inline-flex p-2.5 rounded-xl ${gradient} mb-3`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <h4 className="font-medium text-white mb-1">{title}</h4>
      <p className="text-xs text-gray-400">{description}</p>
    </div>
  </motion.button>
);

export default function AdminDashboard() {
  const stats = [
    {
      title: "Total Queries",
      value: "12,847",
      change: "+12.5%",
      changeType: "up" as const,
      icon: IconMessageCircle,
      gradient: "bg-gradient-to-br from-purple-500 to-purple-600",
    },
    {
      title: "Knowledge Items",
      value: "1,234",
      change: "+8.2%",
      changeType: "up" as const,
      icon: IconDatabase,
      gradient: "bg-gradient-to-br from-blue-500 to-cyan-500",
    },
    {
      title: "AI Models Active",
      value: "8",
      change: "+2",
      changeType: "up" as const,
      icon: IconBrain,
      gradient: "bg-gradient-to-br from-pink-500 to-rose-500",
    },
    {
      title: "Accuracy Rate",
      value: "94.7%",
      change: "-0.3%",
      changeType: "down" as const,
      icon: IconTrendingUp,
      gradient: "bg-gradient-to-br from-amber-500 to-orange-500",
    },
  ];

  const recentActivity = [
    {
      icon: IconFileText,
      title: "New document uploaded",
      description: "Q4 Financial Report.pdf added to knowledge base",
      time: "2 min ago",
      iconBg: "bg-gradient-to-br from-blue-500 to-cyan-500",
    },
    {
      icon: IconBrain,
      title: "Model training completed",
      description: "GPT-4 fine-tuned on company data",
      time: "1 hour ago",
      iconBg: "bg-gradient-to-br from-purple-500 to-pink-500",
    },
    {
      icon: IconUsers,
      title: "New team member",
      description: "Sarah joined the Enterprise AI team",
      time: "3 hours ago",
      iconBg: "bg-gradient-to-br from-emerald-500 to-teal-500",
    },
    {
      icon: IconMessageCircle,
      title: "1,000 queries milestone",
      description: "Your team reached 1,000 AI queries this month",
      time: "Yesterday",
      iconBg: "bg-gradient-to-br from-amber-500 to-orange-500",
    },
  ];

  const quickActions = [
    {
      icon: IconSparkles,
      title: "Ask AI",
      description: "Start a conversation with AI",
      gradient: "bg-gradient-to-br from-purple-500 to-pink-500",
    },
    {
      icon: IconDatabase,
      title: "Add Knowledge",
      description: "Upload documents or data",
      gradient: "bg-gradient-to-br from-blue-500 to-cyan-500",
    },
    {
      icon: IconBrain,
      title: "Train Model",
      description: "Fine-tune AI models",
      gradient: "bg-gradient-to-br from-emerald-500 to-teal-500",
    },
    {
      icon: IconChartBar,
      title: "View Analytics",
      description: "Check performance metrics",
      gradient: "bg-gradient-to-br from-amber-500 to-orange-500",
    },
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

        <div className="relative z-10">
          <div className="flex items-center gap-2 text-purple-300 mb-2">
            <IconClock className="w-4 h-4" />
            <span className="text-sm">Good morning</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Welcome back, <span className="gradient-text">Dharshan</span> 👋
          </h1>
          <p className="text-gray-400 max-w-xl">
            Your enterprise AI platform is running smoothly. You have{" "}
            <span className="text-purple-400 font-medium">3 pending tasks</span> and{" "}
            <span className="text-emerald-400 font-medium">5 new insights</span> waiting for you.
          </p>

          <div className="flex flex-wrap gap-3 mt-6">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl text-sm font-medium text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-shadow"
            >
              Start Exploring
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-2.5 bg-white/10 border border-white/20 rounded-xl text-sm font-medium text-white hover:bg-white/20 transition-colors"
            >
              View Tutorial
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatCard key={stat.title} {...stat} delay={index * 0.1} />
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Query Analytics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-white">Query Analytics</h3>
              <p className="text-sm text-gray-400">Last 30 days performance</p>
            </div>
            <div className="flex items-center gap-2">
              <button className="px-3 py-1.5 text-xs font-medium text-purple-400 bg-purple-500/20 rounded-lg border border-purple-500/30">
                Daily
              </button>
              <button className="px-3 py-1.5 text-xs font-medium text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                Weekly
              </button>
              <button className="px-3 py-1.5 text-xs font-medium text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                Monthly
              </button>
            </div>
          </div>

          <div className="h-64 flex flex-col justify-end">
            <MiniChart />
          </div>

          <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-white/10">
            <div>
              <p className="text-sm text-gray-400">Total Queries</p>
              <p className="text-2xl font-bold text-white mt-1">45.2K</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Avg. Response Time</p>
              <p className="text-2xl font-bold text-white mt-1">1.2s</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Satisfaction Rate</p>
              <p className="text-2xl font-bold text-white mt-1">98.5%</p>
            </div>
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Recent Activity</h3>
            <button className="text-sm text-purple-400 hover:text-purple-300 transition-colors">
              View all
            </button>
          </div>

          <div className="space-y-1">
            {recentActivity.map((activity, index) => (
              <ActivityItem key={index} {...activity} />
            ))}
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <QuickActionCard key={index} {...action} />
          ))}
        </div>
      </motion.div>

      {/* AI Insights Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
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
              <h4 className="font-semibold text-white">AI-Powered Insights Available</h4>
              <p className="text-sm text-gray-400">
                We've analyzed your data and found 5 actionable insights to improve efficiency.
              </p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl text-sm font-medium text-white shadow-lg shadow-purple-500/25 whitespace-nowrap"
          >
            View Insights
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
