import { ApiResponse, Meta } from "@/common/types/api/api.types";
import {
  useMutation,
  useQuery,
  UseMutationOptions,
  UseQueryOptions,
  UseMutationResult,
  UseQueryResult,
} from "@tanstack/react-query";
import { AxiosResponse } from "axios";

export interface ProcessedApiResponse<T> {
  data: T[] | T;
  singleItem: T | null | undefined;
  message: string;
  meta?: Meta;
  hasPagination: boolean;
  isArray: boolean;
}

export type ApiErrorResponseType = {
  success: false;
  message: string;
};

export const processSuccessResponse = <T>(
  response: ApiResponse<T>
): ProcessedApiResponse<T> => {
  const isArray = Array.isArray(response.data) && response.data.length > 1;
  const hasPagination = response.meta;

  return {
    data: response.data ?? [],
    singleItem: Array.isArray(response.data)
      ? response.data[0] ?? null
      : response.data,
    message: response.message,
    meta: response.meta || undefined,
    hasPagination: Boolean(hasPagination),
    isArray,
  };
};

// Hook customizado para Mutations
export const useApiMutation = <TData, TVariables = void>(
  mutationFn: (
    variables: TVariables
  ) => Promise<AxiosResponse<ApiResponse<TData>>>,
  options?: Omit<
    UseMutationOptions<
      ProcessedApiResponse<TData>,
      ApiErrorResponseType,
      TVariables
    >,
    "mutationFn"
  >
): UseMutationResult<
  ProcessedApiResponse<TData>,
  ApiErrorResponseType,
  TVariables
> => {
  return useMutation({
    mutationFn: async (variables: TVariables) => {
      try {
        const response = await mutationFn(variables);
        return processSuccessResponse(response.data);
      } catch (error: any) {
        const apiError: ApiErrorResponseType = {
          success: false,
          message:
            error.response?.data?.message || "Ocorreu um erro no servidor",
        };
        throw apiError;
      }
    },
    ...options,
  });
};

// Hook customizado para Queries
export const useApiQuery = <TData>(
  queryKey: unknown[],
  queryFn: () => Promise<AxiosResponse<ApiResponse<TData>>>,
  options?: Omit<
    UseQueryOptions<ProcessedApiResponse<TData>, ApiErrorResponseType>,
    "queryKey" | "queryFn"
  >
): UseQueryResult<ProcessedApiResponse<TData>, ApiErrorResponseType> => {
  return useQuery({
    queryKey,
    queryFn: async () => {
      try {
        const response = await queryFn();
        return processSuccessResponse(response.data);
      } catch (error: any) {
        const apiError: ApiErrorResponseType = {
          success: false,
          message:
            error.response?.data?.message || "Ocorreu um erro no servidor",
        };
        throw apiError;
      }
    },
    ...options,
  });
};
