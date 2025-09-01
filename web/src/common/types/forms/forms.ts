export type Step1FormValues = {
  title?: string;
  description?: string;
  hearingDate?: string;
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

export type Loading = {
  step1: boolean;
  step2: boolean;
  cepLookup: boolean;
};

export type Schemas = {
  step1?: FormSchemaResponse;
  step2?: FormSchemaResponse;
};

export type FieldType = "text" | "textarea" | "email" | "date" | "radio";

export type FormField = {
  id: string;
  label: string;
  type: FieldType;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  format?: "email" | "date";
  options?: { label: string; value: string | number | boolean }[];
};

export type FormSchemaResponse = {
  stepKey: "CREATE_NOTIFICATION" | "CREATE_NOTIFIED_PERSON" | string;
  title: string;
  fields: FormField[];
};

export type ApiEnvelope<T> = {
  success: boolean;
  message: string;
  data: T;
};
