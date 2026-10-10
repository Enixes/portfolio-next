"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import gsap from "gsap";
import { BoardEndCue } from "./BoardEndCue";
import { SystemsSkillsBench, type SkillFollowRequest } from "./SystemsSkillsBench";
import { WorkCaseArtwork } from "./WorkCaseArtwork";
import { BOARD_NAVIGATE_EVENT, WORK_SKILL_INTERRUPT_EVENT } from "./board-navigation";
import "./work-board.css";
import "./systems-living-board.css";

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

type CaseSpotlight = { caseId: string; skill: string; tone: SkillFollowRequest["tone"] };

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

const cardsIds = {
  ION: productionCases.slice(0, 6).map((note) => note.id),
  Holisol: productionCases.slice(6).map((note) => note.id),
};

function markerPerimeter(width: number, height: number) {
  // Fixed corner depth keeps the ink at the paper edge when a note unfolds.
  return `M17 6 C${Math.round(width * .36)} 3,${Math.round(width * .71)} 5,${width - 18} 6 ` +
    `Q${width - 6} 7,${width - 6} 20 L${width - 5} ${height - 22} ` +
    `Q${width - 5} ${height - 7},${width - 19} ${height - 6} ` +
    `C${Math.round(width * .67)} ${height - 3},${Math.round(width * .28)} ${height - 5},16 ${height - 7} ` +
    `Q6 ${height - 8},6 ${height - 23} L6 21 Q6 8,17 6Z`;
}

function CaseCard({ note, index, open, onToggle, buttonRef, spotlight, onBack, production = false }: {
  note: CaseNote; index: number; open: boolean; onToggle: () => void;
  buttonRef: (node: HTMLButtonElement | null) => void;
  spotlight: CaseSpotlight | null; onBack: () => void; production?: boolean;
}) {
  const linked = spotlight?.caseId === note.id;
  const cardRef = useRef<HTMLElement>(null);
  const [perimeter, setPerimeter] = useState({ width: 0, height: 0 });
  useLayoutEffect(() => {
    const card = cardRef.current;
    if (!linked || !card) return;
    const measure = () => setPerimeter({ width: card.offsetWidth + 20, height: card.offsetHeight + 20 });
    const resize = new ResizeObserver(measure);
    resize.observe(card);
    measure();
    return () => resize.disconnect();
  }, [linked]);
  return <article ref={cardRef} data-work-case={note.id} data-spot-tone={linked ? spotlight.tone : undefined}
    className={`work-case tone-${note.tone} ${open ? "is-open" : ""} ${linked ? "is-spotlit" : ""}`}>
    <span className="work-case-pin" aria-hidden="true" />
    {linked && perimeter.width > 0 && <svg className="work-case-spotlight-ring" aria-hidden="true"
      viewBox={`0 0 ${perimeter.width} ${perimeter.height}`} preserveAspectRatio="none">
      <path pathLength="1" d={markerPerimeter(perimeter.width, perimeter.height)} />
    </svg>}
    <button ref={buttonRef} type="button" className="work-case-button" onClick={onToggle} aria-expanded={open} aria-controls={`work-case-${note.id}`}>
      <small>{String(index + 1).padStart(2, "0")} / {note.kicker}</small>
      <strong>{note.title}</strong>
      <span className="work-case-outcome">{note.outcome}</span>
      <span className="work-case-action">{open ? "Fold note ↖" : "Unfold details ↗"}</span>
      <WorkCaseArtwork caseId={note.id} />
    </button>
    {linked && <div className="work-case-linked" role="status"><span>Linked from: <strong>{spotlight.skill}</strong></span><button type="button" onClick={onBack}>Back to skills ↶</button></div>}
    {open && <div id={`work-case-${note.id}`} className="work-case-detail" tabIndex={-1}>
      <p>{note.story}</p>
      <ul className="work-case-skills" aria-label="Skills used">{note.skills.map((skill) => <li key={skill}>{skill}</li>)}</ul>
      {production && <span className="work-case-proprietary">Proprietary work · technical account</span>}
      {note.proof && <a href={note.proof.href} target="_blank" rel="noopener noreferrer">{note.proof.label} ↗</a>}
    </div>}
  </article>;
}

