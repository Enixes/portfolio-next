"use client";

import { useEffect } from "react";
import gsap from "gsap";

const SECTION_STOP_LOCAL_PROGRESS = 0.72;
const NAV_TRANSITION_DURATION = 1.72;

const styles = `
/* The spatial camera positions every detail board itself. Flatten the legacy
   horizontal flex track so there is no hidden 100vw base offset underneath
   our camera transforms. */
html[data-spatial-camera="true"] .board-scroll-track {
  position: absolute !important;
  inset: 0 !important;
  display: block !important;
  width: 100% !important;
  height: 100% !important;
  transform: none !important;
  will-change: auto !important;
}
html[data-spatial-camera="true"] .scroll-board-panel {
  position: absolute !important;
  inset: 0 !important;
  width: 100% !important;
  height: 100% !important;
  flex: none !important;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  will-change: transform, opacity;
}
html[data-spatial-camera="true"] .board-scroll-sticky {
  background: #171614;
}
`;

const clamp = (value: number, minimum: number, maximum: number) =>
  Math.min(maximum, Math.max(minimum, value));

const smoothstep = (value: number) => {
  const bounded = clamp(value, 0, 1);
  return bounded * bounded * (3 - 2 * bounded);
};

type Point = { x: number; y: number };

/*
 * A virtual map of the corkboard. We zig-zag through it instead of repeatedly
 * backing out to the overview board.
 *
 * Profile ───── Work
 *             ╱
 *          Blog ───── Life
 *                    ╲
 *                     Contact
 *
 * The important correction here is Work -> Blog: down + LEFT.
 */
const boardMap: Point[] = [
  { x: 0, y: 0 },
  { x: 1, y: 0 },
  { x: 0, y: 0.72 },
  { x: 1, y: 0.72 },
  { x: 0.42, y: 1.34 },
];

function interpolateCamera(position: number) {
  const bounded = clamp(position, 0, boardMap.length - 1);
  const from = Math.floor(bounded);
  const to = Math.min(boardMap.length - 1, from + 1);
  const t = smoothstep(bounded - from);
  const a = boardMap[from];
  const b = boardMap[to];

  return {
    x: a.x + (b.x - a.x) * t,
    y: a.y + (b.y - a.y) * t,
  };
}

function clearIntroTransforms(panel: HTMLElement) {
  const nodes = panel.querySelectorAll<HTMLElement>(
    ".story-board-index,.story-board-header,.story-case,.story-board-footnote,.work-cv-header,.work-company-chit,.work-evidence-chit,.work-tenure-tag,.work-cv-pencil,.work-cv-legend,.work-cv-footnote",
  );

  nodes.forEach((node) => {
    gsap.set(node, { clearProps: "opacity,visibility,transform" });
  });
}

