import React, { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  useForm,
  FieldErrors,
  SubmitHandler,
  type FieldValues,
  type Resolver,
} from "react-hook-form";
import { z } from "zod";
import styles from "./CreateNotification.module.scss";
import { api } from "@/api/axios";

/* =========================================================
   AXIOS (withCredentials para cookie HttpOnly)
   ========================================================= */
// const http = axios.create({
//   baseURL: "http://localhost:3000/api",
//   withCredentials: true,
// });

/* =========================================================
   TYPES — Dynamic schema
   ========================================================= */
type FieldType = "text" | "textarea" | "email" | "date" | "radio";

type FormField = {
  id: string;
  label: string;
  type: FieldType;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  format?: "email" | "date";
  options?: { label: string; value: string | number | boolean }[];
};

type FormSchemaResponse = {
  stepKey: "CREATE_NOTIFICATION" | "CREATE_NOTIFIED_PERSON" | string;
  title: string;
  fields: FormField[];
};

/* =========================================================
   TYPES — Controller
   ========================================================= */
export type Step1FormValues = {
  title?: string;
  description?: string;
  hearingDate?: string; // ISO-Z no submit
};

export type Step2FormValues = {
  name?: string;
  email?: string;
  phone?: string;
  cep?: string;
  state?: string;
  city?: string;
  neighborhood?: string;
  street?: string;
};

type Loading = {
  step1: boolean;
  step2: boolean;
};

type SchemaState = {
  schema: FormSchemaResponse | null;
  loading: boolean;
  error: string | null;
};

export type CreateNotificationController = {
  step: 1 | 2;
  goNext: () => void;
  goPrev: () => void;
  goToStep: (s: 1 | 2) => void;

  loading: Loading;
  finished: boolean;

  step1Locked: boolean;
  canGoNext: boolean;

  createdNotificationId?: string;
  step1Data?: Step1FormValues;
  step2Data?: Step2FormValues;

  schemas: {
    step1: SchemaState;
    step2: SchemaState;
  };

  createNotification: (payload: Record<string, any>) => Promise<void>;
  assignPerson: (payload: Record<string, any>) => Promise<void>;
};

/* =========================================================
   HELPERS (arrow functions ONLY)
   ========================================================= */
const toIsoZFromLocal = (input: string): string => {
  if (!input) return input;
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(input)) return `${input}:00.000Z`;
  if (/^\d{4}-\d{2}-\d{2}$/.test(input)) return `${input}T00:00:00.000Z`;
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/.test(input))
    return `${input}.000Z`;
  return input;
};

const fromIsoZToLocalInput = (iso?: string): string => {
  if (!iso || typeof iso !== "string") return "";
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(iso)) return iso;
  const trimmed = iso.replace("Z", "");
  const m = trimmed.match(/^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2})/);
  return m ? m[1] : "";
};

type ApiEnvelope<T> = {
  success: boolean;
  message: string;
  data: T;
};

const fetchSchema = async (
  stepKey: "CREATE_NOTIFICATION" | "CREATE_NOTIFIED_PERSON"
): Promise<FormSchemaResponse> => {
  const res = await api.get<ApiEnvelope<FormSchemaResponse>>(
    `/forms/${stepKey}`
  );
  return res.data.data;
};

const apiCreateNotification = async (
  payload: Record<string, any>
): Promise<{ id: string; status: string }> => {
  const { data } = await api.post<{ id: string; status: string }>(
    "/notifications",
    payload
  );
  return data;
};

const apiCreateNotifiedPerson = async (payload: Record<string, any>) => {
  const { data } = await api.post("/notifications/person", payload);
  alert("envio");
  return data;
};

/* =========================================================
   CONTROLLER (hook) — toda a lógica aqui
   ========================================================= */
