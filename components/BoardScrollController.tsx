"use client";

import { useEffect } from "react";

const clamp = (value: number, minimum = 0, maximum = 1) =>
  Math.min(maximum, Math.max(minimum, value));

const smoothstep = (value: number) => {
  const bounded = clamp(value);
  return bounded * bounded * (3 - 2 * bounded);
};

export function BoardScrollController() {
  useEffect(() => {
    const story = document.querySelector<HTMLElement>("[data-board-story]");
    const track = story?.querySelector<HTMLElement>("[data-board-track]");
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

      if (reducedMotion.matches) {
        panels[index].scrollIntoView({ behavior: "auto", block: "start", inline: "center" });
      } else {
        measure();
        const focusProgress = (index + .42) / panels.length;
        window.scrollTo({
          top: storyTop + travel * focusProgress,
          behavior,
        });
      }

      panels[index].focus({ preventScroll: true });
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

      const progress = clamp((window.scrollY - storyTop) / travel);
      const stages = progress * panels.length;
      const activeIndex = Math.min(panels.length - 1, Math.floor(stages));
      const localProgress = activeIndex === panels.length - 1 && progress === 1
        ? 1
        : stages - activeIndex;
      const slideProgress = smoothstep((localProgress - .6) / .4);
      const trackPosition = Math.min(
        panels.length - 1,
        activeIndex + (activeIndex < panels.length - 1 ? slideProgress : 0),
      );

      track.style.transform = `translate3d(${-trackPosition * window.innerWidth}px, 0, 0)`;

      panels.forEach((panel, index) => {
        let focus = 0;

        if (index === activeIndex) {
          if (localProgress < .25) {
            focus = smoothstep(localProgress / .25);
          } else if (localProgress < .62) {
            focus = 1;
          } else {
            focus = 1 - smoothstep((localProgress - .62) / .38);
          }
        }

        panel.style.transform = `scale(${.84 + focus * .16})`;
        panel.style.opacity = `${.34 + focus * .66}`;
      });

      dots.forEach((dot, index) => {
        dot.classList.toggle("is-active", index === activeIndex);
      });
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

    if (!reducedMotion.matches) {
      measure();
      render();
      window.addEventListener("scroll", requestRender, { passive: true });
      window.addEventListener("resize", handleResize, { passive: true });
    }

    if (window.location.hash) {
      initialNavigationFrame = window.requestAnimationFrame(() => {
        navigateToHash(window.location.hash, "auto");
      });
    }

    return () => {
      navigationLinks.forEach((link) => link.removeEventListener("click", handleNavigation));
      window.removeEventListener("popstate", handleHistoryNavigation);
      window.removeEventListener("scroll", requestRender);
      window.removeEventListener("resize", handleResize);
      window.cancelAnimationFrame(frame);
      window.cancelAnimationFrame(initialNavigationFrame);
    };
  }, []);

  return null;
}
