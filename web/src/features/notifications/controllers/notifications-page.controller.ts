import { api } from "@/api/axios";
import { useApiQuery } from "@/api/dispatchs/hooks";
import { Meta } from "@/common/types/api/api.types";
import { defaultMeta } from "@/common/utils/consts";
import { useState } from "react";

interface UseNotificationPageControllerReturn {
  notifications?: any[];
  meta?: Meta;
  isFetching?: boolean;
  isError?: boolean;
  error?: any;
  page: number;
  goToPage: (page: number) => void;
}

export const useNotificationPageController =
  (): UseNotificationPageControllerReturn => {
    const [page, setPage] = useState(1);

    const { data, isError, isFetching, error } = useApiQuery<any>(
      ["notifications", page],
      async () => {
        const result = await api.get(`/notifications`, {
          params: {
            page,
          },
        });
        return result;
      }
    );

    const meta: Meta = (data?.meta as Meta | undefined) ??
      defaultMeta ?? {
        totalItems: data?.data?.length ?? 0,
        itemsPerPage: 10,
        currentPage: page,
        totalPages: 1,
      };

    const clamp = (p: number) =>
      Math.max(1, Math.min(p, meta?.totalPages || 1));

    const goToPage = (p: number) => setPage(clamp(p));

    return {
      notifications: data?.data || [],
      meta,
      isFetching,
      isError,
      error,

      page,
      goToPage,
    };
  };
