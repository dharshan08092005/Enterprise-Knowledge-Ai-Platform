import { getUserRole } from "@/lib/auth";
import AdminDashboard from "./AdminDashboard";
import AuditorDashboard from "./AuditorDashboard";
import UserDashboard from "./UserDashboard";

/**
 * Smart Dashboard component that renders the appropriate dashboard
 * based on the user's role (ADMIN, AUDITOR, or USER)
 */
export default function DashboardPage() {
  const role = getUserRole();

  switch (role) {
    case "ADMIN":
      return <AdminDashboard />;
    case "AUDITOR":
      return <AuditorDashboard />;
    case "USER":
    default:
      return <UserDashboard />;
  }
}
