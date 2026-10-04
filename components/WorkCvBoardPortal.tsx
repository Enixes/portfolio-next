"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

type CaseNote = {
  id: string;
  kicker: string;
  title: string;
  outcome: string;
  story: string;
  skills: readonly string[];
  proof?: { label: string; href: string };
  tone: string;
};

const productionCases: readonly CaseNote[] = [
  { id: "throughput", kicker: "ION / end-of-day", title: "20× trade throughput", outcome: "A Java multithreading refactor moved the end-of-day batch bottleneck.", story: "Scoped the requirements with traders, redesigned concurrent processing for the trade batch, and shipped it with zero production incidents. The measured result was 20 times the previous trade-processing throughput.", skills: ["Java", "Multithreading", "Performance tuning", "Client delivery"], tone: "yellow" },
  { id: "cache", kicker: "IONathon / XTP 1.0", title: "50× supported workflows", outcome: "An off-heap persistent cache removed inter-process calls on supported paths.", story: "Built the winning IONathon XTP 1.0 entry around off-heap persistence so the hot path could avoid repeated inter-process calls. Supported workflows improved by up to 50 times; the scope matters, so this is not a claim about every XTP workflow.", skills: ["Caching", "Off-heap memory", "Java", "Benchmarking"], proof: { label: "IONathon recognition", href: "https://lnkd.in/p/g48cHXEA" }, tone: "blue" },
  { id: "recovery", kicker: "ION / reliability", title: "90% less downtime", outcome: "Automatic recovery resumed halted end-of-day processing.", story: "Designed and deployed a recovery path for halted end-of-day runs. It reduced downtime by 90% and removed the after-hours operator calls for the affected flow.", skills: ["Failure recovery", "Event-driven systems", "Operations", "Java"], tone: "green" },
  { id: "alazium", kicker: "ION / incident response", title: "30% faster triage", outcome: "Alazium turned 100 GB+ production logs into usable signals.", story: "Built an automated Python and regex log-analysis tool for large production log sets. The engineering team used the structured findings to cut incident triage time by 30%.", skills: ["Python", "Log analysis", "Observability", "Incident response"], tone: "pink" },
  { id: "database", kicker: "ION / historical data", title: "95% database uplift", outcome: "A regression-led cleanup redesign improved peak-load performance.", story: "Reworked historical-data cleanup using a linear-regression approach and measured a 95% improvement in database performance under peak load.", skills: ["Oracle", "SQL", "Data lifecycle", "Performance analysis"], tone: "lilac" },
  { id: "ci", kicker: "ION / delivery pipeline", title: "40% faster CI", outcome: "Parallel artifact caching also cut monthly AWS cost by 35%.", story: "Built a cache that predownloads build artifacts in parallel. The affected CI jobs ran up to 40% faster while monthly AWS costs fell by 35%.", skills: ["CI/CD", "Caching", "AWS", "Parallel processing"], tone: "yellow" },
  { id: "holisol", kicker: "Holisol / 2019", title: "A run sheet used at work", outcome: "A Django delivery tool went from requirements to deployment approval.", story: "Built a Daily Run Sheet Generator to help plan logistics deliveries, presented it to the founder, and secured approval for production deployment. This was my first end-to-end workplace tool.", skills: ["Django", "Python", "Requirements", "Deployment"], tone: "green" },
];

const projectCases: readonly CaseNote[] = [
  { id: "tailcache", kicker: "Open project / research in progress", title: "TailCache", outcome: "A reproducible look at the price of p99 latency.", story: "A Java 21/JMH study comparing on-heap Caffeine and off-heap Chronicle Map under deterministic workloads. It examines p50 through p99.9 latency, heap pressure, and the costs behind each choice. The research is still in progress.", skills: ["Java 21", "JMH", "Caffeine", "Chronicle Map"], proof: { label: "Inspect TailCache", href: "https://github.com/Enixes/TailCache" }, tone: "blue" },
  { id: "hsgo", kicker: "Open project / published research", title: "Hybrid Social Group Optimization", outcome: "A meta-heuristic studied for feature selection in chest X-ray classification.", story: "Developed an optimisation approach intended to escape local minima and maxima. In the published study, paired with a support vector classifier, it reported 99.65% accuracy on its study dataset. That is a study result, not a clinical claim.", skills: ["Python", "Optimisation", "Machine learning", "Computer vision"], proof: { label: "Inspect the public code", href: "https://github.com/Enixes/Hybrid-Social-Group-Optimization-algorithm" }, tone: "lilac" },
  { id: "mining", kicker: "Open project / HackBMU", title: "Illegal Mining Detector", outcome: "A computer-vision build placed Top 10 at the inaugural HackBMU.", story: "A rapid prototype for identifying illegal mining activity from visual data. Built for the inaugural HackBMU hackathon, where it placed in the Top 10.", skills: ["Computer vision", "Detection", "Rapid prototyping"], proof: { label: "Inspect the public code", href: "https://github.com/Enixes/Illegal-Mining-Detector" }, tone: "pink" },
];