function CompanyMiniScene({ company }: { company: "ION" | "Holisol" }) {
  return <div className="work-company-mini-scene" aria-hidden="true">
    {company === "ION" ? <>
      <svg viewBox="0 0 164 83" focusable="false">
        <path className="work-mini-track" d="M12 41h32m0 0 28-23m-28 23 28 23m0-46h36m-36 46h36m0-46 36 23m-36 23 36-23" />
        <rect x="5" y="30" width="22" height="21" rx="3" /><rect x="61" y="8" width="22" height="21" rx="3" /><rect x="61" y="53" width="22" height="21" rx="3" />
        <rect x="132" y="29" width="25" height="24" rx="3" />
        <circle className="work-mini-packet packet-a" cx="39" cy="41" r="4" /><circle className="work-mini-packet packet-b" cx="70" cy="18" r="4" />
        <circle className="work-mini-recovery" cx="144" cy="41" r="7" /><path d="m140 41 3 3 5-6" />
      </svg>
      <span className="work-mini-labels"><i>batch</i><i>cache</i><i>recover</i></span>
      <span className="work-mini-sticky-notes"><i>hot-path cache</i><i>automatic recovery</i></span>
    </> : <>
      <svg viewBox="0 0 180 83" focusable="false">
        <path className="work-mini-route" d="M8 67C35 44 51 75 78 49S123 56 155 16" />
        <path className="work-mini-run-sheet" d="M20 11h53v38H20zM29 21h35m-35 9h25m-25 9h33" />
        <path className="work-mini-check" d="m50 37 5 5 11-13" pathLength="1" />
        <g className="work-mini-truck"><path d="M94 39h28l9 10h12v17H91V49h3z" /><circle cx="102" cy="67" r="5" /><circle cx="131" cy="67" r="5" /></g>
      </svg>
      <span className="work-mini-labels"><i>plan</i><i>route</i><i>deliver</i></span>
      <span className="work-mini-sticky-notes"><i>daily run sheet</i><i>deployment approved</i></span>
    </>}
  </div>;
}

function EvidenceStage({ company, period, description, selectedCaseId, children }: {
  company: "ION" | "Holisol"; period: string; description: string;
  selectedCaseId: string | null; children: ReactNode;
}) {
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
  }, [selectedCaseId]);
  return <section ref={stageRef} className={`work-map-stage work-stage-${company.toLowerCase()}`} aria-label={`${company} production work`}>
    <svg className="work-cv-thread" aria-hidden="true"><g>{paths.map((path, i) => <path key={i} d={path} className={cardsIds[company][i] === selectedCaseId ? "is-selected-route" : undefined} pathLength="1" />)}</g></svg>
    <div className="work-company-chit">
      <span className="work-company-pin" aria-hidden="true" />
      <small>{company === "ION" ? "01 / trading systems" : "02 / logistics"}</small>
      <span className={`work-company-logo-sticker company-${company.toLowerCase()}`} aria-hidden="true">
        <Image src={company === "ION" ? "/profile/ion-official-logo.png" : "/profile/holisol-official-logo.png"}
          alt="" width={company === "ION" ? 94 : 112} height={company === "ION" ? 46 : 40} />
      </span>
      <h3>{company}</h3>
      <strong>{period}</strong>
      <p>{description}</p>
      <CompanyMiniScene company={company} />
    </div>
    <div className="work-evidence-grid">{children}</div>
  </section>;
}

