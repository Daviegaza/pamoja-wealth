# Pamoja Wealth — Backend Specification

> Complete backend requirements to make every frontend feature work.
> Frontend: Vite + React 19 + TypeScript + Tailwind + Zustand (43 pages, 62 components, 14 stores, 16 hooks).
> Target markets: Kenya, Tanzania, Uganda, Rwanda, Nigeria, Ghana, South Africa, Egypt.

---

## 1. Architecture Overview

```
                    ┌──────────┐
                    │  CDN/Edge │
                    └────┬─────┘
                         │
              ┌──────────┴──────────┐
              │   API Gateway (Kong) │
              └──────────┬──────────┘
                         │
         ┌───────────────┼───────────────┐
         │               │               │
   ┌─────┴─────┐  ┌──────┴──────┐  ┌─────┴─────┐
   │ Auth Svc  │  │  Core API   │  │  AI Svc   │
   │ (Ory)     │  │  (Node.js)  │  │  (Python) │
   └───────────┘  └──────┬──────┘  └───────────┘
                         │
              ┌──────────┼──────────┐
              │          │          │
        ┌─────┴────┐ ┌───┴────┐ ┌──┴──────┐
        │ Postgres │ │ Redis  │ │  S3     │
        │ (primary)│ │ (cache)│ │ (files) │
        └──────────┘ └────────┘ └─────────┘
```

- **API:** Node.js + Express/Fastify + TypeScript
- **Database:** PostgreSQL 15+ with PostGIS for location
- **Cache:** Redis for sessions, rate limiting, real-time pub/sub
- **Storage:** S3-compatible (Vercel Blob, Cloudflare R2, AWS S3)
- **Auth:** Ory Kratos (self-hosted) or Clerk
- **AI:** Python FastAPI microservice (LLM inference)
- **Payments:** M-Pesa Daraja API, Flutterwave, Stripe
- **Push:** Firebase Cloud Messaging + APNs
- **Email/SMS:** SendGrid + Africa's Talking
- **Queue:** BullMQ (Redis-backed) for async jobs

---

## 2. Database Schema

### 2.1 Users Table

```sql
CREATE TABLE users (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email           VARCHAR(255) UNIQUE NOT NULL,
  phone           VARCHAR(20) UNIQUE NOT NULL,
  full_name       VARCHAR(255) NOT NULL,
  avatar_url      TEXT,
  password_hash   VARCHAR(255) NOT NULL,
  national_id     VARCHAR(50),
  location        VARCHAR(255),
  
  -- Status
  is_verified     BOOLEAN DEFAULT FALSE,
  is_active       BOOLEAN DEFAULT TRUE,
  two_factor_enabled BOOLEAN DEFAULT FALSE,
  two_factor_secret  VARCHAR(64),
  
  -- Timestamps
  last_login_at   TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_location ON users(location);
```

### 2.2 Chamas Table

```sql
CREATE TABLE chamas (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name              VARCHAR(255) NOT NULL,
  description       TEXT,
  category          VARCHAR(50) NOT NULL CHECK (category IN (
                      'savings', 'investment', 'welfare', 'mixed'
                    )),
  logo_url          TEXT,
  location          VARCHAR(255),
  
  -- Financial
  monthly_contribution DECIMAL(12,2) NOT NULL DEFAULT 0,
  total_funds          DECIMAL(14,2) NOT NULL DEFAULT 0,
  
  -- Status
  status            VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN (
                      'active', 'dormant', 'archived'
                    )),
  
  -- Dates
  next_meeting_date DATE,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_chamas_status ON chamas(status);
CREATE INDEX idx_chamas_category ON chamas(category);
CREATE INDEX idx_chamas_location ON chamas(location);
```

### 2.3 Memberships Table (User ↔ Chama)

```sql
CREATE TABLE memberships (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  chama_id        UUID NOT NULL REFERENCES chamas(id) ON DELETE CASCADE,
  role            VARCHAR(50) NOT NULL DEFAULT 'member' CHECK (role IN (
                    'owner', 'member', 'treasurer', 'secretary', 
                    'chairperson', 'admin'
                  )),
  
  -- Stats
  total_contributions  DECIMAL(14,2) NOT NULL DEFAULT 0,
  shares              INTEGER NOT NULL DEFAULT 0,
  contribution_streak INTEGER NOT NULL DEFAULT 0,
  
  -- Status
  status            VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN (
                      'active', 'inactive', 'suspended'
                    )),
  
  joined_at         TIMESTAMPTZ DEFAULT NOW(),
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, chama_id)
);

CREATE INDEX idx_memberships_user ON memberships(user_id);
CREATE INDEX idx_memberships_chama ON memberships(chama_id);
CREATE INDEX idx_memberships_role ON memberships(role);
```

### 2.4 Transactions Table

```sql
CREATE TABLE transactions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id),
  chama_id        UUID REFERENCES chamas(id),
  
  type            VARCHAR(30) NOT NULL CHECK (type IN (
                    'contribution', 'withdrawal', 'loan_disbursement',
                    'loan_repayment', 'investment', 'dividend', 
                    'fee', 'transfer'
                  )),
  amount          DECIMAL(14,2) NOT NULL,
  balance_after   DECIMAL(14,2) NOT NULL,
  
  -- Payment method
  method          VARCHAR(20) CHECK (method IN ('mpesa', 'bank', 'card', 'cash')),
  reference       VARCHAR(50) UNIQUE NOT NULL,
  description     TEXT,
  
  status          VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN (
                    'completed', 'pending', 'failed', 'reversed'
                  )),
  
  -- M-Pesa specific
  mpesa_receipt   VARCHAR(50),
  mpesa_phone     VARCHAR(20),
  
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_transactions_user ON transactions(user_id);
CREATE INDEX idx_transactions_chama ON transactions(chama_id);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_created ON transactions(created_at DESC);
CREATE INDEX idx_transactions_reference ON transactions(reference);
```

### 2.5 Loans Table

