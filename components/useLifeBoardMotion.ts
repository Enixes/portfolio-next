"use client";

import { useEffect } from "react";
import gsap from "gsap";

/** Finite ink performances, owned by the camera's settled Life panel. */
export function useLifeBoardMotion(board: HTMLElement | null) {
  useEffect(() => {
    if (!board) return;
    const panel = board.closest<HTMLElement>("[data-board-panel]");
    if (!panel) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let active = false;
    let panelVisible = false;
    const visibleCards = new Set<Element>();
    const pendingEntrance = new Set<HTMLElement>();
    const cards = Array.from(board.querySelectorAll<HTMLElement>("[data-life-scene]"));

    const scenes = cards.map((card) => {
      const parts = Array.from(card.querySelectorAll<SVGElement | HTMLElement>(".life-motion"));
      const originals = parts.map((part) => ({
        style: part.getAttribute("style"),
        transform: part.getAttribute("transform"),
        origin: part.getAttribute("data-svg-origin"),
      }));
      const rest = parts.map((part) => ({
        x: Number(gsap.getProperty(part, "x")), y: Number(gsap.getProperty(part, "y")),
        rotation: Number(gsap.getProperty(part, "rotation")), skewX: Number(gsap.getProperty(part, "skewX")),
        scaleX: Number(gsap.getProperty(part, "scaleX")), scaleY: Number(gsap.getProperty(part, "scaleY")),
        opacity: Number(getComputedStyle(part).opacity),
        strokeDashoffset: getComputedStyle(part).strokeDashoffset,
      }));
      const restingPose = {
        x: (i: number) => rest[i].x, y: (i: number) => rest[i].y,
        rotation: (i: number) => rest[i].rotation, skewX: (i: number) => rest[i].skewX,
        scaleX: (i: number) => rest[i].scaleX, scaleY: (i: number) => rest[i].scaleY,
        opacity: (i: number) => rest[i].opacity,
        strokeDashoffset: (i: number) => rest[i].strokeDashoffset,
      };
      // Revert preserves CSS rotations and SVG attributes even on interruption.
      const context = gsap.context(() => {}, card);
      let sequence: gsap.core.Timeline | null = null;
      let settling: gsap.core.Tween | null = null;
      let hovered = false;
      let focused = false;
      const select = (selector: string) => card.querySelectorAll(selector);
      const restore = () => {
        sequence = null;
        settling = null;
        context.revert();
        // Timed .set() steps may revert to an intermediate pose. Restore the
        // captured artwork exactly and invalidate GSAP's cached transforms.
        gsap.set(parts, { clearProps: "transform,transformOrigin,opacity,strokeDashoffset" });
        parts.forEach((part, i) => {
          const original = originals[i];
          for (const [name, value] of [["style", original.style], ["transform", original.transform], ["data-svg-origin", original.origin]]) {
            if (value === null) part.removeAttribute(name!);
            else part.setAttribute(name!, value!);
          }
        });
      };
      const settle = (immediate = false) => {
        if (immediate) { restore(); return; }
        if (!sequence) return;
        sequence.kill();
        sequence = null;
        context.add(() => {
          settling = gsap.to(parts, { ...restingPose, duration: .55, ease: "power2.out", onComplete: restore });
        });
      };

      const play = (delay = 0) => {
        if (!active || reduced.matches || sequence) return;
        if (settling) restore();
        pendingEntrance.delete(card);
        context.add(() => {
          const tl = gsap.timeline({ delay, defaults: { ease: "sine.inOut" }, onComplete: restore });
          sequence = tl;
          const move = (selector: string, values: gsap.TweenVars, duration: number, at = 0) => {
            tl.to(select(selector), { ...values, duration }, at);
          };
          const sway = (selector: string, values: gsap.TweenVars, duration: number, at = 0) => {
            move(selector, { ...values, repeat: 1, yoyo: true }, duration, at);
          };
          switch (card.dataset.lifeScene) {
            case "botw":
              sway(".field-far", { x: 7, y: 2 }, 1.25);
              sway(".field-near", { x: -9 }, 1.15, .1);
              sway(".grass-back", { skewX: 18, x: 3, transformOrigin: "50% 100%" }, .85, .1);
              sway(".grass-front", { skewX: -24, x: -4, transformOrigin: "50% 100%" }, .9, .25);
              sway(".hero-cloak", { rotation: -14, skewX: -7, svgOrigin: "131 83" }, .8, .1);
              move(".leaf-a", { x: 75, y: 22, rotation: 140, transformOrigin: "50% 50%" }, 1.9, .05);
              move(".leaf-b", { x: 58, y: -28, rotation: -115, transformOrigin: "50% 50%" }, 1.8, .25);
              move(".wind-ink", { x: 32, opacity: .25 }, 1.7);
              // A shoulder-led wind-up, fast outward cut, then recovery.
              move(".hero-sword", { rotation: 26, svgOrigin: "122 94", ease: "power2.out" }, .4, .15);
              move(".hero-sword", { rotation: -104, ease: "power3.inOut" }, .42, .7);
              move(".hero-sword", { rotation: -80 }, .3, 1.12);
              move(".hero-sword", { rotation: 0, ease: "power2.inOut" }, .8, 1.6);
              move(".sword-sweep", { strokeDashoffset: 0, opacity: .95, ease: "power2.out" }, .38, .73);
              move(".sword-sweep", { opacity: 0 }, .45, 1.12);
              sway(".sword-glint", { opacity: 1, scale: 1.5, transformOrigin: "50% 50%" }, .25, .65);
              break;
            case "witcher":
              sway(".forest-far", { x: 9 }, 1.4);
              sway(".forest-near", { x: -7 }, 1.35, .1);
              sway(".fog-low", { x: 45, opacity: .78 }, 1.4);
              sway(".fog-high", { x: -32, opacity: .7 }, 1.3, .2);
              sway(".witcher-hair", { rotation: -18, svgOrigin: "173 53" }, 1.1, .1);
              sway(".witcher-coat", { skewX: -9, svgOrigin: "164 84" }, 1.2, .15);
              move(".wolf-medallion", { rotation: 25, svgOrigin: "161 82" }, .35, .15);
              move(".wolf-medallion", { rotation: -17 }, .5, .5);
              move(".wolf-medallion", { rotation: 9 }, .5, 1);
              move(".wolf-medallion", { rotation: 0 }, .6, 1.5);
              [".track-one", ".track-two", ".track-three"].forEach((track, i) => {
                tl.fromTo(select(track), { opacity: .08 }, { opacity: 1, duration: .35 }, .4 + i * .38);
              });
              sway(".sword-glint", { opacity: 1, scale: 1.8, transformOrigin: "50% 50%" }, .3, 1.4);
              tl.fromTo(select(".witcher-sign"), { strokeDashoffset: 1 }, { strokeDashoffset: 0, opacity: 1, duration: .65 }, 1.1);
              move(".sign-radiance", { opacity: .9, strokeDashoffset: 0 }, .65, 1.5);
              move(".sign-radiance", { opacity: 0 }, .6, 2.2);
              break;
            case "fma":
              [".circle-outer", ".circle-inner", ".circle-geometry"].forEach((ring, i) => {
                tl.fromTo(select(ring), { strokeDashoffset: 1, opacity: .3 }, {
                  strokeDashoffset: 0, opacity: 1, duration: .85, ease: "power2.inOut",
                }, .2 + i * .4);
              });
              move(".metal-arm", { rotation: 18, svgOrigin: "237 94" }, .35, .05);
              move(".metal-arm", { rotation: -17, ease: "power3.in" }, .25, .5);
              move(".metal-arm", { rotation: -10 }, .6, .75);
              move(".metal-arm", { rotation: 0 }, .8, 1.5);
              sway(".alchemist-coat", { rotation: -12, skewX: -5, svgOrigin: "225 79" }, 1, .1);
              tl.fromTo(select(".alchemy-sparks"), { scale: .65, opacity: 0, transformOrigin: "50% 50%" }, {
                opacity: 1, scale: 1.2, duration: .3, ease: "power2.out",
              }, .75);
              move(".alchemy-sparks", { scale: 1.45, opacity: 0 }, .7, 1.25);
              sway(".sword-glint", { opacity: 1, x: -12 }, .35, 1.3);
              break;
            case "frieren":
              move(".mage-figure", { y: -25, x: -3, rotation: -3, svgOrigin: "221 166", ease: "power2.out" }, 1, .2);
              move(".mage-figure", { y: -28, rotation: 1 }, .7, 1.2);
              move(".mage-figure", { y: 0, x: 0, rotation: 0, ease: "sine.inOut" }, .9, 1.9);
              move(".mage-shadow", { scaleX: .55, opacity: .1, transformOrigin: "50% 50%" }, 1, .2);
              move(".mage-shadow", { scaleX: 1.1, opacity: .26 }, .8, 2);
              sway(".mage-hair", { skewX: 19, rotation: -7, svgOrigin: "220 62" }, 1.25, .1);
              sway(".mage-cloak", { rotation: -10, skewX: 7, svgOrigin: "220 87" }, 1.3, .15);
              sway(".meadow-flowers", { skewX: -20, x: 4, transformOrigin: "50% 100%" }, 1.4, .2);
              move(".magic-particles", { y: -30, x: 11, opacity: 1 }, 1.9, .2);
              move(".magic-particles", { opacity: .1 }, .7, 2.1);
              move(".magic-arc", { strokeDashoffset: 0, opacity: 1 }, 1.4, .35);
              move(".meadow-wind", { x: 30, opacity: .95 }, 1.1, .15);
              move(".meadow-wind", { x: 50, opacity: 0 }, 1, 1.5);
              tl.fromTo(select(".landing-ring"), { scaleX: .5, opacity: 0, transformOrigin: "50% 50%" }, {
                scaleX: 1.2, opacity: .85, duration: .4, ease: "power2.out",
              }, 2.65);
              move(".landing-ring", { scaleX: 1.45, opacity: 0 }, .45, 3.05);
              break;
            case "haikyuu":
              move(".volleyball-player", { x: -3, y: 8, rotation: -4, svgOrigin: "132 137" }, .25);
              move(".volleyball-player", { x: 12, y: -19, rotation: 8, ease: "power2.out" }, .45, .25);
              move(".volleyball-player", { x: 20, y: -12, rotation: 12, ease: "power2.in" }, .2, .7);
              move(".volleyball-player", { x: 23, y: 9, rotation: 2, ease: "power2.in" }, .4, .9);
              move(".volleyball-player", { x: 0, y: 0, rotation: 0 }, .65, 1.3);
              move(".volleyball-ball", { x: -12, y: 5, rotation: -35, transformOrigin: "50% 50%" }, .65);
              move(".volleyball-ball", { x: 108, y: 147, rotation: 190, ease: "power2.in" }, .32, .7);
              move(".volleyball-ball", { x: 133, y: 112, rotation: 240, ease: "power2.out" }, .25, 1.02);
              move(".volleyball-ball", { x: 143, y: 140, opacity: 0, ease: "power2.in" }, .35, 1.27);
              tl.set(select(".volleyball-ball"), { x: 0, y: 0, rotation: 0 }, 1.7);
              move(".volleyball-ball", { opacity: 1 }, .5, 1.75);
              sway(".volleyball-net", { skewX: -6, scaleY: .93, transformOrigin: "50% 0%" }, .22, .85);
              sway(".speed-lines", { opacity: 1, x: 9, y: 5 }, .4, .3);
              sway(".ball-impact", { opacity: 1, scale: 1.5, transformOrigin: "50% 50%" }, .25, .97);
              tl.fromTo(select(".court-lines"), { strokeDashoffset: 1 }, { strokeDashoffset: 0, opacity: 1, duration: 1.1 }, 0);
              break;
            case "football": {
              const pitch = card.querySelector<HTMLElement>(".life-pitch");
              const travel = (pitch?.clientWidth ?? 180) * .36;
              sway(".life-player", { x: "+=8", y: (i: number) => i % 2 ? "+=8" : "-=8", stagger: .08 }, .7);
              sway(".life-cam-dot", { scale: 1.4 }, .45, .2);
              tl.fromTo(select(".life-pass-line"), { scaleX: 0, opacity: .2 }, { scaleX: 1, opacity: 1, duration: .7 }, .4);
              move(".life-ball", { x: -17, y: 15 }, .35);
              move(".life-ball", { x: 0, y: 0 }, .3, .35);
              move(".life-ball", { x: travel, y: -travel * .38, rotation: 260, ease: "power2.out" }, .8, .75);
              move(".life-ball", { opacity: 0 }, .25, 1.65);
              tl.set(select(".life-ball"), { x: 0, y: 0, rotation: 0 }, 2);
              move(".life-ball", { opacity: 1 }, .4, 2.05);
              sway(".life-doodle-football", { rotation: -12, transformOrigin: "50% 100%" }, .65, .2);
              sway(".football-sketch-ball", { x: -32, y: -44, rotation: -100, transformOrigin: "50% 50%" }, .7, .6);
              break;
            }
            case "books":
              move(".life-bookmark", { rotation: 22, y: 7, transformOrigin: "50% 0%" }, .45);
              move(".life-bookmark", { rotation: -12, y: 0 }, .6, .45);
              move(".life-bookmark", { rotation: 0 }, .65, 1.05);
              sway(".life-doodle-book", { rotation: 5, y: -6, transformOrigin: "50% 100%" }, 1.05, .1);
              move(".reader-page", { scaleX: .05, skewX: -12, svgOrigin: "65 73", ease: "power2.in" }, .5, .35);
              move(".reader-page", { scaleX: -1, skewX: 0, ease: "power2.out" }, .6, .85);
              move(".reader-page", { opacity: 0 }, .3, 1.55);
              tl.set(select(".reader-page"), { scaleX: 1, skewX: 0 }, 1.95);
              move(".reader-page", { opacity: 1 }, .45, 2);
              sway(".life-margin-notes .life-motion", { y: -6, rotation: "+=3", stagger: .2 }, .6, .25);
              break;
          }
          // One return-to-ink tail also covers displaced leaves and accents.
          tl.to(parts, { ...restingPose, duration: .6, ease: "power2.out" }, ">+=.08");
        });
      };

      const enter = () => { if (!hovered && !focused) play(); };
      const pointerEnter = (event: PointerEvent) => {
        if (event.pointerType === "touch") return;
        enter(); hovered = true;
      };
      const pointerLeave = () => { hovered = false; if (!focused) settle(); };
      const focusIn = () => { enter(); focused = true; };
      const focusOut = (event: FocusEvent) => {
        if (event.relatedTarget instanceof Node && card.contains(event.relatedTarget)) return;
        focused = false;
        if (!hovered) settle();
      };
      card.addEventListener("pointerenter", pointerEnter);
      card.addEventListener("pointerleave", pointerLeave);
      card.addEventListener("focusin", focusIn);
      card.addEventListener("focusout", focusOut);
      return {
        card, play, settle,
        cleanup: () => {
          card.removeEventListener("pointerenter", pointerEnter);
          card.removeEventListener("pointerleave", pointerLeave);
          card.removeEventListener("focusin", focusIn);
          card.removeEventListener("focusout", focusOut);
          restore();
        },
      };
    });

    const reveal = () => {
      if (!active || reduced.matches) return;
      let order = 0;
      scenes.forEach((scene) => {
        if (pendingEntrance.has(scene.card) && visibleCards.has(scene.card)) scene.play(.12 + order++ * .16);
      });
    };
    const updateActivation = () => {
      // Observe the camera's styles without adding scroll/navigation handlers.
      const next = panelVisible && !document.hidden &&
        panel.style.pointerEvents === "auto" && panel.style.visibility !== "hidden";
      if (next === active) return;
      active = next;
      pendingEntrance.clear();
      if (active) {
        cards.forEach((card) => pendingEntrance.add(card));
        reveal();
      } else scenes.forEach((scene) => scene.settle(document.hidden || reduced.matches));
    };
    const activationObserver = new MutationObserver(updateActivation);
    activationObserver.observe(panel, { attributes: true, attributeFilter: ["style"] });
    const panelObserver = new IntersectionObserver(([entry]) => {
      panelVisible = entry.isIntersecting && entry.intersectionRatio >= .5;
      updateActivation();
    }, { threshold: [.5] });
    panelObserver.observe(panel);

    // Save below-fold introductions until the art can be seen on short boards.
    // Each card performs only once per Life visit, including after internal scroll.
    const cardObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && entry.intersectionRatio >= .25) visibleCards.add(entry.target);
        else visibleCards.delete(entry.target);
      });
      reveal();
    }, { root: board, threshold: [.25] });
    cards.forEach((card) => cardObserver.observe(card));
    const preferenceChanged = () => {
      pendingEntrance.clear();
      scenes.forEach((scene) => scene.settle(true));
    };
    reduced.addEventListener("change", preferenceChanged);
    document.addEventListener("visibilitychange", updateActivation);
    return () => {
      activationObserver.disconnect();
      panelObserver.disconnect();
      cardObserver.disconnect();
      reduced.removeEventListener("change", preferenceChanged);
      document.removeEventListener("visibilitychange", updateActivation);
      scenes.forEach((scene) => scene.cleanup());
    };
  }, [board]);
}