export const useCreateNotificationController =
  (): CreateNotificationController => {
    const [step, setStep] = useState<1 | 2>(1);
    const [loading, setLoading] = useState<Loading>({
      step1: false,
      step2: false,
    });
    const [finished, setFinished] = useState(false);

    const [createdNotificationId, setCreatedNotificationId] = useState<
      string | undefined
    >(undefined);
    const [step1Data, setStep1Data] = useState<Step1FormValues | undefined>(
      undefined
    );
    const [step2Data, setStep2Data] = useState<Step2FormValues | undefined>(
      undefined
    );

    const [schemaStep1, setSchemaStep1] = useState<SchemaState>({
      schema: null,
      loading: false,
      error: null,
    });
    const [schemaStep2, setSchemaStep2] = useState<SchemaState>({
      schema: null,
      loading: false,
      error: null,
    });

    const step1Locked = useMemo(
      () => Boolean(createdNotificationId),
      [createdNotificationId]
    );
    const canGoNext = step1Locked;

    const goNext = useCallback(() => {
      if (step === 1 && canGoNext) setStep(2);
    }, [step, canGoNext]);

    const goPrev = useCallback(() => {
      if (step === 2) setStep(1);
    }, [step]);

    const goToStep = useCallback(
      (s: 1 | 2) => {
        if (s === 1) return setStep(1);
        if (s === 2 && canGoNext) return setStep(2);
      },
      [canGoNext]
    );

    useEffect(() => {
      let active = true;
      (async () => {
        try {
          setSchemaStep1((prev) => ({ ...prev, loading: true, error: null }));
          const schema = await fetchSchema("CREATE_NOTIFICATION");
          if (!active) return;
          setSchemaStep1({ schema, loading: false, error: null });
        } catch {
          if (!active) return;
          setSchemaStep1({
            schema: null,
            loading: false,
            error: "Falha ao carregar formulário de criação.",
          });
        }
      })();
      return () => {
        active = false;
      };
    }, []);

    const ensureStep2Schema = useCallback(async () => {
      if (schemaStep2.schema || schemaStep2.loading) return;
      try {
        setSchemaStep2((prev) => ({ ...prev, loading: true, error: null }));
        const schema = await fetchSchema("CREATE_NOTIFIED_PERSON");
        setSchemaStep2({ schema, loading: false, error: null });
      } catch {
        setSchemaStep2({
          schema: null,
          loading: false,
          error: "Falha ao carregar formulário da pessoa.",
        });
      }
    }, [schemaStep2.schema, schemaStep2.loading]);

    const createNotification = useCallback(
      async (payload: Record<string, any>) => {
        if (!schemaStep1.schema) return;

        const fields = schemaStep1.schema.fields;
        const prepared: Record<string, any> = { ...payload };
        for (const f of fields) {
          if (f.type === "date" && prepared[f.id]) {
            prepared[f.id] = toIsoZFromLocal(String(prepared[f.id]));
          }
        }

        setLoading((l) => ({ ...l, step1: true }));
        try {
          const res = await apiCreateNotification(prepared);
          setStep1Data(prepared as Step1FormValues);
          setCreatedNotificationId(res.id);
          setStep(2);
          await ensureStep2Schema();
        } finally {
          setLoading((l) => ({ ...l, step1: false }));
        }
      },
      [schemaStep1.schema, ensureStep2Schema]
    );

    const assignPerson = useCallback(
      async (payload: Record<string, any>) => {
        if (!createdNotificationId) return;
        alert("aq");
        setLoading((l) => ({ ...l, step2: true }));
        try {
          const body = { notificationId: createdNotificationId, ...payload };
          await apiCreateNotifiedPerson(body);
          setStep2Data(payload as Step2FormValues);
          setFinished(true);
        } finally {
          setLoading((l) => ({ ...l, step2: false }));
        }
      },
      [createdNotificationId]
    );

    return {
      step,
      goNext,
      goPrev,
      goToStep,
      loading,
      finished,
      step1Locked,
      canGoNext,
      createdNotificationId,
      step1Data,
      step2Data,
      schemas: {
        step1: schemaStep1,
        step2: schemaStep2,
      },
      createNotification,
      assignPerson,
    };
  };

/* =========================================================
   UI HELPERS — validação dinâmica com Zod (v4 classic friendly)
   ========================================================= */
type ZodShape = Record<string, z.ZodTypeAny>;

