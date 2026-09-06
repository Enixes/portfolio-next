"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { cv } from "@/data/cv";

const styles = `
.profile-live-mounted > .story-board-index,
.profile-live-mounted > .story-board-header,
.profile-live-mounted > .story-board-grid,
.profile-live-mounted > .story-board-footnote { display:none!important; }
.profile-live-mounted { position:relative; overflow:hidden; padding:0!important; }
.profile-live-board { position:absolute; inset:0; overflow:hidden; color:#27231f; font-family:var(--sans); }
.profile-live-board:before { content:""; position:absolute; inset:0; pointer-events:none; background:radial-gradient(circle at 18% 18%,rgba(255,255,255,.55),transparent 24%),linear-gradient(rgba(64,58,47,.035) 1px,transparent 1px),linear-gradient(90deg,rgba(64,58,47,.035) 1px,transparent 1px); background-size:auto,26px 26px,26px 26px; mix-blend-mode:multiply; }
.profile-live-board:after { content:""; position:absolute; z-index:0; left:49%; top:8%; width:1px; height:84%; background:linear-gradient(transparent,rgba(109,89,59,.2) 12% 88%,transparent); transform:rotate(1deg); pointer-events:none; }
.profile-live-header { position:absolute; z-index:12; top:5.2%; left:5.2%; width:min(44%,620px); }
.profile-live-header>span { color:#654f91; font:800 8px/1 var(--mono); letter-spacing:.15em; text-transform:uppercase; }
.profile-live-header h2 { margin:7px 0 6px; font:800 clamp(34px,4vw,58px)/.9 var(--hand); letter-spacing:-.035em; transform:rotate(-1deg); }
.profile-live-header p { margin:0; max-width:540px; color:#5b5750; font:9px/1.55 var(--mono); }
.profile-live-photo { position:absolute; z-index:9; top:5.5%; right:6%; width:10.5%; min-width:100px; margin:0; padding:7px 7px 24px; background:#fffdf5; box-shadow:4px 7px 15px rgba(55,43,27,.18); transform:rotate(3.2deg); }
.profile-live-photo img { display:block; width:100%; height:auto; aspect-ratio:1; object-fit:cover; filter:saturate(.92) contrast(1.03); }
.profile-live-photo figcaption { position:absolute; right:6px; bottom:7px; left:6px; overflow:hidden; color:#4f4a43; font:800 7px/1 var(--mono); text-align:center; letter-spacing:.08em; text-transform:uppercase; white-space:nowrap; }
.profile-now-card,.profile-project-card,.profile-mini-chit,.profile-signal,.profile-status-stamp { position:absolute; z-index:5; box-shadow:3px 6px 12px rgba(65,48,29,.17); transform:rotate(var(--r,0deg)); }
.profile-now-card { left:5.5%; top:29%; width:27%; min-height:39%; padding:23px 24px 20px; background:#fff5c8; --r:-1.7deg; }
.profile-now-card:after { content:""; position:absolute; right:10%; top:-8px; width:47%; height:18px; background:rgba(228,210,156,.68); transform:rotate(2deg); box-shadow:0 1px 1px rgba(80,58,27,.08); }
.profile-now-card small,.profile-project-card small,.profile-mini-chit small { display:block; color:#716c63; font:800 7px/1 var(--mono); letter-spacing:.12em; text-transform:uppercase; }
.profile-now-card h3 { margin:11px 0 9px; font:800 clamp(27px,2.6vw,40px)/.92 var(--hand); }
.profile-now-card>p { margin:0; color:#4c4942; font:9px/1.55 var(--mono); }
.profile-now-list { display:grid; gap:8px; margin:16px 0 0; padding:0; list-style:none; }
.profile-now-list li { position:relative; padding-left:15px; color:#302f2c; font:800 8px/1.4 var(--mono); }
.profile-now-list li:before { content:"↳"; position:absolute; left:0; color:#9d302a; font-family:var(--hand); }
.profile-project-card { width:22%; min-width:185px; padding:17px 18px 15px; background:#fffdf5; border:1px solid rgba(86,72,52,.08); }
.profile-project-card h3 { margin:9px 0 5px; font:800 clamp(20px,2vw,30px)/.95 var(--hand); }
.profile-project-card p { margin:0; color:#555149; font:8px/1.48 var(--mono); }
.profile-project-card .profile-stack { display:block; margin-top:11px; color:#645f56; font:800 6px/1.45 var(--mono); letter-spacing:.05em; text-transform:uppercase; }
.profile-project-card .profile-state { position:absolute; top:12px; right:12px; padding:4px 6px; border:1px solid currentColor; border-radius:999px; color:#9e312b; background:rgba(255,255,255,.68); font:800 6px/1 var(--mono); letter-spacing:.08em; text-transform:uppercase; transform:rotate(3deg); }
.profile-project-tailcache { left:39%; top:23%; width:25%; background:#e5f1f4; --r:1.4deg; }
.profile-project-agent { right:7%; top:31%; width:23%; background:#e8f0d5; --r:-1.6deg; }
.profile-project-game { left:47%; top:62%; width:23%; background:#f2dfe8; --r:1.8deg; }
.profile-mini-chit { padding:12px 14px; background:#fffdf6; }
.profile-mini-chit strong { display:block; margin-top:6px; font:800 17px/1 var(--hand); }
.profile-mini-chit span { display:block; margin-top:5px; color:#645f58; font:7px/1.35 var(--mono); }
.profile-brief-chit { left:7%; bottom:7%; width:24%; background:#eee8f7; --r:1.5deg; }
.profile-offclock-chit { right:6%; bottom:7%; width:18%; background:#fff0c8; --r:-2.1deg; }
.profile-signal { z-index:7; left:35%; bottom:7%; display:flex; align-items:center; gap:13px; width:35%; padding:11px 15px; background:#fffdf7; --r:-.5deg; }
.profile-signal:before { content:""; width:8px; height:8px; flex:0 0 auto; border-radius:50%; background:#79bd5d; box-shadow:0 0 0 4px rgba(121,189,93,.13); animation:profilePulse 1.8s ease-in-out infinite; }
.profile-signal strong { font:800 8px/1 var(--mono); letter-spacing:.09em; text-transform:uppercase; }
.profile-signal span { color:#686159; font:7px/1.35 var(--mono); }
.profile-status-stamp { z-index:10; left:31%; top:18%; padding:7px 10px; border:2px solid #9c312a; border-radius:50%; color:#9c312a; background:rgba(255,250,233,.8); box-shadow:none; font:800 12px/1 var(--hand); --r:-10deg; }
.profile-pencil { position:absolute; z-index:4; color:rgba(48,91,110,.74); font:800 12px/1 var(--hand); pointer-events:none; }
.profile-pencil-one { left:35%; top:53%; transform:rotate(-4deg); }
.profile-pencil-two { right:29%; top:18%; color:rgba(149,47,40,.72); transform:rotate(5deg); }
.profile-pencil-three { right:26%; bottom:20%; transform:rotate(-3deg); }
.profile-thread { position:absolute; z-index:2; inset:0; width:100%; height:100%; overflow:visible; pointer-events:none; }
.profile-thread path { fill:none; stroke-linecap:round; vector-effect:non-scaling-stroke; }
.profile-thread-shadow { stroke:rgba(70,28,20,.2); stroke-width:7; transform:translate(1px,3px); }
.profile-thread-main { stroke:#a62f28; stroke-width:4; }
.profile-thread-branch { stroke:#a62f28; stroke-width:3; }
.profile-live-footnote { position:absolute; z-index:8; right:5%; bottom:2.5%; margin:0; color:#70685e; font:800 9px/1 var(--hand); transform:rotate(-2deg); }
.profile-live-board .board-pin { top:-8px; }
.profile-live-board .profile-project-card:hover,.profile-live-board .profile-mini-chit:hover,.profile-live-board .profile-now-card:hover { z-index:16; box-shadow:6px 12px 22px rgba(63,46,28,.23); }
@keyframes profilePulse { 0%,100%{transform:scale(.9);opacity:.72} 50%{transform:scale(1.18);opacity:1} }
@media (max-width:980px){
 .profile-live-header { width:50%; }
 .profile-now-card { width:30%; }
 .profile-project-tailcache { left:40%; width:27%; }
 .profile-project-agent { right:4%; width:25%; }
 .profile-project-game { left:43%; width:27%; }
 .profile-signal { left:33%; width:38%; }
 .profile-pencil { display:none; }
}
@media (max-width:760px){
 .profile-live-mounted { overflow-y:auto; }
 .profile-live-board { position:relative; min-height:1520px; overflow:hidden; }
 .profile-live-board:after,.profile-thread { display:none; }
 .profile-live-header { top:28px; left:22px; width:78%; }
 .profile-live-header h2 { font-size:40px; }
 .profile-live-header p { font-size:8px; }
 .profile-live-photo { top:34px; right:18px; width:84px; min-width:0; padding:5px 5px 20px; }
 .profile-status-stamp { top:145px; left:22px; }
 .profile-now-card,.profile-project-card,.profile-mini-chit,.profile-signal { position:relative; top:auto!important; right:auto!important; bottom:auto!important; left:auto!important; width:auto!important; min-width:0; margin-left:20px; margin-right:20px; }
 .profile-now-card { margin-top:205px; padding:20px; min-height:0; }
 .profile-project-card { margin-top:18px; padding:16px; }
 .profile-project-tailcache { margin-left:42px; }
 .profile-project-agent { margin-right:38px; }
 .profile-project-game { margin-left:30px; }
 .profile-signal { margin-top:18px; }
 .profile-brief-chit { margin-top:18px; margin-right:56px; }
 .profile-offclock-chit { margin-top:18px; margin-left:54px; }
 .profile-live-footnote { right:20px; bottom:18px; }
}
@media (prefers-reduced-motion:reduce){ .profile-signal:before { animation:none; } }
`;

