# Step 02 — Environment & Config

**Status:** COMPLETED
**Started:** 2026-06-29

## Goal

Set up frontend environment variables to connect to the backend. Create `.env` files for development.

## What to do

- [x] Create `.env` with `VITE_API_BASE_URL=http://localhost:3000/api/v1`
- [x] Create `.env.example` for other devs
- [x] Update `vite-env.d.ts` with `ImportMetaEnv` type (done in Step 01)
- [x] Axios base URL already reads from `VITE_API_BASE_URL`

## Checklist

- [x] `.env` created
- [x] `.env.example` created
- [x] `VITE_API_BASE_URL` type declared
- [x] Axios points to `VITE_API_BASE_URL`
