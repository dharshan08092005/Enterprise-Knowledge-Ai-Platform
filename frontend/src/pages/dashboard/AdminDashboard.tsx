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
    <div className="absolute inset-0 bg-accent/20 rounded-lg blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    <div className="relative p-6 rounded-lg border backdrop-blur-xl overflow-hidden" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-primary)' }}>
      {/* Background gradient orb */}
      <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full ${gradient} opacity-20 blur-2xl`} />

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className={`p-3 rounded-lg ${gradient}`}>
            <Icon className="w-6 h-6 text-gray-900 dark:text-white" />
          </div>
          <button className="p-1.5 rounded-lg hover:bg-gray-100 dark:bg-white/10 transition-colors">
            <IconDots className="w-4 h-4 text-gray-500 dark:text-slate-400" />
          </button>
        </div>

        <h3 className="text-sm font-medium mb-1" style={{ color: 'var(--text-muted)' }}>{title}</h3>
        <div className="flex items-end justify-between">
          <p className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>{value}</p>
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
    className="flex items-start gap-4 p-4 rounded-lg hover:bg-white dark:bg-white/5 transition-colors cursor-pointer"
  >
    <div className={`p-2.5 rounded-lg ${iconBg}`}>
      <Icon className="w-5 h-5 text-gray-900 dark:text-white" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{title}</p>
      <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{description}</p>
    </div>
    <span className="text-xs whitespace-nowrap" style={{ color: 'var(--text-disabled)' }}>{time}</span>
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
        className="flex-1 rounded-t bg-accent-gradient opacity-80 hover:opacity-100 transition-opacity"
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
    className="relative group p-5 rounded-lg border text-left overflow-hidden transition-colors"
    style={{ background: 'var(--bg-card)', borderColor: 'var(--border-primary)' }}
  >
    <div className={`absolute inset-0 ${gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
    <div className="relative z-10">
      <div className={`inline-flex p-2.5 rounded-lg ${gradient} mb-3`}>
        <Icon className="w-5 h-5 text-gray-900 dark:text-white" />
      </div>
      <h4 className="font-medium mb-1" style={{ color: 'var(--text-primary)' }}>{title}</h4>
      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{description}</p>
    </div>
  </motion.button>
);

import React, { useEffect, useState } from "react";
import dashboardService from "@/services/dashboardService";
import type { AdminDashboardData } from "@/services/dashboardService";
import { formatDistanceToNow } from "date-fns";
import { getUserFromToken } from "@/lib/auth";

