import { ReactNode } from "react";
import styles from "./RouterWrapper.module.scss";

interface RouterWrapperProps {
  children: ReactNode;
}

export const RouterWrapper = ({ children }: RouterWrapperProps) => {
  return <div className={styles.routesWrapper}>{children}</div>;
};
