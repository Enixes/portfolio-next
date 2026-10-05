"use client";

import { useEffect, useRef, useState } from "react";
import { cv } from "@/data/cv";
import { FurinChime } from "@/components/FurinChime";

const destinations = [
  { label: "Board", href: "#top", id: "top" },
  { label: "Profile", href: "#profile-board", id: "profile-board" },
  { label: "Systems", href: "#work-board", id: "work-board" },
  { label: "Field Notes", href: "#blog-board", id: "blog-board" },
  { label: "Life", href: "#life-board", id: "life-board" },
  { label: "Contact", href: "#contact-board", id: "contact-board" },
] as const;

function ResumeFieldFile({ compact = false }: { compact?: boolean }) {
  return (
    <a
      className={`resume-link dock-resume${compact ? " dock-resume-compact" : ""}`}
      href={cv.resumeUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="View Asu Singh résumé on Google Drive"
    >
      <svg className="resume-wind" viewBox="0 0 220 40" preserveAspectRatio="none" aria-hidden="true">
        <path d="M-18 29 C30 5 57 43 110 15 S178 25 237 4" />
        <path d="M-28 37 C24 23 70 46 111 29 S186 20 240 14" />
      </svg>
      <strong className="resume-seal" aria-hidden="true">AS</strong>
      <span className="resume-caption">
        <b><span>Résumé</span><span className="resume-caption-detail"> / field file</span></b>
        <small>View on Drive</small>
      </span>
      <b className="resume-arrow" aria-hidden="true">↗</b>
    </a>
  );
}

export function FloatingNavigation() {
  const [active, setActive] = useState("top");
  const [open, setOpen] = useState(false);
  const [marker, setMarker] = useState({ x: 0, width: 0 });
  const linksRef = useRef<HTMLDivElement>(null);
  const shellRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const root = document.documentElement;
    const update = () => setActive(root.dataset.boardEntered === "true" && root.dataset.zoomSection
      ? root.dataset.zoomSection : "top");
    update();
    const observer = new MutationObserver(update);
    observer.observe(root, { attributes: true, attributeFilter: ["data-board-entered", "data-zoom-section"] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const track = linksRef.current;
    const link = track?.querySelector<HTMLAnchorElement>(`a[data-destination="${active}"]`);
    if (!track || !link) return;
    const measure = () => setMarker({ x: link.offsetLeft, width: link.offsetWidth });
    measure();
    const resize = new ResizeObserver(measure);
    resize.observe(track);
    return () => resize.disconnect();
  }, [active]);

  useEffect(() => {
    if (!open) return;
    const dismiss = (event: MouseEvent) => {
      if (!shellRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", dismiss);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", dismiss);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const activeLabel = destinations.find((item) => item.id === active)?.label ?? "Board";

  return (
    <header className="preview-header floating-header" aria-label="Primary navigation">
      <div className="floating-dock" ref={shellRef}>
        <a className="preview-brand dock-brand" href="#top" aria-label="Asu Singh, home">
          <span aria-hidden="true" /> ASU <span className="dock-brand-slash">/</span> SYSTEMS
        </a>
        <nav className="dock-links" aria-label="Boards" ref={linksRef}>
          <span className="dock-marker" style={{ transform: `translateX(${marker.x}px) rotate(-2deg)`, width: marker.width }} aria-hidden="true">
            <svg key={active} viewBox="0 0 100 12" preserveAspectRatio="none">
              <path pathLength="1" d="M2 9 C18 5 31 10 48 7 S78 9 98 3" />
            </svg>
          </span>
          {destinations.map((item) => (
            <a key={item.id} href={item.href} data-destination={item.id} className={active === item.id ? "is-active" : undefined}
              aria-current={active === item.id ? "location" : undefined}>
              {item.label}
            </a>
          ))}
        </nav>
        <div className="dock-resume-anchor">
          <div className="dock-desktop-resume"><ResumeFieldFile /></div>
          <div className="dock-mobile-controls">
            <button ref={triggerRef} className="dock-map-trigger" type="button" aria-expanded={open} aria-controls="dock-paper-map"
              onClick={() => setOpen((value) => !value)}>
              <span className="dock-map-glyph" aria-hidden="true">✳</span>
              <span>Map <small>/ {activeLabel}</small></span>
              <span aria-hidden="true">{open ? "−" : "+"}</span>
            </button>
            <ResumeFieldFile compact />
          </div>
          <FurinChime />
        </div>
        <nav id="dock-paper-map" className="dock-paper-map" aria-label="Board map" hidden={!open}>
          <p>Choose a corner of the board</p>
          {destinations.map((item, index) => (
            <a key={item.id} href={item.href} className={active === item.id ? "is-active" : undefined}
              aria-current={active === item.id ? "location" : undefined} onClick={() => setOpen(false)}>
              <small>{String(index).padStart(2, "0")}</small><span>{item.label}</span><span aria-hidden="true">↗</span>
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
}
