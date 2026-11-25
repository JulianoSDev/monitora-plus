const { test } = require("node:test");
const assert = require("node:assert/strict");
const { createClient, ApiError } = require("../api.js");

function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json" } });
}

test("cookie credentials, in-memory CSRF, logout and 204", async () => {
  const calls = [];
  const responses = [json({ csrf_token: "token-one", user: { id: 1 } }), json({}), new Response(null, { status: 204 }), json({}), json({})];
  const client = createClient({ baseUrl: "https://api.example/api/", fetchImpl: async (url, options) => {
    calls.push({ url, ...options });
    return responses.shift();
  } });
  await client.request("/auth/login", { method: "POST", body: { password: "private" } });
  await client.request("/slots", { method: "post", body: { capacity: 2 } });
  assert.deepEqual(await client.request("/slots/1", { method: "DELETE" }), {});
  await client.request("/auth/logout", { method: "POST" });
  await client.request("/slots", { method: "POST", body: {} });
  assert.equal(calls[0].url, "https://api.example/api/auth/login");
  assert.ok(calls.every(call => call.credentials === "include"));
  assert.equal(calls[1].headers["X-CSRF-TOKEN"], "token-one");
  assert.equal(calls[1].headers["Content-Type"], "application/json");
  assert.equal(calls[4].headers["X-CSRF-TOKEN"], undefined);
});

test("restore CSRF from /me; invalidate only authenticated 401", async () => {
  let unauthorized = 0;
  let result = json({ csrf_token: "restored" });
  let headers;
  const client = createClient({ baseUrl: "/api", onUnauthorized: () => unauthorized++,
    fetchImpl: async (_, options) => { headers = options.headers; return result; } });
  await client.request("/auth/me");
  result = json({ error: "bad credentials", fields: { password: "incorrect" } }, 401);
  await assert.rejects(client.request("/auth/login", { method: "POST" }), error => error.status === 401 && error.fields.password === "incorrect");
  result = json({ error: "invalid google" }, 401);
  await assert.rejects(client.request("/auth/google", { method: "POST" }), error => error.status === 401);
  assert.equal(unauthorized, 0);
  result = json({});
  await client.request("/slots/1", { method: "DELETE" });
  assert.equal(headers["X-CSRF-TOKEN"], "restored");
  result = json({ error: "expired" }, 401);
  await assert.rejects(client.request("/slots"), ApiError);
  assert.equal(unauthorized, 1);
  result = json({});
  await client.request("/slots/1", { method: "DELETE" });
  assert.equal(headers["X-CSRF-TOKEN"], undefined);
});

test("network failure never retries a mutation or changes API host", async () => {
  let attempts = 0;
  const client = createClient({ baseUrl: "https://one.example/api", fetchImpl: async () => {
    attempts++;
    throw new TypeError("offline");
  } });
  await assert.rejects(client.request("/schedules", { method: "POST", body: { slot_id: 1 } }), error =>
    error.status === 0 && /Atualize os dados/.test(error.message));
  assert.equal(attempts, 1);
});

test("timeout aborts fetch and returns an actionable error", async () => {
  const client = createClient({ baseUrl: "/api", timeoutMs: 5, fetchImpl: (_, options) => new Promise((_, reject) => {
    options.signal.addEventListener("abort", () => reject(new DOMException("Timeout", "AbortError")));
  }) });
  await assert.rejects(client.request("/offerings"), error => error.status === 0 && /conectar/.test(error.message));
});

test("late /me response cannot restore a cleared session", async () => {
  let resolve;
  const headers = [];
  const client = createClient({ baseUrl: "/api", fetchImpl: (_, options) => {
    headers.push(options.headers);
    if (headers.length === 1) return new Promise(done => { resolve = done; });
    return Promise.resolve(json({}));
  } });
  const pending = client.request("/auth/me");
  client.clearSession();
  resolve(json({ csrf_token: "stale-token" }));
  await pending;
  await client.request("/slots/1", { method: "DELETE" });
  assert.equal(headers[1]["X-CSRF-TOKEN"], undefined);
});
