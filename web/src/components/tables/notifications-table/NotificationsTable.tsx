import { CircleX, Eye, Pencil } from "lucide-react";
import styles from "./NotificationsTable.module.scss";
import { NotificationStatusBadge } from "@/components/badges/notification-status-badge/NotificationStatusBadge";
import { convertDateToPtBr } from "@/common/utils/convert";
import { NotifiedPersonEntity } from "@/common/types/entities/person.entity";

export type Notification = {
  id: string;
  authorId: string;
  reviewerId: string | null;
  title: string;
  description?: string;
  hearingDate: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  canceledAt: string | null;
  notifiedPerson?: NotifiedPersonEntity[];
};

type NotificationsTableProps = {
  data?: Notification[];
};

export const NotificationsTable = ({ data }: NotificationsTableProps) => {
  return (
    <div className={styles.wrapper}>
      <table className={styles.table} role="table">
        <thead className={styles.thead}>
          <tr>
            <th>Título</th>
            <th>Notificado</th>
            <th>Status</th>
            <th>Data da audiência</th>
            <th className={styles.actionsCol}>Ações</th>
          </tr>
        </thead>

        <tbody className={styles.tbody}>
          {data!.length === 0 ? (
            <tr>
              <td colSpan={5} className={styles.empty}>
                Nenhuma notificação encontrada.
              </td>
            </tr>
          ) : (
            data!.map((notification) => {
              const hasNotifiedPerson =
                notification.notifiedPerson &&
                notification.notifiedPerson.length > 0;
              const notifiedPerson = hasNotifiedPerson
                ? notification.notifiedPerson![0]
                : null;

              return (
                <tr key={notification.id}>
                  <td className={styles.titleCell}>{notification.title}</td>

                  <td>
                    <div className={styles.personCell}>
                      <span className={styles.personName}>
                        {notifiedPerson?.name ?? "-"}
                      </span>
                      <span className={styles.personEmail}>
                        {notifiedPerson?.email ?? ""}
                      </span>
                    </div>
                  </td>

                  <td>
                    {<NotificationStatusBadge status={notification.status} />}
                  </td>
                  <td>{convertDateToPtBr(notification.hearingDate)}</td>

                  <td className={styles.actionsCell}>
                    <button
                      type="button"
                      className={styles.iconBtn}
                      title="Detalhes"
                      aria-label="Ver detalhes"
                      onClick={() => {}}
                    >
                      <Eye />
                    </button>

                    <button
                      type="button"
                      className={styles.iconBtn}
                      title="Editar"
                      aria-label="Editar"
                      onClick={() => {}}
                    >
                      <Pencil />
                    </button>

                    <button
                      type="button"
                      className={`${styles.iconBtn} ${styles.danger}`}
                      title="Cancelar"
                      aria-label="Cancelar"
                      onClick={() => {}}
                    >
                      <CircleX />
                    </button>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
};
