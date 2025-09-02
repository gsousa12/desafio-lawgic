import { HeaderWrapper } from "../wrappers/header-wrapper/HeaderWrapper";
import { useAuthContext } from "../providers/auth-provider/AuthProvider";
import { useAuthStore } from "@/stores/auth/auth.store";
import { Button } from "../Button/Button";
import { CircleX, LogOut } from "lucide-react";
import { getUserRoleLabel } from "@/common/utils/convert";
import { useApiMutation } from "@/api/dispatchs/hooks";
import { api } from "@/api/axios";
import { Loader } from "../loader/Loader";
import { AlertPopup } from "../popups/alert-popup/AlertPopup";
import { useState } from "react";

export const Header = () => {
  const [openAlertPopup, setOpenAlertPopup] = useState<boolean>(false);
  const {
    mutateAsync: submitLogout,
    isPending,
    isError,
    error,
  } = useApiMutation<any, null>(() => api.post("auth/signout"));
  const logout = useAuthContext().logout;
  const handleLogout = async () => {
    try {
      await submitLogout(null);
      logout();
    } catch (error) {
      setOpenAlertPopup(true);
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
      {isPending && <Loader />}
      {isError && (
        <AlertPopup
          open={openAlertPopup}
          title="Erro ao fazer logout"
          description={error?.message}
          icon={<CircleX />}
          confirmLabel="Ok"
          onConfirm={() => setOpenAlertPopup(false)}
        />
      )}
    </HeaderWrapper>
  );
};
