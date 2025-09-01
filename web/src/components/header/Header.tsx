import { HeaderWrapper } from "../wrappers/header-wrapper/HeaderWrapper";
import { logoutDispatch } from "@/api/dispatchs/auth/auth.dispatchs";
import { useAuthContext } from "../providers/auth-provider/AuthProvider";
import { useAuthStore } from "@/stores/auth/auth.store";
import { Button } from "../Button/Button";
import { LogOut } from "lucide-react";
import { getUserRoleLabel } from "@/common/utils/convert";

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
      {userName} | {userEmail} | {getUserRoleLabel(userRole)}
      <div>
        <Button onClick={handleLogout}>
          <LogOut />
        </Button>
      </div>
    </HeaderWrapper>
  );
};
