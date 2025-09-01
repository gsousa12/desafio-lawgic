import { Route, Routes, Navigate } from "react-router-dom";
import { NotFoundPage } from "../not-found-page/NotFoundPage";
import { ProtectedRoute } from "../protected-route/ProtectedRoute";
import { NotificationsPage } from "../../features/notifications/pages/NotificationsPage";
import styles from "./Router.module.scss";
// import { UsersPage } from "../../features/users/pages/UsersPage";
import { LoginPage } from "@/features/auth/pages/LoginPage";
import { useAuthStore } from "@/stores/auth/auth.store";
import { PublicOnlyRoute } from "../public-route/PublicRoute";

const RootRedirect = () => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return (
    <Navigate to={isAuthenticated ? "/notifications" : "/login"} replace />
  );
};

export const Router = () => {
  return (
    <main className={styles.main}>
      <Routes>
        <Route path="/" element={<RootRedirect />} />
        <Route element={<PublicOnlyRoute />}>
          <Route path="/login" element={<LoginPage />} />
        </Route>
        <Route element={<ProtectedRoute />}>
          <Route path="/notifications" element={<NotificationsPage />} />
          {/* <Route path="/users" element={<UsersPage />} /> */}
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </main>
  );
};
