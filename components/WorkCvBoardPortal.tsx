"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { BoardEndCue } from "./BoardEndCue";
import "./work-board.css";

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

function CaseCard({ note, index, open, onToggle, buttonRef, production = false }: { note: CaseNote; index: number; open: boolean; onToggle: () => void; buttonRef: (node: HTMLButtonElement | null) => void; production?: boolean }) {
  return <article data-work-case={production ? note.id : undefined} className={`work-case tone-${note.tone} ${open ? "is-open" : ""}`}>
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
      {production && <span className="work-case-proprietary">Proprietary work · technical account</span>}
      {note.proof && <a href={note.proof.href} target="_blank" rel="noopener noreferrer">{note.proof.label} ↗</a>}
    </div>}
  </article>;
}

function EvidenceStage({ company, period, description, children }: { company: "ION" | "Holisol"; period: string; description: string; children: ReactNode }) {
  const stageRef = useRef<HTMLElement>(null);
  const [paths, setPaths] = useState<string[]>([]);
  useEffect(() => {
    const stage = stageRef.current;
    const anchor = stage?.querySelector<HTMLElement>(".work-company-chit");
    const cards = Array.from(stage?.querySelectorAll<HTMLElement>("[data-work-case]") ?? []);
    if (!stage || !anchor || !cards.length) return;
    let frame = 0;
    const measure = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const area = stage.getBoundingClientRect();
        const node = anchor.getBoundingClientRect();
        const narrow = area.width <= 650;
        const x1 = narrow ? node.left - area.left + node.width * .5 : node.right - area.left - 4;
        const y1 = narrow ? node.bottom - area.top - 3 : node.top - area.top + node.height * .5;
        setPaths(cards.map((card) => {
          const rect = card.getBoundingClientRect();
          const x2 = narrow ? rect.left - area.left + Math.min(34, rect.width * .14) : rect.left - area.left + 3;
          const y2 = narrow ? rect.top - area.top + 15 : rect.top - area.top + Math.min(43, rect.height * .3);
          return narrow
            ? `M${x1} ${y1} C${x1 - 24} ${y1 + 32},${x2 - 20} ${y2 - 36},${x2} ${y2}`
            : `M${x1} ${y1} C${x1 + 38} ${y1},${x2 - 46} ${y2},${x2} ${y2}`;
        }));
      });
    };
    const resize = new ResizeObserver(measure);
    [stage, anchor, ...cards].forEach((element) => resize.observe(element));
    measure();
    return () => { resize.disconnect(); cancelAnimationFrame(frame); };
  }, []);
  return <section ref={stageRef} className={`work-map-stage work-stage-${company.toLowerCase()}`} aria-label={`${company} production work`}>
    <svg className="work-cv-thread" aria-hidden="true"><g>{paths.map((path, i) => <path key={i} d={path} />)}</g></svg>
    <div className="work-company-chit">
      <span className="work-company-pin" aria-hidden="true" />
      <small>{company === "ION" ? "01 / trading systems" : "02 / logistics"}</small>
      <h3>{company}</h3>
      <strong>{period}</strong>
      <p>{description}</p>
    </div>
    <div className="work-evidence-grid">{children}</div>
  </section>;
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
    buttonRef={(node) => { buttons.current[note.id] = node; }} production={index < productionCases.length} />;

  const board = target ? createPortal(<div className="work-cv-board" tabIndex={0} aria-label="Scrollable systems case board">
    <header className="work-cv-header">
      <small>Case board / 01 · production evidence</small>
      <h2>Systems / Work</h2>
      <p>What changed, why it mattered, and which tools earned their place. Unfold a pinned case for the engineering underneath the outcome.</p>
    </header>
    <div className="work-cv-scroll-hint" aria-hidden="true"><span>Scroll the case board</span><i /></div>
    <section className="work-section" aria-labelledby="work-production-title">
      <header className="work-section-heading"><small>ION Trading · 2020–present / Holisol · 2019</small><h3 id="work-production-title">Production, with receipts.</h3><p>Measured changes in live workflows. Each number belongs to the path it describes.</p></header>
      <EvidenceStage company="ION" period="2020–present" description="Trading workflows · throughput · recovery">
        {productionCases.slice(0, 6).map(renderCase)}
      </EvidenceStage>
      <EvidenceStage company="Holisol" period="2019" description="First production delivery · Django">
        {productionCases.slice(6).map((note, index) => renderCase(note, index + 6))}
      </EvidenceStage>
    </section>
    <svg className="work-case-divider" viewBox="0 0 760 28" aria-hidden="true"><path d="M3 17C155 2 221 23 375 12S593 21 757 7" /></svg>
    <section className="work-section" aria-labelledby="work-projects-title">
      <header className="work-section-heading"><small>Public code / experiments</small><h3 id="work-projects-title">Things with fingerprints on them.</h3><p>Projects that can be inspected beyond this board.</p></header>
      <div className="work-project-strip">{projectCases.map((note, index) => renderCase(note, index + productionCases.length))}</div>
    </section>
    <p className="work-case-footnote">The skills sit beside the decisions that needed them. ↗</p>
    <BoardEndCue from="work" />
  </div>, target) : null;

  return board;
}
