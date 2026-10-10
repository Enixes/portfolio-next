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
            const timer = entranceTimers.get(card);
            if (timer !== undefined) window.clearTimeout(timer);
            entranceTimers.delete(card);
          } else if (!played.has(card)) {
            card.classList.add("is-drawing"); played.add(card);
            entranceTimers.set(card, window.setTimeout(() => {
              card.classList.remove("is-drawing"); entranceTimers.delete(card);
            }, 1750));
          }
        });
      } else {
        cards.forEach((card) => card.classList.remove("is-drawing"));
        entranceTimers.forEach((timer) => window.clearTimeout(timer));
        entranceTimers.clear();
        played.clear();
      }
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
        else visibleCards.delete(card);
      });
      refreshActive();
    }, { root: board, threshold: .16 });
    cards.forEach((card) => cardObserver.observe(card));
    const panelObserver = new MutationObserver(refreshActive);
    panelObserver.observe(panel, { attributes: true, attributeFilter: ["aria-hidden", "style"] });
    document.addEventListener("visibilitychange", refreshActive);
    reduced.addEventListener("change", refreshActive);
    refreshActive();
    return () => {
      disposed = true;
      resize.disconnect(); sceneObserver.disconnect(); cardObserver.disconnect(); panelObserver.disconnect();
      document.removeEventListener("visibilitychange", refreshActive);
      reduced.removeEventListener("change", refreshActive);
      entranceTimers.forEach((timer) => window.clearTimeout(timer));
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
      <small>01 / Skills · the tool bench</small>
      <h3 id="work-skills-title">What’s on the bench.</h3>
      <p>Eight clusters, one working kit. Skills marked ↗ lead to a case; the others open a note here on the bench.</p>
    </header>
    <div className="work-skill-scene" ref={sceneRef} data-active={active}>
      <svg className="work-skill-cable" aria-hidden="true" focusable="false"><path d={cable} pathLength="1" /></svg>
      {tracePath && <svg key={trace?.serial} className="work-skill-route" aria-hidden="true" focusable="false"><path d={tracePath} pathLength="1" /></svg>}
      <div className="work-skill-grid">
        {systemsSkillClusters.map((cluster, index) => <article className={`work-skill-paper tone-${cluster.tone}`} key={cluster.id}>
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
              onClick={(event) => selectSkill(cluster, item, event.currentTarget)}>{item}{systemsSkillEvidence[item] && <span aria-hidden="true">↗</span>}</button>
          </li>)}</ul>
          {annotation?.clusterId === cluster.id && <div id={`work-toolkit-note-${cluster.id}`} className="work-skill-annotation" role="status">
            <span className="work-skill-annotation-mark" aria-hidden="true">✳</span>
            <p><strong>{annotation.skill}</strong> / {toolkitNotes[cluster.category]}</p>
          </div>}
          <p className="work-skill-aside">{cluster.aside}</p>
        </article>)}
      </div>
      <span className="work-skill-cable-note" aria-hidden="true">next: the proof →</span>
    </div>
  </section>;
}
