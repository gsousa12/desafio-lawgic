import { ReactNode } from "react";
import styles from "./AlertPopup.module.scss";

type AlertPopupProps = {
  open: boolean;
  title: string;
  description?: string;

  icon?: ReactNode;

  confirmLabel: string;
  onConfirm: () => void;

  cancelLabel?: string;
  onCancel?: () => void;
};

export const AlertPopup = ({
  open,
  title,
  description,
  icon,
  confirmLabel,
  onConfirm,
  cancelLabel,
  onCancel,
}: AlertPopupProps) => {
  if (!open) return null;

  const hasCancel = Boolean(cancelLabel && onCancel);

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true">
      <div className={styles.popup}>
        {icon ? <div className={styles.icon}>{icon}</div> : null}

        <h3 className={styles.title}>{title}</h3>

        {description ? (
          <p className={styles.description}>{description}</p>
        ) : null}

        <div
          className={`${styles.actions} ${
            hasCancel ? styles.double : styles.single
          }`}
        >
          {hasCancel && (
            <button
              type="button"
              className={`${styles.btn} ${styles.btnCancel}`}
              onClick={onCancel}
            >
              {cancelLabel}
            </button>
          )}

          <button
            type="button"
            className={`${styles.btn} ${styles.btnConfirm}`}
            onClick={onConfirm}
            autoFocus
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
