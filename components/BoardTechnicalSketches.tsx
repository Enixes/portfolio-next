"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

type BoardKind = "profile" | "work" | "blog" | "life" | "contact";
type Target = { kind: BoardKind; surface: HTMLElement };
type Box = { left: number; top: number; right: number; bottom: number; width: number; height: number };
type Placement = { left: number; top: number; width: number; score: number };

const boardSpecs = [
  ["profile", "profile-board-story-title"],
  ["work", "work-board-story-title"],
  ["blog", "blog-board-story-title"],
  ["life", "life-board-story-title"],
  ["contact", "contact-board-story-title"],
] as const;

const blockerSelector = [
  ".story-board-index", ".story-board-header", ".story-case", ".story-board-footnote",
  ".profile-live-header", ".profile-live-photo", ".profile-now-card", ".profile-project-card",
  ".profile-mini-chit", ".profile-signal", ".profile-status-stamp", ".profile-pencil", ".profile-live-footnote",
  ".work-cv-header", ".work-company-chit", ".work-evidence-chit", ".work-tenure-tag",
  ".work-cv-legend", ".work-cv-pencil", ".work-cv-footnote",
].join(",");

const styles = `
.board-alive-layer > svg,.board-alive-layer > .alive-marker-note{display:none!important}
.board-tech-sketch{--sketch-ink:#315d72;--sketch-accent:#a6312a;--wash:#e7c66d;position:absolute;z-index:4;width:100px;visibility:hidden;pointer-events:none;font-family:var(--marker,"Marker Felt","Segoe Print","Bradley Hand",cursive);mix-blend-mode:multiply;opacity:.76;transform:rotate(var(--sketch-r,-1.3deg));transform-origin:center}
.board-tech-sketch[data-placed="true"]{visibility:visible}.board-tech-sketch svg{display:block;width:100%;height:auto;overflow:visible}
.tech-line,.tech-line-soft,.tech-accent,.tech-rough{fill:none;vector-effect:non-scaling-stroke;stroke-linecap:round;stroke-linejoin:round;stroke-dasharray:1;stroke-dashoffset:1}
.tech-line{stroke:var(--sketch-ink);stroke-width:2;opacity:.78}.tech-line-soft{stroke:var(--sketch-ink);stroke-width:1.1;opacity:.42}.tech-rough{stroke:var(--sketch-ink);stroke-width:.8;opacity:.27}.tech-accent{stroke:var(--sketch-accent);stroke-width:1.8;opacity:.72}.tech-wash{stroke:none;fill:var(--wash);opacity:0;vector-effect:non-scaling-stroke}
.tech-label{fill:#30383b;font:800 9px/1 var(--marker,"Marker Felt","Segoe Print","Bradley Hand",cursive);letter-spacing:-.025em}.tech-label-small{font-size:7px;opacity:.7}.tech-label-red{fill:var(--sketch-accent)}
.tech-profile{--sketch-r:-2deg;--wash:#e6c268}.tech-work{--sketch-r:1.7deg;--wash:#d9badb}.tech-blog{--sketch-r:-1deg;--wash:#a9d3db}.tech-life{--sketch-r:1.8deg;--wash:#d9b06d}.tech-contact{--sketch-r:-1.8deg;--wash:#ebce75}
.scroll-board-panel[style*="opacity: 1"] .tech-line,.scroll-board-panel[style*="opacity: 1"] .tech-line-soft,.scroll-board-panel[style*="opacity: 1"] .tech-rough,.scroll-board-panel[style*="opacity: 1"] .tech-accent{animation:tinyDoodleDraw 8.8s cubic-bezier(.2,.72,.22,1) var(--line-delay,0s) infinite}
.scroll-board-panel[style*="opacity: 1"] .tech-wash{animation:tinyDoodleWash 8.8s cubic-bezier(.2,.72,.22,1) .48s infinite}.tech-line-soft{--line-delay:.18s}.tech-rough{--line-delay:.32s}.tech-accent{--line-delay:.42s}
@keyframes tinyDoodleDraw{0%,8%{stroke-dashoffset:1;opacity:.02}22%,67%{stroke-dashoffset:0;opacity:.78}79%{stroke-dashoffset:0;opacity:.38}91%,100%{stroke-dashoffset:1;opacity:.02}}
@keyframes tinyDoodleWash{0%,30%{opacity:0;transform:scale(.78) rotate(-2deg);transform-origin:center}43%,66%{opacity:.1;transform:scale(1) rotate(.6deg)}84%,100%{opacity:0;transform:scale(1.03) rotate(1deg)}}
@media(max-width:760px){.board-tech-sketch{opacity:.62}.tech-label{font-size:8px}.tech-label-small{font-size:6.5px}}
@media(prefers-reduced-motion:reduce){.tech-line,.tech-line-soft,.tech-rough,.tech-accent{stroke-dashoffset:0!important;animation:none!important}.tech-wash{opacity:.07!important;animation:none!important}}
`;

