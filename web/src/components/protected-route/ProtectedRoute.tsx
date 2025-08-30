import { Navigate, Outlet } from "react-router-dom";

export const ProtectedRoute = () => {
  const isAuthenticated = true; //mocked

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};
