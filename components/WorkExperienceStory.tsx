"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import gsap from "gsap";
import { cv } from "@/data/cv";

const ion = cv.experiences[0];
const holisol = cv.experiences[1];

const evidence = [
  ["20× throughput", "Java multithreading refactor for end-of-day trade processing."],
  ["50× workflows", "Off-heap persistent cache removed inter-process calls."],
  ["90% less downtime", "Automatic recovery for halted end-of-day processing."],
  ["30% faster triage", "Alazium turned 100GB+ production logs into useful signals."],
  ["95% DB uplift", "Regression-led cleanup redesign improved peak database performance."],
  ["40% faster CI", "Parallel artifact cache also cut monthly AWS cost by 35%."],
] as const;

const styles = `
/* The old collision-aware work doodle behaved like a floating HUD. Keep ink fixed to paper. */
.scroll-board-red .board-tech-sketch.tech-work,
.work-cv-mounted .board-tech-sketch.tech-work { display:none!important; }

/* Replace only the legacy experience composition; everything below it stays intact. */
.work-cv-mounted .work-experience-stage { height:690px!important; margin-top:22px!important; overflow:visible!important; }
.work-cv-mounted .work-experience-stage > *:not(.work-story-root) { display:none!important; }
.work-story-root {
  --thread:#a63029;
  position:absolute;
  inset:0;
  z-index:5;
  overflow:hidden;
  border-radius:18px;
  background:
    radial-gradient(circle at 77% 18%,rgba(247,212,100,.12),transparent 23%),
    radial-gradient(circle at 16% 80%,rgba(115,170,182,.08),transparent 24%);
}
.work-story-root::before {
  content:"";
  position:absolute;
  inset:12px 8px 8px;
  border:1px dashed rgba(93,70,43,.11);
  border-radius:17px 12px 19px 14px;
  pointer-events:none;
}
.work-story-kicker {
  position:absolute;
  z-index:12;
  top:18px;
  left:22px;
  display:flex;
  gap:10px;
  align-items:center;
  color:#7e2d28;
  font:900 8px/1 var(--mono);
  letter-spacing:.12em;
  text-transform:uppercase;
}
.work-story-kicker i { width:38px; height:3px; border-radius:999px; background:var(--thread); transform:rotate(-2deg); }
.work-story-direction {
  position:absolute;
  z-index:12;
  top:18px;
  right:24px;
  color:#746d62;
  font:800 8px/1 var(--mono);
  letter-spacing:.09em;
  text-transform:uppercase;
}

.work-story-thread {
  position:absolute;
  z-index:1;
  inset:0;
  width:100%;
  height:100%;
  overflow:visible;
  pointer-events:none;
}
.work-story-thread path { fill:none; vector-effect:non-scaling-stroke; stroke-linecap:round; stroke-linejoin:round; }
.work-story-thread-shadow { stroke:rgba(73,27,20,.18); stroke-width:8; transform:translate(1px,3px); }
.work-story-thread-rough { stroke:rgba(166,48,41,.28); stroke-width:2; transform:translate(-1px,-2px); }
.work-story-thread-main { stroke:var(--thread); stroke-width:4.5; }
.work-story-branch { stroke:var(--thread); stroke-width:2.5; opacity:.9; }
.work-story-node { fill:#fff9df; stroke:var(--thread); stroke-width:4; filter:drop-shadow(1px 2px 1px rgba(58,31,21,.18)); }
.work-story-node-core { fill:var(--thread); }

.work-story-year {
  position:absolute;
  z-index:8;
  display:grid;
  place-items:center;
  width:72px;
  height:52px;
  color:#8f2f29;
  background:#fff8d6;
  border:2px solid #a63029;
  border-radius:48% 52% 45% 55% / 54% 46% 56% 44%;
  box-shadow:2px 4px 8px rgba(70,45,27,.13);
  font:900 22px/.86 var(--marker,var(--hand));
  transform:rotate(var(--yr,-3deg));
}
.work-story-year small { display:block; margin-top:3px; color:#625f58; font:800 6px/1 var(--mono); letter-spacing:.09em; text-transform:uppercase; }
.work-story-year-2019 { left:4.5%; top:300px; --yr:-5deg; }
.work-story-year-2020 { left:27.3%; top:264px; --yr:3deg; }
.work-story-year-now { right:3.5%; top:142px; width:82px; --yr:-2deg; }

.work-story-company,
.work-story-evidence {
  position:absolute;
  z-index:6;
  border:1px solid rgba(84,72,55,.11);
  box-shadow:4px 7px 13px rgba(58,43,27,.16);
}
.work-story-company {
  padding:18px 17px 16px;
  background:#fffdf4;
}
.work-story-company::after,
.work-story-evidence::after {
  content:"";
  position:absolute;
  top:-7px;
  left:50%;
  width:31px;
  height:13px;
  background:rgba(225,204,148,.58);
  transform:translateX(-50%) rotate(-2deg);
  box-shadow:0 1px 2px rgba(72,51,29,.08);
}
.work-story-company small,
.work-story-evidence small { display:block; color:#736e65; font:800 7px/1.15 var(--mono); letter-spacing:.09em; text-transform:uppercase; }
.work-story-company h3 { margin:8px 0 4px; font:900 clamp(22px,2vw,32px)/.92 var(--marker,var(--hand)); }
.work-story-company strong { display:block; font:800 8px/1.35 var(--mono); }
.work-story-company p { margin:6px 0 0; color:#605d56; font:7px/1.4 var(--mono); }
.work-story-company em { display:block; margin-top:9px; color:#96332c; font:900 9px/1 var(--marker,var(--hand)); }
.work-story-holisol { left:3%; top:398px; width:20%; background:#edf7f3; transform:rotate(-1.8deg); }
.work-story-ion { left:25.2%; top:350px; width:18%; transform:rotate(1.3deg); }
.work-story-holisol .work-story-mini-proof { margin-top:10px; padding-top:8px; border-top:1px dashed rgba(70,79,74,.22); color:#40675f; font:800 7px/1.45 var(--mono); }

.work-story-evidence { width:15.4%; min-height:112px; padding:14px 13px 12px; background:#fff4bd; transform:rotate(var(--r,-1deg)); }
.work-story-evidence strong { display:block; margin-top:7px; color:#23211e; font:900 clamp(15px,1.35vw,20px)/.95 var(--marker,var(--hand)); }
.work-story-evidence p { margin:7px 0 0; color:#514e48; font:7px/1.42 var(--mono); }
.work-story-evidence-0 { left:41%; top:72px; --r:-2.2deg; }
.work-story-evidence-1 { left:45%; top:462px; --r:1.5deg; background:#dceef3; }
.work-story-evidence-2 { left:59.2%; top:57px; --r:1.7deg; background:#e5efd1; }
.work-story-evidence-3 { left:63.6%; top:444px; --r:-1.5deg; background:#f3d9dd; }
.work-story-evidence-4 { left:77.4%; top:49px; --r:-1.6deg; background:#fff0c4; }
.work-story-evidence-5 { left:81.2%; top:414px; --r:1.4deg; background:#e7e2f2; }

.work-story-chapter {
  position:absolute;
  z-index:7;
  left:42%;
  top:305px;
  color:#8f312b;
  font:900 11px/1 var(--marker,var(--hand));
  transform:rotate(-2deg);
}
.work-story-chapter::after { content:""; display:block; width:112%; margin-top:4px; border-top:3px solid currentColor; border-radius:50%; transform:rotate(1deg); }
.work-story-now-note {
  position:absolute;
  z-index:7;
  right:4.5%;
  top:214px;
  color:#664c83;
  font:900 10px/1.1 var(--marker,var(--hand));
  transform:rotate(3deg);
}

/* A doodle should be ink on the board, not a collision-avoiding overlay. */
.work-story-doodle {
  position:absolute;
  z-index:3;
  right:1.6%;
  top:272px;
  width:132px;
  padding:8px 9px 7px;
  color:#315c70;
  border:1px dashed rgba(49,92,112,.22);
  background:rgba(231,242,242,.48);
  transform:rotate(2.5deg);
  pointer-events:none;
}
.work-story-doodle svg { display:block; width:100%; height:auto; overflow:visible; }
.work-story-doodle path,.work-story-doodle rect,.work-story-doodle circle { fill:none; stroke:currentColor; stroke-width:2; stroke-linecap:round; stroke-linejoin:round; }
.work-story-doodle span { display:block; margin-top:4px; font:800 7px/1.2 var(--marker,var(--hand)); }

.work-story-caption {
  position:absolute;
  z-index:5;
  left:45%;
  bottom:18px;
  margin:0;
  color:#666057;
  font:800 7px/1 var(--mono);
  letter-spacing:.08em;
  text-transform:uppercase;
}
.work-story-caption b { color:#98352e; }

/* Make the top of Work feel immediate: no slow lingering transforms from the old composition. */
.work-cv-mounted .work-cv-header > * { will-change:transform,opacity; }

@media (max-width:900px) {
  .work-cv-mounted .work-experience-stage { height:760px!important; }
  .work-story-evidence { width:17%; }
  .work-story-evidence-0 { left:39%; }
  .work-story-evidence-1 { left:42%; }
  .work-story-evidence-2 { left:58%; }
  .work-story-evidence-3 { left:60%; }
  .work-story-evidence-4 { left:76%; }
  .work-story-evidence-5 { left:78%; }
  .work-story-doodle { display:none; }
}

@media (max-width:760px) {
  .work-cv-mounted .work-experience-stage { height:1260px!important; margin-top:24px!important; }
  .work-story-root { overflow:hidden; }
  .work-story-root::before { inset:6px; }
  .work-story-kicker { top:14px; left:13px; font-size:7px; }
  .work-story-direction { top:38px; right:13px; font-size:6px; }
  .work-story-thread { display:none; }
  .work-story-root::after {
    content:"";
    position:absolute;
    z-index:1;
    top:84px;
    bottom:44px;
    left:34px;
    width:4px;
    border-radius:999px;
    background:linear-gradient(#a63029,#a63029);
    box-shadow:1px 2px 0 rgba(73,27,20,.14);
  }
  .work-story-year { left:10px!important; right:auto!important; width:52px; height:40px; font-size:17px; }
  .work-story-year-2019 { top:84px; }
  .work-story-year-2020 { top:340px; }
  .work-story-year-now { top:1140px; }
  .work-story-company,.work-story-evidence { left:76px!important; right:14px!important; width:auto!important; min-height:0; }
  .work-story-holisol { top:138px; }
  .work-story-ion { top:392px; }
  .work-story-evidence-0 { top:570px; }
  .work-story-evidence-1 { top:662px; }
  .work-story-evidence-2 { top:754px; }
  .work-story-evidence-3 { top:846px; }
  .work-story-evidence-4 { top:938px; }
  .work-story-evidence-5 { top:1030px; }
  .work-story-chapter { left:78px; top:540px; font-size:9px; }
  .work-story-now-note { right:14px; top:1190px; font-size:9px; }
  .work-story-caption { left:78px; bottom:18px; font-size:6px; }
  .work-story-company h3 { font-size:24px; }
  .work-story-evidence strong { font-size:16px; }
  .work-story-evidence p { font-size:7px; }
}

@media (prefers-reduced-motion:reduce) {
  .work-story-root *, .work-cv-mounted .work-cv-header > * { animation:none!important; transition:none!important; }
}
`;

