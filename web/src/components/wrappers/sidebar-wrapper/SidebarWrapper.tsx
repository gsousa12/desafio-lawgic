import { ReactNode } from "react";
import styles from "./SidebarWrapper.module.scss";
import { useMobileDetect } from "../../../common/hooks/useMobileDetect";

interface SidebarWrapperProps {
  children: ReactNode;
}

export const SidebarWrapper = ({ children }: SidebarWrapperProps) => {
  const isMobile = useMobileDetect();

  return (
    <aside
      className={`${styles.sidebarWrapper} ${
        isMobile ? styles.mobile : styles.desktop
      }`}
    >
      {children}
    </aside>
  );
};
