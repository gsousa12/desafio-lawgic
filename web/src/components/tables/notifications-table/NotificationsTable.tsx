import { Eye, Pencil } from "lucide-react";
import styles from "./NotificationsTable.module.scss";
import { NotificationStatusBadge } from "@/components/badges/notification-status-badge/NotificationStatusBadge";
import { convertDateToPtBr, getPersonFirstName } from "@/common/utils/convert";
import { NotifiedPersonEntity } from "@/common/types/entities/person.entity";
import { useState } from "react";
import { NotificationDetailsPopup } from "@/components/popups/notification-details-popup/NotificationDetailsPopup";
import { motion } from "framer-motion";
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
  data: Notification[];
};

export const NotificationsTable = ({ data }: NotificationsTableProps) => {
  const [openDetailsPopup, setOpenDetailsPopup] = useState<boolean>(false);
  const [notificationInFocus, setNotificationInFocus] = useState<Notification>(
    data[0]
  );
  const handleOpenNotificationDetails = (notification: Notification) => {
    setNotificationInFocus(notification);
    setOpenDetailsPopup(true);
  };

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
          {data.length === 0 ? (
            <tr>
              <td colSpan={5} className={styles.empty}>
                Nenhuma notificação encontrada.
              </td>
            </tr>
          ) : (
            data.map((notification, index) => {
              const notifiedPerson = notification.notifiedPerson;
              const personName = (notifiedPerson as any)?.name;
              const personEmail = (notifiedPerson as any)?.email;

              return (
                <motion.tr
                  key={notification.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.3,
                    ease: "easeOut",
                    delay: index * 0.1,
                  }}
                >
                  <td className={styles.titleCell}>{notification.title}</td>

                  <td>
                    <div className={styles.personCell}>
                      <span className={styles.personName}>
                        {getPersonFirstName(personName) ?? "-"}
                      </span>
                      <span className={styles.personEmail}>
                        {personEmail ?? ""}
                      </span>
                    </div>
                  </td>

                  <td>
                    <NotificationStatusBadge status={notification.status} />
                  </td>

                  <td>{convertDateToPtBr(notification.hearingDate)}</td>

                  <td className={styles.actionsCell}>
                    <button
                      type="button"
                      className={styles.iconBtn}
                      title="Detalhes"
                      onClick={() =>
                        handleOpenNotificationDetails(notification)
                      }
                    >
                      <Eye />
                    </button>
                    <button
                      type="button"
                      className={
                        notification.status !== "validation"
                          ? styles.iconBtn
                          : styles.disableIconBtn
                      }
                      title={
                        notification.status !== "validation"
                          ? "Editar"
                          : "Notificações em validação não podem ser editadas"
                      }
                      disabled={notification.status === "validation"}
                      onClick={() => alert("Editar")}
                    >
                      <Pencil />
                    </button>
                  </td>
                </motion.tr>
              );
            })
          )}
        </tbody>
      </table>
      <NotificationDetailsPopup
        openDetailsPopup={openDetailsPopup}
        notificationInFocus={notificationInFocus}
        setOpenDetailsPopup={setOpenDetailsPopup}
      />
    </div>
  );
};
