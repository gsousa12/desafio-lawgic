import React, { useCallback, useEffect, useMemo } from "react";
import axios from "axios";
import {
  useForm,
  FieldErrors,
  SubmitHandler,
  type FieldValues,
  type Resolver,
} from "react-hook-form";
import { z } from "zod";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { Search } from "lucide-react";
import styles from "./CreateNotification.module.scss";

/* =========================================================
   AXIOS (withCredentials para cookie HttpOnly)
   ========================================================= */
const http = axios.create({
  baseURL: "http://localhost:3000/api",
  withCredentials: true,
});

/* =========================================================
   Tipos para schemas dinâmicos
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

type ApiEnvelope<T> = {
  success: boolean;
  message: string;
  data: T;
};

/* =========================================================
   Tipos do fluxo
   ========================================================= */
export type Step1FormValues = {
  title?: string;
  description?: string;
  hearingDate?: string; // datetime-local string em tela; convertemos p/ ISO-Z no submit
};

export type Step2FormValues = {
  name?: string;
  email?: string;
  phone?: string; // com máscara em tela; converter p/ dígitos no submit
  cep?: string; // validar 8 dígitos
  state?: string; // forçar uppercase
  city?: string;
  neighborhood?: string;
  street?: string;
};

type Loading = {
  step1: boolean;
  step2: boolean;
  cepLookup: boolean;
};

type Schemas = {
  step1?: FormSchemaResponse;
  step2?: FormSchemaResponse;
};

/* =========================================================
   Utils de data/strings
   ========================================================= */
const onlyDigits = (s: string) => s.replace(/\D+/g, "");

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

const maskPhone = (value: string): string => {
  const d = onlyDigits(value).slice(0, 11);
  if (d.length <= 10) {
    // (XX) XXXX-XXXX
    return d
      .replace(/^(\d{0,2})(\d{0,4})(\d{0,4}).*/, (_m, a, b, c) =>
        [
          a && `(${a}`,
          a && a.length === 2 ? ")" : "",
          b && ` ${b}`,
          c && `-${c}`,
        ]
          .filter(Boolean)
          .join("")
      )
      .trim();
  }
  // 11 dígitos → (XX) XXXXX-XXXX
  return d
    .replace(/^(\d{0,2})(\d{0,5})(\d{0,4}).*/, (_m, a, b, c) =>
      [a && `(${a}`, a && a.length === 2 ? ")" : "", b && ` ${b}`, c && `-${c}`]
        .filter(Boolean)
        .join("")
    )
    .trim();
};

/* =========================================================
   API helpers
   ========================================================= */
const fetchSchema = async (
  stepKey: "CREATE_NOTIFICATION" | "CREATE_NOTIFIED_PERSON"
): Promise<FormSchemaResponse> => {
  const res = await http.get<ApiEnvelope<FormSchemaResponse>>(
    `/forms/${stepKey}`
  );
  return res.data.data;
};

const apiCreateNotification = async (
  payload: Record<string, any>
): Promise<any> => {
  const res = await http.post(`/notifications`, payload);
  const data = (res.data?.data ?? res.data) as any;
  console.log(`data from apiCreateNotification:`, data);
  return res;
};

const apiCreateNotifiedPerson = async (payload: Record<string, any>) => {
  const res = await http.post(`/notifications/person`, payload);
  return res.data?.data ?? res.data;
};

type BrasilApiCep = {
  cep: string;
  state: string;
  city: string;
  neighborhood: string;
  street: string;
  service: string;
};

const lookupCepApi = async (cep: string): Promise<BrasilApiCep> => {
  const clean = onlyDigits(cep);
  const resp = await fetch(`https://brasilapi.com.br/api/cep/v1/${clean}`);
  if (!resp.ok) {
    throw new Error("CEP não encontrado");
  }
  return (await resp.json()) as BrasilApiCep;
};

/* =========================================================
   Zustand Store (persist em localStorage)
   ========================================================= */
type CreateNotificationStore = {
  step: 1 | 2;
  notificationId?: string;

  // Drafts
  step1Data: Step1FormValues | null;
  step2Data: Step2FormValues | null;

  schemas: Schemas;
  loading: Loading;
  finished: boolean;

  // Actions
  setStep: (s: 1 | 2) => void;
  resetAll: () => void;

  loadSchema: (
    stepKey: "CREATE_NOTIFICATION" | "CREATE_NOTIFIED_PERSON"
  ) => Promise<void>;

  setStep1Data: (partial: Partial<Step1FormValues>) => void;
  setStep2Data: (partial: Partial<Step2FormValues>) => void;

  createNotification: (payload: Record<string, any>) => Promise<void>;
  assignPerson: (payload: Record<string, any>) => Promise<void>;

  lookupCep: (cep: string) => Promise<BrasilApiCep>;
};

