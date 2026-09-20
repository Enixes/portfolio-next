"use client";

import { useEffect } from "react";
import gsap from "gsap";

export const SECTION_STOP_LOCAL_PROGRESS = 0.72;
export const BOARD_NAVIGATE_EVENT = "board:navigate";
export type BoardNavigation = { index: number; immediate?: boolean; reset?: boolean };

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
    const sectionIds = stops.map((stop) => stop.id);
    const links = Array.from(document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]'))
      .filter((link) => sectionIds.includes(link.hash.slice(1)));
    const dots = Array.from(story.querySelectorAll<HTMLElement>("[data-board-dot]"));
    let storyTop = 0;
    let travel = 1;
    let frame = 0;
    let initialFrame = 0;
    let tween: gsap.core.Tween | gsap.core.Timeline | null = null;
    let overlay: HTMLElement | null = null;
    let targetIndex = 0;
    let lastIndex = 0;

    const measure = () => {
      storyTop = window.scrollY + story.getBoundingClientRect().top;
      travel = Math.max(1, story.offsetHeight - window.innerHeight);
    };
    const sectionTop = (index: number) =>
      storyTop + travel * ((index + SECTION_STOP_LOCAL_PROGRESS) / panels.length);
    const currentIndex = () => Math.max(0, Math.min(panels.length - 1,
      Math.round((window.scrollY - storyTop) / travel * panels.length - SECTION_STOP_LOCAL_PROGRESS)));

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
      // Preserve the requested hash while the camera crosses intermediate stops.
      if (inside && !tween && window.location.hash !== "#" + activeId) {
        window.history.replaceState(null, "", "#" + activeId);
      }
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
      root.style.scrollBehavior = originalScrollBehavior;
    };

    const navigate = (options: BoardNavigation) => {
      const index = options.index;
      if (!Number.isInteger(index) || index < 0 || index >= panels.length) return;
      measure();
      const fromHero = window.scrollY < storyTop - 4;
      const previous = currentIndex();
      clearNavigation();
      targetIndex = index;
      root.dataset.boardNavigating = "true";
      root.dataset.boardDestination = String(index);
      root.style.scrollBehavior = "auto";
      const surface = panels[index].querySelector<HTMLElement>(
        ".work-cv-board,.life-live-board,.blog-live-board,.profile-live-mounted",
      ) ?? panels[index].querySelector<HTMLElement>(".story-board-surface");
      if (surface) surface.scrollTop = options.reset || fromHero || index >= previous
        ? 0 : Math.max(0, surface.scrollHeight - surface.clientHeight);
      const destination = sectionTop(index);
      const finish = () => {
        tween = null;
        window.scrollTo(0, destination);
        overlay?.remove();
        overlay = null;
        delete root.dataset.boardNavigating;
        delete root.dataset.boardDestination;
        root.style.scrollBehavior = originalScrollBehavior;
        window.history.replaceState(null, "", "#" + sectionIds[index]);
        panels[options.index]?.focus({ preventScroll: true });
        render();
      };
      if (options.immediate || reducedMotion.matches) {
        finish();
        return;
      }

      const source = document.querySelector<HTMLElement>(".preview-hero .evidence-board-frame");
      const sourceRect = source?.getBoundingClientRect();
      if (fromHero && source && sourceRect && sourceRect.bottom > 0) {
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
        gsap.set(clone, { position: "absolute", left: sourceRect.left, top: sourceRect.top,
          width: sourceRect.width, height: sourceRect.height, margin: 0, x: 0, y: 0 });
        const rect = clone.querySelector<HTMLElement>(zoomTargetSelectors[index])?.getBoundingClientRect() ?? sourceRect;
        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height / 2;
        gsap.set(clone, { transformOrigin: (x - sourceRect.left) + "px " + (y - sourceRect.top) + "px" });
        const timeline = gsap.timeline({ onComplete: finish });
        tween = timeline;
        timeline.to(veil, { opacity: 1, duration: .42, ease: "power2.inOut" }, 0)
          .to(clone, { x: window.innerWidth / 2 - x, y: window.innerHeight / 2 - y,
            scale: Math.max(3.4, window.innerWidth / Math.max(1, rect.width) * 1.3),
            duration: 1.1, ease: "power3.inOut" }, 0)
          .call(() => window.scrollTo(0, destination), [], .52)
          .to(clone, { opacity: 0, duration: .4, ease: "power2.in" }, .7)
          .to(veil, { opacity: 0, duration: .38, ease: "power2.out" }, .97);
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
        if (link.hash === "#top") clearNavigation();
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
        clearNavigation();
        if (!window.location.hash || window.location.hash === "#top") window.scrollTo(0, 0);
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
      window.cancelAnimationFrame(frame);
      window.cancelAnimationFrame(initialFrame);
      document.removeEventListener("click", onClick);
      window.removeEventListener(BOARD_NAVIGATE_EVENT, onRequest);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("popstate", onHistory);
      window.removeEventListener("hashchange", onHistory);
      window.removeEventListener("resize", onResize);
      delete root.dataset.boardEntered;
      delete root.dataset.zoomSection;
    };
  }, []);
  return null;
}
