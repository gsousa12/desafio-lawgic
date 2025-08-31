import { useMutation } from "@tanstack/react-query";
import { api } from "@/api/axios";
import { AxiosError } from "axios";
import { LoginFormValues } from "@/features/auth/schemas/login-page.schema";
import { ApiResponse } from "@/common/types/api/api.types";

const apiRequest = async (
  data: LoginFormValues
): Promise<ApiResponse<void>> => {
  const response = await api.post<ApiResponse<void>>("/auth/signin", {
    email: data.email,
    password: data.password,
  });
  return response.data;
};

export const useLoginDispatch = () => {
  const mutation = useMutation<ApiResponse<void>, AxiosError, LoginFormValues>({
    mutationFn: apiRequest,
  });

  return mutation;
};
