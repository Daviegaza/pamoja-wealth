# Step 04 — Chamas & Members

**Status:** COMPLETED
**Started:** 2026-06-29

## Goal

Refactor `chamaStore.ts` to call the backend API instead of mock data. Create React Query hooks for chama data fetching.

## Backend endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/chamas` | List user's chamas |
| POST | `/chamas` | Create chama |
| GET | `/chamas/:id` | Get chama detail |
| PATCH | `/chamas/:id` | Update chama |
| DELETE | `/chamas/:id` | Delete chama |
| GET | `/chamas/:id/members` | List members |
| POST | `/chamas/:id/join` | Join via invite code |
| POST | `/chamas/:id/invite` | Invite member |
| POST | `/chamas/:id/approve-join/:userId` | Approve join request |
| POST | `/chamas/:id/remove-member/:userId` | Remove member |
| GET | `/chamas/:id/stats` | Chama stats |
| GET | `/chamas/:id/analytics` | Chama analytics |

## What changes

### `src/stores/chamaStore.ts`
- Remove `import { getMockDatabase } from "@/mock"`
- Add API calls through `chamasService`
- Add `isLoading`, `error` states
- Keep `activeChamaId` in local state (UI concern)
- `fetchChamas()` instead of static mock load
- `addChama()` calls `chamasService.create()`
- `updateChama()` calls `chamasService.update()`
- `getMembersByChamaId()` calls `chamasService.getMembers()`

### `src/hooks/useChamas.ts` (new)
- React Query wrapper: `useChamas`, `useChamaById`, `useMembers`
- Handles caching, background refetch, loading states

## Checklist

- [x] Refactor `chamaStore.ts`
- [ ] Create React Query hooks for chamas
- [ ] Update `CreateChamaForm.tsx` if needed
- [ ] Update `ChamaDetailPage.tsx` if needed
- [ ] Verify list/create/view cycle
