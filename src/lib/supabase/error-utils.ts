export function toStandardError(error: unknown): Error {
  if (error instanceof Error) return error;
  if (typeof error === "object" && error !== null) {
    const errObj = error as { message?: string; details?: string; hint?: string; code?: string };
    const msg = errObj.message || errObj.details || "Error de base de datos / Supabase.";
    const err = new Error(msg);
    if (errObj.code) {
      (err as { code?: string }).code = errObj.code;
    }
    return err;
  }
  return new Error(String(error));
}