export const useCreateNotificationStore = create<CreateNotificationStore>()(
  persist(
    (set, get) => ({
      step: 1,
      notificationId: undefined,
      step1Data: null,
      step2Data: null,
      schemas: {},
      loading: { step1: false, step2: false, cepLookup: false },
      finished: false,

      setStep: (s) => set({ step: s }),

      resetAll: () =>
        set({
          step: 1,
          notificationId: undefined,
          step1Data: null,
          step2Data: null,
          schemas: {},
          loading: { step1: false, step2: false, cepLookup: false },
          finished: false,
        }),

      loadSchema: async (stepKey) => {
        const key = stepKey === "CREATE_NOTIFICATION" ? "step1" : "step2";
        const existing = get().schemas[key as keyof Schemas];
        if (existing) return;
        try {
          const schema = await fetchSchema(stepKey);
          set((s) => ({
            schemas: {
              ...s.schemas,
              [key]: schema,
            },
          }));
        } catch {
          // opcional: armazenar um erro
        }
      },

      setStep1Data: (partial) =>
        set((s) => ({ step1Data: { ...(s.step1Data ?? {}), ...partial } })),

      setStep2Data: (partial) =>
        set((s) => ({ step2Data: { ...(s.step2Data ?? {}), ...partial } })),

      createNotification: async (payload) => {
        const schema = get().schemas.step1;
        if (!schema) return;

        const prepared: Record<string, any> = { ...payload };
        for (const f of schema.fields) {
          if (f.type === "date" && prepared[f.id]) {
            prepared[f.id] = toIsoZFromLocal(String(prepared[f.id]));
          }
        }

        set((s) => ({ loading: { ...s.loading, step1: true } }));
        try {
          const res = await apiCreateNotification(prepared);
          const notificationId = res.data.data.id;
          if (!notificationId)
            throw new Error("Id da notificação não retornado");
          set({
            notificationId: res.id,
            step1Data: prepared as Step1FormValues,
            step: 2,
          });
          await get().loadSchema("CREATE_NOTIFIED_PERSON");
        } finally {
          set((s) => ({ loading: { ...s.loading, step1: false } }));
        }
      },

      assignPerson: async (payload) => {
        const { notificationId } = get();
        if (!notificationId) return;

        const prepared: Record<string, any> = { ...payload };
        if (prepared.cep) prepared.cep = onlyDigits(String(prepared.cep));
        if (prepared.phone) prepared.phone = onlyDigits(String(prepared.phone));
        if (prepared.state)
          prepared.state = String(prepared.state).toUpperCase();

        set((s) => ({ loading: { ...s.loading, step2: true } }));
        try {
          const body = { notificationId, ...prepared };
          await apiCreateNotifiedPerson(body);
          set({
            step2Data: prepared as Step2FormValues,
            finished: true,
          });
        } finally {
          set((s) => ({ loading: { ...s.loading, step2: false } }));
        }
      },

      lookupCep: async (cep) => {
        set((s) => ({ loading: { ...s.loading, cepLookup: true } }));
        try {
          const data = await lookupCepApi(cep);
          return data;
        } finally {
          set((s) => ({ loading: { ...s.loading, cepLookup: false } }));
        }
      },
    }),
    {
      name: "create-notification-store",
      version: 1,
      storage: createJSONStorage(() => localStorage),
    }
  )
);

/* =========================================================
   Validação dinâmica com Zod (Zod v4 classic friendly)
   ========================================================= */
type ZodShape = Record<string, z.ZodTypeAny>;

const HEARING_DATE_FIELD_ID = "hearingDate";

