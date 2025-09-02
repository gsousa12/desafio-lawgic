import React from "react";
import styles from "./Tabs.module.scss";

interface TabItem {
  key: string;
  label: string;
  content: React.ReactNode;
}
interface TabsProps {
  tabs: TabItem[];
  defaultKey?: string;
}

export const Tabs = ({ tabs, defaultKey }: TabsProps) => {
  const [active, setActive] = React.useState<string>(
    defaultKey ?? tabs[0]?.key
  );

  const current = tabs.find((t) => t.key === active) ?? tabs[0];

  return (
    <div className={styles.tabsRoot}>
      <div className={styles.list}>
        {tabs.map((t) => {
          const selected = t.key === active;
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => setActive(t.key)}
              className={`${styles.trigger} ${selected ? styles.active : ""}`}
            >
              {t.label}
            </button>
          );
        })}
      </div>
      <div className={styles.content}>{current?.content}</div>
    </div>
  );
};
