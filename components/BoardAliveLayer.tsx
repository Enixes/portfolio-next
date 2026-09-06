"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

type BoardKind = "profile" | "work" | "blog" | "life" | "contact";

type BoardTarget = {
  kind: BoardKind;
  surface: HTMLElement;
};

const boardSpecs = [
  ["profile", "profile-board-story-title"],
  ["work", "work-board-story-title"],
  ["blog", "blog-board-story-title"],
  ["life", "life-board-story-title"],
  ["contact", "contact-board-story-title"],
] as const;

const styles = `
.story-board-surface {
  --marker: "Marker Felt", "Segoe Print", "Bradley Hand", "Comic Sans MS", cursive;
}

/* Marker-written hierarchy: keep explanatory copy mono/readable, but make anything
   that looks physically written on the board feel like thick felt-marker ink. */
.story-board-header h2,
.story-case h3,
.story-case strong,
.story-board-footnote,
.profile-live-header h2,
.profile-now-card h3,
.profile-project-card h3,
.profile-mini-chit strong,
.profile-status-stamp,
.profile-pencil,
.profile-live-footnote,
.work-cv-header h2,
.work-company-chit h3,
.work-company-chit em,
.work-evidence-chit strong,
.work-tenure-tag,
.work-cv-pencil,
.work-cv-footnote {
  font-family: var(--marker) !important;
  font-weight: 800 !important;
  letter-spacing: -.025em !important;
  text-rendering: geometricPrecision;
  text-shadow: .35px .25px 0 rgba(18,20,19,.16), -.25px .15px 0 rgba(18,20,19,.1);
}

.story-board-header > span,
.profile-live-header > span,
.work-cv-header > div > span {
  font-family: var(--marker) !important;
  letter-spacing: .045em !important;
  text-transform: none !important;
  font-size: clamp(12px, 1.05vw, 16px) !important;
}

/* Animated rough marker emphasis. Important phrases highlight, hold, erase, redraw. */
.story-case strong,
.profile-project-card h3,
.profile-now-card h3,
.work-evidence-chit strong {
  position: relative;
  z-index: 1;
  width: fit-content;
  max-width: 100%;
  background-image: linear-gradient(95deg, rgba(244,211,89,.06), rgba(244,211,89,.58) 18%, rgba(244,211,89,.42) 82%, rgba(244,211,89,.04));
  background-repeat: no-repeat;
  background-position: 0 88%;
  background-size: 0% 42%;
  box-decoration-break: clone;
  -webkit-box-decoration-break: clone;
}

.scroll-board-panel[style*="opacity: 1"] .story-case:nth-child(1) strong,
.scroll-board-panel[style*="opacity: 1"] .profile-project-tailcache h3,
.scroll-board-panel[style*="opacity: 1"] .work-evidence-chit:nth-of-type(1) strong {
  animation: aliveMarkerHighlight 7.4s cubic-bezier(.2,.72,.22,1) .35s infinite;
}
.scroll-board-panel[style*="opacity: 1"] .story-case:nth-child(2) strong,
.scroll-board-panel[style*="opacity: 1"] .profile-project-agent h3,
.scroll-board-panel[style*="opacity: 1"] .work-evidence-chit:nth-of-type(2) strong {
  animation: aliveMarkerHighlight 8.1s cubic-bezier(.2,.72,.22,1) 1.4s infinite;
}
.scroll-board-panel[style*="opacity: 1"] .story-case:nth-child(3) strong,
.scroll-board-panel[style*="opacity: 1"] .profile-project-game h3,
.scroll-board-panel[style*="opacity: 1"] .work-evidence-chit:nth-of-type(3) strong {
  animation: aliveMarkerHighlight 8.8s cubic-bezier(.2,.72,.22,1) 2.3s infinite;
}
.scroll-board-panel[style*="opacity: 1"] .profile-now-card h3,
.scroll-board-panel[style*="opacity: 1"] .work-evidence-chit:nth-of-type(4) strong {
  animation: aliveMarkerHighlightBlue 9.2s cubic-bezier(.2,.72,.22,1) 3.1s infinite;
}
.scroll-board-panel[style*="opacity: 1"] .work-evidence-chit:nth-of-type(5) strong {
  animation: aliveMarkerHighlight 9.6s cubic-bezier(.2,.72,.22,1) 4s infinite;
}
.scroll-board-panel[style*="opacity: 1"] .work-evidence-chit:nth-of-type(6) strong {
  animation: aliveMarkerHighlightBlue 10.2s cubic-bezier(.2,.72,.22,1) 4.8s infinite;
}

.story-board-header h2,
.profile-live-header h2,
.work-cv-header h2 {
  position: relative;
  width: fit-content;
  max-width: 100%;
}
.story-board-header h2::after,
.profile-live-header h2::after,
.work-cv-header h2::after {
  content: "";
  position: absolute;
  z-index: -1;
  right: -4%;
  bottom: -.09em;
  left: 3%;
  height: .12em;
  min-height: 4px;
  border-radius: 48% 52% 45% 55%;
  background: #a83029;
  opacity: .88;
  transform: rotate(-1.2deg) scaleX(.02);
  transform-origin: left center;
}
.scroll-board-panel[style*="opacity: 1"] .story-board-header h2::after,
.scroll-board-panel[style*="opacity: 1"] .profile-live-header h2::after,
.scroll-board-panel[style*="opacity: 1"] .work-cv-header h2::after {
  animation: aliveUnderline 6.8s cubic-bezier(.18,.76,.24,1) .4s infinite;
}

.board-alive-layer {
  position: absolute;
  z-index: 3;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
  font-family: var(--marker);
}
.board-alive-layer svg {
  position: absolute;
  overflow: visible;
}
.board-alive-path,
.board-alive-faint {
  fill: none;
  stroke-linecap: round;
  stroke-linejoin: round;
  vector-effect: non-scaling-stroke;
  stroke-dasharray: 1;
  stroke-dashoffset: 1;
}
.board-alive-path {
  stroke: var(--doodle-ink, #315d72);
  stroke-width: 2.7;
  opacity: .8;
}
.board-alive-faint {
  stroke: color-mix(in srgb, var(--doodle-ink, #315d72) 58%, transparent);
  stroke-width: 1.7;
  opacity: .58;
}
.scroll-board-panel[style*="opacity: 1"] .board-alive-path,
.scroll-board-panel[style*="opacity: 1"] .board-alive-faint {
  animation: aliveDoodleRedraw var(--dur, 9s) cubic-bezier(.22,.72,.22,1) var(--delay, 0s) infinite;
}

.alive-marker-note {
  position: absolute;
  z-index: 2;
  max-width: 210px;
  color: var(--note-ink, #315d72);
  font: 800 clamp(12px, 1.2vw, 18px)/1.05 var(--marker);
  letter-spacing: -.025em;
  opacity: .78;
  transform: rotate(var(--note-r, -2deg));
  text-shadow: .4px .2px 0 rgba(18,20,19,.1);
}
.scroll-board-panel[style*="opacity: 1"] .alive-marker-note {
  animation: aliveNoteBreathe 5.8s ease-in-out var(--note-delay, 1.8s) infinite alternate;
}

/* Profile doodles */
.alive-profile .doodle-a { left:31%; top:10%; width:13%; --doodle-ink:#a02f2a; --delay:.45s; --dur:8.8s; transform:rotate(-4deg); }
.alive-profile .doodle-b { right:1.5%; top:51%; width:13%; --doodle-ink:#315d72; --delay:2.2s; --dur:10.2s; transform:rotate(6deg); }
.alive-profile .note-a { left:34%; top:49%; --note-r:-5deg; --note-delay:1.1s; }
.alive-profile .note-b { right:23%; top:15%; --note-ink:#9b302a; --note-r:4deg; --note-delay:2.6s; }

/* Work doodles */
.alive-work .doodle-a { left:31%; bottom:3%; width:15%; --doodle-ink:#315d72; --delay:.8s; --dur:9.6s; transform:rotate(-2deg); }
.alive-work .doodle-b { right:2%; top:13%; width:11%; --doodle-ink:#9f302a; --delay:2.8s; --dur:10.8s; transform:rotate(5deg); }
.alive-work .note-a { left:43%; top:17%; --note-r:-3deg; --note-delay:1.4s; }
.alive-work .note-b { right:7%; bottom:17%; --note-ink:#9b302a; --note-r:5deg; --note-delay:3.1s; }

/* Blog doodles */
.alive-blog .doodle-a { right:5%; top:11%; width:18%; --doodle-ink:#315d72; --delay:.7s; --dur:9.1s; transform:rotate(4deg); }
.alive-blog .doodle-b { left:3%; bottom:6%; width:15%; --doodle-ink:#9f302a; --delay:2.5s; --dur:10.4s; transform:rotate(-6deg); }
.alive-blog .note-a { right:9%; top:33%; --note-r:5deg; --note-delay:1.5s; }
.alive-blog .note-b { left:7%; bottom:22%; --note-ink:#9b302a; --note-r:-4deg; --note-delay:3.3s; }

/* Life gets the architectural sketch — personal, deliberately rough, repeatedly redrawn. */
.alive-life .doodle-building { right:3%; top:8%; width:28%; --doodle-ink:#315d72; --delay:.3s; --dur:11.2s; transform:rotate(1.5deg); opacity:.86; }
.alive-life .doodle-b { left:4%; bottom:4%; width:17%; --doodle-ink:#9f302a; --delay:3s; --dur:9.8s; transform:rotate(-4deg); }
.alive-life .note-a { right:8%; top:39%; --note-r:3deg; --note-delay:1.1s; font-size:clamp(15px,1.55vw,23px); }
.alive-life .note-b { left:7%; bottom:18%; --note-ink:#9b302a; --note-r:-5deg; --note-delay:3.4s; }

/* Contact doodles */
.alive-contact .doodle-a { right:5%; top:9%; width:17%; --doodle-ink:#315d72; --delay:.55s; --dur:9.5s; transform:rotate(4deg); }
.alive-contact .doodle-b { left:4%; bottom:6%; width:14%; --doodle-ink:#9f302a; --delay:2.4s; --dur:10.6s; transform:rotate(-6deg); }
.alive-contact .note-a { right:8%; top:32%; --note-r:4deg; --note-delay:1.2s; }
.alive-contact .note-b { left:8%; bottom:17%; --note-ink:#9b302a; --note-r:-4deg; --note-delay:3s; }

@keyframes aliveMarkerHighlight {
  0%, 8% { background-size:0% 42%; }
  20%, 68% { background-size:100% 42%; }
  78%, 100% { background-size:0% 42%; }
}
@keyframes aliveMarkerHighlightBlue {
  0%, 8% { background-size:0% 42%; background-image:linear-gradient(95deg,rgba(118,197,213,.04),rgba(118,197,213,.5) 18%,rgba(118,197,213,.36) 82%,rgba(118,197,213,.03)); }
  20%, 68% { background-size:100% 42%; background-image:linear-gradient(95deg,rgba(118,197,213,.04),rgba(118,197,213,.5) 18%,rgba(118,197,213,.36) 82%,rgba(118,197,213,.03)); }
  78%, 100% { background-size:0% 42%; background-image:linear-gradient(95deg,rgba(118,197,213,.04),rgba(118,197,213,.5) 18%,rgba(118,197,213,.36) 82%,rgba(118,197,213,.03)); }
}
@keyframes aliveUnderline {
  0%, 7% { transform:rotate(-1.2deg) scaleX(.02); opacity:.18; }
  19%, 72% { transform:rotate(-1.2deg) scaleX(1); opacity:.88; }
  82%, 100% { transform:rotate(-1.2deg) scaleX(.02); opacity:.18; }
}
@keyframes aliveDoodleRedraw {
  0%, 7% { stroke-dashoffset:1; opacity:.05; }
  20%, 68% { stroke-dashoffset:0; opacity:.82; }
  79% { stroke-dashoffset:0; opacity:.48; }
  90%, 100% { stroke-dashoffset:1; opacity:.04; }
}
@keyframes aliveNoteBreathe {
  from { translate:0 0; opacity:.64; }
  to { translate:3px -4px; opacity:.9; }
}

@media (max-width:760px) {
  .board-alive-layer { opacity:.54; }
  .alive-marker-note { display:none; }
  .alive-life .doodle-building { width:46%; right:-10%; top:6%; opacity:.42; }
  .board-alive-layer svg:not(.doodle-building) { opacity:.42; }
}

@media (prefers-reduced-motion:reduce) {
  .board-alive-path,.board-alive-faint { stroke-dashoffset:0!important; animation:none!important; }
  .alive-marker-note { animation:none!important; }
  .story-case strong,.profile-project-card h3,.profile-now-card h3,.work-evidence-chit strong { background-size:100% 42%!important; animation:none!important; }
  .story-board-header h2::after,.profile-live-header h2::after,.work-cv-header h2::after { transform:rotate(-1.2deg) scaleX(1)!important; animation:none!important; }
}
`;

