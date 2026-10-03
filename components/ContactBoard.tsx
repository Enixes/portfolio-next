"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { cv } from "@/data/cv";

const previews = [
  {
    name: "LinkedIn",
    href: cv.linkedin,
    handle: "linkedin.com/in/asusingh",
    heading: "The professional trail",
    copy: "Experience, roles, and a place to connect about engineering work.",
    color: "blue",
  },
  {
    name: "GitHub",
    href: cv.github,
    handle: "github.com/Enixes",
    heading: "Code in the open",
    copy: "Public projects and experiments from the engineering side of this board.",
    color: "green",
  },
] as const;

type FormStatus = "idle" | "sending" | "sent" | "error";

export function ContactBoard() {
  const [available, setAvailable] = useState<boolean | null>(null);
  const [status, setStatus] = useState<FormStatus>("idle");
  const [error, setError] = useState("");
  const [preview, setPreview] = useState(0);
  const [paused, setPaused] = useState(false);
  const busy = useRef(false);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/contact", { signal: controller.signal })
      .then((response) => response.json())
      .then((data: { available?: boolean }) => setAvailable(data.available === true))
      .catch(() => { if (!controller.signal.aborted) setAvailable(false); });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (paused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => setPreview((value) => (value + 1) % previews.length), 5600);
    return () => window.clearInterval(timer);
  }, [paused]);

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
        <form ref={formRef} onSubmit={submit} onChange={() => { if (status === "sent" || status === "error") { setStatus("idle"); setError(""); } }}>
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
        </form>
        {available === false && <a className="contact-fallback" href={`mailto:${cv.email}`}>Open your email app instead <span aria-hidden="true">↗</span></a>}
      </div>

      <aside className="contact-channels" aria-label="Other channels">
        <div className="contact-channels-heading"><span>02 / Other channels</span><h3>Find me elsewhere</h3></div>
        <div className="contact-channel-list">
          <a href={`mailto:${cv.email}`}><small>Mail / 01</small><strong>{cv.email}</strong><span aria-hidden="true">↗</span></a>
          <a href={cv.linkedin} target="_blank" rel="noopener noreferrer"><small>Connect / 02</small><strong>LinkedIn</strong><span aria-hidden="true">↗</span></a>
          <a href={cv.github} target="_blank" rel="noopener noreferrer"><small>Explore / 03</small><strong>GitHub</strong><span aria-hidden="true">↗</span></a>
        </div>
        <div className="contact-preview-pin" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}
          onFocusCapture={() => setPaused(true)} onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setPaused(false); }}>
          <span className="contact-preview-fastener" aria-hidden="true" />
          <div className="contact-preview-controls">
            <span>Glimpse / {String(preview + 1).padStart(2, "0")}</span>
            <div>
              <button type="button" onClick={() => setPreview((value) => (value + previews.length - 1) % previews.length)} aria-label="Previous social glimpse">←</button>
              <button type="button" onClick={() => setPreview((value) => (value + 1) % previews.length)} aria-label="Next social glimpse">→</button>
            </div>
          </div>
          <div className="contact-preview-pages">
            {previews.map((item, index) => (
              <div key={item.name} className={`contact-preview-content contact-preview-${item.color}${preview === index ? " is-active" : ""}`}
                aria-hidden={preview !== index}>
                <svg className="contact-ink-route" viewBox="0 0 250 44" preserveAspectRatio="none" aria-hidden="true">
                  <path pathLength="1" d="M3 34 C35 7 67 45 100 20 S168 3 200 19 S232 23 247 8" />
                  <circle cx="247" cy="8" r="3" />
                </svg>
                <small>{item.handle}</small>
                <h4>{item.heading}</h4>
                <p>{item.copy}</p>
                <a href={item.href} target="_blank" rel="noopener noreferrer" tabIndex={preview === index ? 0 : -1}>Open {item.name} <span aria-hidden="true">↗</span></a>
              </div>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
}
