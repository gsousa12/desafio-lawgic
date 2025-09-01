import { NotificationsTable } from "@/components/tables/notifications-table/NotificationsTable";
import { ContentWrapper } from "@/components/wrappers/content-wrapper/ContentWrapper";
import { useNotificationPageController } from "../controllers/notifications-page.controller";
import { Loader } from "@/components/loader/Loader";
import styles from "./NotificationsPage.module.scss";
import { Button } from "@/components/Button/Button";
import { Pagination } from "@/components/pagination/Pagination";
import { AlertPopup } from "@/components/popups/alert-popup/AlertPopup";
import { CircleX, RefreshCcw } from "lucide-react";
import { UserRoleType } from "@/common/types/entities";
import { checkCreateNotificationButtonVisibility } from "@/common/utils/checks";
import { CreateNotificationPopup } from "@/components/popups/create-notification-popup/CreateNotificationPopup";

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
    openCreatePopup,
    setOpenCreatePopup,
    handleCreateNotification,
    userRole,
  } = useNotificationPageController();

  return (
    <ContentWrapper>
      <header className={styles.header}>
        <h2 className={styles.title}>Listagem de Notificações</h2>
        <div className={styles.actions}>
          {checkCreateNotificationButtonVisibility(
            userRole as UserRoleType
          ) && (
            <Button onClick={handleCreateNotification}>
              Criar Notificação
            </Button>
          )}
          <Button onClick={() => handleRefetchPage()}>
            <RefreshCcw />
          </Button>
        </div>
      </header>
      <NotificationsTable data={notifications ?? []} />
      <Pagination meta={meta} page={page} onPageChange={goToPage} />
      <CreateNotificationPopup
        refetch={handleRefetchPage}
        openCreatePopup={openCreatePopup}
        setOpenCreatePopup={setOpenCreatePopup}
      />
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
