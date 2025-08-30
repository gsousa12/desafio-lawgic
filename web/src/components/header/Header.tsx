import { HeaderWrapper } from "../wrappers/header-wrapper/HeaderWrapper";
import { logoutDispatch } from "@/api/dispatchs/auth/auth.dispatchs";
import { useAuthContext } from "../providers/auth-provider/AuthProvider";
import { useAuthStore } from "@/stores/auth/auth.store";

export const Header = () => {
  const logout = useAuthContext().logout;
  const handleLogout = async () => {
    try {
      await logoutDispatch();
      logout();
    } catch (error) {
      alert("Logout failed, try again.");
    }
  };
  const user = useAuthStore((store) => store.user);
  const userName = user?.name;
  const userEmail = user?.email;
  const userRole = user?.role;
  return (
    <HeaderWrapper>
      <button onClick={handleLogout}>Logout</button>
      <div>
        Bem vindo {userName} {userEmail} {userRole}
      </div>
    </HeaderWrapper>
  );
};
