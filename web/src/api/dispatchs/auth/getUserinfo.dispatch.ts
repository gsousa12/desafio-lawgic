import { api } from "@/api/axios";
import { ApiResponse, JwtPayload } from "@/common/types/api/api.types";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";

export const apiRequest = async (): Promise<ApiResponse<JwtPayload>> => {
  const response = await api.get<ApiResponse<JwtPayload>>("/auth/me");
  return response.data;
};

export const useGetUserInformationDispatch = () => {
  const mutation = useMutation<ApiResponse<JwtPayload>, AxiosError, null>({
    mutationFn: apiRequest,
  });

  return mutation;
};
