import { NotificationsTable } from "@/components/tables/notifications-table/NotificationsTable";
import { ContentWrapper } from "@/components/wrappers/content-wrapper/ContentWrapper";
import { useNotificationPageController } from "../controllers/notifications-page.controller";
import { Loader } from "@/components/loader/Loader";
import styles from "./NotificationsPage.module.scss";
import { Button } from "@/components/Button/Button";
import { Pagination } from "@/components/pagination/Pagination";

export const NotificationsPage = () => {
  const { notifications, meta, isFetching, page, goToPage } =
    useNotificationPageController();

  const handleCreateNotification = () => {};
  console.log(notifications);

  return (
    <ContentWrapper>
      <header className={styles.header}>
        <h2 className={styles.title}>Listagem de Notificações</h2>
        <Button onClick={handleCreateNotification}>Criar Notificação</Button>
      </header>
      <NotificationsTable data={notifications} />
      <Pagination meta={meta} page={page} onPageChange={goToPage} />
      {isFetching && <Loader />}
    </ContentWrapper>
  );
};
