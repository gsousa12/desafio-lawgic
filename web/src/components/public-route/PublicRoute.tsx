import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "@/stores/auth/auth.store";

export const PublicOnlyRoute = () => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return isAuthenticated ? (
    <Navigate to="/notifications" replace />
  ) : (
    <Outlet />
  );
};