const makeZodSchema = (fields?: FormField[]): z.ZodObject<ZodShape> => {
  if (!Array.isArray(fields) || fields.length === 0) {
    return z.object({}) as unknown as z.ZodObject<ZodShape>;
  }

  const shape: Record<string, z.ZodTypeAny> = {};

  for (const f of fields) {
    if (
      f.type === "radio" &&
      Array.isArray(f.options) &&
      f.options.length > 0
    ) {
      const valuesArr = Array.from(
        new Set(f.options.map((o) => String(o.value)))
      );
      if (valuesArr.length === 0) {
        shape[f.id] = z.string().optional().or(z.literal(""));
      } else {
        const values = valuesArr as [string, ...string[]];
        const enumSchema = z.enum(values);
        shape[f.id] = f.required
          ? enumSchema
          : z.union([enumSchema, z.literal("")]);
      }
      continue;
    }

    let str = z.string();
    if (f.format === "email" || f.type === "email")
      str = str.email("E-mail inválido");
    if (typeof f.minLength === "number")
      str = str.min(f.minLength, `Mínimo de ${f.minLength} caracteres`);
    if (typeof f.maxLength === "number")
      str = str.max(f.maxLength, `Máximo de ${f.maxLength} caracteres`);
    if (f.required) str = str.min(1, "Campo obrigatório");

    shape[f.id] = f.required ? str : z.union([str, z.literal("")]);
  }

  return z.object(shape as ZodShape) as unknown as z.ZodObject<ZodShape>;
};

const makeDefaultValues = (fields?: FormField[]) => {
  const defaults: Record<string, any> = {};
  if (!Array.isArray(fields)) return defaults;
  for (const f of fields) defaults[f.id] = "";
  return defaults;
};

const normalizeDefaultsForFields = (
  fields: FormField[],
  incoming?: Record<string, any>
) => {
  if (!incoming) return undefined;
  const out: Record<string, any> = { ...incoming };
  for (const f of fields) {
    const v = out[f.id];
    if (v == null) continue;
    if (f.type === "date" && typeof v === "string")
      out[f.id] = fromIsoZToLocalInput(v);
    else if (f.type === "radio") out[f.id] = String(v);
  }
  return out;
};

/* =========================================================
   Resolver custom — Zod -> RHF (evita @hookform/resolvers)
   ========================================================= */
const makeRHFZodResolver =
  (schema: z.ZodObject<ZodShape>): Resolver<FieldValues> =>
  async (values) => {
    const parsed = schema.safeParse(values);
    if (parsed.success) {
      return { values: parsed.data, errors: {} };
    }
    const errs: Record<string, any> = {};
    for (const issue of parsed.error.issues) {
      const name = issue.path.join(".");
      if (!name) continue;
      // guarda apenas a primeira mensagem por campo
      if (!errs[name]) {
        errs[name] = {
          type: issue.code || "validation",
          message: issue.message,
        };
      }
    }
    return { values: {}, errors: errs };
  };

/* =========================================================
   DynamicForm — apenas apresentação (RHF + Zod via resolver custom)
   ========================================================= */
type DynamicFormProps = {
  fields?: FormField[];
  locked?: boolean;
  submitLabel: string;
  loading?: boolean;
  defaultValues?: Record<string, any>;
  onSubmit: (values: Record<string, any>) => void | Promise<void>;
  onBack?: () => void;
};

