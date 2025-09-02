import styles from "./NotificationEditionArea.module.scss";
import type { Notification } from "@/components/tables/notifications-table/NotificationsTable";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toLocalInput } from "@/common/utils/convert";
import { api } from "@/api/axios";

interface NotificationEditionAreaProps {
  notification: Notification;
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
        .min(min, msgMin ?? `Mín. ${min}`)
        .max(max, msgMax ?? `Máx. ${max}`),
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
}: NotificationEditionAreaProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<NotificationEditForm>({
    resolver: zodResolver(NotificationEditSchema),
    defaultValues: {},
  });

  const phTitle = notification?.title ?? "";
  const phDescription = notification?.description ?? "";
  const phHearing = toLocalInput(notification?.hearingDate);

  const onSubmit = (data: NotificationEditForm) => {
    // handleSubmitData(data);
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
          Audiência
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
    </form>
  );
};
