"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

type BoardKind = "profile" | "work" | "blog" | "life" | "contact";
type Target = { kind: BoardKind; surface: HTMLElement };
type Box = { left: number; top: number; right: number; bottom: number; width: number; height: number };

const boardSpecs = [
  ["profile", "profile-board-story-title"],
  ["work", "work-board-story-title"],
  ["blog", "blog-board-story-title"],
  ["life", "life-board-story-title"],
  ["contact", "contact-board-story-title"],
] as const;

const blockerSelector = [
  ".story-board-index",
  ".story-board-header",
  ".story-case",
  ".story-board-footnote",
  ".profile-live-header",
  ".profile-live-photo",
  ".profile-now-card",
  ".profile-project-card",
  ".profile-mini-chit",
  ".profile-signal",
  ".profile-status-stamp",
  ".profile-pencil",
  ".profile-live-footnote",
  ".work-cv-header",
  ".work-company-chit",
  ".work-evidence-chit",
  ".work-tenure-tag",
  ".work-cv-legend",
  ".work-cv-pencil",
  ".work-cv-footnote",
].join(",");

const styles = `
/* BoardAliveLayer owns marker typography/highlights; its older free-floating SVGs
   stay retired. These are deliberately tiny, collision-aware margin doodles. */
.board-alive-layer > svg,
.board-alive-layer > .alive-marker-note { display:none!important; }

.board-tech-sketch {
  --sketch-ink:#315d72;
  --sketch-accent:#a6312a;
  --wash:#e7c66d;
  position:absolute;
  z-index:4;
  width:110px;
  visibility:hidden;
  pointer-events:none;
  color:var(--sketch-ink);
  font-family:var(--marker,"Marker Felt","Segoe Print","Bradley Hand",cursive);
  mix-blend-mode:multiply;
  opacity:.78;
  transform:rotate(var(--sketch-r,-1.3deg));
  transform-origin:center;
  transition:opacity .18s ease;
}
.board-tech-sketch[data-placed="true"] { visibility:visible; }
.board-tech-sketch svg { display:block; width:100%; height:auto; overflow:visible; }
.tech-line,.tech-line-soft,.tech-accent,.tech-wash,.tech-rough {
  vector-effect:non-scaling-stroke;
  stroke-linecap:round;
  stroke-linejoin:round;
}
.tech-line,.tech-line-soft,.tech-accent,.tech-rough {
  fill:none;
  stroke-dasharray:1;
  stroke-dashoffset:1;
}
.tech-line { stroke:var(--sketch-ink); stroke-width:2.1; opacity:.78; }
.tech-line-soft { stroke:var(--sketch-ink); stroke-width:1.15; opacity:.42; }
.tech-rough { stroke:var(--sketch-ink); stroke-width:.8; opacity:.27; }
.tech-accent { stroke:var(--sketch-accent); stroke-width:1.9; opacity:.72; }
.tech-wash { stroke:none; fill:var(--wash); opacity:0; }
.tech-label {
  fill:#30383b;
  font:800 9px/1 var(--marker,"Marker Felt","Segoe Print","Bradley Hand",cursive);
  letter-spacing:-.025em;
}
.tech-label-small { font-size:7px; opacity:.7; }
.tech-label-red { fill:var(--sketch-accent); }

.tech-profile { --sketch-r:-2deg; --wash:#e6c268; }
.tech-work { --sketch-r:1.7deg; --wash:#d9badb; }
.tech-blog { --sketch-r:-1deg; --wash:#a9d3db; }
.tech-life { --sketch-r:1.8deg; --wash:#d9b06d; }
.tech-contact { --sketch-r:-1.8deg; --wash:#ebce75; }

.scroll-board-panel[style*="opacity: 1"] .board-tech-sketch .tech-line,
.scroll-board-panel[style*="opacity: 1"] .board-tech-sketch .tech-line-soft,
.scroll-board-panel[style*="opacity: 1"] .board-tech-sketch .tech-rough,
.scroll-board-panel[style*="opacity: 1"] .board-tech-sketch .tech-accent {
  animation:tinyDoodleDraw 8.8s cubic-bezier(.2,.72,.22,1) var(--line-delay,0s) infinite;
}
.scroll-board-panel[style*="opacity: 1"] .board-tech-sketch .tech-wash {
  animation:tinyDoodleWash 8.8s cubic-bezier(.2,.72,.22,1) .48s infinite;
}
.board-tech-sketch .tech-line-soft { --line-delay:.18s; }
.board-tech-sketch .tech-rough { --line-delay:.32s; }
.board-tech-sketch .tech-accent { --line-delay:.42s; }

@keyframes tinyDoodleDraw {
  0%,8% { stroke-dashoffset:1; opacity:.02; }
  22%,67% { stroke-dashoffset:0; opacity:.78; }
  79% { stroke-dashoffset:0; opacity:.38; }
  91%,100% { stroke-dashoffset:1; opacity:.02; }
}
@keyframes tinyDoodleWash {
  0%,30% { opacity:0; transform:scale(.78) rotate(-2deg); transform-origin:center; }
  43%,66% { opacity:.11; transform:scale(1) rotate(.6deg); }
  84%,100% { opacity:0; transform:scale(1.03) rotate(1deg); }
}

@media (max-width:760px) {
  .board-tech-sketch { opacity:.64; }
  .tech-label { font-size:8px; }
  .tech-label-small { font-size:6.5px; }
}
@media (prefers-reduced-motion:reduce) {
  .tech-line,.tech-line-soft,.tech-rough,.tech-accent { stroke-dashoffset:0!important; animation:none!important; }
  .tech-wash { opacity:.08!important; animation:none!important; }
}
`;

