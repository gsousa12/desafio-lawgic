import { FormField } from "@/common/types/forms/forms";
import { onlyDigits, toIsoZFromLocal } from "@/common/utils/convert";
import z from "zod";

export type ZodShape = Record<string, z.ZodTypeAny>;

export const HEARING_DATE_FIELD_ID = "hearingDate";

export const makeZodSchema = (fields?: FormField[]): z.ZodObject<ZodShape> => {
  const shape: Record<string, z.ZodTypeAny> = {};

  if (!Array.isArray(fields) || fields.length === 0) {
    return z.object({}) as unknown as z.ZodObject<ZodShape>;
  }

  for (const f of fields) {
    let str = z.string();

    if (f.format === "email" || f.type === "email") {
      str = str.email("E-mail inválido");
    }

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

    if (f.id === "cep") {
      str = str.refine((v) => /^\d{8}$/.test(onlyDigits(v)), {
        message: "CEP deve conter 8 dígitos",
      });
    }
    if (f.id === "state") {
      str = str.refine((v) => /^[A-Za-z]{2}$/.test(v), {
        message: "UF deve ter 2 letras",
      });
    }
    if (f.id === "phone") {
      str = str.refine(
        (v) => v === "" || [10, 11].includes(onlyDigits(v).length),
        { message: "Telefone deve ter 10 ou 11 dígitos" }
      );
    }
    if (f.id === HEARING_DATE_FIELD_ID) {
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
    shape[f.id] = f.required ? str : z.union([str, z.literal("")]);
  }

  return z.object(shape as ZodShape) as unknown as z.ZodObject<ZodShape>;
};
