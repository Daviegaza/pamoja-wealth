#!/usr/bin/env node
/**
 * End-to-end smoke test for Pamoja Wealth.
 *
 * Verifies backend + frontend + CORS + auth + socket.io in one pass:
 *   1. Frontend dev server is serving on 5174
 *   2. Backend /health returns ok
 *   3. CORS preflight from http://localhost:5174 is accepted
 *   4. POST /auth/register creates a user
 *   5. POST /auth/login returns an access token
 *   6. GET /users/me with the token returns the caller
 *   7. socket.io handshake completes with the token
 *   8. join:chama room emit + chat:send roundtrip receives chat:message
 *
 * Run:  node e2e/smoke.mjs
 * Exit: 0 on success, 1 on any failure.
 */
import { io } from "socket.io-client";

const FRONTEND = process.env.FRONTEND_URL || "http://localhost:5174";
const BACKEND = process.env.BACKEND_URL || "http://localhost:3000";
const API = `${BACKEND}/api/v1`;
const ORIGIN = FRONTEND;

const stamp = Date.now();
const USER = {
  email: `smoke+${stamp}@pamoja.test`,
  phone: `+2547${String(stamp).slice(-8)}`,
  fullName: "Smoke Test",
  password: "SmokeTest123",
};

let passed = 0;
let failed = 0;

function log(step, ok, detail = "") {
  const tag = ok ? "PASS" : "FAIL";
  console.log(`[${tag}] ${step}${detail ? " — " + detail : ""}`);
  ok ? passed++ : failed++;
}

async function step(name, fn) {
  try {
    const detail = await fn();
    log(name, true, detail);
    return true;
  } catch (err) {
    log(name, false, err.message);
    return false;
  }
}

async function main() {
  console.log(`\nPamoja Wealth E2E smoke — ${new Date().toISOString()}`);
  console.log(`Frontend: ${FRONTEND}`);
  console.log(`Backend:  ${BACKEND}\n`);

  await step("frontend reachable", async () => {
    const r = await fetch(FRONTEND);
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    const body = await r.text();
    if (!body.includes("<!") && !body.includes("<html")) {
      throw new Error("no HTML in response");
    }
    return `HTTP ${r.status}`;
  });

  await step("backend /health ok", async () => {
    const r = await fetch(`${API}/health`);
    const json = await r.json();
    if (!json?.data || json.data.status === "error") {
      throw new Error(JSON.stringify(json));
    }
    return `db=${json.data.db} redis=${json.data.redis}`;
  });

  await step("CORS preflight from frontend origin", async () => {
    const r = await fetch(`${API}/auth/login`, {
      method: "OPTIONS",
      headers: {
        Origin: ORIGIN,
        "Access-Control-Request-Method": "POST",
        "Access-Control-Request-Headers": "content-type",
      },
    });
    if (r.status !== 204 && r.status !== 200) {
      throw new Error(`preflight HTTP ${r.status}`);
    }
    const allow = r.headers.get("access-control-allow-origin");
    if (allow !== ORIGIN) {
      throw new Error(`ACAO="${allow}" expected "${ORIGIN}"`);
    }
    return `ACAO=${allow}`;
  });

  let accessToken = null;

  await step("register new user", async () => {
    const r = await fetch(`${API}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Origin: ORIGIN },
      body: JSON.stringify(USER),
    });
    const json = await r.json();
    if (!r.ok) throw new Error(`HTTP ${r.status}: ${JSON.stringify(json)}`);
    if (!json?.data?.accessToken) throw new Error("no accessToken in response");
    accessToken = json.data.accessToken;
    return `user=${json.data.user?.email}`;
  });

  await step("login returns token", async () => {
    const r = await fetch(`${API}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Origin: ORIGIN },
      body: JSON.stringify({ email: USER.email, password: USER.password }),
    });
    const json = await r.json();
    if (!r.ok) throw new Error(`HTTP ${r.status}: ${JSON.stringify(json)}`);
    if (!json?.data?.accessToken) throw new Error("no accessToken");
    accessToken = json.data.accessToken;
    return "token issued";
  });

  await step("GET /users/me with token", async () => {
    if (!accessToken) throw new Error("no token from login step");
    const r = await fetch(`${API}/users/me`, {
      headers: { Authorization: `Bearer ${accessToken}`, Origin: ORIGIN },
    });
    const json = await r.json();
    if (!r.ok) throw new Error(`HTTP ${r.status}: ${JSON.stringify(json)}`);
    const email = json?.data?.email ?? json?.data?.user?.email;
    if (email !== USER.email) throw new Error(`email mismatch: ${email}`);
    return `me=${email}`;
  });

  await step("socket.io handshake with token", async () => {
    if (!accessToken) throw new Error("no token from login step");
    const socket = io(BACKEND, {
      path: "/ws",
      transports: ["websocket"],
      auth: { token: accessToken },
      reconnection: false,
      timeout: 5000,
    });
    await new Promise((resolve, reject) => {
      const t = setTimeout(() => reject(new Error("connect timeout 5s")), 5000);
      socket.on("connect", () => {
        clearTimeout(t);
        resolve();
      });
      socket.on("connect_error", (e) => {
        clearTimeout(t);
        reject(new Error(`connect_error: ${e.message}`));
      });
    });
    const id = socket.id;
    socket.disconnect();
    return `socket.id=${id}`;
  });

  await step("join:chama + chat roundtrip", async () => {
    if (!accessToken) throw new Error("no token from login step");

    // Create a chama to get a valid id.
    const createRes = await fetch(`${API}/chamas`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
        Origin: ORIGIN,
      },
      body: JSON.stringify({
        name: `Smoke Chama ${stamp}`,
        category: "savings",
        privacy: "private",
        monthlyContribution: 0,
      }),
    });
    const createJson = await createRes.json();
    if (!createRes.ok) {
      throw new Error(`POST /chamas HTTP ${createRes.status}: ${JSON.stringify(createJson)}`);
    }
    const chamaId = createJson?.data?.id ?? createJson?.data?.chama?.id;
    if (!chamaId) throw new Error(`no chama id: ${JSON.stringify(createJson)}`);

    const socket = io(BACKEND, {
      path: "/ws",
      transports: ["websocket"],
      auth: { token: accessToken },
      reconnection: false,
      timeout: 5000,
    });

    try {
      await new Promise((resolve, reject) => {
        const t = setTimeout(() => reject(new Error("connect timeout 5s")), 5000);
        socket.on("connect", () => { clearTimeout(t); resolve(); });
        socket.on("connect_error", (e) => {
          clearTimeout(t);
          reject(new Error(`connect_error: ${e.message}`));
        });
      });

      const content = `smoke-${stamp}`;
      const received = new Promise((resolve, reject) => {
        const t = setTimeout(() => reject(new Error("chat:message timeout 3s")), 3000);
        socket.on("chat:message", (payload) => {
          if (payload?.chamaId === chamaId && payload?.message?.content === content) {
            clearTimeout(t);
            resolve(payload);
          }
        });
      });

      socket.emit("join:chama", chamaId);
      // Give the server a tick to register the room membership before broadcasting.
      await new Promise((r) => setTimeout(r, 100));
      socket.emit("chat:send", { chamaId, content });

      const payload = await received;
      return `chamaId=${chamaId} echoed content="${payload.message.content}"`;
    } finally {
      socket.disconnect();
    }
  });

  console.log(`\n${passed} passed, ${failed} failed.`);
  process.exit(failed === 0 ? 0 : 1);
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
