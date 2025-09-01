import { Notification } from "@/components/tables/notifications-table/NotificationsTable";

interface NotificationDetailsProps {
  notification: Notification;
}
export const NotificationDetails = ({
  notification,
}: NotificationDetailsProps) => {
  console.log(notification);
  return <>Conteudo</>;
};