```sql
CREATE TABLE loans (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chama_id        UUID NOT NULL REFERENCES chamas(id),
  borrower_id     UUID NOT NULL REFERENCES users(id),
  
  amount          DECIMAL(14,2) NOT NULL,
  interest_rate   DECIMAL(5,2) NOT NULL,
  term_months     INTEGER NOT NULL,
  amount_repaid   DECIMAL(14,2) NOT NULL DEFAULT 0,
  
  purpose         TEXT NOT NULL,
  status          VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN (
                    'pending', 'approved', 'active', 'completed',
                    'defaulted', 'rejected'
                  )),
  
  applied_date    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  approved_date   TIMESTAMPTZ,
  approved_by     UUID REFERENCES users(id),
  due_date        DATE NOT NULL,
  
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_loans_chama ON loans(chama_id);
CREATE INDEX idx_loans_borrower ON loans(borrower_id);
CREATE INDEX idx_loans_status ON loans(status);

-- Loan guarantors (many-to-many)
CREATE TABLE loan_guarantors (
  loan_id   UUID REFERENCES loans(id) ON DELETE CASCADE,
  user_id   UUID REFERENCES users(id),
  PRIMARY KEY (loan_id, user_id)
);

-- Loan repayments schedule
CREATE TABLE loan_repayments (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  loan_id     UUID NOT NULL REFERENCES loans(id) ON DELETE CASCADE,
  amount      DECIMAL(14,2) NOT NULL,
  principal   DECIMAL(14,2) NOT NULL,
  interest    DECIMAL(14,2) NOT NULL,
  due_date    DATE NOT NULL,
  paid_date   TIMESTAMPTZ,
  status      VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN (
                'pending', 'paid', 'overdue'
              ))
);

CREATE INDEX idx_repayments_loan ON loan_repayments(loan_id);
```

### 2.6 Investments Table

```sql
CREATE TABLE investments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chama_id        UUID NOT NULL REFERENCES chamas(id),
  
  name            VARCHAR(255) NOT NULL,
  type            VARCHAR(50) NOT NULL CHECK (type IN (
                    'real_estate', 'stocks', 'bonds', 'treasury_bills',
                    'money_market', 'sacco'
                  )),
  
  amount_invested DECIMAL(14,2) NOT NULL,
  current_value   DECIMAL(14,2) NOT NULL,
  roi             DECIMAL(6,2) NOT NULL DEFAULT 0,
  
  risk_level      VARCHAR(10) NOT NULL CHECK (risk_level IN ('low', 'medium', 'high')),
  status          VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN (
                    'active', 'matured', 'closed', 'pending'
                  )),
  
  start_date      DATE NOT NULL,
  maturity_date   DATE,
  
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_investments_chama ON investments(chama_id);
CREATE INDEX idx_investments_status ON investments(status);
```

### 2.7 Meetings Table

```sql
CREATE TABLE meetings (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chama_id        UUID NOT NULL REFERENCES chamas(id),
  created_by      UUID NOT NULL REFERENCES users(id),
  
  title           VARCHAR(255) NOT NULL,
  description     TEXT,
  agenda          JSONB DEFAULT '[]',
  
  date            DATE NOT NULL,
  time            TIME NOT NULL,
  location        VARCHAR(255) NOT NULL,
  is_virtual      BOOLEAN DEFAULT FALSE,
  
  status          VARCHAR(20) NOT NULL DEFAULT 'scheduled' CHECK (status IN (
                    'scheduled', 'ongoing', 'completed', 'cancelled'
                  )),
  
  attendees_count INTEGER NOT NULL DEFAULT 0,
  total_invited   INTEGER NOT NULL DEFAULT 0,
  
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_meetings_chama ON meetings(chama_id);
CREATE INDEX idx_meetings_date ON meetings(date);
CREATE INDEX idx_meetings_status ON meetings(status);

-- Meeting RSVPs
CREATE TABLE meeting_rsvps (
  meeting_id  UUID REFERENCES meetings(id) ON DELETE CASCADE,
  user_id     UUID REFERENCES users(id) ON DELETE CASCADE,
  status      VARCHAR(20) NOT NULL CHECK (status IN ('attending', 'declined', 'tentative')),
  responded_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (meeting_id, user_id)
);
```

### 2.8 Votes Table

```sql
CREATE TABLE votes (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chama_id        UUID NOT NULL REFERENCES chamas(id),
  created_by      UUID NOT NULL REFERENCES users(id),
  
  title           VARCHAR(255) NOT NULL,
  description     TEXT,
  
  status          VARCHAR(20) NOT NULL DEFAULT 'open' CHECK (status IN (
                    'open', 'closed', 'passed', 'rejected'
                  )),
  
  closes_at       TIMESTAMPTZ NOT NULL,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_votes_chama ON votes(chama_id);
CREATE INDEX idx_votes_status ON votes(status);

-- Vote options
CREATE TABLE vote_options (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vote_id   UUID NOT NULL REFERENCES votes(id) ON DELETE CASCADE,
  label     VARCHAR(255) NOT NULL,
  count     INTEGER NOT NULL DEFAULT 0
);

-- Vote ballots (who voted for what)
CREATE TABLE vote_ballots (
  vote_id     UUID REFERENCES votes(id) ON DELETE CASCADE,
  option_id   UUID REFERENCES vote_options(id) ON DELETE CASCADE,
  user_id     UUID REFERENCES users(id),
  cast_at     TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (vote_id, user_id)
);
```

### 2.9 Notifications Table

```sql
CREATE TABLE notifications (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  type        VARCHAR(20) NOT NULL CHECK (type IN (
                'info', 'success', 'warning', 'error',
                'loan', 'meeting', 'vote', 'wallet'
              )),
  title       VARCHAR(255) NOT NULL,
  message     TEXT NOT NULL,
  
  is_read     BOOLEAN DEFAULT FALSE,
  action_url  TEXT,
  
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = FALSE;
```

### 2.10 Documents Table

```sql
CREATE TABLE documents (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chama_id      UUID REFERENCES chamas(id),
  uploaded_by   UUID NOT NULL REFERENCES users(id),
  
  name          VARCHAR(255) NOT NULL,
  type          VARCHAR(20) NOT NULL CHECK (type IN ('pdf', 'doc', 'image', 'sheet')),
  size_kb       INTEGER NOT NULL,
  storage_key   TEXT NOT NULL,
  
  uploaded_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_documents_chama ON documents(chama_id);
```

