import { NotificationsTable } from "@/components/tables/notifications-table/NotificationsTable";
import { ContentWrapper } from "@/components/wrappers/content-wrapper/ContentWrapper";
import { useNotificationPageController } from "../controllers/notifications-page.controller";
import { Loader } from "@/components/loader/Loader";
import styles from "./NotificationsPage.module.scss";
import { Button } from "@/components/Button/Button";
import { Pagination } from "@/components/pagination/Pagination";
import { AlertPopup } from "@/components/popups/alert-popup/AlertPopup";
import { CircleX } from "lucide-react";

export const NotificationsPage = () => {
  const {
    notifications,
    meta,
    isFetching,
    isError,
    error,
    page,
    goToPage,
    openAlertPopup,
    handleRefetchPage,
  } = useNotificationPageController();

  const handleCreateNotification = () => {};

  console.log(isError);

  return (
    <ContentWrapper>
      <header className={styles.header}>
        <h2 className={styles.title}>Listagem de Notificações</h2>
        <Button onClick={handleCreateNotification}>Criar Notificação</Button>
      </header>
      <NotificationsTable data={notifications} />
      <Pagination meta={meta} page={page} onPageChange={goToPage} />
      {isFetching && <Loader />}
      {isError && (
        <AlertPopup
          open={openAlertPopup}
          title="Erro ao buscar listagem de notificações"
          description={error?.message}
          icon={<CircleX />}
          confirmLabel="Ok"
          onConfirm={() => handleRefetchPage()}
        />
      )}
    </ContentWrapper>
  );
};
