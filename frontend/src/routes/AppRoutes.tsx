import { Routes, Route } from "react-router-dom";
import AuthLayout from "@/layouts/AuthLayout";
import DashboardLayout from "@/layouts/DashboardLayout";

import LoginPage from "@/pages/auth/LoginPage";
import DashboardPage from "@/pages/dashboard/DashboardPage";
import AskAI from "@/pages/ask/AskAi";
import KnowledgeBase from "@/pages/knowledge/knowledgeBase";
import SignUp from "@/pages/auth/SignUp";
import ProtectedLayout from "@/layouts/ProtectedLayout";

// Admin pages
import ManageUsersPage from "@/pages/admin/ManageUsersPage";
import ManageAuditorsPage from "@/pages/admin/ManageAuditorsPage";
import AuditLogsPage from "@/pages/admin/AuditLogsPage";
import AdminSettingsPage from "@/pages/admin/AdminSettingsPage";

// Documents page
import DocumentsPage from "@/pages/documents/DocumentsPage";

export default function AppRoutes() {
  return (
    <Routes>
      {/* Auth routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUp />} />
      </Route>

      {/* Protected routes */}
      <Route element={<ProtectedLayout />}>
        <Route element={<DashboardLayout />}>
          {/* Main routes */}
          <Route path="/" element={<DashboardPage />} />
          <Route path="/ask" element={<AskAI />} />
          <Route path="/knowledge" element={<KnowledgeBase />} />
          <Route path="/documents" element={<DocumentsPage />} />

          {/* Admin routes */}
          <Route path="/manage-users" element={<ManageUsersPage />} />
          <Route path="/manage-auditors" element={<ManageAuditorsPage />} />
          <Route path="/audit" element={<AuditLogsPage />} />
          <Route path="/admin-settings" element={<AdminSettingsPage />} />
        </Route>
      </Route>
    </Routes>
  );
}
