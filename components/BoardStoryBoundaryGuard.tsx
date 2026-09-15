"use client";

import { useEffect } from "react";

const SECTION_STOP_LOCAL_PROGRESS = 0.72;
const BOUNDARY_EPSILON = 16;

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(maximum, Math.max(minimum, value));
}

/**
 * The board navigator intentionally consumes wheel/touch momentum between
 * detail-board stops. At the two outer story boundaries that behavior is
 * wrong: Profile -> Hero and Contact -> page end must return control to the
 * browser continuously, otherwise the second event in a gesture is mistaken
 * for an in-story "between stops" state and snaps back to the board.
 *
 * Mount this component before BoardStoryAutoNavigator so these boundary
 * gestures bypass the story navigator without cancelling their native default.
 */
export function BoardStoryBoundaryGuard() {
  useEffect(() => {
    const story = document.querySelector<HTMLElement>("[data-board-story]");
    const panels = story
      ? Array.from(story.querySelectorAll<HTMLElement>("[data-board-panel]"))
      : [];

    if (!story || panels.length === 0) return;

    let storyTop = 0;
    let travel = 1;
    let touchLastY: number | null = null;

    const measure = () => {
      const bounds = story.getBoundingClientRect();
      storyTop = window.scrollY + bounds.top;
      travel = Math.max(1, story.offsetHeight - window.innerHeight);
    };

    const sectionTop = (index: number) =>
      storyTop + travel * ((index + SECTION_STOP_LOCAL_PROGRESS) / panels.length);

    const nearStory = () => {
      const y = window.scrollY;
      return y >= storyTop - window.innerHeight * 0.95 &&
        y <= storyTop + travel + window.innerHeight * 0.5;
    };

    const position = () => {
      const progress = clamp((window.scrollY - storyTop) / travel, 0, 1);
      return clamp(
        progress * panels.length - SECTION_STOP_LOCAL_PROGRESS,
        0,
        panels.length - 1,
      );
    };

    const atOuterBoundary = (direction: number) => {
      if (!direction || !nearStory()) return false;

      const currentPosition = position();
      const firstStop = sectionTop(0);
      const lastIndex = panels.length - 1;
      const lastStop = sectionTop(lastIndex);

      if (
        direction < 0 &&
        currentPosition <= 0.08 &&
        window.scrollY <= firstStop + BOUNDARY_EPSILON
      ) {
        return true;
      }

      return direction > 0 &&
        currentPosition >= lastIndex - 0.08 &&
        window.scrollY >= lastStop - BOUNDARY_EPSILON;
    };

    const releaseToBrowser = (event: Event, direction: number) => {
      if (!atOuterBoundary(direction)) return false;
      // Deliberately do NOT call preventDefault. The native browser scroll is
      // the handoff mechanism outside the board story.
      event.stopImmediatePropagation();
      return true;
    };

    const onWheel = (event: WheelEvent) => {
      if (event.ctrlKey || Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
      releaseToBrowser(event, Math.sign(event.deltaY));
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) return;
      const target = event.target as HTMLElement | null;
      if (target?.matches("input,textarea,select,[contenteditable='true']")) return;

      let direction = 0;
      switch (event.key) {
        case "ArrowUp":
        case "PageUp":
          direction = -1;
          break;
        case "ArrowDown":
        case "PageDown":
          direction = 1;
          break;
        case " ":
          direction = event.shiftKey ? -1 : 1;
          break;
        default:
          return;
      }

      releaseToBrowser(event, direction);
    };

    const onTouchStart = (event: TouchEvent) => {
      if (event.touches.length !== 1) {
        touchLastY = null;
        return;
      }
      touchLastY = event.touches[0].clientY;
    };

    const onTouchMove = (event: TouchEvent) => {
      if (touchLastY === null || event.touches.length !== 1) return;
      const currentY = event.touches[0].clientY;
      const direction = Math.sign(touchLastY - currentY);
      touchLastY = currentY;
      releaseToBrowser(event, direction);
    };

    const clearTouch = () => {
      touchLastY = null;
    };

    const onResize = () => measure();

    measure();
    window.addEventListener("wheel", onWheel, { passive: true, capture: true });
    window.addEventListener("keydown", onKeyDown, { capture: true });
    window.addEventListener("touchstart", onTouchStart, { passive: true, capture: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true, capture: true });
    window.addEventListener("touchend", clearTouch, { passive: true, capture: true });
    window.addEventListener("touchcancel", clearTouch, { passive: true, capture: true });
    window.addEventListener("resize", onResize, { passive: true });

    return () => {
      window.removeEventListener("wheel", onWheel, true);
      window.removeEventListener("keydown", onKeyDown, true);
      window.removeEventListener("touchstart", onTouchStart, true);
      window.removeEventListener("touchmove", onTouchMove, true);
      window.removeEventListener("touchend", clearTouch, true);
      window.removeEventListener("touchcancel", clearTouch, true);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return null;
}