### 2.11 Chat Messages Table

```sql
CREATE TABLE chat_messages (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chama_id    UUID NOT NULL REFERENCES chamas(id),
  user_id     UUID NOT NULL REFERENCES users(id),
  content     TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_chat_chama ON chat_messages(chama_id);
CREATE INDEX idx_chat_created ON chat_messages(chama_id, created_at DESC);
```

### 2.12 Savings Goals Table

```sql
CREATE TABLE savings_goals (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id),
  chama_id        UUID REFERENCES chamas(id),
  
  name            VARCHAR(255) NOT NULL,
  target_amount   DECIMAL(14,2) NOT NULL,
  current_amount  DECIMAL(14,2) NOT NULL DEFAULT 0,
  target_date     DATE NOT NULL,
  
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_goals_user ON savings_goals(user_id);
```

### 2.13 Audit Logs Table

```sql
CREATE TABLE audit_logs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES users(id),
  chama_id    UUID REFERENCES chamas(id),
  
  action      VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id   UUID,
  details     JSONB,
  
  ip_address  INET,
  user_agent  TEXT,
  
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_user ON audit_logs(user_id);
CREATE INDEX idx_audit_chama ON audit_logs(chama_id);
CREATE INDEX idx_audit_created ON audit_logs(created_at DESC);
CREATE INDEX idx_audit_action ON audit_logs(action);
```

### 2.14 Invite Codes Table

```sql
CREATE TABLE invite_codes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chama_id    UUID NOT NULL REFERENCES chamas(id),
  created_by  UUID NOT NULL REFERENCES users(id),
  
  code        VARCHAR(20) UNIQUE NOT NULL,
  
  is_active   BOOLEAN DEFAULT TRUE,
  expires_at  TIMESTAMPTZ,
  
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_invites_chama ON invite_codes(chama_id);
CREATE UNIQUE INDEX idx_invites_code ON invite_codes(code);
```

### 2.15 Wallet / Bank Accounts

```sql
CREATE TABLE wallets (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES users(id) UNIQUE,
  
  balance           DECIMAL(14,2) NOT NULL DEFAULT 0,
  currency          VARCHAR(3) NOT NULL DEFAULT 'KES',
  pending_balance   DECIMAL(14,2) NOT NULL DEFAULT 0,
  
  total_deposits    DECIMAL(14,2) NOT NULL DEFAULT 0,
  total_withdrawals DECIMAL(14,2) NOT NULL DEFAULT 0,
  
  last_transaction_at TIMESTAMPTZ,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE bank_accounts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id),
  
  bank_name       VARCHAR(50) NOT NULL,
  account_number  VARCHAR(50) NOT NULL,
  account_name    VARCHAR(255) NOT NULL,
  
  is_default      BOOLEAN DEFAULT FALSE,
  is_verified     BOOLEAN DEFAULT FALSE,
  
  last_synced     TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE mpesa_accounts (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES users(id),
  
  phone_number  VARCHAR(20) NOT NULL,
  is_default    BOOLEAN DEFAULT FALSE,
  is_verified   BOOLEAN DEFAULT FALSE,
  
  last_used     TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);
```

### 2.16 Analytics Cache Table

```sql
CREATE TABLE analytics_cache (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chama_id    UUID NOT NULL REFERENCES chamas(id),
  
  metric      VARCHAR(50) NOT NULL,
  period      VARCHAR(20) NOT NULL, -- 'daily', 'monthly', 'yearly'
  period_key  VARCHAR(20) NOT NULL, -- e.g., '2026-06', '2026'
  value       DECIMAL(16,2) NOT NULL,
  
  computed_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(chama_id, metric, period, period_key)
);
```

---

## 3. Role & Permission System

### 3.1 Roles

| Role | Description |
|------|-------------|
| `owner` | Created the chama. Full access. Cannot be removed. |
| `admin` | Can manage members, approve loans, view analytics |
| `chairperson` | Can run meetings, create votes, manage members |
| `treasurer` | Can manage treasury, view analytics |
| `secretary` | Can create meetings, manage votes |
| `member` | Can view dashboard, contribute, apply for loans, vote |

### 3.2 Permissions Matrix

| Permission | Owner | Admin | Chair | Treasurer | Secretary | Member |
|-----------|-------|-------|-------|-----------|-----------|--------|
| `view_dashboard` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| `manage_members` | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ |
| `manage_treasury` | ✓ | ✓ | ✗ | ✓ | ✗ | ✗ |
| `approve_loans` | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ |
| `create_meetings` | ✓ | ✓ | ✓ | ✗ | ✓ | ✗ |
| `manage_votes` | ✓ | ✓ | ✓ | ✗ | ✓ | ✗ |
| `manage_settings` | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ |
| `view_analytics` | ✓ | ✓ | ✓ | ✓ | ✗ | ✗ |
| `manage_billing` | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ |

### 3.3 Permission Check Middleware

```typescript
// Express middleware
function requirePermission(permission: Permission) {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { userId, chamaId } = req.params;
    
    const membership = await db.memberships.findOne({
      where: { userId, chamaId }
    });
    
    if (!membership) {
      return res.status(403).json({ error: 'Not a member of this chama' });
    }
    
    const permissions = ROLE_PERMISSIONS[membership.role];
    if (!permissions.includes(permission)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    
    req.membership = membership;
    next();
  };
}
```

---

## 4. REST API Endpoints

### 4.1 Authentication

```
POST   /api/auth/register
       Body: { email, phone, fullName, password }
       Response: { user, accessToken, refreshToken }
       Notes: Creates user + wallet. Sends OTP to email/phone.

POST   /api/auth/login
       Body: { email, password }
       Response: { user, accessToken, refreshToken }
       Rate limit: 5 attempts per minute per IP

POST   /api/auth/verify-otp
       Body: { userId, code }
       Response: { verified: true }

POST   /api/auth/resend-otp
       Body: { userId }
       Rate limit: 1 per 30 seconds

POST   /api/auth/forgot-password
       Body: { email }
       Response: { message: "Reset instructions sent" }

POST   /api/auth/reset-password
       Body: { token, newPassword }

POST   /api/auth/refresh
       Body: { refreshToken }
       Response: { accessToken }

POST   /api/auth/logout
       Headers: Authorization: Bearer <token>
       Response: { success: true }
```