const styles = `
.work-cv-mounted > .story-board-index,.work-cv-mounted > .story-board-header,.work-cv-mounted > .story-board-grid,.work-cv-mounted > .story-board-footnote { display:none!important; }
.scroll-board-red .story-board-frame { height:100%!important;min-height:0!important;overflow:hidden!important; }
.work-cv-mounted { position:relative;display:block!important;height:100%!important;min-height:0!important;overflow:hidden!important;padding:0!important; }
.work-cv-board { box-sizing:border-box;position:relative;width:100%;height:100%;overflow:auto hidden;padding:clamp(28px,4vw,54px) clamp(20px,4.8vw,66px) 100px;color:#2a2925;background:radial-gradient(circle at 20% 5%,#fffdf780,transparent 38%),repeating-linear-gradient(0deg,transparent 0 31px,#5a51450a 31px 32px),#f7f3e9;scrollbar-width:thin;scrollbar-color:#a64d3d #ede3d4;touch-action:pan-y pinch-zoom; }
.work-cv-board * { box-sizing:border-box; }
.work-cv-header { position:relative;z-index:2;max-width:850px;margin:0 0 34px; }
.work-cv-header small,.work-section-heading small { display:block;color:#9b3c32;font:900 10px/1.3 var(--mono);letter-spacing:.14em;text-transform:uppercase; }
.work-cv-header h2 { margin:8px 0 10px;font:800 clamp(42px,5vw,76px)/.9 var(--marker,var(--hand));transform:rotate(-1deg); }
.work-cv-header p { max-width:720px;margin:0;color:#58544c;font:500 clamp(13px,1.2vw,17px)/1.55 var(--sans); }
.work-cv-scroll-hint { position:sticky;z-index:12;top:8px;display:flex;align-items:center;gap:10px;width:max-content;max-width:100%;margin:0 0 32px auto;padding:8px 12px;color:#784234;background:#fff0c6f0;border:1px dashed #b78957;box-shadow:2px 4px 8px #49392818;font:800 10px/1 var(--mono);transform:rotate(1deg); }
.work-cv-scroll-hint i { width:54px;height:3px;background:linear-gradient(90deg,#a73c35 var(--work-progress,0%),#d7c0a0 var(--work-progress,0%)); }
.work-section { position:relative;margin:36px 0 80px; }
.work-section-heading { position:relative;max-width:800px;margin:0 0 26px; }
.work-section-heading h3 { width:max-content;max-width:100%;margin:7px 0 8px;font:800 clamp(30px,3.3vw,50px)/1 var(--hand); }
.work-section-heading h3::after { content:"";display:block;margin-top:3px;border-bottom:4px solid #b04739;border-radius:50%;transform:rotate(-1deg); }
.work-section-heading p { margin:0;color:#686158;font:600 12px/1.5 var(--sans); }
.work-case-grid { display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:26px;align-items:start; }
.work-case { position:relative;min-width:0;border:1px solid #bcb19b;background:#fff5d3;box-shadow:4px 7px 15px #483b2b21;transform:rotate(var(--case-tilt,-.7deg));transition:transform .25s,box-shadow .25s; }
.work-case:nth-child(3n+2) { --case-tilt:1deg; }
.work-case:nth-child(3n+3) { --case-tilt:-1.2deg; }
.work-case.tone-blue { background:#e2f0f4; }.work-case.tone-green { background:#eaf1d9; }.work-case.tone-pink { background:#f8e6e7; }.work-case.tone-lilac { background:#eee8f6; }
.work-case.is-open { transform:rotate(0);box-shadow:8px 13px 24px #483b2b2b; }
.work-case-pin { position:absolute;z-index:3;top:-10px;left:48%;width:17px;height:17px;border:2px solid #6d332a;border-radius:50%;background:#c85743;box-shadow:2px 3px 3px #2c1c1840; }
.work-case:nth-child(3n+2) .work-case-pin { background:#4890a6;border-color:#225b71; }.work-case:nth-child(3n+3) .work-case-pin { background:#76a35e;border-color:#4b6d38; }
.work-case-button { position:relative;display:block;width:100%;min-height:170px;padding:26px 27px 22px;border:0;color:#292823;background:transparent;text-align:left;cursor:pointer; }
.work-case-button:focus-visible,.work-case-detail a:focus-visible { outline:3px solid #a33d33;outline-offset:3px; }
.work-case-button small { display:block;color:#8b4c3c;font:900 9px/1.2 var(--mono);letter-spacing:.1em;text-transform:uppercase; }
.work-case-button strong { display:block;margin:12px 0 8px;font:800 clamp(25px,2.45vw,35px)/1 var(--hand); }
.work-case-button .work-case-outcome { display:block;max-width:51ch;color:#514b44;font:500 13px/1.45 var(--sans); }
.work-case-button .work-case-action { display:block;margin-top:18px;color:#973c35;font:900 10px/1.2 var(--mono);letter-spacing:.07em;text-transform:uppercase; }
.work-case-detail { margin:0 18px 19px;padding:21px 22px 19px;border:1px solid #cfc1a7;background:repeating-linear-gradient(transparent 0 29px,#786b5c0f 29px 30px),#fffdf6;box-shadow:inset 0 4px 8px #51412b0d;animation:workCaseUnfold .48s cubic-bezier(.18,.8,.2,1) both;transform-origin:top; }
.work-case-detail p { margin:0 0 17px;color:#4b4741;font:500 clamp(13px,1.2vw,16px)/1.6 var(--sans); }
.work-case-skills { display:flex;flex-wrap:wrap;gap:7px;margin:0 0 16px;padding:0;list-style:none; }
.work-case-skills li { padding:6px 9px;border:1px solid #9c7457;border-radius:40% 60% 42% 58% / 60% 47% 53% 40%;color:#6c4839;background:#f8eedb;font:800 10px/1.2 var(--mono);transform:rotate(-1deg); }
.work-case-detail a { display:inline-block;padding:9px 12px;color:#fff;background:#363733;font:800 10px/1 var(--mono);text-decoration:none; }
.work-case-detail a:hover { background:#a13e34; }
.work-case-divider { display:block;width:78%;margin:0 auto 17px;fill:none;stroke:#b0493a;stroke-width:3;stroke-linecap:round;stroke-dasharray:760;stroke-dashoffset:0; }
.work-case-footnote { margin:20px 0 0;color:#70675d;font:700 11px/1.5 var(--mono);text-align:right; }
@keyframes workCaseUnfold { from { opacity:.2;transform:perspective(700px) rotateX(-28deg) translateY(-12px); } to { opacity:1;transform:none; } }
@media(max-width:900px){ .work-cv-board { padding-top:88px; } }
@media(max-width:800px){ .work-case-grid { gap:17px; }.work-case-button { padding:22px 19px 18px; }.work-case-detail { margin:0 12px 12px;padding:17px; } }
@media(max-width:650px){ .work-cv-board { padding:82px 18px 82px; }.work-case-grid { grid-template-columns:1fr;gap:19px; }.work-case-button { min-height:0; }.work-cv-scroll-hint { font-size:8px; }.work-section { margin-bottom:60px; } }
@media(max-width:360px){ .work-cv-board { padding-inline:12px; }.work-case-button { padding:20px 16px 17px; }.work-case-detail { margin-inline:8px;padding:14px; } }
@media(prefers-reduced-motion:reduce){ .work-case,.work-case-detail { animation:none!important;transition:none!important;transform:none!important; } }
`;