export function WorkCvBoardPortal() {
  const [target, setTarget] = useState<HTMLElement | null>(null);
  const [open, setOpen] = useState<string | null>(null);
  const [spotlight, setSpotlight] = useState<CaseSpotlight | null>(null);
  const [trace, setTrace] = useState<{ skill: string; serial: number } | null>(null);
  const buttons = useRef<Record<string, HTMLButtonElement | null>>({});
  const surfaceRef = useRef<HTMLElement | null>(null);
  const boardRef = useRef<HTMLDivElement | null>(null);
  const travel = useRef<{
    token: number; timer: number | null; tween: gsap.core.Tween | null; pending: boolean;
    origin: { button: HTMLButtonElement; scrollTop: number; viewportOffset: number } | null;
  }>({ token: 0, timer: null, tween: null, pending: false, origin: null });

  const cancelTravel = useCallback((clearSpotlight = false) => {
    const current = travel.current;
    current.token += 1;
    if (current.timer !== null) window.clearTimeout(current.timer);
    current.tween?.kill();
    current.timer = null;
    current.tween = null;
    current.pending = false;
    setTrace(null);
    if (clearSpotlight) setSpotlight(null);
  }, []);

  const followSkill = useCallback((request: SkillFollowRequest) => {
    const board = boardRef.current;
    const panel = board?.closest<HTMLElement>("[data-board-panel]");
    if (!board || panel?.getAttribute("aria-hidden") !== "false") return;
    cancelTravel(true);
    const current = travel.current;
    const token = current.token;
    current.origin = { button: request.origin, scrollTop: board.scrollTop,
      viewportOffset: request.origin.getBoundingClientRect().top - board.getBoundingClientRect().top };
    current.pending = true;
    setOpen(null);
    setTrace({ skill: request.skill, serial: token });
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    current.timer = window.setTimeout(() => {
      current.timer = null;
      if (token !== current.token || panel.getAttribute("aria-hidden") !== "false") return;
      const card = board.querySelector<HTMLElement>(`[data-work-case="${request.caseId}"]`);
      const button = card?.querySelector<HTMLButtonElement>(".work-case-button");
      if (!card || !button) { cancelTravel(true); return; }
      const top = board.scrollTop + card.getBoundingClientRect().top - board.getBoundingClientRect().top - Math.min(128, board.clientHeight * .16);
      const destination = Math.max(0, Math.min(board.scrollHeight - board.clientHeight, top));
      const arrive = () => {
        if (token !== current.token || panel.getAttribute("aria-hidden") !== "false") return;
        current.pending = false;
        current.tween = null;
        setTrace(null);
        setSpotlight({ caseId: request.caseId, skill: request.skill, tone: request.tone });
        button.focus({ preventScroll: true });
      };
      if (reduced) { board.scrollTop = destination; arrive(); }
      else current.tween = gsap.to(board, { scrollTop: destination, duration: Math.min(1.05, .52 + Math.abs(destination - board.scrollTop) / 4500), ease: "power2.inOut", onComplete: arrive });
    }, reduced ? 0 : 220);
  }, [cancelTravel]);

  const backToSkills = useCallback(() => {
    const board = boardRef.current;
    const origin = travel.current.origin;
    if (!board || !origin) return;
    cancelTravel(true);
    const current = travel.current;
    const token = current.token;
    current.pending = true;
    const rawDestination = origin.button.isConnected
      ? board.scrollTop + origin.button.getBoundingClientRect().top - board.getBoundingClientRect().top - origin.viewportOffset
      : origin.scrollTop;
    const destination = Math.max(0, Math.min(board.scrollHeight - board.clientHeight, rawDestination));
    const arrive = () => {
      if (token !== current.token) return;
      current.pending = false;
      current.tween = null;
      if (origin.button.isConnected) origin.button.focus({ preventScroll: true });
    };
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      board.scrollTop = destination;
      arrive();
    } else current.tween = gsap.to(board, { scrollTop: destination, duration: .78, ease: "power2.inOut", onComplete: arrive });
  }, [cancelTravel]);

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
    const panel = target.closest<HTMLElement>("[data-board-panel]");
    const travelState = travel.current;
    const onGesture = () => { if (travel.current.pending) cancelTravel(true); };
    const onNavigate = (event: Event) => {
      const destination = (event as CustomEvent<{ index: number }>).detail?.index;
      if (destination !== 1) cancelTravel(true);
    };
    const onPanel = () => {
      if (document.hidden || panel?.getAttribute("aria-hidden") === "true") cancelTravel(true);
    };
    window.addEventListener(WORK_SKILL_INTERRUPT_EVENT, onGesture);
    window.addEventListener(BOARD_NAVIGATE_EVENT, onNavigate);
    const panelObserver = new MutationObserver(onPanel);
    if (panel) panelObserver.observe(panel, { attributes: true, attributeFilter: ["aria-hidden"] });
    document.addEventListener("visibilitychange", onPanel);
    return () => {
      window.removeEventListener(WORK_SKILL_INTERRUPT_EVENT, onGesture);
      window.removeEventListener(BOARD_NAVIGATE_EVENT, onNavigate);
      panelObserver.disconnect();
      document.removeEventListener("visibilitychange", onPanel);
      if (travelState.timer !== null) window.clearTimeout(travelState.timer);
      travelState.tween?.kill();
    };
  }, [target, cancelTravel]);

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
    const board = boardRef.current;
    const panel = board?.closest<HTMLElement>("[data-board-panel]");
    if (!board || !panel) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const items = Array.from(board.querySelectorAll<HTMLElement>(".work-company-chit,.work-case"));
    const visible = new Set<HTMLElement>();
    const played = new Set<HTMLElement>();
    const entranceTimers = new Map<HTMLElement, number>();
    const refresh = () => {
      const active = !document.hidden && !reduced.matches &&
        panel.getAttribute("aria-hidden") === "false" && panel.style.pointerEvents === "auto" &&
        panel.style.visibility !== "hidden";
      board.classList.toggle("is-motion-active", active);
      if (!active) {
        played.clear();
        entranceTimers.forEach((timer) => window.clearTimeout(timer));
        entranceTimers.clear();
      }
      items.forEach((item) => {
        if (!active || !visible.has(item)) {
          item.classList.remove("is-drawing");
          const timer = entranceTimers.get(item);
          if (timer !== undefined) window.clearTimeout(timer);
          entranceTimers.delete(item);
        } else if (!played.has(item)) {
          item.classList.add("is-drawing"); played.add(item);
          entranceTimers.set(item, window.setTimeout(() => {
            item.classList.remove("is-drawing"); entranceTimers.delete(item);
          }, 1800));
        }
      });
    };
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) visible.add(entry.target as HTMLElement);
        else visible.delete(entry.target as HTMLElement);
      });
      refresh();
    }, { root: board, threshold: .12 });
    items.forEach((item) => observer.observe(item));
    const panelObserver = new MutationObserver(refresh);
    panelObserver.observe(panel, { attributes: true, attributeFilter: ["aria-hidden", "style"] });
    document.addEventListener("visibilitychange", refresh);
    reduced.addEventListener("change", refresh);
    refresh();
    return () => {
      observer.disconnect(); panelObserver.disconnect();
      document.removeEventListener("visibilitychange", refresh);
      reduced.removeEventListener("change", refresh);
      entranceTimers.forEach((timer) => window.clearTimeout(timer));
      board.classList.remove("is-motion-active");
    };
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
    buttonRef={(node) => { buttons.current[note.id] = node; }} spotlight={spotlight} onBack={backToSkills}
    production={index < productionCases.length} />;

  const board = target ? createPortal(<div ref={boardRef} className="work-cv-board" tabIndex={0} aria-label="Scrollable systems case board">
    <header className="work-cv-header">
      <small>Case board / 01 · tools and production evidence</small>
      <h2>Systems / Work</h2>
      <p>First the working kit, then the decisions it helped make. Every skill stays on the bench; unfold a pinned case for the engineering underneath an outcome.</p>
    </header>
    <div className="work-cv-scroll-hint" aria-hidden="true"><span>Scroll the case board</span><i /></div>
    <SystemsSkillsBench onFollow={followSkill} onAnnotation={() => cancelTravel(true)} trace={trace} />
    <svg className="work-case-divider work-skills-divider" viewBox="0 0 760 28" aria-hidden="true"><path d="M3 17C155 2 221 23 375 12S593 21 757 7" /></svg>
    <section className="work-section" aria-labelledby="work-production-title">
      <header className="work-section-heading"><small>02 / ION Trading · 2020–present / Holisol · 2019</small><h3 id="work-production-title">Production, with receipts.</h3><p>Measured changes in live workflows. Each number belongs to the path it describes.</p></header>
      <EvidenceStage company="ION" period="2020–present" description="Trading workflows · throughput · recovery" selectedCaseId={spotlight?.caseId ?? null}>
        {productionCases.slice(0, 6).map(renderCase)}
      </EvidenceStage>
      <EvidenceStage company="Holisol" period="2019" description="First production delivery · Django" selectedCaseId={spotlight?.caseId ?? null}>
        {productionCases.slice(6).map((note, index) => renderCase(note, index + 6))}
      </EvidenceStage>
    </section>
    <svg className="work-case-divider" viewBox="0 0 760 28" aria-hidden="true"><path d="M3 17C155 2 221 23 375 12S593 21 757 7" /></svg>
    <section className="work-section" aria-labelledby="work-projects-title">
      <header className="work-section-heading"><small>03 / Public code and experiments</small><h3 id="work-projects-title">Things with fingerprints on them.</h3><p>Projects that can be inspected beyond this board.</p></header>
      <div className="work-project-strip">{projectCases.map((note, index) => renderCase(note, index + productionCases.length))}</div>
    </section>
    <p className="work-case-footnote">The skills sit beside the decisions that needed them. ↗</p>
    <BoardEndCue from="work" />
  </div>, target) : null;

  return board;
}
