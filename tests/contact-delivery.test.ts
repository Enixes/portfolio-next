import assert from "node:assert/strict";
import test from "node:test";
import { handleContactPost, isContactAvailable } from "../app/api/contact/contact-delivery";

const config = { apiKey: "re_mock", fromEmail: "hello@verified.example", toEmail: "asu@example.com" };
const valid = {
  name: "Ada Lovelace",
  email: "ada@example.com",
  topic: "Systems",
  message: "I would like to discuss the recovery path for a production service.",
  website: "",
};

function request(data: unknown) {
  return new Request("http://localhost/api/contact", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

test("configuration gates delivery", async () => {
  assert.equal(isContactAvailable({ toEmail: config.toEmail }), false);
  let calls = 0;
  const response = await handleContactPost(request(valid), { toEmail: config.toEmail }, async () => {
    calls++;
    return Response.json({ id: "never" });
  });
  assert.equal(response.status, 503);
  assert.equal(calls, 0);
});

test("valid field note reaches Resend as plain text with reply-to", async () => {
  let captured: { url?: string; options?: RequestInit } = {};
  const response = await handleContactPost(request({ ...valid, name: "Ada <script>" }), config, async (url, options) => {
    captured = { url: String(url), options };
    return Response.json({ id: "email_mock" });
  });
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { ok: true });
  assert.equal(captured.url, "https://api.resend.com/emails");
  const payload = JSON.parse(String(captured.options?.body));
  assert.deepEqual(payload.to, [config.toEmail]);
  assert.equal(payload.from, config.fromEmail);
  assert.equal(payload.reply_to, valid.email);
  assert.match(payload.text, /Ada <script>/);
  assert.equal(payload.html, undefined);
  assert.equal(payload.subject, "Portfolio field note · Systems");
});

test("invalid inputs, oversized notes, and honeypot never claim delivery", async () => {
  let calls = 0;
  const transport = async () => { calls++; return Response.json({ id: "never" }); };
  const invalid = [
    { ...valid, email: "bad-address" },
    { ...valid, topic: "<script>" },
    { ...valid, message: "short" },
    { ...valid, message: "x".repeat(4001) },
    { ...valid, website: "autofilled" },
  ];
  for (const data of invalid) {
    const response = await handleContactPost(request(data), config, transport);
    assert.ok(response.status >= 400);
    assert.notDeepEqual(await response.json(), { ok: true });
  }
  assert.equal(calls, 0);
});

test("provider rejection and network failure remain errors", async () => {
  const rejected = await handleContactPost(request(valid), config, async () => Response.json({ message: "fail" }, { status: 422 }));
  assert.equal(rejected.status, 502);
  const noReceipt = await handleContactPost(request(valid), config, async () => Response.json({}));
  assert.equal(noReceipt.status, 502);
  const failed = await handleContactPost(request(valid), config, async () => { throw new Error("offline"); });
  assert.equal(failed.status, 502);
});