### 4.2 Users

```
GET    /api/users/me
       Response: { user, wallet, memberships[] }

PATCH  /api/users/me
       Body: { fullName?, phone?, location?, bio?, avatarUrl? }

GET    /api/users/me/profile
       Response: { user, joinedChamas, totalContributed, totalBorrowed, reputationScore }

POST   /api/users/me/enable-2fa
       Response: { secret, qrCode }

POST   /api/users/me/verify-2fa
       Body: { code }
       Response: { enabled: true }

GET    /api/users/:id
       Response: { user } (public profile — limited fields)

GET    /api/users/search?q=&chamaId=
       Response: { users[] }
```

### 4.3 Chamas

```
GET    /api/chamas
       Query: ?search=&category=&status=&page=&pageSize=
       Response: { items: Chama[], total, page, pageSize, totalPages }

POST   /api/chamas
       Body: { name, description, category, monthlyContribution, location }
       Response: { chama, membership }
       Notes: Creator automatically becomes 'owner' member.

GET    /api/chamas/:id
       Response: { chama, members[], stats }

PATCH  /api/chamas/:id
       Permission: manage_settings
       Body: { name?, description?, monthlyContribution?, location? }

DELETE /api/chamas/:id
       Permission: owner only
       Response: { success: true }

GET    /api/chamas/:id/members
       Query: ?search=&role=&page=&pageSize=
       Response: { items: Member[], total, page }

POST   /api/chamas/:id/join
       Body: { inviteCode }
       Response: { membership, status: "pending" | "approved" }
       Notes: If chama is public, auto-approve. If private, pending approval.

POST   /api/chamas/:id/invite
       Permission: manage_members
       Body: { email? }
       Response: { inviteCode }
       Notes: Generates invite code. If email provided, sends invitation.

POST   /api/chamas/:id/approve-join/:userId
       Permission: manage_members
       Response: { membership }

POST   /api/chamas/:id/remove-member/:userId
       Permission: manage_members
       Response: { success: true }

GET    /api/chamas/:id/stats
       Response: { totalFunds, memberCount, growthRate, monthlyContribution, pendingLoans, activeInvestments }

GET    /api/chamas/:id/analytics
       Query: ?period=monthly&from=&to=
       Response: Analytics object (contributionGrowth, cashFlow, etc.)
```

### 4.4 Contributions & Wallet

```
POST   /api/wallet/deposit
       Body: { amount, method: "mpesa" | "bank" | "card", chamaId }
       Response: { transaction, wallet }
       Notes: 
       - M-Pesa: Returns STK Push request. Frontend polls for confirmation.
       - Card: Returns payment intent. Frontend confirms with Stripe/Flutterwave.
       - Bank: Returns reference number for manual transfer.

POST   /api/wallet/deposit/mpesa-callback
       Body: M-Pesa callback payload
       Notes: Called by Safaricom. Updates transaction status, wallet balance.

POST   /api/wallet/withdraw
       Body: { amount, method: "mpesa" | "bank", destination }
       Response: { transaction, wallet }
       Validation: amount <= wallet.balance

GET    /api/wallet
       Response: { wallet }

GET    /api/wallet/history?days=90
       Response: { history: WalletHistoryPoint[] }

GET    /api/wallet/transactions
       Query: ?page=&pageSize=&type=&status=&chamaId=
       Response: { items: Transaction[], total, page }

POST   /api/wallet/bank-accounts
       Body: { bankName, accountNumber, accountName }
       Response: { bankAccount }

GET    /api/wallet/bank-accounts
       Response: { accounts: BankAccount[] }

DELETE /api/wallet/bank-accounts/:id
       Response: { success: true }

POST   /api/wallet/mpesa-accounts
       Body: { phoneNumber }
       Response: { mpesaAccount }

GET    /api/wallet/mpesa-accounts
       Response: { accounts: MpesaAccount[] }

DELETE /api/wallet/mpesa-accounts/:id
       Response: { success: true }
```

### 4.5 Loans

```
GET    /api/loans
       Query: ?chamaId=&status=&page=&pageSize=
       Response: { items: Loan[], total, page }

POST   /api/loans
       Body: { chamaId, amount, termMonths, purpose, guarantorIds }
       Response: { loan }
       Notes: Creates pending loan. Notifies chama admins for approval.

POST   /api/loans/:id/approve
       Permission: approve_loans
       Response: { loan }
       Notes: Sets status to 'approved'. Creates loan_disbursement transaction.

POST   /api/loans/:id/reject
       Permission: approve_loans
       Response: { loan }

GET    /api/loans/:id/repayments
       Response: { repayments: LoanRepayment[], schedule }

POST   /api/loans/:id/repay
       Body: { amount }
       Response: { repayment, loan }
       Notes: Creates loan_repayment transaction. If fully repaid, closes loan.

GET    /api/loans/:id
       Response: { loan, repayments[], guarantors[] }
```

### 4.6 Investments

```
GET    /api/investments
       Query: ?chamaId=&type=&status=&page=&pageSize=
       Response: { items: Investment[], total, page }

POST   /api/investments
       Permission: manage_treasury
       Body: { chamaId, name, type, amountInvested, riskLevel, startDate, maturityDate? }
       Response: { investment }

PATCH  /api/investments/:id
       Permission: manage_treasury
       Body: { currentValue?, roi?, status? }

GET    /api/investments/:id
       Response: { investment, performanceHistory[] }
```

### 4.7 Meetings

