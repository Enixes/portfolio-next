"use client";

import { useEffect } from "react";

const styles = `
/* The shared story surface stays fixed. The dossier itself owns its viewport. */
.work-cv-mounted {
  display:block!important;
  width:100%!important;
  height:100%!important;
  min-height:0!important;
  overflow:hidden!important;
  padding:0!important;
}

.work-cv-mounted > .work-cv-board {
  display:block!important;
  position:relative!important;
  width:100%!important;
  height:100%!important;
  min-height:0!important;
  overflow-y:auto!important;
  overflow-x:hidden!important;
  align-self:stretch!important;
  justify-self:stretch!important;
  grid-row:auto!important;
  grid-column:auto!important;
  overscroll-behavior-y:auto!important;
  touch-action:pan-x pinch-zoom;
  -webkit-overflow-scrolling:touch;
  scrollbar-gutter:stable;
  scroll-behavior:auto;
  scrollbar-width:thin;
  scrollbar-color:#9b302a rgba(99,78,53,.08);
  cursor:grab;
}
.work-cv-mounted > .work-cv-board.is-dragging {
  cursor:grabbing!important;
  user-select:none!important;
  -webkit-user-select:none!important;
}
.work-cv-mounted > .work-cv-board a,
.work-cv-mounted > .work-cv-board button { cursor:pointer; }
.work-cv-mounted > .work-cv-board::-webkit-scrollbar{width:8px}
.work-cv-mounted > .work-cv-board::-webkit-scrollbar-track{background:rgba(99,78,53,.08)}
.work-cv-mounted > .work-cv-board::-webkit-scrollbar-thumb{background:#9b302a;border-radius:999px}

/* Animation is enhancement-only. Nothing on the board is allowed to disappear. */
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

.work-cv-mounted > .board-tech-sketch.tech-work{display:none!important}

@media(max-width:760px){.work-cv-mounted > .work-cv-board{scrollbar-gutter:auto}}
@media(prefers-reduced-motion:reduce){
 .work-section.is-visible .skill-chip,
 .work-section.is-visible .skill-chip::before,
 .work-section.is-visible .skill-chip::after{animation:none!important}
}
`;

const EDGE_EPSILON = 1;
const WORK_PANEL_SELECTOR = ".scroll-board-red";

type WorkContext = {
  panel: HTMLElement;
  surface: HTMLElement;
};

function visibleWorkContext(): WorkContext | null {
  const panel = document.querySelector<HTMLElement>(WORK_PANEL_SELECTOR);
  const surface = panel?.querySelector<HTMLElement>(".work-cv-board") ?? null;
  if (!panel || !surface) return null;

  const style = window.getComputedStyle(panel);
  const opacity = Number.parseFloat(style.opacity || "0");
  const rect = panel.getBoundingClientRect();
  const coversViewportCenter =
    rect.top <= window.innerHeight * 0.5 && rect.bottom >= window.innerHeight * 0.5;

  const centreHit = document.elementFromPoint(
    Math.max(0, Math.floor(window.innerWidth * 0.5)),
    Math.max(0, Math.floor(window.innerHeight * 0.5)),
  );
  const hitInsideWork = centreHit?.closest(WORK_PANEL_SELECTOR) === panel;
  const visiblyInteractive =
    style.pointerEvents !== "none" && opacity >= 0.5 && coversViewportCenter;

  return hitInsideWork || visiblyInteractive ? { panel, surface } : null;
}

function maxScroll(surface: HTMLElement) {
  return Math.max(0, surface.scrollHeight - surface.clientHeight);
}

/*
 * Route one vertical gesture through two scroll domains. The dossier consumes
 * as much as it physically can. Any remainder is applied to the outer page in
 * the same frame, so reaching an edge can never trap the user in Systems.
 */
function routeDelta(surface: HTMLElement, deltaY: number) {
  if (!Number.isFinite(deltaY) || Math.abs(deltaY) < 0.1) return;

  const maximum = maxScroll(surface);
  const start = surface.scrollTop;
  const next = Math.max(0, Math.min(maximum, start + deltaY));
  const consumed = next - start;
  const remainder = deltaY - consumed;

  if (Math.abs(consumed) > 0.1) surface.scrollTop = next;

  if (Math.abs(remainder) > EDGE_EPSILON) {
    window.scrollBy({ top: remainder, left: 0, behavior: "auto" });
  }
}

