"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { fieldNotes, type FieldNote } from "@/data/field-notes";
import { useBlogBoardMotion } from "./useBlogBoardMotion";
import "./blog-board.css";

function RecoveryDiagram() {
  return (
    <svg className="blog-diagram blog-recovery-diagram" viewBox="0 0 480 170" aria-hidden="true" focusable="false">
      <g className="blog-ink blog-diagram-entry">
        <path d="M16 40L110 38L112 83L18 85Z M187 38L290 40L289 84L185 83Z M369 40L460 38L462 84L368 86Z" />
        <path d="M114 61H183 M291 61H365 M176 56l8 5-8 5 M357 56l8 5-8 5" />
        <path className="blog-soft-ink" d="M22 91l83-2 M193 89l89 2 M375 92l81-2" />
        <path className="blog-recovery-route" pathLength="1" d="M238 86V132Q238 140 253 140H404Q417 140 417 126V89 M412 97l5-8 5 8" />
      </g>
      <path className="blog-signal-path" pathLength="1" d="M65 61H238V132Q238 140 253 140H404Q417 140 417 126V61" />
      <g className="blog-diagram-label"><text x="34" y="66">request</text><text x="202" y="66">failure</text><text x="386" y="66">replay</text></g>
      <g className="blog-ink blog-accent-ink blog-failure-mark"><path d="M267 17l10 10m-10 0 10-10" /></g>
      <text className="blog-hand-label" x="258" y="125">leave a way back.</text>
      <text className="blog-diagram-small" x="20" y="132">01 / observe</text><text className="blog-diagram-small" x="20" y="150">02 / recover</text>
      <circle className="blog-recovery-light" cx="450" cy="48" r="4" />
    </svg>
  );
}

function AgentDiagram() {
  return (
    <svg className="blog-diagram" viewBox="0 0 360 116" aria-hidden="true" focusable="false">
      <g className="blog-ink blog-diagram-entry">
        <path d="M12 32H91V66H12 M121 27l99 2-1 43-98-2Z M274 31h70v38h-70Z M92 49h28 M221 49h51" />
        <path className="blog-control-loop" pathLength="1" d="M308 74V99H170V75 M165 84l5-9 5 9" />
        <path className="blog-guardrail" d="M251 17v63 M246 18h10 M246 79h10" />
      </g>
      <g className="blog-queue-token"><path d="M24 42h10v14H24Z" /></g>
      <g className="blog-queue-token"><path d="M44 42h10v14H44Z" /></g>
      <g className="blog-queue-token"><path d="M64 42h10v14H64Z" /></g>
      <text className="blog-diagram-label" x="143" y="54">agent</text><text className="blog-diagram-label" x="289" y="54">tool</text>
      <text className="blog-diagram-small" x="15" y="88">queue</text><text className="blog-diagram-small" x="222" y="12">budget</text>
      <text className="blog-hand-label" x="211" y="114">observe → adjust</text>
    </svg>
  );
}

function ConcurrencyDiagram() {
  return (
    <svg className="blog-diagram" viewBox="0 0 360 116" aria-hidden="true" focusable="false">
      <g className="blog-ink blog-diagram-entry">
        <path className="blog-rail" pathLength="1" d="M15 34H134Q154 34 154 58H187 M15 58H187 M15 82H134Q154 82 154 58" />
        <path className="blog-fanout" pathLength="1" d="M201 58H222Q236 58 236 28H342 M201 58H342 M201 58H222Q236 58 236 88H342" />
        <path className="blog-bottleneck" d="M185 37h16v42h-16Z" />
      </g>
      <g className="blog-rail-token"><path d="M47 29h15v10H47Z" /></g>
      <g className="blog-rail-token"><path d="M79 53h15v10H79Z" /></g>
      <g className="blog-rail-token"><path d="M30 77h15v10H30Z" /></g>
      <path className="blog-ink blog-timing-mark" pathLength="1" d="M258 94v9h75v-9 M276 99v4 M296 99v4 M315 99v4" />
      <text className="blog-hand-label" x="136" y="20">why the wait?</text>
      <text className="blog-diagram-small" x="15" y="108">parallel ≠ free</text>
    </svg>
  );
}

function PhilosophyDiagram() {
  return (
    <svg className="blog-diagram blog-philosophy-diagram" viewBox="0 0 420 106" aria-hidden="true" focusable="false">
      <g className="blog-ink blog-diagram-entry">
        <circle cx="54" cy="51" r="32" /><path className="blog-soft-ink" d="M54 10v11 M54 83v10 M13 51h10 M86 51h10" />
        <path className="blog-margin-thread" pathLength="1" d="M102 52C158 7 165 96 215 52S282 34 300 53" />
        <path className="blog-margin-mark" pathLength="1" d="M331 15h-13v69h13 M380 20l9-6 M386 37l13-1" />
      </g>
      <g className="blog-compass-needle"><path d="M54 26L64 62L54 56L44 65Z" /></g>
      <text className="blog-question-mark" x="343" y="70">?</text>
      <text className="blog-diagram-small" x="42" y="103">seek</text>
      <text className="blog-hand-label" x="137" y="95">a direction, not a destination</text>
    </svg>
  );
}