```
GET    /api/meetings
       Query: ?chamaId=&status=&from=&to=&page=&pageSize=
       Response: { items: Meeting[], total, page }

POST   /api/meetings
       Permission: create_meetings
       Body: { chamaId, title, description, date, time, location, isVirtual, agenda }
       Response: { meeting }
       Notes: Notifies all chama members.

POST   /api/meetings/:id/rsvp
       Body: { status: "attending" | "declined" | "tentative" }
       Response: { rsvp }
       Notes: Updates attendee count.

PATCH  /api/meetings/:id
       Permission: create_meetings
       Body: { title?, description?, date?, time?, location?, status? }

GET    /api/meetings/:id
       Response: { meeting, rsvps[], attendees[], declined[] }

POST   /api/meetings/:id/minutes
       Permission: create_meetings
       Body: { content }
       Response: { minutes }
```

### 4.8 Voting

```
GET    /api/votes
       Query: ?chamaId=&status=&page=&pageSize=
       Response: { items: Vote[], total, page }

POST   /api/votes
       Permission: manage_votes
       Body: { chamaId, title, description, options: string[], closesAt }
       Response: { vote }
       Notes: Notifies all chama members.

POST   /api/votes/:id/cast
       Body: { optionId }
       Response: { ballot }
       Notes: One vote per user per vote. Cannot change after casting.

GET    /api/votes/:id
       Response: { vote, options[], userVote? }

POST   /api/votes/:id/close
       Permission: manage_votes or automatic at closesAt

GET    /api/votes/:id/results
       Response: { vote, options[], totalVotes, winner }
```

### 4.9 Documents

```
GET    /api/documents
       Query: ?chamaId=&search=&page=&pageSize=
       Response: { items: Document[], total, page }

POST   /api/documents/upload
       Body: multipart/form-data { file, chamaId }
       Response: { document }
       Notes: 
       - Max file size: 25MB
       - Allowed types: pdf, doc, docx, xls, xlsx, png, jpg, jpeg, gif, webp
       - Virus scan before storage
       - Generates signed URL for download

GET    /api/documents/:id/download
       Response: 302 redirect to signed S3 URL
       Notes: URL expires in 15 minutes.

DELETE /api/documents/:id
       Permission: manage_settings or owner of document
       Response: { success: true }
```

### 4.10 Notifications

```
GET    /api/notifications
       Query: ?unreadOnly=&page=&pageSize=
       Response: { items: Notification[], total, unreadCount }

POST   /api/notifications/:id/read
       Response: { notification }

POST   /api/notifications/read-all
       Response: { success: true }

DELETE /api/notifications/:id
       Response: { success: true }
```

### 4.11 Chat

```
GET    /api/chamas/:id/messages
       Query: ?before=&limit=50
       Response: { messages: ChatMessage[] }

POST   /api/chamas/:id/messages
       Body: { content }
       Response: { message }
       Notes: Broadcast via WebSocket to all chama members online.

-- WebSocket events --
Event: chat:message      { chamaId, message }
Event: chat:typing       { chamaId, userId, userName }
Event: notification:new  { notification }
Event: transaction:new   { transaction, wallet }
Event: meeting:rsvp      { meetingId, userId, status }
Event: vote:cast         { voteId, optionId }
```

### 4.12 Goals

```
GET    /api/goals
       Response: { goals: SavingsGoal[] }

POST   /api/goals
       Body: { name, targetAmount, targetDate, chamaId? }
       Response: { goal }

PATCH  /api/goals/:id
       Body: { name?, targetAmount?, targetDate? }

DELETE /api/goals/:id
       Response: { success: true }
```

### 4.13 Settings

```
GET    /api/settings
       Response: { theme, language, currency, emailNotifications, smsNotifications, pushNotifications, twoFactorEnabled }

PATCH  /api/settings
       Body: Partial<Settings>
       Response: { settings }
```

### 4.14 Network / Connections

```
GET    /api/network/connections
       Query: ?search=&type=&page=&pageSize=
       Response: { items: MemberConnection[], total, page }
       Notes: Derives connections from: chama mates, guarantors, borrowers, transaction partners, meeting attendees.

GET    /api/network/stats
       Response: { totalConnections, strongTies, verifiedCount, chamaCount }

GET    /api/network/privacy
       Response: { privacySettings }

PATCH  /api/network/privacy
       Body: Partial<PrivacySettings>
       Response: { privacySettings }
```

### 4.15 AI Assistant

```
POST   /api/ai/chat
       Body: { messages: { role, content }[], chamaId? }
       Response: { message: { role: "assistant", content } }
       Notes: 
       - Context includes user's chamas, transactions, loans, investments
       - Rate limited: 20 requests per minute per user
       - Uses GPT-4 or Claude with system prompt about chama finance

POST   /api/ai/insights
       Query: ?chamaId=
       Response: { insights: string[] }
       Notes: Daily computed insights based on chama data trends.

POST   /api/ai/health-score
       Query: ?chamaId=
       Response: { score, details[] }
       Notes: Computes financial health score from live data.
```

### 4.16 Billing (Future)

```
GET    /api/billing/plan
       Response: { plan, status, nextBillingDate }

POST   /api/billing/upgrade
       Body: { planId }
       
POST   /api/billing/cancel

GET    /api/billing/invoices
       Query: ?page=&pageSize=
       Response: { items: Invoice[], total }
```

---

## 5. Payment Integration

### 5.1 M-Pesa Daraja API (Kenya)

```
Environment: Sandbox → Production
APIs needed:
  - STK Push (Lipa na M-Pesa Online) — for deposits
  - B2C (Business to Customer) — for withdrawals to member phones
  - C2B (Customer to Business) — for Paybill contributions
  - Transaction Status Query — for reconciliation
  - Account Balance Query — for float management

Configuration:
  - Consumer Key / Consumer Secret
  - Passkey (for STK Push)
  - Shortcode / Paybill number
  - Callback URL (must be HTTPS, publicly accessible)

STK Push Flow:
  1. User initiates deposit in app
  2. Backend sends STK Push to user's phone
  3. User enters M-Pesa PIN
  4. Safaricom sends callback to backend
  5. Backend verifies, updates transaction, credits wallet

B2C Withdrawal Flow:
  1. User initiates withdrawal in app
  2. Backend validates balance
  3. Backend sends B2C payment to user's phone
  4. Safaricom sends callback
  5. Backend verifies, updates transaction, debits wallet

Paybill Flow:
  1. User sends money to Paybill 247247 with account = chamaId
  2. Safaricom sends C2B callback
  3. Backend matches account number to chama, credits contribution

Daily Reconciliation:
  - Cron job compares M-Pesa transaction logs with internal transactions
  - Flags discrepancies for manual review
  - Auto-resolves matching transactions
```

