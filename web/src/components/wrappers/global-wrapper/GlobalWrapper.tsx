import { ReactNode } from "react";
import { useMobileDetect } from "@common/hooks/useMobileDetect";
import styles from "./GlobalWrapper.module.scss";
import { useAuthStore } from "@/stores/auth/auth.store";

interface GlobalWrapperProps {
  children: ReactNode;
}

export const GlobalWrapper = ({ children }: GlobalWrapperProps) => {
  const isMobile = useMobileDetect();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <div
      className={`${styles.globalWrapper} ${
        isMobile ? styles.mobile : styles.desktop
      } ${!isAuthenticated ? styles.notAuthenticated : ""}`}
    >
      {children}
    </div>
  );
};
