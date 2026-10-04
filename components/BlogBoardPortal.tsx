"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import "./blog-board.css";

export function BlogBoardPortal() {
  const [target, setTarget] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const surface = document.querySelector<HTMLElement>("[data-blog-board-host]");
    if (!surface) return;
    surface.classList.add("blog-live-mounted");
    const frame = requestAnimationFrame(() => setTarget(surface));
    return () => {
      cancelAnimationFrame(frame);
      surface.classList.remove("blog-live-mounted");
    };
  }, []);

  if (!target) return null;
  return createPortal(
    <div className="blog-live-board field-workshop" aria-labelledby="field-notes-title">
      <div className="field-workshop-inner">
        <header className="blog-header">
          <div>
            <span className="blog-kicker">Case board / 02 · notebook in progress</span>
            <h2 id="field-notes-title">Field Notes<span className="blog-header-number" aria-hidden="true">/ 02</span></h2>
            <p>The page is open. The ideas are still finding their shape.</p>
          </div>
          <div className="blog-header-aside"><span className="blog-draft-stamp">Work in progress</span><span>pencil first.<br />publish when ready.</span></div>
        </header>

        <div className="field-drafting-table">
          <div className="field-paper-shadow" aria-hidden="true" />
          <article className="field-drafting-sheet">
            <span className="field-tape" aria-hidden="true" />
            <small>Loose leaf / 001</small>
            <h3>Thinking in public, soon.</h3>
            <p>I&apos;m collecting the observations that deserve a proper note: the systems decisions, experiments, and questions that hold up after another look. This board will fill as the writing is ready.</p>
            <svg viewBox="0 0 570 200" className="field-pencil-sketch" aria-hidden="true">
              <path d="M18 137C88 95 123 159 188 117S281 67 345 103 439 164 548 52" />
              <path d="M512 57l36-5-8 33M39 56h112m-112 14h79m213 111h175" />
              <circle cx="188" cy="117" r="7" /><circle cx="345" cy="103" r="7" />
            </svg>
            <span className="field-pencil-note">follow the thread →</span>
          </article>
          <div className="field-desk-doodle" aria-hidden="true"><span>✳</span><b>ideas in pencil</b><i>↝</i></div>
        </div>
        <p className="field-workshop-footnote">The first note goes up when it earns its place.</p>
      </div>
    </div>, target,
  );
}
