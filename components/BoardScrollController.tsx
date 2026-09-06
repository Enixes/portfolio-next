"use client";

import { useEffect } from "react";

const clamp = (value: number, minimum = 0, maximum = 1) =>
  Math.min(maximum, Math.max(minimum, value));

const smoothstep = (value: number) => {
  const bounded = clamp(value);
  return bounded * bounded * (3 - 2 * bounded);
};

const zoomOrigins = [
  { x: 0.2, y: 0.27 },
  { x: 0.52, y: 0.3 },
  { x: 0.68, y: 0.67 },
  { x: 0.82, y: 0.7 },
  { x: 0.5, y: 0.5 },
] as const;

export function BoardScrollController() {
  useEffect(() => {
    const story = document.querySelector<HTMLElement>("[data-board-story]");
    const track = story?.querySelector<HTMLElement>("[data-board-track]");
    let masterBoard = story?.querySelector<HTMLElement>("[data-zoom-master-board]") ?? null;
    const room = story?.querySelector<HTMLElement>(".board-story-room");
    const stops = story
      ? Array.from(story.querySelectorAll<HTMLElement>("[data-board-stop]"))
      : [];
    const panels = story
      ? Array.from(story.querySelectorAll<HTMLElement>("[data-board-panel]"))
      : [];
    const dots = story
      ? Array.from(story.querySelectorAll<HTMLElement>("[data-board-dot]"))
      : [];

    if (!story || !track || panels.length === 0) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sectionIds = stops.map((stop) => stop.id);
    const navigationLinks = Array.from(
      document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]'),
    ).filter((link) => sectionIds.includes(link.hash.slice(1)));

    let frame = 0;
    let initialNavigationFrame = 0;
    let storyTop = 0;
    let travel = 1;

    const measure = () => {
      const bounds = story.getBoundingClientRect();
      storyTop = window.scrollY + bounds.top;
      travel = Math.max(1, story.offsetHeight - window.innerHeight);
    };

    const navigateToSection = (index: number, behavior: ScrollBehavior) => {
      if (index < 0 || index >= panels.length) return;

      measure();
      const focusProgress = (index + 0.38) / panels.length;
      window.scrollTo({
        top: storyTop + travel * focusProgress,
        behavior: reducedMotion.matches ? "auto" : behavior,
      });

      window.requestAnimationFrame(() => panels[index]?.focus({ preventScroll: true }));
    };

    const navigateToHash = (hash: string, behavior: ScrollBehavior) => {
      const index = sectionIds.indexOf(hash.replace(/^#/, ""));
      if (index >= 0) navigateToSection(index, behavior);
    };

    const handleNavigation = (event: MouseEvent) => {
      if (
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) return;

      const link = event.currentTarget as HTMLAnchorElement;
      const index = sectionIds.indexOf(link.hash.slice(1));
      if (index < 0) return;

      event.preventDefault();
      if (window.location.hash !== link.hash) {
        window.history.pushState(null, "", link.hash);
      }
      navigateToSection(index, reducedMotion.matches ? "auto" : "smooth");
    };

    const handleHistoryNavigation = () => {
      navigateToHash(window.location.hash, "auto");
    };

    const render = () => {
      frame = 0;
      masterBoard ??= story.querySelector<HTMLElement>("[data-zoom-master-board]");

      const progress = clamp((window.scrollY - storyTop) / travel);
      const stages = progress * panels.length;
      const activeIndex = Math.min(panels.length - 1, Math.floor(stages));
      const localProgress = activeIndex === panels.length - 1 && progress === 1
        ? 1
        : stages - activeIndex;
      const activeSectionId = sectionIds[activeIndex] ?? "";

      if (reducedMotion.matches) {
        panels.forEach((panel, index) => {
          const active = index === activeIndex;
          panel.style.opacity = active ? "1" : "0";
          panel.style.transform = "translate3d(0,0,0) scale(1)";
          panel.style.zIndex = active ? "5" : "1";
          panel.style.pointerEvents = active ? "auto" : "none";
        });
        if (masterBoard) masterBoard.style.opacity = "0";
        if (room) room.style.opacity = ".18";
      } else {
        const enter = smoothstep(localProgress / 0.18);
        const exit = smoothstep((localProgress - 0.68) / 0.18);
        const focus = clamp(enter * (1 - exit));
        const origin = zoomOrigins[Math.min(activeIndex, zoomOrigins.length - 1)];

        panels.forEach((panel, index) => {
          const active = index === activeIndex;
          const panelFocus = active ? focus : 0;
          const panelScale = 0.72 + panelFocus * 0.28 + exit * (active ? 0.1 : 0);
          const driftX = active ? (0.5 - origin.x) * 7 * (1 - panelFocus) : 0;
          const driftY = active ? (0.5 - origin.y) * 6 * (1 - panelFocus) : 0;

          panel.style.opacity = `${panelFocus}`;
          panel.style.transform = `translate3d(${driftX}vw, ${driftY}vh, 0) scale(${panelScale})`;
          panel.style.transformOrigin = `${origin.x * 100}% ${origin.y * 100}%`;
          panel.style.zIndex = active ? "5" : "1";
          panel.style.pointerEvents = panelFocus > 0.72 ? "auto" : "none";
        });

        if (masterBoard) {
          const boardVisibility = Math.max(1 - enter, exit);
          const zoomIn = localProgress < 0.5 ? enter : 1 - exit;
          const boardScale = 0.88 + zoomIn * 1.72;
          const translateX = (0.5 - origin.x) * window.innerWidth * 0.62 * zoomIn;
          const translateY = (0.5 - origin.y) * window.innerHeight * 0.62 * zoomIn;

          masterBoard.style.opacity = `${boardVisibility}`;
          masterBoard.style.transform = `translate3d(calc(-50% + ${translateX}px), calc(-50% + ${translateY}px), 0) scale(${boardScale})`;
          masterBoard.style.transformOrigin = `${origin.x * 100}% ${origin.y * 100}%`;
          masterBoard.style.filter = `brightness(${0.92 + boardVisibility * 0.08}) saturate(${0.82 + boardVisibility * 0.18})`;
        }

        if (room) {
          room.style.opacity = `${0.12 + Math.max(1 - enter, exit) * 0.16}`;
          room.style.transform = `scale(${1.04 + focus * 0.035})`;
        }
      }

      dots.forEach((dot, index) => {
        dot.classList.toggle("is-active", index === activeIndex);
      });

      navigationLinks.forEach((link) => {
        link.classList.toggle("is-active", link.hash.slice(1) === activeSectionId);
      });

      document.documentElement.dataset.zoomSection = activeSectionId;
    };

    const requestRender = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(render);
    };

    const handleResize = () => {
      measure();
      requestRender();
    };

    navigationLinks.forEach((link) => link.addEventListener("click", handleNavigation));
    window.addEventListener("popstate", handleHistoryNavigation);
    window.addEventListener("scroll", requestRender, { passive: true });
    window.addEventListener("resize", handleResize, { passive: true });

    measure();
    render();

    if (window.location.hash) {
      initialNavigationFrame = window.requestAnimationFrame(() => {
        navigateToHash(window.location.hash, "auto");
      });
    }

    return () => {
      navigationLinks.forEach((link) => {
        link.removeEventListener("click", handleNavigation);
        link.classList.remove("is-active");
      });
      window.removeEventListener("popstate", handleHistoryNavigation);
      window.removeEventListener("scroll", requestRender);
      window.removeEventListener("resize", handleResize);
      window.cancelAnimationFrame(frame);
      window.cancelAnimationFrame(initialNavigationFrame);
      delete document.documentElement.dataset.zoomSection;
    };
  }, []);

  return null;
}
