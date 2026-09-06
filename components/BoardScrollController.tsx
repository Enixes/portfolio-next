"use client";

import { useEffect } from "react";
import gsap from "gsap";

const clamp = (value: number, minimum = 0, maximum = 1) =>
  Math.min(maximum, Math.max(minimum, value));

const smoothstep = (value: number) => {
  const bounded = clamp(value);
  return bounded * bounded * (3 - 2 * bounded);
};

// Each section is allowed to animate through the master-board zoom, but the page
// only rests once the section has fully assembled and is interactive.
const SECTION_STOP_LOCAL_PROGRESS = 0.72;
const SCROLL_IDLE_SNAP_MS = 110;

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
    let snapTimer = 0;
    let storyTop = 0;
    let travel = 1;
    let lastWindowY = window.scrollY;
    let lastScrollDirection = 0;
    let scrollTween: gsap.core.Tween | null = null;
    let touchStartY: number | null = null;
    let touchTarget: EventTarget | null = null;
    let touchPrevented = false;
    let inlineScrollBehavior = document.documentElement.style.scrollBehavior;

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
      const introY = compact
        ? Math.min(window.innerHeight * 0.1, 70)
        : Math.min(window.innerHeight * 0.17, 150);
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
      timeline.to(
        header,
        {
          x: introX,
          y: introY,
          scale: introScale,
          duration: 0.24,
          ease: "none",
        },
        0.16,
      );

      timeline.to(
        header,
        {
          x: 0,
          y: 0,
          scale: 1,
          rotation: 0,
          duration: 0.24,
          ease: "power3.inOut",
        },
        0.4,
      );

      if (indexLabel && !workHeader) {
        timeline.from(
          indexLabel,
          {
            autoAlpha: 0,
            x: -28,
            duration: 0.16,
            ease: "power2.out",
          },
          0.42,
        );
      }

      if (chits.length) {
        timeline.from(
          chits,
          {
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
          },
          0.49,
        );
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
        timeline.from(
          footnote,
          {
            autoAlpha: 0,
            y: 18,
            duration: 0.2,
            ease: "power2.out",
          },
          0.78,
        );
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

    const sectionScrollTop = (index: number) => {
      const progress = (index + SECTION_STOP_LOCAL_PROGRESS) / panels.length;
      return storyTop + travel * progress;
    };

    const currentStoryProgress = () => clamp((window.scrollY - storyTop) / travel);

    const nearestSectionIndex = () => {
      const stages = currentStoryProgress() * panels.length;
      return Math.round(clamp(stages - SECTION_STOP_LOCAL_PROGRESS, 0, panels.length - 1));
    };

    const canScrollInsideSection = (target: EventTarget | null, deltaY: number) => {
      const element = target instanceof Element ? target : null;
      const surface = element?.closest<HTMLElement>(".story-board-surface");
      if (!surface || surface.scrollHeight <= surface.clientHeight + 2) return false;

      if (deltaY > 0) {
        return surface.scrollTop + surface.clientHeight < surface.scrollHeight - 2;
      }
      if (deltaY < 0) return surface.scrollTop > 2;
      return false;
    };

    const updateHashForSection = (index: number) => {
      const id = sectionIds[index];
      if (!id || window.location.hash === `#${id}`) return;
      window.history.replaceState(null, "", `#${id}`);
    };

    const animateWindowTo = (
      destination: number,
      options: { index?: number; immediate?: boolean; updateHash?: boolean } = {},
    ) => {
      const targetY = Math.max(0, destination);
      const startY = window.scrollY;
      const distance = Math.abs(targetY - startY);
      const stageDistance = Math.max(1, travel / panels.length);
      const immediate = options.immediate || reducedMotion.matches || distance < 2;

      window.clearTimeout(snapTimer);
      scrollTween?.kill();
      scrollTween = null;

      if (immediate) {
        document.documentElement.style.scrollBehavior = "auto";
        window.scrollTo(0, targetY);
        document.documentElement.style.scrollBehavior = inlineScrollBehavior;
        lastWindowY = targetY;
        requestRender();
        if (typeof options.index === "number") {
          if (options.updateHash) updateHashForSection(options.index);
          window.requestAnimationFrame(() => panels[options.index!]?.focus({ preventScroll: true }));
        }
        return;
      }

      const state = { y: startY };
      const duration = clamp(0.82 + (distance / stageDistance) * 0.18, 0.82, 1.38);
      inlineScrollBehavior = document.documentElement.style.scrollBehavior;
      document.documentElement.style.scrollBehavior = "auto";

      scrollTween = gsap.to(state, {
        y: targetY,
        duration,
        ease: "power2.inOut",
        overwrite: true,
        onUpdate: () => {
          window.scrollTo(0, state.y);
        },
        onComplete: () => {
          scrollTween = null;
          document.documentElement.style.scrollBehavior = inlineScrollBehavior;
          lastWindowY = window.scrollY;
          requestRender();
          if (typeof options.index === "number") {
            if (options.updateHash) updateHashForSection(options.index);
            panels[options.index]?.focus({ preventScroll: true });
          }
        },
        onInterrupt: () => {
          scrollTween = null;
          document.documentElement.style.scrollBehavior = inlineScrollBehavior;
        },
      });
    };

    const navigateToSection = (
      index: number,
      behavior: ScrollBehavior,
      updateHash = false,
    ) => {
      if (index < 0 || index >= panels.length) return;
      measure();
      animateWindowTo(sectionScrollTop(index), {
        index,
        immediate: behavior === "auto",
        updateHash,
      });
    };

    const leaveStoryUpward = () => {
      const destination = Math.max(0, storyTop - Math.min(window.innerHeight * 0.88, storyTop));
      animateWindowTo(destination);
    };

    const navigateByDirection = (direction: -1 | 1, updateHash = true) => {
      measure();
      const firstStop = sectionScrollTop(0);
      const currentY = window.scrollY;

      if (direction > 0 && currentY < firstStop - 10) {
        navigateToSection(0, "smooth", updateHash);
        return;
      }

      const currentIndex = nearestSectionIndex();
      if (direction < 0 && currentIndex === 0 && currentY <= firstStop + 10) {
        leaveStoryUpward();
        return;
      }

      const nextIndex = clamp(currentIndex + direction, 0, panels.length - 1);
      if (nextIndex === currentIndex) return;
      navigateToSection(nextIndex, "smooth", updateHash);
    };

    const snapToSectionAfterManualScroll = () => {
      if (scrollTween) return;
      const storyEnd = storyTop + travel;
      const currentY = window.scrollY;
      if (currentY < storyTop || currentY > storyEnd) return;

      const stages = currentStoryProgress() * panels.length;
      const rawIndex = stages - SECTION_STOP_LOCAL_PROGRESS;
      let targetIndex: number;

      if (lastScrollDirection > 0) {
        targetIndex = Math.ceil(rawIndex - 0.015);
      } else if (lastScrollDirection < 0) {
        targetIndex = Math.floor(rawIndex + 0.015);
      } else {
        targetIndex = Math.round(rawIndex);
      }

      targetIndex = clamp(targetIndex, 0, panels.length - 1);
      const destination = sectionScrollTop(targetIndex);
      if (Math.abs(currentY - destination) < 3) return;
      navigateToSection(targetIndex, "smooth", true);
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
      ) {
        return;
      }

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

    const handleWheel = (event: WheelEvent) => {
      if (Math.abs(event.deltaY) < 2) return;
      const storyEnd = storyTop + travel;
      const currentY = window.scrollY;
      if (currentY < storyTop - 2 || currentY > storyEnd + 2) return;
      if (canScrollInsideSection(event.target, event.deltaY)) return;

      event.preventDefault();
      if (scrollTween) return;
      navigateByDirection(event.deltaY > 0 ? 1 : -1);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target instanceof HTMLElement ? event.target : null;
      if (
        target?.isContentEditable ||
        target?.matches("input, textarea, select, button") ||
        event.metaKey ||
        event.ctrlKey ||
        event.altKey
      ) {
        return;
      }

      const storyEnd = storyTop + travel;
      if (window.scrollY < storyTop - 2 || window.scrollY > storyEnd + 2) return;

      let direction: -1 | 1 | null = null;
      if (event.key === "ArrowDown" || event.key === "PageDown" || (event.key === " " && !event.shiftKey)) {
        direction = 1;
      } else if (
        event.key === "ArrowUp" ||
        event.key === "PageUp" ||
        (event.key === " " && event.shiftKey)
      ) {
        direction = -1;
      }

      if (!direction) return;
      event.preventDefault();
      if (!scrollTween) navigateByDirection(direction);
    };

    const handleTouchStart = (event: TouchEvent) => {
      if (event.touches.length !== 1) return;
      touchStartY = event.touches[0]?.clientY ?? null;
      touchTarget = event.target;
      touchPrevented = false;
    };

    const handleTouchMove = (event: TouchEvent) => {
      if (touchStartY === null || event.touches.length !== 1) return;
      const storyEnd = storyTop + travel;
      const currentY = window.scrollY;
      if (currentY < storyTop - 2 || currentY > storyEnd + 2) return;

      const deltaY = touchStartY - (event.touches[0]?.clientY ?? touchStartY);
      if (Math.abs(deltaY) < 5 || canScrollInsideSection(touchTarget, deltaY)) return;
      event.preventDefault();
      touchPrevented = true;
    };

    const handleTouchEnd = (event: TouchEvent) => {
      if (touchStartY === null) return;
      const endY = event.changedTouches[0]?.clientY ?? touchStartY;
      const deltaY = touchStartY - endY;
      const shouldNavigate = touchPrevented && Math.abs(deltaY) >= 34;

      touchStartY = null;
      touchTarget = null;
      touchPrevented = false;

      if (!shouldNavigate || scrollTween) return;
      navigateByDirection(deltaY > 0 ? 1 : -1);
    };

    const render = () => {
      frame = 0;
      masterBoard ??= story.querySelector<HTMLElement>("[data-zoom-master-board]");
      if (masterBoard && zoomTargets.length === 0) measureZoomTargets();

      const progress = currentStoryProgress();
      const stages = progress * panels.length;
      const activeIndex = Math.min(panels.length - 1, Math.floor(stages));
      const localProgress =
        activeIndex === panels.length - 1 && progress === 1 ? 1 : stages - activeIndex;
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
          // The camera passes through the master board, but discrete navigation means
          // this transitional frame can no longer become a resting state.
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

    const handleScroll = () => {
      const currentY = window.scrollY;
      const delta = currentY - lastWindowY;
      if (Math.abs(delta) > 0.5) lastScrollDirection = delta > 0 ? 1 : -1;
      lastWindowY = currentY;
      requestRender();

      if (scrollTween) return;
      window.clearTimeout(snapTimer);
      const storyEnd = storyTop + travel;
      if (currentY >= storyTop && currentY <= storyEnd) {
        snapTimer = window.setTimeout(snapToSectionAfterManualScroll, SCROLL_IDLE_SNAP_MS);
      }
    };

    const handleResize = () => {
      scrollTween?.kill();
      scrollTween = null;
      document.documentElement.style.scrollBehavior = inlineScrollBehavior;
      killPanelTimelines();
      measure();
      requestRender();
    };

    navigationLinks.forEach((link) => link.addEventListener("click", handleNavigation));
    window.addEventListener("popstate", handleHistoryNavigation);
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: false });
    window.addEventListener("touchend", handleTouchEnd, { passive: true });
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
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
      window.removeEventListener("resize", handleResize);
      window.clearTimeout(snapTimer);
      window.cancelAnimationFrame(frame);
      window.cancelAnimationFrame(initialNavigationFrame);
      scrollTween?.kill();
      document.documentElement.style.scrollBehavior = inlineScrollBehavior;
      killPanelTimelines();
      gsap.killTweensOf([masterBoard, room, ...panels].filter(Boolean));
      delete document.documentElement.dataset.zoomSection;
    };
  }, []);

  return null;
}
