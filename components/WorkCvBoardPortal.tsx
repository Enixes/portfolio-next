"use client";

import type { CSSProperties } from "react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import gsap from "gsap";
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

const skillGroups = [
  {
    title: "Backend / Systems",
    note: "where I spend most of my time",
    ink: "#8f302a",
    wash: "#f5d56a",
    skills: ["Java", "Spring Boot", "Microservices", "REST APIs", "Multithreading", "Distributed systems", "Caching", "Performance tuning", "Observability"],
  },
  {
    title: "Data / Messaging",
    note: "state moves; failures happen",
    ink: "#315d72",
    wash: "#9bd0dc",
    skills: ["PostgreSQL", "Oracle SQL", "Kafka", "IBM MQ", "Event-driven systems", "Async workflows"],
  },
  {
    title: "Languages / Platform",
    note: "tools, not identities",
    ink: "#5e6f38",
    wash: "#c4d994",
    skills: ["C# / .NET", "Python", "C++", "TypeScript", "AWS", "Linux / Unix", "Docker", "CI/CD"],
  },
  {
    title: "Current rabbit holes",
    note: "keep one difficult thing alive",
    ink: "#70518d",
    wash: "#d7c3e7",
    skills: ["Agentic AI", "Benchmarking", "Chronicle Map", "JMH", "Deterministic simulation", "Networking", "Godot"],
  },
] as const;

const projects = [
  {
    title: "TailCache",
    status: "active research build",
    summary: "Tail-latency trade-offs between on-heap Caffeine and off-heap Chronicle Map, measured with deterministic JMH workloads.",
    stack: "Java 21 · JMH · Caffeine · Chronicle Map",
    href: "https://github.com/Enixes/TailCache",
    tape: "blue",
  },
  {
    title: "Hybrid Social Group Optimization",
    status: "published / open source",
    summary: "Meta-heuristic optimisation work later applied to chest X-ray classification and published in Springer Cognitive Computation.",
    stack: "Python · ML · optimisation · computer vision",
    href: "https://github.com/Enixes/Hybrid-Social-Group-Optimization-algorithm",
    tape: "yellow",
  },
  {
    title: "Illegal Mining Detector",
    status: "hackathon build",
    summary: "A computer-vision project that placed Top 10 at the inaugural HackBMU hackathon.",
    stack: "Computer vision · detection · rapid prototyping",
    href: "https://github.com/Enixes/Illegal-Mining-Detector",
    tape: "green",
  },
  {
    title: "This portfolio",
    status: "living system",
    summary: "The cork-board portfolio itself: zoom choreography, evidence-driven storytelling, native scrolling and lots of marker ink.",
    stack: "Next.js · React · GSAP · Vercel",
    href: "https://github.com/Enixes/portfolio-next",
    tape: "red",
  },
] as const;

const recognitions = [
  "Top 0.1% performer at ION Trading",
  "IONathon XTP 1.0 winner for off-heap persistent caching",
  "99.9 percentile in JEE Advanced",
  "Top 10 · inaugural HackBMU Hackathon",
  "Inspire program fellow for academic performance",
] as const;

const principles = [
  ["make the failure path boring", "Recovery should feel designed, not improvised."],
  ["latency is a feature", "Average is useful. Tails are where users live."],
  ["measure before optimizing", "A benchmark beats a strong opinion."],
  ["observability first", "If I cannot explain the failure, I do not own the system yet."],
  ["boring reliability > clever fragility", "Complexity needs to pay rent."],
] as const;

