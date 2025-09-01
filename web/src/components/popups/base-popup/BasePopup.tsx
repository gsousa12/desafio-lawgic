import { ReactNode, useEffect } from "react";
import { X } from "lucide-react";
import styles from "./BasePopup.module.scss";
import { Button } from "@/components/Button/Button";
import { motion, AnimatePresence } from "framer-motion";

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
  useEffect(() => {
    if (!open) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [open]);

  if (!open) return null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className={styles.overlay}
          role="dialog"
          aria-modal="true"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            className={styles.popup}
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
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
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
