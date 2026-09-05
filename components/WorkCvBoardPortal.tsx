"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { cv } from "@/data/cv";

const ion = cv.experiences[0];
const holisol = cv.experiences[1];

const ionEvidence = [
  ["ion-evidence-a", "20× throughput", "Java multithreading refactor for end-of-day trade processing."],
  ["ion-evidence-b", "50× workflows", "Off-heap persistent cache removed inter-process calls."],
  ["ion-evidence-c", "90% less downtime", "Automatic recovery for halted end-of-day processing."],
  ["ion-evidence-d", "30% faster triage", "Alazium parsed 100GB+ production logs into useful signals."],
  ["ion-evidence-e", "95% DB uplift", "Regression-led cleanup redesign improved peak database performance."],
  ["ion-evidence-f", "40% faster CI", "Parallel artifact cache also cut monthly AWS cost by 35%."],
] as const;

const styles = `
.work-cv-mounted > .story-board-index,
.work-cv-mounted > .story-board-header,
.work-cv-mounted > .story-board-grid,
.work-cv-mounted > .story-board-footnote { display:none!important; }
.work-cv-mounted { position:relative; overflow:hidden; padding:0!important; }
.work-cv-board { position:absolute; inset:0; overflow:hidden; color:#25231f; font-family:var(--sans); }
.work-cv-board:before { content:""; position:absolute; inset:0; pointer-events:none; background:linear-gradient(rgba(82,48,25,.035) 1px,transparent 1px),linear-gradient(90deg,rgba(82,48,25,.035) 1px,transparent 1px); background-size:26px 26px; mix-blend-mode:multiply; }
.work-cv-header { position:absolute; z-index:8; top:5.5%; left:5.5%; right:5.5%; display:flex; justify-content:space-between; gap:24px; align-items:flex-start; }
.work-cv-header>div { max-width:620px; }
.work-cv-header span,.work-cv-header p,.work-cv-legend { font-family:var(--mono); }
.work-cv-header>div>span { color:#9b302a; font-size:9px; font-weight:800; letter-spacing:.14em; text-transform:uppercase; }
.work-cv-header h2 { margin:6px 0 4px; font:700 clamp(30px,3.6vw,52px)/.95 var(--hand); transform:rotate(-1deg); }
.work-cv-header p { margin:0; max-width:590px; color:#5e5c57; font-size:9px; line-height:1.5; }
.work-cv-legend { display:flex; gap:9px; align-items:center; margin-top:8px; padding:8px 10px; background:#fff6cf; box-shadow:2px 3px 7px rgba(59,42,24,.12); transform:rotate(1.8deg); font-size:8px; text-transform:uppercase; letter-spacing:.06em; }
.work-cv-legend i { width:54px; height:3px; background:#a52d26; border-radius:999px; box-shadow:0 2px 0 rgba(68,28,20,.2); }
.work-cv-cork { position:absolute; inset:0; pointer-events:none; }
.work-cv-pencil { position:absolute; z-index:2; color:rgba(46,72,86,.75); font:700 12px/1 var(--hand); }
.pencil-one { left:56%; top:16%; transform:rotate(-3deg); }
.pencil-two { right:5%; bottom:8%; transform:rotate(4deg); color:rgba(151,47,40,.72); }
.work-cv-role { position:absolute; z-index:3; left:4%; right:3%; }
.work-cv-role-ion { top:21%; height:46%; }
.work-cv-role-holisol { left:6%; top:68.5%; right:20%; height:23%; }
.work-cv-thread { position:absolute; inset:0; width:100%; height:100%; overflow:visible; pointer-events:none; }
.work-cv-thread path { fill:none; vector-effect:non-scaling-stroke; stroke-linecap:round; }
.thread-shadow { stroke:rgba(66,25,19,.22); stroke-width:7; transform:translate(1px,3px); }
.thread-main,.thread-branch { stroke:#a82f27; stroke-width:4; }
.thread-branch { stroke-width:3; }
.work-company-chit,.work-evidence-chit { position:absolute; z-index:4; box-shadow:3px 6px 10px rgba(60,45,29,.18); transition:transform .18s ease,box-shadow .18s ease; }
.work-company-chit:hover,.work-evidence-chit:hover { z-index:9; box-shadow:5px 11px 18px rgba(60,45,29,.25); }
.work-company-chit { left:1.5%; width:18%; min-width:155px; padding:20px 18px 17px; background:#fffdf3; border:1px solid rgba(83,77,64,.12); transform:rotate(-2deg); }
.work-company-chit small,.work-evidence-chit small { display:block; color:#77726a; font:800 7px/1 var(--mono); letter-spacing:.1em; text-transform:uppercase; }
.work-company-chit h3 { margin:9px 0 4px; font:800 clamp(24px,2.25vw,36px)/.92 var(--hand); }
.work-company-chit strong { display:block; font:800 9px/1.3 var(--mono); }
.work-company-chit p { margin:7px 0 0; color:#64605a; font:8px/1.35 var(--mono); }
.work-company-chit em { display:inline-block; margin-top:11px; color:#9d302a; font:700 10px/1 var(--hand); transform:rotate(-2deg); }
.work-company-ion { top:25%; }
.work-company-holisol { top:16%; background:#edf7f5; transform:rotate(1.8deg); }
.work-evidence-chit { width:17%; min-width:145px; padding:15px 15px 13px; background:#fff6c7; transform:rotate(var(--r,-1deg)); }
.work-evidence-chit strong { display:block; margin-top:8px; color:#222; font:800 clamp(15px,1.6vw,23px)/1 var(--hand); }
.work-evidence-chit p { margin:8px 0 0; color:#4d4b46; font:8px/1.45 var(--mono); }
.ion-evidence-a { left:23%; top:2%; --r:-2.4deg; }
.ion-evidence-b { left:47%; top:0; --r:1.9deg; background:#dff0f5; }
.ion-evidence-c { left:59%; top:57%; --r:-1deg; background:#e4f0cf; }
.ion-evidence-d { left:72%; top:5%; --r:2.3deg; background:#f4d8dc; }
.ion-evidence-e { left:83%; top:58%; --r:-2deg; background:#fff1c6; }
.ion-evidence-f { right:0; top:26%; --r:1.2deg; background:#e8e4f4; }
.holisol-evidence-a { left:26%; top:1%; width:24%; --r:-1.8deg; background:#e8f3d9; }
.holisol-evidence-b { left:54%; top:42%; width:25%; --r:2.1deg; background:#fff0c3; }
.work-tenure-tag { position:absolute; z-index:6; padding:5px 9px; border:2px solid #a52d26; border-radius:50%; color:#9f2c25; background:rgba(255,253,244,.82); font:800 10px/1 var(--hand); transform:rotate(-8deg); }
.tenure-ion { left:18.5%; top:52%; }
.tenure-holisol { left:18%; top:48%; font-size:8px; }
.work-cv-footnote { position:absolute; z-index:6; right:5.5%; bottom:3.5%; margin:0; color:#6a645d; font:700 10px/1 var(--hand); transform:rotate(-2deg); }
@media (max-width:900px){
 .work-cv-header { top:4%; }
 .work-cv-legend { display:none; }
 .work-cv-role-ion { top:24%; height:43%; }
 .work-company-chit { width:21%; min-width:130px; padding:15px 12px; }
 .work-evidence-chit { min-width:118px; padding:11px 10px; }
 .work-evidence-chit p { font-size:7px; }
 .work-cv-thread-ion { transform:scaleX(.96); transform-origin:left; }
}
@media (max-width:760px){
 .work-cv-mounted { overflow-y:auto; }
 .work-cv-board { position:relative; min-height:1420px; overflow:hidden; }
 .work-cv-header { top:28px; left:24px; right:20px; }
 .work-cv-header h2 { font-size:38px; }
 .work-cv-header p { font-size:8px; }
 .work-cv-role { left:20px; right:20px; }
 .work-cv-role-ion { top:180px; height:830px; }
 .work-cv-role-holisol { top:1015px; height:320px; }
 .work-cv-thread { display:none; }
 .work-company-chit { position:relative; left:auto; top:auto; width:82%; min-width:0; margin:0 auto 22px 0; }
 .work-company-chit:after { content:""; position:absolute; left:70%; top:100%; width:4px; height:35px; background:#a82f27; transform:rotate(-4deg); }
 .work-evidence-chit { position:relative; left:auto!important; right:auto!important; top:auto!important; width:78%!important; min-width:0; margin:0 0 14px auto; }
 .work-evidence-chit:nth-of-type(even) { margin-left:8%; margin-right:auto; }
 .work-tenure-tag { display:none; }
 .work-cv-footnote { right:22px; bottom:22px; }
 .work-cv-pencil { display:none; }
}
@media (prefers-reduced-motion:no-preference){
 .scroll-board-red[style*="opacity: 1"] .work-cv-thread .thread-main { stroke-dasharray:100; stroke-dashoffset:100; animation:drawWorkThread 1.25s ease-out .2s forwards; }
 .scroll-board-red[style*="opacity: 1"] .work-cv-thread .thread-branch { stroke-dasharray:180; stroke-dashoffset:180; animation:drawBranch .8s ease-out .8s forwards; }
}
@keyframes drawWorkThread { to{stroke-dashoffset:0;} }
@keyframes drawBranch { to{stroke-dashoffset:0;} }
`;