function isWorkLanded(panel: HTMLElement | null) {
  if (!panel) return false;
  if (document.documentElement.dataset.zoomSection === "work-board") return true;
  const rect = panel.getBoundingClientRect();
  const opacity = Number.parseFloat(getComputedStyle(panel).opacity || "0");
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  return opacity > .72 && Math.abs(cx - innerWidth / 2) < innerWidth * .08 && Math.abs(cy - innerHeight / 2) < innerHeight * .14;
}

export function WorkExperienceStory() {
  const [target, setTarget] = useState<HTMLElement | null>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const findTarget = () => document.querySelector<HTMLElement>(".work-cv-mounted .work-experience-stage");
    const immediate = findTarget();
    if (immediate) {
      setTarget(immediate);
      return;
    }

    const observer = new MutationObserver(() => {
      const stage = findTarget();
      if (!stage) return;
      setTarget(stage);
      observer.disconnect();
    });
    observer.observe(document.body, { childList:true, subtree:true });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!target || !rootRef.current) return;
    const root = rootRef.current;
    const panel = target.closest<HTMLElement>(".scroll-board-red");
    const reduce = matchMedia("(prefers-reduced-motion: reduce)");
    let wasLanded = false;
    let raf = 0;
    let entry: gsap.core.Timeline | null = null;

    const showFinal = () => {
      const all = root.querySelectorAll<HTMLElement>(".work-story-year,.work-story-company,.work-story-evidence,.work-story-chapter,.work-story-now-note,.work-story-doodle,.work-story-kicker,.work-story-direction,.work-story-caption");
      gsap.set(all, { opacity:1, x:0, y:0, scale:1, rotation:0, clearProps:"rotation" });
      root.querySelectorAll<SVGPathElement>(".work-story-thread-main,.work-story-thread-rough,.work-story-branch").forEach((path) => {
        gsap.set(path, { strokeDasharray:"none", strokeDashoffset:0 });
      });
    };

    const playEntry = () => {
      entry?.kill();
      if (reduce.matches) {
        showFinal();
        return;
      }

      const header = target.closest(".work-cv-board")?.querySelectorAll<HTMLElement>(".work-cv-header > *") ?? [];
      const years = root.querySelectorAll<HTMLElement>(".work-story-year");
      const companies = root.querySelectorAll<HTMLElement>(".work-story-company");
      const cards = root.querySelectorAll<HTMLElement>(".work-story-evidence");
      const notes = root.querySelectorAll<HTMLElement>(".work-story-chapter,.work-story-now-note,.work-story-doodle,.work-story-kicker,.work-story-direction,.work-story-caption");
      const mainPaths = root.querySelectorAll<SVGPathElement>(".work-story-thread-main,.work-story-thread-rough");
      const branches = root.querySelectorAll<SVGPathElement>(".work-story-branch");

      [...mainPaths, ...branches].forEach((path) => {
        const length = Math.max(1, path.getTotalLength());
        gsap.set(path, { strokeDasharray:length, strokeDashoffset:length });
      });

      entry = gsap.timeline({ defaults:{ overwrite:true } });
      entry.fromTo(header, { opacity:0, y:8 }, { opacity:1, y:0, duration:.2, stagger:.025, ease:"power2.out" }, 0);
      entry.fromTo(notes, { opacity:0, y:5 }, { opacity:1, y:0, duration:.18, stagger:.02, ease:"power1.out" }, .03);
      entry.to(mainPaths, { strokeDashoffset:0, duration:.48, stagger:.035, ease:"power2.out" }, .06);
      entry.fromTo(years, { opacity:0, scale:.72, rotation:-8 }, { opacity:1, scale:1, rotation:0, duration:.24, stagger:.07, ease:"back.out(1.8)" }, .1);
      entry.fromTo(companies, { opacity:0, y:12, scale:.97 }, { opacity:1, y:0, scale:1, duration:.25, stagger:.07, ease:"power2.out" }, .18);
      entry.to(branches, { strokeDashoffset:0, duration:.25, stagger:.025, ease:"power1.out" }, .25);
      entry.fromTo(cards, { opacity:0, y:11, scale:.94, rotation:-1.5 }, { opacity:1, y:0, scale:1, rotation:0, duration:.25, stagger:.04, ease:"back.out(1.35)" }, .3);
    };

    const check = () => {
      raf = 0;
      const landed = isWorkLanded(panel);
      if (landed && !wasLanded) playEntry();
      wasLanded = landed;
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(check);
    };

    const attrObserver = new MutationObserver(schedule);
    attrObserver.observe(document.documentElement, { attributes:true, attributeFilter:["data-zoom-section"] });
    window.addEventListener("scroll", schedule, { passive:true });
    window.addEventListener("resize", schedule, { passive:true });
    schedule();

    return () => {
      attrObserver.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      cancelAnimationFrame(raf);
      entry?.kill();
    };
  }, [target]);

  const story = (
    <div className="work-story-root" ref={rootRef} aria-label="Career timeline from 2019 to now">
      <div className="work-story-kicker"><i aria-hidden="true" />career thread / selected evidence</div>
      <div className="work-story-direction">oldest → newest</div>

      <svg className="work-story-thread" viewBox="0 0 1200 690" preserveAspectRatio="none" aria-hidden="true">
        <path className="work-story-thread-shadow" d="M92 334 C176 337 224 315 330 300 C468 281 580 301 690 263 C815 220 947 224 1110 170" />
        <path className="work-story-thread-rough" d="M88 330 C178 341 225 309 331 296 C468 276 579 306 693 258 C818 217 948 220 1114 166" />
        <path className="work-story-thread-main" d="M92 334 C176 337 224 315 330 300 C468 281 580 301 690 263 C815 220 947 224 1110 170" />

        <path className="work-story-branch" d="M475 285 C474 222 482 174 500 132" />
        <path className="work-story-branch" d="M526 285 C533 350 550 404 584 468" />
        <path className="work-story-branch" d="M690 263 C685 205 690 156 718 118" />
        <path className="work-story-branch" d="M748 244 C758 328 776 389 808 448" />
        <path className="work-story-branch" d="M892 226 C891 173 901 126 930 104" />
        <path className="work-story-branch" d="M960 214 C978 290 995 350 1021 420" />

        <circle className="work-story-node" cx="92" cy="334" r="10" /><circle className="work-story-node-core" cx="92" cy="334" r="3" />
        <circle className="work-story-node" cx="330" cy="300" r="10" /><circle className="work-story-node-core" cx="330" cy="300" r="3" />
        <circle className="work-story-node" cx="1110" cy="170" r="11" /><circle className="work-story-node-core" cx="1110" cy="170" r="3.5" />
      </svg>

      <div className="work-story-year work-story-year-2019">2019<small>first ship</small></div>
      <div className="work-story-year work-story-year-2020">2020<small>ION begins</small></div>
      <div className="work-story-year work-story-year-now">2026<small>now</small></div>

      <article className="work-story-company work-story-holisol">
        <small>Jun → Sep 2019 · 4 months</small>
        <h3>{holisol.company}</h3>
        <strong>{holisol.role}</strong>
        <p>{holisol.location}</p>
        <div className="work-story-mini-proof">Django Daily Run Sheet → founder review → production approval.</div>
      </article>

      <article className="work-story-company work-story-ion">
        <small>{ion.dates}</small>
        <h3>{ion.company}</h3>
        <strong>{ion.role}</strong>
        <p>{ion.location}</p>
        <em>6+ years · primary systems chapter</em>
      </article>

      <div className="work-story-chapter">the systems chapter →</div>
      <div className="work-story-now-note">still building / still measuring</div>

      {evidence.map(([metric, copy], index) => (
        <article className={`work-story-evidence work-story-evidence-${index}`} key={metric}>
          <small>selected evidence · 0{index + 1}</small>
          <strong>{metric}</strong>
          <p>{copy}</p>
        </article>
      ))}

      <aside className="work-story-doodle" aria-label="Static systems sketch">
        <svg viewBox="0 0 128 62" aria-hidden="true">
          <rect x="3" y="19" width="25" height="21" rx="3" />
          <path d="M28 29 H48" /><path d="M43 24 L49 29 L43 34" />
          <rect x="49" y="14" width="27" height="31" rx="3" />
          <path d="M76 29 H96" /><path d="M91 24 L97 29 L91 34" />
          <circle cx="109" cy="29" r="12" />
          <path d="M108 17 C121 5 127 16 123 23" />
        </svg>
        <span>request → queue → worker ↺ recovery</span>
      </aside>

      <p className="work-story-caption"><b>red thread</b> = career continuity · branches = selected outcomes, not invented dates</p>
    </div>
  );

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      {target ? createPortal(story, target) : null}
    </>
  );
}
