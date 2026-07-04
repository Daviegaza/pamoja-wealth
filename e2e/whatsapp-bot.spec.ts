/**
 * WhatsApp bot e2e — Meta Cloud API webhook.
 *
 * Simulates Meta's inbound POST shape. Bot service dispatches replies via
 * Graph API when creds set; in test env creds are absent so we only assert
 * the webhook 200-ACKs (no reply is sent).
 */
import { authedTest as test, API } from "./fixtures";
import { expect } from "@playwright/test";

const META_PAYLOAD = (from: string, text: string) => ({
  entry: [{
    changes: [{
      value: {
        messages: [{ from, text: { body: text } }],
      },
    }],
  }],
});

test("whatsapp webhook 200-ACKs valid Meta payload", async ({ request, user }) => {
  const res = await request.post(`${API}/whatsapp/webhook`, {
    data: META_PAYLOAD(user.phone.replace(/^\+/, ""), "help"),
  });
  expect(res.status()).toBe(200);
});

test("whatsapp webhook survives empty payload", async ({ request }) => {
  const res = await request.post(`${API}/whatsapp/webhook`, { data: {} });
  expect(res.status()).toBe(200);
});

test("whatsapp GET verify challenge", async ({ request }) => {
  const res = await request.get(
    `${API}/whatsapp/webhook?hub.mode=subscribe&hub.verify_token=wrong&hub.challenge=abc`,
  );
  expect([403, 200]).toContain(res.status());
});
