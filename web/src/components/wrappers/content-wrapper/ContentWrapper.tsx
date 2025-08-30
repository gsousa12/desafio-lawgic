import { ReactNode } from "react";
import { useMobileDetect } from "@common/hooks/useMobileDetect";
import styles from "./ContentWrapper.module.scss";

interface ContentWrapperProps {
  children: ReactNode;
}

export const ContentWrapper = ({ children }: ContentWrapperProps) => {
  const isMobile = useMobileDetect();

  return (
    <div
      className={`${styles.contentWrapper} ${isMobile ? "" : styles.desktop}`}
    >
      {children}
    </div>
  );
};
