"use client";

import { useEffect } from "react";
import gsap from "gsap";

/** One finite introduction per visit, with independent, interruptible ink studies. */
export function useBlogBoardMotion(board: HTMLElement | null) {
  useEffect(() => {
    if (!board) return;
    const panel = board.closest<HTMLElement>("[data-board-panel]");
    if (!panel) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let active = false;
    let visible = false;

    // Each owner restores its own targets, including SVG attributes GSAP writes.
    // Entry wrappers and scene artwork never share animation ownership.
    const owner = (elements: Element[]) => {
      const originals = elements.map((element) => ({ element, attributes:
        ["style", "transform", "data-svg-origin"].map((name) => [name, element.getAttribute(name)] as const),
      }));
      let context = gsap.context(() => {}, board);
      const restore = () => {
        context.revert();
        if (elements.length) gsap.set(elements, { clearProps: "transform,transformOrigin,opacity,strokeDashoffset" });
        originals.forEach(({ element, attributes }) => attributes.forEach(([name, value]) => {
          if (value === null) element.removeAttribute(name);
          else element.setAttribute(name, value);
        }));
      };
      return {
        restore,
        run: (build: () => void) => {
          restore();
          context = gsap.context(build, board);
        },
      };
    };

    const entryParts = Array.from(board.querySelectorAll(".blog-header, .blog-card-entry, .blog-archive, .blog-footer, .blog-board-thread"));
    const entry = owner(entryParts);
    const playEntry = () => {
      if (reduced.matches) return;
      entry.run(() => {
        const tl = gsap.timeline({ defaults: { ease: "power2.out" }, onComplete: entry.restore });
        tl.fromTo(board.querySelectorAll(".blog-header, .blog-footer"),
          { opacity: .35, y: 8 }, { opacity: 1, y: 0, duration: .55 });
        tl.fromTo(board.querySelectorAll(".blog-card-entry, .blog-archive"),
          { opacity: .25, y: 18 }, { opacity: 1, y: 0, duration: .65, stagger: .1 }, .12);
        tl.fromTo(board.querySelectorAll(".blog-board-thread"),
          { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1, stagger: .12 }, .25);
      });
    };

    const scenes = Array.from(board.querySelectorAll<HTMLElement>("[data-blog-scene]")).map((card) => {
      const select = (selector: string) => card.querySelectorAll(selector);
      const parts = Array.from(select(".blog-diagram *, .blog-highlight, .blog-question-underline"));
      const motion = owner(parts);
      let playing = false;
      let hovered = false;
      let focused = false;
      const restore = () => { playing = false; motion.restore(); };
      const play = () => {
        if (!active || reduced.matches || playing) return;
        motion.run(() => {
          playing = true;
          const tl = gsap.timeline({ defaults: { ease: "sine.inOut" }, onComplete: restore });
          const move = (selector: string, values: gsap.TweenVars, duration: number, at: number) =>
            tl.to(select(selector), { ...values, duration }, at);
          const draw = (selector: string, duration: number, at: number) =>
            tl.fromTo(select(selector), { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration }, at);
          switch (card.dataset.blogScene) {
            case "recovery":
              move(".blog-failure-mark", { rotation: 15, scale: 1.25, transformOrigin: "50% 50%", repeat: 1, yoyo: true }, .25, 0);
              draw(".blog-recovery-route", .8, .25);
              tl.fromTo(select(".blog-signal-path"), { strokeDashoffset: 1, opacity: 0 },
                { strokeDashoffset: 0, opacity: .85, duration: 1.1 }, .35);
              move(".blog-recovery-light", { scale: 1.6, transformOrigin: "50% 50%", repeat: 1, yoyo: true }, .3, 1.25);
              move(".blog-highlight", { scaleX: 1, opacity: .65, transformOrigin: "0% 50%" }, .6, .85);
              move(".blog-signal-path", { opacity: 0 }, .4, 1.65);
              move(".blog-highlight", { scaleX: .72, opacity: .3 }, .4, 1.7);
              break;
            case "agents":
              move(".blog-queue-token", { x: 80, opacity: 0, stagger: .18 }, .55, 0);
              move(".blog-guardrail", { x: -5, repeat: 1, yoyo: true }, .25, .55);
              draw(".blog-control-loop", .85, .8);
              tl.set(select(".blog-queue-token"), { x: 0 }, 1.45);
              move(".blog-queue-token", { opacity: 1, stagger: .12 }, .35, 1.5);
              break;
            case "concurrency":
              move(".blog-rail-token", { x: (i: number) => [113, 81, 130][i], stagger: .12 }, .65, 0);
              move(".blog-bottleneck", { scaleY: 1.2, transformOrigin: "50% 50%", repeat: 1, yoyo: true }, .3, .55);
              draw(".blog-fanout", .7, .9);
              move(".blog-rail-token", { x: 230, opacity: 0, stagger: .1 }, .55, 1);
              draw(".blog-timing-mark", .45, 1.35);
              tl.set(select(".blog-rail-token"), { x: 0 }, 1.85);
              move(".blog-rail-token", { opacity: 1 }, .35, 1.9);
              break;
            case "margins":
              move(".blog-compass-needle", { rotation: 42, svgOrigin: "54 51" }, .5, 0);
              move(".blog-compass-needle", { rotation: -18 }, .6, .5);
              move(".blog-compass-needle", { rotation: 0 }, .6, 1.1);
              draw(".blog-margin-thread", 1, .25);
              draw(".blog-margin-mark", .5, .95);
              move(".blog-question-mark", { y: -5, rotation: -8, transformOrigin: "50% 50%", repeat: 1, yoyo: true }, .45, .8);
              draw(".blog-question-underline", .65, 1.25);
              break;
          }
        });
      };
      const pointerEnter = (event: PointerEvent) => {
        if (event.pointerType === "touch") return;
        if (!hovered && !focused) play();
        hovered = true;
      };
      const pointerLeave = () => { hovered = false; if (!focused) restore(); };
      const focusIn = () => { if (!focused && !hovered) play(); focused = true; };
      const focusOut = (event: FocusEvent) => {
        if (event.relatedTarget instanceof Node && card.contains(event.relatedTarget)) return;
        focused = false;
        if (!hovered) restore();
      };
      card.addEventListener("pointerenter", pointerEnter);
      card.addEventListener("pointerleave", pointerLeave);
      card.addEventListener("pointercancel", pointerLeave);
      card.addEventListener("focusin", focusIn);
      card.addEventListener("focusout", focusOut);
      return {
        restore: () => { hovered = false; focused = false; restore(); },
        cleanup: () => {
          card.removeEventListener("pointerenter", pointerEnter);
          card.removeEventListener("pointerleave", pointerLeave);
          card.removeEventListener("pointercancel", pointerLeave);
          card.removeEventListener("focusin", focusIn);
          card.removeEventListener("focusout", focusOut);
          restore();
        },
      };
    });

    const settle = () => { entry.restore(); scenes.forEach((scene) => scene.restore()); };
    const update = () => {
      const next = visible && !document.hidden && !panel.hidden &&
        panel.getAttribute("aria-hidden") !== "true" && !panel.hasAttribute("inert") &&
        panel.style.pointerEvents === "auto" && panel.style.visibility !== "hidden";
      if (next === active) return;
      active = next;
      settle();
      if (active) playEntry();
    };
    const activationObserver = new MutationObserver(update);
    activationObserver.observe(panel, { attributes: true, attributeFilter: ["style", "hidden", "aria-hidden", "inert"] });
    const visibilityObserver = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      update();
    });
    visibilityObserver.observe(panel);
    // Preference changes immediately cancel everything, leaving complete static ink.
    reduced.addEventListener("change", settle);
    document.addEventListener("visibilitychange", update);
    return () => {
      activationObserver.disconnect();
      visibilityObserver.disconnect();
      reduced.removeEventListener("change", settle);
      document.removeEventListener("visibilitychange", update);
      entry.restore();
      scenes.forEach((scene) => scene.cleanup());
    };
  }, [board]);
}
