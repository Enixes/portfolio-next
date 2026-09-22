"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { BOARD_NAVIGATE_EVENT, boardGeometry, boardSurface, type BoardNavigation } from "./board-navigation";

const zoomTargetSelectors = [
  ".board-zone-profile", ".board-zone-work", ".board-zone-blog",
  ".board-zone-life", ".board-zone-contact",
] as const;

/** The sole owner of window-scroll animations. Gestures request destinations;
 * the spatial camera only renders the resulting position. */
export function BoardScrollController() {
  useEffect(() => {
    const story = document.querySelector<HTMLElement>("[data-board-story]");
    const panels = Array.from(story?.querySelectorAll<HTMLElement>("[data-board-panel]") ?? []);
    const stops = Array.from(story?.querySelectorAll<HTMLElement>("[data-board-stop]") ?? []);
    if (!story || !panels.length) return;

    const root = document.documentElement;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const originalScrollBehavior = root.style.scrollBehavior;
    // This controller animates the window. Native smooth fragment scrolling
    // would otherwise start a second animation after a Back/hash event.
    root.style.scrollBehavior = "auto";
    const sectionIds = stops.map((stop) => stop.id);
    const links = Array.from(document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]'))
      .filter((link) => sectionIds.includes(link.hash.slice(1)));
    const dots = Array.from(story.querySelectorAll<HTMLElement>("[data-board-dot]"));
    let storyTop = 0;
    let step = 1;
    let frame = 0;
    let initialFrame = 0;
    let tween: gsap.core.Tween | gsap.core.Timeline | null = null;
    let overlay: HTMLElement | null = null;
    let targetIndex = 0;
    let lastIndex = 0;
    const intro = document.querySelector<HTMLElement>(".war-room-intro");
    let introTimer = 0;

    const completeIntro = () => {
      root.dataset.introComplete = "true";
      window.clearTimeout(introTimer);
    };
    const onIntroEnd = (event: AnimationEvent) => {
      if (event.target === intro && event.animationName === "war-room-intro-exit") completeIntro();
    };

    const measure = () => {
      const geometry = boardGeometry(story, panels.length);
      storyTop = geometry.top;
      step = geometry.step;
    };
    const sectionTop = (index: number) => storyTop + step * index;
    const currentIndex = () => Math.max(0, Math.min(panels.length - 1,
      Math.round((window.scrollY - storyTop) / step)));

    function render() {
      frame = 0;
      const inside = window.scrollY >= storyTop - 1;
      const index = currentIndex();
      const activeId = sectionIds[index];
      root.dataset.boardEntered = String(inside || Boolean(overlay));
      root.dataset.zoomSection = inside ? activeId : "";
      dots.forEach((dot, i) => dot.classList.toggle("is-active", i === index));
      links.forEach((link) => {
        const active = inside && link.hash === "#" + activeId;
        link.classList.toggle("is-active", active);
        if (active) link.setAttribute("aria-current", "location");
        else link.removeAttribute("aria-current");
      });
      // Commit hashes only when navigation finishes. A queued scroll frame can
      // run after Back changes the URL but before popstate restores its board.
      lastIndex = index;
    }
    const handleScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(render);
    };
    const clearNavigation = () => {
      tween?.kill();
      tween = null;
      overlay?.remove();
      overlay = null;
      delete root.dataset.boardNavigating;
      delete root.dataset.boardDestination;
    };

    const navigate = (options: BoardNavigation) => {
      const index = options.index;
      if (!Number.isInteger(index) || index < -1 || index >= panels.length) return;
      // Navigation is always subsequent to the page entrance. Keep that fact
      // independent of scroll position so rebuilding the hero cannot replay it.
      completeIntro();
      measure();
      const toHero = index === -1;
      const fromHero = window.scrollY < storyTop - 4;
      const previous = currentIndex();
      clearNavigation();
      targetIndex = index;
      root.dataset.boardNavigating = "true";
      root.dataset.boardDestination = String(index);
      root.style.scrollBehavior = "auto";
      // Every board arrives at its header in either direction. Internal reading
      // belongs to the gesture navigator, never to the camera's transition.
      const surface = toHero ? null : boardSurface(panels[index]);
      if (surface && (options.reset || index !== previous || fromHero)) surface.scrollTop = 0;
      const destination = toHero ? 0 : sectionTop(index);
      const finish = () => {
        tween = null;
        window.scrollTo(0, destination);
        overlay?.remove();
        overlay = null;
        delete root.dataset.boardNavigating;
        delete root.dataset.boardDestination;
        window.history.replaceState(null, "", toHero ? "#top" : "#" + sectionIds[index]);
        if (toHero) document.querySelector<HTMLElement>(".preview-brand")?.focus({ preventScroll: true });
        else panels[options.index]?.focus({ preventScroll: true });
        render();
      };
      if (options.immediate || reducedMotion.matches) {
        finish();
        return;
      }

      const source = document.querySelector<HTMLElement>(".preview-hero .evidence-board-frame");
      const sourceRect = source?.getBoundingClientRect();
      if ((fromHero || toHero) && source && sourceRect) {
        // Freeze the actual hero, then zoom into the chosen chit. An opaque
        // white veil masks the scroll jump while the detail board takes over.
        overlay = document.createElement("div");
        overlay.className = "board-entry-overlay";
        overlay.setAttribute("aria-hidden", "true");
        overlay.inert = true;
        const veil = document.createElement("div");
        veil.className = "board-entry-veil";
        const clone = source.cloneNode(true) as HTMLElement;
        clone.classList.add("board-entry-clone");
        clone.querySelectorAll("[id]").forEach((node) => node.removeAttribute("id"));
        overlay.append(veil, clone);
        document.body.append(overlay);
        const sourceTop = sourceRect.top + (toHero ? window.scrollY : 0);
        gsap.set(clone, { position: "absolute", left: sourceRect.left, top: sourceTop,
          width: sourceRect.width, height: sourceRect.height, margin: 0, x: 0, y: 0 });
        const rect = clone.querySelector<HTMLElement>(zoomTargetSelectors[toHero ? previous : index])?.getBoundingClientRect() ?? sourceRect;
        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height / 2;
        gsap.set(clone, { transformOrigin: (x - sourceRect.left) + "px " + (y - sourceTop) + "px" });
        const timeline = gsap.timeline({ onComplete: finish });
        tween = timeline;
        const zoom = { x: window.innerWidth / 2 - x, y: window.innerHeight / 2 - y,
          scale: Math.max(3.4, window.innerWidth / Math.max(1, rect.width) * 1.3) };
        if (toHero) {
          gsap.set(clone, { ...zoom, opacity: 0 });
          timeline.to(veil, { opacity: 1, duration: .24 }, 0)
            .to(clone, { opacity: 1, duration: .3 }, .08)
            .call(() => window.scrollTo(0, destination), [], .25)
            .to(clone, { x: 0, y: 0, scale: 1, duration: 1.05, ease: "power3.inOut" }, .12)
            .to(veil, { opacity: 0, duration: .4 }, .8);
        } else {
          timeline.to(veil, { opacity: 1, duration: .42, ease: "power2.inOut" }, 0)
            .to(clone, { ...zoom, duration: 1.1, ease: "power3.inOut" }, 0)
            .call(() => window.scrollTo(0, destination), [], .52)
            .to(clone, { opacity: 0, duration: .4, ease: "power2.in" }, .7)
            .to(veil, { opacity: 0, duration: .38, ease: "power2.out" }, .97);
        }
      } else {
        const state = { y: window.scrollY };
        tween = gsap.to(state, { y: destination, duration: 1.22, ease: "power3.inOut",
          onUpdate: () => window.scrollTo(0, state.y), onComplete: finish });
      }
    };

    const onRequest = (event: Event) => navigate((event as CustomEvent<BoardNavigation>).detail);
    const onClick = (event: MouseEvent) => {
      if (event.button || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = (event.target as Element | null)?.closest<HTMLAnchorElement>('a[href^="#"]');
      if (!link) return;
      const index = sectionIds.indexOf(link.hash.slice(1));
      if (index < 0) {
        if (link.hash === "#top") {
          event.preventDefault();
          if (window.location.hash !== "#top") window.history.pushState(null, "", "#top");
          navigate({ index: -1 });
        }
        return;
      }
      event.preventDefault();
      if (window.location.hash !== link.hash) window.history.pushState(null, "", link.hash);
      navigate({ index, reset: true });
    };
    const onHistory = () => {
      const index = sectionIds.indexOf(window.location.hash.slice(1));
      if (index >= 0) navigate({ index, immediate: true, reset: true });
      else {
        if (!window.location.hash || window.location.hash === "#top") navigate({ index: -1, immediate: true });
      }
    };
    const onResize = () => {
      const index = tween ? targetIndex : lastIndex;
      const inside = window.scrollY >= storyTop - 1 || Boolean(tween);
      clearNavigation();
      measure();
      if (inside) navigate({ index, immediate: true });
      handleScroll();
    };

    measure();
    if (reducedMotion.matches || window.scrollY >= storyTop - 1 ||
        sectionIds.includes(window.location.hash.slice(1))) completeIntro();
    else {
      intro?.addEventListener("animationend", onIntroEnd);
      introTimer = window.setTimeout(completeIntro, 3600);
    }
    const originalRestoration = window.history.scrollRestoration;
    window.history.scrollRestoration = "manual";
    initialFrame = window.requestAnimationFrame(() => {
      const index = sectionIds.indexOf(window.location.hash.slice(1));
      if (index >= 0) navigate({ index, immediate: true, reset: true });
      else render();
    });
    document.addEventListener("click", onClick);
    window.addEventListener(BOARD_NAVIGATE_EVENT, onRequest);
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("popstate", onHistory);
    window.addEventListener("hashchange", onHistory);
    window.addEventListener("resize", onResize);
    return () => {
      clearNavigation();
      window.history.scrollRestoration = originalRestoration;
      root.style.scrollBehavior = originalScrollBehavior;
      window.cancelAnimationFrame(frame);
      window.cancelAnimationFrame(initialFrame);
      document.removeEventListener("click", onClick);
      window.removeEventListener(BOARD_NAVIGATE_EVENT, onRequest);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("popstate", onHistory);
      window.removeEventListener("hashchange", onHistory);
      window.removeEventListener("resize", onResize);
      intro?.removeEventListener("animationend", onIntroEnd);
      window.clearTimeout(introTimer);
      delete root.dataset.boardEntered;
      delete root.dataset.zoomSection;
    };
  }, []);
  return null;
}
