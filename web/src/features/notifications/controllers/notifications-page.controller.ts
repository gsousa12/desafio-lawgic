import { api } from "@/api/axios";
import { useApiQuery } from "@/api/dispatchs/hooks";
import { useEffect } from "react";

interface UseNotificationPageControllerReturn {
  notifications?: any[];
  isFetching?: boolean;
  isError?: boolean;
  error?: any;
}

export const useNotificationPageController =
  (): UseNotificationPageControllerReturn => {
    const page = 1;
    const { data, isError, isFetching, error, refetch } = useApiQuery<any>(
      ["jwt", page],
      () => api.get(`/notifications/`),
      {
        enabled: false,
      }
    );
    useEffect(() => {
      refetch();
    }, []);
    return { notifications: data?.data || [], isFetching, isError, error };
  };
