import { NotificationDetails } from "@/components/notification-details/NotificationDetails";
import { BasePopup } from "../base-popup/BasePopup";
import { NotificationDetailsActions } from "@/components/notification-details-actions/NotificationDetailsActions";
import { Notification } from "@/components/tables/notifications-table/NotificationsTable";

interface NotificationDetailsPopupProps {
  openDetailsPopup: boolean;
  setOpenDetailsPopup: (open: boolean) => void;
  notificationInFocus: Notification;
  refetch: () => void;
}

export const NotificationDetailsPopup = ({
  notificationInFocus,
  openDetailsPopup,
  setOpenDetailsPopup,
  refetch,
}: NotificationDetailsPopupProps) => {
  return (
    <BasePopup
      open={openDetailsPopup}
      onClose={() => setOpenDetailsPopup(false)}
      title="Detalhes da Notificação"
    >
      <NotificationDetailsActions
        notification={notificationInFocus}
        refetch={refetch}
        onClose={() => setOpenDetailsPopup(false)}
      />
      <NotificationDetails notification={notificationInFocus} />
    </BasePopup>
  );
};