const DynamicForm: React.FC<DynamicFormProps> = ({
  fields,
  locked,
  submitLabel,
  loading,
  defaultValues,
  onSubmit,
  onBack,
}) => {
  const safeFields = useMemo<FormField[]>(
    () => (Array.isArray(fields) ? fields : []),
    [fields]
  );

  const schema = useMemo<z.ZodObject<ZodShape>>(
    () => makeZodSchema(safeFields),
    [safeFields]
  );

  const resolver = useMemo(() => makeRHFZodResolver(schema), [schema]);

  const computedDefaults = useMemo(() => {
    const base = makeDefaultValues(safeFields);
    const normalized = normalizeDefaultsForFields(safeFields, defaultValues);
    return { ...base, ...(normalized ?? {}) };
  }, [safeFields, defaultValues]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FieldValues>({
    resolver,
    defaultValues: computedDefaults,
    mode: "onBlur",
  });

  const renderField = (f: FormField, errs: FieldErrors<FieldValues>) => {
    const commonProps = {
      id: f.id,
      "aria-invalid": !!errs[f.id],
      disabled: locked,
      readOnly: locked,
      className: f.type === "textarea" ? styles.textarea : styles.input,
      placeholder: f.label,
      ...register(f.id),
    };

    switch (f.type) {
      case "textarea":
        return <textarea {...(commonProps as any)} />;
      case "email":
      case "text":
        return (
          <input
            type={f.type === "email" ? "email" : "text"}
            {...(commonProps as any)}
          />
        );
      case "date":
        return <input type="datetime-local" {...(commonProps as any)} />;
      case "radio":
        return (
          <div className={styles.field}>
            <div className={styles.label}>{f.label}</div>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              {(f.options ?? []).map((opt) => {
                const val = String(opt.value);
                const inputId = `${f.id}-${val}`;
                return (
                  <label
                    key={val}
                    htmlFor={inputId}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <input
                      id={inputId}
                      type="radio"
                      value={val}
                      disabled={locked}
                      {...register(f.id)}
                    />
                    <span>{opt.label}</span>
                  </label>
                );
              })}
            </div>
          </div>
        );
      default:
        return <input type="text" {...(commonProps as any)} />;
    }
  };

  const submit: SubmitHandler<FieldValues> = async (vals) => {
    await onSubmit({ ...vals });
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit(submit)}>
      {safeFields.length === 0 ? (
        <p className={styles.helper}>Nenhum campo disponível.</p>
      ) : (
        safeFields.map((f) => (
          <div key={f.id} className={styles.field}>
            {f.type !== "radio" && (
              <label className={styles.label} htmlFor={f.id}>
                {f.label} {f.required ? "*" : ""}
              </label>
            )}
            {renderField(f, errors)}
            {errors[f.id]?.message && (
              <span className={styles.error}>
                {String((errors as any)[f.id]?.message)}
              </span>
            )}
          </div>
        ))
      )}

      <div className={styles.actions}>
        {onBack && (
          <button
            type="button"
            className={styles.btn}
            onClick={onBack}
            disabled={loading}
          >
            Voltar
          </button>
        )}
        <button
          type="submit"
          className={`${styles.btn} ${styles.btnPrimary}`}
          disabled={loading || locked || safeFields.length === 0}
        >
          {loading ? "Enviando..." : submitLabel}
        </button>
      </div>
    </form>
  );
};

/* =========================================================
   Página: CreateNotification — usa a controller
   ========================================================= */
const CreateNotification: React.FC = () => {
  const ctrl = useCreateNotificationController();

  return (
    <div className={styles.container}>
      <div className={styles.stepper}>
        <div
          className={`${styles.step} ${ctrl.step === 1 ? styles.active : ""}`}
          role="button"
          tabIndex={-1}
          onClick={() => ctrl.goToStep(1)}
        >
          <span className={styles.stepNumber}>1</span>
          <span>Criação da Notificação</span>
        </div>
        <div
          className={`${styles.step} ${ctrl.step === 2 ? styles.active : ""} ${
            ctrl.canGoNext ? "" : styles.disabled
          }`}
          role="button"
          tabIndex={-1}
          onClick={() => ctrl.goToStep(2)}
          aria-disabled={!ctrl.canGoNext}
        >
          <span className={styles.stepNumber}>2</span>
          <span>Atribuir Pessoa</span>
        </div>
      </div>

      <div className={styles.content}>
        {ctrl.step === 1 && (
          <>
            {ctrl.schemas.step1.loading && (
              <p className={styles.helper}>Carregando formulário...</p>
            )}
            {ctrl.schemas.step1.error && (
              <p className={styles.error}>{ctrl.schemas.step1.error}</p>
            )}
            {ctrl.schemas.step1.schema && (
              <DynamicForm
                fields={ctrl.schemas.step1.schema?.fields}
                locked={ctrl.step1Locked}
                loading={ctrl.loading.step1}
                submitLabel="Criar e continuar"
                defaultValues={ctrl.step1Data}
                onSubmit={ctrl.createNotification}
              />
            )}
          </>
        )}

        {ctrl.step === 2 && (
          <>
            {ctrl.schemas.step2.loading && (
              <p className={styles.helper}>Carregando formulário...</p>
            )}
            {ctrl.schemas.step2.error && (
              <p className={styles.error}>{ctrl.schemas.step2.error}</p>
            )}
            {ctrl.schemas.step2.schema && (
              <DynamicForm
                fields={ctrl.schemas.step2.schema?.fields}
                loading={ctrl.loading.step2}
                submitLabel="Concluir"
                defaultValues={ctrl.step2Data}
                onSubmit={ctrl.assignPerson}
                onBack={ctrl.goPrev}
              />
            )}
          </>
        )}

        {ctrl.finished && (
          <p className={styles.helper}>Fluxo concluído com sucesso.</p>
        )}
      </div>
    </div>
  );
};

export default CreateNotification;
