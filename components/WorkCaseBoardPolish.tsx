const styles = `
/* Cross-browser stagger for the marker skill chips. The main Work board owns
   the keyframes; this layer only supplies reliable per-chip delay values. */
.skill-chip { --skill-delay: 0s; }
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

/* The long Systems dossier now has its own dense visual language. Keep the old
   floating Work doodle out so it can never drift into a card as the inner board
   reflows on desktop or mobile. */
.work-cv-mounted > .board-tech-sketch.tech-work { display: none !important; }

@media (prefers-reduced-motion: reduce) {
  .work-section.is-visible .skill-chip,
  .work-section.is-visible .skill-chip::before,
  .work-section.is-visible .skill-chip::after { animation: none !important; }
}
`;

export function WorkCaseBoardPolish() {
  return <style dangerouslySetInnerHTML={{ __html: styles }} />;
}
