"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { SECTION_STOP_LOCAL_PROGRESS } from "./BoardScrollController";

// Coordinates describe the board, independently of the vertical scroll track.
// Profile -> Systems -> lower-right Field Notes -> central Life -> Contact.
const boardMap = [
  { x: 0, y: 0 }, { x: 1.12, y: 0 }, { x: 1.8, y: 1.08 },
  { x: .72, y: 1.08 }, { x: 1.8, y: 1.94 },
];
const clamp = (n: number, min = 0, max = 1) => Math.max(min, Math.min(max, n));

const styles = `
html[data-spatial-camera="true"] .board-scroll-story,
html[data-spatial-camera="true"] .board-scroll-sticky { background: #fff !important; }
html[data-spatial-camera="true"] .board-scroll-sticky::after,
html[data-spatial-camera="true"] .board-story-room,
html[data-spatial-camera="true"] .zoom-master-board { display: none !important; }
html[data-spatial-camera="true"] .board-scroll-sticky::before {
  content: ""; position: absolute; inset: 0; pointer-events: none;
  background-image: linear-gradient(rgba(63,72,71,.027) 1px, transparent 1px),
    linear-gradient(90deg, rgba(63,72,71,.027) 1px, transparent 1px);
  background-size: 28px 28px;
  background-position: var(--board-grid-x,0px) var(--board-grid-y,0px);
}
html[data-spatial-camera="true"] .board-scroll-track {
  position: absolute !important; inset: 0 !important; display: block !important;
  width: 100% !important; height: 100% !important; transform: none !important;
}
html[data-spatial-camera="true"] .scroll-board-panel {
  position: absolute !important; inset: 0 !important; width: 100% !important;
  height: 100% !important; display: block !important; flex: none !important; backface-visibility: hidden;
  will-change: transform, opacity;
}
html[data-spatial-camera="true"] .story-board-frame { min-height: 0 !important; }
html[data-spatial-camera="true"] .profile-live-mounted { display: block !important; }
html[data-spatial-camera="true"] .story-board-surface {
  background: transparent !important; box-shadow: none !important;
}
html[data-spatial-camera="true"] .work-cv-board,
html[data-spatial-camera="true"] .life-live-board,
html[data-spatial-camera="true"] .blog-live-board { background-color: #fff !important; }
html[data-spatial-camera="true"] .story-board-surface::after { display: none; }
html[data-board-entered="true"] .preview-header {
  background: rgba(255,255,255,.97); color: #413a32;
  border-color: #e3ded5; box-shadow: 0 5px 18px rgba(58,48,34,.09);
  animation: none;
}
html[data-board-entered="true"] .war-room-intro { display: none; }
html[data-board-entered="true"] .preview-header > a { color: #413a32; }
html[data-board-entered="true"] .preview-nav a { color: #62574b; }
html[data-spatial-camera="true"] .board-story-progress {
  color: #665e55; background: rgba(255,255,255,.9); border-color: #dedbd4;
}
.board-travel-marker {
  position: absolute; inset: 0; width: 100%; height: 100%;
  z-index: 4; pointer-events: none; overflow: hidden;
}
.board-travel-marker path { fill: none; stroke-linecap: round; stroke-linejoin: round; }
.board-entry-overlay { position: fixed; inset: 0; z-index: 35; overflow: hidden; pointer-events: none; }
.board-entry-veil { position: absolute; inset: 0; background: #fff; opacity: 0; }
.board-entry-clone, .board-entry-clone * { animation: none !important; transition: none !important; }
html[data-spatial-camera="true"] .profile-live-mounted,
html[data-spatial-camera="true"] .scroll-board-gold .story-board-surface {
  overscroll-behavior-y: contain; touch-action: pan-x pinch-zoom;
}
@media (prefers-reduced-motion: reduce) { .board-travel-marker { display: none; } }
@media (max-width: 760px) {
  html[data-spatial-camera="true"] .board-story-progress { display: none; }
}
`;

