import { useAuthStore } from "@/stores/auth/auth.store";
import { HeaderWrapper } from "../wrappers/header-wrapper/HeaderWrapper";
import { useNavigate } from "react-router-dom";

export const Header = () => {
  const setAuthenticated = useAuthStore((state) => state.setAuthenticated);
  const navigate = useNavigate();
  const handleLogout = () => {
    setAuthenticated(false);
    navigate("/login", { replace: true });
  };
  return (
    <HeaderWrapper>
      <button onClick={handleLogout}>Logout</button>
    </HeaderWrapper>
  );
};
