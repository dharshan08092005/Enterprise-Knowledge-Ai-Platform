import { Navigate, Outlet } from "react-router-dom";
import { isAuthenticated } from "@/lib/auth";
import { useEffect } from "react";
import { useTheme } from "@/lib/ThemeContext";
import { getMyOrganization } from "@/services/organizationService";

export default function ProtectedLayout() {
  const authenticated = isAuthenticated();
  const { updateBranding } = useTheme();

  useEffect(() => {
    if (authenticated) {
      getMyOrganization()
        .then((org) => {
          if (org && org.themeColor) {
            updateBranding(org.themeColor);
          }
        })
        .catch((err) => {
          console.error("Failed to sync organization branding:", err);
        });
    }
  }, [authenticated, updateBranding]);

  if (!authenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