function ProfileDoodles() {
  return (
    <>
      <svg className="doodle-a" viewBox="0 0 180 120" aria-hidden="true">
        <path className="board-alive-path" pathLength="1" d="M12 88 C34 69 51 66 70 72 C89 79 104 67 119 47 C132 31 146 24 166 28" />
        <path className="board-alive-faint" pathLength="1" d="M118 47 l24 3 -11 -23 M45 94 C54 102 67 107 79 108" />
      </svg>
      <svg className="doodle-b" viewBox="0 0 160 130" aria-hidden="true">
        <path className="board-alive-path" pathLength="1" d="M19 104 L19 38 L55 38 L55 18 L96 18 L96 52 L137 52 L137 104 Z" />
        <path className="board-alive-faint" pathLength="1" d="M31 51 h12 v13 H31z M68 31 h13 v14 H68z M110 65 h13 v15 h-13z M10 105 C52 111 111 109 149 103" />
      </svg>
      <span className="alive-marker-note note-a">build → measure → break → learn</span>
      <span className="alive-marker-note note-b">currently: deliberately uncomfortable projects</span>
    </>
  );
}

function WorkDoodles() {
  return (
    <>
      <svg className="doodle-a" viewBox="0 0 220 120" aria-hidden="true">
        <path className="board-alive-path" pathLength="1" d="M8 59 h41 v27 H8z M89 29 h48 v28 H89z M89 75 h48 v28 H89z M177 51 h35 v30 h-35z" />
        <path className="board-alive-faint" pathLength="1" d="M50 72 C66 72 68 42 86 42 M50 72 C68 72 70 89 86 89 M139 43 C156 43 159 65 174 65 M139 89 C156 89 160 67 174 67" />
      </svg>
      <svg className="doodle-b" viewBox="0 0 150 110" aria-hidden="true">
        <path className="board-alive-path" pathLength="1" d="M9 91 C25 81 30 91 42 69 C51 51 59 61 69 45 C81 26 91 54 105 31 C115 14 127 18 140 13" />
        <path className="board-alive-faint" pathLength="1" d="M10 99 H142 M18 20 V99" />
      </svg>
      <span className="alive-marker-note note-a">measure twice. ship once.</span>
      <span className="alive-marker-note note-b">latency is a feature too</span>
    </>
  );
}

