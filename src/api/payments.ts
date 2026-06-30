/**
 * Payments API — amount-only contribute / donate flows.
 *
 * Real mode: POSTs to the backend with an Idempotency-Key header. The server
 * triggers M-Pesa STK Push and emits `payment:initiated|completed|failed`
 * socket events to the user's room. The client subscribes via `lib/socket`.
 *
 * Mock mode (`VITE_USE_MOCKS=true`): we resolve synchronously with a fake
 * `stk_sent` response, then 4s later emit a `payment:completed` event onto
 * the mock socket so the modal flow demos end-to-end with no backend.
 */
import { api } from "@/api/axios";
import { __mockEmit } from "@/lib/socket";

const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === "true";

// ===== ULID (lightweight, no extra dep) =====
const ULID_ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
function ulid(): string {
  const time = Date.now();
  let timePart = "";
  let t = time;
  for (let i = 0; i < 10; i++) {
    timePart = ULID_ALPHABET[t % 32] + timePart;
    t = Math.floor(t / 32);
  }
  let randomPart = "";
  for (let i = 0; i < 16; i++) {
    randomPart += ULID_ALPHABET[Math.floor(Math.random() * 32)];
  }
  return timePart + randomPart;
}

// ===== Public types =====
export interface ContributeRequest {
  groupId: string;
  amount: number;
  /**
   * Optional MSISDN override. When set, STK Push is sent to this number
   * instead of the user's default MpesaAccount. Useful when paying from a
   * spouse's / parent's phone. Validated client-side as a Kenyan number.
   * Omit for Mode 3 (manual paybill) — no STK is issued at all.
   */
  phone?: string;
}

export interface DonateNowRequest {
  groupId: string;
  amount: number;
  phone?: string;
  name?: string;
  message?: string;
  isAnonymous?: boolean;
}

export interface ContributeResponse {
  transactionId: string;
  checkoutRequestId: string;
  status: "stk_sent";
  expiresAt: string;
}

// ===== Mock event payloads =====
function mockTransactionId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function mockReceipt(): string {
  // M-Pesa receipt format: 10 uppercase alphanumeric
  let r = "";
  const a = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  for (let i = 0; i < 10; i++) r += a[Math.floor(Math.random() * a.length)];
  return r;
}

function scheduleMockSuccess(
  transactionId: string,
  groupId: string,
  amount: number,
): void {
  // Simulate the STK push round-trip: initiated immediately, completed 4s later.
  setTimeout(() => {
    __mockEmit("payment:initiated", { transactionId, groupId, amount });
  }, 400);

  setTimeout(() => {
    __mockEmit("payment:completed", {
      transactionId,
      groupId,
      amount,
      mpesaReceipt: mockReceipt(),
      completedAt: new Date().toISOString(),
      newBalance: undefined, // wallet store reconciles its own balance
    });
  }, 4000);
}

// ===== Real / mock dispatcher =====
export async function contribute(req: ContributeRequest): Promise<ContributeResponse> {
  if (USE_MOCKS) {
    const transactionId = mockTransactionId("txn");
    const checkoutRequestId = `ws_CO_${Date.now()}`;
    const expiresAt = new Date(Date.now() + 90_000).toISOString();
    scheduleMockSuccess(transactionId, req.groupId, req.amount);
    return { transactionId, checkoutRequestId, status: "stk_sent", expiresAt };
  }
  const { data } = await api.post<ContributeResponse>(
    `/groups/${req.groupId}/contribute`,
    { amount: req.amount, phone: req.phone },
    { headers: { "Idempotency-Key": ulid() } },
  );
  return data;
}

export async function donateNow(req: DonateNowRequest): Promise<ContributeResponse> {
  if (USE_MOCKS) {
    const transactionId = mockTransactionId("don");
    const checkoutRequestId = `ws_CO_${Date.now()}`;
    const expiresAt = new Date(Date.now() + 90_000).toISOString();
    scheduleMockSuccess(transactionId, req.groupId, req.amount);
    return { transactionId, checkoutRequestId, status: "stk_sent", expiresAt };
  }
  const { data } = await api.post<ContributeResponse>(
    `/groups/${req.groupId}/donate-now`,
    {
      amount: req.amount,
      phone: req.phone,
      name: req.name,
      message: req.message,
      isAnonymous: req.isAnonymous,
    },
    { headers: { "Idempotency-Key": ulid() } },
  );
  return data;
}
