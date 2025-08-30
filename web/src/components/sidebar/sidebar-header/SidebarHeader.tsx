import { ClipboardList } from "lucide-react";
import { useMobileDetect } from "../../../common/hooks/useMobileDetect";
import styles from "./SidebarHeader.module.scss";

export const SidebarHeader = () => {
  const isMobile = useMobileDetect();

  return (
    <div className={styles.container}>
      <div className={styles.iconContainer}>
        <ClipboardList
          className={`${styles.icon} ${
            isMobile ? styles.iconMobile : styles.iconDesktop
          }`}
          strokeWidth={2}
        />
      </div>
    </div>
  );
};
