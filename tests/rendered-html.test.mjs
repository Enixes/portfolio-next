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
  assert.match(html, /war-room-environment-anime\.jpg/);
  assert.match(html, /war-room-silhouettes-hires\.png/);
  assert.match(html, /fetchPriority="high"/);
  assert.match(html, /class="evidence-board"/);
  assert.match(html, /Senior Software Engineer/);
  assert.match(html, /I make complex systems/);
  assert.match(html, /00 \/ Profile/);
  assert.match(html, /01 \/ Systems \+ Work/);
  assert.match(html, /02 \/ Field Notes/);
  assert.match(html, /03 \/ Life/);
  assert.match(html, /id="profile-board"/);
  assert.match(html, /id="work-board"/);
  assert.match(html, /id="blog-board"/);
  assert.match(html, /id="life-board"/);
  assert.match(html, /id="contact-board"/);
  assert.match(html, /Bring me the hard problem/);
  assert.match(html, /Open channel/);
  assert.match(html, /class="zone-mark zone-mark-profile"/);
  assert.match(html, /class="zone-mark zone-mark-work"/);
  assert.match(html, /class="zone-mark zone-mark-blog"/);
  assert.match(html, /class="zone-mark zone-mark-life"/);
  assert.match(html, /data-board-story="true"/);
  assert.match(html, /data-board-track="true"/);
  assert.match(html, /Scroll through the boards/);
  assert.match(html, /Zoom out\. Follow the next board/);
  assert.match(html, /Idempotency keys/);
  assert.match(html, /Load shedding/);
  assert.match(html, /Queue fan-out with three workers/);
  assert.match(html, /Circuit breaker states moving from closed to open/);
  assert.doesNotMatch(html, /evidence-thread/);
  assert.doesNotMatch(html, /class="preview-actions"/);
});

test("keeps the intro and scroll story lightweight, explorable, and motion-safe", async () => {
  const [component, controller, workPortal, workPolish, css, peopleAsset, roomAsset] = await Promise.all([
    readFile(new URL("../components/HeroPreview.tsx", import.meta.url), "utf8"),
    readFile(new URL("../components/BoardScrollController.tsx", import.meta.url), "utf8"),
    readFile(new URL("../components/WorkCvBoardPortal.tsx", import.meta.url), "utf8"),
    readFile(new URL("../components/WorkCaseBoardPolish.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    stat(new URL("../public/war-room-silhouettes-hires.png", import.meta.url)),
    stat(new URL("../public/war-room-environment-anime.jpg", import.meta.url)),
  ]);

  assert.ok(peopleAsset.size > 0 && peopleAsset.size < 1_100_000);
  assert.ok(roomAsset.size > 0 && roomAsset.size < 350_000);
  assert.doesNotMatch(component, /^\s*["']use client["']/m);
  assert.doesNotMatch(component, /framer-motion|@react-three|<canvas/i);
  assert.match(controller, /requestAnimationFrame/);
  assert.match(controller, /addEventListener\("scroll", handleScroll, \{ passive: true \}\)/);
  assert.match(controller, /SECTION_STOP_LOCAL_PROGRESS/);
  assert.match(controller, /window\.history\.pushState/);
  assert.match(controller, /window\.history\.replaceState/);
  assert.match(controller, /panels\[options\.index\]\?\.focus\(\{ preventScroll: true \}\)/);
  assert.doesNotMatch(controller, /setInterval|framer-motion|@react-three|<canvas/i);
  assert.match(workPortal, /\.scroll-board-red \.story-board-frame \{[\s\S]*?height:100%!important;[\s\S]*?overflow:hidden!important;/);
  assert.match(workPortal, /Drag or scroll · 0%/);
  assert.match(workPortal, /board\.scrollHeight - board\.clientHeight/);
  assert.match(workPolish, /window\.addEventListener\("wheel", onWheel, \{ passive: false, capture: true \}\)/);
  assert.match(workPolish, /window\.addEventListener\("pointermove", onPointerMove/);
  assert.match(workPolish, /window\.addEventListener\("touchmove", onTouchMove/);
  assert.match(workPolish, /if \(Math\.abs\(consumed\) > 0\.1\) \{[\s\S]*?surface\.scrollTop = next;[\s\S]*?return;/);
  assert.match(css, /@keyframes board-camera-in/);
  assert.match(css, /@keyframes room-camera-in/);
  assert.match(css, /@keyframes war-room-people-exit/);
  assert.match(css, /@keyframes thesis-marker-sweep/);
  assert.match(css, /@keyframes zone-marker-cycle/);
  assert.match(css, /\.zone-mark-life\s*\{/);
  assert.match(css, /@media \(max-width: 760px\)/);
  assert.match(css, /\.evidence-board\s*\{\s*min-height:\s*1600px;/);
  assert.doesNotMatch(css, /linear-gradient\(var\(--grid\)/);
  assert.match(css, /\.board-zone span\s*\{[\s\S]*?background:\s*transparent;/);
  assert.doesNotMatch(component, /const pins|evidence-thread/);
  assert.match(css, /\.board-zone:hover::after/);
  assert.match(css, /\.board-zone::before[\s\S]*?right:\s*-7%[\s\S]*?bottom:\s*7%/);
  assert.doesNotMatch(css, /border-right-color:\s*transparent/);
  assert.match(css, /\.board-scroll-story\s*\{[\s\S]*?height:\s*650svh/);
  assert.match(css, /\.board-scroll-track\s*\{/);
  assert.match(css, /\.scroll-board-panel\s*\{/);
  assert.match(css, /scroll-snap-type:\s*x mandatory/);
  assert.match(css, /\.board-scrawl\s*\{/);
  assert.match(css, /\.board-diagram\s*\{/);
  assert.match(css, /\.diagram-fanout\s*\{[\s\S]*?display:\s*block;/);
  assert.match(css, /stroke-dasharray:\s*38 1\.4 61 1 27 1\.8/);
  assert.match(css, /\.queue-depth-note\s*\{[\s\S]*?display:\s*grid;/);
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
  assert.match(css, /\.war-room-intro\s*\{\s*display:\s*none;/);
  assert.match(css, /\.zone-mark path\s*\{\s*animation:\s*none !important;/);
  assert.doesNotMatch(css, /backdrop-filter|filter:\s*blur|perspective:/i);
});