export function BoardSpatialCamera() {
  useEffect(() => {
    const story = document.querySelector<HTMLElement>("[data-board-story]");
    const host = story?.querySelector<HTMLElement>(".board-scroll-sticky");
    const panels = Array.from(story?.querySelectorAll<HTMLElement>("[data-board-panel]") ?? []);
    if (!story || !host || !panels.length) return;
    const viewport = host;
    const root = document.documentElement;
    root.dataset.spatialCamera = "true";
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.classList.add("board-travel-marker");
    svg.setAttribute("aria-hidden", "true");
    const path = document.createElementNS(svg.namespaceURI, "path");
    path.setAttribute("stroke", "#947441");
    path.setAttribute("stroke-width", "2.4");
    path.setAttribute("pathLength", "1");
    svg.append(path);
    host.append(svg);
    let storyTop = 0;
    let travel = 1;
    let frame = 0;
    let previousPosition = 0;
    let direction = 1;
    const measure = () => {
      storyTop = window.scrollY + story.getBoundingClientRect().top;
      travel = Math.max(1, story.offsetHeight - window.innerHeight);
    };
    function render() {
      frame = 0;
      const position = clamp((window.scrollY - storyTop) / travel * panels.length
        - SECTION_STOP_LOCAL_PROGRESS, 0, panels.length - 1);
      if (Math.abs(position - previousPosition) > .0001) direction = Math.sign(position - previousPosition);
      previousPosition = position;
      const from = Math.floor(position);
      const to = Math.min(panels.length - 1, from + 1);
      const fraction = position - from;
      const t = fraction * fraction * (3 - 2 * fraction);
      const a = boardMap[from];
      const b = boardMap[to];
      const camera = { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
      const settledIndex = Math.round(position);
      const transitioning = Math.abs(position - settledIndex) > .003;
      const width = window.innerWidth;
      const height = window.innerHeight;
      // Both axes use enough travel to clear the previous board's content.
      const xStride = width * 1.12;
      const yStride = height * 1.12;
      panels.forEach((panel, index) => {
        const distance = Math.abs(index - position);
        const participating = transitioning ? index === from || index === to : index === settledIndex;
        const visible = reducedMotion.matches ? index === settledIndex : participating;
        const opacity = !visible ? 0 : reducedMotion.matches || !transitioning ? 1
          : 1 - .68 * Math.sin(Math.min(1, distance) * Math.PI / 2);
        gsap.set(panel, {
          x: reducedMotion.matches ? 0 : (boardMap[index].x - camera.x) * xStride,
          y: reducedMotion.matches ? 0 : (boardMap[index].y - camera.y) * yStride,
          scale: 1, rotation: 0, autoAlpha: opacity, zIndex: 5,
          pointerEvents: !transitioning && index === settledIndex ? "auto" : "none",
          force3D: true,
        });
        const active = !transitioning && index === settledIndex;
        panel.inert = !active;
        panel.setAttribute("aria-hidden", String(!active));
      });
      viewport.style.setProperty("--board-grid-x", -camera.x * 40 + "px");
      viewport.style.setProperty("--board-grid-y", -camera.y * 40 + "px");
      // A single curved thread lives on the board, behind the content. Its
      // endpoints and camera share world coordinates, so reverse travel retraces.
      const anchorX = width * .075;
      const anchorY = width <= 760 ? 90 : 105;
      const sx = anchorX + (a.x - camera.x) * xStride;
      const sy = anchorY + (a.y - camera.y) * yStride;
      const ex = anchorX + (b.x - camera.x) * xStride;
      const ey = anchorY + (b.y - camera.y) * yStride;
      const bend = Math.min(110, width * .12);
      path.setAttribute("d", "M " + sx + " " + sy + " C " +
        (sx + (ex - sx) * .38) + " " + (sy + bend) + ", " +
        (sx + (ex - sx) * .65) + " " + (ey - bend) + ", " + ex + " " + ey);
      const progress = direction > 0 ? fraction : 1 - fraction;
      path.setAttribute("stroke-dasharray", "1");
      path.setAttribute("stroke-dashoffset", String(direction > 0 ? 1 - progress : -(1 - progress)));
      svg.style.opacity = transitioning && !reducedMotion.matches
        ? String(Math.sin(fraction * Math.PI) * .65) : "0";
      svg.setAttribute("viewBox", "0 0 " + width + " " + height);
    }
    const requestRender = () => { if (!frame) frame = window.requestAnimationFrame(render); };
    const onResize = () => { measure(); requestRender(); };
    measure();
    render();
    window.addEventListener("scroll", requestRender, { passive: true });
    window.addEventListener("resize", onResize);
    reducedMotion.addEventListener("change", requestRender);
    return () => {
      window.removeEventListener("scroll", requestRender);
      window.removeEventListener("resize", onResize);
      reducedMotion.removeEventListener("change", requestRender);
      window.cancelAnimationFrame(frame);
      svg.remove();
      panels.forEach((panel) => { panel.inert = false; panel.removeAttribute("aria-hidden"); });
      delete root.dataset.spatialCamera;
    };
  }, []);
  return <style dangerouslySetInnerHTML={{ __html: styles }} />;
}
