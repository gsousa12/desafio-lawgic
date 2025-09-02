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
  refetch: () => void;
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
  refetch,
}) => {
  const formFields = useMemo(() => {
    return Array.isArray(fields) ? fields : [];
  }, [fields]);

  const formSchema = useMemo(() => makeZodSchema(formFields), [formFields]);
  const formResolver = useMemo(
    () => makeRHFZodResolver(formSchema),
    [formSchema]
  );

  const preparedDefaultValues = useMemo(() => {
    const baseValues: Record<string, any> = {};

    formFields.forEach((field) => {
      baseValues[field.id] = "";
    });

    if (defaultValues) {
      formFields.forEach((field) => {
        const value = defaultValues[field.id];
        if (value == null) return;

        if (field.type === "date" && typeof value === "string") {
          baseValues[field.id] = fromIsoZToLocalInput(value);
        } else if (field.id === "state" && typeof value === "string") {
          baseValues[field.id] = value.toUpperCase();
        } else if (field.id === "phone" && typeof value === "string") {
          baseValues[field.id] = maskPhone(value);
        } else if (field.type === "radio") {
          baseValues[field.id] = String(value);
        } else {
          baseValues[field.id] = value;
        }
      });
    }

    return baseValues;
  }, [formFields, defaultValues]);

  const form = useForm<FieldValues>({
    resolver: formResolver,
    defaultValues: preparedDefaultValues,
    mode: "onBlur",
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    getValues,
    setError,
    clearErrors,
    watch,
  } = form;

  const setStep1Data = useCreateNotificationStore(
    (state) => state.setStep1Data
  );
  const setStep2Data = useCreateNotificationStore(
    (state) => state.setStep2Data
  );
  const cepLookupLoading = useCreateNotificationStore(
    (state) => state.loading.cepLookup
  );
  const doCepLookup = useCreateNotificationStore((state) => state.lookupCep);

  useEffect(() => {
    const subscription = watch((formValues) => {
      if (stepKey === "CREATE_NOTIFICATION") {
        setStep1Data(formValues as any);
      }
      if (stepKey === "CREATE_NOTIFIED_PERSON") {
        setStep2Data(formValues as any);
      }
    });

    return () => subscription.unsubscribe();
  }, [watch, stepKey, setStep1Data, setStep2Data]);

  const handleCepLookup = useCallback(async () => {
    const cepValue = String(getValues("cep") || "");
    const cleanCep = onlyDigits(cepValue);

    if (cleanCep.length !== 8) {
      setError("cep", {
        type: "manual",
        message: "CEP deve conter 8 dígitos",
      });
      return;
    }

    clearErrors("cep");

    try {
      const addressData = await doCepLookup(cleanCep);
      const stateValue = String(addressData.state || "").toUpperCase();

      setValue("state", stateValue, {
        shouldValidate: true,
        shouldDirty: true,
      });
      setValue("city", addressData.city || "", {
        shouldValidate: true,
        shouldDirty: true,
      });
      setValue("neighborhood", addressData.neighborhood || "", {
        shouldValidate: true,
        shouldDirty: true,
      });
      setValue("street", addressData.street || "", {
        shouldValidate: true,
        shouldDirty: true,
      });
    } catch (error: any) {
      setError("cep", {
        type: "manual",
        message: error?.message || "Falha ao buscar CEP",
      });
    }
  }, [doCepLookup, getValues, setError, clearErrors, setValue]);

  const createCommonInputProps = (field: FormField, registration: any) => {
    return {
      id: field.id,
      name: registration.name,
      ref: registration.ref,
      "aria-invalid": !!errors[field.id],
      disabled: locked || loading,
      readOnly: locked,
      className: field.type === "textarea" ? styles.textarea : styles.input,
      placeholder: field.label,
    };
  };

  const renderCepField = (field: FormField, registration: any) => {
    const commonProps = createCommonInputProps(field, registration);

    return (
      <div className={styles.inputGroup}>
        <input type="text" onChange={registration.onChange} {...commonProps} />
        <Button
          type="button"
          onClick={handleCepLookup}
          disabled={locked || loading || cepLookupLoading}
          title="Buscar CEP"
          aria-label="Buscar CEP"
        >
          <Search />
        </Button>
      </div>
    );
  };

  const renderStateField = (field: FormField, registration: any) => {
    const commonProps = createCommonInputProps(field, registration);

    return (
      <input
        type="text"
        maxLength={2}
        onChange={(event) => {
          const uppercaseValue = event.target.value.toUpperCase().slice(0, 2);
          setValue("state", uppercaseValue, {
            shouldValidate: true,
            shouldDirty: true,
          });
          registration.onChange({
            ...event,
            target: { ...event.target, value: uppercaseValue },
          });
        }}
        {...commonProps}
      />
    );
  };

  const renderPhoneField = (field: FormField, registration: any) => {
    const commonProps = createCommonInputProps(field, registration);

    return (
      <input
        type="tel"
        onChange={(event) => {
          const maskedPhone = maskPhone(event.target.value);
          setValue("phone", maskedPhone, {
            shouldValidate: true,
            shouldDirty: true,
          });
          registration.onChange({
            ...event,
            target: { ...event.target, value: maskedPhone },
          });
        }}
        {...commonProps}
      />
    );
  };

  const renderRadioField = (field: FormField) => {
    return (
      <div className={styles.field}>
        <div className={styles.label}>{field.label}</div>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          {(field.options || []).map((option) => {
            const optionValue = String(option.value);
            const inputId = `${field.id}-${optionValue}`;

            return (
              <label
                key={optionValue}
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
                  value={optionValue}
                  disabled={locked || loading}
                  {...register(field.id)}
                />
                <span>{option.label}</span>
              </label>
            );
          })}
        </div>
      </div>
    );
  };

  const renderDefaultField = (field: FormField, registration: any) => {
    const commonProps = createCommonInputProps(field, registration);

    switch (field.type) {
      case "textarea":
        return (
          <textarea
            onChange={registration.onChange}
            style={{ resize: "none" }}
            {...commonProps}
          />
        );
      case "email":
      case "text":
        return (
          <input
            type={field.type === "email" ? "email" : "text"}
            onChange={registration.onChange}
            {...commonProps}
          />
        );
      case "date":
        return (
          <input
            type="datetime-local"
            onChange={registration.onChange}
            {...commonProps}
          />
        );
      default:
        return (
          <input
            type="text"
            onChange={registration.onChange}
            {...commonProps}
          />
        );
    }
  };

  const renderField = (field: FormField) => {
    const registration = register(field.id);

    if (field.id === "cep") {
      return renderCepField(field, registration);
    }
    if (field.id === "state") {
      return renderStateField(field, registration);
    }
    if (field.id === "phone") {
      return renderPhoneField(field, registration);
    }
    if (field.type === "radio") {
      return renderRadioField(field);
    }
    return renderDefaultField(field, registration);
  };

  const handleFormSubmit: SubmitHandler<FieldValues> = async (formValues) => {
    await onSubmit(formValues);
  };

  const isFormDisabled = loading || locked;
  const shouldShowBackButton = stepKey === "CREATE_NOTIFIED_PERSON" && onBack;
  const isInLockedContinueMode = locked && allowSubmitWhenLocked;
  const hasNoFields = formFields.length === 0;

  return (
    <form className={styles.form} onSubmit={handleSubmit(handleFormSubmit)}>
      {hasNoFields ? (
        <p className={styles.helper}>Nenhum campo disponível.</p>
      ) : (
        formFields.map((field) => (
          <div key={field.id} className={styles.field}>
            {field.type !== "radio" && (
              <label className={styles.label} htmlFor={field.id}>
                {field.label} {field.required ? "*" : ""}
              </label>
            )}
            {renderField(field)}
            {errors[field.id]?.message && (
              <span className={styles.error}>
                {String(errors[field.id]?.message)}
              </span>
            )}
          </div>
        ))
      )}

      <div className={styles.actions}>
        {onCancel && (
          <Button type="button" onClick={onCancel} disabled={loading}>
            Limpar Formulário
          </Button>
        )}

        {shouldShowBackButton && (
          <Button type="button" onClick={onBack} disabled={loading}>
            Voltar
          </Button>
        )}

        {isInLockedContinueMode ? (
          <Button
            type="button"
            onClick={onLockedPrimary}
            disabled={loading || hasNoFields}
          >
            {submitLabel}
          </Button>
        ) : (
          <Button type="submit" disabled={isFormDisabled || hasNoFields}>
            {loading ? "Enviando..." : submitLabel}
          </Button>
        )}
      </div>
    </form>
  );
};
