import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import test from "node:test";

async function render(path = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);
  return worker.fetch(new Request(new URL(path, "http://localhost"), { headers: { accept: "text/html" } }), {
    ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) },
  }, { waitUntil() {}, passThroughOnException() {} });
}

test("renders the afternoon board, contact channels, and section routes", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);
  const html = await response.text();
  assert.match(html, /An afternoon at the board/);
  assert.match(html, /room\/afternoon-studio\.webp/);
  assert.doesNotMatch(html, /war-room-silhouettes-hires\.png|war-room-environment-anime\.jpg|Systems war room/);
  assert.match(html, /Click once/);
  assert.match(html, /Double click/);
  assert.match(html, /Explore board/);
  assert.match(html, /TailCache articles/);
  assert.doesNotMatch(html, /Field Notes · WIP/);
  for (const id of ["profile-board", "work-board", "blog-board", "life-board", "contact-board"]) {
    assert.match(html, new RegExp(`id="${id}"`));
  }
  assert.match(html, /href="https:\/\/drive\.google\.com\/file\/d\/1GbsD52GUO9m29iac8QobkqERYq1ABE1d\/view\?usp=sharing"/);
  assert.match(html, /class="contact-form-loading"/);
  assert.doesNotMatch(html, /name="email"/);
  for (const id of ["contact-email-chit", "contact-linkedin-chit", "contact-github-chit"]) {
    assert.match(html, new RegExp(`id="${id}"`));
  }
});

test("keeps the board story and expandable case content grounded", async () => {
  const [hero, controller, work, workPolish, profile, room, photo] = await Promise.all([
    readFile(new URL("../components/HeroPreview.tsx", import.meta.url), "utf8"),
    readFile(new URL("../components/BoardScrollController.tsx", import.meta.url), "utf8"),
    readFile(new URL("../components/WorkCvBoardPortal.tsx", import.meta.url), "utf8"),
    readFile(new URL("../components/WorkCaseBoardPolish.tsx", import.meta.url), "utf8"),
    readFile(new URL("../data/profile-timeline.ts", import.meta.url), "utf8"),
    stat(new URL("../public/room/afternoon-studio.webp", import.meta.url)),
    stat(new URL("../public/profile/kv-ceremony-2014.webp", import.meta.url)),
  ]);
  assert.ok(room.size > 0 && room.size < 500_000);
  assert.ok(photo.size > 0 && photo.size < 250_000);
  assert.match(hero, /HeroChitExperience/);
  assert.match(controller, /boardGeometry/);
  assert.match(controller, /root\.dataset\.introComplete = "true"/);
  assert.match(work, /20× trade throughput/);
  assert.match(work, /35%/);
  assert.match(work, /Proprietary work/);
  assert.match(work, /EvidenceStage/);
  assert.doesNotMatch(work, /Academic CV account/);
  assert.match(work, /aria-expanded=\{open\}/);
  assert.doesNotMatch(work, /work-skills-section|work-recognition-section|work-principles-section|This portfolio/);
  assert.match(workPolish, /window\.addEventListener\("wheel", onWheel/);
  assert.match(workPolish, /window\.addEventListener\("touchmove", onTouchMove/);
  assert.doesNotMatch(workPolish, /onPointerDown|is-dragging/);
  assert.match(profile, /KV ceremony · Feb 2014/);
  assert.match(profile, /DST INSPIRE certificate/);
  assert.match(profile, /injectorist-readme-capture\.webp/);
  assert.match(profile, /boxy-homepage-capture\.webp/);
});

test("each linked TailCache milestone renders an article at its own URL", async () => {
  const home = await (await render()).text();
  const paths = new Set(Array.from(home.matchAll(/href="(\/field-notes\/tailcache\/[^"]+)"/g), match => match[1]));
  assert.equal(paths.size, 6);
  const archive = await (await render("/field-notes")).text();
  assert.match(archive, /<h1[^>]*>Field Notes<\/h1>/);
  const dates = [...archive.matchAll(/<time dateTime="([^"]+)"/gi)].map(match => match[1]);
  assert.deepEqual(dates, ["2026-06-05", "2026-08-15", "2026-09-05", "2026-09-19", "2026-11-10", "2026-11-23"]);
  for (const path of paths) {
    const response = await render(path);
    assert.equal(response.status, 200);
    const html = await response.text();
    assert.match(html, /<h1[^>]*>[^<]+<\/h1>/);
    assert.match(html, /From the lab notebook/);
    assert.match(html, /aria-label="Series navigation"/);
    assert.match(html, /href="\/field-notes"/);
    const schema = JSON.parse(html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)[1]);
    assert.equal(schema["@type"], "BlogPosting");
    assert.equal(schema.mainEntityOfPage, new URL(path, "https://enixes.vercel.app").href);
  }
  assert.equal((await render("/field-notes/tailcache/missing-note")).status, 404);
});
