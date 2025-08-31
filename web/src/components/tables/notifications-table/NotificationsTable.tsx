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

/* Mock de dados — remova quando integrar com a API */
const mockData: Notification[] = [
  {
    id: "f1f77f35-4a86-44da-8ca8-1e52d6310d50",
    authorId: "d8bdfe1b-1917-42e8-9892-e053b2826583",
    reviewerId: null,
    title: "Revisão de Orçam4ento Q4452",
    description:
      "Análise detalhada das projeções de despesas e receitas para o quarto trimestre de 2025.",
    hearingDate: "2025-10-20T13:00:00.000Z",
    status: "in_progress",
    createdAt: "2025-08-31T02:15:37.647Z",
    updatedAt: "2025-08-31T02:15:37.647Z",
    canceledAt: null,
    notifiedPerson: [],
  },
  {
    id: "18fb9ced-9621-4740-87fe-8ff3949b70cd",
    authorId: "550c675a-5b37-4f2a-a3be-13b54f955b16",
    reviewerId: null,
    title: "Revisão de Orçam4ento Q445",
    description:
      "Análise detalhada das projeções de despesas e receitas para o quarto trimestre de 2025.",
    hearingDate: "2025-10-20T13:00:00.000Z",
    status: "validation",
    createdAt: "2025-08-31T01:49:05.318Z",
    updatedAt: "2025-08-31T01:49:44.958Z",
    canceledAt: null,
    notifiedPerson: [
      {
        id: "f685cdc4-5cf8-4be4-8041-08de451c374e",
        notificationId: "18fb9ced-9621-4740-87fe-8ff3949b70cd",
        name: "Maria Silva",
        email: "maria.silva@example.com",
        phone: "88981555205",
        cep: "12345678",
        state: "SP",
        city: "São Paulo",
        neighborhood: "Bairro Exemplo",
        street: "Rua Exemplo, 123",
        createdAt: "2025-08-31T01:49:44.954Z",
        updatedAt: "2025-08-31T01:49:44.954Z",
      },
    ],
  },
];

export const NotificationsTable = ({
  data = mockData,
}: NotificationsTableProps) => {
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
            data.map((notification) => {
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