### 5.2 Flutterwave (Pan-African)

```
For: Card payments, bank transfers, mobile money across Africa
Countries: Nigeria, Ghana, Uganda, Tanzania, Rwanda, South Africa

APIs needed:
  - Payment Initiation
  - Payment Verification
  - Transfer (for withdrawals to bank accounts)
  - Webhook receiver for payment notifications
```

### 5.3 Stripe (International)

```
For: International card payments, subscription billing
Used for: Billing page (plan subscriptions), international members
```

---

## 6. Background Jobs (BullMQ)

| Job | Schedule | Description |
|-----|----------|-------------|
| `compute-analytics` | Daily 2am | Pre-compute chama analytics for fast dashboard loading |
| `send-contribution-reminders` | Daily 8am | SMS/email members behind on monthly contributions |
| `send-meeting-reminders` | 1h before meeting | Notify attendees of upcoming meetings |
| `close-expired-votes` | Every 5 min | Auto-close votes past their `closesAt` date |
| `check-overdue-loans` | Daily | Mark overdue repayments, send reminders |
| `reconcile-mpesa` | Hourly | Reconcile M-Pesa transactions with internal records |
| `compute-health-scores` | Daily 3am | Update member health scores |
| `generate-monthly-statements` | 1st of month | Generate chama financial statements |
| `cleanup-expired-invites` | Daily | Deactivate expired invite codes |
| `prune-old-notifications` | Weekly | Delete notifications older than 90 days |

---

## 7. Real-Time Features (WebSocket / SSE)

```
Connection: wss://api.pamojawealth.com/ws
Authentication: JWT token in connection params

Events (server → client):
  notification:new        { notification }
  transaction:update      { transaction, wallet }
  chat:message            { chamaId, message }
  meeting:rsvp_update     { meetingId, attendeesCount, rsvps }
  vote:update             { voteId, options[], totalVotes }
  loan:status_change      { loanId, status }
  member:joined           { chamaId, member }
  contribution:received   { chamaId, amount, memberName }

Events (client → server):
  chat:send               { chamaId, content }
  typing:start            { chamaId }
  typing:stop             { chamaId }
```

---

## 8. Security Requirements

### 8.1 Authentication
- JWT access tokens (15 min expiry) + refresh tokens (7 day expiry)
- Refresh token rotation (new refresh token on each use)
- OTP for sensitive actions (withdrawals, 2FA enable/disable, password change)
- Rate limiting: 5 login attempts per minute per IP
- Account lockout after 10 failed attempts (30 min cooldown)

### 8.2 Authorization
- Every chama-scoped endpoint checks membership + permission
- Row-level security in PostgreSQL for multi-tenant isolation
- API keys for service-to-service communication

### 8.3 Data Protection
- TLS 1.3 for all traffic
- AES-256-GCM for data at rest (database encryption)
- Field-level encryption for PII (national_id, phone)
- bcrypt (cost factor 12) for password hashing
- Data residency: Option to store data in specific regions (Kenya, EU)

### 8.4 Compliance
- Kenya Data Protection Act (DPA) 2019
- Nigeria Data Protection Regulation (NDPR)
- GDPR (for EU users)
- PCI DSS Level 4 (card payments via Stripe/Flutterwave — not stored)
- SOC 2 Type II certification target

### 8.5 Infrastructure Security
- WAF (Cloudflare / AWS WAF)
- DDoS protection (Cloudflare / AWS Shield)
- CSP headers, HSTS, X-Frame-Options, X-Content-Type-Options
- Dependency scanning (Snyk / Dependabot)
- Regular penetration testing (quarterly)
- Security.txt and responsible disclosure program

---

## 9. Infrastructure

### 9.1 Hosting Options

| Option | Best For | Monthly Cost (Est.) |
|--------|----------|---------------------|
| **Vercel + Neon + Upstash** | MVP / small scale | $50-200 |
| **Railway / Render** | Mid-scale | $100-500 |
| **AWS (ECS + RDS + ElastiCache)** | Enterprise | $500-5000+ |
| **Google Cloud (Cloud Run + Cloud SQL)** | Enterprise | $500-5000+ |

### 9.2 Third-Party Services

| Service | Purpose | Monthly Cost (Est.) |
|---------|---------|---------------------|
| SendGrid / Resend | Transactional email | $20-100 |
| Africa's Talking | SMS notifications | $50-500 (usage-based) |
| Firebase Cloud Messaging | Push notifications | Free |
| Sentry | Error tracking | $26-80 |
| Logtail / Datadog | Log management | $50-200 |
| Plausible / Mixpanel | Analytics | $20-100 |
| Cloudflare | DNS, CDN, WAF | $20-200 |
| Upstash Redis | Cache, queues, pub/sub | $10-100 |

### 9.3 Monitoring & Alerting
- Uptime monitoring (BetterStack / Pingdom)
- API latency tracking (Datadog / New Relic)
- Error rate alerts (Sentry)
- Database slow query monitoring
- M-Pesa transaction failure alerts (PagerDuty)
- Daily backup verification

---

## 10. API Response Standards

### 10.1 Success Response

