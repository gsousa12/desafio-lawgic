import { FormField } from "@/common/types/forms/forms";
import {
  fromIsoZToLocalInput,
  maskPhone,
  onlyDigits,
} from "@/common/utils/convert";
import { makeRHFZodResolver } from "@/common/utils/customResolver";
import { makeZodSchema } from "@/features/notifications/schemas/create-notification.schema";
import { useCreateNotificationStore } from "@/stores/notifications/notifications.store";
import { useCallback, useEffect, useMemo } from "react";
import {
  FieldErrors,
  FieldValues,
  SubmitHandler,
  useForm,
} from "react-hook-form";
import { Search } from "lucide-react";
import styles from "./DynamicMultiStepForm.module.scss";
import { Button } from "../Button/Button";

type DynamicMultiStepFormProps = {
  stepKey: "CREATE_NOTIFICATION" | "CREATE_NOTIFIED_PERSON";
  fields?: FormField[];
  locked?: boolean;
  submitLabel: string;
  loading?: boolean;
  defaultValues?: Record<string, any>;
  onSubmit: (values: Record<string, any>) => void | Promise<void>;
  onBack?: () => void;
  onCancel?: () => void;
  allowSubmitWhenLocked?: boolean;
  onLockedPrimary?: () => void;
};

export const DynamicMultiStepForm: React.FC<DynamicMultiStepFormProps> = ({
  stepKey,
  fields,
  locked,
  submitLabel,
  loading,
  defaultValues,
  onSubmit,
  onBack,
  onCancel,
  allowSubmitWhenLocked,
  onLockedPrimary,
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
    watch,
  } = useForm<FieldValues>({
    resolver,
    defaultValues: computedDefaults,
    mode: "onBlur",
  });

  const setStep1Data = useCreateNotificationStore((s) => s.setStep1Data);
  const setStep2Data = useCreateNotificationStore((s) => s.setStep2Data);
  useEffect(() => {
    const sub = watch((vals) => {
      if (stepKey === "CREATE_NOTIFICATION") setStep1Data(vals as any);
      if (stepKey === "CREATE_NOTIFIED_PERSON") setStep2Data(vals as any);
    });
    return () => sub.unsubscribe();
  }, [watch, stepKey, setStep1Data, setStep2Data]);

  const cepLookupLoading = useCreateNotificationStore(
    (s) => s.loading.cepLookup
  );
  const doCepLookup = useCreateNotificationStore((s) => s.lookupCep);

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
    } catch (e: any) {
      setError("cep", {
        type: "manual",
        message: e?.message || "Falha ao buscar CEP",
      });
    }
  }, [doCepLookup, getValues, setError, clearErrors, setValue]);

  const renderField = (f: FormField, errs: FieldErrors<FieldValues>) => {
    const reg = register(f.id);
    const commonProps = {
      id: f.id,
      name: reg.name,
      ref: reg.ref,
      "aria-invalid": !!errs[f.id],
      disabled: locked || !!loading,
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
            {...commonProps}
          />
          <Button
            type="button"
            onClick={handleCepLookup}
            disabled={locked || !!loading || cepLookupLoading}
            title="Buscar CEP"
            aria-label="Buscar CEP"
          >
            <Search />
          </Button>
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
          {...commonProps}
        />
      );
    }

    switch (f.type) {
      case "textarea":
        return (
          <textarea
            onChange={(e) => reg.onChange(e)}
            style={{ resize: "none" }}
            {...commonProps}
          />
        );
      case "email":
      case "text":
        return (
          <input
            type={f.type === "email" ? "email" : "text"}
            onChange={(e) => reg.onChange(e)}
            {...commonProps}
          />
        );
      case "date":
        return (
          <input
            type="datetime-local"
            onChange={(e) => reg.onChange(e)}
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
            {...commonProps}
          />
        );
    }
  };

  const submit: SubmitHandler<FieldValues> = async (vals) => {
    await onSubmit({ ...vals });
  };

  const showBack = stepKey === "CREATE_NOTIFIED_PERSON" && onBack;
  const isLockedContinue = Boolean(locked && allowSubmitWhenLocked);

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
          <Button type="button" onClick={onCancel} disabled={!!loading}>
            Limpar Formulário
          </Button>
        )}
        {showBack && (
          <Button type="button" onClick={onBack} disabled={!!loading}>
            Voltar
          </Button>
        )}

        {isLockedContinue ? (
          <Button
            type="button"
            onClick={onLockedPrimary}
            disabled={!!loading || safeFields.length === 0}
          >
            {submitLabel}
          </Button>
        ) : (
          <Button
            type="submit"
            disabled={!!loading || safeFields.length === 0 || !!locked}
          >
            {loading ? "Enviando..." : submitLabel}
          </Button>
        )}
      </div>
    </form>
  );
};
