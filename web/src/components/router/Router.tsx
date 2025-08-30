import { Route, Routes } from "react-router-dom";
import { NotFoundPage } from "../not-found-page/NotFoundPage";
import { ProtectedRoute } from "../protected-route/ProtectedRoute";
import { NotificationsPage } from "../../features/notifications/pages/NotificationsPage";
import styles from "./Router.module.scss";
import { UsersPage } from "../../features/users/pages/UsersPage";

export const Router = () => {
  return (
    <main className={styles.main}>
      <Routes>
        <Route path="*" element={<NotFoundPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<NotificationsPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/users" element={<UsersPage />} />
        </Route>
      </Routes>
    </main>
  );
};
