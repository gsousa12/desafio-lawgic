import { ReactNode } from "react";
import { useMobileDetect } from "@common/hooks/useMobileDetect";
import styles from "./GlobalWrapper.module.scss";

interface GlobalWrapperProps {
  children: ReactNode;
}

export const GlobalWrapper = ({ children }: GlobalWrapperProps) => {
  const isMobile = useMobileDetect();
  return (
    <div
      className={`${styles.globalWrapper} ${
        isMobile ? styles.mobile : styles.desktop
      }`}
    >
      {children}
    </div>
  );
};
