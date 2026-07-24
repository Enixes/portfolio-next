"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const Scene = dynamic(() => import("./Scene"), {
  ssr: false,
  loading: () => <div className="chaos-fallback" aria-hidden="true" />,
});

export function Hero3D({ activeSkill }: { activeSkill: string }) {
  const [fallback, setFallback] = useState(false);
  const [organized, setOrganized] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setFallback(reduced);
    const timer = window.setTimeout(() => setOrganized(true), reduced ? 0 : 5400);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <>
      {fallback ? (
        <div className="static-core" aria-hidden="true" />
      ) : (
        <Scene activeSkill={activeSkill} />
      )}
      <div className="absolute bottom-[12%] right-[10%] z-10 flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.16em] text-[#8f9ba1]">
        <span
          className={`h-1.5 w-1.5 rounded-full transition-all duration-700 ${
            organized
              ? "bg-[#6dff8f] shadow-[0_0_14px_#6dff8f]"
              : "animate-pulse bg-[#ff4fd8] shadow-[0_0_14px_#ff4fd8]"
          }`}
        />
        {organized ? `${activeSkill} topology` : "Assembling topology"}
      </div>
    </>
  );
}
