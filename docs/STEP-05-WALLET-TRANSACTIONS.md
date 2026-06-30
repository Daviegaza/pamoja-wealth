# Step 05 — Wallet & Transactions

**Status:** COMPLETED
**Started:** 2026-06-29

## Goal

Refactor `walletStore` and `transactionStore` to call backend API instead of mock data.

## Backend endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/wallet` | Get wallet |
| GET | `/wallet/history` | Balance history |
| GET | `/wallet/transactions` | Transaction list |
| POST | `/wallet/deposit` | Deposit funds |
| POST | `/wallet/withdraw` | Withdraw funds |
| POST | `/wallet/bank-accounts` | Add bank account |
| GET | `/wallet/bank-accounts` | List bank accounts |
| DELETE | `/wallet/bank-accounts/:id` | Remove bank account |
| POST | `/wallet/mpesa-accounts` | Add M-Pesa account |
| GET | `/wallet/mpesa-accounts` | List M-Pesa accounts |
| DELETE | `/wallet/mpesa-accounts/:id` | Remove M-Pesa account |

## Checklist

- [x] Refactor `walletStore.ts` — API calls for deposit, withdraw, fetch wallet
- [x] Refactor `transactionStore.ts` — fetch transactions from API
- [x] Remove cross-store mock transaction listeners
