import axios, { AxiosError, type AxiosRequestConfig } from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "https://api.pamojawealth.app/v1",
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
  return url.includes("/auth/login") || url.includes("/auth/register") || url.includes("/auth/refresh");
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
      const base = import.meta.env.VITE_API_BASE_URL ?? "https://api.pamojawealth.app/v1";
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
