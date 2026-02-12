import { useState } from "react";
import {
  Sidebar,
  SidebarBody,
  SidebarLink,
  SidebarLogo,
  SidebarSection,
  SidebarFooter,
} from "../components/SideBar";
import NavBar from "../components/NavBar";
import {
  IconHome,
  IconBrain,
  IconDatabase,
  IconMessageCircle,
  IconSettings,
  IconUsers,
  IconChartBar,
  IconFolder,
  IconKey,
  IconFileAnalytics,
  IconUserCog,
  IconUserShield,
} from "@tabler/icons-react";
import { Outlet, useLocation } from "react-router-dom";
import { getUserRole } from "@/lib/auth";

export default function DashboardLayout() {
  const [open, setOpen] = useState(true);
  const location = useLocation();
  const userRole = getUserRole();

  // Get page title based on current route
  const getPageInfo = () => {
    switch (location.pathname) {
      case "/":
        return { title: "Dashboard", subtitle: "Welcome back! Here's your overview" };
      case "/ask":
        return { title: "Ask AI", subtitle: "Chat with your enterprise knowledge base" };
      case "/knowledge":
        return { title: "Knowledge Base", subtitle: "Manage your documents and data sources" };
      case "/documents":
        return { title: "Documents", subtitle: "View and manage all uploaded documents" };
      case "/models":
        return { title: "AI Models", subtitle: "Configure and deploy AI models" };
      case "/analytics":
        return { title: "Analytics", subtitle: "Insights and performance metrics" };
      case "/audit":
        return { title: "Audit Logs", subtitle: "System activity and security monitoring" };
      case "/team":
        return { title: "Team", subtitle: "Manage team members and permissions" };
      case "/manage-users":
        return { title: "Manage Users", subtitle: "View and manage all user accounts" };
      case "/manage-auditors":
        return { title: "Manage Auditors", subtitle: "View and manage auditor accounts" };
      case "/settings":
        return { title: "Settings", subtitle: "Configure your platform preferences" };
      case "/admin-settings":
        return { title: "Platform Settings", subtitle: "Configure integrations, security and application behavior" };
      default:
        return { title: "Dashboard", subtitle: "" };
    }
  };

  // Base navigation links (role-aware)
  const mainLinks = [
    { label: "Dashboard", href: "/", icon: <IconHome className="w-5 h-5" /> },
    // Auditors don't get the AI chat — their role is compliance-focused
    ...(userRole !== "AUDITOR"
      ? [{ label: "Ask AI", href: "/ask", icon: <IconMessageCircle className="w-5 h-5" />, badge: "New" }]
      : []),
    { label: "Knowledge Base", href: "/knowledge", icon: <IconDatabase className="w-5 h-5" /> },
    { label: "Documents", href: "/documents", icon: <IconFolder className="w-5 h-5" /> },
  ];

  // Workspace links (Admin only)
  const workspaceLinks = [
    { label: "AI Models", href: "/models", icon: <IconBrain className="w-5 h-5" /> },
    { label: "Analytics", href: "/analytics", icon: <IconChartBar className="w-5 h-5" /> },
  ];

  // Audit links (Auditor and Admin)
  const auditLinks = [
    { label: "Audit Logs", href: "/audit", icon: <IconFileAnalytics className="w-5 h-5" /> },
  ];

  // User Management links (Admin only)
  const userManagementLinks = [
    { label: "Manage Users", href: "/manage-users", icon: <IconUserCog className="w-5 h-5" /> },
    { label: "Manage Auditors", href: "/manage-auditors", icon: <IconUserShield className="w-5 h-5" /> },
  ];

  // Admin links (Admin only)
  const adminLinks = [
    { label: "Team", href: "/team", icon: <IconUsers className="w-5 h-5" /> },
    { label: "API Keys", href: "/api-keys", icon: <IconKey className="w-5 h-5" /> },
    { label: "Platform Settings", href: "/admin-settings", icon: <IconSettings className="w-5 h-5" /> },
  ];

  const pageInfo = getPageInfo();

  return (
    <div className="min-h-screen flex bg-[#0a0a14] text-white overflow-hidden">
      {/* Sidebar */}
      <Sidebar open={open} setOpen={setOpen}>
        <SidebarBody>
          <div className="flex flex-col h-full">
            {/* Logo */}
            <SidebarLogo open={open} />

            {/* Main Navigation */}
            <nav className="flex-1 overflow-y-auto overflow-x-hidden py-2 scrollbar-thin">
              <div className="flex flex-col gap-1">
                {mainLinks.map((link) => (
                  <SidebarLink key={link.href} link={link} />
                ))}
              </div>

              {/* Workspace Section - Admin Only */}
              {userRole === "ADMIN" && (
                <SidebarSection title="Workspace" open={open}>
                  {workspaceLinks.map((link) => (
                    <SidebarLink key={link.href} link={link} />
                  ))}
                </SidebarSection>
              )}

              {/* Audit Section - Auditor and Admin */}
              {(userRole === "AUDITOR" || userRole === "ADMIN") && (
                <SidebarSection title="Audit & Compliance" open={open}>
                  {auditLinks.map((link) => (
                    <SidebarLink key={link.href} link={link} />
                  ))}
                </SidebarSection>
              )}

              {/* User Management Section - Admin Only */}
              {userRole === "ADMIN" && (
                <SidebarSection title="User Management" open={open}>
                  {userManagementLinks.map((link) => (
                    <SidebarLink key={link.href} link={link} />
                  ))}
                </SidebarSection>
              )}

              {/* Administration Section - Admin Only */}
              {userRole === "ADMIN" && (
                <SidebarSection title="Administration" open={open}>
                  {adminLinks.map((link) => (
                    <SidebarLink key={link.href} link={link} />
                  ))}
                </SidebarSection>
              )}

              {/* Settings for Non-Admin Users */}
              {userRole !== "ADMIN" && (
                <SidebarSection title="Account" open={open}>
                  <SidebarLink link={{ label: "Settings", href: "/settings", icon: <IconSettings className="w-5 h-5" /> }} />
                </SidebarSection>
              )}
            </nav>

            {/* Footer */}
            <SidebarFooter open={open} />
          </div>
        </SidebarBody>
      </Sidebar>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Top Navigation Bar */}
        <NavBar title={pageInfo.title} subtitle={pageInfo.subtitle} />

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-y-auto bg-gradient-to-br from-[#0a0a14] via-[#0f0f1a] to-[#0a0a14]">
          <Outlet />
        </main>
      </div>
    </div>
  );
}