```json
{
  "data": { ... },
  "success": true,
  "meta": {
    "page": 1,
    "pageSize": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

### 10.2 Error Response

```json
{
  "success": false,
  "error": {
    "code": "INSUFFICIENT_FUNDS",
    "message": "Your balance of KES 1,500 is insufficient for this KES 5,000 withdrawal.",
    "details": {
      "balance": 1500,
      "requested": 5000
    }
  }
}
```

### 10.3 Error Codes

| Code | HTTP | Description |
|------|------|-------------|
| `VALIDATION_ERROR` | 400 | Invalid request body or parameters |
| `UNAUTHORIZED` | 401 | Missing or invalid token |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource doesn't exist |
| `CONFLICT` | 409 | Duplicate resource |
| `RATE_LIMITED` | 429 | Too many requests |
| `INSUFFICIENT_FUNDS` | 422 | Wallet balance too low |
| `LOAN_NOT_APPROVED` | 422 | Action requires approved loan |
| `VOTE_CLOSED` | 422 | Vote is no longer open |
| `CHAMA_FULL` | 422 | Chama member limit reached |
| `MPESA_FAILED` | 502 | M-Pesa API call failed |
| `INTERNAL_ERROR` | 500 | Unexpected server error |

---

## 11. Database Migrations

Use a migration tool (Prisma Migrate, Knex, or Flyway):

```
001_create_users.sql
002_create_chamas.sql
003_create_memberships.sql
004_create_transactions.sql
005_create_loans.sql
006_create_investments.sql
007_create_meetings.sql
008_create_votes.sql
009_create_notifications.sql
010_create_documents.sql
011_create_chat_messages.sql
012_create_savings_goals.sql
013_create_audit_logs.sql
014_create_invite_codes.sql
015_create_wallets.sql
016_create_bank_mpesa_accounts.sql
017_create_analytics_cache.sql
018_add_indexes.sql
019_add_triggers.sql
020_seed_kenyan_data.sql
```

---

## 12. Seeding & Demo Data

For the frontend demo to work against a real backend, run seeders:

```bash
npm run seed -- --users=1000 --chamas=200 --members=1500 \
  --transactions=10000 --loans=1000 --investments=500 \
  --meetings=500 --votes=500 --notifications=1000 \
  --demo-user-email=amara@pamoja.app --demo-user-password=password123
```

The demo user gets:
- Email: `amara@pamoja.app`
- Password: `password123`
- Member of 3-5 mock chamas
- Owner of 1 chama (for management features)
- Wallet with KES 50,000 balance
- 90 days of transaction history

---

## 13. Deployment Checklist

### Pre-Launch
- [ ] SSL certificates configured
- [ ] Database backups automated (daily, retained 30 days)
- [ ] Database encryption at rest enabled
- [ ] WAF rules configured (rate limiting, SQL injection, XSS)
- [ ] CSP headers configured
- [ ] M-Pesa production credentials obtained
- [ ] M-Pesa callback URLs whitelisted with Safaricom
- [ ] Flutterwave production keys obtained
- [ ] Email service (SendGrid) domain verified (SPF, DKIM, DMARC)
- [ ] SMS service (Africa's Talking) sender ID approved
- [ ] Push notification certificates (FCM + APNs)
- [ ] Error tracking (Sentry) configured
- [ ] Logging pipeline configured
- [ ] Monitoring alerts configured
- [ ] Load testing completed (target: 1000 concurrent users)
- [ ] Penetration test completed and remediated
- [ ] Data Protection Act registration (Kenya, Nigeria)
- [ ] Terms of Service + Privacy Policy live on website
- [ ] Support email/phone configured
- [ ] Incident response plan documented

### Post-Launch
- [ ] Monitor error rates for first 48 hours
- [ ] Monitor M-Pesa transaction success rate
- [ ] Monitor API latency
- [ ] Daily database backup verification
- [ ] Weekly security scan
- [ ] Monthly cost review
- [ ] Quarterly penetration test
- [ ] Annual SOC 2 audit

---

## 14. Mobile App (Capacitor)

The web app wraps in Capacitor for native distribution:

```bash
npx cap add android
npx cap add ios
npx cap sync
```

### Capacitor Plugins Needed

```json
{
  "plugins": {
    "SplashScreen": { "launchShowDuration": 2000 },
    "PushNotifications": { "presentationOptions": ["badge", "sound", "alert"] },
    "LocalNotifications": {},
    "Preferences": {},
    "Browser": {},
    "Share": {},
    "Clipboard": {},
    "Haptics": {},
    "App": {},
    "StatusBar": { "style": "dark" },
    "Keyboard": { "resize": "body" }
  }
}
```

### App Store Requirements
- App icon: 1024x1024 (iOS), 512x512 (Android adaptive)
- Splash screen: All device sizes
- Screenshots: 6.7" + 6.5" + 5.5" (iOS), phone + 7" tablet (Android)
- Privacy policy URL (live, publicly accessible)
- Data safety section (Android)
- App privacy labels (iOS)
- Age rating questionnaire
- Export compliance (iOS)

---

## 15. Environment Variables

```env
# App
NODE_ENV=production
PORT=3000
API_URL=https://api.pamojawealth.com
CORS_ORIGINS=https://app.pamojawealth.com,capacitor://localhost

# Database
DATABASE_URL=postgresql://user:password@host:5432/pamoja
DATABASE_POOL_MIN=2
DATABASE_POOL_MAX=20

# Redis
REDIS_URL=redis://user:password@host:6379

# JWT
JWT_SECRET=...
JWT_REFRESH_SECRET=...
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# M-Pesa (Safaricom Daraja)
MPESA_CONSUMER_KEY=...
MPESA_CONSUMER_SECRET=...
MPESA_PASSKEY=...
MPESA_SHORTCODE=174379
MPESA_TILL_NUMBER=...
MPESA_ENVIRONMENT=sandbox|production
MPESA_CALLBACK_BASE=https://api.pamojawealth.com/api/wallet

# Flutterwave
FLUTTERWAVE_PUBLIC_KEY=...
FLUTTERWAVE_SECRET_KEY=...
FLUTTERWAVE_ENCRYPTION_KEY=...
FLUTTERWAVE_WEBHOOK_SECRET=...

# Stripe
STRIPE_SECRET_KEY=...
STRIPE_WEBHOOK_SECRET=...

# Email (SendGrid / Resend)
SENDGRID_API_KEY=...
EMAIL_FROM=noreply@pamojawealth.com

# SMS (Africa's Talking)
AT_USERNAME=...
AT_API_KEY=...
AT_SENDER_ID=Pamoja

# Push (Firebase)
FCM_SERVER_KEY=...

