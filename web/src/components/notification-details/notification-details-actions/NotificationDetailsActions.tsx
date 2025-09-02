import { useAuthStore } from "@/stores/auth/auth.store";
import styles from "./NotificationDetailsActions.module.scss";
import { CheckCircle2, Undo2, Send, CircleX } from "lucide-react";
import type { Notification } from "@/components/tables/notifications-table/NotificationsTable";
import { Button } from "../../Button/Button";
import { useApiMutation } from "@/api/dispatchs/hooks";
import { api } from "@/api/axios";
import { Loader } from "../../loader/Loader";
import { AlertPopup } from "../../popups/alert-popup/AlertPopup";
import { useState } from "react";

interface NotificationDetailsActionsProps {
  notification: Notification;
  refetch: () => void;
  onClose: () => void;
}

export const NotificationDetailsActions = ({
  notification,
  refetch,
  onClose,
}: NotificationDetailsActionsProps) => {
  const [openAlertPopup, setOpenAlertPopup] = useState<boolean>(false);
  const role = useAuthStore((s) => s.user?.role);
  const notificationId = notification.id;
  const notificationStatus = notification.status ?? "completed";
  const hasNotifiedPerson = !!notification.notifiedPerson;

  const isReviewer = role === "reviewer" || role === "admin";
  const isNotifier = role === "notifier";

  const canSendToAnalysis = isNotifier && notificationStatus === "in_progress";
  const canReview = isReviewer && notificationStatus === "validation";

  if (!canSendToAnalysis && !canReview) return null;

  type ReviewRequest = {
    notificationId: string;
    action: "approve" | "back" | "validate";
  };
  const {
    mutateAsync: reviewDispatch,
    isPending,
    isError,
    error,
  } = useApiMutation<any, ReviewRequest>((data) =>
    api.post("/notifications/review", data)
  );

  const handleRefetchPage = () => {
    refetch();
    setOpenAlertPopup(false);
    onClose();
  };

  const handleApprove = async () => {
    try {
      await reviewDispatch({ notificationId, action: "approve" });
      refetch();
      setOpenAlertPopup(false);
      onClose();
    } catch (error) {
      setOpenAlertPopup(true);
    }
  };
  const handleBackToReview = async () => {
    try {
      await reviewDispatch({ notificationId, action: "back" });
      refetch();
      setOpenAlertPopup(false);
      onClose();
    } catch (error) {
      setOpenAlertPopup(true);
    }
  };
  const handleSendToAnalysis = async () => {
    try {
      await reviewDispatch({ notificationId, action: "validate" });
      refetch();
      setOpenAlertPopup(false);
      onClose();
    } catch (error) {
      setOpenAlertPopup(true);
    }
  };

  return (
    <div className={styles.actionsBar}>
      {canReview && (
        <>
          <Button type="button" onClick={handleBackToReview}>
            <Undo2 size={16} />
            <span>Voltar para revisão</span>
          </Button>
          <Button type="button" onClick={handleApprove}>
            <CheckCircle2 size={16} />
            <span>Aprovar</span>
          </Button>
        </>
      )}

      {canSendToAnalysis && hasNotifiedPerson && (
        <Button type="button" onClick={handleSendToAnalysis}>
          <Send size={16} />
          <span>Enviar para Validação</span>
        </Button>
      )}
      {isPending && <Loader />}
      {isError && (
        <AlertPopup
          open={openAlertPopup}
          title="Erro ao revisar notificação"
          description={error?.message}
          icon={<CircleX />}
          confirmLabel="Ok"
          onConfirm={() => handleRefetchPage()}
        />
      )}
    </div>
  );
};
