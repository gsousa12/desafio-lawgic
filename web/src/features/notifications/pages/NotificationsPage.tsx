import { NotificationsTable } from "@/components/tables/notifications-table/NotificationsTable";
import { ContentWrapper } from "@/components/wrappers/content-wrapper/ContentWrapper";
import { useNotificationPageController } from "../controllers/notifications-page.controller";
import { Loader } from "@/components/loader/Loader";
import styles from "./NotificationsPage.module.scss";
import { Plus } from "lucide-react";
import { Button } from "@/components/Button/Button";

export const NotificationsPage = () => {
  const { notifications, isFetching } = useNotificationPageController();

  const handleCreateNotification = () => {};

  return (
    <ContentWrapper>
      <header className={styles.header}>
        <h2 className={styles.title}>Listagem de Notificações</h2>

        <Button onClick={handleCreateNotification}>Criar Notificação</Button>
      </header>

      <NotificationsTable data={notifications} />

      {isFetching && <Loader />}
    </ContentWrapper>
  );
};
