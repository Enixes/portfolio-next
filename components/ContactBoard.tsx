"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { cv } from "@/data/cv";

const channels = [
  {
    kind: "email",
    number: "01 / Direct note",
    name: "Email",
    href: `mailto:${cv.email}`,
    handle: cv.email,
    shortHandle: cv.email,
    note: "a note is one click away",
  },
  {
    kind: "linkedin",
    number: "02 / Connect",
    name: "LinkedIn",
    href: cv.linkedin,
    handle: "linkedin.com/in/asusingh",
    shortHandle: "@asusingh",
    note: "let's connect the dots",
  },
  {
    kind: "github",
    number: "03 / Open code",
    name: "GitHub",
    href: cv.github,
    handle: "github.com/Enixes",
    shortHandle: "@Enixes",
    note: "still building...",
  },
] as const;

type FormStatus = "idle" | "sending" | "sent" | "error";
type ChannelKind = (typeof channels)[number]["kind"];

function ChannelCharacter({ kind }: { kind: ChannelKind }) {
  if (kind === "email") {
    return (
      <svg className="contact-channel-character" viewBox="0 0 112 82" aria-hidden="true">
        <path className="contact-character-accent" d="M23 27 19 12 74 8 80 29" />
        <path className="contact-character-detail" d="M29 18h30M29 23h39" />
        <path className="contact-character-main" d="M15 30h82v43H15zM16 31l40 27 40-27" />
        <path className="contact-character-flap" d="M16 31 56 5l40 26-40 27Z" />
        <path className="contact-character-detail" d="M16 72 42 49m54 23L70 49" />
        <path className="contact-character-spark" d="m95 11 4-7m3 17 8-2M6 20 1 14" />
      </svg>
    );
  }

  if (kind === "linkedin") {
    return (
      <svg className="contact-channel-character" viewBox="0 0 112 82" aria-hidden="true">
        <circle className="contact-character-main" cx="26" cy="23" r="9" />
        <circle className="contact-character-main" cx="88" cy="23" r="9" />
        <path className="contact-character-main" d="M8 70V54c0-11 8-18 18-18s18 7 18 18v16H8Zm62 0V54c0-11 8-18 18-18s18 7 18 18v16H70Z" />
        <path className="contact-character-link" d="M38 45c13-14 25-14 38 0M43 51c9 8 18 8 27 0" />
        <circle className="contact-character-accent" cx="56" cy="42" r="4" />
        <path className="contact-character-spark" d="m56 14 0-8m-6 4 6 4 6-4" />
      </svg>
    );
  }

  return (
    <svg className="contact-channel-character" viewBox="0 0 112 82" aria-hidden="true">
      <path className="contact-character-main" d="M20 63c-3-8-3-19 0-29l-3-13 14 5c7-5 14-7 25-7s18 2 25 7l14-5-3 13c3 10 3 21 0 29-7 10-18 15-36 15S27 73 20 63Z" />
      <path className="contact-character-detail" d="M36 49h8m24 0h8M48 57c5 4 11 4 16 0M37 61c-3 4-4 8-3 13m44-13c3 4 4 8 3 13" />
      <path className="contact-character-tail" d="M89 61c13-2 15-13 8-19" />
      <path className="contact-character-paw" d="M42 65c4 8 9 10 14 10" />
      <path className="contact-character-accent" d="M56 75h20m-10 0v-9m10 9v-9" />
      <circle className="contact-character-commit" cx="76" cy="66" r="3" />
    </svg>
  );
}

function MarginSketch({ kind }: { kind: ChannelKind }) {
  if (kind === "email") {
    return (
      <svg className="contact-scene-sketch" viewBox="0 0 400 150" preserveAspectRatio="none" aria-hidden="true">
        <path className="contact-sketch-line" pathLength="1" d="M10 55c-8-10 0-22 11-18m4 82c18 21 46 16 66 12M320 132c29-14 46-9 62-14" />
        <path className="contact-sketch-line contact-sketch-accent" pathLength="1" d="m348 124 37-26-11 37-10-18-16 7Zm-4-13c-11-10-22-5-31 1m-9 2-4 3" />
      </svg>
    );
  }
  if (kind === "linkedin") {
    return (
      <svg className="contact-scene-sketch" viewBox="0 0 400 150" preserveAspectRatio="none" aria-hidden="true">
        <path className="contact-sketch-line" pathLength="1" d="M10 48c6-13 13-13 20-4m-16 59c-9 13-5 20 5 24M318 123c14-13 27-13 42 0s24 8 31-5" />
        <circle className="contact-sketch-dot" cx="318" cy="123" r="4" />
        <circle className="contact-sketch-dot" cx="360" cy="123" r="4" />
        <circle className="contact-sketch-dot" cx="391" cy="118" r="4" />
      </svg>
    );
  }
  return (
    <svg className="contact-scene-sketch" viewBox="0 0 400 150" preserveAspectRatio="none" aria-hidden="true">
      <path className="contact-sketch-line" pathLength="1" d="M8 51c2-11 9-15 19-12M13 106c-5 17-2 25 10 29M310 106h77v38h-77z" />
      <path className="contact-sketch-line contact-sketch-accent" pathLength="1" d="m320 119 8 6-8 6m14 1h18M363 117h14m-14 8h9" />
    </svg>
  );
}