export function ProfileLiveBoardPortal() {
  const [target, setTarget] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const title = document.getElementById("profile-board-story-title");
    const surface = title?.closest<HTMLElement>(".story-board-surface") ?? null;
    if (!surface) return;
    surface.classList.add("profile-live-mounted");
    setTarget(surface);
    return () => surface.classList.remove("profile-live-mounted");
  }, []);

  const board = target ? createPortal(
    <div className="profile-live-board" aria-label="Asu Singh live profile and current projects">
      <header className="profile-live-header">
        <span>Case board / 00 · live profile</span>
        <h2>Asu, in motion.</h2>
        <p>Senior software engineer in Noida. I like systems that are fast, observable, recoverable — and weird side projects that force me to learn something new.</p>
      </header>

      <figure className="profile-live-photo profile-animate">
        <span className="board-pin" aria-hidden="true" />
        <Image src="https://avatars.githubusercontent.com/u/20127633?s=240&v=4" alt="Asu Singh" width={240} height={240} sizes="120px" referrerPolicy="no-referrer" />
        <figcaption>{cv.name} / system owner</figcaption>
      </figure>

      <span className="profile-status-stamp profile-animate">6+ yrs shipping</span>

      <svg className="profile-thread" viewBox="0 0 1400 820" preserveAspectRatio="none" aria-hidden="true">
        <path className="profile-thread-shadow" d="M405 358 C520 314 589 300 687 308 C804 319 882 364 1010 351 C1118 340 1187 364 1284 420" />
        <path className="profile-thread-main" pathLength="100" d="M405 358 C520 314 589 300 687 308 C804 319 882 364 1010 351 C1118 340 1187 364 1284 420" />
        <path className="profile-thread-branch" pathLength="100" d="M648 307 C650 261 680 225 729 190" />
        <path className="profile-thread-branch" pathLength="100" d="M995 352 C1026 296 1063 270 1110 255" />
        <path className="profile-thread-branch" pathLength="100" d="M830 329 C824 448 844 524 900 592" />
      </svg>

      <article className="profile-now-card profile-animate">
        <span className="board-pin pin-blue" aria-hidden="true" />
        <small>Now / Sep 2026</small>
        <h3>What I’m up to</h3>
        <p>Still shipping production trading systems by day. Outside that loop, I’m deliberately stretching into benchmarking, open source, AI agents, and simulation-heavy game architecture.</p>
        <ul className="profile-now-list">
          <li>Senior SDE @ ION Trading</li>
          <li>TailCache benchmarks + Chronicle Map upstream work</li>
          <li>Production-grade agentic AI experiments</li>
          <li>System design, performance, and deterministic simulation</li>
        </ul>
      </article>

      <article className="profile-project-card profile-project-tailcache profile-animate">
        <span className="board-pin pin-blue" aria-hidden="true" />
        <small>Project / active research build</small>
        <span className="profile-state">building</span>
        <h3>TailCache</h3>
        <p>Measuring tail-latency trade-offs between on-heap Caffeine and off-heap Chronicle Map under deterministic workloads — with the benchmark rig designed to make negative results publishable too.</p>
        <span className="profile-stack">Java 21 · JMH · Caffeine · Chronicle Map · issue #533</span>
      </article>

      <article className="profile-project-card profile-project-agent profile-animate">
        <span className="board-pin pin-green" aria-hidden="true" />
        <small>Project / deployed</small>
        <span className="profile-state">running</span>
        <h3>24/7 Agent</h3>
        <p>A personal agentic assistant built to survive constrained hardware, asynchronous messages, persistent state, failures, and actual day-to-day use — not just a demo loop.</p>
        <span className="profile-stack">AI agents · NVIDIA models · Docker · Prometheus · Grafana</span>
      </article>

      <article className="profile-project-card profile-project-game profile-animate">
        <span className="board-pin" aria-hidden="true" />
        <small>Project / side quest</small>
        <span className="profile-state">prototyping</span>
        <h3>Maze Tank</h3>
        <p>A multiplayer tank prototype built around deterministic fixed-step simulation, strict presentation/simulation separation, and readable combat inside detailed environments.</p>
        <span className="profile-stack">Godot · fixed timestep · deterministic simulation · networking</span>
      </article>

      <article className="profile-mini-chit profile-brief-chit profile-animate">
        <span className="board-pin pin-yellow" aria-hidden="true" />
        <small>Brief / operating principle</small>
        <strong>Make the failure path boring.</strong>
        <span>Measure first. Isolate state. Design recovery before the pager goes off.</span>
      </article>

      <div className="profile-signal profile-animate">
        <strong>Current signal</strong>
        <span>distributed systems → performance → agentic AI → whatever looks difficult next</span>
      </div>

      <article className="profile-mini-chit profile-offclock-chit profile-animate">
        <span className="board-pin pin-green" aria-hidden="true" />
        <small>Off-clock</small>
        <strong>Football + side quests</strong>
        <span>Travel, reading, games, and building things that probably did not need to exist.</span>
      </article>

      <span className="profile-pencil profile-pencil-one">benchmark the claim →</span>
      <span className="profile-pencil profile-pencil-two">live systems &gt; slideware</span>
      <span className="profile-pencil profile-pencil-three">keep one weird project alive</span>
      <p className="profile-live-footnote">This board changes when the work changes.</p>
    </div>,
    target,
  ) : null;

  return <><style dangerouslySetInnerHTML={{ __html: styles }} />{board}</>;
}