export function WorkCvBoardPortal() {
  const [target, setTarget] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const title = document.getElementById("work-board-story-title");
    const surface = title?.closest<HTMLElement>(".story-board-surface") ?? null;
    if (!surface) return;
    surface.classList.add("work-cv-mounted");
    setTarget(surface);
    return () => surface.classList.remove("work-cv-mounted");
  }, []);

  const board = target ? createPortal(
    <div className="work-cv-board" aria-label="Professional experience timeline">
      <header className="work-cv-header">
        <div>
          <span>Case board / 01 · CV / Experience map</span>
          <h2>Systems / Work</h2>
          <p>Companies are the anchor chits. The work fans out around them. Thread length roughly tracks time spent there.</p>
        </div>
        <aside className="work-cv-legend"><i aria-hidden="true" /><span>longer thread = longer tenure</span></aside>
      </header>

      <div className="work-cv-cork" aria-hidden="true">
        <span className="work-cv-pencil pencil-one">production → evidence → outcome</span>
        <span className="work-cv-pencil pencil-two">follow the red thread</span>
      </div>

      <section className="work-cv-role work-cv-role-ion" aria-label={`${ion.company}, ${ion.dates}`}>
        <svg className="work-cv-thread work-cv-thread-ion" viewBox="0 0 1200 330" preserveAspectRatio="none" aria-hidden="true">
          <path className="thread-shadow" d="M208 157 C344 126 420 177 544 148 S792 109 936 142 S1062 160 1152 132" />
          <path className="thread-main" pathLength="100" d="M208 157 C344 126 420 177 544 148 S792 109 936 142 S1062 160 1152 132" />
          <path className="thread-branch" d="M380 151 C370 116 356 88 327 62" />
          <path className="thread-branch" d="M532 150 C550 101 590 78 628 65" />
          <path className="thread-branch" d="M696 129 C721 172 740 201 769 226" />
          <path className="thread-branch" d="M851 126 C881 91 908 73 945 65" />
          <path className="thread-branch" d="M1000 151 C1017 188 1038 210 1075 227" />
        </svg>
        <article className="work-company-chit work-company-ion"><span className="board-pin" aria-hidden="true" /><small>2020 → now · 6+ years</small><h3>{ion.company}</h3><strong>{ion.role}</strong><p>{ion.location}</p><em>Primary systems chapter</em></article>
        <span className="work-tenure-tag tenure-ion">6+ yrs</span>
        {ionEvidence.map(([className, metric, copy], index) => (
          <article className={`work-evidence-chit ${className}`} key={metric}><span className={`board-pin ${index % 3 === 1 ? "pin-blue" : index % 3 === 2 ? "pin-yellow" : ""}`} aria-hidden="true" /><small>Evidence / 0{index + 1}</small><strong>{metric}</strong><p>{copy}</p></article>
        ))}
      </section>

      <section className="work-cv-role work-cv-role-holisol" aria-label={`${holisol.company}, ${holisol.dates}`}>
        <svg className="work-cv-thread work-cv-thread-holisol" viewBox="0 0 1200 170" preserveAspectRatio="none" aria-hidden="true">
          <path className="thread-shadow" d="M205 79 C282 51 336 90 399 72 C444 59 475 65 512 76" />
          <path className="thread-main" pathLength="100" d="M205 79 C282 51 336 90 399 72 C444 59 475 65 512 76" />
          <path className="thread-branch" d="M360 77 C375 39 408 28 437 24" />
          <path className="thread-branch" d="M493 72 C525 105 557 118 596 126" />
        </svg>
        <article className="work-company-chit work-company-holisol"><span className="board-pin pin-blue" aria-hidden="true" /><small>Jun → Sep 2019 · 4 months</small><h3>{holisol.company}</h3><strong>{holisol.role}</strong><p>{holisol.location}</p></article>
        <span className="work-tenure-tag tenure-holisol">4 mo</span>
        <article className="work-evidence-chit holisol-evidence-a"><span className="board-pin pin-green" aria-hidden="true" /><small>Evidence / 01</small><strong>Delivery optimisation</strong><p>Built a Django Daily Run Sheet Generator from requirements through deployment.</p></article>
        <article className="work-evidence-chit holisol-evidence-b"><span className="board-pin pin-yellow" aria-hidden="true" /><small>Evidence / 02</small><strong>Shipped, not shelved</strong><p>Presented to the founder and secured production deployment approval.</p></article>
      </section>

      <p className="work-cv-footnote">Aug 2020 → now is intentionally the longest line on the board.</p>
    </div>,
    target,
  ) : null;

  return <><style>{styles}</style>{board}</>;
}