# AI (OpenAI / Anthropic)
OPENAI_API_KEY=...
ANTHROPIC_API_KEY=...

# Storage (S3-compatible)
S3_ENDPOINT=...
S3_ACCESS_KEY=...
S3_SECRET_KEY=...
S3_BUCKET=pamoja-documents
S3_REGION=auto

# Monitoring
SENTRY_DSN=...
DATADOG_API_KEY=...

# Encryption
ENCRYPTION_KEY=...  # 32-byte hex for AES-256

# Feature Flags
FEATURE_CHAT_ENABLED=true
FEATURE_AI_ENABLED=true
FEATURE_MPESA_ENABLED=true
FEATURE_INVESTMENTS_ENABLED=true
```

---

## 16. Frontend ↔ Backend Migration Notes

The frontend currently uses Zustand stores with mock data. To migrate:

1. **Create API client** (`src/api/axios.ts` — already exists, configure baseURL)
2. **Replace store data sources** — Each store calls API instead of `getMockDatabase()`
3. **Add loading states** — Every store gets `isLoading`, `error` fields
4. **Add React Query** — For caching, refetching, optimistic updates
5. **Add error boundaries** — Per-page error fallbacks

Example migration for `loanStore`:

```typescript
// Before (mock)
loans: getMockDatabase().loans,

// After (API)
loans: [],
isLoading: false,
error: null,
fetchLoans: async (chamaId?: string) => {
  set({ isLoading: true, error: null });
  try {
    const { data } = await api.get('/loans', { params: { chamaId } });
    set({ loans: data.items, isLoading: false });
  } catch (err) {
    set({ error: err.message, isLoading: false });
  }
},
```

---

## 17. Mobile Money Integration Matrix

| Country | Provider | API | For |
|---------|----------|-----|-----|
| Kenya | M-Pesa (Safaricom) | Daraja API | STK Push, B2C, C2B |
| Tanzania | M-Pesa (Vodacom) | Daraja API | Same as Kenya |
| Uganda | MTN MoMo | MTN Mobile Money API | Collections, Disbursements |
| Uganda | Airtel Money | Airtel Money API | Collections, Disbursements |
| Ghana | MTN MoMo | MTN Mobile Money API | Collections, Disbursements |
| Ghana | Vodafone Cash | Vodafone Cash API | Collections, Disbursements |
| Nigeria | Flutterwave | Flutterwave API | Bank transfer, card, USSD |
| Nigeria | Paystack | Paystack API | Bank transfer, card |
| Rwanda | MTN MoMo | MTN Mobile Money API | Collections, Disbursements |
| South Africa | Stitch | Stitch API | Bank transfers, PayShap |
| Egypt | Fawry | Fawry API | Mobile wallets, cards |
| Pan-Africa | Flutterwave | Flutterwave API | 30+ payment methods |
| Pan-Africa | Chipper Cash | Chipper Cash API | Cross-border mobile money |

---

## 18. System Requirements Summary

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **API Server** | Node.js + Express/Fastify + TypeScript | REST API |
| **Database** | PostgreSQL 15+ | Primary data store |
| **Cache** | Redis (Upstash/ElastiCache) | Sessions, rate limiting, cache, pub/sub |
| **Queue** | BullMQ (Redis-backed) | Background jobs |
| **Storage** | S3-compatible | Document files |
| **Auth** | Ory Kratos or Clerk | Authentication, 2FA, OAuth |
| **Payments** | M-Pesa Daraja, Flutterwave, Stripe | Money movement |
| **Email** | SendGrid / Resend | Transactional email |
| **SMS** | Africa's Talking | SMS notifications |
| **Push** | Firebase Cloud Messaging | Push notifications |
| **AI** | Python FastAPI + LLM API | AI chat, insights, health scores |
| **Monitoring** | Sentry, Datadog | Error tracking, APM |
| **CI/CD** | GitHub Actions | Automated deploy |
| **Hosting** | Vercel (frontend) + Railway/AWS (backend) | Deployment |
| **CDN/WAF** | Cloudflare | Edge caching, DDoS protection |
| **Mobile** | Capacitor | Android + iOS native wrapper |

---

## 19. Cost Estimates

### MVP (first 1,000 users)
| Service | Monthly Cost |
|---------|-------------|
| Vercel (frontend) | $20 |
| Railway (backend) | $25 |
| Neon (database) | $20 |
| Upstash (Redis) | $10 |
| SendGrid (email) | $20 |
| Africa's Talking (SMS) | $20 |
| M-Pesa (transaction fees) | Pay-as-you-go |
| **Total MVP** | **~$115/month** |

### Growth (5,000-50,000 users)
| Service | Monthly Cost |
|---------|-------------|
| Vercel Pro | $100 |
| AWS ECS / Railway Pro | $200 |
| AWS RDS / Neon Scale | $200 |
| ElastiCache / Upstash | $100 |
| SendGrid Pro | $90 |
| Africa's Talking | $200 |
| Sentry | $80 |
| Cloudflare Pro | $200 |
| LLM API (OpenAI/Claude) | $100 |
| **Total Growth** | **~$1,270/month** |

---

## 20. Timeline Estimate

| Phase | Duration | Deliverables |
|-------|----------|-------------|
| **Phase 1: Core API** | 6-8 weeks | Auth, users, chamas, memberships, wallets, transactions |
| **Phase 2: Financial Features** | 4-6 weeks | Loans, investments, contributions, M-Pesa integration |
| **Phase 3: Community** | 4-6 weeks | Meetings, voting, chat, notifications, documents |
| **Phase 4: Intelligence** | 3-4 weeks | AI insights, health scores, analytics caching, goals |
| **Phase 5: Mobile + Launch** | 4-6 weeks | Capacitor build, app store submission, pen test, compliance |
| **Total** | **21-30 weeks** | Full production launch |

---

> **This document is the complete backend specification for Pamoja Wealth.**
> Every frontend feature in the 43-page, 62-component, 14-store frontend has a corresponding API endpoint, database table, and business logic defined here.
> Frontend + Backend = fully functional, production-ready chama management platform.