const diagrams = { recovery: RecoveryDiagram, agents: AgentDiagram, concurrency: ConcurrencyDiagram, margins: PhilosophyDiagram };
const statusLabels: Record<FieldNote["status"], string> = { draft: "Draft", "in-progress": "In the notebook", published: "Published" };

export function FieldNoteArticle({ note, index }: { note: FieldNote; index: number }) {
  const Diagram = diagrams[note.scene];
  const headingId = `field-note-${note.id}`;
  return (
    <article
      className={`blog-article blog-${note.scene} blog-accent-${note.accent}`}
      data-blog-scene={note.scene}
      data-kind={note.kind}
      aria-labelledby={headingId}
      tabIndex={note.href ? undefined : 0}
    >
      <span className="board-pin" aria-hidden="true" />
      <div className="blog-article-top"><span className="blog-label">{note.label}</span><span className="blog-folio">{String(index + 1).padStart(2, "0")}</span></div>
      {note.scene === "recovery" && <p className="blog-investigation-label">Current investigation <span aria-hidden="true">↙</span></p>}
      <h3 id={headingId}>{note.href ? <a className="blog-article-link" href={note.href}>{note.title}<span className="blog-link-arrow" aria-hidden="true"> ↗</span></a> : note.title}</h3>
      <p className="blog-summary">{note.summary}</p>
      <Diagram />
      {note.scene === "recovery" && <p className="blog-working-question"><span className="blog-highlight" aria-hidden="true" />What happens after it breaks?</p>}
      {note.kind === "philosophy" && <p className="blog-margin-question">What am I really asking?<svg viewBox="0 0 260 12" aria-hidden="true" focusable="false"><path className="blog-question-underline" pathLength="1" d="M3 7Q124 1 257 5M17 11Q166 7 233 10" /></svg></p>}
      <ul className="blog-tags" aria-label="Topics">{note.tags.map((tag) => <li key={tag}>{tag}</li>)}</ul>
      <footer className="blog-article-meta">
        <span className="blog-status">{statusLabels[note.status]}</span>
        {note.date && <time dateTime={note.date}>{note.date}</time>}
        {note.readTime !== null && <span>{note.readTime} min read</span>}
        {!note.href && <span className="blog-link-pending">Link pending <span aria-hidden="true">↗</span></span>}
      </footer>
    </article>
  );
}

export function BlogBoardPortal() {
  const [target, setTarget] = useState<HTMLElement | null>(null);
  const [board, setBoard] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    const surface = document.querySelector<HTMLElement>("[data-blog-board-host]");
    if (!surface) return;
    const frame = requestAnimationFrame(() => setTarget(surface));
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (!target || !board) return;
    const panel = target.closest<HTMLElement>("[data-board-panel]");
    const label = panel?.getAttribute("aria-labelledby");
    target.classList.add("blog-live-mounted");
    panel?.setAttribute("aria-labelledby", "field-notes-title");
    return () => {
      target.classList.remove("blog-live-mounted");
      if (label) panel?.setAttribute("aria-labelledby", label);
      else panel?.removeAttribute("aria-labelledby");
    };
  }, [target, board]);

  useBlogBoardMotion(board);
  if (!target) return null;

  return createPortal(
    <div ref={setBoard} className="blog-live-board" aria-labelledby="field-notes-title">
      <div className="blog-notebook">
        <header className="blog-header">
          <div>
            <span className="blog-kicker">Case board / 02 · essays & observations</span>
            <h2 id="field-notes-title">Field Notes<span className="blog-header-number" aria-hidden="true">/ 02</span></h2>
            <p>Systems, failure paths, and the questions in the margins.</p>
          </div>
          <div className="blog-header-aside"><span className="blog-draft-stamp">Notebook open</span><span>working theories.<br />pencil encouraged.</span></div>
        </header>

        <div className="blog-evidence-layout">
          <svg className="blog-connecting-threads" viewBox="0 0 1200 760" preserveAspectRatio="none" aria-hidden="true" focusable="false">
            <path className="blog-board-thread" pathLength="1" d="M270 28C378 6 684 7 820 28S1078 128 1027 206" />
            <path className="blog-board-thread" pathLength="1" d="M414 229C635 221 577 369 811 367 M798 361l13 6-11 9" />
            <path className="blog-board-thread blog-thread-violet" pathLength="1" d="M228 419C150 440 235 461 281 503S300 587 448 608 M438 598l10 10-15 4" />
          </svg>
          {fieldNotes.map((note, index) => <div className={`blog-card-entry blog-position-${note.scene}`} key={note.id}><FieldNoteArticle note={note} index={index} /></div>)}
          <aside className="blog-archive" aria-label="Notebook index">
            <span className="blog-label">Archive index / open leaves</span>
            <ol>{fieldNotes.map((note, index) => <li key={note.id}><span>{String(index + 1).padStart(2, "0")}</span><span>{note.title}</span><span className={`blog-index-mark blog-accent-${note.accent}`} aria-hidden="true">{note.href ? "↗" : "○"}</span></li>)}</ol>
            <p>Follow the evidence.<br /><em>Leave room for doubt.</em></p>
          </aside>
        </div>
        <footer className="blog-footer"><span>Collected in the field. Still being worked out.</span><span>Hover or focus the notes to trace an idea.</span></footer>
      </div>
    </div>,
    target,
  );
}
