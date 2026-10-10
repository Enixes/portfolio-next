"use client";

import { useEffect, useId, useRef } from "react";

/** One image plane keeps the original vines, edited chime, and paper shadows registered. */
export function RoomDepth({ intro = false }: { intro?: boolean }) {
  const id = useId().replaceAll(":", "");
  const svg = useRef<SVGSVGElement>(null);
  const prop = useRef<SVGSVGElement>(null);
  const ripple = useRef<SVGAnimateElement>(null);
  const strikeTimer = useRef<number | undefined>(undefined);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 760px)");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const hero = svg.current?.closest(intro ? ".war-room-intro" : ".preview-hero");
    let heroVisible = false;
    const observer = new IntersectionObserver(([entry]) => {
      heroVisible = entry.isIntersecting;
      if (!heroVisible) ripple.current?.endElement();
    }, { threshold: .05 });
    if (hero) observer.observe(hero);
    const cleanPlate = new window.Image();
    cleanPlate.onload = () => {
      svg.current?.classList.add("is-plate-ready");
      prop.current?.classList.add("is-ready");
    };
    cleanPlate.src = "/room/afternoon-chime-cleanplate.webp";
    const setCamera = () => svg.current?.setAttribute("preserveAspectRatio", media.matches ? "xMidYMin slice" : "xMidYMid slice");
    setCamera();
    media.addEventListener("change", setCamera);

    const onGust = () => {
      if (heroVisible && document.visibilityState === "visible" && !reducedMotion.matches) ripple.current?.beginElement();
    };
    const onStrike = () => {
      if (!heroVisible || document.visibilityState !== "visible" || reducedMotion.matches) return;
      prop.current?.classList.remove("is-striking");
      void prop.current?.getBoundingClientRect();
      prop.current?.classList.add("is-striking");
      window.clearTimeout(strikeTimer.current);
      strikeTimer.current = window.setTimeout(() => prop.current?.classList.remove("is-striking"), 1100);
    };
    const onHidden = () => {
      if (document.visibilityState === "hidden") {
        prop.current?.classList.remove("is-striking");
        ripple.current?.endElement();
      }
    };
    const onReducedMotion = () => {
      if (reducedMotion.matches) {
        ripple.current?.endElement();
        prop.current?.classList.remove("is-striking");
      }
    };
    window.addEventListener("room:gust", onGust);
    window.addEventListener("room:chime-strike", onStrike);
    document.addEventListener("visibilitychange", onHidden);
    reducedMotion.addEventListener("change", onReducedMotion);
    return () => {
      observer.disconnect();
      cleanPlate.onload = null;
      media.removeEventListener("change", setCamera);
      window.removeEventListener("room:gust", onGust);
      window.removeEventListener("room:chime-strike", onStrike);
      document.removeEventListener("visibilitychange", onHidden);
      reducedMotion.removeEventListener("change", onReducedMotion);
      window.clearTimeout(strikeTimer.current);
    };
  }, [intro]);

  return <><svg ref={svg} className={`${intro ? "studio-intro-scene" : "room-atmosphere"} room-depth-art`} viewBox="0 0 1672 941" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
    <defs>
      <filter id={`room-vine-motion-${id}`} x="0" y="0" width="1672" height="941" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
        <feImage href="/room/window-vine-map.svg" result="map" />
        <feDisplacementMap in="SourceGraphic" in2="map" scale="0" xChannelSelector="R" yChannelSelector="G">
          <animate ref={ripple} attributeName="scale" values="0;5;-3;2;0" keyTimes="0;.28;.57;.77;1" dur="2.6s" begin="indefinite" fill="remove" />
        </feDisplacementMap>
      </filter>
      <filter id={`room-patch-feather-${id}`} x="-40%" y="-12%" width="180%" height="124%"><feGaussianBlur stdDeviation="5" /></filter>
      <mask id={`room-chime-clean-mask-${id}`} maskUnits="userSpaceOnUse">
        <g fill="white" filter={`url(#room-patch-feather-${id})`}>
          <path d="M239 56h10v101h-10z" />
          <ellipse cx="244" cy="183" rx="30" ry="35" />
          <path d="M229 195h30v98h-30z" />
        </g>
      </mask>
    </defs>
    <image href="/room/afternoon-studio.webp" width="1672" height="941" filter={`url(#room-vine-motion-${id})`} />
    <image className="room-cleanplate-image" href="/room/afternoon-chime-cleanplate.webp" width="1672" height="941" mask={`url(#room-chime-clean-mask-${id})`} />
    <g className="room-window-leaves" fill="none" strokeLinecap="round">
      <path className="room-vine-glint" d="M8 132q47 23 75 76m-77 121q54 15 85 59M345 24q35 35 51 79m62 80q19 58-15 105" />
      <path className="room-leaf-glint" d="M46 158q13-8 22 8-8 14-21 5m43 57q14-9 21 10-11 12-22 3m-57 100q18-5 20 13-16 10-21 1m333-255q13-8 17 10-11 11-18 3m81 129q15-6 17 12-15 9-19 0" />
    </g>
  </svg>
  <svg ref={prop} className={`room-window-prop${intro ? " studio-intro-prop" : ""}`} viewBox="0 0 52 180" aria-hidden="true" focusable="false">
    <defs>
      <linearGradient id={`room-glass-${id}`} x1="0" y1="0" x2="1" y2="1">
        <stop stopColor="#fff" stopOpacity=".2" /><stop offset=".55" stopColor="#d7f6f4" stopOpacity=".05" /><stop offset="1" stopColor="#a2c1b2" stopOpacity=".34" />
      </linearGradient>
      <linearGradient id={`room-paper-${id}`} x1="0" y1="0" x2="1" y2="0">
        <stop stopColor="#a57f50" /><stop offset=".5" stopColor="#e6c89a" /><stop offset="1" stopColor="#a98256" />
      </linearGradient>
    </defs>
    <g className="room-window-chime">
      <path d="M26 0v49" stroke="#625038" strokeWidth="1.3" strokeLinecap="round" />
      <path d="M26 48c-11 0-19 10-19 22v5c0 7 8 11 19 11s19-4 19-11v-5C45 58 37 48 26 48Z" fill={`url(#room-glass-${id})`} stroke="#b6a982" strokeWidth="1.8" />
      <path d="M13 60q4-8 10-9m-13 25q16 9 33 0" fill="none" stroke="#fff9da" strokeWidth="2" strokeOpacity=".8" strokeLinecap="round" />
      <g className="room-window-clapper">
        <path d="M26 84v14" stroke="#5b4c34" strokeWidth="1.8" />
        <circle cx="26" cy="97" r="3" fill="#958469" />
      </g>
      <path d="M26 101v8" stroke="#6b5331" strokeWidth="1.6" />
      <path className="room-window-paper" d="M16 108q10 2 20 0l-2 68-18 1Z" fill={`url(#room-paper-${id})`} stroke="#795c39" strokeWidth="1" />
    </g>
  </svg></>;
}