function CpuSketch() {
  return <div className="board-tech-sketch tech-profile" data-tech-kind="profile" aria-hidden="true"><svg viewBox="0 0 210 135">
    <path className="tech-wash" d="M12 16H196V112H12Z"/><path className="tech-line" pathLength="1" d="M18 20H90V54H18Z M108 20H190V54H108Z"/>
    <path className="tech-line-soft" pathLength="1" d="M25 28H42V46H25Z M48 28H64V46H48Z M70 28H84V46H70Z M116 28H133V46H116Z M139 28H156V46H139Z M162 28H183V46H162Z"/>
    <path className="tech-line" pathLength="1" d="M24 67H84V85H24Z M116 67H184V85H116Z"/><path className="tech-accent" pathLength="1" d="M35 98H174V114H35Z"/>
    <path className="tech-line-soft" pathLength="1" d="M54 54V67 M149 54V67 M54 85V98 M149 85V98 M174 106C190 108 194 117 195 128"/>
    <path className="tech-rough" pathLength="1" d="M15 15l14-7 M89 18l10-7 M109 16l12-8 M189 17l12-5 M31 118C72 124 132 123 180 118"/>
    <text className="tech-label" x="27" y="42">fetch → exec</text><text className="tech-label" x="119" y="42">fetch → exec</text><text className="tech-label-small" x="43" y="80">L1/L2</text><text className="tech-label-small" x="139" y="80">L1/L2</text><text className="tech-label tech-label-red" x="77" y="110">shared L3</text><text className="tech-label-small" x="166" y="132">RAM ↘</text>
  </svg></div>;
}

function WorkSketch() {
  return <div className="board-tech-sketch tech-work" data-tech-kind="work" aria-hidden="true"><svg viewBox="0 0 210 138">
    <path className="tech-wash" d="M10 46H49V76H10Z M72 18H116V43H72Z M72 55H116V80H72Z M72 92H116V117H72Z M151 54H195V83H151Z"/>
    <path className="tech-line" pathLength="1" d="M10 46H49V76H10Z M72 18H116V43H72Z M72 55H116V80H72Z M72 92H116V117H72Z M151 54H195V83H151Z"/>
    <path className="tech-line-soft" pathLength="1" d="M50 61C60 61 63 31 70 31 M50 61H70 M50 61C60 61 63 104 70 104 M118 31C135 31 137 61 149 67 M118 67H149 M118 104C137 103 139 78 149 70"/>
    <path className="tech-accent" pathLength="1" d="M173 85C177 111 147 128 118 116 M124 117l-9-3 4-9"/><path className="tech-rough" pathLength="1" d="M8 42l10-8 M48 43l8-7 M70 16l10-7 M194 51l10-8 M148 90c17 12 35 12 47 4"/>
    <text className="tech-label" x="17" y="65">queue</text><text className="tech-label-small" x="81" y="35">worker A</text><text className="tech-label-small" x="81" y="72">worker B</text><text className="tech-label-small" x="81" y="109">worker C</text><text className="tech-label tech-label-red" x="162" y="73">DLQ</text><text className="tech-label-small tech-label-red" x="144" y="128">retry ↺</text>
  </svg></div>;
}