const makeZodSchema = (fields?: FormField[]): z.ZodObject<ZodShape> => {
  const shape: Record<string, z.ZodTypeAny> = {};

  if (!Array.isArray(fields) || fields.length === 0) {
    return z.object({}) as unknown as z.ZodObject<ZodShape>;
  }

  for (const f of fields) {
    // Base string para text/textarea/email/date
    let str = z.string();

    if (f.format === "email" || f.type === "email") {
      str = str.email("E-mail inválido");
    }

    // Fallback maxLength = 100 se backend não enviar
    const maxLen = typeof f.maxLength === "number" ? f.maxLength : 100;
    if (typeof f.minLength === "number") {
      str = str.min(f.minLength, `Mínimo de ${f.minLength} caracteres`);
    }
    if (maxLen > 0) {
      str = str.max(maxLen, `Máximo de ${maxLen} caracteres`);
    }
    if (f.required) {
      str = str.min(1, "Campo obrigatório");
    }

    // Regras custom por id
    if (f.id === "cep") {
      // valida 8 dígitos (sem alterar o valor do campo)
      str = str.refine((v) => /^\d{8}$/.test(onlyDigits(v)), {
        message: "CEP deve conter 8 dígitos",
      });
    }
    if (f.id === "state") {
      // 2 letras; forçamos uppercase via UI/onChange; aqui só validamos
      str = str.refine((v) => /^[A-Za-z]{2}$/.test(v), {
        message: "UF deve ter 2 letras",
      });
    }
    if (f.id === "phone") {
      // permite vazio quando não required; valida 10–11 dígitos quando preenchido
      str = str.refine(
        (v) => v === "" || [10, 11].includes(onlyDigits(v).length),
        { message: "Telefone deve ter 10 ou 11 dígitos" }
      );
    }
    if (f.id === HEARING_DATE_FIELD_ID) {
      // precisa ser futuro
      str = str.refine(
        (v) => {
          if (!v) return false;
          const iso = toIsoZFromLocal(v);
          const dt = new Date(iso);
          if (Number.isNaN(dt.getTime())) return false;
          return dt.getTime() > Date.now();
        },
        { message: "A data deve ser no futuro" }
      );
    }

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

    // RHF usa "" para vazio — permita "" quando não required
    shape[f.id] = f.required ? str : z.union([str, z.literal("")]);
  }

  return z.object(shape as ZodShape) as unknown as z.ZodObject<ZodShape>;
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
   DynamicForm — RHF + CEP lookup + máscaras
   ========================================================= */
type DynamicFormProps = {
  stepKey: "CREATE_NOTIFICATION" | "CREATE_NOTIFIED_PERSON";
  fields?: FormField[];
  locked?: boolean;
  submitLabel: string;
  loading?: boolean;
  defaultValues?: Record<string, any>;
  onSubmit: (values: Record<string, any>) => void | Promise<void>;
  onBack?: () => void;
  onCancel?: () => void;
};

const DynamicForm: React.FC<DynamicFormProps> = ({
  stepKey,
  fields,
  locked,
  submitLabel,
  loading,
  defaultValues,
  onSubmit,
  onBack,
  onCancel,
}) => {
  const safeFields = useMemo<FormField[]>(
    () => (Array.isArray(fields) ? fields : []),
    [fields]
  );

  const schema = useMemo(() => makeZodSchema(safeFields), [safeFields]);
  const resolver = useMemo(() => makeRHFZodResolver(schema), [schema]);

  const computedDefaults = useMemo(() => {
    const base: Record<string, any> = {};
    for (const f of safeFields) base[f.id] = "";
    if (defaultValues) {
      // normaliza defaults (datas, UF, phone, radio)
      for (const f of safeFields) {
        const v = (defaultValues as any)[f.id];
        if (v == null) continue;
        if (f.type === "date" && typeof v === "string")
          base[f.id] = fromIsoZToLocalInput(v);
        else if (f.id === "state" && typeof v === "string")
          base[f.id] = v.toUpperCase();
        else if (f.id === "phone" && typeof v === "string")
          base[f.id] = maskPhone(v);
        else if (f.type === "radio") base[f.id] = String(v);
        else base[f.id] = v;
      }
    }
    return base;
  }, [safeFields, defaultValues]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    getValues,
    setError,
    clearErrors,
    reset,
  } = useForm<FieldValues>({
    resolver,
    defaultValues: computedDefaults,
    mode: "onBlur",
  });

  // Reseta o formulário quando defaultValues mudarem (ex.: ao voltar para step 1 bloqueado)
  useEffect(() => {
    reset(computedDefaults);
  }, [computedDefaults, reset]);

  const cepLookupLoading = useCreateNotificationStore(
    (s) => s.loading.cepLookup
  );
  const doCepLookup = useCreateNotificationStore((s) => s.lookupCep);
  const setStep2Data = useCreateNotificationStore((s) => s.setStep2Data);

  // CEP lookup click
  const handleCepLookup = useCallback(async () => {
    const rawCep = String(getValues("cep") ?? "");
    const clean = onlyDigits(rawCep);
    if (clean.length !== 8) {
      setError("cep", { type: "manual", message: "CEP deve conter 8 dígitos" });
      return;
    }
    clearErrors("cep");
    try {
      const data = await doCepLookup(clean);
      // sobrescreve sempre os campos de endereço
      const nextState = String(data.state || "").toUpperCase();
      setValue("state", nextState, { shouldValidate: true, shouldDirty: true });
      setValue("city", data.city || "", {
        shouldValidate: true,
        shouldDirty: true,
      });
      setValue("neighborhood", data.neighborhood || "", {
        shouldValidate: true,
        shouldDirty: true,
      });
      setValue("street", data.street || "", {
        shouldValidate: true,
        shouldDirty: true,
      });
      // sincroniza store draft step2
      setStep2Data({
        state: nextState,
        city: data.city || "",
        neighborhood: data.neighborhood || "",
        street: data.street || "",
      });
    } catch (e: any) {
      setError("cep", {
        type: "manual",
        message: e?.message || "Falha ao buscar CEP",
      });
    }
  }, [doCepLookup, getValues, setError, clearErrors, setValue, setStep2Data]);

  // Handlers com máscara/normalização preservando RHF onChange
  const renderField = (f: FormField, errs: FieldErrors<FieldValues>) => {
    const reg = register(f.id);
    const commonProps = {
      id: f.id,
      name: reg.name,
      ref: reg.ref,
      "aria-invalid": !!errs[f.id],
      disabled: locked || loading,
      readOnly: locked,
      className: f.type === "textarea" ? styles.textarea : styles.input,
      placeholder: f.label,
    } as const;

    if (f.id === "cep") {
      return (
        <div className={styles.inputGroup}>
          <input
            type="text"
            onChange={(e) => reg.onChange(e)}
            defaultValue={computedDefaults[f.id] ?? ""}
            {...commonProps}
          />
          <button
            type="button"
            className={styles.iconBtn}
            onClick={handleCepLookup}
            disabled={locked || !!loading || cepLookupLoading}
            title="Buscar CEP"
            aria-label="Buscar CEP"
          >
            <Search />
          </button>
        </div>
      );
    }

    if (f.id === "state") {
      return (
        <input
          type="text"
          maxLength={2}
          onChange={(e) => {
            const val = e.target.value.toUpperCase().slice(0, 2);
            setValue("state", val, { shouldValidate: true, shouldDirty: true });
            reg.onChange({ ...e, target: { ...e.target, value: val } });
          }}
          defaultValue={computedDefaults[f.id] ?? ""}
          {...commonProps}
        />
      );
    }

    if (f.id === "phone") {
      return (
        <input
          type="tel"
          onChange={(e) => {
            const masked = maskPhone(e.target.value);
            setValue("phone", masked, {
              shouldValidate: true,
              shouldDirty: true,
            });
            reg.onChange({ ...e, target: { ...e.target, value: masked } });
          }}
          defaultValue={computedDefaults[f.id] ?? ""}
          {...commonProps}
        />
      );
    }

    switch (f.type) {
      case "textarea":
        return (
          <textarea
            onChange={(e) => reg.onChange(e)}
            defaultValue={computedDefaults[f.id] ?? ""}
            {...commonProps}
          />
        );
      case "email":
      case "text":
        return (
          <input
            type={f.type === "email" ? "email" : "text"}
            onChange={(e) => reg.onChange(e)}
            defaultValue={computedDefaults[f.id] ?? ""}
            {...commonProps}
          />
        );
      case "date":
        return (
          <input
            type="datetime-local"
            onChange={(e) => reg.onChange(e)}
            defaultValue={computedDefaults[f.id] ?? ""}
            {...commonProps}
          />
        );
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
                      disabled={locked || !!loading}
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
        return (
          <input
            type="text"
            onChange={(e) => reg.onChange(e)}
            defaultValue={computedDefaults[f.id] ?? ""}
            {...commonProps}
          />
        );
    }
  };

  const submit: SubmitHandler<FieldValues> = async (vals) => {
    await onSubmit({ ...vals });
  };

  const showBack = stepKey === "CREATE_NOTIFIED_PERSON" && onBack;

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
        {onCancel && (
          <button
            type="button"
            className={styles.btn}
            onClick={onCancel}
            disabled={!!loading}
          >
            Cancelar
          </button>
        )}
        {showBack && (
          <button
            type="button"
            className={styles.btn}
            onClick={onBack}
            disabled={!!loading}
          >
            Voltar
          </button>
        )}
        <button
          type="submit"
          className={`${styles.btn} ${styles.btnPrimary}`}
          disabled={!!loading || locked || safeFields.length === 0}
        >
          {loading ? "Enviando..." : submitLabel}
        </button>
      </div>
    </form>
  );
};

