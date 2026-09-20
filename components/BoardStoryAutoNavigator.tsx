"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { BOARD_NAVIGATE_EVENT, SECTION_STOP_LOCAL_PROGRESS } from "./BoardScrollController";

const styles = `
/*
 * The outer story owns board-to-board motion. Systems is the one exception:
 * once zoomed in, the dossier gets a real internal viewport and owns vertical
 * movement until its top/bottom edge is reached.
 */
.work-cv-mounted {
  overflow: hidden !important;
  min-height: 0 !important;
}
.work-cv-mounted > .work-cv-board {
  display: block !important;
  position: relative !important;
  width: 100% !important;
  height: 100% !important;
  min-height: 0 !important;
  overflow-y: auto !important;
  overflow-x: hidden !important;
  overscroll-behavior-y: contain !important;
  scroll-behavior: auto !important;
  scrollbar-gutter: stable;
  touch-action: pan-x pinch-zoom;
  cursor: grab;
  -webkit-overflow-scrolling: touch;
}
.work-cv-mounted > .work-cv-board.is-dragging {
  cursor: grabbing !important;
  user-select: none !important;
  -webkit-user-select: none !important;
}
.work-cv-mounted > .work-cv-board a,
.work-cv-mounted > .work-cv-board button { cursor: pointer; }

.life-live-board {
  overscroll-behavior-y: contain !important;
  touch-action: pan-x pinch-zoom;
  -webkit-overflow-scrolling: touch;
  scroll-behavior: auto !important;
  scrollbar-gutter: stable;
}

.blog-live-board { touch-action: pan-x pinch-zoom !important; }

/* Content visibility must never depend on an observer/timeline firing. */
.work-cv-mounted .work-cv-header > *,
.work-cv-mounted .work-company-chit,
.work-cv-mounted .work-evidence-chit,
.work-cv-mounted .work-reveal,
.work-cv-mounted .skill-chip {
  opacity: 1 !important;
  visibility: visible !important;
}

/* Reliable marker stagger without unsupported CSS multiplication. */
.work-cv-mounted .skill-chip { --skill-delay: 0s; }
.work-cv-mounted .skill-chip:nth-child(2) { --skill-delay: .045s; }
.work-cv-mounted .skill-chip:nth-child(3) { --skill-delay: .09s; }
.work-cv-mounted .skill-chip:nth-child(4) { --skill-delay: .135s; }
.work-cv-mounted .skill-chip:nth-child(5) { --skill-delay: .18s; }
.work-cv-mounted .skill-chip:nth-child(6) { --skill-delay: .225s; }
.work-cv-mounted .skill-chip:nth-child(7) { --skill-delay: .27s; }
.work-cv-mounted .skill-chip:nth-child(8) { --skill-delay: .315s; }
.work-cv-mounted .skill-chip:nth-child(9) { --skill-delay: .36s; }
.work-cv-mounted .work-section.is-visible .skill-chip {
  animation: skillChipLand .38s ease-out calc(.2s + var(--skill-delay)) forwards !important;
}
.work-cv-mounted .work-section.is-visible .skill-chip::before {
  animation: skillOutlineDraw .58s cubic-bezier(.2,.75,.2,1) calc(.24s + var(--skill-delay)) forwards !important;
}
.work-cv-mounted .work-section.is-visible .skill-chip::after {
  animation: skillColorIn .52s cubic-bezier(.2,.75,.2,1) calc(.62s + var(--skill-delay)) forwards !important;
}

@media (max-width: 760px) {
  .work-cv-mounted > .work-cv-board { scrollbar-gutter: auto; }
}
@media (prefers-reduced-motion: reduce) {
  .work-cv-mounted .work-section.is-visible .skill-chip,
  .work-cv-mounted .work-section.is-visible .skill-chip::before,
  .work-cv-mounted .work-section.is-visible .skill-chip::after { animation: none !important; }
}
`;


function isInteractiveTarget(target: EventTarget | null) {
  return target instanceof Element && Boolean(
    target.closest("a,button,input,textarea,select,summary,[contenteditable='true']"),
  );
}

