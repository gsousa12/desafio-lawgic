import React, { forwardRef, InputHTMLAttributes } from "react";
import styles from "./TextInput.module.scss";

export type TextInputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "size"
> & {
  label: string;
  error?: string;
  rightIcon?: React.ReactNode;
  onRightIconClick?: () => void;
};

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  (
    { id, label, error, rightIcon, onRightIconClick, className, ...rest },
    ref
  ) => {
    return (
      <div className={`${styles.wrapper} ${className ?? ""}`}>
        <label className={styles.label} htmlFor={id}>
          {label}
        </label>

        <div className={styles.inputWrap}>
          <input id={id} ref={ref} className={styles.input} {...rest} />
          {rightIcon ? (
            <button
              type="button"
              className={styles.iconBtn}
              onClick={onRightIconClick}
              aria-label="Toggle password visibility"
              tabIndex={0}
            >
              {rightIcon}
            </button>
          ) : null}
        </div>

        <div
          className={styles.errorText}
          role={error ? "alert" : undefined}
          aria-live="polite"
        >
          {error ?? ""}
        </div>
      </div>
    );
  }
);

TextInput.displayName = "TextInput";