function CaseCard({ note, index, open, onToggle, buttonRef }: { note: CaseNote; index: number; open: boolean; onToggle: () => void; buttonRef: (node: HTMLButtonElement | null) => void }) {
  const proof = note.proof ?? (index < productionCases.length ? {
    label: "Academic CV account",
    href: "https://docs.google.com/document/d/18Doo1tMaCr-BnjtHryovwuKkkuCZRNkLwYFxggUtCi4/edit?tab=t.0",
  } : undefined);
  return <article className={`work-case tone-${note.tone} ${open ? "is-open" : ""}`}>
    <span className="work-case-pin" aria-hidden="true" />
    <button ref={buttonRef} type="button" className="work-case-button" onClick={onToggle} aria-expanded={open} aria-controls={`work-case-${note.id}`}>
      <small>{String(index + 1).padStart(2, "0")} / {note.kicker}</small>
      <strong>{note.title}</strong>
      <span className="work-case-outcome">{note.outcome}</span>
      <span className="work-case-action">{open ? "Fold note ↖" : "Unfold details ↗"}</span>
    </button>
    {open && <div id={`work-case-${note.id}`} className="work-case-detail" tabIndex={-1}>
      <p>{note.story}</p>
      <ul className="work-case-skills" aria-label="Skills used">{note.skills.map((skill) => <li key={skill}>{skill}</li>)}</ul>
      {proof && <a href={proof.href} target="_blank" rel="noopener noreferrer">{proof.label} ↗</a>}
    </div>}
  </article>;
}