const styles = `
.work-cv-mounted > .story-board-index,
.work-cv-mounted > .story-board-header,
.work-cv-mounted > .story-board-grid,
.work-cv-mounted > .story-board-footnote { display:none!important; }
.work-cv-mounted {
  position:relative;
  overflow-y:auto!important;
  overflow-x:hidden!important;
  padding:0!important;
  overscroll-behavior:contain;
  scrollbar-width:thin;
  scrollbar-color:#9b302a rgba(99,78,53,.08);
}
.work-cv-mounted::-webkit-scrollbar { width:8px; }
.work-cv-mounted::-webkit-scrollbar-track { background:rgba(99,78,53,.08); }
.work-cv-mounted::-webkit-scrollbar-thumb { background:#9b302a; border-radius:999px; }
.work-cv-board {
  position:relative;
  min-height:100%;
  overflow:hidden;
  padding:clamp(30px,4vw,54px) clamp(24px,4.8vw,66px) 90px;
  color:#25231f;
  font-family:var(--sans);
  background:
    radial-gradient(circle at 16% 8%,rgba(255,255,255,.42),transparent 22%),
    linear-gradient(rgba(82,48,25,.035) 1px,transparent 1px),
    linear-gradient(90deg,rgba(82,48,25,.035) 1px,transparent 1px);
  background-size:auto,26px 26px,26px 26px;
}
.work-cv-board:after {
  content:"";
  position:absolute;
  z-index:0;
  top:760px;
  bottom:0;
  left:50%;
  width:1px;
  background:linear-gradient(transparent,rgba(93,70,43,.14) 4% 94%,transparent);
  transform:rotate(.35deg);
  pointer-events:none;
}
.work-cv-header { position:relative; z-index:12; display:flex; justify-content:space-between; gap:28px; align-items:flex-start; }
.work-cv-header>div { max-width:680px; }
.work-cv-header span,.work-cv-header p,.work-cv-legend { font-family:var(--mono); }
.work-cv-header>div>span { color:#9b302a; font-size:9px; font-weight:800; letter-spacing:.14em; text-transform:uppercase; }
.work-cv-header h2 { margin:7px 0 5px; font:800 clamp(34px,4vw,58px)/.92 var(--marker,var(--hand)); transform:rotate(-1deg); }
.work-cv-header p { margin:0; max-width:620px; color:#5e5c57; font-size:9px; line-height:1.55; }
.work-cv-legend { display:flex; gap:9px; align-items:center; margin-top:8px; padding:8px 10px; background:#fff6cf; box-shadow:2px 3px 7px rgba(59,42,24,.12); transform:rotate(1.8deg); font-size:8px; text-transform:uppercase; letter-spacing:.06em; }
.work-cv-legend i { width:54px; height:3px; background:#a52d26; border-radius:999px; box-shadow:0 2px 0 rgba(68,28,20,.2); }
.work-scroll-cue { position:sticky; z-index:18; top:10px; width:max-content; margin:14px 0 -28px auto; padding:7px 10px; color:#7f2f2a; background:rgba(255,248,218,.9); border:1px dashed rgba(127,47,42,.42); font:800 8px/1 var(--mono); letter-spacing:.08em; text-transform:uppercase; transform:rotate(1deg); backdrop-filter:blur(5px); }
.work-scroll-cue b { font:900 14px/1 var(--marker,var(--hand)); }

.work-experience-stage { position:relative; z-index:3; height:720px; margin-top:34px; }
.work-cv-pencil { position:absolute; z-index:2; color:rgba(46,72,86,.72); font:800 12px/1 var(--marker,var(--hand)); }
.pencil-one { left:51%; top:2%; transform:rotate(-3deg); }
.pencil-two { right:2%; bottom:1%; transform:rotate(4deg); color:rgba(151,47,40,.72); }
.work-cv-role { position:absolute; z-index:3; left:0; right:0; }
.work-cv-role-ion { top:60px; height:405px; }
.work-cv-role-holisol { top:486px; right:18%; height:205px; }
.work-cv-thread { position:absolute; inset:0; width:100%; height:100%; overflow:visible; pointer-events:none; }
.work-cv-thread path { fill:none; vector-effect:non-scaling-stroke; stroke-linecap:round; }
.thread-shadow { stroke:rgba(66,25,19,.22); stroke-width:7; transform:translate(1px,3px); }
.thread-main,.thread-branch { stroke:#a82f27; stroke-width:4; }
.thread-branch { stroke-width:3; }
.work-company-chit,.work-evidence-chit { position:absolute; z-index:4; box-shadow:3px 6px 10px rgba(60,45,29,.18); transition:transform .18s ease,box-shadow .18s ease; }
.work-company-chit:hover,.work-evidence-chit:hover { z-index:9; box-shadow:5px 11px 18px rgba(60,45,29,.25); }
.work-company-chit { left:1.5%; width:18%; min-width:155px; padding:20px 18px 17px; background:#fffdf3; border:1px solid rgba(83,77,64,.12); transform:rotate(-2deg); }
.work-company-chit small,.work-evidence-chit small { display:block; color:#77726a; font:800 7px/1 var(--mono); letter-spacing:.1em; text-transform:uppercase; }
.work-company-chit h3 { margin:9px 0 4px; font:800 clamp(24px,2.25vw,36px)/.92 var(--marker,var(--hand)); }
.work-company-chit strong { display:block; font:800 9px/1.3 var(--mono); }
.work-company-chit p { margin:7px 0 0; color:#64605a; font:8px/1.35 var(--mono); }
.work-company-chit em { display:inline-block; margin-top:11px; color:#9d302a; font:800 10px/1 var(--marker,var(--hand)); transform:rotate(-2deg); }
.work-company-ion { top:25%; }
.work-company-holisol { top:16%; background:#edf7f5; transform:rotate(1.8deg); }
.work-evidence-chit { width:17%; min-width:145px; padding:15px 15px 13px; background:#fff6c7; transform:rotate(var(--r,-1deg)); }
.work-evidence-chit strong { display:block; margin-top:8px; color:#222; font:800 clamp(15px,1.6vw,23px)/1 var(--marker,var(--hand)); }
.work-evidence-chit p { margin:8px 0 0; color:#4d4b46; font:8px/1.45 var(--mono); }
.ion-evidence-a { left:23%; top:2%; --r:-2.4deg; }
.ion-evidence-b { left:47%; top:0; --r:1.9deg; background:#dff0f5; }
.ion-evidence-c { left:59%; top:57%; --r:-1deg; background:#e4f0cf; }
.ion-evidence-d { left:72%; top:5%; --r:2.3deg; background:#f4d8dc; }
.ion-evidence-e { left:83%; top:58%; --r:-2deg; background:#fff1c6; }
.ion-evidence-f { right:0; top:26%; --r:1.2deg; background:#e8e4f4; }
.holisol-evidence-a { left:26%; top:1%; width:24%; --r:-1.8deg; background:#e8f3d9; }
.holisol-evidence-b { left:54%; top:42%; width:25%; --r:2.1deg; background:#fff0c3; }
.work-tenure-tag { position:absolute; z-index:6; padding:5px 9px; border:2px solid #a52d26; border-radius:50%; color:#9f2c25; background:rgba(255,253,244,.82); font:800 10px/1 var(--marker,var(--hand)); transform:rotate(-8deg); }
.tenure-ion { left:18.5%; top:52%; }
.tenure-holisol { left:18%; top:48%; font-size:8px; }

.work-section { position:relative; z-index:3; margin-top:clamp(54px,8vw,100px); scroll-margin-top:24px; }
.work-section-heading { position:relative; max-width:700px; margin-bottom:28px; }
.work-section-kicker { display:block; color:#8f302a; font:800 9px/1 var(--mono); letter-spacing:.13em; text-transform:uppercase; }
.work-section-heading h3 { position:relative; width:max-content; max-width:100%; margin:9px 0 8px; font:900 clamp(28px,3.1vw,45px)/.94 var(--marker,var(--hand)); transform:rotate(-.7deg); }
.work-section-heading h3:after { content:""; position:absolute; left:2%; right:-5%; bottom:-7px; height:5px; border-radius:50%; background:#a3322b; transform:scaleX(0) rotate(-1deg); transform-origin:left; }
.work-section.is-visible .work-section-heading h3:after { animation:workHeadingDraw .72s cubic-bezier(.2,.75,.2,1) .12s forwards; }
.work-section-heading p { margin:0; color:#5d5952; font:9px/1.55 var(--mono); }

.skill-wall { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:22px; }
.skill-cluster { position:relative; min-height:215px; padding:24px 22px 21px; background:rgba(255,253,244,.88); border:1px solid rgba(77,64,47,.1); box-shadow:4px 7px 14px rgba(57,43,27,.14); transform:rotate(var(--cluster-r,-.5deg)); overflow:hidden; }
.skill-cluster:nth-child(2) { --cluster-r:.7deg; }
.skill-cluster:nth-child(3) { --cluster-r:.4deg; }
.skill-cluster:nth-child(4) { --cluster-r:-.8deg; }
.skill-cluster:before { content:""; position:absolute; inset:0; opacity:.16; background:radial-gradient(circle at 88% 12%,var(--skill-wash),transparent 30%); pointer-events:none; }
.skill-cluster-header { position:relative; z-index:2; display:flex; justify-content:space-between; align-items:flex-end; gap:12px; margin-bottom:18px; }
.skill-cluster h4 { position:relative; margin:0; color:var(--skill-ink); font:900 clamp(19px,1.8vw,28px)/1 var(--marker,var(--hand)); }
.skill-cluster h4:after { content:""; position:absolute; left:0; bottom:-5px; width:100%; border-top:3px solid currentColor; border-radius:50%; transform:scaleX(0) rotate(1deg); transform-origin:left; }
.work-section.is-visible .skill-cluster h4:after { animation:skillTitleDraw .62s ease-out .24s forwards; }
.skill-cluster-header small { max-width:155px; color:#726b61; font:700 7px/1.3 var(--mono); text-align:right; }
.skill-chips { position:relative; z-index:2; display:flex; flex-wrap:wrap; gap:9px 8px; }
.skill-chip { --i:0; position:relative; isolation:isolate; display:inline-flex; align-items:center; min-height:29px; padding:7px 10px 6px; color:#332f2a; font:900 10px/1 var(--marker,var(--hand)); transform:rotate(var(--chip-r,-.7deg)); opacity:0; }
.skill-chip:nth-child(3n+2) { --chip-r:.8deg; }
.skill-chip:nth-child(3n) { --chip-r:-.2deg; }
.skill-chip:before { content:""; position:absolute; z-index:-1; inset:0; border:2px solid var(--skill-ink); border-radius:47% 53% 46% 54% / 54% 44% 56% 46%; clip-path:inset(0 100% 0 0); }
.skill-chip:after { content:""; position:absolute; z-index:-2; inset:3px 2px; border-radius:6px 9px 5px 8px; background:var(--skill-wash); transform:scaleX(0) rotate(-1deg); transform-origin:left; opacity:.62; }
.work-section.is-visible .skill-chip { animation:skillChipLand .38s ease-out calc(.2s + var(--i)*.045s) forwards; }
.work-section.is-visible .skill-chip:before { animation:skillOutlineDraw .58s cubic-bezier(.2,.75,.2,1) calc(.24s + var(--i)*.045s) forwards; }
.work-section.is-visible .skill-chip:after { animation:skillColorIn .52s cubic-bezier(.2,.75,.2,1) calc(.62s + var(--i)*.045s) forwards; }
.skill-chip:hover { z-index:4; translate:0 -3px; rotate:1deg; }
.skill-doodle { position:absolute; right:18px; bottom:12px; color:var(--skill-ink); font:900 12px/1 var(--marker,var(--hand)); opacity:.46; transform:rotate(-4deg); }

.recognition-wall { display:grid; grid-template-columns:1.2fr .8fr; gap:24px; align-items:stretch; }
.publication-card { position:relative; padding:26px 26px 24px; background:#e7eef6; box-shadow:4px 8px 16px rgba(49,44,36,.16); transform:rotate(-.6deg); overflow:hidden; }
.publication-card:before { content:"PUBLISHED"; position:absolute; top:19px; right:-24px; padding:6px 28px; color:#8e2f29; border:2px solid #9c312a; font:900 10px/1 var(--marker,var(--hand)); transform:rotate(9deg); opacity:.75; }
.publication-card small,.project-card small { color:#777168; font:800 7px/1 var(--mono); letter-spacing:.12em; text-transform:uppercase; }
.publication-card h4 { max-width:78%; margin:13px 0 10px; font:900 clamp(23px,2.35vw,35px)/1 var(--marker,var(--hand)); }
.publication-card p { max-width:92%; margin:0; color:#514e48; font:9px/1.55 var(--mono); }
.citation-mark { display:flex; align-items:end; gap:9px; margin-top:20px; color:#8f302a; }
.citation-mark strong { font:900 clamp(32px,3.5vw,52px)/.8 var(--marker,var(--hand)); }
.citation-mark span { padding-bottom:3px; font:800 8px/1 var(--mono); letter-spacing:.08em; text-transform:uppercase; }
.recognition-stack { display:grid; gap:11px; }
.recognition-ribbon { position:relative; padding:15px 16px 14px 50px; background:#fff5c9; box-shadow:3px 5px 10px rgba(58,44,27,.13); font:900 clamp(12px,1.2vw,17px)/1.15 var(--marker,var(--hand)); transform:rotate(var(--rr,-.7deg)); }
.recognition-ribbon:nth-child(even) { --rr:.8deg; background:#edf4da; }
.recognition-ribbon:before { content:"★"; position:absolute; left:15px; top:50%; width:25px; height:25px; display:grid; place-items:center; border:2px solid #9b302a; border-radius:50%; color:#9b302a; transform:translateY(-50%) rotate(-8deg); }

.project-grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:22px; }
.project-card { position:relative; min-height:230px; padding:24px 24px 22px; background:#fffdf5; box-shadow:4px 8px 16px rgba(54,42,29,.15); transform:rotate(var(--project-r,-.65deg)); transition:transform .2s ease,box-shadow .2s ease; }
.project-card:nth-child(2) { --project-r:.8deg; background:#e8f2f4; }
.project-card:nth-child(3) { --project-r:.45deg; background:#edf4da; }
.project-card:nth-child(4) { --project-r:-.9deg; background:#eee7f7; }
.project-card:hover { transform:translateY(-7px) rotate(0deg); box-shadow:7px 14px 22px rgba(54,42,29,.2); }
.project-card .board-pin { top:-8px; }
.project-status { position:absolute; top:17px; right:18px; padding:5px 7px; border:1px solid #a0332b; border-radius:999px; color:#973028; background:rgba(255,255,255,.64); font:800 6px/1 var(--mono); letter-spacing:.08em; text-transform:uppercase; transform:rotate(2deg); }
.project-card h4 { margin:16px 0 9px; font:900 clamp(22px,2.2vw,33px)/.95 var(--marker,var(--hand)); }
.project-card p { margin:0; color:#555149; font:9px/1.5 var(--mono); }
.project-stack { display:block; margin-top:14px; color:#6b655d; font:800 7px/1.4 var(--mono); letter-spacing:.05em; text-transform:uppercase; }
.github-chip { display:inline-flex; align-items:center; gap:7px; margin-top:18px; padding:8px 11px 7px; color:#fffdf7; background:#272b2c; border:2px solid #272b2c; font:900 8px/1 var(--mono); letter-spacing:.07em; text-decoration:none; text-transform:uppercase; transform:rotate(-1deg); transition:translate .18s ease,background .18s ease,color .18s ease; }
.github-chip:after { content:"↗"; font:900 14px/1 var(--marker,var(--hand)); }
.github-chip:hover,.github-chip:focus-visible { translate:3px -3px; color:#272b2c; background:#fffdf7; outline:none; }
.project-tape { position:absolute; top:-10px; left:38%; width:84px; height:19px; background:rgba(118,190,208,.48); transform:rotate(2deg); }
.project-card:nth-child(2) .project-tape { background:rgba(238,205,91,.5); transform:rotate(-2deg); }
.project-card:nth-child(3) .project-tape { background:rgba(156,192,112,.48); }
.project-card:nth-child(4) .project-tape { background:rgba(205,129,142,.38); }

.principle-board { display:grid; grid-template-columns:repeat(5,minmax(0,1fr)); gap:12px; align-items:start; }
.principle-note { min-height:150px; padding:18px 16px 16px; background:#fff3b9; box-shadow:3px 6px 10px rgba(58,43,27,.14); transform:rotate(var(--pr,-1.3deg)); }
.principle-note:nth-child(2) { --pr:1.5deg; background:#dff0f5; margin-top:18px; }
.principle-note:nth-child(3) { --pr:-.4deg; background:#e7f0d3; }
.principle-note:nth-child(4) { --pr:1deg; background:#eee2f3; margin-top:13px; }
.principle-note:nth-child(5) { --pr:-1.6deg; background:#f3dce0; }
.principle-note strong { display:block; color:#302e2a; font:900 clamp(15px,1.4vw,20px)/1.02 var(--marker,var(--hand)); }
.principle-note p { margin:10px 0 0; color:#5d5850; font:8px/1.45 var(--mono); }
.work-cv-footnote { position:relative; z-index:4; margin:70px 0 0 auto; width:max-content; max-width:100%; color:#6a645d; font:800 11px/1 var(--marker,var(--hand)); transform:rotate(-2deg); }

.work-reveal { opacity:0; }
.work-section.is-visible .work-reveal { opacity:1; }
@keyframes workHeadingDraw { to{transform:scaleX(1) rotate(-1deg);} }
@keyframes skillTitleDraw { to{transform:scaleX(1) rotate(1deg);} }
@keyframes skillChipLand { from{opacity:0;translate:0 8px;scale:.94} to{opacity:1;translate:0 0;scale:1} }
@keyframes skillOutlineDraw { to{clip-path:inset(0 0 0 0);} }
@keyframes skillColorIn { to{transform:scaleX(1) rotate(-1deg);} }
@media (prefers-reduced-motion:no-preference){
 .scroll-board-red[style*="opacity: 1"] .work-cv-thread .thread-main { stroke-dasharray:100; stroke-dashoffset:100; animation:drawWorkThread 1.25s ease-out .2s forwards; }
 .scroll-board-red[style*="opacity: 1"] .work-cv-thread .thread-branch { stroke-dasharray:180; stroke-dashoffset:180; animation:drawBranch .8s ease-out .8s forwards; }
}
@keyframes drawWorkThread { to{stroke-dashoffset:0;} }
@keyframes drawBranch { to{stroke-dashoffset:0;} }

@media (max-width:980px){
 .work-cv-board { padding-inline:28px; }
 .work-cv-legend { display:none; }
 .work-company-chit { width:21%; min-width:130px; padding:15px 12px; }
 .work-evidence-chit { min-width:118px; padding:11px 10px; }
 .work-evidence-chit p { font-size:7px; }
 .skill-wall,.project-grid { gap:16px; }
 .principle-board { grid-template-columns:repeat(3,minmax(0,1fr)); }
}
@media (max-width:760px){
 .work-cv-board { padding:24px 18px 70px; }
 .work-cv-board:after { display:none; }
 .work-cv-header { display:block; padding-right:8px; }
 .work-cv-header h2 { font-size:40px; }
 .work-cv-header p { font-size:8px; }
 .work-scroll-cue { top:7px; margin-top:10px; margin-bottom:-20px; font-size:7px; }
 .work-experience-stage { height:1330px; margin-top:32px; }
 .work-cv-pencil { display:none; }
 .work-cv-role { left:2px; right:2px; }
 .work-cv-role-ion { top:34px; height:940px; }
 .work-cv-role-holisol { top:975px; right:2px; height:330px; }
 .work-cv-thread { display:none; }
 .work-company-chit { position:relative; left:auto; top:auto; width:82%; min-width:0; margin:0 auto 22px 0; }
 .work-company-chit:after { content:""; position:absolute; left:70%; top:100%; width:4px; height:35px; background:#a82f27; transform:rotate(-4deg); }
 .work-evidence-chit { position:relative; left:auto!important; right:auto!important; top:auto!important; width:79%!important; min-width:0; margin:0 0 14px auto; }
 .work-evidence-chit:nth-of-type(even) { margin-left:7%; margin-right:auto; }
 .work-tenure-tag { display:none; }
 .work-section { margin-top:64px; }
 .work-section-heading { margin-bottom:22px; }
 .work-section-heading h3 { font-size:32px; }
 .skill-wall,.project-grid,.recognition-wall { grid-template-columns:1fr; }
 .skill-cluster { min-height:0; padding:20px 18px; }
 .skill-cluster-header { align-items:flex-start; }
 .skill-cluster-header small { font-size:6px; }
 .skill-chip { min-height:27px; padding:7px 9px 6px; font-size:9px; }
 .publication-card h4 { max-width:100%; padding-right:42px; font-size:27px; }
 .publication-card p { font-size:8px; }
 .project-card { min-height:0; }
 .principle-board { grid-template-columns:repeat(2,minmax(0,1fr)); gap:11px; }
 .principle-note { min-height:135px; }
 .principle-note:nth-child(2),.principle-note:nth-child(4) { margin-top:0; }
 .principle-note:nth-child(5) { grid-column:1/-1; width:72%; justify-self:center; }
 .work-cv-footnote { margin-top:50px; font-size:10px; }
}
@media (max-width:430px){
 .work-cv-board { padding-inline:14px; }
 .skill-chips { gap:7px 6px; }
 .principle-note { padding:15px 13px; }
}
@media (prefers-reduced-motion:reduce){
 .work-reveal,.skill-chip { opacity:1!important; }
 .skill-chip:before { clip-path:inset(0 0 0 0)!important; }
 .skill-chip:after { transform:scaleX(1) rotate(-1deg)!important; }
 .work-section-heading h3:after,.skill-cluster h4:after { transform:scaleX(1)!important; }
}
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

  useEffect(() => {
    if (!target) return;
    const board = target.querySelector<HTMLElement>(".work-cv-board");
    if (!board) return;

    const sections = Array.from(board.querySelectorAll<HTMLElement>(".work-section"));
    const reveal = (section: HTMLElement) => {
      if (section.classList.contains("is-visible")) return;
      section.classList.add("is-visible");
      const nodes = section.querySelectorAll<HTMLElement>(".work-reveal");
      if (!nodes.length || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      gsap.fromTo(
        nodes,
        { y: 18, opacity: 0, rotate: -1.2 },
        { y: 0, opacity: 1, rotate: 0, duration: .58, stagger: .065, ease: "power2.out", overwrite: true },
      );
    };

    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => entry.isIntersecting && reveal(entry.target as HTMLElement)),
      { root: target, threshold: .13, rootMargin: "0px 0px -8% 0px" },
    );
    sections.forEach((section) => observer.observe(section));

    const heroNodes = board.querySelectorAll<HTMLElement>(".work-cv-header > *, .work-company-chit, .work-evidence-chit");
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.fromTo(heroNodes, { y: 12, opacity: 0 }, { y: 0, opacity: 1, duration: .48, stagger: .035, delay: .15, ease: "power2.out" });
    }

    return () => observer.disconnect();
  }, [target]);

  const board = target ? createPortal(
    <div className="work-cv-board" aria-label="Scrollable systems engineering case board">
      <header className="work-cv-header">
        <div>
          <span>Case board / 01 · systems dossier</span>
          <h2>Systems / Work</h2>
          <p>The production evidence is still the first layer. Keep scrolling: skills, recognition, shipped projects and the operating rules underneath the work are pinned further down this same case board.</p>
        </div>
        <aside className="work-cv-legend"><i aria-hidden="true" /><span>longer thread = longer tenure</span></aside>
      </header>
      <aside className="work-scroll-cue">scroll the case file <b>↓</b></aside>

      <div className="work-experience-stage">
        <span className="work-cv-pencil pencil-one">production → evidence → outcome</span>
        <span className="work-cv-pencil pencil-two">follow the red thread</span>

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
      </div>

      <section className="work-section work-skills-section" aria-labelledby="systems-skill-map">
        <header className="work-section-heading work-reveal">
          <span className="work-section-kicker">Case layer / 02 · capability map</span>
          <h3 id="systems-skill-map">The marker drawer.</h3>
          <p>Not a keyword cloud. These are grouped by the kind of problem they help me solve. The outline lands first; the colour comes in after it.</p>
        </header>
        <div className="skill-wall">
          {skillGroups.map((group, groupIndex) => (
            <article className="skill-cluster work-reveal" key={group.title} style={{ "--skill-ink": group.ink, "--skill-wash": group.wash } as CSSProperties}>
              <div className="skill-cluster-header"><h4>{group.title}</h4><small>{group.note}</small></div>
              <div className="skill-chips">
                {group.skills.map((skill, index) => <span className="skill-chip" key={skill} style={{ "--i": groupIndex * 2 + index } as CSSProperties}>{skill}</span>)}
              </div>
              <span className="skill-doodle" aria-hidden="true">{groupIndex === 0 ? "↳ hot path" : groupIndex === 1 ? "↻ state" : groupIndex === 2 ? "toolbox →" : "??? → learn"}</span>
            </article>
          ))}
        </div>
      </section>

      <section className="work-section work-recognition-section" aria-labelledby="recognition-title">
        <header className="work-section-heading work-reveal">
          <span className="work-section-kicker">Case layer / 03 · recognition wall</span>
          <h3 id="recognition-title">Receipts beyond the pager.</h3>
          <p>Research, internal recognition, competitions and academic markers — useful context, not the whole story.</p>
        </header>
        <div className="recognition-wall">
          <article className="publication-card work-reveal">
            <small>Springer · Cognitive Computation · Mar 2021</small>
            <h4>{cv.publication.title}</h4>
            <p>{cv.publication.detail}</p>
            <div className="citation-mark"><strong>~100</strong><span>citations / growing body of follow-on work</span></div>
          </article>
          <div className="recognition-stack">
            {recognitions.map((recognition) => <div className="recognition-ribbon work-reveal" key={recognition}>{recognition}</div>)}
          </div>
        </div>
      </section>

      <section className="work-section work-projects-section" aria-labelledby="projects-title">
        <header className="work-section-heading work-reveal">
          <span className="work-section-kicker">Case layer / 04 · shipped / built / exploring</span>
          <h3 id="projects-title">Things with fingerprints on them.</h3>
          <p>Public repos where the code can actually be inspected. Current private experiments stay on the Profile board until they are ready to be opened.</p>
        </header>
        <div className="project-grid">
          {projects.map((project, index) => (
            <article className="project-card work-reveal" key={project.title}>
              <span className="project-tape" aria-hidden="true" />
              <span className={`board-pin ${index % 3 === 1 ? "pin-blue" : index % 3 === 2 ? "pin-green" : ""}`} aria-hidden="true" />
              <small>Project / {String(index + 1).padStart(2, "0")}</small>
              <span className="project-status">{project.status}</span>
              <h4>{project.title}</h4>
              <p>{project.summary}</p>
              <span className="project-stack">{project.stack}</span>
              <a className="github-chip" href={project.href} target="_blank" rel="noreferrer">GitHub / inspect code</a>
            </article>
          ))}
        </div>
      </section>

      <section className="work-section work-principles-section" aria-labelledby="principles-title">
        <header className="work-section-heading work-reveal">
          <span className="work-section-kicker">Case layer / 05 · operating rules</span>
          <h3 id="principles-title">Notes I keep re-learning.</h3>
          <p>Small rules that survive changes in framework, language and company.</p>
        </header>
        <div className="principle-board">
          {principles.map(([title, copy]) => <article className="principle-note work-reveal" key={title}><strong>{title}</strong><p>{copy}</p></article>)}
        </div>
      </section>

      <p className="work-cv-footnote">The board is intentionally longer now — systems are rarely one-screen stories.</p>
    </div>,
    target,
  ) : null;

  return <><style>{styles}</style>{board}</>;
}