export function BoardSpatialCamera() {
  useEffect(() => {
    const story = document.querySelector<HTMLElement>("[data-board-story]");
    const panels = story
      ? Array.from(story.querySelectorAll<HTMLElement>("[data-board-panel]"))
      : [];
    const stops = story
      ? Array.from(story.querySelectorAll<HTMLElement>("[data-board-stop]"))
      : [];
    const room = story?.querySelector<HTMLElement>(".board-story-room") ?? null;

    if (!story || panels.length === 0 || stops.length !== panels.length) return;

    document.documentElement.dataset.spatialCamera = "true";

    const sectionIds = stops.map((stop) => stop.id);
    let storyTop = 0;
    let travel = 1;
    let frame = 0;
    let navTween: gsap.core.Tween | null = null;
    const originalScrollBehavior = document.documentElement.style.scrollBehavior;

    const measure = () => {
      const rect = story.getBoundingClientRect();
      storyTop = window.scrollY + rect.top;
      travel = Math.max(1, story.offsetHeight - window.innerHeight);
    };

    const sectionTop = (index: number) =>
      storyTop + travel * ((index + SECTION_STOP_LOCAL_PROGRESS) / panels.length);

    const cameraPosition = () => {
      const storyProgress = clamp((window.scrollY - storyTop) / travel, 0, 1);
      return clamp(
        storyProgress * panels.length - SECTION_STOP_LOCAL_PROGRESS,
        0,
        panels.length - 1,
      );
    };

    const requestRender = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(render);
    };

    function render() {
      frame = 0;
      const position = cameraPosition();
      const camera = interpolateCamera(position);
      const settledIndex = clamp(Math.round(position), 0, panels.length - 1);
      const distanceFromStop = Math.abs(position - settledIndex);
      const transitioning = distanceFromStop > 0.025;
      const compact = window.innerWidth <= 760;
      const xStride = window.innerWidth * (compact ? 1.02 : 0.98);
      const yStride = window.innerHeight * (compact ? 0.72 : 0.79);

      panels.forEach((panel, index) => {
        const point = boardMap[index] ?? { x: index, y: 0 };
        const dx = (point.x - camera.x) * xStride;
        const dy = (point.y - camera.y) * yStride;
        const indexDistance = Math.abs(index - position);
        const participating = transitioning
          ? indexDistance <= 1.04
          : index === settledIndex;
        const settled = index === settledIndex && !transitioning;

        if (participating) clearIntroTransforms(panel);

        gsap.set(panel, {
          x: dx,
          y: dy,
          scale: 1,
          rotation: 0,
          autoAlpha: participating ? 1 : 0,
          zIndex: participating ? Math.max(2, 8 - Math.round(indexDistance * 3)) : 1,
          pointerEvents: settled ? "auto" : "none",
          transformOrigin: "50% 50%",
          force3D: true,
        });
      });

      const masterBoard = document.querySelector<HTMLElement>("[data-zoom-master-board]");
      // During the initial hero -> Profile handoff the clone is temporarily
      // moved to <body>. Leave that choreography alone. Once it returns to the
      // sticky story, keep it hidden: section-to-section travel is now a pan,
      // never a zoom-out to the overview board.
      if (masterBoard && masterBoard.parentElement !== document.body) {
        gsap.set(masterBoard, { autoAlpha: 0, pointerEvents: "none" });
      }

      if (room) {
        gsap.set(room, {
          x: -camera.x * 18,
          y: -camera.y * 14,
          scale: 1.055,
          opacity: 0.15,
          force3D: true,
        });
      }
    }

    const animateToIndex = (index: number) => {
      const destination = sectionTop(index);
      navTween?.kill();
      document.documentElement.style.scrollBehavior = "auto";

      const state = { y: window.scrollY };
      navTween = gsap.to(state, {
        y: destination,
        duration: NAV_TRANSITION_DURATION,
        ease: "power3.inOut",
        overwrite: true,
        onUpdate: () => window.scrollTo(0, state.y),
        onComplete: () => {
          navTween = null;
          document.documentElement.style.scrollBehavior = originalScrollBehavior;
          panels[index]?.focus({ preventScroll: true });
          requestRender();
        },
        onInterrupt: () => {
          navTween = null;
          document.documentElement.style.scrollBehavior = originalScrollBehavior;
        },
      });
    };

    const onNavigationCapture = (event: MouseEvent) => {
      if (
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) return;

      const link = (event.target as Element | null)?.closest<HTMLAnchorElement>('a[href^="#"]');
      if (!link) return;
      const index = sectionIds.indexOf(link.hash.slice(1));
      if (index < 0) return;

      measure();
      // Preserve the bespoke hero -> Profile zoom-in. Once already inside the
      // board story, navigation remains spatial and never backs out to overview.
      if (window.scrollY < storyTop - 4) return;

      event.preventDefault();
      event.stopImmediatePropagation();
      if (window.location.hash !== link.hash) {
        window.history.pushState(null, "", link.hash);
      }

      if (index === 1) {
        const workBoard = panels[1]?.querySelector<HTMLElement>(".work-cv-board");
        if (workBoard) workBoard.scrollTop = 0;
      }
      animateToIndex(index);
    };

    const onResize = () => {
      navTween?.kill();
      navTween = null;
      measure();
      requestRender();
    };

    const onScroll = () => requestRender();

    measure();
    requestRender();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });
    document.addEventListener("click", onNavigationCapture, { capture: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("click", onNavigationCapture, true);
      window.cancelAnimationFrame(frame);
      navTween?.kill();
      document.documentElement.style.scrollBehavior = originalScrollBehavior;
      delete document.documentElement.dataset.spatialCamera;
      panels.forEach((panel) => gsap.set(panel, { clearProps: "transform,opacity,visibility,zIndex,pointerEvents" }));
      if (room) gsap.set(room, { clearProps: "transform,opacity" });
    };
  }, []);

  return <style dangerouslySetInnerHTML={{ __html: styles }} />;
}
