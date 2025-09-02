import React, { useMemo } from "react";
import styles from "./NotificationDetails.module.scss";
import type { Notification } from "@/components/tables/notifications-table/NotificationsTable";
import { NotifiedPersonEntity } from "@/common/types/entities/person.entity";
import { NotificationStatusBadge } from "../badges/notification-status-badge/NotificationStatusBadge";

interface NotificationDetailsProps {
  notification: Notification;
}

export const NotificationDetails = ({
  notification,
}: NotificationDetailsProps) => {
  const notified = useMemo(() => {
    const notifiedPerson: NotifiedPersonEntity[] | undefined = (
      notification as Notification
    )?.notifiedPerson;
    if (!notifiedPerson) return undefined;
    if (Array.isArray(notifiedPerson))
      return notifiedPerson.length > 0 ? notifiedPerson[0] : undefined;
    return notifiedPerson;
  }, [notification]);

  return (
    <div className={styles.container}>
      <div className={styles.sectionTitle}>Notificação:</div>
      <div className={styles.header}>
        <div className={styles.title} title={notification.title || ""}>
          {notification.title || "—"}
        </div>
        <div className={styles.status}>
          <NotificationStatusBadge status={notification.status} />
        </div>
      </div>

      <div className={styles.descriptionCard}>
        <div className={styles.label}>Descrição</div>
        <div className={`${styles.value} ${styles.preWrap}`}>
          {notification.description || "—"}
        </div>
      </div>

      <div className={styles.grid}>
        <div className={styles.field}>
          <div className={styles.label}>Data da Audiência</div>
          <div className={styles.value}>{notification.hearingDate}</div>
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionTitle}>Pessoa Notificada:</div>
        <div className={styles.grid}>
          <div className={styles.field}>
            <div className={styles.label}>Nome</div>
            <div className={styles.value}>{notified?.name || "—"}</div>
          </div>

          <div className={styles.field}>
            <div className={styles.label}>E-mail</div>
            <div className={styles.value}>{notified?.email || "—"}</div>
          </div>

          <div className={styles.field}>
            <div className={styles.label}>Telefone</div>
            <div className={styles.value}>{notified?.phone || "—"}</div>
          </div>

          <div className={styles.field}>
            <div className={styles.label}>CEP</div>
            <div className={styles.value}>{notified?.cep || "—"}</div>
          </div>

          <div className={styles.field}>
            <div className={styles.label}>UF</div>
            <div className={styles.value}>
              {notified?.state?.toUpperCase?.() || "—"}
            </div>
          </div>

          <div className={styles.field}>
            <div className={styles.label}>Cidade</div>
            <div className={styles.value}>{notified?.city || "—"}</div>
          </div>

          <div className={styles.field}>
            <div className={styles.label}>Bairro</div>
            <div className={styles.value}>{notified?.neighborhood || "—"}</div>
          </div>

          <div className={styles.field}>
            <div className={styles.label}>Rua</div>
            <div className={styles.value}>{notified?.street || "—"}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
