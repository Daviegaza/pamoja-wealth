# Pamoja Wealth — Building Wealth Together

A modern frontend for chama (savings/investment group) management, targeting East African markets. Built as a fully interactive mock-data demo — every page, chart, form, modal, and flow works without a backend.

## Status: Frontend / Mock-Data Demo

This is a **fully interactive demo** suitable for stakeholder review, user testing, investor demos, and as a specification for backend development. It is **not** production-ready for real financial transactions.

### What Works

- **29 pages** across landing, auth, dashboard, chamas, members, treasury, loans, investments, wallet, transactions, meetings, voting, documents, analytics, AI assistant, notifications, profile, settings, billing, support, admin, owner, super-admin, network, plus public pages (about, privacy, terms, security, help)
- **All charts** — contribution growth, investment growth, cash flow, loan distribution, member growth, revenue trends, portfolio allocation, wallet history
- **Interactive flows** — contributions update wallet balance, loan applications create pending loans, votes increment counts, wallet deposits/withdrawals update balance, chama creation adds to store, bank/M-Pesa linking persists locally
- **Role-based UI** — sidebar, mobile nav, and command palette all respect user permissions
- **Theme** — light/dark/system with persistent preference
- **Responsive** — desktop sidebar, mobile bottom nav, and mobile hamburger menu
- **Mock data** — 1,000 users, 200 chamas, 1,500 members, 10,000 transactions, 1,000 loans, 500 investments, 500 meetings, 500 votes, 1,000 notifications, 90 days wallet history
- **PWA metadata** — manifest.json, Open Graph tags, Twitter cards, Apple web app tags
- **Accessibility** — aria-labels on icon buttons, Escape key closes modals, focus-ring utilities

### What Does NOT Work (Requires Backend)

- Real authentication (currently any valid-format credentials log you in as the demo user)
- Real financial transactions (M-Pesa, bank, card)
- Email/SMS delivery (forgot password, OTP, notifications)
- File uploads and downloads (documents)
- Real-time data (WebSocket/polling)
- Persistent data across devices (all state is local/session only)
- KYC/AML identity verification
- Audit logging and compliance reporting
- AI chat (canned responses only)

## Stack

Vite + React 19 + TypeScript + Tailwind CSS + React Router DOM + Zustand + TanStack Query + Axios + React Hook Form + Zod + Framer Motion + Recharts + Lucide React + Sonner

## Getting Started

```bash
npm install
npm run dev
```

The app runs entirely on a deterministic, seeded mock data layer (`src/mock`) — no backend required.

**Demo login:** On `/login`, credentials are pre-filled. Just click "Sign in" to enter as the demo owner (Amara Okafor).

## Project Structure

```
src/
  app/            App entry
  api/            Axios instance (configured, unused in demo)
  assets/         Static assets, animations
  components/     ui, forms, charts, cards, layout, navigation, dialogs, tables, common
  constants/      Navigation configuration
  config/         Environment config
  hooks/          22 custom hooks
  layouts/        DashboardLayout, AuthLayout, PublicLayout
  lib/            cn() and formatting utilities
  mock/           Seeded mock data generators (the "backend")
  pages/          34 routed pages across landing, auth, dashboard, chamas, members,
                  treasury, loans, investments, wallet, transactions, meetings,
                  voting, documents, analytics, AI, notifications, profile,
                  settings, billing, support, admin, network, public, not-found
  providers/      Theme, Query, Toast providers
  routes/         React Router configuration with lazy loading
  schemas/        Zod validation schemas
  services/       Mock service layer (swap for real API calls)
  stores/         12 Zustand stores (auth, chama, wallet, investment, loan,
                  meeting, transaction, notification, analytics, settings, theme, UI)
  styles/         Tailwind globals
  types/          Shared TypeScript types — fully typed, no `any`
```

## Scripts

- `npm run dev` — start the dev server
- `npm run build` — type-check and build for production
- `npm run preview` — preview the production build
- `npm run lint` — run ESLint

## Web Deployment

The app builds to static files in `dist/`. Deploy anywhere that serves static SPAs:

### Vercel (recommended)

```bash
npx vercel --prod
```

The `vercel.json` (if present) or auto-detected Vite config handles SPA routing. Set the build command to `npm run build` and output directory to `dist`.

### Netlify

```bash
npm run build
npx netlify deploy --prod --dir=dist
```

Add a `_redirects` file in `public/` with `/* /index.html 200` for SPA client-side routing.

### Static hosting (S3 + CloudFront, GitHub Pages, etc.)

```bash
npm run build
# Deploy dist/ to your static host
```

Ensure your host is configured to serve `index.html` for all paths (SPA fallback).

## Mobile Packaging (Capacitor)

Capacitor wraps the web app in a native shell for Google Play and Apple App Store:

```bash
npm install @capacitor/core @capacitor/cli @capacitor/android @capacitor/ios
npx cap init "Pamoja Wealth" "com.pamojawealth.app" --web-dir=dist
npx cap add android
npx cap add ios
```

