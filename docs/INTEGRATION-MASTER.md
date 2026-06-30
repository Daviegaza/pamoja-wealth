# Pamoja Wealth — Backend-to-Frontend Integration Master Plan

**Created:** 2026-06-29
**Status:** COMPLETED

## Architecture Overview

- **Backend:** Express + Prisma + PostgreSQL at `/api/v1` (port 3000) — lives at `/home/davie/WebstormProjects/pamoja-wealth-backend/`
- **Frontend:** React 18 + Vite + Zustand + React Router (port 5173) — lives at `/home/davie/WebstormProjects/pamoja-wealth/`
- **Current state:** Frontend stores wired to backend API via typed service layer, all 16 route groups mapped

## Integration Steps

| Step | Status | File |
|------|--------|------|
| 01 — API Service Layer | ✅ COMPLETED | [STEP-01-API-SERVICES.md](STEP-01-API-SERVICES.md) |
| 02 — Environment & Config | ✅ COMPLETED | [STEP-02-ENV-CONFIG.md](STEP-02-ENV-CONFIG.md) |
| 03 — Auth Integration | ✅ COMPLETED | [STEP-03-AUTH-INTEGRATION.md](STEP-03-AUTH-INTEGRATION.md) |
| 04 — Chamas & Members | ✅ COMPLETED | [STEP-04-CHAMAS-MEMBERS.md](STEP-04-CHAMAS-MEMBERS.md) |
| 05 — Wallet & Transactions | ✅ COMPLETED | [STEP-05-WALLET-TRANSACTIONS.md](STEP-05-WALLET-TRANSACTIONS.md) |
| 06 — Loans Integration | ✅ COMPLETED | [STEP-06-LOANS.md](STEP-06-LOANS.md) |
| 07 — Investments Integration | ✅ COMPLETED | [STEP-07-INVESTMENTS.md](STEP-07-INVESTMENTS.md) |
| 08 — Meetings & Votes | ✅ COMPLETED | [STEP-08-MEETINGS-VOTES.md](STEP-08-MEETINGS-VOTES.md) |
| 09 — Notifications & Documents | ✅ COMPLETED | [STEP-09-NOTIFICATIONS-DOCS.md](STEP-09-NOTIFICATIONS-DOCS.md) |
| 10 — Goals, Analytics & AI | ✅ COMPLETED | [STEP-10-GOALS-ANALYTICS-AI.md](STEP-10-GOALS-ANALYTICS-AI.md) |
| 11 — Settings, Network & Billing | ✅ COMPLETED | [STEP-11-SETTINGS-NETWORK-BILLING.md](STEP-11-SETTINGS-NETWORK-BILLING.md) |
| 12 — Final Wiring & Cleanup | ✅ COMPLETED | [STEP-12-FINAL-CLEANUP.md](STEP-12-FINAL-CLEANUP.md) |

## Key Decisions

- **Data fetching:** React Query (TanStack Query) + Axios for server state
- **Client state:** Zustand (already in use, keep for UI state)
- **Auth tokens:** JWT access/refresh stored in localStorage, sent via Axios interceptor
- **Mock removal:** Keep mock generators for testing but remove from production stores
- **Error handling:** Global Axios interceptor + per-query error states
- **Type sharing:** Frontend types already match backend schema — keep in sync manually

## Backend Route Map

| Route Prefix | Auth Required | Description |
|-------------|---------------|-------------|
| `/api/v1/auth` | Public | Register, login, OTP, password reset, 2FA |
| `/api/v1/users` | Yes | Profile, search |
| `/api/v1/chamas` | Yes | CRUD, members, join, invite, analytics |
| `/api/v1/wallet` | Yes | Balance, deposit, withdraw, transactions |
| `/api/v1/loans` | Yes | CRUD, approve, reject, repay |
| `/api/v1/investments` | Yes | CRUD, performance |
| `/api/v1/meetings` | Yes | CRUD, RSVP, attendance |
| `/api/v1/votes` | Yes | CRUD, cast ballot, results |
| `/api/v1/notifications` | Yes | List, mark read, preferences |
| `/api/v1/documents` | Yes | Upload, download, list |
| `/api/v1/goals` | Yes | CRUD, progress |
| `/api/v1/settings` | Yes | User & chama settings |
| `/api/v1/network` | Yes | Connections, privacy |
| `/api/v1/chat` | Yes | Messages (REST + Socket.IO) |
| `/api/v1/ai` | Yes | AI assistant |
| `/api/v1/billing` | Yes | Plans, invoices, payments |
| `/api/v1/health` | Public | Health check |
