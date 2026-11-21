import { api } from "@/api/axios";

/** Download a file from an authenticated endpoint (uses the bearer token on `api`). */
export async function downloadAuthenticated(path: string, params: Record<string, string | undefined>, filename: string) {
  const clean = Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== ""));
  const res = await api.get<Blob>(path, { params: clean, responseType: "blob" });
  const url = URL.createObjectURL(res.data);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Extract a human-readable message from an axios error using the backend envelope. */
export function apiErrorMessage(err: unknown, fallback = "Something went wrong. Please try again."): string {
  const e = err as { response?: { data?: { error?: { message?: string } } }; message?: string };
  return e?.response?.data?.error?.message ?? fallback;
}

export function apiErrorCode(err: unknown): string | undefined {
  const e = err as { response?: { data?: { error?: { code?: string } } } };
  return e?.response?.data?.error?.code;
}
