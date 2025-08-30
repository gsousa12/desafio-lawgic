import React, { ButtonHTMLAttributes } from "react";
import styles from "./Button.module.scss";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  loading?: boolean;
  fullWidth?: boolean;
};

export const Button: React.FC<ButtonProps> = ({
  loading,
  fullWidth,
  children,
  className,
  ...rest
}) => {
  return (
    <button
      className={`${styles.btn} ${fullWidth ? styles.fullWidth : ""} ${
        className ?? ""
      }`}
      disabled={loading || rest.disabled}
      {...rest}
    >
      {children}
    </button>
  );
};
