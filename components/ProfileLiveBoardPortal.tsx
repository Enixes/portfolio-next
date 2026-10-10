"use client";

import Image from "next/image";
import gsap from "gsap";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { profileMilestones, type ProfileMilestone } from "@/data/profile-timeline";
import { PROFILE_INTERRUPT_EVENT } from "./board-navigation";
import { BoardEndCue } from "./BoardEndCue";
import "./profile-timeline.css";

const last = profileMilestones.length - 1;

const doodlePaths: Record<ProfileMilestone["doodle"], string[]> = {
  spark: ["M42 5l3 21 16-13-10 19 23 6-23 3 10 21-17-14-10 19 3-24-23-4 22-5z", "M10 9l10 10m57-8-10 10M8 69l13-12"],
  brackets: ["M29 9H14v58h15M58 9h15v58H58", "M52 17 37 59M29 42l-10-5 10-5m28 0 10 5-10 5"],
  wireless: ["M20 42h46v25H20zM27 49h15m-15 7h9m16-7h7m-7 7h7", "M43 34c7-8 14-8 21 0M35 27c12-15 26-15 38 0M28 19c17-22 35-22 52 0"],
  route: ["M13 54c14-33 21 10 36-19 9-18 19-16 30-23", "M13 53a6 6 0 1 0 .1 0M50 34a5 5 0 1 0 .1 0M78 12l-11 2 8 9"],
  clock: ["M46 10a30 30 0 1 0 0 60 30 30 0 0 0 0-60z", "M46 21v24l17 9M14 7l8 6m56-6-8 6"],
  graph: ["M12 12v57h69", "M18 56 34 43l13 7 17-27 16-7M64 23l14-8-1 16", "M21 20c13-8 24-7 34-1"],
  house: ["M9 37 45 9l37 28M19 33v37h52V33M39 70V47h16v23", "M59 11V5h13v17M27 41h8m27 0h8"],
  pencil: ["M17 61 57 14l15 13-40 47-20 5zM17 61l15 13M57 14l8-8 15 13-8 8", "M42 76c15-4 29-3 40 1"],
};

function Doodle({ motif, className = "" }: { motif: ProfileMilestone["doodle"]; className?: string }) {
  return <svg className={`profile-doodle ${className}`} viewBox="0 0 92 86" fill="none" aria-hidden="true">
    {doodlePaths[motif].map((d, index) => <path key={index} d={d} pathLength="100" />)}
  </svg>;
}

type Trail = {
  main: string;
  branches: string[];
  anchors: { x: number; y: number }[];
  spans: { id: "education" | "ion" | "boxy"; path: string; endY: number }[];
  links: { id: "football" | "ionathon"; path: string }[];
};

function ChitMedia({ item }: { item: ProfileMilestone }) {
  if (!item.preview) return null;
  return <span className={item.secondaryPreview ? "profile-chit-media-pair" : undefined}>
    {(item.secondaryPreview ? [item.preview, item.secondaryPreview] : [item.preview]).map((media) =>
      <span className={`profile-chit-preview${media.src.includes("-official-logo") ? " is-logo" : ""}${media.src.includes("ion-official-logo") ? " is-ion-logo" : ""}`} key={media.src}>
        <Image src={media.src} alt={media.alt} width={1200} height={860} sizes="(max-width: 620px) 67vw, 330px" loading="eager" />
        <span className="profile-chit-preview-caption">{media.caption}</span>
      </span>)}
  </span>;
}

