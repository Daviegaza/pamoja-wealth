import axios, { AxiosError, type AxiosRequestConfig, type InternalAxiosRequestConfig, type AxiosResponse } from "axios";
import { USE_MOCKS } from "@/lib/env";

// In dev without VITE_API_BASE_URL, target localhost:3000 (backend default).
// Falling through to production causes ERR_NAME_NOT_RESOLVED on offline dev
// and leaks dev traffic to prod on flaky DNS. Set VITE_USE_MOCKS=true if
// you have no backend running.
const FALLBACK_BASE = import.meta.env.DEV
  ? "http://localhost:3000/api/v1"
  : "https://api.pamojawealth.app/v1";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? FALLBACK_BASE,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

/**
 * When USE_MOCKS is on, short-circuit ALL requests before they hit the
 * network. Returns an empty envelope (`{success: true, data: []}` for GET,
 * `{success: true, data: {}}` for mutations) so callers that don't have
 * an explicit mock branch still resolve happily instead of throwing on
 * fetch failure. Individual API modules that DO have a mock branch (auth,
 * payments, billing, etc.) are still called and return their richer mock
 * before this interceptor even runs, because those modules skip
 * `api.get/post` when USE_MOCKS is true.
 */
if (USE_MOCKS) {
  api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (config as any).adapter = async (): Promise<AxiosResponse> => {
      const url = (config.url ?? "").split("?")[0];
      const method = (config.method ?? "get").toLowerCase();
      const data = await resolveMockData(url, method, config);
      return {
        data: { success: true, data },
        status: 200,
        statusText: "OK (mocked)",
        headers: {},
        config,
      };
    };
    return config;
  });
}

/**
 * URL-matched mock data resolver. Returns richer shapes (real generated
 * mock rows) for endpoints the unauthenticated dev experience needs, or an
 * empty envelope as the last-resort fallback.
 */
async function resolveMockData(url: string, method: string, _config: InternalAxiosRequestConfig): Promise<unknown> {
  // Lazy-load the mock DB — avoids pulling ~500KB of fake data on prod builds.
  const { getMockDatabase } = await import("@/mock");
  const db = getMockDatabase();

  // GET → list / detail
  if (method === "get") {
    // Chamas
    if (url === "/chamas" || url === "/chamas/") return db.chamas.slice(0, 50);
    if (url === "/chamas/discover") return db.chamas.slice(0, 50);
    const chamaMatch = url.match(/^\/chamas\/([^/]+)$/);
    if (chamaMatch) return db.chamas.find((c) => c.id === chamaMatch[1]) ?? db.chamas[0];
    const membersMatch = url.match(/^\/chamas\/([^/]+)\/members$/);
    if (membersMatch) return db.members.filter((m) => m.chamaId === membersMatch[1]).slice(0, 25);
    const rulesActiveMatch = url.match(/^\/chamas\/([^/]+)\/rules\/active$/);
    if (rulesActiveMatch) return db.ruleVersions.find((r) => r.chamaId === rulesActiveMatch[1]) ?? null;
    const rulesListMatch = url.match(/^\/chamas\/([^/]+)\/rules$/);
    if (rulesListMatch) return db.ruleVersions.filter((r) => r.chamaId === rulesListMatch[1]);
    const rulesGuardMatch = url.match(/^\/chamas\/([^/]+)\/rules\/guard$/);
    if (rulesGuardMatch) return { isOfficer: true, officerCount: 4, requiredSignatures: 3, cooldownEndsAt: null, inCooldown: false };
    const freezeMatch = url.match(/^\/chamas\/([^/]+)\/freeze\/status$/);
    if (freezeMatch) return { frozen: false, reason: null, triggeredAt: null, triggeredBy: null };

    // Wallet
    if (url === "/wallet") {
      const w = db.transactions.slice(0, 20);
      return {
        balance: 42500,
        totalDeposits: 320000,
        totalWithdrawals: 18500,
        currency: "KES",
        recentTransactions: w,
      };
    }
    if (url === "/wallet/balances") {
      return [
        { currency: "KES", balance: "42500" },
        { currency: "USD", balance: "180" },
      ];
    }
    if (url === "/wallet/history") return db.walletHistory;
    if (url === "/wallet/transactions") return db.transactions.slice(0, 30);

    // Trust score
    if (url === "/trust-score/me") {
      return {
        userId: db.users[0]!.id,
        score: 780,
        band: "strong",
        breakdown: {
          contributionStreakMonths: 14,
          onTimePaymentRate: 0.94,
          disputeCount: 0,
          defaultedLoanCount: 0,
          kycTier: 2,
          chamasActive: 3,
          yearsOnPlatform: 1.4,
        },
        computedAt: new Date().toISOString(),
        cached: false,
      };
    }

    // Loans / Goals / Notifications
    if (url === "/loans") return db.loans.slice(0, 25);
    if (url === "/notifications") return db.notifications.slice(0, 40);
    if (url === "/notifications/unread-count") return { count: 3 };

    // Public impact + lessons + landing
    if (url === "/public/impact") {
      return {
        chamasActive: db.chamas.length,
        membersServed: db.members.length,
        contributionsKes: 384_500_000,
        loansIssuedKes: 42_800_000,
        harambeeRaisedKes: 18_600_000,
        countries: 5,
        computedAt: new Date().toISOString(),
        cached: false,
      };
    }
    if (url === "/public/lessons") {
      return [
        { slug: "why-chamas-work", title: "Why chamas work", titleSw: "Kwa nini chama hufaulu", minutes: 1, category: "chama", action: "Contribute today." },
        { slug: "rule-of-72", title: "The Rule of 72", titleSw: "Kanuni ya 72", minutes: 1, category: "investing", action: "Move 20% to MMF." },
        { slug: "loan-cost-truth", title: "Real cost of a loan", titleSw: "Gharama halisi ya mkopo", minutes: 2, category: "loans", action: "Always ask for APR." },
        { slug: "50-30-20-budget", title: "50/30/20 budgeting", titleSw: "Bajeti ya 50/30/20", minutes: 1, category: "basics", action: "Auto-save the 20%." },
      ];
    }
    const lessonMatch = url.match(/^\/public\/lessons\/([^/]+)$/);
    if (lessonMatch) {
      return {
        slug: lessonMatch[1],
        title: "Lesson (mock)",
        titleSw: "Somo (mock)",
        minutes: 1,
        category: "basics",
        body: "This is mock content for local dev. Wire a real backend to see production lessons.",
        bodySw: "Hii ni maudhui ya mfano kwa maendeleo ya karibu.",
        keyPoints: ["Point A", "Point B", "Point C"],
        action: "Do this today.",
      };
    }

    // Referral / KYC / FX / Support / Billing basics
    if (url === "/referral/stats") return { referralCode: "DAVIE01", totalReferrals: 3, totalEarnedKes: 1500, pendingRewards: 500, referralHistory: [] };
    if (url === "/kyc/status") return { level: 2, idVerified: true, selfieVerified: true, addressVerified: false, pepScreened: true, sanctionsScreened: true };
    if (url === "/fx/rates") return { base: "KES", rates: { KES: 1, USD: 0.0077, EUR: 0.0071, GBP: 0.0061, TZS: 19.5, UGX: 28.1, RWF: 10.4, NGN: 11.9 }, fetchedAt: new Date().toISOString(), source: "mock" };

    return method === "get" ? [] : {};
  }

  // Mutations — return neutral success shape (individual pages have their own richer branches).
  return {};
}

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
