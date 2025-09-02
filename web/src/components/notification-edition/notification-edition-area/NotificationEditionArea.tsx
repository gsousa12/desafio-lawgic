import styles from "./NotificationEditionArea.module.scss";
import type { Notification } from "@/components/tables/notifications-table/NotificationsTable";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toLocalInput } from "@/common/utils/convert";
import { api } from "@/api/axios";
import { useApiMutation } from "@/api/dispatchs/hooks";
import { Loader } from "@/components/loader/Loader";
import { AlertPopup } from "@/components/popups/alert-popup/AlertPopup";
import { useState } from "react";
import { CircleX } from "lucide-react";

interface NotificationEditionAreaProps {
  notification: Notification;
  onClose: () => void;
  refetch: () => void;
}

const editableStr = (
  min: number,
  max: number,
  msgMin?: string,
  msgMax?: string
) =>
  z
    .union([
      z.literal(""),
      z
        .string()
        .trim()
        .min(
          min,
          msgMin ?? `O campo title deve ter no mínimo ${min} caracteres `
        )
        .max(
          max,
          msgMax ?? `O campo title deve ter no máximo ${max} caracteres. `
        ),
    ])
    .optional();

const editableDateTimeLocal = z
  .union([
    z.literal(""),
    z
      .string()
      .refine((v) => !isNaN(new Date(v).getTime()), "Data/hora inválida"),
  ])
  .optional();

const NotificationEditSchema = z.object({
  title: editableStr(3, 120),
  description: editableStr(10, 1000),
  hearingDate: editableDateTimeLocal,
});

type NotificationEditForm = z.infer<typeof NotificationEditSchema>;

export const NotificationEditionArea = ({
  notification,
  onClose,
  refetch,
}: NotificationEditionAreaProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<NotificationEditForm>({
    resolver: zodResolver(NotificationEditSchema),
    defaultValues: {
      title: undefined,
      description: undefined,
    },
  });

  const phTitle = notification?.title ?? "";
  const phDescription = notification?.description ?? "";
  const phHearing = toLocalInput(notification?.hearingDate);
  const [openAlertPopup, setOpenAlertPopup] = useState<boolean>(false);

  const handleRefetchPage = () => {
    setOpenAlertPopup(false);
    refetch();
  };

  type SubmitPersonEditionRequest = Pick<
    NotificationEditForm,
    "title" | "description" | "hearingDate"
  > & {
    notificationId: string;
  };
  const {
    mutateAsync: submitPersonEdition,
    isPending,
    isError,
    error,
  } = useApiMutation<any, SubmitPersonEditionRequest>((data) =>
    api.put("/notifications/notification", data)
  );

  const onSubmit = async (data: NotificationEditForm) => {
    const request: SubmitPersonEditionRequest = {
      notificationId: notification.id,
      title: data.title || undefined,
      description: data.description || undefined,
      hearingDate: data.hearingDate
        ? new Date(data.hearingDate).toISOString()
        : undefined,
    };
    try {
      await submitPersonEdition(request);
      setOpenAlertPopup(true);
      refetch();
      onClose();
    } catch (error) {
      setOpenAlertPopup(true);
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className={styles.row}>
        <label className={styles.label} htmlFor="title">
          Título
        </label>
        <input
          id="title"
          type="text"
          placeholder={phTitle}
          className={styles.input}
          {...register("title")}
        />
        {errors.title && (
          <span className={styles.error}>{errors.title.message}</span>
        )}
      </div>

      <div className={styles.row}>
        <label className={styles.label} htmlFor="description">
          Descrição
        </label>
        <textarea
          id="description"
          placeholder={phDescription}
          className={`${styles.input} ${styles.textarea}`}
          rows={4}
          {...register("description")}
        />
        {errors.description && (
          <span className={styles.error}>{errors.description.message}</span>
        )}
        <small className={styles.hint}>Aceita de 10 a 1000 caracteres.</small>
      </div>

      <div className={styles.row}>
        <label className={styles.label} htmlFor="hearingDate">
          Data da Audiência
        </label>
        <input
          id="hearingDate"
          type="datetime-local"
          defaultValue={phHearing}
          className={styles.input}
          {...register("hearingDate")}
        />
        {errors.hearingDate && (
          <span className={styles.error}>{errors.hearingDate.message}</span>
        )}
      </div>

      <div className={styles.actions}>
        <button
          type="submit"
          className={styles.primaryBtn}
          disabled={isSubmitting}
        >
          Salvar
        </button>
      </div>
      {isPending && <Loader />}
      {isError && (
        <AlertPopup
          open={openAlertPopup}
          title="Erro ao editar notificação"
          description={error?.message}
          icon={<CircleX />}
          confirmLabel="Ok"
          onConfirm={() => handleRefetchPage()}
        />
      )}
    </form>
  );
};
