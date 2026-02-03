import { Routes, Route } from "react-router-dom";
import AuthLayout from "@/layouts/AuthLayout";
import DashboardLayout from "@/layouts/DashboardLayout";

import LoginPage from "@/pages/auth/LoginPage";
import DashboardPage from "@/pages/dashboard/DashboardPage";
import AskAI from "@/pages/ask/AskAi";
import KnowledgeBase from "@/pages/knowledge/KnowledgeBase";
import SignUp from "@/pages/auth/SignUp";
import ProtectedLayout from "@/layouts/ProtectedLayout";

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
          <Route path="/" element={<DashboardPage />} />
          <Route path="/ask" element={<AskAI />} />
          <Route path="/knowledge" element={<KnowledgeBase />} />
        </Route>
      </Route>
    </Routes>
  );
}
