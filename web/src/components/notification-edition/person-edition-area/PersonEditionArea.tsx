import { useMemo, useState } from "react";
import styles from "./PersonEditionArea.module.scss";
import type { Notification } from "@/components/tables/notifications-table/NotificationsTable";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useApiMutation } from "@/api/dispatchs/hooks";
import { api } from "@/api/axios";
import { Loader } from "@/components/loader/Loader";
import { AlertPopup } from "@/components/popups/alert-popup/AlertPopup";
import { CircleX } from "lucide-react";

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

const editableEmail = z
  .union([z.literal(""), z.string().trim().email("E-mail inválido")])
  .optional();

const editableCep = z
  .union([
    z.literal(""),
    z
      .string()
      .trim()
      .refine(
        (v) => v.replace(/\D+/g, "").length === 8,
        "O CEP deve ter 8 caracteres (com ou sem hífen)."
      ),
  ])
  .optional();

const editableUF = z
  .union([
    z.literal(""),
    z
      .string()
      .trim()
      .length(2, "O estado deve ter exatamente 2 caracteres (ex: CE)."),
  ])
  .optional();

const PersonEditSchema = z.object({
  name: editableStr(5, 100),
  email: editableEmail,
  phone: z.union([z.literal(""), z.string().trim()]).optional(),
  cep: editableCep,
  state: editableUF,
  city: editableStr(5, 100),
  neighborhood: editableStr(5, 100),
  street: editableStr(5, 100),
});

type PersonEditForm = z.infer<typeof PersonEditSchema>;
interface PersonEditionAreaProps {
  notification: Notification;
  onClose: () => void;
  refetch: () => void;
}
export const PersonEditionArea = ({
  notification,
  onClose,
  refetch,
}: PersonEditionAreaProps) => {
  const notified = useMemo(() => {
    const np: any = (notification as any)?.notifiedPerson;
    if (!np) return undefined;
    if (Array.isArray(np)) return np.length > 0 ? np[0] : undefined;
    return np;
  }, [notification]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PersonEditForm>({
    resolver: zodResolver(PersonEditSchema),
    defaultValues: {},
  });

  const ph = {
    name: notified?.name ?? "",
    email: notified?.email ?? "",
    phone: notified?.phone ?? "",
    cep: notified?.cep ?? "",
    state: notified?.state ?? "",
    city: notified?.city ?? "",
    neighborhood: notified?.neighborhood ?? "",
    street: notified?.street ?? "",
  };

  const handleRefetchPage = () => {
    setOpenAlertPopup(false);
    refetch();
  };

  const [openAlertPopup, setOpenAlertPopup] = useState<boolean>(false);
  const {
    mutateAsync: submitPersonEdition,
    isPending,
    isError,
    error,
  } = useApiMutation<any, PersonEditFormRequest>((data) =>
    api.put("/notifications/person", data)
  );
  type PersonEditFormRequest = PersonEditForm & {
    notificationId: string;
  };
  const onSubmit = async (data: PersonEditForm) => {
    const request: PersonEditFormRequest = {
      notificationId: notification.id,
      name: data.name || undefined,
      email: data.email || undefined,
      phone: data.phone || undefined,
      cep: data.cep || undefined,
      state: data.state || undefined,
      city: data.city || undefined,
      neighborhood: data.neighborhood || undefined,
      street: data.street || undefined,
    };
    try {
      await submitPersonEdition(request);
      setOpenAlertPopup(true);
      onClose();
      refetch();
    } catch (err) {
      setOpenAlertPopup(true);
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className={styles.grid}>
        <div className={styles.row}>
          <label className={styles.label} htmlFor="name">
            Nome
          </label>
          <input
            id="name"
            type="text"
            placeholder={ph.name}
            className={styles.input}
            {...register("name")}
          />
          {errors.name && (
            <span className={styles.error}>{errors.name.message}</span>
          )}
        </div>

        <div className={styles.row}>
          <label className={styles.label} htmlFor="email">
            E-mail
          </label>
          <input
            id="email"
            type="email"
            placeholder={ph.email}
            className={styles.input}
            {...register("email")}
          />
          {errors.email && (
            <span className={styles.error}>{errors.email.message}</span>
          )}
        </div>

        <div className={styles.row}>
          <label className={styles.label} htmlFor="phone">
            Telefone
          </label>
          <input
            id="phone"
            type="text"
            placeholder={ph.phone}
            className={styles.input}
            {...register("phone")}
          />
          {errors.phone && (
            <span className={styles.error}>{errors.phone.message}</span>
          )}
        </div>

        <div className={styles.row}>
          <label className={styles.label} htmlFor="cep">
            CEP
          </label>
          <input
            id="cep"
            type="text"
            placeholder={ph.cep}
            className={styles.input}
            {...register("cep")}
          />
          {errors.cep && (
            <span className={styles.error}>{errors.cep.message}</span>
          )}
        </div>

        <div className={styles.row}>
          <label className={styles.label} htmlFor="state">
            UF
          </label>
          <input
            id="state"
            type="text"
            placeholder={ph.state}
            className={styles.input}
            {...register("state")}
          />
          {errors.state && (
            <span className={styles.error}>{errors.state.message}</span>
          )}
        </div>

        <div className={styles.row}>
          <label className={styles.label} htmlFor="city">
            Cidade
          </label>
          <input
            id="city"
            type="text"
            placeholder={ph.city}
            className={styles.input}
            {...register("city")}
          />
          {errors.city && (
            <span className={styles.error}>{errors.city.message}</span>
          )}
        </div>

        <div className={styles.row}>
          <label className={styles.label} htmlFor="neighborhood">
            Bairro
          </label>
          <input
            id="neighborhood"
            type="text"
            placeholder={ph.neighborhood}
            className={styles.input}
            {...register("neighborhood")}
          />
          {errors.neighborhood && (
            <span className={styles.error}>{errors.neighborhood.message}</span>
          )}
        </div>

        <div className={styles.row}>
          <label className={styles.label} htmlFor="street">
            Rua
          </label>
          <input
            id="street"
            type="text"
            placeholder={ph.street}
            className={styles.input}
            {...register("street")}
          />
          {errors.street && (
            <span className={styles.error}>{errors.street.message}</span>
          )}
        </div>
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
          title="Erro ao editar notificado"
          description={error?.message}
          icon={<CircleX />}
          confirmLabel="Ok"
          onConfirm={() => handleRefetchPage()}
        />
      )}
    </form>
  );
};
