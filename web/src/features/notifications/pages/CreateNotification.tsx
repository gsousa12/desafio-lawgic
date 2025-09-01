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
import { api } from "@/api/axios";
import {
  ApiEnvelope,
  FormField,
  FormSchemaResponse,
  Loading,
  Schemas,
  Step1FormValues,
  Step2FormValues,
} from "@/common/types/forms/forms";
import {
  fromIsoZToLocalInput,
  maskPhone,
  onlyDigits,
  toIsoZFromLocal,
} from "@/common/utils/convert";
import { BrasilApiCep } from "@/common/types/api/api.types";
import { useCreateNotificationStore } from "@/stores/notifications/notifications.store";
import { makeZodSchema, ZodShape } from "../schemas/create-notification.schema";
import { makeRHFZodResolver } from "@/common/utils/customResolver";
import { DynamicForm } from "@/components/dynamic-form/DynamicForm";

/* =========================================================
   API helpers
   ========================================================= */
export const fetchSchema = async (
  stepKey: "CREATE_NOTIFICATION" | "CREATE_NOTIFIED_PERSON"
): Promise<FormSchemaResponse> => {
  const res = await api.get<ApiEnvelope<FormSchemaResponse>>(
    `/forms/${stepKey}`
  );
  return res.data.data;
};

export const apiCreateNotification = async (
  payload: Record<string, any>
): Promise<{ id: string; status?: string }> => {
  const res = await api.post(`/notifications`, payload);
  const data = (res.data?.data ?? res.data) as any;
  return { id: data?.id, status: data?.status };
};

export const apiCreateNotifiedPerson = async (payload: Record<string, any>) => {
  const res = await api.post(`/notifications/person`, payload);
  return res.data?.data ?? res.data;
};

export const lookupCepApi = async (cep: string): Promise<BrasilApiCep> => {
  const clean = onlyDigits(cep);
  const resp = await fetch(`https://brasilapi.com.br/api/cep/v1/${clean}`);
  if (!resp.ok) {
    throw new Error("CEP não encontrado");
  }
  return (await resp.json()) as BrasilApiCep;
};

/* =========================================================
   Validação dinâmica com Zod (Zod v4 classic friendly)
   ========================================================= */

/* =========================================================
   Resolver custom — Zod -> RHF (evita @hookform/resolvers)
   ========================================================= */

/* =========================================================
   DynamicForm — RHF + CEP lookup + máscaras
   ========================================================= */

/* =========================================================
   Componente principal
   ========================================================= */
type CreateNotificationProps = {
  onClose?: () => void;
};

export const CreateNotification = ({ onClose }: CreateNotificationProps) => {
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
      {/* Stepper compacto — somente informativo (sem navegação por clique) */}
      <div className={styles.stepper}>
        <div
          className={`${styles.step} ${step === 1 ? styles.active : ""}`}
          aria-current={step === 1 ? "step" : undefined}
        >
          <span className={styles.stepNumber}>1</span>
          <span>Criação da Notificação</span>
        </div>
        <div
          className={`${styles.step} ${step === 2 ? styles.active : ""}`}
          aria-current={step === 2 ? "step" : undefined}
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
                submitLabel={
                  step1Locked ? "Voltar para atribuição" : "Criar e continuar"
                }
                defaultValues={step1Data ?? undefined}
                onSubmit={handleSubmitStep1}
                onCancel={handleCancel}
                allowSubmitWhenLocked={step1Locked}
                onLockedPrimary={() => setStep(2)}
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
