"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

type BoardKind = "profile" | "work" | "blog" | "life" | "contact";

type Target = { kind: BoardKind; surface: HTMLElement };

const boardSpecs = [
  ["profile", "profile-board-story-title"],
  ["work", "work-board-story-title"],
  ["blog", "blog-board-story-title"],
  ["life", "life-board-story-title"],
  ["contact", "contact-board-story-title"],
] as const;

const styles = `
/* BoardAliveLayer still owns marker typography/highlights. Its old generic doodles
   are suppressed here and replaced with one intentional sketch per board. */
.board-alive-layer > svg,
.board-alive-layer > .alive-marker-note { display:none!important; }

.board-tech-sketch {
  --sketch-ink:#315d72;
  --sketch-accent:#a6312a;
  position:absolute;
  z-index:4;
  pointer-events:none;
  color:var(--sketch-ink);
  font-family:var(--marker,"Marker Felt","Segoe Print","Bradley Hand",cursive);
  mix-blend-mode:multiply;
  transform:rotate(var(--sketch-r,-1deg));
  transform-origin:center;
}
.board-tech-sketch svg { display:block; width:100%; height:auto; overflow:visible; }
.tech-line,.tech-line-soft,.tech-accent,.tech-wash {
  vector-effect:non-scaling-stroke;
  stroke-linecap:round;
  stroke-linejoin:round;
}
.tech-line,.tech-line-soft,.tech-accent {
  fill:none;
  stroke-dasharray:1;
  stroke-dashoffset:1;
}
.tech-line { stroke:var(--sketch-ink); stroke-width:2.5; opacity:.82; }
.tech-line-soft { stroke:var(--sketch-ink); stroke-width:1.35; opacity:.45; }
.tech-accent { stroke:var(--sketch-accent); stroke-width:2.3; opacity:.78; }
.tech-wash { stroke:none; fill:var(--wash,#e4c36e); opacity:0; }
.tech-label {
  fill:#313b3f;
  font:800 12px/1 var(--marker,"Marker Felt","Segoe Print","Bradley Hand",cursive);
  letter-spacing:-.02em;
}
.tech-label-small { font-size:9px; opacity:.72; }
.tech-caption {
  position:absolute;
  margin:0;
  color:var(--sketch-ink);
  font:800 clamp(11px,1vw,15px)/1.05 var(--marker,"Marker Felt","Segoe Print","Bradley Hand",cursive);
  letter-spacing:-.025em;
  opacity:.78;
  white-space:nowrap;
}
.tech-caption.red { color:var(--sketch-accent); }

/* Reserved negative-space zones: these intentionally avoid the pinned chits. */
.tech-profile { top:4.5%; right:17.5%; width:24%; --sketch-r:-1.5deg; --wash:#e7c66d; }
.tech-profile .tech-caption { right:1%; bottom:-8%; }
.tech-work { top:5%; left:58%; width:16%; --sketch-r:2deg; --wash:#d8b5d9; }
.tech-work .tech-caption { left:2%; bottom:-14%; }
.tech-blog { top:5.5%; right:4.5%; width:21%; --sketch-r:1deg; --wash:#a9d2da; }
.tech-blog .tech-caption { right:4%; bottom:-10%; }
.tech-life { top:5%; right:3.5%; width:25%; --sketch-r:1.2deg; --wash:#dcb875; }
.tech-life .tech-caption { right:3%; bottom:-7%; font-size:clamp(14px,1.35vw,20px); }
.tech-contact { top:6%; right:5%; width:19%; --sketch-r:-1.5deg; --wash:#ebcf79; }
.tech-contact .tech-caption { right:2%; bottom:-11%; }

.scroll-board-panel[style*="opacity: 1"] .board-tech-sketch .tech-line,
.scroll-board-panel[style*="opacity: 1"] .board-tech-sketch .tech-line-soft,
.scroll-board-panel[style*="opacity: 1"] .board-tech-sketch .tech-accent {
  animation:techDraw 9.6s cubic-bezier(.2,.72,.22,1) var(--line-delay,0s) infinite;
}
.scroll-board-panel[style*="opacity: 1"] .board-tech-sketch .tech-wash {
  animation:techWash 9.6s cubic-bezier(.2,.72,.22,1) .55s infinite;
}
.scroll-board-panel[style*="opacity: 1"] .board-tech-sketch .tech-caption {
  animation:techNote 4.8s ease-in-out 1.3s infinite alternate;
}
.board-tech-sketch .tech-line-soft { --line-delay:.22s; }
.board-tech-sketch .tech-accent { --line-delay:.42s; }

@keyframes techDraw {
  0%,7% { stroke-dashoffset:1; opacity:.04; }
  22%,68% { stroke-dashoffset:0; opacity:.82; }
  80% { stroke-dashoffset:0; opacity:.45; }
  92%,100% { stroke-dashoffset:1; opacity:.03; }
}
@keyframes techWash {
  0%,28% { opacity:0; transform:scale(.74) rotate(-2deg); transform-origin:center; }
  42%,68% { opacity:.17; transform:scale(1) rotate(.6deg); }
  84%,100% { opacity:0; transform:scale(1.04) rotate(1deg); }
}
@keyframes techNote { from{translate:0 0;opacity:.62} to{translate:3px -3px;opacity:.9} }

@media (max-width:900px) {
  .tech-profile { width:21%; right:14%; top:7%; }
  .tech-work { width:15%; left:64%; top:7%; }
}
@media (max-width:760px) {
  /* Mobile boards are much denser; keep only the personal architectural sketch. */
  .tech-profile,.tech-work,.tech-blog,.tech-contact { display:none; }
  .tech-life { width:38%; right:1%; top:3%; opacity:.58; }
  .tech-life .tech-caption { display:none; }
}
@media (prefers-reduced-motion:reduce) {
  .tech-line,.tech-line-soft,.tech-accent { stroke-dashoffset:0!important; animation:none!important; }
  .tech-wash { opacity:.12!important; animation:none!important; }
  .tech-caption { animation:none!important; }
}
`;

