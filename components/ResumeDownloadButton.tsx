"use client";

import { useEffect, useState, type MouseEvent } from "react";
import { createPortal } from "react-dom";

const RESUME_PARTS = [
  "/resume/asu-singh-0.b64",
  "/resume/asu-singh-1.b64",
  "/resume/asu-singh-2.b64",
  "/resume/asu-singh-3.b64",
  "/resume/asu-singh-4.b64",
] as const;

const styles = `
.preview-nav .resume-download-link {
  margin-left: 4px;
  border: 1px solid rgba(238, 230, 216, .34);
  background: rgba(238, 229, 213, .08);
  color: #eee6d8;
}
.preview-nav .resume-download-link:hover,
.preview-nav .resume-download-link:focus-visible {
  border-color: #eee5d5;
  background: #eee5d5;
  color: #25221e;
}
.resume-download-short { display: none; }
@media (max-width: 520px) {
  .preview-nav .resume-download-link { margin-left: 1px; }
}
@media (max-width: 360px) {
  .preview-nav .resume-download-link { padding-inline: 5px; }
  .resume-download-full { display: none; }
  .resume-download-short { display: inline; }
}
`;

export function ResumeDownloadButton() {
  const [target, setTarget] = useState<HTMLElement | null>(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    setTarget(document.querySelector<HTMLElement>(".preview-nav"));
  }, []);

  const downloadResume = async (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    if (downloading) return;

    setDownloading(true);
    try {
      const responses = await Promise.all(
        RESUME_PARTS.map((path) => fetch(path, { cache: "force-cache" })),
      );

      if (responses.some((response) => !response.ok)) {
        throw new Error("Resume asset unavailable");
      }

      const chunks = await Promise.all(responses.map((response) => response.text()));
      const encoded = chunks.map((chunk) => chunk.trim()).join("");
      const binary = atob(encoded);
      const bytes = new Uint8Array(binary.length);

      for (let index = 0; index < binary.length; index += 1) {
        bytes[index] = binary.charCodeAt(index);
      }

      const blob = new Blob([bytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "Asu-Singh-Resume.pdf";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
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
          className="resume-download-link"
          href="#resume"
          onClick={downloadResume}
          aria-label="Download Asu Singh resume as a PDF"
          aria-busy={downloading}
        >
          <span className="resume-download-full">{downloading ? "Preparing…" : "Resume ↓"}</span>
          <span className="resume-download-short">{downloading ? "…" : "CV ↓"}</span>
        </a>,
        target,
      )}
    </>
  );
}
