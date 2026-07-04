/**
 * Centralized API client with auth, idempotency, and error handling.
 *
 * All API modules import this client. It handles:
 *   - JWT access token attachment
 *   - Automatic token refresh on 401
 *   - Idempotency-Key header for mutating requests
 *   - 402 Payment Required → paywall event dispatch
 *   - Standardized error normalization
 */

import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import { env } from "@/config/env";

// ---------------------------------------------------------------------------
// Client instance
// ---------------------------------------------------------------------------

export const api = axios.create({
  baseURL: env.apiBaseUrl,
  withCredentials: true,
  timeout: 30_000,
  headers: { "Content-Type": "application/json" },
});

// ---------------------------------------------------------------------------
// Token management (avoids circular deps by reading localStorage directly)
// ---------------------------------------------------------------------------

function getAccessToken(): string | null {
  try {
    const raw = localStorage.getItem("pamoja-auth");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.state?.accessToken ?? null;
  } catch {
    return null;
  }
}

function getRefreshToken(): string | null {
  try {
    const raw = localStorage.getItem("pamoja-auth");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.state?.refreshToken ?? null;
  } catch {
    return null;
  }
}

function setAccessToken(token: string) {
  try {
    const raw = localStorage.getItem("pamoja-auth");
    if (!raw) return;
    const parsed = JSON.parse(raw);
    if (parsed?.state) {
      parsed.state.accessToken = token;
      localStorage.setItem("pamoja-auth", JSON.stringify(parsed));
    }
  } catch {
    // best-effort
  }
}

// ---------------------------------------------------------------------------
// Idempotency key generator
// ---------------------------------------------------------------------------

function generateIdempotencyKey(): string {
  // crypto.randomUUID() is available in all modern browsers + Node 19+
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for older environments
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// ---------------------------------------------------------------------------
// Request interceptor — attach auth + idempotency
// ---------------------------------------------------------------------------

const MUTATING_METHODS = new Set(["post", "put", "patch", "delete"]);

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  // Attach access token
  const token = getAccessToken();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Attach idempotency key for mutating requests (Stripe-style)
  const method = config.method?.toLowerCase() ?? "get";
  if (MUTATING_METHODS.has(method) && config.headers) {
    config.headers["Idempotency-Key"] = generateIdempotencyKey();
  }

  return config;
});

// ---------------------------------------------------------------------------
// Response interceptor — refresh on 401, paywall on 402
// ---------------------------------------------------------------------------

let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];

function onRefreshed(token: string) {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
}

function addRefreshSubscriber(cb: (token: string) => void) {
  refreshSubscribers.push(cb);
}

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;

  try {
    const res = await axios.post(
      `${env.apiBaseUrl}/auth/refresh`,
      { refreshToken },
      { withCredentials: true },
    );
    const newAccessToken = res.data?.data?.accessToken as string | undefined;
    if (newAccessToken) {
      setAccessToken(newAccessToken);
      return newAccessToken;
    }
    return null;
  } catch {
    return null;
  }
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // 402 Payment Required → dispatch paywall event
    if (error.response?.status === 402) {
      window.dispatchEvent(
        new CustomEvent("pamoja:paywall", {
          detail: (error.response?.data as any)?.error ?? {},
        }),
      );
      return Promise.reject(error);
    }

    // 401 Unauthorized → attempt token refresh once
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (!isRefreshing) {
        isRefreshing = true;
        originalRequest._retry = true;

        const newToken = await refreshAccessToken();
        isRefreshing = false;

        if (newToken) {
          onRefreshed(newToken);
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
          }
          return api(originalRequest);
        }
      } else {
        // Another request is already refreshing — queue this one
        return new Promise((resolve) => {
          addRefreshSubscriber((token: string) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            resolve(api(originalRequest));
          });
        });
      }

      // Refresh failed — redirect to login
      localStorage.removeItem("pamoja-auth");
      window.dispatchEvent(new CustomEvent("pamoja:session-expired"));
    }

    return Promise.reject(error);
  },
);

export default api;
