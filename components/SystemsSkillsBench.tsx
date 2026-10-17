"use client";

import { useEffect, useRef, useState } from "react";
import { systemsSkillClusters, systemsSkillEvidence, type SystemsSkillCluster } from "@/data/systems-skills";
import { SystemsSkillScene } from "./SystemsSkillScene";

export type SkillFollowRequest = {
  caseId: string;
  skill: string;
  tone: SystemsSkillCluster["tone"];
  origin: HTMLButtonElement;
};

const toolkitNotes: Record<string, string> = {
  Languages: "Early projects and production tooling kept the language palette broad.",
  "Backend & APIs": "Service boundaries and a Django delivery tool are part of this chapter.",
  "Systems & Reliability": "This cluster grew around live workflow failure paths and recovery.",
  "Data & Observability": "These tools help turn noisy production signals into decisions.",
  "AI & Agentic": "Published optimisation work and current assistant experiments share this corner.",
  "Engineering Practice": "Repeatable tests and delivery pipelines keep the work shippable.",
  "Client Delivery": "Requirements and communication matter as much as the implementation.",
  "Current experiments": "The experiments here are still being measured and revised.",
};

const casePreviews: Record<string, string> = {
  throughput: "20× trade throughput", cache: "50× supported workflows",
  recovery: "90% less downtime", alazium: "30% faster triage",
  database: "95% database uplift", ci: "40% faster CI",
  holisol: "Holisol run sheet", tailcache: "TailCache study",
  hsgo: "Published feature-selection research", mining: "Illegal Mining Detector",
};

