import { api } from "@/api/axios";
import { useApiQuery } from "@/api/dispatchs/hooks";
import { Meta } from "@/common/types/api/api.types";
import { defaultMeta } from "@/common/utils/consts";
import { useEffect, useState } from "react";
import { Notification } from "../../../components/tables/notifications-table/NotificationsTable";
import { useAuthStore } from "@/stores/auth/auth.store";

interface UseNotificationPageControllerReturn {
  notifications?: Notification[];
  meta?: Meta;
  isFetching?: boolean;
  isError?: boolean;
  error?: any;
  page: number;
  goToPage: (page: number) => void;
  openAlertPopup: boolean;
  setOpenAlertPopup: (value: boolean) => void;
  handleRefetchPage: () => void;
  openCreatePopup: boolean;
  setOpenCreatePopup: (value: boolean) => void;
  handleCreateNotification: () => void;
  userRole: string | undefined;
}

export const useNotificationPageController =
  (): UseNotificationPageControllerReturn => {
    const [page, setPage] = useState(1);
    const [openAlertPopup, setOpenAlertPopup] = useState<boolean>(false);
    const [openCreatePopup, setOpenCreatePopup] = useState(false);
    const user = useAuthStore((store) => store.user);
    const userRole = user?.role;

    const handleCreateNotification = () => {
      setOpenCreatePopup(true);
    };

    const { data, isError, isFetching, error, isRefetchError, refetch } =
      useApiQuery<any>(["notifications", page], async () => {
        const result = await api.get(`/notifications`, {
          params: {
            page,
          },
        });
        return result;
      });

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

    const handleRefetchPage = () => {
      refetch();
      setOpenAlertPopup(false);
    };

    useEffect(() => {
      if (isError || isRefetchError) {
        setOpenAlertPopup(true);
      }
    }, [data, isError, isRefetchError, refetch]);

    return {
      notifications: data?.data || [],
      meta,
      isFetching,
      isError: isError || isRefetchError,
      error,
      page,
      goToPage,
      openAlertPopup,
      setOpenAlertPopup,
      handleRefetchPage,
      openCreatePopup,
      setOpenCreatePopup,
      handleCreateNotification,
      userRole,
    };
  };
