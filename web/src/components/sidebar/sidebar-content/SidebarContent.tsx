import { Gavel, UsersRound } from "lucide-react";
import { SidebarItem } from "../sidebar-item/SidebarItem";
import { useLocation } from "react-router-dom";
import styles from "./SidebarContent.module.scss";

export const SidebarContent = () => {
  const location = useLocation();

  return (
    <div className={styles.container}>
      <SidebarItem
        icon={<Gavel />}
        label={"Notificações"}
        routerLink={"/notifications"}
        active={
          location.pathname === "/notifications" || location.pathname === "/"
        }
      />
      {/* <SidebarItem
        icon={<UsersRound />}
        label={"Equipe"}
        routerLink={"/users"}
        active={location.pathname === "/users" || location.pathname === "/"}
      /> */}
    </div>
  );
};
