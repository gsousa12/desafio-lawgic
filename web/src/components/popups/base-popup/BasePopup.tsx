import { ReactNode, useEffect } from "react";
import { X } from "lucide-react";
import styles from "./BasePopup.module.scss";
import { Button } from "@/components/Button/Button";

type BasePopupProps = {
  open: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
  width?: number | string;
  height?: number | string;
  showCloseIcon?: boolean;
};

export const BasePopup = ({
  open,
  title,
  children,
  onClose,
  showCloseIcon = true,
}: BasePopupProps) => {
  if (!open) return null;
  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, []);

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true">
      <div className={styles.popup}>
        <header className={styles.header}>
          <h3 className={styles.title}>{title}</h3>

          {showCloseIcon && (
            <Button
              type="button"
              onClick={onClose}
              aria-label="Fechar"
              title="Fechar"
            >
              <X />
            </Button>
          )}
        </header>

        <section className={styles.content}>{children}</section>
      </div>
    </div>
  );
};
