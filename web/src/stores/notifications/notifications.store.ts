import { BrasilApiCep } from "@/common/types/api/api.types";
import {
  Loading,
  Schemas,
  Step1FormValues,
  Step2FormValues,
} from "@/common/types/forms/forms";
import { onlyDigits, toIsoZFromLocal } from "@/common/utils/convert";
import {
  apiCreateNotification,
  apiCreateNotifiedPerson,
  fetchSchema,
  lookupCepApi,
} from "@/features/notifications/pages/CreateNotification";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

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
          if (!res?.id) throw new Error("ID de notificação não retornado.");
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