function CpuSketch() {
  return (
    <div className="board-tech-sketch tech-profile" data-tech-kind="profile" aria-hidden="true">
      <svg viewBox="0 0 210 135">
        <path className="tech-wash" d="M12 16 H196 V112 H12 Z" />
        <path className="tech-line" pathLength="1" d="M18 20 H90 V54 H18 Z M108 20 H190 V54 H108 Z" />
        <path className="tech-line-soft" pathLength="1" d="M25 28 H42 V46 H25 Z M48 28 H64 V46 H48 Z M70 28 H84 V46 H70 Z M116 28 H133 V46 H116 Z M139 28 H156 V46 H139 Z M162 28 H183 V46 H162 Z" />
        <path className="tech-line" pathLength="1" d="M24 67 H84 V85 H24 Z M116 67 H184 V85 H116 Z" />
        <path className="tech-accent" pathLength="1" d="M35 98 H174 V114 H35 Z" />
        <path className="tech-line-soft" pathLength="1" d="M54 54 V67 M149 54 V67 M54 85 V98 M149 85 V98 M174 106 C190 108 194 117 195 128" />
        <path className="tech-rough" pathLength="1" d="M15 15 l14 -7 M89 18 l10 -7 M109 16 l12 -8 M189 17 l12 -5 M31 118 C72 124 132 123 180 118" />
        <text className="tech-label" x="27" y="42">fetch → exec</text>
        <text className="tech-label" x="119" y="42">fetch → exec</text>
        <text className="tech-label-small" x="43" y="80">L1/L2</text>
        <text className="tech-label-small" x="139" y="80">L1/L2</text>
        <text className="tech-label tech-label-red" x="77" y="110">shared L3</text>
        <text className="tech-label-small" x="166" y="132">RAM ↘</text>
      </svg>
    </div>
  );
}