function CapSketch() {
  return <div className="board-tech-sketch tech-blog" data-tech-kind="blog" aria-hidden="true"><svg viewBox="0 0 180 142">
    <path className="tech-wash" d="M89 13L158 116L22 116Z"/><path className="tech-line" pathLength="1" d="M89 13L158 116L22 116Z"/><path className="tech-line-soft" pathLength="1" d="M89 23L146 109 M82 23L34 109 M31 108H149"/>
    <circle className="tech-accent" pathLength="1" cx="89" cy="15" r="10"/><circle className="tech-accent" pathLength="1" cx="157" cy="116" r="10"/><circle className="tech-accent" pathLength="1" cx="23" cy="116" r="10"/><path className="tech-rough" pathLength="1" d="M53 77C68 85 93 87 112 78 M111 78l-8-6 m8 6l-9 5"/>
    <text className="tech-label" x="85" y="19">C</text><text className="tech-label" x="153" y="120">A</text><text className="tech-label" x="19" y="120">P</text><text className="tech-label-small" x="55" y="73">trade-offs</text><text className="tech-label-small tech-label-red" x="80" y="138">nothing free →</text>
  </svg></div>;
}

function BuildingSketch() {
  return <div className="board-tech-sketch tech-life" data-tech-kind="life" aria-hidden="true"><svg viewBox="0 0 205 150">
    <path className="tech-wash" d="M17 132L28 52L55 43L60 22L91 15L95 45L121 38L127 59L158 49L166 132Z"/><path className="tech-line" pathLength="1" d="M17 132L28 52L55 43L60 22L91 15L95 45L121 38L127 59L158 49L166 132Z"/><path className="tech-line" pathLength="1" d="M28 52L56 70L95 45L127 59L158 49 M56 70V132 M95 45V132 M127 59V132"/>
    <path className="tech-line-soft" pathLength="1" d="M22 112L56 94L95 104L127 89L164 105 M21 122L56 104L95 114L127 99L164 116"/><path className="tech-rough" pathLength="1" d="M33 62l-9 53 M45 56l-8 65 M73 35l-7 91 M108 48l-7 78 M143 56l-5 68"/><path className="tech-accent" pathLength="1" d="M173 37C185 27 195 30 201 39 M181 24C188 15 196 13 202 15"/><text className="tech-label tech-label-red" x="92" y="145">I like drawing too.</text>
  </svg></div>;
}

function ContactSketch() {
  return <div className="board-tech-sketch tech-contact" data-tech-kind="contact" aria-hidden="true"><svg viewBox="0 0 190 125">
    <circle className="tech-wash" cx="38" cy="44" r="27"/><circle className="tech-wash" cx="151" cy="44" r="27"/><circle className="tech-line" pathLength="1" cx="38" cy="44" r="25"/><circle className="tech-line" pathLength="1" cx="151" cy="44" r="25"/>
    <path className="tech-accent" pathLength="1" d="M65 36C88 25 106 25 126 36 M126 53C105 64 87 64 65 53"/><path className="tech-line-soft" pathLength="1" d="M115 29l11 7-10 7 M76 47l-11 6 10 8"/><path className="tech-rough" pathLength="1" d="M38 69V95 M151 69V95 M38 95H151"/>
    <text className="tech-label" x="29" y="48">you</text><text className="tech-label" x="142" y="48">me</text><text className="tech-label-small tech-label-red" x="62" y="115">context → signal</text>
  </svg></div>;
}

function Sketch({ kind }: { kind: BoardKind }) {
  if (kind === "profile") return <CpuSketch/>;
  if (kind === "work") return <WorkSketch/>;
  if (kind === "blog") return <CapSketch/>;
  if (kind === "life") return <BuildingSketch/>;
  return <ContactSketch/>;
}

function overlaps(a: Box, b: Box, gap: number) {
  return !(a.right + gap <= b.left || a.left >= b.right + gap || a.bottom + gap <= b.top || a.top >= b.bottom + gap);
}
function distanceBetween(a: Box, b: Box) {
  const dx = Math.max(b.left - a.right, a.left - b.right, 0);
  const dy = Math.max(b.top - a.bottom, a.top - b.bottom, 0);
  return Math.hypot(dx, dy);
}
function localBox(node: HTMLElement, surfaceRect: DOMRect, scaleX: number, scaleY: number): Box {
  const r = node.getBoundingClientRect();
  const left = (r.left - surfaceRect.left) / scaleX;
  const top = (r.top - surfaceRect.top) / scaleY;
  const width = r.width / scaleX;
  const height = r.height / scaleY;
  return { left, top, right: left + width, bottom: top + height, width, height };
}

