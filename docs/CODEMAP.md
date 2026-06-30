# Pamoja Wealth — Codebase Map
*Generated 2026-06-30. Reference for build agents — read before extending domain model.*

## BACKEND — `/home/davie/WebstormProjects/pamoja-wealth-backend`

### Prisma Schema (`prisma/schema.prisma`) — 26 models

- **User** `{ id, email, phone, username, fullName, avatarUrl, passwordHash, nationalId, location, bio, isVerified, isActive, twoFactorEnabled, twoFactorSecret, kycLevel, lastLoginAt, createdAt, updatedAt }` relations: Membership[], Transaction[], Loan[]Borrower/Approver, LoanGuarantor[], Meeting[], MeetingRsvp[], Vote[], VoteBallot[], Notification[], Document[], ChatMessage[], SavingsGoal[], AuditLog[], InviteCode[], Invitation[], JoinRequest[], Donation[], Wallet?, BankAccount[], MpesaAccount[] @@index([email, phone, username, location])
- **Chama** `{ id, name, slug UQ, description, category(savings|investment|welfare|mixed), type(chama|fundraiser), privacy(public|private|invite_only), logoUrl, coverImageUrl, location, tags[], monthlyContribution, totalFunds, targetAmount, raisedAmount, deadline, allowDiscovery, requireKyc, maxMembers, status(active|dormant|archived), nextMeetingDate, createdAt, updatedAt }` — **already polymorphic via `type` + `privacy`**
- **Membership** `{ id, userId, chamaId, role(owner|admin|chairperson|treasurer|secretary|member), totalContributions, shares, contributionStreak, status, joinedAt, createdAt, updatedAt }` @@unique([userId, chamaId])
- **Transaction** `{ id, userId, chamaId, type(contribution|withdrawal|loan_disbursement|loan_repayment|investment|dividend|fee|transfer), amount, balanceAfter, method(mpesa|bank|card|cash), reference UQ, description, status, mpesaReceipt, mpesaPhone, createdAt }` — `balanceAfter` field = single-balance, must migrate to ledger
- **Loan** `{ id, chamaId, borrowerId, amount, interestRate, termMonths, amountRepaid, purpose, status, appliedDate, approvedDate, approvedById, dueDate }` + LoanGuarantor, LoanRepayment
- **Investment** `{ id, chamaId, name, type, amountInvested, currentValue, roi, riskLevel, status, startDate, maturityDate }`
- **Meeting** `{ id, chamaId, createdById, title, description, agenda(JSON), date, time, location, isVirtual, status, attendeesCount, totalInvited }` + MeetingRsvp
- **Vote** `{ id, chamaId, createdById, title, description, status, closesAt }` + VoteOption + VoteBallot
- **Notification** `{ id, userId, type, title, message, isRead, actionUrl, createdAt }`
- **Document** `{ id, chamaId, uploadedById, name, type, sizeKb, storageKey, uploadedAt }`
- **ChatMessage** `{ id, chamaId, userId, content, createdAt }`
- **SavingsGoal** `{ id, userId, chamaId, name, targetAmount, currentAmount, targetDate }`
- **AuditLog** `{ id, userId, chamaId, action, entityType, entityId, details(JSON), ipAddress, userAgent, createdAt }` — **currently mutable; needs hash chain**
- **InviteCode** `{ id, chamaId, createdById, code UQ, isActive, expiresAt }`
- **Wallet** `{ id, userId UQ, balance, currency=KES, pendingBalance, totalDeposits, totalWithdrawals, lastTransactionAt }` — **`balance` field = single-balance, must derive from ledger**
- **BankAccount** `{ id, userId, bankName, accountNumber, accountName, isDefault, isVerified, lastSynced }`
- **MpesaAccount** `{ id, userId, phoneNumber, isDefault, isVerified, lastUsed }`
- **AnalyticsCache** `{ id, chamaId, metric, period, periodKey, value, computedAt }` @@unique([chamaId, metric, period, periodKey])
- **Invitation** `{ id, chamaId, invitedById, inviteeUserId, inviteePhone, inviteeEmail, inviteeUsername, method(phone|email|username|link|qr), token UQ, status, message, expiresAt, acceptedAt }`
- **JoinRequest** `{ id, chamaId, userId, message, status, decidedById, decidedAt }`
- **Donation** `{ id, chamaId, userId, donorName, donorEmail, donorPhone, amount, message, isAnonymous, paymentMethod, reference UQ, createdAt }` — **harambee donations supported**

### Routes — `/api/v1` base (`src/routes/index.ts`)

