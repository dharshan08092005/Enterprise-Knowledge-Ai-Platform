import apiClient from "./apiClient";

export interface DashboardStats {
  title: string;
  value: string | number;
  change: string;
  changeType: "up" | "down";
}

export interface RecentActivity {
  title: string;
  description: string;
  time: string;
}

export interface AdminDashboardData {
  stats: DashboardStats[];
  recentActivity: RecentActivity[];
}

export interface UserDashboardData {
  recentQueries: {
    query: string;
    time: string;
    category: string;
  }[];
  stats: {
    docsCount: number;
  };
}

const dashboardService = {
  getAdminStats: async (): Promise<AdminDashboardData> => {
    const response = await apiClient.get<AdminDashboardData>("/dashboard/admin");
    return response.data;
  },

  getUserStats: async (): Promise<UserDashboardData> => {
    const response = await apiClient.get<UserDashboardData>("/dashboard/user");
    return response.data;
  },
};

export default dashboardService;