function normalizedWheelDelta(event: WheelEvent, surface: HTMLElement) {
  if (event.deltaMode === WheelEvent.DOM_DELTA_LINE) return event.deltaY * 18;
  if (event.deltaMode === WheelEvent.DOM_DELTA_PAGE) {
    return event.deltaY * surface.clientHeight * 0.88;
  }
  return event.deltaY;
}

function isInteractiveTarget(target: EventTarget | null) {
  return target instanceof Element && Boolean(
    target.closest("a,button,input,textarea,select,summary,[contenteditable='true']"),
  );
}

export function WorkCaseBoardPolish() {
  useEffect(() => {
    let lastTouchY: number | null = null;
    let dragPointerId: number | null = null;
    let dragLastY = 0;
    let dragSurface: HTMLElement | null = null;

    const onWheel = (event: WheelEvent) => {
      if (event.ctrlKey || Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
      const context = visibleWorkContext();
      if (!context) return;

      event.preventDefault();
      event.stopImmediatePropagation();
      routeDelta(context.surface, normalizedWheelDelta(event, context.surface));
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
        return;
      }

      const currentY = event.touches[0].clientY;
      const deltaY = lastTouchY - currentY;
      lastTouchY = currentY;

      event.preventDefault();
      event.stopImmediatePropagation();
      routeDelta(context.surface, deltaY);
    };

    const onTouchEnd = () => {
      lastTouchY = null;
    };

    const onPointerDown = (event: PointerEvent) => {
      if (event.pointerType === "touch" || event.button !== 0 || isInteractiveTarget(event.target)) return;
      const context = visibleWorkContext();
      if (!context || !context.surface.contains(event.target as Node)) return;

      dragPointerId = event.pointerId;
      dragLastY = event.clientY;
      dragSurface = context.surface;
      dragSurface.classList.add("is-dragging");
      dragSurface.setPointerCapture?.(event.pointerId);
      event.preventDefault();
    };

    const onPointerMove = (event: PointerEvent) => {
      if (dragPointerId !== event.pointerId || !dragSurface) return;
      const deltaY = dragLastY - event.clientY;
      dragLastY = event.clientY;

      event.preventDefault();
      event.stopImmediatePropagation();
      routeDelta(dragSurface, deltaY);
    };

    const finishPointerDrag = (event?: PointerEvent) => {
      if (dragSurface) {
        dragSurface.classList.remove("is-dragging");
        if (event && dragSurface.hasPointerCapture?.(event.pointerId)) {
          dragSurface.releasePointerCapture?.(event.pointerId);
        }
      }
      dragPointerId = null;
      dragSurface = null;
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

      event.preventDefault();
      event.stopImmediatePropagation();
      routeDelta(context.surface, deltaY);
    };

    window.addEventListener("wheel", onWheel, { passive: false, capture: true });
    window.addEventListener("touchstart", onTouchStart, { passive: true, capture: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false, capture: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true, capture: true });
    window.addEventListener("touchcancel", onTouchEnd, { passive: true, capture: true });
    window.addEventListener("pointerdown", onPointerDown, { capture: true });
    window.addEventListener("pointermove", onPointerMove, { passive: false, capture: true });
    window.addEventListener("pointerup", finishPointerDrag, { capture: true });
    window.addEventListener("pointercancel", finishPointerDrag, { capture: true });
    window.addEventListener("keydown", onKeyDown, { capture: true });

    return () => {
      window.removeEventListener("wheel", onWheel, true);
      window.removeEventListener("touchstart", onTouchStart, true);
      window.removeEventListener("touchmove", onTouchMove, true);
      window.removeEventListener("touchend", onTouchEnd, true);
      window.removeEventListener("touchcancel", onTouchEnd, true);
      window.removeEventListener("pointerdown", onPointerDown, true);
      window.removeEventListener("pointermove", onPointerMove, true);
      window.removeEventListener("pointerup", finishPointerDrag, true);
      window.removeEventListener("pointercancel", finishPointerDrag, true);
      window.removeEventListener("keydown", onKeyDown, true);
      dragSurface?.classList.remove("is-dragging");
    };
  }, []);

  return <style dangerouslySetInnerHTML={{ __html: styles }} />;
}
