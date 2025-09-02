import { BasePopup } from "../base-popup/BasePopup";
import { Notification } from "@/components/tables/notifications-table/NotificationsTable";
import { NotificationEdition } from "@/components/notification-edition/NotificationEdition";

interface NotificationEditionPopupProps {
  openEditionPopup: boolean;
  setOpenEditionPopup: (open: boolean) => void;
  notificationInFocus: Notification;
  refetch: () => void;
}

export const NotificationEditionPopup = ({
  notificationInFocus,
  openEditionPopup,
  setOpenEditionPopup,
  refetch,
}: NotificationEditionPopupProps) => {
  return (
    <BasePopup
      open={openEditionPopup}
      onClose={() => setOpenEditionPopup(false)}
      title="Edição de Notificação"
    >
      <NotificationEdition
        notification={notificationInFocus}
        onClose={() => setOpenEditionPopup(false)}
        refetch={refetch}
      />
    </BasePopup>
  );
};