function BlogDoodles() {
  return (
    <>
      <svg className="doodle-a" viewBox="0 0 220 150" aria-hidden="true">
        <path className="board-alive-path" pathLength="1" d="M19 30 C52 20 83 28 106 45 V124 C80 108 51 103 19 111 Z M201 30 C168 20 137 28 114 45 V124 C140 108 169 103 201 111 Z" />
        <path className="board-alive-faint" pathLength="1" d="M38 50 C60 45 80 50 94 58 M38 68 C62 64 80 68 94 77 M182 50 C160 45 140 50 126 58 M182 68 C158 64 140 68 126 77" />
      </svg>
      <svg className="doodle-b" viewBox="0 0 160 110" aria-hidden="true">
        <path className="board-alive-path" pathLength="1" d="M20 70 C36 47 53 48 68 58 C81 67 95 65 111 44 C124 27 135 25 145 28" />
        <path className="board-alive-faint" pathLength="1" d="M136 20 l10 8 -5 14 M15 83 C38 93 66 96 89 91" />
      </svg>
      <span className="alive-marker-note note-a">write what failed, not just what worked</span>
      <span className="alive-marker-note note-b">margin notes become essays</span>
    </>
  );
}

function LifeDoodles() {
  return (
    <>
      <svg className="doodle-building" viewBox="0 0 360 250" aria-label="Loose marker sketch of a building">
        <path className="board-alive-path" pathLength="1" d="M32 216 L44 79 L92 65 L98 34 L151 22 L158 68 L202 57 L210 91 L263 77 L274 216 Z" />
        <path className="board-alive-path" pathLength="1" d="M20 218 C91 228 214 226 318 214 M44 79 L276 79 M97 35 L157 34" />
        <path className="board-alive-faint" pathLength="1" d="M64 98 h23 v27 H64z M112 91 h25 v29 h-25z M166 94 h24 v29 h-24z M220 101 h25 v29 h-25z M61 145 h26 v31 H61z M111 140 h26 v32 h-26z M165 143 h26 v31 h-26z M218 148 h27 v31 h-27z" />
        <path className="board-alive-faint" pathLength="1" d="M286 60 C308 48 326 51 340 66 M302 39 C311 23 326 17 341 19 M24 202 C42 183 53 179 70 181" />
      </svg>
      <svg className="doodle-b" viewBox="0 0 180 120" aria-hidden="true">
        <circle className="board-alive-path" pathLength="1" cx="55" cy="58" r="30" />
        <path className="board-alive-faint" pathLength="1" d="M33 36 L77 80 M76 36 L34 80 M103 77 C120 52 139 46 165 49" />
      </svg>
      <span className="alive-marker-note note-a">I like drawing too.</span>
      <span className="alive-marker-note note-b">football / places / sketches / side quests</span>
    </>
  );
}

