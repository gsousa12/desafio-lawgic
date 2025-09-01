import { ZodShape } from "@/features/notifications/schemas/create-notification.schema";
import { FieldValues, Resolver } from "react-hook-form";
import z from "zod";

export const makeRHFZodResolver =
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
