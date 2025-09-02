import styles from "./NotificationEdition.module.scss";
import type { Notification } from "@/components/tables/notifications-table/NotificationsTable";
import { NotificationEditionArea } from "./notification-edition-area/NotificationEditionArea";
import { PersonEditionArea } from "./person-edition-area/PersonEditionArea";
import { Tabs } from "../tabs/Tabs";

interface NotificationEditionProps {
  notification: Notification;
  onClose: () => void;
  refetch: () => void;
}

export const NotificationEdition = ({
  notification,
  onClose,
  refetch,
}: NotificationEditionProps) => {
  return (
    <div className={styles.container}>
      <Tabs
        defaultKey="notification"
        tabs={[
          {
            key: "notification",
            label: "Notificação",
            content: (
              <NotificationEditionArea
                notification={notification}
                onClose={onClose}
                refetch={refetch}
              />
            ),
          },
          {
            key: "person",
            label: "Notificado",
            content: (
              <PersonEditionArea
                notification={notification}
                onClose={onClose}
                refetch={refetch}
              />
            ),
          },
        ]}
      />
    </div>
  );
};
