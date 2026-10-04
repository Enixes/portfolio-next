const nextBoard = {
  profile: { href: "#work-board", label: "Systems", number: "01" },
  work: { href: "#blog-board", label: "Field Notes", number: "02" },
  blog: { href: "#life-board", label: "Life", number: "03" },
  life: { href: "#contact-board", label: "Contact", number: "04" },
  contact: { href: "#top", label: "the overview", number: "↺" },
} as const;

export function BoardEndCue({ from }: { from: keyof typeof nextBoard }) {
  const next = nextBoard[from];
  return <div className={`board-end-cue board-end-${from}`}>
    <svg viewBox="0 0 170 38" aria-hidden="true" focusable="false"><path d="M3 12c33 21 61-14 93 4 19 11 38 7 66-3m-18-8 18 8-14 16" /></svg>
    <span>{from === "contact" ? "Back to the overview ↑" : `Scroll ↓ to ${next.label}`}</span>
    <a href={next.href}>{from === "contact" ? "Open overview" : `Open ${next.label}`} <b aria-hidden="true">{next.number} ↗</b></a>
  </div>;
}
