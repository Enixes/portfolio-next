"use client";

import { useEffect } from "react";

const NOTE_SELECTOR = ".board-paper, .board-sticky, .war-note";

function isVisible(note: HTMLElement) {
  const bounds = note.getBoundingClientRect();
  const style = window.getComputedStyle(note);

  return (
    style.display !== "none" &&
    style.visibility !== "hidden" &&
    bounds.width > 0 &&
    bounds.height > 0 &&
    bounds.bottom > 0 &&
    bounds.right > 0 &&
    bounds.top < window.innerHeight &&
    bounds.left < window.innerWidth
  );
}

export function BreezeController() {
  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reducedMotion.matches) return;

    let gustTimer: number | undefined;
    let cleanupTimer: number | undefined;
    let activeNotes: HTMLElement[] = [];

    const clearGust = () => {
      activeNotes.forEach((note) => {
        note.classList.remove("is-breezing", "gust-from-left", "gust-from-right");
        note.style.removeProperty("--gust-delay");
      });
      activeNotes = [];
    };

    const scheduleGust = (delay: number) => {
      window.clearTimeout(gustTimer);
      gustTimer = window.setTimeout(runGust, delay);
    };

    const runGust = () => {
      if (document.visibilityState !== "visible") {
        scheduleGust(5_000);
        return;
      }

      const visibleNotes = Array.from(
        document.querySelectorAll<HTMLElement>(NOTE_SELECTOR),
      ).filter(isVisible);

      const shuffled = visibleNotes
        .map((note) => ({ note, order: Math.random() }))
        .sort((a, b) => a.order - b.order);
      const noteCount = Math.min(window.innerWidth <= 900 ? 2 : 3, shuffled.length);

      activeNotes = shuffled.slice(0, noteCount).map(({ note }, index) => {
        note.style.setProperty("--gust-delay", `${index * 85}ms`);
        note.classList.add(
          "is-breezing",
          Math.random() > 0.5 ? "gust-from-left" : "gust-from-right",
        );
        return note;
      });

      window.clearTimeout(cleanupTimer);
      cleanupTimer = window.setTimeout(clearGust, 1_250);
      scheduleGust(9_000 + Math.random() * 5_000);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        window.clearTimeout(gustTimer);
        window.clearTimeout(cleanupTimer);
        clearGust();
      } else {
        scheduleGust(1_800);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    scheduleGust(3_200);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.clearTimeout(gustTimer);
      window.clearTimeout(cleanupTimer);
      clearGust();
    };
  }, []);

  return null;
}
