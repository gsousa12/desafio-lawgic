import { useCallback, useEffect, useMemo, useState } from "react";
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
  ApiErrorResponseType,
  useApiMutation,
  useApiQuery,
} from "@/api/dispatchs/hooks";
import { api } from "@/api/axios";
import { JwtPayload } from "@/common/types/api/api.types";

export type UseLoginPageControllerReturn = {
  isMobile: boolean;
  leftImageSrc: string;
  register: UseFormRegister<LoginFormValues>;
  errors: FieldErrors<LoginFormValues>;
  onSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
  isSubmitting: boolean;
  showPassword: boolean;
  togglePasswordVisibility: () => void;
  isPending: boolean;
  isError: boolean;
  error: ApiErrorResponseType | null;
  openAlertPopUp: boolean;
  setOpenAlertPopUp: (value: boolean) => void;
};

export const useLoginPageController = (): UseLoginPageControllerReturn => {
  const [openAlertPopUp, setOpenAlertPopUp] = useState<boolean>(false);
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

  const {
    mutateAsync: loginDispatch,
    isPending: loginIsPeding,
    isError: loginIsError,
    error: loginError,
  } = useApiMutation<null, LoginFormValues>((loginData) =>
    api.post("/auth/signin/", loginData)
  );

  const {
    isPending: getUserInfoIsPeding,
    isError: getUserInfoIsError,
    error: getUserInfoError,
    refetch: useGetUserInformationFetch,
  } = useApiQuery<JwtPayload>(["jwt", null], () => api.get(`/auth/me/`), {
    enabled: false,
  });

  const { setLoged } = useAuthContext();
  const submitHandler = useCallback(
    async (data: LoginFormValues) => {
      try {
        await loginDispatch(data);
        const result = await useGetUserInformationFetch();
        if (result.data?.data !== undefined) {
          const user = result.data.singleItem;
          await setLoged(user!);
        } else {
          setOpenAlertPopUp(true);
        }
      } catch (error) {
        setOpenAlertPopUp(true);
      }
    },
    [loginDispatch, useGetUserInformationFetch, setLoged]
  );

  const onSubmit = useMemo(
    () => handleSubmit(submitHandler),
    [handleSubmit, submitHandler]
  );

  useEffect(() => {
    if (loginError) {
      setOpenAlertPopUp(true);
    }
  }, [loginError]);

  return {
    isMobile,
    leftImageSrc,
    register,
    errors,
    onSubmit,
    isSubmitting,
    showPassword,
    togglePasswordVisibility,
    isPending: loginIsPeding || getUserInfoIsPeding,
    isError: loginIsError || getUserInfoIsError,
    error: loginError || getUserInfoError,
    openAlertPopUp,
    setOpenAlertPopUp,
  };
};