- `/auth` register, login, verify-otp, resend-otp, forgot-password, reset-password, refresh, logout, enable-2fa, verify-2fa
- `/users` profile, search, public-profile
- `/chamas` discover, my-invitations, accept/decline-invitation, list, create, getById, update, delete, getMembers, join, invite, listInvitations, listJoinRequests, decideJoinRequest, donate, listDonations, getStats, getAnalytics
- `/wallet` deposit (+mpesa-callback), withdraw, get, history, transactions, bank-accounts CRUD, mpesa-accounts CRUD
- `/loans` `/investments` `/meetings` `/votes` `/chat` `/notifications` `/documents` `/goals` `/settings` `/network` `/ai` `/billing`
- `GET /health`

### Middleware

- `src/middleware/auth.ts` — `authenticate()`, `optionalAuth()`
- `src/middleware/permissions.ts` — `requirePermission(perm)`, `requireRole(...roles)`
- `src/middleware/rate-limit.ts` — `authLimiter` 5/min, `aiLimiter` 20/min, `standardLimiter` 100/min, `uploadLimiter` 10/min, `otpResendLimiter` 1/30s (Redis-backed)
- `src/middleware/validate.ts` — Zod validation per body/query/params
- `src/middleware/error-handler.ts` — ApiError + ZodError + JwtError
- `src/middleware/audit.ts` — `auditLog()` non-blocking

### Services — `src/services/*`

`auth`, `otp`, `email`, `sms`, `users`, `chamas`, `wallet`, `mpesa` (Daraja STK Push integrated), `loans`, `investments`, `notifications`, `votes`, `chat`, `documents`, `goals`, `settings`, `billing` (Stripe stub), `ai` (stub), `encryption` (AES-256 + masking), `network`.

### BullMQ Queues — `src/jobs/queue.ts`

`analyticsQueue`, `contributionRemindersQueue`, `meetingRemindersQueue`, `closeVotesQueue`, `overdueLoansQueue`, `mpesaReconciliationQueue` (stub), `healthScoresQueue` (stub), `monthlyStatementsQueue` (stub), `cleanupInvitesQueue`, `pruneNotificationsQueue`.

### Socket.io — `src/websocket/index.ts`

Rooms: `user:{userId}`, `chama:{chamaId}`. Events: `join:chama`, `leave:chama`, `chat:send`, `typing:start/stop`, `chat:message`, `chat:typing`, `notification:new`, `transaction:update`, `meeting:rsvp_update`, `vote:update`.

### External integrations status

| Integration | Status |
|---|---|
| M-Pesa Daraja STK Push | **integrated**, callback handler in place |
| M-Pesa C2B (paybill confirmation) | **MISSING** — required for harambee shareable links |
| M-Pesa B2C (group→member payout) | **MISSING** |
| Flutterwave | env vars only, no logic |
| Stripe | env vars only, billing stub |
| SendGrid/Resend (email) | partial — axios calls SendGrid |
| Africa's Talking (SMS) | stub |
| AWS S3 | **integrated** via `@aws-sdk/client-s3` |
| Firebase Cloud Messaging | env only, no logic |
| OpenAI / Anthropic | env only, AI service is stub |
| Sentry / Datadog | env only |

### Tests — `tests/`

Coverage: middleware auth + permissions only. Service/controller tests TBD.

---

## FRONTEND — `/home/davie/WebstormProjects/pamoja-wealth`

### Types — `src/types/index.ts`

Unions: `Role`, `Permission`, `LoanStatus`, `InvestmentStatus`, `TransactionType`, `TransactionStatus`, `MeetingStatus`, `VoteStatus`, `NotificationType`, `ThemeMode`, `ChamaCategory`, `ConnectionType`, `BankProvider`, `PaymentMethodType`.

Interfaces: `User`, `Member`, `Chama`, `Wallet`, `WalletHistoryPoint`, `Loan`, `Investment`, `Transaction`, `Meeting`, `VoteOption`, `Vote`, `Notification`, `Analytics`, `ActivityItem`, `Settings`, `DocumentItem`, `AIChatMessage`, `BankAccount`, `MpesaAccount`, `ContributionRecord`, `MemberConnection`, `PrivacySettings`.

### Zustand stores (14) — `src/stores/*`

`authStore`, `chamaStore`, `walletStore`, `transactionStore`, `loanStore`, `investmentStore`, `meetingStore`, `chatStore`, `goalStore`, `notificationStore`, `settingsStore`, `analyticsStore`, `themeStore`, `uiStore`. All use `persist` middleware to localStorage (`pamoja-{name}`).

### API — `src/api/*`

`auth.ts`, `chama.ts`, `axios.ts` (preconfigured axios with Bearer from `pamoja_token`, baseURL from `VITE_API_BASE_URL`). **Currently all requests use mock data layer — no real network calls.**