function WorkSketch() {
  return (
    <div className="board-tech-sketch tech-work" data-tech-kind="work" aria-hidden="true">
      <svg viewBox="0 0 210 138">
        <path className="tech-wash" d="M10 46 H49 V76 H10 Z M72 18 H116 V43 H72 Z M72 55 H116 V80 H72 Z M72 92 H116 V117 H72 Z M151 54 H195 V83 H151 Z" />
        <path className="tech-line" pathLength="1" d="M10 46 H49 V76 H10 Z M72 18 H116 V43 H72 Z M72 55 H116 V80 H72 Z M72 92 H116 V117 H72 Z M151 54 H195 V83 H151 Z" />
        <path className="tech-line-soft" pathLength="1" d="M50 61 C60 61 63 31 70 31 M50 61 H70 M50 61 C60 61 63 104 70 104 M118 31 C135 31 137 61 149 67 M118 67 H149 M118 104 C137 103 139 78 149 70" />
        <path className="tech-accent" pathLength="1" d="M173 85 C177 111 147 128 118 116 M124 117 l-9 -3 4 -9" />
        <path className="tech-rough" pathLength="1" d="M8 42 l10 -8 M48 43 l8 -7 M70 16 l10 -7 M194 51 l10 -8 M148 90 c17 12 35 12 47 4" />
        <text className="tech-label" x="17" y="65">queue</text>
        <text className="tech-label-small" x="81" y="35">worker A</text>
        <text className="tech-label-small" x="81" y="72">worker B</text>
        <text className="tech-label-small" x="81" y="109">worker C</text>
        <text className="tech-label tech-label-red" x="162" y="73">DLQ</text>
        <text className="tech-label-small tech-label-red" x="144" y="128">retry ↺</text>
      </svg>
    </div>
  );
}

function CapSketch() {
  return (
    <div className="board-tech-sketch tech-blog" data-tech-kind="blog" aria-hidden="true">
      <svg viewBox="0 0 180 142">
        <path className="tech-wash" d="M89 13 L158 116 L22 116 Z" />
        <path className="tech-line" pathLength="1" d="M89 13 L158 116 L22 116 Z" />
        <path className="tech-line-soft" pathLength="1" d="M89 23 L146 109 M82 23 L34 109 M31 108 H149" />
        <circle className="tech-accent" pathLength="1" cx="89" cy="15" r="10" />
        <circle className="tech-accent" pathLength="1" cx="157" cy="116" r="10" />
        <circle className="tech-accent" pathLength="1" cx="23" cy="116" r="10" />
        <path className="tech-rough" pathLength="1" d="M53 77 C68 85 93 87 112 78 M111 78 l-8 -6 m8 6 l-9 5" />
        <text className="tech-label" x="85" y="19">C</text>
        <text className="tech-label" x="153" y="120">A</text>
        <text className="tech-label" x="19" y="120">P</text>
        <text className="tech-label-small" x="55" y="73">pick two-ish*</text>
        <text className="tech-label-small tech-label-red" x="80" y="138">trade-offs →</text>
      </svg>
    </div>
  );
}

function BuildingSketch() {
  return (
    <div className="board-tech-sketch tech-life" data-tech-kind="life" aria-hidden="true">
      <svg viewBox="0 0 205 150">
        <path className="tech-wash" d="M17 132 L28 52 L55 43 L60 22 L91 15 L95 45 L121 38 L127 59 L158 49 L166 132 Z" />
        <path className="tech-line" pathLength="1" d="M17 132 L28 52 L55 43 L60 22 L91 15 L95 45 L121 38 L127 59 L158 49 L166 132 Z" />
        <path className="tech-line" pathLength="1" d="M28 52 L56 70 L95 45 L127 59 L158 49 M56 70 V132 M95 45 V132 M127 59 V132" />
        <path className="tech-line-soft" pathLength="1" d="M22 112 L56 94 L95 104 L127 89 L164 105 M21 122 L56 104 L95 114 L127 99 L164 116" />
        <path className="tech-rough" pathLength="1" d="M33 62 l-9 53 M45 56 l-8 65 M73 35 l-7 91 M108 48 l-7 78 M143 56 l-5 68" />
        <path className="tech-accent" pathLength="1" d="M173 37 C185 27 195 30 201 39 M181 24 C188 15 196 13 202 15" />
        <text className="tech-label tech-label-red" x="92" y="145">I like drawing too.</text>
      </svg>
    </div>
  );
}