export function BoardStoryAutoNavigator() {
  useEffect(() => {
    const story = document.querySelector<HTMLElement>("[data-board-story]");
    const panels = Array.from(story?.querySelectorAll<HTMLElement>("[data-board-panel]") ?? []);
    if (!story || !panels.length) return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let storyTop = 0;
    let travel = 1;
    let lastWheelAt = -Infinity;
    let internalTween: gsap.core.Tween | null = null;
    let gesture: { startY: number; lastY: number; surface: HTMLElement | null;
      top: boolean; bottom: boolean; pointerId?: number } | null = null;
    const measure = () => {
      storyTop = window.scrollY + story.getBoundingClientRect().top;
      travel = Math.max(1, story.offsetHeight - window.innerHeight);
    };
    const sectionTop = (index: number) =>
      storyTop + travel * ((index + SECTION_STOP_LOCAL_PROGRESS) / panels.length);
    const position = () => (window.scrollY - storyTop) / travel * panels.length - SECTION_STOP_LOCAL_PROGRESS;
    const indexNow = () => Math.max(0, Math.min(panels.length - 1, Math.round(position())));
    const busy = () => document.documentElement.dataset.boardNavigating === "true";
    const surfaceFor = (index: number) => panels[index]?.querySelector<HTMLElement>(
      ".work-cv-board,.life-live-board,.blog-live-board,.profile-live-mounted",
    ) ?? panels[index]?.querySelector<HTMLElement>(".story-board-surface") ?? null;
    const maximum = (surface: HTMLElement) => Math.max(0, surface.scrollHeight - surface.clientHeight);
    const canMove = (surface: HTMLElement, direction: number) => direction > 0
      ? surface.scrollTop < maximum(surface) - 3 : surface.scrollTop > 3;
    const stopInternal = () => { internalTween?.kill(); internalTween = null; };
    const navigate = (index: number) => {
      stopInternal();
      window.dispatchEvent(new CustomEvent(BOARD_NAVIGATE_EVENT, { detail: { index } }));
    };
    const relevant = () => {
      // On tall mobile heroes, do not steal scrolling before the Contact chit.
      const contact = document.querySelector<HTMLElement>(".preview-hero .board-zone-contact");
      if (window.scrollY < storyTop && window.innerWidth <= 900 &&
          contact && contact.getBoundingClientRect().bottom > window.innerHeight * .75) return false;
      return window.scrollY >= storyTop - window.innerHeight * .32 &&
        window.scrollY <= sectionTop(panels.length - 1) + 16;
    };
    const route = (direction: number, fresh: boolean) => {
      if (!direction || (!busy() && !relevant())) return false;
      if (busy() || internalTween) return true;
      const index = indexNow();
      const surface = surfaceFor(index);
      const atStop = Math.abs(window.scrollY - sectionTop(index)) < 8;
      if (atStop && surface && canMove(surface, direction)) {
        if (fresh) {
          const destination = Math.max(0, Math.min(maximum(surface),
            surface.scrollTop + direction * Math.max(180, surface.clientHeight * .78)));
          if (reducedMotion.matches) surface.scrollTop = destination;
          else internalTween = gsap.to(surface, { scrollTop: destination, duration: .58,
            ease: "power2.inOut", onComplete: () => { internalTween = null; } });
        }
        return true;
      }
      // At outer boundaries every event is released, including momentum.
      if ((direction < 0 && window.scrollY <= sectionTop(0) + 8) ||
          (direction > 0 && window.scrollY >= sectionTop(panels.length - 1) - 8)) return false;
      const target = atStop ? index + direction :
        direction > 0 ? Math.ceil(position()) : Math.floor(position());
      if (fresh) navigate(Math.max(0, Math.min(panels.length - 1, target)));
      return true;
    };
    const onWheel = (event: WheelEvent) => {
      if (event.ctrlKey || Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
      const now = performance.now();
      const fresh = now - lastWheelAt > 190;
      lastWheelAt = now;
      if (route(Math.sign(event.deltaY), fresh)) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey ||
          isInteractiveTarget(event.target)) return;
      const direction = event.key === "ArrowDown" || event.key === "PageDown" ? 1
        : event.key === "ArrowUp" || event.key === "PageUp" ? -1
        : event.key === " " ? event.shiftKey ? -1 : 1 : 0;
      if (route(direction, !event.repeat)) { event.preventDefault(); event.stopImmediatePropagation(); }
    };
    const beginGesture = (y: number, pointerId?: number) => {
      if (!relevant() && !busy()) return false;
      stopInternal();
      const surface = surfaceFor(indexNow());
      gesture = { startY: y, lastY: y, surface,
        top: !surface || !canMove(surface, -1), bottom: !surface || !canMove(surface, 1), pointerId };
      return true;
    };
    const moveGesture = (y: number) => {
      if (!gesture) return false;
      const delta = gesture.lastY - y;
      gesture.lastY = y;
      if (busy()) return true;
      const direction = Math.sign(delta);
      const surface = gesture.surface;
      if (surface && canMove(surface, direction) &&
          Math.abs(window.scrollY - sectionTop(indexNow())) < 8) {
        surface.scrollTop = Math.max(0, Math.min(maximum(surface), surface.scrollTop + delta));
        return true;
      }
      // Native outer-boundary touch movement must remain available.
      if ((direction < 0 && window.scrollY <= sectionTop(0) + 8) ||
          (direction > 0 && window.scrollY >= sectionTop(panels.length - 1) - 8)) return false;
      return true;
    };
    const finishGesture = () => {
      if (!gesture) return;
      const { startY, lastY, top, bottom, surface, pointerId } = gesture;
      gesture = null;
      surface?.classList.remove("is-dragging");
      if (surface && pointerId !== undefined && surface.hasPointerCapture?.(pointerId)) {
        surface.releasePointerCapture(pointerId);
      }
      const distance = startY - lastY;
      const direction = Math.sign(distance);
      // Scrolling content to an edge never carries the same gesture into a new
      // board. A fresh swipe at that edge enters the next spatial stop.
      if (Math.abs(distance) >= 48 && (direction > 0 ? bottom : top)) route(direction, true);
    };
    const onTouchStart = (event: TouchEvent) => {
      gesture = null;
      if (event.touches.length === 1) beginGesture(event.touches[0].clientY);
    };
    const onTouchMove = (event: TouchEvent) => {
      if (event.touches.length === 1 && moveGesture(event.touches[0].clientY)) event.preventDefault();
    };
    const cancelGesture = () => { gesture?.surface?.classList.remove("is-dragging"); gesture = null; };
    const onPointerDown = (event: PointerEvent) => {
      if (event.pointerType === "touch" || event.button || isInteractiveTarget(event.target) || busy()) return;
      const surface = surfaceFor(indexNow());
      if (!surface || !(event.target instanceof Node) || !surface.contains(event.target)) return;
      if (beginGesture(event.clientY, event.pointerId)) {
        surface.classList.add("is-dragging");
        surface.setPointerCapture?.(event.pointerId);
        event.preventDefault();
      }
    };
    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType === "touch" || gesture?.pointerId !== event.pointerId) return;
      if (moveGesture(event.clientY)) event.preventDefault();
    };
    const onPointerUp = (event: PointerEvent) => {
      if (gesture?.pointerId === event.pointerId) finishGesture();
    };
    const onResize = () => { stopInternal(); cancelGesture(); measure(); };
    measure();
    window.addEventListener("wheel", onWheel, { passive: false, capture: true });
    window.addEventListener("keydown", onKeyDown, { capture: true });
    window.addEventListener("touchstart", onTouchStart, { passive: true, capture: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false, capture: true });
    window.addEventListener("touchend", finishGesture, { passive: true, capture: true });
    window.addEventListener("touchcancel", cancelGesture, { passive: true, capture: true });
    window.addEventListener("pointerdown", onPointerDown, { capture: true });
    window.addEventListener("pointermove", onPointerMove, { passive: false, capture: true });
    window.addEventListener("pointerup", onPointerUp, { capture: true });
    window.addEventListener("pointercancel", cancelGesture, { capture: true });
    window.addEventListener(BOARD_NAVIGATE_EVENT, stopInternal);
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("wheel", onWheel, true);
      window.removeEventListener("keydown", onKeyDown, true);
      window.removeEventListener("touchstart", onTouchStart, true);
      window.removeEventListener("touchmove", onTouchMove, true);
      window.removeEventListener("touchend", finishGesture, true);
      window.removeEventListener("touchcancel", cancelGesture, true);
      window.removeEventListener("pointerdown", onPointerDown, true);
      window.removeEventListener("pointermove", onPointerMove, true);
      window.removeEventListener("pointerup", onPointerUp, true);
      window.removeEventListener("pointercancel", cancelGesture, true);
      window.removeEventListener(BOARD_NAVIGATE_EVENT, stopInternal);
      window.removeEventListener("resize", onResize);
      stopInternal();
      cancelGesture();
    };
  }, []);
  return <style dangerouslySetInnerHTML={{ __html: styles }} />;
}