export default function AdminDashboard() {
  const user = getUserFromToken();
  const userName = user?.name || "Admin";

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };
  const greeting = getGreeting();
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await dashboardService.getAdminStats();
        setData(res);
      } catch (error) {
        console.error("Failed to fetch admin stats:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const defaultStats = [
    {
      title: "Total Queries",
      value: "Loading...",
      change: "0%",
      changeType: "up" as const,
      icon: IconMessageCircle,
      gradient: "bg-accent-gradient",
    },
    {
      title: "Knowledge Items",
      value: "Loading...",
      change: "0%",
      changeType: "up" as const,
      icon: IconDatabase,
      gradient: "bg-accent-gradient",
    },
    {
      title: "Total Users",
      value: "Loading...",
      change: "0",
      changeType: "up" as const,
      icon: IconBrain,
      gradient: "bg-gradient-to-br from-sky-500 to-rose-500",
    },
    {
      title: "Organizations",
      value: "Loading...",
      change: "0",
      changeType: "up" as const,
      icon: IconTrendingUp,
      gradient: "bg-gradient-to-br from-amber-500 to-orange-500",
    },
  ];

  const stats = data ? data.stats.map((stat, i) => ({
    ...stat,
    icon: defaultStats[i % defaultStats.length].icon,
    gradient: defaultStats[i % defaultStats.length].gradient
  })) : defaultStats;

  const defaultRecentActivity = [
    {
      icon: IconFileText,
      title: "No recent activity",
      description: "Data will appear here once actions are taken",
      time: "",
      iconBg: "bg-accent-gradient",
    }
  ];

  const recentActivity = data && data.recentActivity.length > 0 ? data.recentActivity.map((activity, i) => ({
    icon: i % 2 === 0 ? IconFileText : IconBrain,
    iconBg: i % 2 === 0 ? "bg-accent-gradient" : "bg-gradient-to-br from-emerald-500 to-teal-500",
    title: activity.title,
    description: activity.description,
    time: activity.time ? formatDistanceToNow(new Date(activity.time), { addSuffix: true }) : ""
  })) : defaultRecentActivity;

  const quickActions = [
    {
      icon: IconSparkles,
      title: "Ask AI",
      description: "Start a conversation with AI",
      gradient: "bg-accent-gradient",
    },
    {
      icon: IconDatabase,
      title: "Add Knowledge",
      description: "Upload documents or data",
      gradient: "bg-accent-gradient",
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
        className="relative overflow-hidden rounded-3xl border p-8"
        style={{ background: 'var(--gradient-card)', borderColor: 'var(--border-primary)' }}
      >
        {/* Background decorations */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent/15 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/20 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />

        <div className="relative z-10">
          <div className="flex items-center gap-2 text-accent mb-2 opacity-80">
            <IconClock className="w-4 h-4" />
            <span className="text-sm">{greeting}</span>
          </div>
          <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
            Welcome back, <span className="gradient-text">{userName}</span> 👋
          </h1>
          <p className="max-w-xl" style={{ color: 'var(--text-secondary)' }}>
            Your enterprise AI platform is running smoothly. You have{" "}
            <span className="text-accent font-medium">{data?.recentActivity?.length || 0} recent activities</span> and{" "}
            <span className="text-emerald-400 font-medium">{data?.stats?.length || 0} key metrics</span> waiting for you.
          </p>

          <div className="flex flex-wrap gap-3 mt-6">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-2.5 bg-accent-gradient rounded-lg text-sm font-medium text-white shadow-accent transition-shadow"
            >
              Start Exploring
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-2.5 bg-gray-100 dark:bg-white/10 border border-gray-300 dark:border-white/20 rounded-lg text-sm font-medium text-gray-900 dark:text-white hover:bg-white/20 transition-colors"
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
          className="lg:col-span-2 p-6 rounded-lg border backdrop-blur-xl"
          style={{ background: 'var(--bg-card)', borderColor: 'var(--border-primary)' }}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Query Analytics</h3>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Last 30 days performance</p>
            </div>
            <div className="flex items-center gap-2">
              <button className="px-3 py-1.5 text-xs font-medium text-accent bg-accent/20 rounded-lg border border-accent/30">
                Daily
              </button>
              <button className="px-3 py-1.5 text-xs font-medium text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:text-white hover:bg-gray-100 dark:bg-white/10 rounded-lg transition-colors">
                Weekly
              </button>
              <button className="px-3 py-1.5 text-xs font-medium text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:text-white hover:bg-gray-100 dark:bg-white/10 rounded-lg transition-colors">
                Monthly
              </button>
            </div>
          </div>

          <div className="h-64 flex flex-col justify-end">
            <MiniChart />
          </div>

          <div className="grid grid-cols-3 gap-4 mt-6 pt-6" style={{ borderTop: '1px solid var(--border-primary)' }}>
            <div>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Total Queries</p>
              <p className="text-2xl font-bold mt-1" style={{ color: 'var(--text-primary)' }}>45.2K</p>
            </div>
            <div>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Avg. Response Time</p>
              <p className="text-2xl font-bold mt-1" style={{ color: 'var(--text-primary)' }}>1.2s</p>
            </div>
            <div>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Satisfaction Rate</p>
              <p className="text-2xl font-bold mt-1" style={{ color: 'var(--text-primary)' }}>98.5%</p>
            </div>
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="p-6 rounded-lg border backdrop-blur-xl"
          style={{ background: 'var(--bg-card)', borderColor: 'var(--border-primary)' }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Recent Activity</h3>
            <button className="text-sm text-accent hover:opacity-80 transition-colors">
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
        <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Quick Actions</h3>
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
        className="relative overflow-hidden rounded-lg p-6"
        style={{ border: '1px solid var(--border-primary)', background: 'var(--gradient-card)' }}
      >
        <div className="absolute inset-0 bg-accent/5 backdrop-blur-sm" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/20 rounded-full blur-2xl" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-accent-gradient animate-float">
              <IconSparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h4 className="font-semibold" style={{ color: 'var(--text-primary)' }}>AI-Powered Insights Available</h4>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                We've analyzed your data and found 5 actionable insights to improve efficiency.
              </p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-2.5 bg-accent-gradient rounded-lg text-sm font-medium text-white shadow-accent whitespace-nowrap"
          >
            View Insights
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