### Build & Run

```bash
npm run build          # Build the web app
npx cap sync           # Sync web assets to native projects
npx cap open android   # Open in Android Studio
npx cap open ios       # Open in Xcode
```

### Key Capacitor Plugins

| Plugin | Purpose |
|--------|---------|
| `@capacitor/splash-screen` | Native splash screen |
| `@capacitor/status-bar` | Status bar control |
| `@capacitor/push-notifications` | Push notifications |
| `@capacitor/local-notifications` | Meeting/contribution reminders |
| `@capacitor/share` | Share invite codes |
| `@capacitor/preferences` | Secure local storage |
| `@capacitor/browser` | Open external URLs in-app |

## Pre-Launch Requirements

### Backend

- [ ] Authentication service (OAuth 2.0 / JWT with refresh tokens)
- [ ] User management API (CRUD, roles, permissions)
- [ ] Chama/group management API
- [ ] Transaction processing (contributions, withdrawals, loan disbursements)
- [ ] Loan origination and repayment tracking
- [ ] Investment tracking and valuation
- [ ] Meeting scheduling and attendance
- [ ] Voting system with cryptographic integrity
- [ ] Notification service (push, email, SMS)
- [ ] Document storage (S3-compatible)
- [ ] Real-time updates (WebSocket or SSE)
- [ ] Audit logging (immutable, queryable)
- [ ] API rate limiting and abuse prevention
- [ ] Database with proper backup strategy
- [ ] Monitoring, alerting, and incident response

### Payments & Integrations

- [ ] M-Pesa Daraja API integration (STK Push, B2C, C2B, transaction status)
- [ ] Bank integration (PesaLink, EFT, or direct bank APIs)
- [ ] Card payment processor (Stripe, Flutterwave, or Pesapal)
- [ ] Transaction reconciliation pipeline
- [ ] Exchange rate provider (for multi-currency)

### Legal & Compliance

- [ ] Kenya Data Protection Act (DPA) compliance
- [ ] Terms of Service — legal review by Kenyan counsel
- [ ] Privacy Policy — legal review
- [ ] KYC/AML policy if handling real funds
- [ ] Data processing agreements with third-party providers
- [ ] SOC 2 Type II or equivalent security certification
- [ ] Penetration test by an accredited firm
- [ ] Business registration and licensing in operating jurisdictions

### Security

- [ ] Production-grade Auth (OAuth 2.0 / OIDC, MFA)
- [ ] Encryption at rest (AES-256) and in transit (TLS 1.3)
- [ ] Secrets management (not in env files or source)
- [ ] WAF and DDoS protection
- [ ] CSP, HSTS, and other security headers
- [ ] Dependency scanning and SBOM
- [ ] Regular vulnerability assessments

## App Store Readiness Checklist

### Google Play Store

- [ ] Signed APK/AAB with production keystore
- [ ] App icon (512×512 PNG, adaptive icon)
- [ ] Feature graphic (1024×500 PNG)
- [ ] Screenshots (phone + 7-inch tablet, EN locale minimum)
- [ ] Short description (≤80 characters)
- [ ] Full description (≥250 characters recommended)
- [ ] Privacy Policy URL (must be publicly accessible)
- [ ] Content rating questionnaire
- [ ] Target API level ≥33 (Android 13)
- [ ] Data safety section (what data you collect and why)
- [ ] Testing track for initial review

### Apple App Store

- [ ] Apple Developer Program membership ($99/year)
- [ ] App icon (1024×1024 PNG, no alpha)
- [ ] Screenshots (6.7", 6.5", 5.5" display sizes)
- [ ] App preview video (optional but recommended)
- [ ] Privacy Policy URL
- [ ] App privacy labels (data types collected)
- [ ] Export compliance
- [ ] App Review Guidelines compliance
- [ ] TestFlight for beta testing

### Capacitor-Specific

- [ ] Splash screen assets for all device sizes
- [ ] Adaptive icon foreground/background layers (Android)
- [ ] Deep linking configuration (universal links / app links)
- [ ] Push notification certificates (APNs + FCM)
- [ ] App signing configured in capacitor.config.ts

## Architecture Notes

- **Swap mock for real API:** Implement the functions in `src/services/` against `src/api/axios.ts`. The Zustand stores call mock data directly — refactor them to call services instead.
- **Auth:** The auth store (`src/stores/authStore.ts`) is the integration point for real authentication. Replace `getCurrentUser()` with an API call.
- **Theme:** Light/dark/system persists via localStorage.
- **AI Assistant:** Uses canned responses. Wire to a real LLM endpoint via the AI service layer.

## Contributing

This is a demo application. For production contributions, ensure:
- TypeScript strict mode passes
- ESLint passes (`npm run lint`)
- Build succeeds (`npm run build`)
- New features use existing patterns (Zustand stores, React Hook Form + Zod schemas, Tailwind + lucide-react)
- Mock data generators are updated if new entities are introduced
