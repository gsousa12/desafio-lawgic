import { useCallback, useMemo, useState } from "react";

export type Step1FormValues = {
  title: string;
  description: string;
};

export type Step2FormValues = {
  name: string;
  cep: string;
};

type Loading = {
  step1: boolean;
  step2: boolean;
};

export type CreateNotificationController = {
  step: 1 | 2;
  goNext: () => void;
  goPrev: () => void;
  goToStep: (s: 1 | 2) => void;

  loading: Loading;
  finished: boolean;

  /* Regras */
  step1Locked: boolean; // após sucesso do step 1, impede edição
  canGoNext: boolean; // Step 2 liberado somente com sucesso do step 1

  /* Dados */
  createdNotificationId?: string;
  step1Data?: Step1FormValues;
  step2Data?: Step2FormValues;

  /* Ações de submit (simulam API com sucesso) */
  createNotification: (payload: Step1FormValues) => Promise<void>;
  assignPerson: (payload: Step2FormValues) => Promise<void>;
};

/* --- MOCK APIs (simulam sucesso) --- */

function mockCreateNotification(
  payload: Step1FormValues
): Promise<{ id: string }> {
  return new Promise((resolve) =>
    setTimeout(() => {
      const id = crypto?.randomUUID?.() ?? String(Date.now());
      resolve({ id });
    }, 800)
  );
}

function mockAssignPerson(
  _notificationId: string,
  _payload: Step2FormValues
): Promise<{ ok: true }> {
  return new Promise((resolve) => setTimeout(() => resolve({ ok: true }), 800));
}

/* --- CONTROLLER --- */

export function useCreateNotificationController(): CreateNotificationController {
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

  const createNotification = useCallback(async (payload: Step1FormValues) => {
    setLoading((l) => ({ ...l, step1: true }));
    try {
      const res = await mockCreateNotification(payload);
      setStep1Data(payload);
      setCreatedNotificationId(res.id);
      setStep(2); // segue automaticamente para o Step 2
    } finally {
      setLoading((l) => ({ ...l, step1: false }));
    }
  }, []);

  const assignPerson = useCallback(
    async (payload: Step2FormValues) => {
      if (!createdNotificationId) return;
      setLoading((l) => ({ ...l, step2: true }));
      try {
        await mockAssignPerson(createdNotificationId, payload);
        setStep2Data(payload);
        setFinished(true); // fluxo concluído
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

    createNotification,
    assignPerson,
  };
}
