import { Link } from "react-router-dom";
import { JSX } from "react";
import { useMobileDetect } from "@common/hooks/useMobileDetect";
import styles from "./SidebarItem.module.scss";

interface SidebarItemProps {
  icon: JSX.Element;
  label: string;
  routerLink: string;
  active?: boolean;
}

export const SidebarItem = ({
  icon,
  label,
  routerLink,
  active = false,
}: SidebarItemProps) => {
  const isMobile = useMobileDetect();

  return (
    <Link to={routerLink} title={label} className={styles.link}>
      <div
        className={`${styles.item} ${active ? styles.active : styles.inactive}`}
      >
        <div className={styles.iconBox}>{icon}</div>

        <span className={`${styles.label} ${isMobile ? "" : styles.labelGap}`}>
          {isMobile ? "" : label}
        </span>
      </div>
    </Link>
  );
};