export function ProfileLiveBoardPortal() {
  const [surface, setSurface] = useState<HTMLElement | null>(null);
  const [active, setActive] = useState(0);
  const [revealed, setRevealed] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [detail, setDetail] = useState<number | null>(null);
  const [trail, setTrail] = useState<Trail | null>(null);
  const surfaceRef = useRef<HTMLElement | null>(null);
  const timelineRef = useRef<HTMLDivElement | null>(null);
  const pathRef = useRef<SVGPathElement | null>(null);
  const markerRef = useRef<SVGCircleElement | null>(null);
  const spanRevealRef = useRef<SVGRectElement | null>(null);
  const rows = useRef<(HTMLDivElement | null)[]>([]);
  const cards = useRef<(HTMLElement | null)[]>([]);
  const detailPanels = useRef<(HTMLDivElement | null)[]>([]);
  const opener = useRef<HTMLButtonElement | null>(null);
  const timer = useRef<number | null>(null);
  const arrivalTimer = useRef<number | null>(null);
  const tween = useRef<gsap.core.Tween | null>(null);
  const playingNow = useRef(false);
  const activeNow = useRef(0);
  const revealedNow = useRef(0);
  const completedNow = useRef(false);
  const detailNow = useRef<number | null>(null);
  const explicitPause = useRef(false);
  const pausedForVisit = useRef(false);
  const hereNow = useRef(false);
  const trailNow = useRef<Trail | null>(null);

  const alignCard = useCallback((index: number) => {
    const host = surfaceRef.current;
    const card = cards.current[index];
    if (!host || !card) return;
    const barBottom = host.querySelector<HTMLElement>(".profile-playback-bar")?.getBoundingClientRect().bottom ?? 0;
    const clearance = Math.max(window.innerWidth <= 760 ? 158 : 96,
      barBottom - host.getBoundingClientRect().top + 24);
    host.scrollTop = Math.max(0, Math.min(host.scrollHeight - host.clientHeight,
      host.scrollTop + card.getBoundingClientRect().top - host.getBoundingClientRect().top - clearance));
  }, []);

  useEffect(() => {
    const host = document.getElementById("profile-board-story-title")?.closest<HTMLElement>(".story-board-surface");
    if (!host) return;
    surfaceRef.current = host;
    host.classList.add("profile-live-mounted");
    const frame = requestAnimationFrame(() => setSurface(host));
    return () => { cancelAnimationFrame(frame); host.classList.remove("profile-live-mounted"); surfaceRef.current = null; };
  }, []);

  const updatePosition = useCallback(() => {
    const host = surfaceRef.current;
    const track = timelineRef.current;
    const geometry = trailNow.current;
    if (!host || !track || !geometry || !geometry.anchors.length) return;
    const trackTop = track.getBoundingClientRect().top - host.getBoundingClientRect().top + host.scrollTop;
    const maximum = Math.max(0, host.scrollHeight - host.clientHeight);
    const readingLine = host.scrollTop >= maximum - 3
      ? geometry.anchors[last].y + trackTop + 70
      : host.scrollTop + host.clientHeight * .4;
    const localY = readingLine - trackTop;
    let current = 0;
    geometry.anchors.forEach((point, i) => { if (point.y - 44 <= localY) current = i; });
    if (current !== activeNow.current) { activeNow.current = current; setActive(current); }
    if (current === last && !playingNow.current && !completedNow.current) {
      completedNow.current = true;
      setCompleted(true);
    }
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const nextReveal = reduce ? last : Math.max(revealedNow.current, current);
    if (nextReveal !== revealedNow.current) { revealedNow.current = nextReveal; setRevealed(nextReveal); }
    const path = pathRef.current;
    const marker = markerRef.current;
    if (!path || !marker) return;
    const total = path.getTotalLength();
    let low = 0;
    let high = total;
    if (!reduce) for (let i = 0; i < 18; i++) {
      const middle = (low + high) / 2;
      if (path.getPointAtLength(middle).y < localY) low = middle;
      else high = middle;
    }
    const inkLength = reduce ? total : Math.max(0, Math.min(total, (low + high) / 2));
    path.style.strokeDasharray = `${total} ${total}`;
    path.style.strokeDashoffset = String(total - inkLength);
    const point = path.getPointAtLength(inkLength);
    marker.setAttribute("cx", String(point.x));
    marker.setAttribute("cy", String(point.y));
    marker.style.opacity = inkLength < 3 ? "0" : "1";
    spanRevealRef.current?.setAttribute("height", String(reduce ? track.scrollHeight : Math.max(0, localY)));
  }, []);

  const measureTrail = useCallback(() => {
    const track = timelineRef.current;
    if (!track || !rows.current.every(Boolean)) return;
    const bounds = track.getBoundingClientRect();
    const mobile = bounds.width <= 620;
    const anchors = rows.current.map((row) => {
      const anchor = row!.querySelector<HTMLElement>(".profile-trail-anchor")!;
      const rect = anchor.getBoundingClientRect();
      return { x: rect.left - bounds.left, y: rect.top - bounds.top };
    });
    const start = { x: mobile ? anchors[0].x + 7 : Math.min(bounds.width - 18, anchors[0].x + bounds.width * .09), y: 0 };
    let main = `M ${start.x.toFixed(1)} 0`;
    let previous = start;
    anchors.forEach((point) => {
      const dy = Math.max(40, point.y - previous.y);
      const sway = mobile ? 4 : Math.min(44, Math.abs(point.x - previous.x) * .15 + 12);
      const direction = point.x >= previous.x ? 1 : -1;
      main += ` C ${(previous.x + direction * sway).toFixed(1)} ${(previous.y + dy * .34).toFixed(1)}, ${(point.x - direction * sway).toFixed(1)} ${(point.y - dy * .34).toFixed(1)}, ${point.x.toFixed(1)} ${point.y.toFixed(1)}`;
      previous = point;
    });
    main += ` C ${(previous.x + (mobile ? 5 : -22)).toFixed(1)} ${(previous.y + 26).toFixed(1)}, ${(previous.x - (mobile ? 4 : 17)).toFixed(1)} ${(previous.y + 47).toFixed(1)}, ${previous.x.toFixed(1)} ${(previous.y + 66).toFixed(1)}`;
    const branches = anchors.map((point, i) => {
      const card = cards.current[i]!.getBoundingClientRect();
      const endX = mobile || card.left - bounds.left > point.x ? card.left - bounds.left + 3 : card.right - bounds.left - 3;
      const endY = card.top - bounds.top + Math.min(48, card.height * .3);
      const bend = (point.x + endX) / 2;
      return `M ${point.x.toFixed(1)} ${point.y.toFixed(1)} C ${bend.toFixed(1)} ${point.y.toFixed(1)}, ${bend.toFixed(1)} ${endY.toFixed(1)}, ${endX.toFixed(1)} ${endY.toFixed(1)}`;
    });
    const span = (id: "education" | "ion" | "boxy", from: string, to: string, lane: number, ongoing = false) => {
      const startIndex = profileMilestones.findIndex((item) => item.id === from);
      const endIndex = profileMilestones.findIndex((item) => item.id === to);
      const first = anchors[startIndex];
      const final = anchors[endIndex];
      const endY = final.y + (ongoing ? 74 : 0);
      const offset = [28, 44, 60][lane];
      const x = mobile ? [5, 11, 38][lane] : first.x - offset;
      let path = `M ${first.x.toFixed(1)} ${first.y.toFixed(1)} C ${x.toFixed(1)} ${(first.y + 18).toFixed(1)}, ${x.toFixed(1)} ${(first.y + 39).toFixed(1)}, ${x.toFixed(1)} ${(first.y + 60).toFixed(1)}`;
      if (mobile) {
        path += ` L ${x.toFixed(1)} ${Math.max(first.y + 60, endY - 35).toFixed(1)} Q ${x.toFixed(1)} ${endY.toFixed(1)} ${(ongoing ? x : final.x).toFixed(1)} ${endY.toFixed(1)}`;
      } else {
        let previous = { x, y: first.y + 60 };
        for (const anchor of anchors.slice(startIndex + 1, endIndex + 1)) {
          const target = { x: anchor.x - offset, y: anchor.y };
          const bendY = (previous.y + target.y) / 2;
          path += ` C ${previous.x.toFixed(1)} ${bendY.toFixed(1)}, ${target.x.toFixed(1)} ${bendY.toFixed(1)}, ${target.x.toFixed(1)} ${target.y.toFixed(1)}`;
          previous = target;
        }
        path += ongoing
          ? ` C ${previous.x.toFixed(1)} ${(endY - 25).toFixed(1)}, ${previous.x.toFixed(1)} ${endY.toFixed(1)}, ${previous.x.toFixed(1)} ${endY.toFixed(1)}`
          : ` Q ${previous.x.toFixed(1)} ${(endY + 16).toFixed(1)} ${final.x.toFixed(1)} ${endY.toFixed(1)}`;
      }
      return { id, path, endY };
    };
    const spans = [
      span("education", "degree", "graduation", 0),
      span("ion", "ion", "current", 1, true),
      span("boxy", "boxy", "current", 2, true),
    ];
    const links = (["football", "ionathon"] as const).map((id) => {
      const point = anchors[profileMilestones.findIndex((item) => item.id === id)];
      const startX = mobile ? 11 : point.x - 44;
      return {
        id,
        path: `M ${startX.toFixed(1)} ${point.y.toFixed(1)} C ${((startX + point.x) / 2).toFixed(1)} ${(point.y - 16).toFixed(1)}, ${((startX + point.x) / 2).toFixed(1)} ${(point.y + 16).toFixed(1)}, ${point.x.toFixed(1)} ${point.y.toFixed(1)}`,
      };
    });
    const next = { main, branches, anchors, spans, links };
    trailNow.current = next;
    setTrail(next);
    requestAnimationFrame(updatePosition);
  }, [updatePosition]);

  useEffect(() => { if (trail) updatePosition(); }, [trail, updatePosition]);

  const stopPlayback = useCallback(() => {
    if (timer.current !== null) window.clearTimeout(timer.current);
    timer.current = null;
    tween.current?.kill();
    tween.current = null;
    playingNow.current = false;
    setPlaying(false);
    updatePosition();
  }, [updatePosition]);

  const queueNext = useCallback((index: number) => {
    function schedule(current: number) {
      if (current >= last) {
        playingNow.current = false;
        completedNow.current = true;
        setCompleted(true);
        setPlaying(false);
        return;
      }
      timer.current = window.setTimeout(() => {
        const host = surfaceRef.current;
        const next = cards.current[current + 1];
        if (!host || !next || !playingNow.current) return;
        const destination = Math.max(0, Math.min(host.scrollHeight - host.clientHeight,
          host.scrollTop + next.getBoundingClientRect().top - host.getBoundingClientRect().top - host.clientHeight * .22));
        tween.current = gsap.to(host, {
          scrollTop: destination, duration: .9, ease: "power2.inOut", onUpdate: updatePosition,
          onComplete: () => {
            tween.current = null;
            activeNow.current = current + 1;
            setActive(current + 1);
            revealedNow.current = Math.max(revealedNow.current, current + 1);
            setRevealed(revealedNow.current);
            updatePosition();
            if (playingNow.current) schedule(current + 1);
          },
        });
      }, profileMilestones[current].compact ? 1250 : 2200);
    }
    schedule(index);
  }, [updatePosition]);

  const play = useCallback((replay = false) => {
    const host = surfaceRef.current;
    if (!host || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    stopPlayback();
    if (detailNow.current !== null) {
      detailNow.current = null;
      setDetail(null);
    }
    explicitPause.current = false;
    pausedForVisit.current = false;
    if (replay || completedNow.current || activeNow.current === last) {
      host.scrollTop = 0;
      activeNow.current = 0;
      setActive(0);
      completedNow.current = false;
      setCompleted(false);
      updatePosition();
    }
    playingNow.current = true;
    setPlaying(true);
    queueNext(activeNow.current);
  }, [queueNext, stopPlayback, updatePosition]);

  const closeDetail = useCallback((restoreFocus = true) => {
    const index = detailNow.current;
    detailNow.current = null;
    setDetail(null);
    if (restoreFocus) requestAnimationFrame(() => {
      if (index !== null) alignCard(index);
      opener.current?.focus({ preventScroll: true });
    });
  }, [alignCard]);

  useEffect(() => {
    if (detail === null) return;
    const frame = requestAnimationFrame(() => {
      alignCard(detail);
      detailPanels.current[detail]?.focus({ preventScroll: true });
    });
    return () => cancelAnimationFrame(frame);
  }, [alignCard, detail]);

  useEffect(() => {
    if (!surface) return;
    const root = document.documentElement;
    const onInput = (event: Event) => {
      if (root.dataset.zoomSection !== "profile-board" || root.dataset.boardNavigating === "true") return;
      const activatesControl = event.type === "pointerdown" || event.type === "touchstart" ||
        (event instanceof KeyboardEvent && ["Enter", " "].includes(event.key));
      if (event.target instanceof Element && event.target.closest(".profile-playback-control") &&
          activatesControl) return;
      if (event.target instanceof Element && event.target.closest(".profile-chit-toggle") &&
          activatesControl) {
        pausedForVisit.current = true;
        if (playingNow.current) stopPlayback();
        return;
      }
      if (event instanceof KeyboardEvent && event.key === "Escape" && detailNow.current !== null) {
        event.preventDefault();
        closeDetail();
      }
      pausedForVisit.current = true;
      if (playingNow.current) stopPlayback();
    };
    const onBoardState = () => {
      const here = root.dataset.zoomSection === "profile-board" && root.dataset.boardNavigating !== "true";
      if (!here) {
        if (arrivalTimer.current !== null) window.clearTimeout(arrivalTimer.current);
        arrivalTimer.current = null;
        if (hereNow.current) {
          hereNow.current = false;
          pausedForVisit.current = false;
          stopPlayback();
        }
        return;
      }
      if (hereNow.current) return;
      hereNow.current = true;
      updatePosition();
      if (explicitPause.current || completedNow.current || detailNow.current !== null || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      arrivalTimer.current = window.setTimeout(() => {
        arrivalTimer.current = null;
        if (hereNow.current && !pausedForVisit.current && !explicitPause.current && !completedNow.current) play();
      }, 400);
    };
    const observer = new MutationObserver(onBoardState);
    observer.observe(root, { attributes: true, attributeFilter: ["data-zoom-section", "data-board-navigating"] });
    const resize = new ResizeObserver(measureTrail);
    if (timelineRef.current) resize.observe(timelineRef.current);
    surface.addEventListener("scroll", updatePosition, { passive: true });
    window.addEventListener("wheel", onInput, { passive: true, capture: true });
    window.addEventListener(PROFILE_INTERRUPT_EVENT, onInput);
    window.addEventListener("touchstart", onInput, { passive: true, capture: true });
    window.addEventListener("keydown", onInput, { capture: true });
    window.addEventListener("pointerdown", onInput, { capture: true });
    const frame = requestAnimationFrame(() => { measureTrail(); onBoardState(); });
    return () => {
      observer.disconnect(); resize.disconnect(); cancelAnimationFrame(frame);
      surface.removeEventListener("scroll", updatePosition);
      window.removeEventListener("wheel", onInput, true);
      window.removeEventListener(PROFILE_INTERRUPT_EVENT, onInput);
      window.removeEventListener("touchstart", onInput, true);
      window.removeEventListener("keydown", onInput, true);
      window.removeEventListener("pointerdown", onInput, true);
      if (arrivalTimer.current !== null) window.clearTimeout(arrivalTimer.current);
      stopPlayback();
    };
  }, [surface, closeDetail, measureTrail, play, stopPlayback, updatePosition]);

  const toggleDetail = (index: number, button: HTMLButtonElement) => {
    pausedForVisit.current = true;
    if (playingNow.current) stopPlayback();
    opener.current = button;
    if (detailNow.current === index) { closeDetail(); return; }
    detailNow.current = index;
    setDetail(index);
    revealedNow.current = Math.max(revealedNow.current, index);
    setRevealed(revealedNow.current);
  };

  return surface && createPortal(<div className={`profile-live-board ${trail ? "has-trail" : ""}`} aria-label="Asu Singh career timeline">
    <div className="profile-playback-bar">
      <span className="profile-playback-count" aria-live="polite">{String(active + 1).padStart(2, "0")} / {String(profileMilestones.length).padStart(2, "0")} · {profileMilestones[active].year}</span>
      <button type="button" className="profile-playback-control" onClick={() => {
        if (playing) { explicitPause.current = true; stopPlayback(); }
        else play(completed || active === last);
      }} aria-label={playing ? "Pause Profile story" : completed || active === last ? "Replay Profile story" : "Play Profile story"}>
        <span aria-hidden="true">{playing ? "Ⅱ" : "▶"}</span> {playing ? "Pause" : completed || active === last ? "Replay" : "Play"}
      </button>
    </div>
    <header className="profile-live-header">
      <div className="profile-live-intro">
        <span className="profile-kicker">Case board / 00 · the long view</span>
        <h2>A trail of things<br /><em>made real.</em></h2>
        <p>From a first homemade editor to trading systems, research, and tools still in progress. Follow the red thread, or take the wheel.</p>
        <span className="profile-instruction">Scroll to explore · tap a pinned note to unfold it ↘</span>
      </div>
      <figure className="profile-live-photo">
        <span className="board-pin pin-blue" aria-hidden="true" />
        <Image src="/profile/asu-portrait-cutout.png" alt="Portrait of Asu Singh" width={240} height={240} sizes="(max-width: 760px) 100px, 170px" priority />
        <figcaption>Asu / work in progress</figcaption>
      </figure>
    </header>
    <div className="profile-branch-legend" aria-label="Overlapping chapters">
      <span><i className="profile-legend-education" /> Education · 2016–20</span>
      <span><i className="profile-legend-ion" /> ION · Aug 2020–now</span>
      <span><i className="profile-legend-boxy" /> Boxy · 2024–now</span>
      <small>Colored branches run beside the red story trail.</small>
    </div>
    <div ref={timelineRef} className="profile-timeline" aria-label="Career milestones">
      {trail && <svg className="profile-trail-svg" width="100%" height="100%" aria-hidden="true">
        <defs><clipPath id="profile-span-reveal"><rect ref={spanRevealRef} x="0" y="0" width="100%" height="0" /></clipPath></defs>
        <path className="profile-trail-guide" d={trail.main} />
        <g clipPath="url(#profile-span-reveal)">
          {trail.spans.map((span) => <g key={span.id}>
            <path className={`profile-era-line era-${span.id}`} d={span.path} />
            <circle className={`profile-era-node era-${span.id}`} cx={trail.anchors[profileMilestones.findIndex((item) => item.id === (span.id === "education" ? "degree" : span.id))].x} cy={trail.anchors[profileMilestones.findIndex((item) => item.id === (span.id === "education" ? "degree" : span.id))].y} r="5" />
          </g>)}
          {trail.links.map((link) => <path key={link.id} className={`profile-era-link era-${link.id}`} d={link.path} />)}
        </g>
        <path ref={pathRef} className="profile-trail-ink" d={trail.main} />
        {trail.branches.map((branch, i) => <path key={i} className={`profile-trail-branch ${i <= revealed ? "is-drawn" : ""}`} d={branch} pathLength="100" />)}
        <circle ref={markerRef} className="profile-trail-marker" r="6" />
      </svg>}
      {profileMilestones.map((item, i) => <div key={item.id} ref={(node) => { rows.current[i] = node; }}
        className={`profile-timeline-row row-${i} ${item.compact ? "is-compact" : ""} ${i <= revealed ? "is-revealed" : ""} ${i === active ? "is-current" : ""} ${detail === i ? "is-open" : ""}`}>
        <span className="profile-trail-anchor" aria-hidden="true" />
        <article className={`profile-timeline-chit tone-${item.tone}`}>
          <span className="board-pin" aria-hidden="true" />
          {!item.compact && <span className="profile-chit-fold" aria-hidden="true" />}
          {item.compact ? <div ref={(node) => { cards.current[i] = node; }} className="profile-chit-static">
            <span className="profile-chit-date">{item.year} <span>· {item.chapter}</span></span>
            <strong>{item.title}</strong>
            <span className="profile-chit-aside">{item.aside}</span>
            <span className="profile-chit-highlight profile-mini-highlight">{item.highlight}</span>
            <ChitMedia item={item} />
            {item.proof.length > 0 && <a className="profile-mini-proof" href={item.proof[0].href} target="_blank" rel="noreferrer">{item.proof[0].label} ↗</a>}
          </div> : <button type="button" ref={(node) => { cards.current[i] = node; }} className="profile-chit-toggle"
            onClick={(event) => toggleDetail(i, event.currentTarget)} aria-expanded={detail === i}
            aria-controls={`profile-note-${item.id}`} aria-label={`${detail === i ? "Fold" : "Unfold"} ${item.year}: ${item.title}`}>
            <span className="profile-chit-date">{item.year} <span>· {item.chapter}</span></span>
            <strong>{item.title}</strong>
            <span className="profile-chit-aside">{item.aside}</span>
            <span className="profile-chit-highlight">{item.highlight}</span>
            <ChitMedia item={item} />
            <span className="profile-chit-open">{detail === i ? "Fold note" : "Unfold story"} <span aria-hidden="true">{detail === i ? "↖" : "↗"}</span></span>
          </button>}
          {!item.compact && item.id !== "holisol" && <Doodle motif={item.doodle} />}
          {detail === i && <div id={`profile-note-${item.id}`} ref={(node) => { detailPanels.current[i] = node; }}
            className="profile-note-detail" tabIndex={-1} aria-label={`${item.year} story`}>
            <p className="profile-note-label">Field note / {item.chapter}</p>
            <div className="profile-note-copy">{item.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div>
            {item.artifact && <figure className="profile-note-artifact">
              <Image src={item.artifact.src} alt={item.artifact.alt} width={1366} height={768} sizes="(max-width: 760px) 72vw, 520px" />
              <figcaption>{item.artifact.caption}</figcaption>
            </figure>}
            {item.secondaryArtifact && <figure className="profile-note-artifact">
              <Image src={item.secondaryArtifact.src} alt={item.secondaryArtifact.alt} width={870} height={410} sizes="(max-width: 760px) 72vw, 520px" />
              <figcaption>{item.secondaryArtifact.caption}</figcaption>
            </figure>}
            {item.id === "vide" && <div className="profile-injectorist-note">
              <Doodle motif="wireless" className="profile-injectorist-doodle" />
              <div><strong>Injectorist</strong><span>Bash · connected wireless cards · packet injection capability</span></div>
            </div>}
            <div className="profile-note-proof"><span>Proof / explore further</span>
              {item.evidenceLabel && <span className="profile-proprietary-label">{item.evidenceLabel}</span>}
              {item.proof.map((proof) => <a key={proof.href} href={proof.href}
                target={proof.href.startsWith("#") ? undefined : "_blank"}
                rel={proof.href.startsWith("#") ? undefined : "noreferrer"}
                onClick={proof.href.startsWith("#") ? () => closeDetail(false) : undefined}>{proof.label} ↗</a>)}
            </div>
          </div>}
        </article>
      </div>)}
    </div>
    <p className="profile-live-footnote">The story keeps going. The board is yours to explore.</p>
    <BoardEndCue from="profile" />
  </div>, surface);
}
