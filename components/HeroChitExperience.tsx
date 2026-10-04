"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

type ChitStory = {
  selector: string;
  section: "profile" | "work" | "blog" | "life" | "contact";
  label: string;
  title: string;
  story: string;
  proof?: { label: string; href: string };
};

const stories: readonly ChitStory[] = [
  { selector: ".identity-file", section: "profile", label: "Profile / skill preview", title: "The engineer behind the board", story: "I build and improve backend systems, from concurrent Java services to recovery paths and careful benchmarking. The Profile board follows the full path that brought me here." },
  { selector: ".metric-throughput", section: "work", label: "ION / end-of-day", title: "20× trade throughput", story: "A Java multithreading refactor increased end-of-day trade-processing throughput by 20 times. I scoped the requirements with traders and delivered it with zero production incidents." },
  { selector: ".metric-recovery", section: "work", label: "ION / recovery", title: "90% less downtime", story: "Automatic recovery for halted end-of-day processing cut downtime by 90% and removed after-hours operator calls for the affected flow." },
  { selector: ".api-gateway-note", section: "work", label: "ION / database", title: "95% database uplift", story: "A regression-led redesign of historical-data cleanup improved database performance by 95% under peak load." },
  { selector: ".queue-depth-note", section: "work", label: "ION / incidents", title: "30% faster triage", story: "Alazium parses 100 GB+ production logs into useful signals, helping the engineering team reduce incident triage time by 30%." },
  { selector: ".idempotency-note", section: "work", label: "ION / CI", title: "35% lower AWS cost", story: "A cache that predownloads CI artifacts in parallel shortened builds and reduced monthly AWS cost by 35%." },
  { selector: ".autoscale-note", section: "work", label: "ION / CI", title: "40% faster builds", story: "The parallel artifact cache cut build times by up to 40% in affected CI workflows." },
  { selector: ".cache-note", section: "work", label: "IONathon / XTP 1.0", title: "50× supported workflows", story: "An off-heap persistent cache removed inter-process calls on supported workflows. It won IONathon XTP 1.0 and improved those paths by up to 50 times.", proof: { label: "IONathon recognition", href: "https://lnkd.in/p/g48cHXEA" } },
  { selector: ".failure-note", section: "work", label: "Systems / craft", title: "Java and Spring Boot", story: "Java concurrency, event-driven services, production debugging, and measurable improvements sit at the centre of my backend work." },
  { selector: ".partition-note", section: "work", label: "Systems / messaging", title: "Events and queues", story: "I work with asynchronous workflows, MQ-like and Kafka-like messaging, and the failure paths that make them reliable at scale." },
  { selector: ".observability-card", section: "work", label: "ION / Alazium", title: "From logs to an answer", story: "Parsing large production logs is only useful when it shortens the path to a decision. Alazium’s automated analysis reduced incident triage time by 30%." },
  { selector: ".blog-note", section: "blog", label: "Field Notes / notebook", title: "Still in pencil", story: "The writing board is being prepared. It will hold observations about systems, experiments, and the questions that deserve a closer look." },
  { selector: ".blog-topic-one", section: "blog", label: "Field Notes / loose leaf", title: "A thread taking shape", story: "The first note will go up when the idea earns its place on the board." },
  { selector: ".blog-topic-two", section: "blog", label: "Field Notes / revisions", title: "Pencil before ink", story: "The notebook is still being revised. The board is open so visitors can see where the writing will live." },
  { selector: ".life-note", section: "life", label: "Off the clock", title: "The human side of the map", story: "Football, books, anime, games, and side quests. The Life board holds the interests that keep curiosity moving outside production systems." },
  { selector: ".life-topic-one", section: "life", label: "Football", title: "Manchester United", story: "The game, the shape of a midfield, and the joy of finding a useful pass in the number ten space." },
  { selector: ".life-topic-two", section: "life", label: "Reading and play", title: "Books and games", story: "A changing reading pile and playful worlds, from Naval to Hyrule, keep the off-clock map alive." },
  { selector: ".contact-note", section: "contact", label: "Open channel", title: "Bring me the hard problem", story: "For backend systems, reliability, and useful AI work, send a field note or choose the channel that suits you on the Contact board." },
  { selector: ".contact-topic-one", section: "contact", label: "Direct line", title: "Send a note", story: "A few useful details about the problem or opportunity are enough to start a conversation." },
  { selector: ".contact-topic-two", section: "contact", label: "Elsewhere", title: "Code and context", story: "The Contact board keeps Email, GitHub, and LinkedIn visible together, with direct links for each." },
];

