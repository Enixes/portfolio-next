"use client";

import { useEffect, useState, type MouseEvent } from "react";
import { createPortal } from "react-dom";

const RESUME_PARTS = [
  "/resume/v2/part-00.b64",
  "/resume/v2/part-01.b64",
  "/resume/v2/part-02.b64",
  "/resume/v2/part-03.b64",
  "/resume/v2/part-04.b64",
  "/resume/v2/part-05.b64",
  "/resume/v2/part-06.b64",
  "/resume/v2/part-07.b64",
  "/resume/v2/part-08.b64",
  "/resume/v2/part-09.b64",
  "/resume/v2/part-10.b64",
] as const;

const styles = `
.preview-status-slot {
  min-width: 196px;
  display: flex;
  justify-content: flex-end;
}
.preview-status-cycle {
  position: relative;
  display: inline-flex;
  min-width: 196px;
  height: 34px;
  align-items: center;
  justify-content: flex-start;
  gap: 10px;
  padding: 0 10px;
  overflow: hidden;
  border: 1px solid rgba(238,230,216,.12);
  border-radius: 3px;
  background: rgba(238,229,213,.035);
  color: #eee6d8;
  cursor: pointer;
  font: 700 9px/1 var(--mono);
  letter-spacing: .105em;
  text-transform: uppercase;
  transition: border-color .18s ease, background-color .18s ease, color .18s ease, transform .18s ease;
}
.preview-status-cycle::after {
  content: "";
  position: absolute;
  right: 8px;
  bottom: 5px;
  left: 28px;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(238,230,216,.22), transparent);
  transform: translateX(-115%);
  opacity: 0;
}
.preview-status-cycle:hover,
.preview-status-cycle:focus-visible {
  border-color: rgba(238,230,216,.42);
  background: rgba(238,229,213,.09);
  color: #fff9ef;
  transform: translateY(-1px);
}
.preview-status-cycle:hover::after,
.preview-status-cycle:focus-visible::after {
  opacity: 1;
  animation: status-scan 1.1s ease-in-out infinite;
}
.preview-status-light {
  position: relative;
  width: 8px;
  height: 8px;
  flex: 0 0 auto;
  border-radius: 50%;
  background: #81cc66;
  box-shadow: inset -1px -1px 2px rgba(0,0,0,.5), 0 0 0 0 rgba(129,204,102,.32);
  animation: status-pulse 2.7s ease-in-out infinite;
}
.preview-status-cycle[data-mode="resume"] .preview-status-light {
  background: #e0b64a;
  box-shadow: inset -1px -1px 2px rgba(0,0,0,.45), 0 0 0 0 rgba(224,182,74,.28);
}
.preview-status-cycle:hover .preview-status-light,
.preview-status-cycle:focus-visible .preview-status-light {
  background: #d84138;
  animation: none;
  box-shadow: inset -1px -1px 2px rgba(0,0,0,.45), 0 0 0 3px rgba(216,65,56,.13);
}
.preview-status-copy {
  position: relative;
  display: grid;
  flex: 1;
  align-items: center;
  white-space: nowrap;
}
.preview-status-copy > span {
  grid-area: 1 / 1;
  transition: opacity .22s ease, transform .24s cubic-bezier(.2,.75,.2,1);
}
.preview-status-copy .status-availability,
.preview-status-copy .status-resume {
  opacity: 0;
  transform: translateY(7px);
}
.preview-status-cycle[data-mode="available"] .status-availability,
.preview-status-cycle[data-mode="resume"] .status-resume {
  opacity: 1;
  transform: translateY(0);
}
.preview-status-copy .status-hover {
  opacity: 0;
  transform: translateY(7px);
}
.preview-status-cycle:hover .preview-status-copy > span,
.preview-status-cycle:focus-visible .preview-status-copy > span {
  opacity: 0;
  transform: translateY(-7px);
}
.preview-status-cycle:hover .preview-status-copy .status-hover,
.preview-status-cycle:focus-visible .preview-status-copy .status-hover {
  opacity: 1;
  transform: translateY(0);
}
.preview-status-glyph {
  color: #c9bda9;
  font-size: 10px;
  transition: transform .18s ease, color .18s ease;
}
.preview-status-cycle:hover .preview-status-glyph,
.preview-status-cycle:focus-visible .preview-status-glyph {
  color: #f3d06e;
  transform: translateY(1px);
}
@keyframes status-pulse {
  0%, 70%, 100% { box-shadow: inset -1px -1px 2px rgba(0,0,0,.5), 0 0 0 0 rgba(129,204,102,.28); }
  82% { box-shadow: inset -1px -1px 2px rgba(0,0,0,.5), 0 0 0 4px rgba(129,204,102,0); }
}
@keyframes status-scan {
  0% { transform: translateX(-115%); }
  100% { transform: translateX(115%); }
}
@media (max-width: 900px) {
  .preview-status-slot { display: none; }
}
@media (prefers-reduced-motion: reduce) {
  .preview-status-light,
  .preview-status-cycle::after { animation: none !important; }
  .preview-status-copy > span,
  .preview-status-cycle,
  .preview-status-glyph { transition: none !important; }
}
`;

export function HeaderStatusResume() {
  const [target, setTarget] = useState<HTMLElement | null>(null);
  const [mode, setMode] = useState<"available" | "resume">("available");
  const [downloading, setDownloading] = useState(false);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    setTarget(document.querySelector<HTMLElement>(".preview-status-slot"));
  }, []);

  useEffect(() => {
    if (hovered || downloading) return;
    const timer = window.setInterval(() => {
      setMode((current) => current === "available" ? "resume" : "available");
    }, 3600);
    return () => window.clearInterval(timer);
  }, [hovered, downloading]);

  const downloadResume = async (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    if (downloading) return;
    setDownloading(true);

    try {
      const responses = await Promise.all(
        RESUME_PARTS.map((path) => fetch(path, { cache: "force-cache" })),
      );
      if (responses.some((response) => !response.ok)) throw new Error("Resume asset unavailable");

      const chunks = await Promise.all(responses.map((response) => response.text()));
      const binary = atob(chunks.map((chunk) => chunk.trim()).join(""));
      const bytes = new Uint8Array(binary.length);
      for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);

      const url = URL.createObjectURL(new Blob([bytes], { type: "application/pdf" }));
      const link = document.createElement("a");
      link.href = url;
      link.download = "Asu-Singh-Resume.pdf";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1200);
    } catch (error) {
      console.error("Resume download failed", error);
    } finally {
      setDownloading(false);
    }
  };

  if (!target) return <style dangerouslySetInnerHTML={{ __html: styles }} />;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      {createPortal(
        <a
          className="preview-status-cycle"
          href="#resume"
          data-mode={mode}
          aria-label="Download Asu Singh resume as a PDF"
          aria-busy={downloading}
          onClick={downloadResume}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          onFocus={() => setHovered(true)}
          onBlur={() => setHovered(false)}
        >
          <span className="preview-status-light" aria-hidden="true" />
          <span className="preview-status-copy" aria-hidden="true">
            <span className="status-availability">Available for hard problems</span>
            <span className="status-resume">Resume ready · 1 page</span>
            <span className="status-hover">Download resume</span>
          </span>
          <span className="preview-status-glyph" aria-hidden="true">↓</span>
        </a>,
        target,
      )}
    </>
  );
}
