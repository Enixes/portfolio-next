"use client";

import { useEffect } from "react";
import gsap from "gsap";

const clamp = (value: number, minimum = 0, maximum = 1) =>
  Math.min(maximum, Math.max(minimum, value));

const smoothstep = (value: number) => {
  const bounded = clamp(value);
  return bounded * bounded * (3 - 2 * bounded);
};

const SECTION_STOP_LOCAL_PROGRESS = 0.72;
const CLICK_ZOOM_START_LOCAL_PROGRESS = 0.015;
const CLICK_ZOOM_DURATION = 1.95;

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

type WindowTweenOptions = {
  index?: number;
  immediate?: boolean;
  duration?: number;
  ease?: string;
  onComplete?: () => void;
  onInterrupt?: () => void;
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
    const stickyHost = story?.querySelector<HTMLElement>(".board-scroll-sticky") ?? null;
    const heroSource = document.querySelector<HTMLElement>(
      ".preview-hero .evidence-board-frame",
    );
    let masterBoard = document.querySelector<HTMLElement>("[data-zoom-master-board]");
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
    const originalScrollBehavior = document.documentElement.style.scrollBehavior;
    const sectionIds = stops.map((stop) => stop.id);
    const navigationLinks = Array.from(
      document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]'),
    ).filter((link) => sectionIds.includes(link.hash.slice(1)));

    const panelTimelines: Array<gsap.core.Timeline | null> = new Array(panels.length).fill(null);
    let zoomTargets: ZoomTarget[] = [];
    let frame = 0;
    let initialNavigationFrame = 0;
    let directZoomFrame = 0;
    let storyTop = 0;
    let travel = 1;
    let scrollTween: gsap.core.Tween | null = null;
    let lastWindowY = window.scrollY;

    let heroHandoffActive = false;
    let heroHandoffStartY = 0;
    let heroHandoffEndY = 1;
    let heroHandoffTargetX = 0;
    let heroHandoffTargetY = 0;
    let heroHandoffOriginX = 0.5;
    let heroHandoffOriginY = 0.5;

    const restoreScrollBehavior = () => {
      document.documentElement.style.scrollBehavior = originalScrollBehavior;
    };

    const killPanelTimelines = () => {
      panelTimelines.forEach((timeline, index) => {
        timeline?.kill();
        panelTimelines[index] = null;
      });
    };

    const measureZoomTargets = () => {
      masterBoard ??= document.querySelector<HTMLElement>("[data-zoom-master-board]");
      if (!masterBoard || heroHandoffActive) {
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
      if (!heroHandoffActive) measureZoomTargets();
    };

    const buildPanelTimeline = (index: number) => {
      const panel = panels[index];
      if (!panel) return null;

      const workHeader = panel.querySelector<HTMLElement>(".work-cv-header");
      const header = workHeader ?? panel.querySelector<HTMLElement>(".story-board-header");
      if (!header) return null;
      if (index === 1 && !workHeader) return null;

      const chits = Array.from(
        panel.querySelectorAll<HTMLElement>(
          ".story-case, .work-company-chit, .work-evidence-chit, .work-tenure-tag, .work-cv-pencil, .work-cv-legend",
        ),
      );
      const indexLabel = panel.querySelector<HTMLElement>(".story-board-index");
      const footnote = panel.querySelector<HTMLElement>(".story-board-footnote, .work-cv-footnote");
      const threadPaths = Array.from(
        panel.querySelectorAll<SVGPathElement>(
          ".work-cv-thread .thread-main, .work-cv-thread .thread-branch",
        ),
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
          scale: introScale * 0.86,
          rotation: -1.2,
        },
        {
          autoAlpha: 1,
          x: introX,
          y: introY,
          scale: introScale,
          rotation: 0,
          duration: 0.18,
          ease: "power3.out",
        },
        0,
      );

      timeline.to(
        header,
        {
          x: introX,
          y: introY,
          scale: introScale,
          duration: 0.34,
          ease: "none",
        },
        0.18,
      );

      timeline.to(
        header,
        {
          x: 0,
          y: 0,
          scale: 1,
          rotation: 0,
          duration: 0.28,
          ease: "power3.inOut",
        },
        0.52,
      );

      if (indexLabel && !workHeader) {
        timeline.from(
          indexLabel,
          {
            autoAlpha: 0,
            x: -28,
            duration: 0.2,
            ease: "power2.out",
          },
          0.56,
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
              return 74 + lane * Math.min(window.innerHeight * 0.085, 72);
            },
            scale: (itemIndex) => 0.66 + (itemIndex % 3) * 0.04,
            rotation: (itemIndex) => (itemIndex % 2 === 0 ? -7 : 7),
            duration: 0.42,
            stagger: { each: 0.05, from: "start" },
            ease: "back.out(1.3)",
            force3D: true,
          },
          0.66,
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
            duration: 0.36,
            ease: "power2.out",
          },
          0.76 + pathIndex * 0.035,
        );
      });

      if (footnote) {
        timeline.from(
          footnote,
          {
            autoAlpha: 0,
            y: 18,
            duration: 0.24,
            ease: "power2.out",
          },
          1.06,
        );
      }

      timeline.duration(1.32);
      timeline.progress(0);
      return timeline;
    };

    const ensurePanelTimeline = (index: number) => {
      if (!panelTimelines[index]) panelTimelines[index] = buildPanelTimeline(index);
      return panelTimelines[index];
    };

    const sectionProgressTop = (index: number, localProgress: number) => {
      const progress = (index + localProgress) / panels.length;
      return storyTop + travel * progress;
    };

    const sectionScrollTop = (index: number) =>
      sectionProgressTop(index, SECTION_STOP_LOCAL_PROGRESS);

    const sectionZoomStartTop = (index: number) =>
      sectionProgressTop(index, CLICK_ZOOM_START_LOCAL_PROGRESS);

    const currentStoryProgress = () => clamp((window.scrollY - storyTop) / travel);

    const requestRender = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(render);
    };

    const resetHeroHandoff = () => {
      if (!heroHandoffActive) return;

      if (masterBoard && stickyHost && masterBoard.parentElement !== stickyHost) {
        stickyHost.prepend(masterBoard);
      }

      if (masterBoard) {
        gsap.set(masterBoard, {
          clearProps:
            "position,top,left,right,bottom,width,height,margin,zIndex,xPercent,yPercent,x,y,scale,transformOrigin,opacity,visibility,filter",
        });
      }
      if (heroSource) gsap.set(heroSource, { clearProps: "opacity,visibility" });

      heroHandoffActive = false;
      zoomTargets = [];
      measureZoomTargets();
      requestRender();
    };

    const canBeginHeroHandoff = () => {
      if (!heroSource || !masterBoard || !stickyHost || heroHandoffActive) return false;
      if (window.scrollY >= storyTop) return false;

      const rect = heroSource.getBoundingClientRect();
      const closeEnough = storyTop - window.scrollY <= window.innerHeight * 1.08;
      const boardVisible = rect.bottom > window.innerHeight * 0.16 && rect.top < window.innerHeight * 0.84;
      return closeEnough && boardVisible && rect.width > 10 && rect.height > 10;
    };

    const beginHeroHandoff = () => {
      masterBoard ??= document.querySelector<HTMLElement>("[data-zoom-master-board]");
      if (!heroSource || !masterBoard || !stickyHost || reducedMotion.matches) return false;

      measure();
      const sourceRect = heroSource.getBoundingClientRect();
      if (
        sourceRect.width <= 10 ||
        sourceRect.height <= 10 ||
        sourceRect.bottom <= 0 ||
        sourceRect.top >= window.innerHeight
      ) {
        return false;
      }

      scrollTween?.kill();
      scrollTween = null;
      heroHandoffActive = true;
      heroHandoffStartY = window.scrollY;
      heroHandoffEndY = Math.max(heroHandoffStartY + 1, sectionScrollTop(0));

      document.body.appendChild(masterBoard);
      gsap.set(masterBoard, {
        position: "fixed",
        top: sourceRect.top,
        left: sourceRect.left,
        right: "auto",
        bottom: "auto",
        width: sourceRect.width,
        height: sourceRect.height,
        margin: 0,
        zIndex: 35,
        xPercent: 0,
        yPercent: 0,
        x: 0,
        y: 0,
        scale: 1,
        autoAlpha: 1,
        filter: "none",
        force3D: true,
      });
      gsap.set(heroSource, { autoAlpha: 0 });

      const profileTarget = masterBoard.querySelector<HTMLElement>(zoomTargetSelectors[0]);
      const point = profileTarget
        ? offsetWithin(profileTarget, masterBoard)
        : { x: sourceRect.width * 0.2, y: sourceRect.height * 0.27 };

      heroHandoffOriginX = clamp(point.x / Math.max(1, sourceRect.width));
      heroHandoffOriginY = clamp(point.y / Math.max(1, sourceRect.height));
      heroHandoffTargetX = window.innerWidth / 2 - (sourceRect.left + point.x);
      heroHandoffTargetY = window.innerHeight / 2 - (sourceRect.top + point.y);

      gsap.set(masterBoard, {
        transformOrigin: `${heroHandoffOriginX * 100}% ${heroHandoffOriginY * 100}%`,
      });
      return true;
    };

    function render() {
      frame = 0;
      masterBoard ??= document.querySelector<HTMLElement>("[data-zoom-master-board]");
      if (masterBoard && zoomTargets.length === 0 && !heroHandoffActive) measureZoomTargets();

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
        if (masterBoard && !heroHandoffActive) gsap.set(masterBoard, { autoAlpha: 0 });
        if (room) gsap.set(room, { opacity: 0.18, scale: 1 });
      } else {
        const enter = smoothstep((localProgress - 0.02) / 0.22);
        const detailEnter = smoothstep((localProgress - 0.11) / 0.18);
        const exit = smoothstep((localProgress - 0.84) / 0.14);
        const panelVisibility = detailEnter * (1 - exit);
        const zoomStrength = enter * (1 - exit);
        const assemblyProgress = clamp((localProgress - 0.11) / 0.61);
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

        if (heroHandoffActive && masterBoard) {
          const rawHandoffProgress = clamp(
            (window.scrollY - heroHandoffStartY) /
              Math.max(1, heroHandoffEndY - heroHandoffStartY),
          );
          const handoffProgress = smoothstep(rawHandoffProgress);
          const fade = smoothstep((rawHandoffProgress - 0.34) / 0.34);

          gsap.set(masterBoard, {
            x: heroHandoffTargetX * handoffProgress,
            y: heroHandoffTargetY * handoffProgress,
            scale: 1 + handoffProgress * 3.23,
            autoAlpha: 1 - fade,
            filter: `brightness(${1 - fade * 0.08}) saturate(${1 - fade * 0.18})`,
            force3D: true,
          });

          if (window.scrollY < heroHandoffStartY - 3 || rawHandoffProgress >= 0.995) {
            resetHeroHandoff();
          }
        } else if (masterBoard) {
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
    }

    const setWindowScrollImmediate = (destination: number) => {
      const targetY = Math.max(0, destination);
      scrollTween?.kill();
      scrollTween = null;
      document.documentElement.style.scrollBehavior = "auto";
      window.scrollTo(0, targetY);
      restoreScrollBehavior();
      lastWindowY = targetY;
      render();
    };

    const animateWindowTo = (destination: number, options: WindowTweenOptions = {}) => {
      const targetY = Math.max(0, destination);
      const startY = window.scrollY;
      const immediate = options.immediate || reducedMotion.matches || Math.abs(targetY - startY) < 2;

      scrollTween?.kill();
      scrollTween = null;

      if (immediate) {
        setWindowScrollImmediate(targetY);
        if (typeof options.index === "number") {
          window.requestAnimationFrame(() => panels[options.index!]?.focus({ preventScroll: true }));
        }
        options.onComplete?.();
        return;
      }

      const state = { y: startY };
      document.documentElement.style.scrollBehavior = "auto";

      scrollTween = gsap.to(state, {
        y: targetY,
        duration: options.duration ?? CLICK_ZOOM_DURATION,
        ease: options.ease ?? "power2.inOut",
        overwrite: true,
        onUpdate: () => window.scrollTo(0, state.y),
        onComplete: () => {
          scrollTween = null;
          restoreScrollBehavior();
          lastWindowY = window.scrollY;
          requestRender();
          if (typeof options.index === "number") {
            panels[options.index]?.focus({ preventScroll: true });
          }
          options.onComplete?.();
        },
        onInterrupt: () => {
          scrollTween = null;
          restoreScrollBehavior();
          options.onInterrupt?.();
        },
      });
    };

    const directZoomToSection = (index: number) => {
      if (index < 0 || index >= panels.length) return;
      measure();

      if (reducedMotion.matches) {
        setWindowScrollImmediate(sectionScrollTop(index));
        return;
      }

      window.cancelAnimationFrame(directZoomFrame);
      setWindowScrollImmediate(sectionZoomStartTop(index));
      directZoomFrame = window.requestAnimationFrame(() => {
        animateWindowTo(sectionScrollTop(index), {
          index,
          duration: CLICK_ZOOM_DURATION,
          ease: "power2.inOut",
        });
      });
    };

    const directProfileFromHero = () => {
      measure();
      if (!canBeginHeroHandoff() || !beginHeroHandoff()) {
        directZoomToSection(0);
        return;
      }

      animateWindowTo(sectionScrollTop(0), {
        index: 0,
        duration: CLICK_ZOOM_DURATION,
        ease: "power2.inOut",
        onComplete: resetHeroHandoff,
        onInterrupt: resetHeroHandoff,
      });
    };

    const navigateToHash = (hash: string) => {
      const index = sectionIds.indexOf(hash.replace(/^#/, ""));
      if (index < 0) return;
      measure();
      setWindowScrollImmediate(sectionScrollTop(index));
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

      if (index === 0 && window.scrollY < storyTop) {
        directProfileFromHero();
      } else {
        directZoomToSection(index);
      }
    };

    const handleHistoryNavigation = () => {
      navigateToHash(window.location.hash);
    };

    const handleScroll = () => {
      const currentY = window.scrollY;
      const delta = currentY - lastWindowY;
      lastWindowY = currentY;

      if (
        !scrollTween &&
        !heroHandoffActive &&
        delta > 0.5 &&
        currentY < storyTop &&
        canBeginHeroHandoff()
      ) {
        beginHeroHandoff();
      }

      requestRender();
    };

    const handleResize = () => {
      scrollTween?.kill();
      scrollTween = null;
      if (heroHandoffActive) resetHeroHandoff();
      restoreScrollBehavior();
      killPanelTimelines();
      measure();
      requestRender();
    };

    navigationLinks.forEach((link) => link.addEventListener("click", handleNavigation));
    window.addEventListener("popstate", handleHistoryNavigation);
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleResize, { passive: true });

    measure();
    render();

    window.requestAnimationFrame(() => {
      if (!panelTimelines[1]) panelTimelines[1] = buildPanelTimeline(1);
      if (!heroHandoffActive) measureZoomTargets();
      requestRender();
    });

    if (window.location.hash) {
      initialNavigationFrame = window.requestAnimationFrame(() => {
        navigateToHash(window.location.hash);
      });
    }

    return () => {
      navigationLinks.forEach((link) => {
        link.removeEventListener("click", handleNavigation);
        link.classList.remove("is-active");
      });
      window.removeEventListener("popstate", handleHistoryNavigation);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
      window.cancelAnimationFrame(frame);
      window.cancelAnimationFrame(initialNavigationFrame);
      window.cancelAnimationFrame(directZoomFrame);
      scrollTween?.kill();
      if (masterBoard && stickyHost && masterBoard.parentElement !== stickyHost) {
        stickyHost.prepend(masterBoard);
      }
      if (heroSource) gsap.set(heroSource, { clearProps: "opacity,visibility" });
      restoreScrollBehavior();
      killPanelTimelines();
      gsap.killTweensOf([masterBoard, room, heroSource, ...panels].filter(Boolean));
      delete document.documentElement.dataset.zoomSection;
    };
  }, []);

  return null;
}
