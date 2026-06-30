# Step 03 — Auth Integration

**Status:** COMPLETED
**Started:** 2026-06-29

## Goal

Replace the mock-based auth store with real backend API calls. This is the most critical step — every other store depends on authentication working.

## Backend endpoints (all POST)

| Endpoint | Purpose |
|----------|---------|
| `/auth/register` | Create account → returns user + tokens |
| `/auth/login` | Sign in → returns user + tokens |
| `/auth/verify-otp` | Verify OTP after register/login |
| `/auth/resend-otp` | Resend OTP code |
| `/auth/forgot-password` | Request password reset email |
| `/auth/reset-password` | Reset password with token |
| `/auth/refresh` | Get new access token from refresh token |
| `/auth/logout` | Invalidate refresh token |
| `/auth/enable-2fa` | Generate 2FA secret + QR |
| `/auth/verify-2fa` | Verify 2FA setup |

## What changes

### `src/stores/authStore.ts`
- Remove `import { getCurrentUser } from "@/mock"`
- Add `import { authService } from "@/services/auth.service"`
- `login()` → calls `authService.login()`, saves tokens
- `register()` → calls `authService.register()`, saves tokens  
- `logout()` → calls `authService.logout()`, clears tokens
- Add `otpPending` state for OTP flow
- Add `isLoading` state
- Add `error` state
- Add `restoreSession()` to check stored token on app load

### `src/hooks/useAuth.ts`
- Expose new states: `isLoading`, `error`, `otpPending`
- Add `verifyOtp`, `resendOtp`, `forgotPassword` methods

### Token storage
- Access token → localStorage `pamoja_token`
- Refresh token → localStorage `pamoja_refresh`
- Axios interceptor (already done) handles refresh on 401

## Checklist

- [x] Rewrite `authStore.ts` with real API calls
- [x] Update `useAuth.ts` with new methods
- [ ] Update `LoginForm.tsx` for error handling
- [ ] Update `RegisterForm.tsx` for error handling
- [ ] Add OTP verification flow
- [ ] Test login/register/logout cycle