function placeSketch(surface: HTMLElement, sketch: HTMLElement) {
  const surfaceRect = surface.getBoundingClientRect();
  if (surface.clientWidth < 40 || surfaceRect.width < 20) return;

  const scaleX = surfaceRect.width / Math.max(1, surface.clientWidth);
  const scaleY = surfaceRect.height / Math.max(1, surface.clientHeight);
  const widthLimit = surface.clientWidth;
  const heightLimit = Math.max(surface.clientHeight, surface.scrollHeight);
  const mobile = window.innerWidth <= 760;
  const kind = sketch.dataset.techKind ?? "profile";
  const ratio = kind === "life" ? (mobile ? .18 : .12) : (mobile ? .16 : .095);
  const baseWidth = Math.min(kind === "life" ? (mobile ? 76 : 132) : (mobile ? 68 : 112), Math.max(mobile ? 50 : 72, widthLimit * ratio));
  const gap = mobile ? 7 : 11;
  const edge = mobile ? 8 : 12;

  const blockers = Array.from(surface.querySelectorAll<HTMLElement>(blockerSelector))
    .filter((node) => node !== sketch && !sketch.contains(node) && node.getBoundingClientRect().width > 3)
    .map((node) => localBox(node, surfaceRect, scaleX, scaleY));

  sketch.dataset.placed = "false";
  sketch.style.visibility = "hidden";
  sketch.style.removeProperty("display");

  for (const widthScale of mobile ? [1, .86, .74, .64] : [1, .88, .76, .66]) {
    const width = Math.round(baseWidth * widthScale);
    sketch.style.width = `${width}px`;
    sketch.style.left = "0px";
    sketch.style.top = "0px";
    const height = Math.max(28, sketch.getBoundingClientRect().height / Math.max(scaleY, .001));
    const maxLeft = Math.max(edge, widthLimit - width - edge);
    const maxTop = Math.max(edge, heightLimit - height - edge);
    const candidates: Placement[] = [];
    const xStep = Math.max(20, Math.round(width * .42));
    const yStep = Math.max(20, Math.round(height * .42));

    for (let top = edge; top <= maxTop; top += yStep) {
      for (let left = edge; left <= maxLeft; left += xStep) {
        const box: Box = { left, top, right: left + width, bottom: top + height, width, height };
        if (blockers.some((b) => overlaps(box, b, gap))) continue;
        const clearance = blockers.length ? Math.min(...blockers.map((b) => distanceBetween(box, b))) : 100;
        const edgeDistance = Math.min(left, top, widthLimit - box.right, heightLimit - box.bottom);
        const centerPenalty = Math.abs(left + width / 2 - widthLimit / 2) < widthLimit * .1 ? 5 : 0;
        candidates.push({ left, top, width, score: clearance - edgeDistance * .07 - centerPenalty + widthScale * 3 });
      }
    }

    candidates.sort((a, b) => b.score - a.score);
    const placement = candidates[0];
    if (!placement) continue;

    sketch.style.width = `${placement.width}px`;
    sketch.style.left = `${Math.round(placement.left)}px`;
    sketch.style.top = `${Math.round(placement.top)}px`;
    sketch.dataset.placed = "true";
    sketch.style.visibility = "visible";
    return;
  }

  sketch.style.display = "none";
}

export function BoardTechnicalSketches() {
  const [targets, setTargets] = useState<Target[]>([]);

  useEffect(() => {
    const discover = () => setTargets(boardSpecs.flatMap(([kind, id]) => {
      const title = document.getElementById(id);
      const surface = title?.closest<HTMLElement>(".story-board-surface") ?? null;
      return surface ? [{ kind: kind as BoardKind, surface }] : [];
    }));
    discover();
    const frame = requestAnimationFrame(discover);
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    let frame = 0;
    let settle = 0;
    const layout = () => targets.forEach(({ surface }) => {
      const sketch = surface.querySelector<HTMLElement>(".board-tech-sketch");
      if (sketch) placeSketch(surface, sketch);
    });
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

  return <><style dangerouslySetInnerHTML={{ __html: styles }}/>{targets.map(({ kind, surface }) => createPortal(<Sketch kind={kind}/>, surface, `technical-${kind}`))}</>;
}