function ContactSketch() {
  return (
    <div className="board-tech-sketch tech-contact" data-tech-kind="contact" aria-hidden="true">
      <svg viewBox="0 0 190 125">
        <circle className="tech-wash" cx="38" cy="44" r="27" />
        <circle className="tech-wash" cx="151" cy="44" r="27" />
        <circle className="tech-line" pathLength="1" cx="38" cy="44" r="25" />
        <circle className="tech-line" pathLength="1" cx="151" cy="44" r="25" />
        <path className="tech-accent" pathLength="1" d="M65 36 C88 25 106 25 126 36 M126 53 C105 64 87 64 65 53" />
        <path className="tech-line-soft" pathLength="1" d="M115 29 l11 7 -10 7 M76 47 l-11 6 10 8" />
        <path className="tech-rough" pathLength="1" d="M38 69 V95 M151 69 V95 M38 95 H151" />
        <text className="tech-label" x="29" y="48">you</text>
        <text className="tech-label" x="142" y="48">me</text>
        <text className="tech-label-small tech-label-red" x="62" y="115">context → signal</text>
      </svg>
    </div>
  );
}

function Sketch({ kind }: { kind: BoardKind }) {
  if (kind === "profile") return <CpuSketch />;
  if (kind === "work") return <WorkSketch />;
  if (kind === "blog") return <CapSketch />;
  if (kind === "life") return <BuildingSketch />;
  return <ContactSketch />;
}

function overlaps(a: Box, b: Box, gap: number) {
  return !(
    a.right + gap <= b.left ||
    a.left >= b.right + gap ||
    a.bottom + gap <= b.top ||
    a.top >= b.bottom + gap
  );
}

function distanceBetween(a: Box, b: Box) {
  const dx = Math.max(b.left - a.right, a.left - b.right, 0);
  const dy = Math.max(b.top - a.bottom, a.top - b.bottom, 0);
  return Math.hypot(dx, dy);
}

function localBox(node: HTMLElement, surfaceRect: DOMRect, scaleX: number, scaleY: number): Box {
  const rect = node.getBoundingClientRect();
  const left = (rect.left - surfaceRect.left) / scaleX;
  const top = (rect.top - surfaceRect.top) / scaleY;
  const width = rect.width / scaleX;
  const height = rect.height / scaleY;
  return { left, top, right: left + width, bottom: top + height, width, height };
}

