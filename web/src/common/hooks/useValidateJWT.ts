// src/features/auth/services/auth.api.ts
import axios from "axios";
import type { JwtPayload } from "@/common/types/api/api.types";

type ValidateJWTResult =
  | { ok: true; data: JwtPayload }
  | { ok: false; error?: string };

export async function useValidateJWT(): Promise<ValidateJWTResult> {
  try {
    const res = await axios.get("http://localhost:3000/api/auth/me", {
      withCredentials: true, // importante para enviar cookies
    });

    // Esperado:
    // success: boolean
    // data: { ...payload }
    if (res?.data?.success && res?.data?.data) {
      return { ok: true, data: res.data.data as JwtPayload };
    }

    return { ok: false, error: res?.data?.message ?? "Unauthorized" };
  } catch (err: any) {
    return { ok: false, error: err?.message ?? "Request failed" };
  }
}
