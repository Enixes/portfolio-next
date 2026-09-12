"use client";

import { useEffect } from "react";
import gsap from "gsap";

const SECTION_STOP_LOCAL_PROGRESS = 0.72;
const BOARD_TRANSITION_DURATION = 1.8;
const WORK_SCROLL_DURATION = 0.72;
const WORK_SCROLL_STEP = 0.76;
const FRESH_GESTURE_GAP = 190;
const EDGE_EPSILON = 3;

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

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(maximum, Math.max(minimum, value));
}

export function BoardStoryAutoNavigator() {
  useEffect(() => {
    const story = document.querySelector<HTMLElement>("[data-board-story]");
    const panels = story
      ? Array.from(story.querySelectorAll<HTMLElement>("[data-board-panel]"))
      : [];
    const stops = story
      ? Array.from(story.querySelectorAll<HTMLElement>("[data-board-stop]"))
      : [];

    if (!story || panels.length === 0 || stops.length !== panels.length) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const originalScrollBehavior = document.documentElement.style.scrollBehavior;

    let storyTop = 0;
    let travel = 1;
    let boardTween: gsap.core.Tween | null = null;
    let workTween: gsap.core.Tween | null = null;
    let lastWheelAt = -Infinity;
    let touchStartY: number | null = null;
    let touchLastY: number | null = null;
    let touchStartedInWork = false;
    let touchMovedWork = false;
    let touchEdgeTravel = 0;

    let dragPointerId: number | null = null;
    let dragLastY = 0;
    let dragSurface: HTMLElement | null = null;
    let dragEdgeTravel = 0;

    const measure = () => {
      const bounds = story.getBoundingClientRect();
      storyTop = window.scrollY + bounds.top;
      travel = Math.max(1, story.offsetHeight - window.innerHeight);
    };

    const sectionTop = (index: number) =>
      storyTop + travel * ((index + SECTION_STOP_LOCAL_PROGRESS) / panels.length);

    const nearestIndex = () => {
      let winner = 0;
      let distance = Number.POSITIVE_INFINITY;
      panels.forEach((_, index) => {
        const nextDistance = Math.abs(window.scrollY - sectionTop(index));
        if (nextDistance < distance) {
          winner = index;
          distance = nextDistance;
        }
      });
      return winner;
    };

    const workBoard = () => panels[1]?.querySelector<HTMLElement>(".work-cv-board") ?? null;

    const workMaxScroll = (board: HTMLElement) =>
      Math.max(0, board.scrollHeight - board.clientHeight);

    const workCanMove = (board: HTMLElement, direction: number) => {
      const maximum = workMaxScroll(board);
      if (maximum <= EDGE_EPSILON) return false;
      return direction > 0
        ? board.scrollTop < maximum - EDGE_EPSILON
        : board.scrollTop > EDGE_EPSILON;
    };

    const workAtEdge = (board: HTMLElement, direction: number) =>
      !workCanMove(board, direction);

    const storyIsRelevant = () => {
      const y = window.scrollY;
      return y >= storyTop - window.innerHeight * 0.9 &&
        y <= storyTop + travel + window.innerHeight * 0.45;
    };

    const restoreScrollBehavior = () => {
      document.documentElement.style.scrollBehavior = originalScrollBehavior;
    };

    const transitionTo = (targetIndex: number) => {
      const index = clamp(targetIndex, 0, panels.length - 1);
      const destination = sectionTop(index);

      boardTween?.kill();
      workTween?.kill();
      workTween = null;
      document.documentElement.style.scrollBehavior = "auto";

      if (reducedMotion.matches) {
        window.scrollTo(0, destination);
        restoreScrollBehavior();
        panels[index]?.focus({ preventScroll: true });
        return;
      }

      const state = { y: window.scrollY };
      boardTween = gsap.to(state, {
        y: destination,
        duration: BOARD_TRANSITION_DURATION,
        ease: "power3.inOut",
        overwrite: true,
        onUpdate: () => window.scrollTo(0, state.y),
        onComplete: () => {
          boardTween = null;
          restoreScrollBehavior();
          panels[index]?.focus({ preventScroll: true });
        },
        onInterrupt: () => {
          boardTween = null;
          restoreScrollBehavior();
        },
      });
    };

    const stepWork = (board: HTMLElement, direction: number) => {
      const maximum = workMaxScroll(board);
      const step = Math.max(220, board.clientHeight * WORK_SCROLL_STEP);
      const destination = clamp(
        board.scrollTop + direction * step,
        0,
        maximum,
      );

      workTween?.kill();
      if (reducedMotion.matches) {
        board.scrollTop = destination;
        return;
      }

      workTween = gsap.to(board, {
        scrollTop: destination,
        duration: WORK_SCROLL_DURATION,
        ease: "power2.inOut",
        overwrite: true,
        onComplete: () => { workTween = null; },
        onInterrupt: () => { workTween = null; },
      });
    };

    const triggerDirection = (direction: number, freshGesture: boolean) => {
      if (!direction || !storyIsRelevant()) return false;
      if (boardTween || workTween) return true;

      measure();

      if (window.scrollY < storyTop - 4) {
        if (direction > 0 && freshGesture) transitionTo(0);
        return direction > 0;
      }

      if (window.scrollY > storyTop + travel + 4) {
        if (direction < 0 && freshGesture) transitionTo(panels.length - 1);
        return direction < 0;
      }

      const index = nearestIndex();
      const stopDistance = Math.abs(window.scrollY - sectionTop(index));

      // If native scrolling or a history restore left us between stops, the
      // first gesture finishes the nearest intended board before doing anything else.
      if (stopDistance > 8) {
        if (freshGesture) transitionTo(index);
        return true;
      }

      if (index === 1) {
        const board = workBoard();
        if (board && workMaxScroll(board) > EDGE_EPSILON) {
          if (workCanMove(board, direction)) {
            if (freshGesture) stepWork(board, direction);
            return true;
          }

          // Reaching the dossier edge never carries momentum into another board.
          // A fresh gesture at the edge is required to leave Systems.
          if (!freshGesture) return true;
        }
      }

      const next = index + direction;
      if (next < 0 || next >= panels.length) return false;
      if (freshGesture) transitionTo(next);
      return true;
    };

    const onWheel = (event: WheelEvent) => {
      if (event.ctrlKey || Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
      if (!storyIsRelevant()) return;

      const now = performance.now();
      const freshGesture = now - lastWheelAt > FRESH_GESTURE_GAP;
      lastWheelAt = now;
      const direction = Math.sign(event.deltaY);
      if (!direction) return;

      const handled = triggerDirection(direction, freshGesture);
      if (!handled) return;

      event.preventDefault();
      event.stopImmediatePropagation();
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) return;
      const target = event.target as HTMLElement | null;
      if (target?.matches("input,textarea,select,[contenteditable='true']")) return;

      let direction = 0;
      switch (event.key) {
        case "ArrowDown":
        case "PageDown": direction = 1; break;
        case "ArrowUp":
        case "PageUp": direction = -1; break;
        case " ": direction = event.shiftKey ? -1 : 1; break;
        default: return;
      }

      if (!triggerDirection(direction, true)) return;
      event.preventDefault();
      event.stopImmediatePropagation();
    };

    const onTouchStart = (event: TouchEvent) => {
      if (!storyIsRelevant() || event.touches.length !== 1) return;
      touchStartY = event.touches[0].clientY;
      touchLastY = touchStartY;
      touchMovedWork = false;
      touchEdgeTravel = 0;
      const board = workBoard();
      touchStartedInWork = Boolean(
        board && event.target instanceof Node && board.contains(event.target),
      );
    };

    const onTouchMove = (event: TouchEvent) => {
      if (touchStartY === null || touchLastY === null || event.touches.length !== 1) return;
      if (!storyIsRelevant()) return;

      const currentY = event.touches[0].clientY;
      const delta = touchLastY - currentY;
      touchLastY = currentY;

      const index = nearestIndex();
      const board = index === 1 ? workBoard() : null;
      if (touchStartedInWork && board) {
        const direction = Math.sign(delta);
        const before = board.scrollTop;
        const maximum = workMaxScroll(board);
        board.scrollTop = clamp(before + delta, 0, maximum);
        const consumed = board.scrollTop - before;

        if (Math.abs(consumed) > 0.1) touchMovedWork = true;
        if (direction && Math.abs(consumed) < Math.abs(delta) * 0.35 && workAtEdge(board, direction)) {
          touchEdgeTravel += delta - consumed;
        } else if (Math.abs(consumed) > 0.1) {
          touchEdgeTravel = 0;
        }

        event.preventDefault();
        return;
      }

      // Outside the Systems dossier, prevent partial native story scrolling.
      event.preventDefault();
    };

    const onTouchEnd = () => {
      if (touchStartY === null || touchLastY === null) {
        touchStartY = null;
        touchLastY = null;
        touchStartedInWork = false;
        touchMovedWork = false;
        touchEdgeTravel = 0;
        return;
      }

      if (touchStartedInWork && (touchMovedWork || Math.abs(touchEdgeTravel) > 0.1)) {
        if (Math.abs(touchEdgeTravel) >= 58) {
          const direction = Math.sign(touchEdgeTravel);
          const index = nearestIndex();
          const next = index + direction;
          if (next >= 0 && next < panels.length) transitionTo(next);
        }
      } else {
        const distance = touchStartY - touchLastY;
        const direction = Math.abs(distance) >= 44 ? Math.sign(distance) : 0;
        if (direction) triggerDirection(direction, true);
      }

      touchStartY = null;
      touchLastY = null;
      touchStartedInWork = false;
      touchMovedWork = false;
      touchEdgeTravel = 0;
    };

    const onPointerDown = (event: PointerEvent) => {
      if (event.pointerType === "touch" || event.button !== 0 || isInteractiveTarget(event.target)) return;
      if (nearestIndex() !== 1 || Math.abs(window.scrollY - sectionTop(1)) > 12) return;
      const board = workBoard();
      if (!board || !(event.target instanceof Node) || !board.contains(event.target)) return;

      dragPointerId = event.pointerId;
      dragLastY = event.clientY;
      dragSurface = board;
      dragEdgeTravel = 0;
      board.classList.add("is-dragging");
      board.setPointerCapture?.(event.pointerId);
      event.preventDefault();
    };

    const onPointerMove = (event: PointerEvent) => {
      if (dragPointerId !== event.pointerId || !dragSurface) return;
      const delta = dragLastY - event.clientY;
      dragLastY = event.clientY;
      const direction = Math.sign(delta);
      const before = dragSurface.scrollTop;
      const maximum = workMaxScroll(dragSurface);
      dragSurface.scrollTop = clamp(before + delta, 0, maximum);
      const consumed = dragSurface.scrollTop - before;

      if (Math.abs(consumed) < Math.abs(delta) * 0.35 && workAtEdge(dragSurface, direction)) {
        dragEdgeTravel += delta - consumed;
      } else {
        dragEdgeTravel = 0;
      }

      event.preventDefault();
      event.stopImmediatePropagation();
    };

    const finishPointerDrag = (event?: PointerEvent) => {
      if (!dragSurface) return;
      const board = dragSurface;
      const edgeTravel = dragEdgeTravel;
      const pointerId = dragPointerId;

      board.classList.remove("is-dragging");
      if (event && pointerId !== null && board.hasPointerCapture?.(pointerId)) {
        board.releasePointerCapture?.(pointerId);
      }

      dragPointerId = null;
      dragSurface = null;
      dragEdgeTravel = 0;

      if (Math.abs(edgeTravel) >= 72) {
        const direction = Math.sign(edgeTravel);
        const index = nearestIndex();
        const next = index + direction;
        if (next >= 0 && next < panels.length) transitionTo(next);
      }
    };

    const onResize = () => {
      boardTween?.kill();
      workTween?.kill();
      boardTween = null;
      workTween = null;
      restoreScrollBehavior();
      measure();
    };

    window.addEventListener("wheel", onWheel, { passive: false, capture: true });
    window.addEventListener("keydown", onKeyDown, { capture: true });
    window.addEventListener("touchstart", onTouchStart, { passive: true, capture: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false, capture: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true, capture: true });
    window.addEventListener("touchcancel", onTouchEnd, { passive: true, capture: true });
    window.addEventListener("pointerdown", onPointerDown, { capture: true });
    window.addEventListener("pointermove", onPointerMove, { passive: false, capture: true });
    window.addEventListener("pointerup", finishPointerDrag, { capture: true });
    window.addEventListener("pointercancel", finishPointerDrag, { capture: true });
    window.addEventListener("resize", onResize, { passive: true });

    measure();

    return () => {
      window.removeEventListener("wheel", onWheel, true);
      window.removeEventListener("keydown", onKeyDown, true);
      window.removeEventListener("touchstart", onTouchStart, true);
      window.removeEventListener("touchmove", onTouchMove, true);
      window.removeEventListener("touchend", onTouchEnd, true);
      window.removeEventListener("touchcancel", onTouchEnd, true);
      window.removeEventListener("pointerdown", onPointerDown, true);
      window.removeEventListener("pointermove", onPointerMove, true);
      window.removeEventListener("pointerup", finishPointerDrag, true);
      window.removeEventListener("pointercancel", finishPointerDrag, true);
      window.removeEventListener("resize", onResize);
      boardTween?.kill();
      workTween?.kill();
      dragSurface?.classList.remove("is-dragging");
      restoreScrollBehavior();
    };
  }, []);

  return <style dangerouslySetInnerHTML={{ __html: styles }} />;
}
