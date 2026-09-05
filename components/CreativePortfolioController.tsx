"use client";

import { useEffect } from "react";

const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));

export function CreativePortfolioController() {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>("[data-creative-portfolio]");
    if (!root) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const revealEls = Array.from(root.querySelectorAll<HTMLElement>("[data-reveal]"));
    const parallaxEls = Array.from(root.querySelectorAll<HTMLElement>("[data-parallax]"));
    const scenes = Array.from(root.querySelectorAll<HTMLElement>("[data-parallax-scene]"));
    const navLinks = Array.from(root.querySelectorAll<HTMLAnchorElement>('a[href^="#"]'));
    const sections = Array.from(root.querySelectorAll<HTMLElement>("[data-section-id]"));
    const hero = root.querySelector<HTMLElement>(".cw-hero");
    const board = root.querySelector<HTMLElement>(".cw-board");

    let raf = 0;

    const render = () => {
      raf = 0;
      const viewport = Math.max(1, window.innerHeight);
      const pageY = window.scrollY;
      root.style.setProperty("--page-y", `${pageY}px`);

      const heroRect = hero?.getBoundingClientRect();
      if (heroRect) {
        const progress = clamp(-heroRect.top / Math.max(1, heroRect.height - viewport));
        root.style.setProperty("--hero-progress", String(progress));
      }

      scenes.forEach((scene) => {
        const rect = scene.getBoundingClientRect();
        const centerOffset = rect.top + rect.height / 2 - viewport / 2;
        const normalized = clamp(centerOffset / viewport, -1.4, 1.4);
        scene.style.setProperty("--scene-y", String(normalized));
      });

      parallaxEls.forEach((el) => {
        const speed = Number(el.dataset.parallax || 0);
        const rect = el.getBoundingClientRect();
        const local = (rect.top + rect.height / 2 - viewport / 2) * speed;
        el.style.setProperty("--parallax-y", `${local}px`);
      });
    };

    const requestRender = () => {
      if (raf || reducedMotion.matches) return;
      raf = window.requestAnimationFrame(render);
    };

    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("is-visible");
        });
      },
      { threshold: 0.14, rootMargin: "0px 0px -8% 0px" },
    );

    revealEls.forEach((el) => revealObserver.observe(el));

    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const id = (entry.target as HTMLElement).dataset.sectionId;
          root.querySelectorAll(".cw-nav a").forEach((link) => {
            link.classList.toggle("is-active", (link as HTMLAnchorElement).hash === `#${id}`);
          });
        });
      },
      { threshold: 0.55 },
    );

    sections.forEach((section) => sectionObserver.observe(section));

    const onPointerMove = (event: PointerEvent) => {
      if (!hero || reducedMotion.matches) return;
      const rect = hero.getBoundingClientRect();
      const x = clamp((event.clientX - rect.left) / Math.max(1, rect.width), 0, 1) - 0.5;
      const y = clamp((event.clientY - rect.top) / Math.max(1, rect.height), 0, 1) - 0.5;
      hero.style.setProperty("--mx", String(x));
      hero.style.setProperty("--my", String(y));

      if (board) {
        const boardRect = board.getBoundingClientRect();
        board.style.setProperty("--spot-x", `${event.clientX - boardRect.left}px`);
        board.style.setProperty("--spot-y", `${event.clientY - boardRect.top}px`);
      }
    };

    const onAnchorClick = (event: MouseEvent) => {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = event.currentTarget as HTMLAnchorElement;
      const target = document.querySelector<HTMLElement>(link.hash);
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: reducedMotion.matches ? "auto" : "smooth", block: "start" });
      window.history.replaceState(null, "", link.hash);
    };

    navLinks.forEach((link) => link.addEventListener("click", onAnchorClick));
    hero?.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("scroll", requestRender, { passive: true });
    window.addEventListener("resize", requestRender, { passive: true });

    render();

    return () => {
      revealObserver.disconnect();
      sectionObserver.disconnect();
      navLinks.forEach((link) => link.removeEventListener("click", onAnchorClick));
      hero?.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("scroll", requestRender);
      window.removeEventListener("resize", requestRender);
      window.cancelAnimationFrame(raf);
    };
  }, []);

  return null;
}
