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
import { useAuthContext } from "@/components/providers/auth-provider/AuthProvider";
import {
  getUserInformationDispatch,
  loginDispatch,
} from "@/api/dispatchs/auth/auth.dispatchs";

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

  const { setLoged } = useAuthContext();
  const submitHandler = useCallback(async (data: LoginFormValues) => {
    try {
      await loginDispatch(data.email, data.password);
      const user = await getUserInformationDispatch();
      await setLoged(user);
    } catch (error) {
      alert("Login failed, try again.");
    }
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
