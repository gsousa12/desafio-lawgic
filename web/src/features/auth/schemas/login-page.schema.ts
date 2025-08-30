import { z } from "zod";

export const loginSchema = z.object({
  email: z.email({ message: "Informe um e-mail válido." }),
  password: z
    .string()
    .min(8, { message: "A senha deve ter pelo menos 8 caracteres." })
    .max(50, { message: "A senha deve ter no máximo 50 caracteres." }),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
