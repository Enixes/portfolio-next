"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { cv } from "@/data/cv";

const ion = cv.experiences[0];
const holisol = cv.experiences[1];

const ionEvidence = [
  {
    className: "ion-evidence-a",
    metric: "20× throughput",
    copy: "Java multithreading refactor for end-of-day trade processing.",
  },
  {
    className: "ion-evidence-b",
    metric: "50× workflows",
    copy: "Off-heap persistent cache removed inter-process calls.",
  },
  {
    className: "ion-evidence-c",
    metric: "90% less downtime",
    copy: "Automatic recovery for halted end-of-day processing.",
  },
  {
    className: "ion-evidence-d",
    metric: "30% faster triage",
    copy: "Alazium parsed 100GB+ production logs into useful signals.",
  },
  {
    className: "ion-evidence-e",
    metric: "95% DB uplift",
    copy: "Regression-led cleanup redesign improved peak database performance.",
  },
  {
    className: "ion-evidence-f",
    metric: "40% faster CI",
    copy: "Parallel artifact cache also cut monthly AWS cost by 35%.",
  },
] as const;

export function WorkCvBoardPortal() {
  const [target, setTarget] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const title = document.getElementById("work-board-story-title");
    const surface = title?.closest<HTMLElement>(".story-board-surface") ?? null;
    if (!surface) return;

    surface.classList.add("work-cv-mounted");
    setTarget(surface);

    return () => {
      surface.classList.remove("work-cv-mounted");
    };
  }, []);

  if (!target) return null;

  return createPortal(
    <div className="work-cv-board" aria-label="Professional experience timeline">
      <header className="work-cv-header">
        <div>
          <span>Case board / 01 · CV / Experience map</span>
          <h2>Systems / Work</h2>
          <p>Companies are the anchor chits. The work fans out around them. Thread length roughly tracks time spent there.</p>
        </div>
        <aside className="work-cv-legend" aria-label="Timeline legend">
          <i aria-hidden="true" />
          <span>longer thread = longer tenure</span>
        </aside>
      </header>

      <div className="work-cv-cork" aria-hidden="true">
        <span className="work-cv-pencil pencil-one">production → evidence → outcome</span>
        <span className="work-cv-pencil pencil-two">follow the red thread</span>
      </div>

      <section className="work-cv-role work-cv-role-ion" aria-label={`${ion.company}, ${ion.dates}`}>
        <svg className="work-cv-thread work-cv-thread-ion" viewBox="0 0 1200 330" preserveAspectRatio="none" aria-hidden="true">
          <path className="thread-shadow" d="M208 157 C344 126 420 177 544 148 S792 109 936 142 S1062 160 1152 132" />
          <path className="thread-main" pathLength="100" d="M208 157 C344 126 420 177 544 148 S792 109 936 142 S1062 160 1152 132" />
          <path className="thread-branch" d="M380 151 C370 116 356 88 327 62" />
          <path className="thread-branch" d="M532 150 C550 101 590 78 628 65" />
          <path className="thread-branch" d="M696 129 C721 172 740 201 769 226" />
          <path className="thread-branch" d="M851 126 C881 91 908 73 945 65" />
          <path className="thread-branch" d="M1000 151 C1017 188 1038 210 1075 227" />
        </svg>

        <article className="work-company-chit work-company-ion">
          <span className="board-pin" aria-hidden="true" />
          <small>2020 → now · 6+ years</small>
          <h3>{ion.company}</h3>
          <strong>{ion.role}</strong>
          <p>{ion.location}</p>
          <em>Primary systems chapter</em>
        </article>

        <span className="work-tenure-tag tenure-ion">6+ yrs</span>

        {ionEvidence.map((item, index) => (
          <article className={`work-evidence-chit ${item.className}`} key={item.metric}>
            <span className={`board-pin ${index % 3 === 1 ? "pin-blue" : index % 3 === 2 ? "pin-yellow" : ""}`} aria-hidden="true" />
            <small>Evidence / 0{index + 1}</small>
            <strong>{item.metric}</strong>
            <p>{item.copy}</p>
          </article>
        ))}
      </section>

      <section className="work-cv-role work-cv-role-holisol" aria-label={`${holisol.company}, ${holisol.dates}`}>
        <svg className="work-cv-thread work-cv-thread-holisol" viewBox="0 0 1200 170" preserveAspectRatio="none" aria-hidden="true">
          <path className="thread-shadow" d="M205 79 C282 51 336 90 399 72 C444 59 475 65 512 76" />
          <path className="thread-main" pathLength="100" d="M205 79 C282 51 336 90 399 72 C444 59 475 65 512 76" />
          <path className="thread-branch" d="M360 77 C375 39 408 28 437 24" />
          <path className="thread-branch" d="M493 72 C525 105 557 118 596 126" />
        </svg>

        <article className="work-company-chit work-company-holisol">
          <span className="board-pin pin-blue" aria-hidden="true" />
          <small>Jun → Sep 2019 · 4 months</small>
          <h3>{holisol.company}</h3>
          <strong>{holisol.role}</strong>
          <p>{holisol.location}</p>
        </article>

        <span className="work-tenure-tag tenure-holisol">4 mo</span>

        <article className="work-evidence-chit holisol-evidence-a">
          <span className="board-pin pin-green" aria-hidden="true" />
          <small>Evidence / 01</small>
          <strong>Delivery optimisation</strong>
          <p>Built a Django Daily Run Sheet Generator from requirements through deployment.</p>
        </article>

        <article className="work-evidence-chit holisol-evidence-b">
          <span className="board-pin pin-yellow" aria-hidden="true" />
          <small>Evidence / 02</small>
          <strong>Shipped, not shelved</strong>
          <p>Presented to the founder and secured production deployment approval.</p>
        </article>
      </section>

      <p className="work-cv-footnote">Aug 2020 → now is intentionally the longest line on the board.</p>
    </div>,
    target,
  );
}
