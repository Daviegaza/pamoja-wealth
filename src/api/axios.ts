import axios, { AxiosError, type AxiosRequestConfig } from "axios";

// In dev without VITE_API_BASE_URL, target localhost:3000 (backend default).
// Falling through to production causes ERR_NAME_NOT_RESOLVED on offline dev
// and leaks dev traffic to prod on flaky DNS.
const FALLBACK_BASE = import.meta.env.DEV
  ? "http://localhost:3000/api/v1"
  : "https://api.pamojawealth.app/v1";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? FALLBACK_BASE,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("pamoja_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let isRefreshing = false;
let pendingQueue: Array<{ resolve: (t: string) => void; reject: (e: unknown) => void }> = [];

function flushQueue(err: unknown, token: string | null) {
  pendingQueue.forEach(({ resolve, reject }) => {
    if (err || !token) reject(err);
    else resolve(token);
  });
  pendingQueue = [];
}

function isAuthEndpoint(url?: string) {
  if (!url) return false;
  return url.includes("/auth/login") || url.includes("/auth/register") || url.includes("/auth/refresh") || url.includes("/auth/logout");
}

function redirectToLogin() {
  localStorage.removeItem("pamoja_token");
  localStorage.removeItem("pamoja_refresh");
  if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
    const next = encodeURIComponent(window.location.pathname + window.location.search);
    window.location.href = `/login?next=${next}`;
  }
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as (AxiosRequestConfig & { _retry?: boolean }) | undefined;
    const status = error.response?.status;

    // 402 Payment Required — dispatch to global paywall listener.
    if (status === 402) {
      const data = error.response?.data as { error?: { feature?: string; requiredPlan?: string; upgradeUrl?: string; message?: string } };
      window.dispatchEvent(new CustomEvent("pamoja:paywall", {
        detail: {
          feature: data?.error?.feature ?? "premium_feature",
          requiredPlan: data?.error?.requiredPlan ?? "pro",
          upgradeUrl: data?.error?.upgradeUrl ?? "/pricing",
          message: data?.error?.message ?? "This feature requires an upgrade.",
        },
      }));
      return Promise.reject(error);
    }

    if (status !== 401 || !original || original._retry || isAuthEndpoint(original.url)) {
      return Promise.reject(error);
    }

    const refreshToken = localStorage.getItem("pamoja_refresh");
    if (!refreshToken) {
      redirectToLogin();
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        pendingQueue.push({
          resolve: (token) => {
            original._retry = true;
            original.headers = { ...(original.headers ?? {}), Authorization: `Bearer ${token}` };
            resolve(api(original));
          },
          reject,
        });
      });
    }

    original._retry = true;
    isRefreshing = true;

    try {
      const base = api.defaults.baseURL ?? import.meta.env.VITE_API_BASE_URL ?? "/api/v1";
      const r = await axios.post<{ success: true; data: { accessToken: string; refreshToken: string } }>(
        `${base}/auth/refresh`,
        { refreshToken },
        { timeout: 15000, headers: { "Content-Type": "application/json" } }
      );
      const { accessToken, refreshToken: newRefresh } = r.data.data;
      localStorage.setItem("pamoja_token", accessToken);
      localStorage.setItem("pamoja_refresh", newRefresh);
      flushQueue(null, accessToken);
      original.headers = { ...(original.headers ?? {}), Authorization: `Bearer ${accessToken}` };
      return api(original);
    } catch (refreshErr) {
      flushQueue(refreshErr, null);
      redirectToLogin();
      return Promise.reject(refreshErr);
    } finally {
      isRefreshing = false;
    }
  }
);