function placeSketch(surface: HTMLElement, sketch: HTMLElement) {
  const surfaceRect = surface.getBoundingClientRect();
  if (surface.clientWidth < 40 || surfaceRect.width < 20) return;

  const scaleX = surfaceRect.width / Math.max(1, surface.clientWidth);
  const scaleY = surfaceRect.height / Math.max(1, surface.clientHeight);
  const containerWidth = surface.clientWidth;
  const containerHeight = Math.max(surface.clientHeight, surface.scrollHeight);
  const mobile = window.innerWidth <= 760;
  const kind = sketch.dataset.techKind ?? "profile";

  const baseRatio = kind === "life" ? (mobile ? .19 : .125) : (mobile ? .17 : .105);
  const baseMin = mobile ? 54 : 78;
  const baseMax = kind === "life" ? (mobile ? 78 : 142) : (mobile ? 72 : 124);
  const baseWidth = Math.min(baseMax, Math.max(baseMin, containerWidth * baseRatio));
  const gap = mobile ? 7 : 11;
  const edge = mobile ? 8 : 12;

  const blockers = Array.from(surface.querySelectorAll<HTMLElement>(blockerSelector))
    .filter((node) => node !== sketch && !sketch.contains(node) && node.getBoundingClientRect().width > 3)
    .map((node) => localBox(node, surfaceRect, scaleX, scaleY));

  sketch.dataset.placed = "false";
  sketch.style.visibility = "hidden";
  sketch.style.left = "0px";
  sketch.style.top = "0px";

  const widthScales = mobile ? [1, .88, .76, .66] : [1, .9, .8, .7];
  let best: { left: number; top: number; width: number; score: number } | null = null;

  for (const widthScale of widthScales) {
    const width = Math.round(baseWidth * widthScale);
    sketch.style.width = `${width}px`;
    const measured = sketch.getBoundingClientRect();
    const height = Math.max(34, measured.height / Math.max(scaleY, .001));
    const maxLeft = Math.max(edge, containerWidth - width - edge);
    const maxTop = Math.max(edge, containerHeight - height - edge);
    const xStep = Math.max(24, Math.round(width * .46));
    const yStep = Math.max(22, Math.round(height * .44));

    for (let top = edge; top <= maxTop; top += yStep) {
      for (let left = edge; left <= maxLeft; left += xStep) {
        const candidate: Box = { left, top, right: left + width, bottom: top + height, width, height };
        if (blockers.some((blocker) => overlaps(candidate, blocker, gap))) continue;

        const clearance = blockers.length
          ? Math.min(...blockers.map((blocker) => distanceBetween(candidate, blocker)))
          : 100;
        const edgeDistance = Math.min(left, top, containerWidth - candidate.right, containerHeight - candidate.bottom);
        const verticalPenalty = top > containerHeight * .86 ? 10 : 0;
        const centerPenalty = Math.abs((left + width / 2) - containerWidth / 2) < containerWidth * .12 ? 5 : 0;
        const score = clearance - edgeDistance * .08 - verticalPenalty - centerPenalty + widthScale * 3;

        if (!best || score > best.score) best = { left, top, width, score };
      }
    }

    if (best) break;
  }

  if (!best) {
    sketch.style.display = "none";
    return;
  }

  sketch.style.removeProperty("display");
  sketch.style.width = `${best.width}px`;
  sketch.style.left = `${Math.round(best.left)}px`;
  sketch.style.top = `${Math.round(best.top)}px`;
  sketch.dataset.placed = "true";
  sketch.style.visibility = "visible";
}

export function BoardTechnicalSketches() {
  const [targets, setTargets] = useState<Target[]>([]);

  useEffect(() => {
    const discover = () => {
      setTargets(
        boardSpecs.flatMap(([kind, id]) => {
          const title = document.getElementById(id);
          const surface = title?.closest<HTMLElement>(".story-board-surface") ?? null;
          return surface ? [{ kind: kind as BoardKind, surface }] : [];
        }),
      );
    };

    discover();
    const frame = requestAnimationFrame(discover);
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    let frame = 0;
    let settle = 0;

    const layout = () => {
      targets.forEach(({ surface }) => {
        const sketch = surface.querySelector<HTMLElement>(".board-tech-sketch");
        if (sketch) placeSketch(surface, sketch);
      });
    };

    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => requestAnimationFrame(layout));
      window.clearTimeout(settle);
      settle = window.setTimeout(layout, 450);
    };

    schedule();
    window.addEventListener("resize", schedule, { passive: true });
    const observer = new MutationObserver(schedule);
    targets.forEach(({ surface }) => observer.observe(surface, { childList: true, subtree: true }));

    return () => {
      window.removeEventListener("resize", schedule);
      observer.disconnect();
      cancelAnimationFrame(frame);
      window.clearTimeout(settle);
    };
  }, [targets]);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      {targets.map(({ kind, surface }) =>
        createPortal(<Sketch kind={kind} />, surface, `technical-${kind}`),
      )}
    </>
  );
}