### Schemas — `src/schemas/*` (Zod)

`auth.schema.ts` (login, register, forgot-password, otp), `chama.schema.ts` (createChama, joinChama), `wallet.schema.ts` (stubs), `loan.schema.ts` (stubs), `profile.schema.ts` (stubs).

### Routes — `src/routes/index.tsx` (React Router v6, lazy + Suspense)

**Public:** `/`, `/about`, `/privacy`, `/terms`, `/security`, `/help`
**Auth:** `/login`, `/register`, `/forgot-password`, `/otp-verification`
**Protected (ProtectedRoute + DashboardLayout):**
`/dashboard`, `/chamas`, `/chamas/create`, `/chamas/join`, `/chamas/:id`, `/members`, `/treasury`, `/loans`, `/investments`, `/wallet`, `/transactions`, `/meetings`, `/voting`, `/documents`, `/analytics`, `/ai-assistant`, `/notifications`, `/profile`, `/settings`, `/billing`, `/support`, `/network`
**Fallback:** `*` → NotFoundPage

### Layouts — `src/layouts/*`

`DashboardLayout` (sidebar + topbar), `AuthLayout` (centered form), `PublicLayout` (header + footer).

### Components — `src/components/*`

`cards/`, `charts/`, `common/`, `dialogs/`, `forms/`, `layout/`, `navigation/`, `tables/`, `ui/`.

### Hooks — `src/hooks/*` (16)

`useAuth`, `useAnalytics`, `useInvestments`, `useLoans`, `useMeetings`, `useNotification`, `usePagination`, `usePermissions`, `useSearch`, `useSort`, `useTheme`, `useTransactions`, `useVotes`, `useWallet`, `useFilter`, `useCommandPalette`.

### Mock data — `src/mock/*`

`getMockDatabase()` lazy singleton generates: 1000 users, 200 chamas, 1500 members, 10K transactions, 1000 loans, 500 investments, 500 meetings, 500 votes, 1000 notifications, 60 activity items, 80 documents, 90 days wallet history. Avatars via dicebear.

### PWA — `public/manifest.json`

`{ name: "Pamoja Wealth", short_name: "Pamoja", display: "standalone", theme_color: "#059669", icons: 192/512 + maskable }`.

### Env vars

- `VITE_API_BASE_URL` (default `https://api.pamojawealth.app/v1`)
- `VITE_USE_MOCKS` = "true" (toggles mock vs real API)

---

## Gap summary vs research dossier

| Gap | Where to add |
|---|---|
| Double-entry ledger | New Prisma models `LedgerAccount`+`LedgerEntry`; new `src/services/ledger.service.ts`; or TigerBeetle sidecar |
| Idempotency middleware | New `src/middleware/idempotency.ts` (Redis-backed); wire on every POST under `/wallet`, `/loans`, `/chamas/:id/donate`, `/payments/*` |
| M-Pesa C2B paybill flow | New `src/routes/webhooks/mpesa-c2b.ts`; new field `Chama.paybillAccountNumber` |
| M-Pesa B2C payout | Add to `src/services/mpesa.service.ts`; new BullMQ `b2c-disburse` queue |
| Circuit breaker on Daraja | Wrap `src/services/mpesa.service.ts` calls in `opossum` |
| Rule engine | New Prisma model `ChamaRule` (versioned JSONB, hash-chained); new `src/services/rule-engine.service.ts` evaluator; new `src/services/rule-compiler.service.ts` (Claude structured outputs) |
| Rule engine hooks | Wire evaluator into `chamas.join`, `wallet.deposit`, `loans.create`, `votes.castVote`, `chamas.donate` |
| KYC tiering | New `src/services/kyc.service.ts` (Smile Identity); new `User.kycTier`, `User.lastKycAt` fields |
| Hash-chained audit | Add `prevHash` + `hash` columns to existing `AuditLog`; daily Merkle root publisher |
| FRC STR pipeline | New `SuspiciousTransactionReport` model + BullMQ flag worker |
| Multi-tenant RLS | Postgres RLS on every tenant-owned table + Prisma middleware setting `app.current_tenant` GUC |
| Public discovery feed | New frontend page `src/pages/Discover.tsx` (wire to existing `chamas.discover` API) |
| Public campaign page | New `src/pages/Campaign/[slug].tsx` with OG previews + share buttons |
| Rule-builder UI | New `src/pages/RuleBuilder.tsx` + `src/components/rule-builder/*` |
| WhatsApp bot | New `src/routes/webhooks/whatsapp.ts` + WhatsApp template approval flow |
| Native mobile | New Expo SDK 53 project (workspace) sharing business logic; OR migrate `src/` to Expo Router |