function CpuSketch() {
  return (
    <div className="board-tech-sketch tech-profile" aria-hidden="true">
      <svg viewBox="0 0 320 190">
        <path className="tech-wash" d="M20 20 H300 V161 H20 Z" />
        <path className="tech-line-soft" pathLength="1" d="M18 19 H302 M18 163 H302 M19 20 V163 M301 20 V163" />
        <path className="tech-line" pathLength="1" d="M35 36 H112 V78 H35 Z M126 36 H203 V78 H126 Z M217 36 H286 V78 H217 Z" />
        <path className="tech-line" pathLength="1" d="M35 92 H112 V122 H35 Z M126 92 H203 V122 H126 Z M217 92 H286 V122 H217 Z" />
        <path className="tech-accent" pathLength="1" d="M45 137 H278 V155 H45 Z" />
        <path className="tech-line-soft" pathLength="1" d="M73 78 V92 M164 78 V92 M252 78 V92 M73 122 V137 M164 122 V137 M252 122 V137" />
        <path className="tech-line-soft" pathLength="1" d="M31 28 l14 -10 M112 31 l11 -9 M204 29 l11 -9 M287 29 l13 -7" />
        <text className="tech-label" x="51" y="60">CORE 0</text><text className="tech-label" x="142" y="60">CORE 1</text><text className="tech-label" x="231" y="60">CORE 2</text>
        <text className="tech-label-small" x="58" y="111">L1 / L2</text><text className="tech-label-small" x="149" y="111">L1 / L2</text><text className="tech-label-small" x="237" y="111">L1 / L2</text>
        <text className="tech-label" x="128" y="151">SHARED L3</text>
        <text className="tech-label-small" x="228" y="178">→ memory</text>
      </svg>
      <p className="tech-caption red">latency lives in the gaps ↘</p>
    </div>
  );
}

function CapSketch() {
  return (
    <div className="board-tech-sketch tech-work" aria-hidden="true">
      <svg viewBox="0 0 230 190">
        <path className="tech-wash" d="M113 18 L208 157 L24 157 Z" />
        <path className="tech-line" pathLength="1" d="M113 18 L208 157 L24 157 Z" />
        <path className="tech-line-soft" pathLength="1" d="M113 27 L193 151 M104 27 L36 151 M34 148 H198" />
        <circle className="tech-accent" pathLength="1" cx="113" cy="21" r="14" />
        <circle className="tech-accent" pathLength="1" cx="205" cy="157" r="14" />
        <circle className="tech-accent" pathLength="1" cx="25" cy="157" r="14" />
        <text className="tech-label" x="108" y="26">C</text><text className="tech-label" x="200" y="162">A</text><text className="tech-label" x="20" y="162">P</text>
        <text className="tech-label-small" x="72" y="88">pick trade-offs</text>
        <path className="tech-line-soft" pathLength="1" d="M79 97 C92 105 109 108 128 103 M129 102 l-8 -8 m8 8 l-10 5" />
      </svg>
      <p className="tech-caption">distributed systems ≠ free lunch</p>
    </div>
  );
}