export function ContactBoard() {
  // Browser helpers may insert controls beside inputs before React hydrates.
  // Mounting the form after hydration gives those helpers a stable client DOM.
  const [formMounted, setFormMounted] = useState(false);
  const [available, setAvailable] = useState<boolean | null>(null);
  const [status, setStatus] = useState<FormStatus>("idle");
  const [error, setError] = useState("");
  const busy = useRef(false);
  const formRef = useRef<HTMLFormElement>(null);
  const emailChitRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const mountFrame = window.requestAnimationFrame(() => setFormMounted(true));
    const controller = new AbortController();
    fetch("/api/contact", { signal: controller.signal })
      .then((response) => response.json())
      .then((data: { available?: boolean }) => setAvailable(data.available === true))
      .catch(() => { if (!controller.signal.aborted) setAvailable(false); });
    return () => { window.cancelAnimationFrame(mountFrame); controller.abort(); };
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy.current || available !== true) return;
    busy.current = true;
    setStatus("sending");
    setError("");
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error || "The note could not be sent. Please try again.");
      setStatus("sent");
      formRef.current?.reset();
    } catch (cause) {
      setStatus("error");
      setError(cause instanceof Error ? cause.message : "The note could not be sent. Please try again.");
    } finally {
      busy.current = false;
    }
  }

  return (
    <div className="contact-board-layout">
      <div className="contact-form-paper">
        <span className="contact-paper-pin" aria-hidden="true" />
        <div className="contact-paper-heading">
          <span>01 / Direct line</span>
          <h3>Leave a field note<span aria-hidden="true"> ✎</span></h3>
          <p>A few useful details are enough to start.</p>
        </div>
        {formMounted ? <form ref={formRef} onSubmit={submit} onChange={() => { if (status === "sent" || status === "error") { setStatus("idle"); setError(""); } }}>
          <div className="contact-field-row">
            <label>Name <input name="name" type="text" autoComplete="name" required minLength={2} maxLength={80} placeholder="Your name" /></label>
            <label>Email <input name="email" type="email" autoComplete="email" required maxLength={254} placeholder="you@example.com" /></label>
          </div>
          <label>What&apos;s this about?
            <select name="topic" required defaultValue="">
              <option value="" disabled>Choose a thread</option>
              <option value="Systems">Systems</option>
              <option value="AI">AI</option>
              <option value="Collaboration">Collaboration</option>
              <option value="Other">Other</option>
            </select>
          </label>
          <label>Message
            <textarea name="message" required minLength={10} maxLength={4000} rows={5} placeholder="Tell me about the problem, idea, or opportunity…" />
          </label>
          <label className="contact-trap" aria-hidden="true">Leave this field empty <input name="website" type="text" tabIndex={-1} autoComplete="off" /></label>
          <div className="contact-submit-row">
            <button type="submit" disabled={available !== true || status === "sending"}>
              {status === "sending" ? "Sending…" : "Send the note"}<span aria-hidden="true">↗</span>
            </button>
            <span className="contact-form-status" role="status" aria-live="polite">
              {status === "sent" ? "Your note is on its way. Thank you!" :
                status === "error" ? error :
                available === false ? "Form delivery is being set up. Email works now." :
                available === null ? "Checking the direct line…" : "Usually the quickest way to reach me."}
            </span>
          </div>
        </form> : <div className="contact-form-loading" aria-hidden="true"><span /><span /><span /><span /></div>}
        {available === false && <button className="contact-fallback" type="button" onClick={() => { emailChitRef.current?.scrollIntoView({ block: "nearest" }); emailChitRef.current?.focus({ preventScroll: true }); }}>Use the Email chit <span aria-hidden="true">↗</span></button>}
      </div>

      <aside className="contact-channels" aria-label="Other channels">
        <div className="contact-channels-heading"><span>02 / Other channels</span><h3>Find me elsewhere</h3></div>
        <div className="contact-channel-stack">
          {channels.map((item) => (
            <div key={item.kind} className={`contact-channel-scene contact-scene-${item.kind}`}>
              <MarginSketch kind={item.kind} />
              <a
                id={`contact-${item.kind}-chit`}
                ref={item.kind === "email" ? emailChitRef : undefined}
                className="contact-channel-chit"
                href={item.href}
                target={item.kind === "email" ? undefined : "_blank"}
                rel={item.kind === "email" ? undefined : "noopener noreferrer"}
              >
                <span className="contact-chit-pin" aria-hidden="true" />
                <span className="contact-chit-copy">
                  <small>{item.number}</small>
                  <strong>{item.name}</strong>
                  <span className="contact-chit-handle contact-chit-handle-wide">{item.handle}</span>
                  <span className="contact-chit-handle contact-chit-handle-narrow">{item.shortHandle}</span>
                </span>
                <ChannelCharacter kind={item.kind} />
                <span className="contact-chit-arrow" aria-hidden="true">↗</span>
              </a>
              <span className="contact-scene-note" aria-hidden="true">{item.note}</span>
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
}
