import { NotificationsTable } from "@/components/tables/notifications-table/NotificationsTable";
import { ContentWrapper } from "@/components/wrappers/content-wrapper/ContentWrapper";
import { useNotificationPageController } from "../controllers/notifications-page.controller";
import { Loader } from "@/components/loader/Loader";
import styles from "./NotificationsPage.module.scss";
import { Button } from "@/components/Button/Button";
import { Pagination } from "@/components/pagination/Pagination";
import { AlertPopup } from "@/components/popups/alert-popup/AlertPopup";
import { CircleX, RefreshCcw } from "lucide-react";
import { BasePopup } from "@/components/popups/base-popup/BasePopup";
import { CreateNotification } from "./CreateNotification";
import { UserRoleType } from "@/common/types/entities";
import { checkCreateNotificationButtonVisibility } from "@/common/utils/checks";

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
      <BasePopup
        open={openCreatePopup}
        title="Criar Notificação"
        onClose={() => setOpenCreatePopup(false)}
      >
        <CreateNotification onClose={() => setOpenCreatePopup(false)} />
      </BasePopup>
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