function RaftSketch() {
  return (
    <div className="board-tech-sketch tech-blog" aria-hidden="true">
      <svg viewBox="0 0 300 180">
        <path className="tech-wash" d="M15 34 H92 V81 H15 Z M111 19 H190 V66 H111 Z M208 35 H286 V82 H208 Z" />
        <path className="tech-line" pathLength="1" d="M15 34 H92 V81 H15 Z M111 19 H190 V66 H111 Z M208 35 H286 V82 H208 Z" />
        <path className="tech-accent" pathLength="1" d="M151 67 V112 M151 112 C115 112 81 116 55 138 M151 112 C184 112 218 118 247 139" />
        <path className="tech-line-soft" pathLength="1" d="M55 138 h54 v24 H55z M124 138 h54 v24 h-54z M193 138 h54 v24 h-54z" />
        <text className="tech-label" x="30" y="61">follower</text><text className="tech-label" x="132" y="47">leader</text><text className="tech-label" x="222" y="61">follower</text>
        <text className="tech-label-small" x="128" y="126">replicated log</text>
      </svg>
      <p className="tech-caption red">consensus makes good stories</p>
    </div>
  );
}

function BuildingSketch() {
  return (
    <div className="board-tech-sketch tech-life" aria-hidden="true">
      <svg viewBox="0 0 360 250">
        <path className="tech-wash" d="M29 218 L44 80 L94 65 L98 35 L151 22 L158 69 L203 58 L211 92 L264 78 L277 218 Z" />
        <path className="tech-line" pathLength="1" d="M29 218 L44 80 L94 65 L98 35 L151 22 L158 69 L203 58 L211 92 L264 78 L277 218 Z" />
        <path className="tech-line" pathLength="1" d="M44 80 L95 112 L158 69 L211 92 L264 78 M95 112 V218 M158 69 V218 M211 92 V218" />
        <path className="tech-line-soft" pathLength="1" d="M34 188 L95 159 L158 178 L211 151 L274 178 M31 203 L95 174 L158 192 L211 166 L274 194" />
        <path className="tech-line-soft" pathLength="1" d="M52 98 l-12 82 M75 90 l-10 102 M121 75 l-11 128 M183 79 l-8 128 M233 87 l-6 119" />
        <path className="tech-accent" pathLength="1" d="M286 60 C308 48 326 51 340 66 M302 39 C311 23 326 17 341 19" />
      </svg>
      <p className="tech-caption">I like drawing too.</p>
    </div>
  );
}

function HandshakeSketch() {
  return (
    <div className="board-tech-sketch tech-contact" aria-hidden="true">
      <svg viewBox="0 0 260 170">
        <path className="tech-wash" d="M22 32 H89 V79 H22 Z M171 32 H238 V79 H171 Z" />
        <path className="tech-line" pathLength="1" d="M22 32 H89 V79 H22 Z M171 32 H238 V79 H171 Z" />
        <path className="tech-accent" pathLength="1" d="M91 45 C118 34 141 34 169 45 M169 64 C141 76 117 76 91 64" />
        <path className="tech-line-soft" pathLength="1" d="M154 38 l15 7 -14 8 M106 57 l-15 7 14 8" />
        <path className="tech-line-soft" pathLength="1" d="M57 80 V120 H201 V80 M107 120 v25 h45 v-25" />
        <text className="tech-label" x="36" y="61">you</text><text className="tech-label" x="185" y="61">me</text><text className="tech-label-small" x="92" y="155">context → useful conversation</text>
      </svg>
      <p className="tech-caption red">open channel</p>
    </div>
  );
}

function Sketch({ kind }: { kind: BoardKind }) {
  if (kind === "profile") return <CpuSketch />;
  if (kind === "work") return <CapSketch />;
  if (kind === "blog") return <RaftSketch />;
  if (kind === "life") return <BuildingSketch />;
  return <HandshakeSketch />;
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

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      {targets.map(({ kind, surface }) =>
        createPortal(<Sketch kind={kind} />, surface, `technical-${kind}`),
      )}
    </>
  );
}
