import { ReactNode } from "react";
import { useMobileDetect } from "@common/hooks/useMobileDetect";
import styles from "./HeaderWrapper.module.scss";

interface HeaderWrapperProps {
  children: ReactNode;
}

export const HeaderWrapper = ({ children }: HeaderWrapperProps) => {
  const isMobile = useMobileDetect();

  return (
    <header
      className={`${styles.headerWrapper} ${isMobile ? "" : styles.desktop}`}
    >
      {children}
    </header>
  );
};