export function WorkCvBoardPortal() {
  const [target, setTarget] = useState<HTMLElement | null>(null);
  const [open, setOpen] = useState<string | null>(null);
  const buttons = useRef<Record<string, HTMLButtonElement | null>>({});
  const surfaceRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const title = document.getElementById("work-board-story-title");
    const surface = title?.closest<HTMLElement>(".story-board-surface") ?? null;
    if (!surface) return;
    surfaceRef.current = surface;
    surface.classList.add("work-cv-mounted");
    const frame = requestAnimationFrame(() => setTarget(surface));
    return () => { cancelAnimationFrame(frame);surfaceRef.current = null;surface.classList.remove("work-cv-mounted"); };
  }, []);

  useEffect(() => {
    if (!target) return;
    const board = surfaceRef.current?.querySelector<HTMLElement>(".work-cv-board");
    if (!board) return;
    const update = () => {
      const max = Math.max(1, board.scrollHeight - board.clientHeight);
      board.style.setProperty("--work-progress", `${Math.round(board.scrollTop / max * 100)}%`);
    };
    board.addEventListener("scroll", update, { passive: true });
    update();
    return () => board.removeEventListener("scroll", update);
  }, [target]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(null);
      requestAnimationFrame(() => buttons.current[open]?.focus({ preventScroll: true }));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const renderCase = (note: CaseNote, index: number) => <CaseCard key={note.id} note={note} index={index} open={open === note.id}
    onToggle={() => setOpen((current) => current === note.id ? null : note.id)}
    buttonRef={(node) => { buttons.current[note.id] = node; }} />;

  const board = target ? createPortal(<div className="work-cv-board" tabIndex={0} aria-label="Scrollable systems case board">
    <header className="work-cv-header">
      <small>Case board / 01 · production evidence</small>
      <h2>Systems / Work</h2>
      <p>What changed, why it mattered, and which tools earned their place. Unfold a pinned case for the engineering underneath the outcome.</p>
    </header>
    <div className="work-cv-scroll-hint" aria-hidden="true"><span>Scroll the case board</span><i /></div>
    <section className="work-section" aria-labelledby="work-production-title">
      <header className="work-section-heading"><small>ION Trading · 2020–present / Holisol · 2019</small><h3 id="work-production-title">Production, with receipts.</h3><p>Measured changes in live workflows. Each number belongs to the path it describes.</p></header>
      <div className="work-case-grid">{productionCases.map(renderCase)}</div>
    </section>
    <svg className="work-case-divider" viewBox="0 0 760 28" aria-hidden="true"><path d="M3 17C155 2 221 23 375 12S593 21 757 7" /></svg>
    <section className="work-section" aria-labelledby="work-projects-title">
      <header className="work-section-heading"><small>Public code / experiments</small><h3 id="work-projects-title">Things with fingerprints on them.</h3><p>Projects that can be inspected beyond this board.</p></header>
      <div className="work-case-grid">{projectCases.map((note, index) => renderCase(note, index + productionCases.length))}</div>
    </section>
    <p className="work-case-footnote">The skills sit beside the decisions that needed them. ↗</p>
  </div>, target) : null;

  return <><style>{styles}</style>{board}</>;
}
