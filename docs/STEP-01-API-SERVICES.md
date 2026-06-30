# Step 01 — API Service Layer

**Status:** COMPLETED
**Started:** 2026-06-29

## Goal

Create a typed API service layer (`src/services/`) that wraps Axios calls to the backend REST API. Each service corresponds to a backend route group.

## What exists

- `src/api/axios.ts` — Pre-configured Axios instance with auth interceptor, base URL pointing to `VITE_API_BASE_URL`
- 26 Zustand stores that import mock data directly from `src/mock/`
- Backend has 16 route groups under `/api/v1/`

## What to create

### Service files (one per domain):

| File | Backend Route | Endpoints |
|------|--------------|-----------|
| `src/services/auth.service.ts` | `/api/v1/auth` | register, login, verifyOtp, resendOtp, forgotPassword, resetPassword, refresh, logout, enable2fa, verify2fa |
| `src/services/users.service.ts` | `/api/v1/users` | getMe, updateMe, getProfile, searchUsers, getPublicProfile |
| `src/services/chamas.service.ts` | `/api/v1/chamas` | list, create, getById, update, delete, getMembers, join, invite, approveJoin, removeMember, getStats, getAnalytics |
| `src/services/wallet.service.ts` | `/api/v1/wallet` | getWallet, getHistory, getTransactions, deposit, withdraw, addBankAccount, getBankAccounts, removeBankAccount, addMpesaAccount, getMpesaAccounts, removeMpesaAccount |
| `src/services/loans.service.ts` | `/api/v1/loans` | list, create, getById, approve, reject, getRepayments, repay |
| `src/services/investments.service.ts` | `/api/v1/investments` | list, create, getById, getPerformance |
| `src/services/meetings.service.ts` | `/api/v1/meetings` | list, create, getById, update, rsvp, getAttendees |
| `src/services/votes.service.ts` | `/api/v1/votes` | list, create, getById, castBallot, getResults |
| `src/services/notifications.service.ts` | `/api/v1/notifications` | list, markRead, markAllRead, getPreferences |
| `src/services/documents.service.ts` | `/api/v1/documents` | list, upload, download, delete |
| `src/services/goals.service.ts` | `/api/v1/goals` | list, create, getById, update, delete |
| `src/services/settings.service.ts` | `/api/v1/settings` | getSettings, updateSettings |
| `src/services/network.service.ts` | `/api/v1/network` | getConnections, getPrivacy, updatePrivacy |
| `src/services/ai.service.ts` | `/api/v1/ai` | chat, getHistory |
| `src/services/billing.service.ts` | `/api/v1/billing` | getPlans, getInvoices, createCheckout |

### API response types:

The backend uses a consistent response envelope:
```ts
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  meta?: { page: number; limit: number; total: number; totalPages: number };
}
```

### Service pattern:

Each service exports functions that call `api` (axios instance) and return typed promises.

## Checklist

- [ ] Create `src/services/` directory
- [ ] Create `auth.service.ts`
- [ ] Create `users.service.ts`
- [ ] Create `chamas.service.ts`
- [ ] Create `wallet.service.ts`
- [ ] Create `loans.service.ts`
- [ ] Create `investments.service.ts`
- [ ] Create `meetings.service.ts`
- [ ] Create `votes.service.ts`
- [ ] Create `notifications.service.ts`
- [ ] Create `documents.service.ts`
- [ ] Create `goals.service.ts`
- [ ] Create `settings.service.ts`
- [ ] Create `network.service.ts`
- [ ] Create `ai.service.ts`
- [ ] Create `billing.service.ts`
- [ ] Create `src/services/index.ts` barrel export
- [ ] Verify against every backend route
