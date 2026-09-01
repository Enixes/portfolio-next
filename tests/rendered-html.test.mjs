import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server-renders the war-room intro and portfolio board", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>Asu Singh — Senior Software Engineer/);
  assert.match(html, /class="war-room-intro" aria-hidden="true"/);
  assert.match(html, /Systems war room/);
  assert.match(html, /Tracing the evidence/);
  assert.match(html, /src="\/war-room-silhouettes\.png"/);
  assert.match(html, /fetchPriority="high"/);
  assert.match(html, /class="evidence-board"/);
  assert.match(html, /Senior Software Engineer/);
  assert.match(html, /I make complex systems/);
});

test("keeps the intro lightweight and motion-safe", async () => {
  const [component, css, asset] = await Promise.all([
    readFile(new URL("../components/HeroPreview.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    stat(new URL("../public/war-room-silhouettes.png", import.meta.url)),
  ]);

  assert.ok(asset.size > 0 && asset.size < 850_000);
  assert.doesNotMatch(component, /^\s*["']use client["']/m);
  assert.doesNotMatch(component, /framer-motion|@react-three|<canvas/i);
  assert.match(css, /@keyframes board-camera-in/);
  assert.match(css, /@keyframes war-room-people-exit/);
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
  assert.match(css, /\.war-room-intro\s*\{\s*display:\s*none;/);
  assert.doesNotMatch(css, /backdrop-filter|filter:\s*blur|perspective:/i);
});
