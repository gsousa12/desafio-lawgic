import styles from "./Loader.module.scss";

export const Loader = () => {
  return (
    <div className={styles.overlay} aria-busy="true" aria-live="polite">
      <div className={styles.loader} />
    </div>
  );
};
