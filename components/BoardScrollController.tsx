"use client";

import { useEffect } from "react";
import gsap from "gsap";

const clamp = (value: number, minimum = 0, maximum = 1) =>
  Math.min(maximum, Math.max(minimum, value));

const smoothstep = (value: number) => {
  const bounded = clamp(value);
  return bounded * bounded * (3 - 2 * bounded);
};

const zoomTargetSelectors = [
  ".board-zone-profile",
  ".board-zone-work",
  ".board-zone-blog",
  ".board-zone-life",
  ".board-caption",
] as const;

type ZoomTarget = {
  x: number;
  y: number;
  originX: number;
  originY: number;
};

function offsetWithin(element: HTMLElement, ancestor: HTMLElement) {
  let x = element.offsetWidth / 2;
  let y = element.offsetHeight / 2;
  let node: HTMLElement | null = element;

  while (node && node !== ancestor) {
    x += node.offsetLeft;
    y += node.offsetTop;
    node = node.offsetParent as HTMLElement | null;
  }

  return { x, y };
}

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

    const panelTimelines: Array<gsap.core.Timeline | null> = new Array(panels.length).fill(null);
    let zoomTargets: ZoomTarget[] = [];
    let frame = 0;
    let initialNavigationFrame = 0;
    let storyTop = 0;
    let travel = 1;

    const killPanelTimelines = () => {
      panelTimelines.forEach((timeline, index) => {
        timeline?.kill();
        panelTimelines[index] = null;
      });
    };

    const measureZoomTargets = () => {
      masterBoard ??= story.querySelector<HTMLElement>("[data-zoom-master-board]");
      if (!masterBoard) {
        zoomTargets = [];
        return;
      }

      const width = Math.max(1, masterBoard.offsetWidth);
      const height = Math.max(1, masterBoard.offsetHeight);

      zoomTargets = zoomTargetSelectors.map((selector, index) => {
        const target = masterBoard?.querySelector<HTMLElement>(selector) ?? null;
        const fallback = [
          { x: width * 0.2, y: height * 0.27 },
          { x: width * 0.52, y: height * 0.3 },
          { x: width * 0.68, y: height * 0.67 },
          { x: width * 0.82, y: height * 0.7 },
          { x: width * 0.5, y: height * 0.82 },
        ][index];
        const point = target ? offsetWithin(target, masterBoard!) : fallback;

        return {
          x: width / 2 - point.x,
          y: height / 2 - point.y,
          originX: clamp(point.x / width),
          originY: clamp(point.y / height),
        };
      });
    };

    const measure = () => {
      const bounds = story.getBoundingClientRect();
      storyTop = window.scrollY + bounds.top;
      travel = Math.max(1, story.offsetHeight - window.innerHeight);
      measureZoomTargets();
    };

    const buildPanelTimeline = (index: number) => {
      const panel = panels[index];
      if (!panel) return null;

      const workHeader = panel.querySelector<HTMLElement>(".work-cv-header");
      const header = workHeader ?? panel.querySelector<HTMLElement>(".story-board-header");
      if (!header) return null;

      if (index === 1 && !workHeader) {
        // The Work CV portal mounts just after this controller. Waiting one frame
        // keeps the real CV header as the zoom anchor instead of the hidden fallback.
        return null;
      }

      const chits = Array.from(
        panel.querySelectorAll<HTMLElement>(
          ".story-case, .work-company-chit, .work-evidence-chit, .work-tenure-tag, .work-cv-pencil, .work-cv-legend",
        ),
      );
      const indexLabel = panel.querySelector<HTMLElement>(".story-board-index");
      const footnote = panel.querySelector<HTMLElement>(".story-board-footnote, .work-cv-footnote");
      const threadPaths = Array.from(
        panel.querySelectorAll<SVGPathElement>(".work-cv-thread .thread-main, .work-cv-thread .thread-branch"),
      );

      const compact = window.innerWidth <= 760;
      const introX = compact ? 0 : Math.min(window.innerWidth * 0.09, 150);
      const introY = compact ? Math.min(window.innerHeight * 0.1, 70) : Math.min(window.innerHeight * 0.17, 150);
      const introScale = compact ? 1.22 : 1.62;

      const timeline = gsap.timeline({ paused: true, defaults: { overwrite: "auto" } });

      gsap.set(header, { transformOrigin: "0% 0%", force3D: true });
      if (indexLabel) gsap.set(indexLabel, { transformOrigin: "0% 50%" });

      timeline.fromTo(
        header,
        {
          autoAlpha: 0,
          x: introX,
          y: introY,
          scale: introScale * 0.88,
          rotation: -1.2,
        },
        {
          autoAlpha: 1,
          x: introX,
          y: introY,
          scale: introScale,
          rotation: 0,
          duration: 0.16,
          ease: "power3.out",
        },
        0,
      );

      // Deliberate hold: the section title owns the frame before the board assembles.
      timeline.to(header, {
        x: introX,
        y: introY,
        scale: introScale,
        duration: 0.24,
        ease: "none",
      }, 0.16);

      timeline.to(header, {
        x: 0,
        y: 0,
        scale: 1,
        rotation: 0,
        duration: 0.24,
        ease: "power3.inOut",
      }, 0.4);

      if (indexLabel && !workHeader) {
        timeline.from(indexLabel, {
          autoAlpha: 0,
          x: -28,
          duration: 0.16,
          ease: "power2.out",
        }, 0.42);
      }

      if (chits.length) {
        timeline.from(chits, {
          autoAlpha: 0,
          x: (itemIndex) => {
            const direction = itemIndex % 2 === 0 ? -1 : 1;
            return direction * Math.min(window.innerWidth * (0.055 + (itemIndex % 3) * 0.012), 120);
          },
          y: (itemIndex) => {
            const lane = (itemIndex % 3) - 1;
            return 68 + lane * Math.min(window.innerHeight * 0.085, 72);
          },
          scale: (itemIndex) => 0.68 + (itemIndex % 3) * 0.035,
          rotation: (itemIndex) => (itemIndex % 2 === 0 ? -7 : 7),
          duration: 0.33,
          stagger: { each: 0.038, from: "start" },
          ease: "back.out(1.35)",
          force3D: true,
        }, 0.49);
      }

      threadPaths.forEach((path, pathIndex) => {
        const length = Math.max(1, path.getTotalLength());
        timeline.fromTo(
          path,
          { strokeDasharray: length, strokeDashoffset: length },
          {
            strokeDasharray: length,
            strokeDashoffset: 0,
            duration: 0.28,
            ease: "power2.out",
          },
          0.56 + pathIndex * 0.025,
        );
      });

      if (footnote) {
        timeline.from(footnote, {
          autoAlpha: 0,
          y: 18,
          duration: 0.2,
          ease: "power2.out",
        }, 0.78);
      }

      timeline.duration(1);
      timeline.progress(0);
      return timeline;
    };

    const ensurePanelTimeline = (index: number) => {
      if (!panelTimelines[index]) {
        panelTimelines[index] = buildPanelTimeline(index);
      }
      return panelTimelines[index];
    };

    const navigateToSection = (index: number, behavior: ScrollBehavior) => {
      if (index < 0 || index >= panels.length) return;

      measure();
      // Land inside the title-hold phase so navbar clicks visibly complete the zoom.
      const focusProgress = (index + 0.32) / panels.length;
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
      if (masterBoard && zoomTargets.length === 0) measureZoomTargets();

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
          gsap.set(panel, {
            autoAlpha: active ? 1 : 0,
            x: 0,
            y: 0,
            scale: 1,
            zIndex: active ? 5 : 1,
            pointerEvents: active ? "auto" : "none",
          });
          ensurePanelTimeline(index)?.progress(active ? 1 : 0);
        });
        if (masterBoard) gsap.set(masterBoard, { autoAlpha: 0 });
        if (room) gsap.set(room, { opacity: 0.18, scale: 1 });
      } else {
        const enter = smoothstep((localProgress - 0.04) / 0.2);
        const detailEnter = smoothstep((localProgress - 0.13) / 0.14);
        const exit = smoothstep((localProgress - 0.82) / 0.16);
        const panelVisibility = detailEnter * (1 - exit);
        const zoomStrength = enter * (1 - exit);
        const assemblyProgress = clamp((localProgress - 0.13) / 0.58);
        const target = zoomTargets[activeIndex] ?? {
          x: 0,
          y: 0,
          originX: 0.5,
          originY: 0.5,
        };

        panels.forEach((panel, index) => {
          const active = index === activeIndex;
          const visible = active ? panelVisibility : 0;
          const panelScale = active ? 1.08 - visible * 0.08 : 0.96;
          const panelY = active ? (1 - visible) * 18 : 0;

          gsap.set(panel, {
            autoAlpha: visible,
            y: panelY,
            scale: panelScale,
            transformOrigin: "50% 38%",
            zIndex: active ? 5 : 1,
            pointerEvents: visible > 0.78 ? "auto" : "none",
            force3D: true,
          });

          const timeline = ensurePanelTimeline(index);
          if (timeline) timeline.progress(active ? assemblyProgress : 0, false);
        });

        if (masterBoard) {
          // Much stronger camera move: focus the actual section marker/header on the master board.
          const boardScale = 0.88 + zoomStrength * 3.35;
          const boardVisibility = Math.max(1 - detailEnter * 0.97, exit);

          gsap.set(masterBoard, {
            xPercent: -50,
            yPercent: -50,
            x: target.x * zoomStrength,
            y: target.y * zoomStrength,
            scale: boardScale,
            transformOrigin: `${target.originX * 100}% ${target.originY * 100}%`,
            autoAlpha: boardVisibility,
            filter: `brightness(${0.9 + boardVisibility * 0.1}) saturate(${0.78 + boardVisibility * 0.22})`,
            force3D: true,
          });
        }

        if (room) {
          gsap.set(room, {
            opacity: 0.1 + Math.max(1 - detailEnter, exit) * 0.17,
            scale: 1.04 + zoomStrength * 0.055,
            force3D: true,
          });
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
      killPanelTimelines();
      measure();
      requestRender();
    };

    navigationLinks.forEach((link) => link.addEventListener("click", handleNavigation));
    window.addEventListener("popstate", handleHistoryNavigation);
    window.addEventListener("scroll", requestRender, { passive: true });
    window.addEventListener("resize", handleResize, { passive: true });

    measure();
    render();

    // The Work portal is a sibling client component and may mount a frame later.
    window.requestAnimationFrame(() => {
      if (!panelTimelines[1]) panelTimelines[1] = buildPanelTimeline(1);
      measureZoomTargets();
      requestRender();
    });

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
      killPanelTimelines();
      gsap.killTweensOf([masterBoard, room, ...panels].filter(Boolean));
      delete document.documentElement.dataset.zoomSection;
    };
  }, []);

  return null;
}
