import { useAuthStore } from "@/stores/auth/auth.store";
import styles from "./NotificationDetailsActions.module.scss";
import { CheckCircle2, Undo2, Send } from "lucide-react";
import type { Notification } from "@/components/tables/notifications-table/NotificationsTable";
import { Button } from "../Button/Button";

interface NotificationDetailsActionsProps {
  notification: Notification;
}

export const NotificationDetailsActions = ({
  notification,
}: NotificationDetailsActionsProps) => {
  console.log(notification);
  const role = useAuthStore((s) => s.user?.role);
  const notificationStatus = notification.status ?? "completed";
  const hasNotifiedPerson =
    notification.notifiedPerson !== undefined &&
    notification.notifiedPerson?.length! > 0
      ? true
      : false;

  const isReviewer = role === "reviewer" || role === "admin";
  const isNotifier = role === "notifier";

  const canSendToAnalysis = isNotifier && notificationStatus === "in_progress";
  const canReview = isReviewer && notificationStatus === "validation";

  if (!canSendToAnalysis && !canReview) return null;

  const handleApprove = () => {
    console.log("Aprovar notificação");
  };
  const handleBackToReview = () => {
    console.log("Voltar para revisão");
  };
  const handleSendToAnalysis = () => {
    console.log("Enviar para análise");
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
        <button
          type="button"
          className={`${styles.btn} ${styles.primary}`}
          onClick={handleSendToAnalysis}
        >
          <Send size={16} />
          <span>Enviar para análise</span>
        </button>
      )}
    </div>
  );
};
