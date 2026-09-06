"use client";

import { useEffect } from "react";

const styles = `
/* The Work surface is the only long-form board. Let it own a real internal
   scroll range while the outer sticky story remains fixed behind it. */
.work-cv-mounted {
  display:block!important;
  width:100%!important;
  height:100%!important;
  min-height:0!important;
  overflow-y:auto!important;
  overflow-x:hidden!important;
  padding:0!important;
  overscroll-behavior-y:auto!important;
  touch-action:pan-y;
  -webkit-overflow-scrolling:touch;
  scrollbar-gutter:stable;
  scroll-behavior:auto;
  scrollbar-width:thin;
  scrollbar-color:#9b302a rgba(99,78,53,.08);
}
.work-cv-mounted::-webkit-scrollbar{width:8px}
.work-cv-mounted::-webkit-scrollbar-track{background:rgba(99,78,53,.08)}
.work-cv-mounted::-webkit-scrollbar-thumb{background:#9b302a;border-radius:999px}

.work-cv-mounted > .work-cv-board {
  display:block!important;
  position:relative!important;
  width:100%!important;
  height:auto!important;
  min-height:calc(100% + 2px)!important;
  overflow:visible!important;
  align-self:start!important;
  justify-self:stretch!important;
  grid-row:auto!important;
  grid-column:auto!important;
}

/* Animation is enhancement-only. Nothing on the board is allowed to disappear
   just because a timeline or observer has not fired yet. */
.work-cv-mounted .work-cv-header > *,
.work-cv-mounted .work-company-chit,
.work-cv-mounted .work-evidence-chit,
.work-cv-mounted .work-reveal {
  opacity:1!important;
  visibility:visible!important;
}

.skill-chip{opacity:1!important;--skill-delay:0s}
.skill-chip:nth-child(2){--skill-delay:.045s}
.skill-chip:nth-child(3){--skill-delay:.09s}
.skill-chip:nth-child(4){--skill-delay:.135s}
.skill-chip:nth-child(5){--skill-delay:.18s}
.skill-chip:nth-child(6){--skill-delay:.225s}
.skill-chip:nth-child(7){--skill-delay:.27s}
.skill-chip:nth-child(8){--skill-delay:.315s}
.skill-chip:nth-child(9){--skill-delay:.36s}
.work-section.is-visible .skill-chip{animation:skillChipLand .38s ease-out calc(.2s + var(--skill-delay)) forwards!important}
.work-section.is-visible .skill-chip::before{animation:skillOutlineDraw .58s cubic-bezier(.2,.75,.2,1) calc(.24s + var(--skill-delay)) forwards!important}
.work-section.is-visible .skill-chip::after{animation:skillColorIn .52s cubic-bezier(.2,.75,.2,1) calc(.62s + var(--skill-delay)) forwards!important}

/* This long dossier already has enough visual detail; never place the roaming
   Work doodle over it. */
.work-cv-mounted > .board-tech-sketch.tech-work{display:none!important}

@media(max-width:760px){.work-cv-mounted{scrollbar-gutter:auto}}
@media(prefers-reduced-motion:reduce){
 .work-section.is-visible .skill-chip,
 .work-section.is-visible .skill-chip::before,
 .work-section.is-visible .skill-chip::after{animation:none!important}
}
`;

const EDGE_EPSILON = 3;
const WORK_PANEL_SELECTOR = ".scroll-board-red";

type WorkContext = {
  panel: HTMLElement;
  surface: HTMLElement;
};

function visibleWorkContext(): WorkContext | null {
  const panel = document.querySelector<HTMLElement>(WORK_PANEL_SELECTOR);
  const surface = panel?.querySelector<HTMLElement>(".work-cv-mounted") ?? null;
  if (!panel || !surface) return null;

  const style = window.getComputedStyle(panel);
  const opacity = Number.parseFloat(style.opacity || "0");
  const rect = panel.getBoundingClientRect();
  const coversViewportCenter =
    rect.top <= window.innerHeight * 0.5 && rect.bottom >= window.innerHeight * 0.5;

  // Hit-testing the viewport centre tells us which panel the browser actually
  // considers interactive. This is more reliable than the outer story's
  // progress/data attribute, which can change during the same wheel gesture.
  const centreHit = document.elementFromPoint(
    Math.max(0, Math.floor(window.innerWidth * 0.5)),
    Math.max(0, Math.floor(window.innerHeight * 0.5)),
  );
  const hitInsideWork = centreHit?.closest(WORK_PANEL_SELECTOR) === panel;
  const visiblyInteractive =
    style.pointerEvents !== "none" && opacity >= 0.55 && coversViewportCenter;

  return hitInsideWork || visiblyInteractive ? { panel, surface } : null;
}

function maxScroll(surface: HTMLElement) {
  return Math.max(0, surface.scrollHeight - surface.clientHeight);
}

function canConsume(surface: HTMLElement, deltaY: number) {
  if (Math.abs(deltaY) < 0.5) return false;
  const maximum = maxScroll(surface);
  if (maximum <= EDGE_EPSILON) return false;
  return deltaY > 0
    ? surface.scrollTop < maximum - EDGE_EPSILON
    : surface.scrollTop > EDGE_EPSILON;
}