/* =========================================================
   Componente principal
   ========================================================= */
type CreateNotificationProps = {
  onClose?: () => void; // para fechar o popup
};

const CreateNotification: React.FC<CreateNotificationProps> = ({ onClose }) => {
  const step = useCreateNotificationStore((s) => s.step);
  const setStep = useCreateNotificationStore((s) => s.setStep);
  const notificationId = useCreateNotificationStore((s) => s.notificationId);
  const loading = useCreateNotificationStore((s) => s.loading);
  const finished = useCreateNotificationStore((s) => s.finished);
  const schemas = useCreateNotificationStore((s) => s.schemas);
  const step1Data = useCreateNotificationStore((s) => s.step1Data);
  const step2Data = useCreateNotificationStore((s) => s.step2Data);

  const resetAll = useCreateNotificationStore((s) => s.resetAll);
  const loadSchema = useCreateNotificationStore((s) => s.loadSchema);
  const createNotification = useCreateNotificationStore(
    (s) => s.createNotification
  );
  const assignPerson = useCreateNotificationStore((s) => s.assignPerson);
  const setStep1Data = useCreateNotificationStore((s) => s.setStep1Data);
  const setStep2Data = useCreateNotificationStore((s) => s.setStep2Data);

  const step1Locked = Boolean(notificationId);
  const canGoNext = step1Locked;

  // Carrega schema do Step 1 ao montar
  useEffect(() => {
    loadSchema("CREATE_NOTIFICATION");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Se iniciar no step 2 e schema do step 2 não estiver carregado (persist), garanta o load
  useEffect(() => {
    if (step === 2 && !schemas.step2) {
      loadSchema("CREATE_NOTIFIED_PERSON");
    }
  }, [step, schemas.step2, loadSchema]);

  // Ao terminar com sucesso: fecha e reseta
  useEffect(() => {
    if (finished) {
      onClose?.();
      resetAll();
    }
  }, [finished, onClose, resetAll]);

  const handleSubmitStep1 = useCallback(
    async (payload: Record<string, any>) => {
      setStep1Data(payload);
      await createNotification(payload);
    },
    [createNotification, setStep1Data]
  );

  const handleSubmitStep2 = useCallback(
    async (payload: Record<string, any>) => {
      setStep2Data(payload);
      await assignPerson(payload);
      // finished effect cuidará de fechar e resetar
    },
    [assignPerson, setStep2Data]
  );

  const handleBack = useCallback(() => {
    setStep(1);
  }, [setStep]);

  const handleCancel = useCallback(() => {
    resetAll();
    onClose?.();
  }, [onClose, resetAll]);

  const step1Schema = schemas.step1;
  const step2Schema = schemas.step2;

  return (
    <div className={styles.container}>
      {/* Stepper compacto */}
      <div className={styles.stepper}>
        <div
          className={`${styles.step} ${step === 1 ? styles.active : ""}`}
          role="button"
          tabIndex={-1}
          onClick={() => setStep(1)}
        >
          <span className={styles.stepNumber}>1</span>
          <span>Criação da Notificação</span>
        </div>
        <div
          className={`${styles.step} ${step === 2 ? styles.active : ""} ${
            canGoNext ? "" : styles.disabled
          }`}
          role="button"
          tabIndex={-1}
          onClick={() => canGoNext && setStep(2)}
          aria-disabled={!canGoNext}
        >
          <span className={styles.stepNumber}>2</span>
          <span>Atribuir Pessoa</span>
        </div>
      </div>

      {/* Conteúdo por step */}
      <div className={styles.content}>
        {step === 1 && (
          <>
            {!step1Schema && (
              <p className={styles.helper}>Carregando formulário...</p>
            )}
            {step1Schema && (
              <DynamicForm
                stepKey="CREATE_NOTIFICATION"
                fields={step1Schema.fields}
                locked={step1Locked}
                loading={loading.step1}
                submitLabel="Criar e continuar"
                defaultValues={step1Data ?? undefined}
                onSubmit={handleSubmitStep1}
                onCancel={handleCancel}
              />
            )}
          </>
        )}

        {step === 2 && (
          <>
            {!step2Schema && (
              <p className={styles.helper}>Carregando formulário...</p>
            )}
            {step2Schema && (
              <DynamicForm
                stepKey="CREATE_NOTIFIED_PERSON"
                fields={step2Schema.fields}
                loading={loading.step2}
                submitLabel="Concluir"
                defaultValues={step2Data ?? undefined}
                onSubmit={handleSubmitStep2}
                onBack={handleBack}
                onCancel={handleCancel}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CreateNotification;
