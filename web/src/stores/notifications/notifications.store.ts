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
} from "@/components/create-notification/CreateNotification";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type CreateNotificationStore = {
  step: 1 | 2;
  notificationId?: string;
  finished: boolean;

  step1Data: Step1FormValues | null;
  step2Data: Step2FormValues | null;

  schemas: Schemas;
  loading: Loading;

  setStep: (step: 1 | 2) => void;
  resetAll: () => void;

  loadSchema: (
    stepKey: "CREATE_NOTIFICATION" | "CREATE_NOTIFIED_PERSON"
  ) => Promise<void>;

  setStep1Data: (data: Partial<Step1FormValues>) => void;
  setStep2Data: (data: Partial<Step2FormValues>) => void;

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
      loading: {
        step1: false,
        step2: false,
        cepLookup: false,
      },
      finished: false,

      setStep: (newStep) => {
        set({ step: newStep });
      },

      resetAll: () => {
        set({
          step: 1,
          notificationId: undefined,
          step1Data: null,
          step2Data: null,
          schemas: {},
          loading: {
            step1: false,
            step2: false,
            cepLookup: false,
          },
          finished: false,
        });
      },

      loadSchema: async (stepKey) => {
        const currentState = get();

        const schemaKey = stepKey === "CREATE_NOTIFICATION" ? "step1" : "step2";

        const existingSchema = currentState.schemas[schemaKey as keyof Schemas];
        if (existingSchema) {
          return;
        }

        try {
          const schema = await fetchSchema(stepKey);

          const currentSchemas = get().schemas;
          const newSchemas = {
            ...currentSchemas,
            [schemaKey]: schema,
          };

          set({ schemas: newSchemas });
        } catch (error) {}
      },

      setStep1Data: (newData) => {
        const currentState = get();
        const currentStep1Data = currentState.step1Data || {};
        const updatedStep1Data = {
          ...currentStep1Data,
          ...newData,
        };

        set({ step1Data: updatedStep1Data });
      },

      setStep2Data: (newData) => {
        const currentState = get();
        const currentStep2Data = currentState.step2Data || {};
        const updatedStep2Data = {
          ...currentStep2Data,
          ...newData,
        };

        set({ step2Data: updatedStep2Data });
      },

      createNotification: async (formData) => {
        const currentState = get();
        const step1Schema = currentState.schemas.step1;

        if (!step1Schema) {
          return;
        }

        const preparedData: Record<string, any> = { ...formData };

        for (const field of step1Schema.fields) {
          if (field.type === "date" && preparedData[field.id]) {
            const dateValue = String(preparedData[field.id]);
            preparedData[field.id] = toIsoZFromLocal(dateValue);
          }
        }

        const currentLoading = get().loading;
        set({
          loading: {
            ...currentLoading,
            step1: true,
          },
        });

        try {
          const response = await apiCreateNotification(preparedData);

          if (!response?.id) {
            throw new Error("ID de notificação não retornado.");
          }

          set({
            notificationId: response.id,
            step1Data: preparedData as Step1FormValues,
            step: 2,
          });

          await get().loadSchema("CREATE_NOTIFIED_PERSON");
        } finally {
          const finalLoading = get().loading;
          set({
            loading: {
              ...finalLoading,
              step1: false,
            },
          });
        }
      },

      assignPerson: async (formData) => {
        const currentState = get();

        if (!currentState.notificationId) {
          return;
        }

        const preparedData: Record<string, any> = { ...formData };

        if (preparedData.cep) {
          const cepValue = String(preparedData.cep);
          preparedData.cep = onlyDigits(cepValue);
        }

        if (preparedData.phone) {
          const phoneValue = String(preparedData.phone);
          preparedData.phone = onlyDigits(phoneValue);
        }

        if (preparedData.state) {
          const stateValue = String(preparedData.state);
          preparedData.state = stateValue.toUpperCase();
        }

        const currentLoading = get().loading;
        set({
          loading: {
            ...currentLoading,
            step2: true,
          },
        });

        try {
          const apiPayload = {
            notificationId: currentState.notificationId,
            ...preparedData,
          };

          await apiCreateNotifiedPerson(apiPayload);

          set({
            step2Data: preparedData as Step2FormValues,
            finished: true,
          });
        } finally {
          const finalLoading = get().loading;
          set({
            loading: {
              ...finalLoading,
              step2: false,
            },
          });
        }
      },

      lookupCep: async (cep) => {
        const currentLoading = get().loading;
        set({
          loading: {
            ...currentLoading,
            cepLookup: true,
          },
        });

        try {
          const cepData = await lookupCepApi(cep);
          return cepData;
        } finally {
          const finalLoading = get().loading;
          set({
            loading: {
              ...finalLoading,
              cepLookup: false,
            },
          });
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