export function SystemsSkillsBench({ onFollow, onAnnotation, trace }: {
  onFollow: (request: SkillFollowRequest) => void;
  onAnnotation: () => void;
  trace: { skill: string; serial: number } | null;
}) {
  const sceneRef = useRef<HTMLDivElement>(null);
  const annotationOrigin = useRef<HTMLButtonElement | null>(null);
  const [cable, setCable] = useState("");
  const [tracePath, setTracePath] = useState("");
  const [annotation, setAnnotation] = useState<{ clusterId: string; skill: string } | null>(null);
  const [preview, setPreview] = useState<{ clusterId: string; skill: string } | null>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (!annotation) return;
    const onEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || !sceneRef.current?.contains(document.activeElement)) return;
      setAnnotation(null);
      annotationOrigin.current?.focus({ preventScroll: true });
    };
    window.addEventListener("keydown", onEscape);
    return () => window.removeEventListener("keydown", onEscape);
  }, [annotation]);

  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;
    const cards = Array.from(scene.querySelectorAll<HTMLElement>(".work-skill-paper"));
    const board = scene.closest<HTMLElement>(".work-cv-board");
    const panel = scene.closest<HTMLElement>("[data-board-panel]");
    if (!board || !panel) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const visibleCards = new Set<HTMLElement>();
    const played = new Set<HTMLElement>();
    const entranceTimers = new Map<HTMLElement, number>();
    const reactionTimers = new Map<HTMLElement, number>();
    let sceneIntersects = false;
    let frame = 0;
    let disposed = false;
    const measure = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const area = scene.getBoundingClientRect();
        const points = cards.map((card) => {
          const rect = card.getBoundingClientRect();
          return { x: rect.left - area.left + Math.min(35, rect.width * .13), y: rect.top - area.top + 5 };
        });
        if (!points.length) return;
        const narrow = area.width < 580;
        if (narrow) {
          let path = `M8 ${Math.max(0, points[0].y - 35)}`;
          points.forEach((point, index) => {
            path += ` C8 ${point.y - 8},${point.x - 21} ${point.y - 10},${point.x} ${point.y}`;
            if (index < points.length - 1) path += ` C${point.x - 20} ${point.y + 17},8 ${point.y + 12},8 ${points[index + 1].y - 35}`;
          });
          const last = points.at(-1)!;
          setCable(`${path} C${last.x + 25} ${last.y + 22},${area.width - 40} ${area.height - 24},${area.width - 18} ${area.height - 14}`);
        } else {
          let path = `M${Math.max(8, points[0].x - 52)} ${points[0].y - 31} Q${points[0].x - 26} ${points[0].y - 10},${points[0].x} ${points[0].y}`;
          points.slice(1).forEach((point, index) => {
            const previous = points[index];
            const middle = (previous.x + point.x) / 2;
            path += ` C${middle} ${previous.y + 30},${middle} ${point.y - 35},${point.x} ${point.y}`;
          });
          const last = points.at(-1)!;
          setCable(`${path} C${last.x + 38} ${last.y + 32},${area.width - 42} ${area.height - 30},${area.width - 18} ${area.height - 14}`);
        }
      });
    };
    const scheduleAmbient = () => {
      const focused = document.activeElement instanceof HTMLElement
        ? document.activeElement.closest<HTMLElement>(".work-skill-paper") : null;
      const hovered = scene.querySelector<HTMLElement>(".work-skill-paper:hover");
      const middle = board.getBoundingClientRect().top + board.clientHeight * .5;
      const selected = !document.hidden && !reduced.matches && sceneIntersects &&
        panel.getAttribute("aria-hidden") === "false" && panel.style.pointerEvents === "auto"
        ? Array.from(visibleCards).filter((card) => !card.classList.contains("is-drawing"))
          .sort((a, b) => {
            const rank = (card: HTMLElement) => card === focused ? 0 : card === hovered ? 1 : 2;
            return rank(a) - rank(b) ||
              Math.abs(a.getBoundingClientRect().top - middle) - Math.abs(b.getBoundingClientRect().top - middle);
          }).slice(0, 2) : [];
      cards.forEach((card) => card.classList.toggle("is-ambient", selected.includes(card)));
    };
    const refreshActive = () => {
      const next = !document.hidden && panel.getAttribute("aria-hidden") === "false" &&
        panel.style.pointerEvents === "auto" && panel.style.visibility !== "hidden";
      setActive(next);
      scene.classList.toggle("is-board-active", next);
      scene.classList.toggle("is-in-view", next && sceneIntersects);
      if (next && !reduced.matches) {
        cards.forEach((card) => {
          if (!visibleCards.has(card)) {
            card.classList.remove("is-drawing");
            card.classList.remove("is-reacting");
            const reaction = reactionTimers.get(card);
            if (reaction !== undefined) window.clearTimeout(reaction);
            reactionTimers.delete(card);
            const timer = entranceTimers.get(card);
            if (timer !== undefined) window.clearTimeout(timer);
            entranceTimers.delete(card);
          } else if (!played.has(card)) {
            card.classList.add("is-drawing"); played.add(card);
            entranceTimers.set(card, window.setTimeout(() => {
              card.classList.remove("is-drawing"); entranceTimers.delete(card); scheduleAmbient();
            }, 1750));
          }
        });
      } else {
        cards.forEach((card) => card.classList.remove("is-drawing"));
        entranceTimers.forEach((timer) => window.clearTimeout(timer));
        entranceTimers.clear();
        played.clear();
        reactionTimers.forEach((timer) => window.clearTimeout(timer));
        reactionTimers.clear();
        cards.forEach((card) => card.classList.remove("is-reacting"));
      }
      scheduleAmbient();
    };
    const reactTo = (event: Event) => {
      if (document.hidden || reduced.matches || !sceneIntersects || panel.getAttribute("aria-hidden") !== "false") return;
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;
      const card = target.closest<HTMLElement>(".work-skill-paper");
      if (!card || !visibleCards.has(card)) return;
      if (event instanceof PointerEvent && event.relatedTarget instanceof Element &&
        event.relatedTarget.closest(".work-skill-tag") === target.closest(".work-skill-tag")) return;
      const previous = reactionTimers.get(card);
      if (previous !== undefined) window.clearTimeout(previous);
      card.classList.remove("is-reacting");
      void card.offsetWidth;
      card.classList.add("is-reacting");
      reactionTimers.set(card, window.setTimeout(() => {
        card.classList.remove("is-reacting"); reactionTimers.delete(card);
      }, 900));
      scheduleAmbient();
    };
    const resize = new ResizeObserver(measure);
    [scene, ...cards].forEach((element) => resize.observe(element));
    measure();
    void document.fonts.ready.then(() => { if (!disposed) measure(); });
    const sceneObserver = new IntersectionObserver(([entry]) => {
      sceneIntersects = entry.isIntersecting;
      refreshActive();
    }, { root: board, threshold: .05 });
    sceneObserver.observe(scene);
    const cardObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const card = entry.target as HTMLElement;
        if (entry.isIntersecting) visibleCards.add(card);
        else {
          visibleCards.delete(card);
          card.classList.remove("is-reacting");
          const timer = reactionTimers.get(card);
          if (timer !== undefined) window.clearTimeout(timer);
          reactionTimers.delete(card);
        }
      });
      refreshActive();
    }, { root: board, threshold: .16 });
    cards.forEach((card) => cardObserver.observe(card));
    const panelObserver = new MutationObserver(refreshActive);
    panelObserver.observe(panel, { attributes: true, attributeFilter: ["aria-hidden", "style"] });
    document.addEventListener("visibilitychange", refreshActive);
    reduced.addEventListener("change", refreshActive);
    scene.addEventListener("pointerover", reactTo);
    scene.addEventListener("focusin", reactTo);
    scene.addEventListener("pointerout", scheduleAmbient);
    scene.addEventListener("focusout", scheduleAmbient);
    refreshActive();
    return () => {
      disposed = true;
      resize.disconnect(); sceneObserver.disconnect(); cardObserver.disconnect(); panelObserver.disconnect();
      document.removeEventListener("visibilitychange", refreshActive);
      reduced.removeEventListener("change", refreshActive);
      scene.removeEventListener("pointerover", reactTo);
      scene.removeEventListener("focusin", reactTo);
      scene.removeEventListener("pointerout", scheduleAmbient);
      scene.removeEventListener("focusout", scheduleAmbient);
      entranceTimers.forEach((timer) => window.clearTimeout(timer));
      reactionTimers.forEach((timer) => window.clearTimeout(timer));
      cancelAnimationFrame(frame);
    };
  }, []);

  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene || !trace) { setTracePath(""); return; }
    const button = Array.from(scene.querySelectorAll<HTMLButtonElement>(".work-skill-tag"))
      .find((item) => item.dataset.skill === trace.skill);
    if (!button) return;
    const area = scene.getBoundingClientRect();
    const rect = button.getBoundingClientRect();
    const x = rect.left - area.left + rect.width * .5;
    const y = rect.top - area.top + rect.height * .5;
    const elbow = area.width < 580 ? 11 : Math.min(area.width - 25, x + 75);
    setTracePath(`M${x} ${y} C${x + 28} ${y - 16},${elbow} ${y + 27},${elbow} ${y + 48} C${elbow} ${y + 96},${area.width - 38} ${area.height - 34},${area.width - 18} ${area.height - 14}`);
  }, [trace]);

  const selectSkill = (cluster: SystemsSkillCluster, skill: string, origin: HTMLButtonElement) => {
    const caseId = systemsSkillEvidence[skill];
    if (caseId) {
      setAnnotation(null);
      onFollow({ caseId, skill, tone: cluster.tone, origin });
    } else {
      onAnnotation();
      annotationOrigin.current = origin;
      setAnnotation((current) => current?.clusterId === cluster.id && current.skill === skill
        ? null : { clusterId: cluster.id, skill });
    }
  };

  return <section className="work-section work-skills-section" aria-labelledby="work-skills-title">
    <header className="work-section-heading work-skills-heading">
      <small>02 / Skills · the tool bench</small>
      <h3 id="work-skills-title">What’s on the bench.</h3>
      <p>Eight illustrated workbenches, one working kit. Skills marked ↗ lead back to an experience case or onward to a public project; the others open a note here.</p>
    </header>
    <div className="work-skill-scene" ref={sceneRef} data-active={active}>
      <svg className="work-skill-cable" aria-hidden="true" focusable="false"><path d={cable} pathLength="1" /></svg>
      {tracePath && <svg key={trace?.serial} className="work-skill-route" aria-hidden="true" focusable="false"><path d={tracePath} pathLength="1" /></svg>}
      <div className="work-skill-grid">
        {systemsSkillClusters.map((cluster, index) => {
          const featured = preview?.clusterId === cluster.id ? preview.skill : null;
          const destination = featured ? systemsSkillEvidence[featured] : null;
          const selectedNote = annotation?.clusterId === cluster.id ? annotation.skill : null;
          const localNote = selectedNote && (!featured || featured === selectedNote) ? selectedNote : null;
          return <article className={`work-skill-paper tone-${cluster.tone}`} key={cluster.id}
            onPointerLeave={(event) => {
              if (!event.currentTarget.contains(document.activeElement)) setPreview(null);
            }}>
          <span className="work-skill-pin" aria-hidden="true" />
          <small className="work-skill-index">{String(index + 1).padStart(2, "0")} / TOOLKIT</small>
          <h4>{cluster.category}</h4>
          <SystemsSkillScene motif={cluster.motif} />
          <ul aria-label={`${cluster.category} skills`}>{cluster.items.map((item) => <li key={item}>
            <button className={`work-skill-tag${systemsSkillEvidence[item] ? " has-evidence" : ""}`} type="button" data-skill={item}
              aria-label={systemsSkillEvidence[item] ? `Trace ${item} to a Systems case` : `Read toolkit note for ${item}`}
              aria-expanded={systemsSkillEvidence[item] ? undefined : annotation?.clusterId === cluster.id && annotation.skill === item}
              aria-controls={!systemsSkillEvidence[item] && annotation?.clusterId === cluster.id && annotation.skill === item
                ? `work-toolkit-note-${cluster.id}` : undefined}
              onPointerEnter={() => setPreview({ clusterId: cluster.id, skill: item })}
              onFocus={() => setPreview({ clusterId: cluster.id, skill: item })}
              onClick={(event) => selectSkill(cluster, item, event.currentTarget)}>{item}{systemsSkillEvidence[item] && <span aria-hidden="true">↗</span>}</button>
          </li>)}</ul>
          <div id={`work-toolkit-note-${cluster.id}`} className="work-skill-caption" role={localNote ? "status" : undefined}>
            <span className="work-skill-caption-mark" aria-hidden="true">{localNote ? "✳" : destination ? "↗" : "·"}</span>
            <span>{localNote ? <><strong>{localNote}</strong> / {toolkitNotes[cluster.category]}</> : featured ?
              destination ? <><strong>{featured}</strong> / Open {casePreviews[destination]}</> :
              <><strong>{featured}</strong> / Open a toolkit note here.</> :
              "Select a skill to follow its case or read a toolkit note."}</span>
          </div>
          <p className="work-skill-aside">{cluster.aside}</p>
        </article>; })}
      </div>
      <span className="work-skill-cable-note" aria-hidden="true">next: inspectable work →</span>
    </div>
  </section>;
}