function ContactDoodles() {
  return (
    <>
      <svg className="doodle-a" viewBox="0 0 200 130" aria-hidden="true">
        <path className="board-alive-path" pathLength="1" d="M15 26 L181 26 L181 108 L15 108 Z M17 29 L98 81 L179 29" />
        <path className="board-alive-faint" pathLength="1" d="M16 106 L73 67 M180 106 L123 67" />
      </svg>
      <svg className="doodle-b" viewBox="0 0 170 120" aria-hidden="true">
        <path className="board-alive-path" pathLength="1" d="M18 94 C48 80 69 61 83 35 C92 19 110 16 145 21" />
        <path className="board-alive-faint" pathLength="1" d="M134 12 l13 9 -9 15 M25 104 C39 109 53 110 68 107" />
      </svg>
      <span className="alive-marker-note note-a">email works best ↗</span>
      <span className="alive-marker-note note-b">bring context. bring the hard problem.</span>
    </>
  );
}

function BoardDoodles({ kind }: { kind: BoardKind }) {
  if (kind === "profile") return <ProfileDoodles />;
  if (kind === "work") return <WorkDoodles />;
  if (kind === "blog") return <BlogDoodles />;
  if (kind === "life") return <LifeDoodles />;
  return <ContactDoodles />;
}

export function BoardAliveLayer() {
  const [targets, setTargets] = useState<BoardTarget[]>([]);

  useEffect(() => {
    const discover = () => {
      const next = boardSpecs.flatMap(([kind, titleId]) => {
        const title = document.getElementById(titleId);
        const surface = title?.closest<HTMLElement>(".story-board-surface") ?? null;
        return surface ? [{ kind: kind as BoardKind, surface }] : [];
      });
      setTargets(next);
    };

    discover();
    const frame = window.requestAnimationFrame(discover);
    return () => window.cancelAnimationFrame(frame);
  }, []);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      {targets.map(({ kind, surface }) =>
        createPortal(
          <div className={`board-alive-layer alive-${kind}`} aria-hidden="true">
            <BoardDoodles kind={kind} />
          </div>,
          surface,
          `alive-${kind}`,
        ),
      )}
    </>
  );
}
