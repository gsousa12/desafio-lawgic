import { useCallback, useMemo, useState } from "react";
import {
  useForm,
  type FieldErrors,
  type UseFormRegister,
} from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";
import leftImageSrc from "../../../assets/left-side-login.png";
import { useMobileDetect } from "@/common/hooks/useMobileDetect";
import { LoginFormValues, loginSchema } from "../schemas/login-page.schema";
import { replace, useNavigate } from "react-router-dom";

export type UseLoginPageControllerReturn = {
  isMobile: boolean;
  leftImageSrc: string;
  register: UseFormRegister<LoginFormValues>;
  errors: FieldErrors<LoginFormValues>;
  onSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
  isSubmitting: boolean;
  showPassword: boolean;
  togglePasswordVisibility: () => void;
};

export const useLoginPageController = (): UseLoginPageControllerReturn => {
  const isMobile = useMobileDetect();
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: "onTouched",
  });

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword((v) => !v);
  }, []);

  const submitHandler = useCallback(async (data: LoginFormValues) => {
    console.log(data);
    await new Promise((r) => setTimeout(r, 1000));
    navigate("/notifications", { replace: true });
  }, []);

  const onSubmit = useMemo(
    () => handleSubmit(submitHandler),
    [handleSubmit, submitHandler]
  );

  return {
    isMobile,
    leftImageSrc,
    register,
    errors,
    onSubmit,
    isSubmitting,
    showPassword,
    togglePasswordVisibility,
  };
};