function dive(section: ChitStory["section"]) {
  document.querySelector<HTMLAnchorElement>(`.board-zone-${section}`)?.click();
}

export function HeroChitExperience() {
  const [active, setActive] = useState<ChitStory | null>(null);
  const timer = useRef<number | null>(null);
  const trigger = useRef<HTMLElement | null>(null);
  const closeButton = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    const board = document.querySelector<HTMLElement>(".evidence-board");
    if (!board) return;
    const bindings = stories.flatMap((story) => Array.from(board.querySelectorAll<HTMLElement>(story.selector)).map((node) => ({ story, node })));
    const cleanups = bindings.map(({ story, node }) => {
      node.classList.add("hero-chit");
      node.tabIndex = 0;
      node.setAttribute("role", "button");
      node.setAttribute("aria-label", `Unfold ${story.title}; double click to open ${story.section} board`);

      const open = () => { trigger.current = node; setActive(story); };
      const click = (event: MouseEvent) => {
        event.stopPropagation();
        if (event.detail > 1) return;
        if (timer.current !== null) window.clearTimeout(timer.current);
        if (window.matchMedia("(pointer: coarse)").matches) open();
        else timer.current = window.setTimeout(() => { timer.current = null; open(); }, 450);
      };
      const doubleClick = (event: MouseEvent) => {
        event.preventDefault();
        event.stopPropagation();
        if (window.matchMedia("(pointer: coarse)").matches) return;
        if (timer.current !== null) window.clearTimeout(timer.current);
        timer.current = null;
        setActive(null);
        dive(story.section);
      };
      const keyDown = (event: KeyboardEvent) => {
        if (event.key !== "Enter" && event.key !== " ") return;
        event.preventDefault();
        open();
      };
      node.addEventListener("click", click);
      node.addEventListener("dblclick", doubleClick);
      node.addEventListener("keydown", keyDown);
      return () => {
        node.removeEventListener("click", click);
        node.removeEventListener("dblclick", doubleClick);
        node.removeEventListener("keydown", keyDown);
        node.classList.remove("hero-chit");
        node.removeAttribute("role");
        node.removeAttribute("aria-label");
        node.removeAttribute("tabindex");
      };
    });
    return () => { cleanups.forEach((cleanup) => cleanup()); if (timer.current !== null) window.clearTimeout(timer.current); };
  }, []);

  useEffect(() => {
    if (!active) return;
    const focusFrame = requestAnimationFrame(() => closeButton.current?.focus());
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") { setActive(null); requestAnimationFrame(() => trigger.current?.focus({ preventScroll: true })); }
      if (event.key === "Tab") {
        const dialog = closeButton.current?.closest<HTMLElement>("[role='dialog']");
        const focusable = Array.from(dialog?.querySelectorAll<HTMLElement>("button,a[href]") ?? []);
        if (!focusable.length) return;
        const first = focusable[0]; const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => { cancelAnimationFrame(focusFrame); window.removeEventListener("keydown", onKey); };
  }, [active]);

  const close = () => { setActive(null); requestAnimationFrame(() => trigger.current?.focus({ preventScroll: true })); };
  if (!active || typeof document === "undefined") return null;
  return createPortal(<div className="hero-chit-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) close(); }}>
    <section className="hero-chit-detail" role="dialog" aria-modal="true" aria-labelledby="hero-chit-detail-title" aria-describedby="hero-chit-detail-copy">
      <span className="hero-detail-tape" aria-hidden="true" /><span className="hero-detail-fold" aria-hidden="true" />
      <button ref={closeButton} type="button" className="hero-detail-close" onClick={close} aria-label="Fold this note">×</button>
      <small>{active.label}</small>
      <h2 id="hero-chit-detail-title">{active.title}</h2>
      <p id="hero-chit-detail-copy">{active.story}</p>
      <div className="hero-detail-actions">
        <a href={`#${active.section}-board`} onClick={(event) => { event.preventDefault(); setActive(null); dive(active.section); }}>Explore this board <span aria-hidden="true">↗</span></a>
        {active.proof && <a className="hero-detail-proof" href={active.proof.href} target="_blank" rel="noopener noreferrer">{active.proof.label} ↗</a>}
      </div>
      <span className="hero-detail-scribble" aria-hidden="true">↳ follow the thread</span>
    </section>
  </div>, document.body);
}
