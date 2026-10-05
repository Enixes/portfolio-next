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

    let gustTimer: number | undefined;
    let cleanupTimer: number | undefined;
    let roomCleanupTimer: number | undefined;
    let activeNotes: HTMLElement[] = [];
    const room = document.querySelector<HTMLElement>(".preview-hero");
    let roomVisible = false;
    const roomObserver = room ? new IntersectionObserver(([entry]) => {
      roomVisible = entry.isIntersecting;
      if (!roomVisible) room.classList.remove("is-room-breezing");
    }, { threshold: 0.05 }) : null;
    if (room && roomObserver) roomObserver.observe(room);

    const clearGust = () => {
      activeNotes.forEach((note) => {
        note.classList.remove("is-breezing");
        note.style.removeProperty("--gust-delay");
      });
      activeNotes = [];
    };
    const clearRoom = () => {
      room?.classList.remove("is-room-breezing");
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

      const visibleNotes = reducedMotion.matches ? [] : Array.from(
        document.querySelectorAll<HTMLElement>(NOTE_SELECTOR),
      ).filter(isVisible);

      if (roomVisible && !reducedMotion.matches) {
        room?.classList.remove("is-room-breezing");
        void room?.offsetWidth;
        room?.classList.add("is-room-breezing");
        window.clearTimeout(roomCleanupTimer);
        roomCleanupTimer = window.setTimeout(clearRoom, 2_600);
      }
      window.dispatchEvent(new CustomEvent("room:gust", { detail: { heroVisible: roomVisible } }));

      const shuffled = visibleNotes
        .map((note) => ({ note, order: Math.random() }))
        .sort((a, b) => a.order - b.order);
      const noteCount = Math.min(window.innerWidth <= 900 ? 2 : 3, shuffled.length);

      activeNotes = shuffled
        .slice(0, noteCount)
        .map(({ note }) => note)
        .sort(
          (left, right) =>
            left.getBoundingClientRect().left - right.getBoundingClientRect().left,
        )
        .map((note, index) => {
          note.style.setProperty("--gust-delay", `${index * 110}ms`);
          note.classList.add("is-breezing");
          return note;
        });

      window.clearTimeout(cleanupTimer);
      cleanupTimer = window.setTimeout(clearGust, 1_400);
      scheduleGust(9_000 + Math.random() * 5_000);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        window.clearTimeout(gustTimer);
        window.clearTimeout(cleanupTimer);
        window.clearTimeout(roomCleanupTimer);
        clearGust();
        clearRoom();
      } else {
        scheduleGust(1_800);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    scheduleGust(3_600);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      roomObserver?.disconnect();
      window.clearTimeout(gustTimer);
      window.clearTimeout(cleanupTimer);
      window.clearTimeout(roomCleanupTimer);
      clearGust();
      clearRoom();
    };
  }, []);

  return null;
}
