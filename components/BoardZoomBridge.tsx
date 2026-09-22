"use client";

import { useEffect } from "react";

const styles = `
.board-scroll-story {
  height: 780svh;
}

.board-scroll-sticky {
  overflow: hidden;
  isolation: isolate;
  background:
    radial-gradient(circle at 50% 45%, rgba(245,236,217,.08), transparent 48%),
    #201d19;
}

.board-story-room {
  z-index: 0 !important;
  opacity: .2;
  filter: saturate(.72) brightness(.62) blur(.5px);
  will-change: transform, opacity;
}

.zoom-master-board {
  position: absolute;
  z-index: 2;
  top: 50%;
  left: 50%;
  width: min(86vw, 1300px);
  margin: 0;
  pointer-events: none;
  opacity: 1;
  transform: translate3d(-50%, -50%, 0) scale(.88);
  transform-origin: 50% 50%;
  will-change: transform, opacity, filter;
  box-shadow: 0 40px 100px rgba(0,0,0,.48);
}

.zoom-master-board,
.zoom-master-board * {
  animation: none !important;
  transition: none !important;
}

.zoom-master-board .board-zone,
.zoom-master-board a {
  pointer-events: none !important;
}

.board-scroll-track {
  position: absolute !important;
  z-index: 5;
  inset: 0;
  display: block !important;
  width: 100% !important;
  height: 100% !important;
  transform: none !important;
  will-change: auto !important;
}

.scroll-board-panel {
  position: absolute !important;
  inset: 0 !important;
  width: 100% !important;
  min-width: 0 !important;
  height: 100% !important;
  padding: 70px 0 0 !important;
  overflow: hidden;
  opacity: 0;
  pointer-events: none;
  will-change: transform, opacity;
  transition: none !important;
}

.story-board-frame {
  width: 100% !important;
  height: 100% !important;
  padding: 0 !important;
  border: 0 !important;
  border-radius: 0 !important;
  background: transparent !important;
  box-shadow: none !important;
}

.story-board-surface {
  position: relative;
  width: 100%;
  height: 100%;
  padding: clamp(42px, 6vh, 74px) clamp(36px, 7vw, 110px) clamp(30px, 5vh, 60px) !important;
  overflow: hidden;
  border: 0 !important;
  border-radius: 0 !important;
  background:
    radial-gradient(circle at 12% 14%, rgba(255,255,255,.66), transparent 25%),
    radial-gradient(circle at 86% 78%, rgba(124,98,61,.075), transparent 32%),
    linear-gradient(rgba(63,72,71,.035) 1px, transparent 1px),
    linear-gradient(90deg, rgba(63,72,71,.035) 1px, transparent 1px),
    #f4f3ec !important;
  background-size: auto, auto, 28px 28px, 28px 28px, auto !important;
  box-shadow: inset 0 0 100px rgba(73,61,44,.12) !important;
}

.story-board-surface::after {
  content: "";
  position: absolute;
  z-index: 0;
  inset: 0;
  pointer-events: none;
  background:
    linear-gradient(90deg, color-mix(in srgb, var(--story-marker) 28%, transparent), transparent 12%),
    radial-gradient(ellipse at 50% -8%, rgba(255,255,255,.48), transparent 44%);
  opacity: .42;
}

.story-board-surface > * {
  position: relative;
  z-index: 1;
}

.story-board-index {
  top: auto !important;
  left: auto !important;
  margin: 0 0 12px !important;
  color: var(--story-marker) !important;
  font-size: 9px !important;
  letter-spacing: .16em !important;
}

.story-board-header,
.work-cv-header {
  will-change: transform, opacity;
  transition: none !important;
}

.story-board-header {
  width: min(760px, 68vw) !important;
  margin: 0 !important;
}

.story-board-header > span {
  color: var(--story-marker) !important;
  font-family: var(--hand) !important;
  font-size: clamp(16px, 1.5vw, 23px) !important;
  text-transform: none !important;
  letter-spacing: .01em !important;
}

.story-board-header h2 {
  margin-top: 8px !important;
  font: 750 clamp(40px, 5.2vw, 76px)/.9 var(--hand) !important;
  letter-spacing: -.035em !important;
  transform: rotate(-.7deg);
}

.story-board-header p {
  max-width: 700px !important;
  margin-top: 14px !important;
  font-size: clamp(9px, .8vw, 12px) !important;
  line-height: 1.55 !important;
}

.story-board-grid {
  width: min(1240px, 100%) !important;
  margin-top: clamp(26px, 5vh, 58px) !important;
  padding-top: 0 !important;
  gap: clamp(18px, 2.4vw, 36px) !important;
}

.story-case,
.work-company-chit,
.work-evidence-chit,
.work-tenure-tag,
.work-cv-pencil,
.work-cv-legend {
  will-change: transform, opacity;
  transition-property: box-shadow !important;
}

.story-case {
  min-height: clamp(180px, 27vh, 260px) !important;
  padding: clamp(22px, 2.5vw, 34px) !important;
  box-shadow: 5px 9px 18px rgba(63,48,29,.16) !important;
}

.story-case:nth-child(1) { transform: rotate(-1.4deg); }
.story-case:nth-child(2) { transform: rotate(1deg) translateY(14px); }
.story-case:nth-child(3) { transform: rotate(-.5deg) translateY(-4px); }

.story-case h3 {
  font-size: clamp(24px, 2.5vw, 38px) !important;
}

.story-case strong {
  font-size: clamp(11px, 1vw, 15px) !important;
}

.story-case p {
  margin-top: 14px !important;
  font-size: clamp(9px, .75vw, 11px) !important;
  line-height: 1.55 !important;
}

.story-board-footnote {
  right: clamp(30px, 6vw, 90px) !important;
  bottom: clamp(24px, 4vh, 48px) !important;
  font-family: var(--hand) !important;
  font-size: clamp(11px, 1vw, 16px) !important;
  transform: rotate(-2deg);
}

.work-cv-thread .thread-main,
.work-cv-thread .thread-branch {
  animation: none !important;
}

.board-story-progress {
  z-index: 20 !important;
  top: 92px !important;
  right: 24px !important;
  left: auto !important;
  width: auto !important;
  padding: 8px 10px !important;
  border: 1px solid rgba(255,255,255,.12);
  border-radius: 4px;
  background: rgba(28,26,23,.78);
  backdrop-filter: blur(8px);
  color: #eee6d8;
}

.board-story-progress > span {
  font-size: 7px !important;
}

.preview-header {
  z-index: 40 !important;
}

.preview-nav a.is-active {
  background: #eee5d5;
  color: #25221e;
}

@media (max-width: 900px) {
  .zoom-master-board { width: 94vw; }
  .story-board-surface {
    padding-inline: clamp(24px, 5vw, 44px) !important;
  }
  .story-board-header { width: min(82vw, 680px) !important; }
  .story-board-grid { gap: 14px !important; }
  .story-case { min-height: 170px !important; }
}

@media (max-width: 760px) {
  .board-scroll-story { height: 720svh; }
  .scroll-board-panel { padding-top: 64px !important; }
  .zoom-master-board { width: 96vw; }
  .board-story-progress {
    top: 72px !important;
    right: 10px !important;
  }
  .board-story-progress > span { display: none !important; }
  .story-board-surface {
    padding: 28px 18px 24px !important;
    overflow-y: auto;
    overscroll-behavior: contain;
  }
  .story-board-header { width: 92% !important; }
  .story-board-header > span { font-size: 15px !important; }
  .story-board-header h2 { font-size: clamp(34px, 11vw, 48px) !important; }
  .story-board-header p { font-size: 8px !important; }
  .story-board-grid {
    grid-template-columns: 1fr !important;
    margin-top: 22px !important;
    gap: 12px !important;
  }
  .story-case {
    min-height: 138px !important;
    padding: 17px 18px !important;
  }
  .story-case:nth-child(n) { transform: rotate(0deg) !important; }
  .story-case h3 { font-size: 25px !important; }
  .story-case p { font-size: 8px !important; }
}

@media (prefers-reduced-motion: reduce) {
  .zoom-master-board { display: none; }
  .scroll-board-panel { transform: none !important; }
  .story-board-header,
  .work-cv-header,
  .story-case,
  .work-company-chit,
  .work-evidence-chit,
  .work-tenure-tag,
  .work-cv-pencil,
  .work-cv-legend { transform: none !important; opacity: 1 !important; }
}
`;

export function BoardZoomBridge() {
  useEffect(() => {
    const source = document.querySelector<HTMLElement>(".evidence-board-frame");
    const host = document.querySelector<HTMLElement>(".board-scroll-sticky");
    const progressLabel = host?.querySelector<HTMLElement>(".board-story-progress > span");

    if (!source || !host) return;

    const clone = source.cloneNode(true) as HTMLElement;
    clone.classList.add("zoom-master-board");
    clone.dataset.zoomMasterBoard = "";
    clone.setAttribute("aria-hidden", "true");
    clone.setAttribute("inert", "");

    clone.querySelectorAll<HTMLElement>("[id]").forEach((element) => element.removeAttribute("id"));
    clone.querySelectorAll<HTMLAnchorElement>("a").forEach((link) => {
      link.removeAttribute("href");
      link.tabIndex = -1;
    });

    host.prepend(clone);

    const oldProgressText = progressLabel?.textContent ?? "";
    if (progressLabel) progressLabel.textContent = "Zoom into the evidence";

    return () => {
      clone.remove();
      if (progressLabel) progressLabel.textContent = oldProgressText;
    };
  }, []);

  return <style dangerouslySetInnerHTML={{ __html: styles }} />;
}
