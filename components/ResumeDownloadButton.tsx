"use client";

import { useEffect } from "react";

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
.preview-status.preview-status-cycle {
  position: relative;
  min-width: 205px;
  height: 34px;
  justify-content: flex-start;
  gap: 10px;
  padding: 0 10px;
  overflow: hidden;
  border: 1px solid rgba(238,230,216,.13);
  border-radius: 3px;
  background: rgba(238,229,213,.035);
  color: #eee6d8;
  cursor: pointer;
  transition: border-color .18s ease, background-color .18s ease, color .18s ease, transform .18s ease;
}
.preview-status.preview-status-cycle::after {
  content: "";
  position: absolute;
  right: 8px;
  bottom: 5px;
  left: 29px;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(238,230,216,.28), transparent);
  opacity: 0;
  transform: translateX(-115%);
}
.preview-status.preview-status-cycle:hover,
.preview-status.preview-status-cycle:focus-visible {
  border-color: rgba(238,230,216,.42);
  background: rgba(238,229,213,.09);
  color: #fff9ef;
  transform: translateY(-1px);
}
.preview-status.preview-status-cycle:hover::after,
.preview-status.preview-status-cycle:focus-visible::after {
  opacity: 1;
  animation: resume-status-scan 1.05s ease-in-out infinite;
}
.resume-status-light {
  width: 8px;
  height: 8px;
  flex: 0 0 auto;
  border-radius: 50%;
  background: #81cc66;
  box-shadow: inset -1px -1px 2px rgba(0,0,0,.5), 0 0 0 0 rgba(129,204,102,.28);
  animation: resume-status-pulse 2.7s ease-in-out infinite;
  transition: background-color .2s ease, box-shadow .2s ease;
}
.preview-status-cycle[data-mode="resume"] .resume-status-light {
  background: #d7aa3a;
  box-shadow: inset -1px -1px 2px rgba(0,0,0,.48), 0 0 0 0 rgba(215,170,58,.24);
}
.preview-status-cycle:hover .resume-status-light,
.preview-status-cycle:focus-visible .resume-status-light,
.preview-status-cycle[data-downloading="true"] .resume-status-light {
  background: #d84138;
  animation: none;
  box-shadow: inset -1px -1px 2px rgba(0,0,0,.48), 0 0 0 3px rgba(216,65,56,.13);
}
.resume-status-copy {
  position: relative;
  display: grid;
  flex: 1;
  min-width: 0;
  align-items: center;
  white-space: nowrap;
}
.resume-status-copy > span {
  grid-area: 1 / 1;
  transition: opacity .22s ease, transform .24s cubic-bezier(.2,.75,.2,1);
}
.resume-status-available,
.resume-status-ready,
.resume-status-hover,
.resume-status-preparing {
  opacity: 0;
  transform: translateY(7px);
}
.preview-status-cycle[data-mode="available"] .resume-status-available,
.preview-status-cycle[data-mode="resume"] .resume-status-ready {
  opacity: 1;
  transform: translateY(0);
}
.preview-status-cycle:hover .resume-status-copy > span,
.preview-status-cycle:focus-visible .resume-status-copy > span {
  opacity: 0;
  transform: translateY(-7px);
}
.preview-status-cycle:hover .resume-status-hover,
.preview-status-cycle:focus-visible .resume-status-hover {
  opacity: 1;
  transform: translateY(0);
}
.preview-status-cycle[data-downloading="true"] .resume-status-copy > span {
  opacity: 0;
  transform: translateY(-7px);
}
.preview-status-cycle[data-downloading="true"] .resume-status-preparing {
  opacity: 1;
  transform: translateY(0);
}
.resume-status-glyph {
  color: #c9bda9;
  font-size: 10px;
  transition: transform .18s ease, color .18s ease;
}
.preview-status-cycle:hover .resume-status-glyph,
.preview-status-cycle:focus-visible .resume-status-glyph {
  color: #f1d270;
  transform: translateY(1px);
}
.resume-mobile-link { display: none; }
@keyframes resume-status-pulse {
  0%, 70%, 100% { box-shadow: inset -1px -1px 2px rgba(0,0,0,.5), 0 0 0 0 rgba(129,204,102,.28); }
  82% { box-shadow: inset -1px -1px 2px rgba(0,0,0,.5), 0 0 0 4px rgba(129,204,102,0); }
}
@keyframes resume-status-scan {
  from { transform: translateX(-115%); }
  to { transform: translateX(115%); }
}
@media (max-width: 900px) {
  .resume-mobile-link {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    margin-left: 2px;
    border: 1px solid rgba(238,230,216,.26);
    color: #eee6d8 !important;
  }
  .resume-mobile-link:hover,
  .resume-mobile-link:focus-visible {
    border-color: #eee5d5;
    background: #eee5d5 !important;
    color: #25221e !important;
  }
}
@media (max-width: 520px) {
  .resume-mobile-link { padding-inline: 6px !important; }
  .resume-mobile-long { display: none; }
}
@media (prefers-reduced-motion: reduce) {
  .resume-status-light,
  .preview-status-cycle::after { animation: none !important; }
  .resume-status-copy > span,
  .preview-status-cycle,
  .resume-status-glyph { transition: none !important; }
}
`;

async function triggerResumeDownload(control: HTMLElement) {
  if (control.dataset.downloading === "true") return;
  control.dataset.downloading = "true";
  control.setAttribute("aria-busy", "true");

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
    control.dataset.downloading = "false";
    control.removeAttribute("aria-busy");
  }
}

export function ResumeDownloadButton() {
  useEffect(() => {
    const status = document.querySelector<HTMLAnchorElement>(".preview-status");
    const nav = document.querySelector<HTMLElement>(".preview-nav");
    if (!status || !nav) return;

    const originalHtml = status.innerHTML;
    const originalHref = status.getAttribute("href");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    status.classList.add("preview-status-cycle");
    status.href = "#resume";
    status.setAttribute("aria-label", "Download Asu Singh resume as a PDF");
    status.dataset.mode = "available";
    status.dataset.downloading = "false";
    status.innerHTML = `
      <span class="resume-status-light" aria-hidden="true"></span>
      <span class="resume-status-copy" aria-hidden="true">
        <span class="resume-status-available">Available for hard problems</span>
        <span class="resume-status-ready">Resume ready · 1 page</span>
        <span class="resume-status-hover">Download resume</span>
        <span class="resume-status-preparing">Preparing PDF…</span>
      </span>
      <span class="resume-status-glyph" aria-hidden="true">↓</span>
    `;

    let hovered = false;
    const setHovered = (value: boolean) => { hovered = value; };
    const cycle = () => {
      if (hovered || status.dataset.downloading === "true") return;
      status.dataset.mode = status.dataset.mode === "available" ? "resume" : "available";
    };
    const timer = reducedMotion.matches ? null : window.setInterval(cycle, 3600);

    const onClick = (event: Event) => {
      event.preventDefault();
      void triggerResumeDownload(status);
    };
    const onEnter = () => setHovered(true);
    const onLeave = () => setHovered(false);
    status.addEventListener("click", onClick);
    status.addEventListener("mouseenter", onEnter);
    status.addEventListener("mouseleave", onLeave);
    status.addEventListener("focus", onEnter);
    status.addEventListener("blur", onLeave);

    const mobile = document.createElement("a");
    mobile.className = "resume-mobile-link";
    mobile.href = "#resume";
    mobile.setAttribute("aria-label", "Download Asu Singh resume as a PDF");
    mobile.innerHTML = `<span class="resume-mobile-long">Resume</span><span aria-hidden="true">↓</span>`;
    const onMobileClick = (event: Event) => {
      event.preventDefault();
      void triggerResumeDownload(mobile);
    };
    mobile.addEventListener("click", onMobileClick);
    nav.appendChild(mobile);

    return () => {
      if (timer) window.clearInterval(timer);
      status.removeEventListener("click", onClick);
      status.removeEventListener("mouseenter", onEnter);
      status.removeEventListener("mouseleave", onLeave);
      status.removeEventListener("focus", onEnter);
      status.removeEventListener("blur", onLeave);
      status.classList.remove("preview-status-cycle");
      status.innerHTML = originalHtml;
      if (originalHref) status.setAttribute("href", originalHref);
      else status.removeAttribute("href");
      status.removeAttribute("aria-label");
      delete status.dataset.mode;
      delete status.dataset.downloading;
      mobile.removeEventListener("click", onMobileClick);
      mobile.remove();
    };
  }, []);

  return <style dangerouslySetInnerHTML={{ __html: styles }} />;
}