function normalizedWheelDelta(event: WheelEvent, surface: HTMLElement) {
  if (event.deltaMode === WheelEvent.DOM_DELTA_LINE) return event.deltaY * 18;
  if (event.deltaMode === WheelEvent.DOM_DELTA_PAGE) {
    return event.deltaY * surface.clientHeight * 0.88;
  }
  return event.deltaY;
}

export function WorkCaseBoardPolish() {
  useEffect(() => {
    let lastTouchY: number | null = null;
    let lockedWindowY: number | null = null;
    let lockedDirection = 0;
    let restoringWindow = false;

    const releaseWindow = () => {
      lockedWindowY = null;
      lockedDirection = 0;
    };

    const lockWindow = (deltaY: number) => {
      if (lockedWindowY === null) lockedWindowY = window.scrollY;
      lockedDirection = Math.sign(deltaY);
    };

    const consume = (surface: HTMLElement, deltaY: number) => {
      if (!canConsume(surface, deltaY)) return false;
      lockWindow(deltaY);
      const maximum = maxScroll(surface);
      surface.scrollTop = Math.max(0, Math.min(maximum, surface.scrollTop + deltaY));
      return true;
    };

    const onWheel = (event: WheelEvent) => {
      if (event.ctrlKey || Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
      const context = visibleWorkContext();
      if (!context) {
        releaseWindow();
        return;
      }

      const deltaY = normalizedWheelDelta(event, context.surface);
      if (!consume(context.surface, deltaY)) {
        // At the dossier's edge, deliberately release this gesture to the outer
        // story so the next board remains reachable naturally.
        releaseWindow();
        return;
      }

      event.preventDefault();
      event.stopImmediatePropagation();
    };

    const onWindowScroll = () => {
      if (restoringWindow || lockedWindowY === null || lockedDirection === 0) return;
      const context = visibleWorkContext();
      if (!context || !canConsume(context.surface, lockedDirection)) {
        releaseWindow();
        return;
      }

      if (Math.abs(window.scrollY - lockedWindowY) <= 0.5) return;
      restoringWindow = true;
      window.scrollTo(0, lockedWindowY);
      window.requestAnimationFrame(() => {
        restoringWindow = false;
      });
    };

    const onTouchStart = (event: TouchEvent) => {
      const context = visibleWorkContext();
      lastTouchY = context && event.touches.length === 1
        ? event.touches[0].clientY
        : null;
    };

    const onTouchMove = (event: TouchEvent) => {
      const context = visibleWorkContext();
      if (!context || lastTouchY === null || event.touches.length !== 1) {
        lastTouchY = null;
        releaseWindow();
        return;
      }

      const currentY = event.touches[0].clientY;
      const deltaY = lastTouchY - currentY;
      lastTouchY = currentY;

      if (!consume(context.surface, deltaY)) {
        releaseWindow();
        return;
      }

      event.preventDefault();
      event.stopImmediatePropagation();
    };

    const onTouchEnd = () => {
      lastTouchY = null;
      // Keep the outer window pinned only while another gesture is actively
      // consuming the inner dossier.
      releaseWindow();
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) return;
      const target = event.target as HTMLElement | null;
      if (target?.matches("input,textarea,select,[contenteditable='true']")) return;

      const context = visibleWorkContext();
      if (!context) return;

      let deltaY = 0;
      switch (event.key) {
        case "ArrowDown": deltaY = 72; break;
        case "ArrowUp": deltaY = -72; break;
        case "PageDown": deltaY = context.surface.clientHeight * 0.82; break;
        case "PageUp": deltaY = -context.surface.clientHeight * 0.82; break;
        case " ":
          deltaY = (event.shiftKey ? -1 : 1) * context.surface.clientHeight * 0.82;
          break;
        default: return;
      }

      if (!consume(context.surface, deltaY)) {
        releaseWindow();
        return;
      }
      event.preventDefault();
      event.stopImmediatePropagation();
    };

    window.addEventListener("wheel", onWheel, { passive: false, capture: true });
    window.addEventListener("scroll", onWindowScroll, { passive: true, capture: true });
    window.addEventListener("touchstart", onTouchStart, { passive: true, capture: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false, capture: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true, capture: true });
    window.addEventListener("touchcancel", onTouchEnd, { passive: true, capture: true });
    window.addEventListener("keydown", onKeyDown, { capture: true });

    return () => {
      window.removeEventListener("wheel", onWheel, true);
      window.removeEventListener("scroll", onWindowScroll, true);
      window.removeEventListener("touchstart", onTouchStart, true);
      window.removeEventListener("touchmove", onTouchMove, true);
      window.removeEventListener("touchend", onTouchEnd, true);
      window.removeEventListener("touchcancel", onTouchEnd, true);
      window.removeEventListener("keydown", onKeyDown, true);
    };
  }, []);

  return <style dangerouslySetInnerHTML={{ __html: styles }} />;
}
