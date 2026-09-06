const styles = `
/*
 * The story-board surface is normally a fixed-height CSS grid. A long dossier
 * cannot live as a stretched grid item: its overflow gets clipped and the
 * surface never gains scroll height. Once Work is mounted, turn this one board
 * into an ordinary block scroll container and let the dossier size naturally.
 */
.work-cv-mounted {
  display: block !important;
  width: 100% !important;
  height: 100% !important;
  min-height: 0 !important;
  overflow-y: auto !important;
  overflow-x: hidden !important;
  overscroll-behavior-y: auto !important;
  touch-action: pan-y;
  -webkit-overflow-scrolling: touch;
  scrollbar-gutter: stable;
}

.work-cv-mounted > .work-cv-board {
  display: block !important;
  position: relative !important;
  width: 100% !important;
  height: auto !important;
  min-height: calc(100% + 2px) !important;
  overflow: visible !important;
  align-self: start !important;
  justify-self: stretch !important;
  grid-row: auto !important;
  grid-column: auto !important;
}

/*
 * Animation is enhancement-only. Content must never depend on GSAP or an
 * IntersectionObserver successfully firing in order to exist on the board.
 * !important also protects against a stale inline opacity left by a competing
 * timeline while the outer zoom choreography is settling.
 */
.work-cv-mounted .work-cv-header > *,
.work-cv-mounted .work-company-chit,
.work-cv-mounted .work-evidence-chit,
.work-cv-mounted .work-reveal {
  opacity: 1 !important;
  visibility: visible !important;
}

/* Keep skill text readable even before its colour-in animation is triggered. */
.skill-chip {
  opacity: 1 !important;
  --skill-delay: 0s;
}
.skill-chip:nth-child(2) { --skill-delay: .045s; }
.skill-chip:nth-child(3) { --skill-delay: .09s; }
.skill-chip:nth-child(4) { --skill-delay: .135s; }
.skill-chip:nth-child(5) { --skill-delay: .18s; }
.skill-chip:nth-child(6) { --skill-delay: .225s; }
.skill-chip:nth-child(7) { --skill-delay: .27s; }
.skill-chip:nth-child(8) { --skill-delay: .315s; }
.skill-chip:nth-child(9) { --skill-delay: .36s; }

.work-section.is-visible .skill-chip {
  animation: skillChipLand .38s ease-out calc(.2s + var(--skill-delay)) forwards !important;
}
.work-section.is-visible .skill-chip::before {
  animation: skillOutlineDraw .58s cubic-bezier(.2,.75,.2,1) calc(.24s + var(--skill-delay)) forwards !important;
}
.work-section.is-visible .skill-chip::after {
  animation: skillColorIn .52s cubic-bezier(.2,.75,.2,1) calc(.62s + var(--skill-delay)) forwards !important;
}

/* The long Systems dossier is intentionally dense. Keep the free-floating Work
   doodle out of this surface; the case-board content has its own visual details. */
.work-cv-mounted > .board-tech-sketch.tech-work { display: none !important; }

@media (max-width: 760px) {
  .work-cv-mounted { scrollbar-gutter: auto; }
}

@media (prefers-reduced-motion: reduce) {
  .work-section.is-visible .skill-chip,
  .work-section.is-visible .skill-chip::before,
  .work-section.is-visible .skill-chip::after { animation: none !important; }
}
`;

export function WorkCaseBoardPolish() {
  return <style dangerouslySetInnerHTML={{ __html: styles }} />;
}
