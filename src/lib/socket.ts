/**
 * Socket.io client singleton.
 *
 * Connects on first import to the backend (baseURL with `/v1` suffix stripped)
 * carrying the Bearer token from localStorage. Exposes a thin React hook,
 * `useSocketEvent`, plus chama room join/leave helpers.
 *
 * Mock mode (`VITE_USE_MOCKS=true`) returns a fake socket implementing the
 * minimal Socket surface (on/off/emit) so the rest of the app — and the
 * mocked payment flow — keeps working without a backend.
 */
import { useEffect } from "react";
import { io, type Socket } from "socket.io-client";

const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === "true";
const BASE_RAW = import.meta.env.VITE_API_BASE_URL ?? "https://api.pamojawealth.app/v1";
const SOCKET_URL = BASE_RAW.replace(/\/v\d+\/?$/, "");

const IDLE_TIMEOUT_MS = 10 * 60 * 1000; // 10 min

// ===== Mock socket — minimal EventEmitter shim =====
type Handler = (payload: unknown) => void;

class MockSocket {
  private handlers = new Map<string, Set<Handler>>();
  readonly connected = true;
  readonly id = "mock-socket";
  on(event: string, handler: Handler): this {
    if (!this.handlers.has(event)) this.handlers.set(event, new Set());
    this.handlers.get(event)!.add(handler);
    return this;
  }
  off(event: string, handler?: Handler): this {
    if (!handler) {
      this.handlers.delete(event);
    } else {
      this.handlers.get(event)?.delete(handler);
    }
    return this;
  }
  emit(event: string, payload?: unknown): this {
    // Local broadcast — simulates server-side echo for demo flows.
    const set = this.handlers.get(event);
    set?.forEach((h) => h(payload));
    return this;
  }
  connect(): this { return this; }
  disconnect(): this { return this; }
}

// ===== Real socket construction =====
function buildRealSocket(): Socket {
  const token = typeof window !== "undefined" ? localStorage.getItem("pamoja_token") : null;
  const s = io(SOCKET_URL, {
    auth: { token },
    transports: ["websocket", "polling"],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 15000,
    reconnectionAttempts: Infinity,
    autoConnect: true,
    timeout: 12000,
  });
  return s;
}

const realSocket = USE_MOCKS ? null : buildRealSocket();
const mockSocket = USE_MOCKS ? new MockSocket() : null;

// Public socket — typed as Socket for ergonomics. In mock mode it's our shim
// duck-typed to the same surface (on/off/emit/connect/disconnect).
export const socket = (realSocket ?? (mockSocket as unknown as Socket));

// ===== Mock helper for the payments layer to broadcast simulated events =====
export function __mockEmit(event: string, payload: unknown): void {
  if (!USE_MOCKS) return;
  mockSocket?.emit(event, payload);
}

// ===== Idle disconnect for hidden tabs =====
if (typeof document !== "undefined" && !USE_MOCKS) {
  let idleTimer: number | undefined;
  const onVisibilityChange = () => {
    if (document.hidden) {
      idleTimer = window.setTimeout(() => {
        if (document.hidden && socket.connected) socket.disconnect();
      }, IDLE_TIMEOUT_MS);
    } else {
      if (idleTimer) window.clearTimeout(idleTimer);
      if (!socket.connected) socket.connect();
    }
  };
  document.addEventListener("visibilitychange", onVisibilityChange);
}

// ===== Room helpers =====
export function joinChama(chamaId: string): void {
  socket.emit("join:chama", { chamaId });
}

export function leaveChama(chamaId: string): void {
  socket.emit("leave:chama", { chamaId });
}

// ===== React hook =====
export function useSocketEvent<T = unknown>(
  event: string,
  handler: (payload: T) => void
): void {
  useEffect(() => {
    const wrapped = (payload: unknown) => handler(payload as T);
    socket.on(event, wrapped);
    return () => {
      socket.off(event, wrapped);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event]);
}
