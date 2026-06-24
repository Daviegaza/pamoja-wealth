# Pamoja Wealth — Building Wealth Together

Enterprise-grade frontend for a chama (savings/investment group) management platform, targeting East African markets.

## Stack

Vite + React 19 + TypeScript + Tailwind CSS + React Router DOM + Zustand + TanStack Query + Axios + React Hook Form + Zod + Framer Motion + Recharts + Lucide React + clsx + Sonner.

## Getting started

```bash
npm install
npm run dev
```

The app runs entirely on a deterministic, seeded mock data layer (`src/mock`) — no backend is required to explore every page:
1,000 users, 200 chamas, 1,500 memberships, 10,000 transactions, 1,000 loans, 500 investments, 500 meetings, 500 votes, 1,000 notifications, and 90 days of wallet history.

Login on the `/login` screen is pre-filled with a demo account — just click "Sign in".

## Project structure

```
src/
  app/            
  api/            axios instance
  assets/         static assets, animations
  components/     ui, forms, charts, cards, layout, navigation, dialogs, tables, common
  constants/      nav config
  config/         env config
  contexts/       (reserved for future context providers)
  data/           (reserved for static reference data)
  hooks/          22 custom hooks
  layouts/        DashboardLayout, AuthLayout, PublicLayout
  lib/            cn() and formatting utilities
  mock/           seeded mock data generators (the "backend")
  pages/          all 29 routed pages
  providers/      Theme, Query, Toast providers
  routes/         react-router configuration with lazy loading
  schemas/        Zod validation schemas
  services/       mock service layer (swap for real API calls)
  stores/         11 Zustand stores
  styles/         Tailwind globals
  theme/          (reserved for design tokens)
  types/          shared TypeScript types — fully typed, no `any`
  utils/          (reserved)
  validators/     (reserved — validation logic lives alongside schemas)
```

## Scripts

- `npm run dev` — start the dev server
- `npm run build` — type-check and build for production
- `npm run preview` — preview the production build
- `npm run lint` — run ESLint

## Notes

- Theme (light/dark/system) persists automatically via `localStorage`.
- Auth, settings, and theme state persist across reloads via Zustand's `persist` middleware.
- Every chart in the spec (contribution growth, investment growth, cash flow, loan distribution, member growth, revenue trends, portfolio allocation, wallet history) is implemented with Recharts.
- The AI Assistant and AI Insight widgets use canned, deterministic responses — wire them up to a real LLM endpoint when ready.
- Swap the mock layer for a real backend by implementing the functions in `src/services` against `src/api/axios.ts`.
