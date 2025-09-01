import { NotificationDetails } from "@/components/notification-details/NotificationDetails";
import { BasePopup } from "../base-popup/BasePopup";
import { NotificationDetailsActions } from "@/components/notification-details-actions/NotificationDetailsActions";
import { Notification } from "@/components/tables/notifications-table/NotificationsTable";

interface NotificationDetailsPopupProps {
  openDetailsPopup: boolean;
  setOpenDetailsPopup: (open: boolean) => void;
  notificationInFocus: Notification;
}

export const NotificationDetailsPopup = ({
  notificationInFocus,
  openDetailsPopup,
  setOpenDetailsPopup,
}: NotificationDetailsPopupProps) => {
  return (
    <BasePopup
      open={openDetailsPopup}
      onClose={() => setOpenDetailsPopup(false)}
      title="Detalhes da Notificação"
    >
      <NotificationDetails notification={notificationInFocus} />
      <NotificationDetailsActions />
    </BasePopup>
  );
};
