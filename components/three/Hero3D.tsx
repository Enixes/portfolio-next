"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const Scene = dynamic(() => import("./Scene"), {
  ssr: false,
  loading: () => <div className="static-core" aria-hidden="true" />,
});

export function Hero3D() {
  const [fallback, setFallback] = useState(true);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const lowPower =
      typeof navigator.hardwareConcurrency === "number" &&
      navigator.hardwareConcurrency <= 4;
    setFallback(reduced || lowPower);
  }, []);

  return fallback ? (
    <div className="static-core" aria-hidden="true" />
  ) : (
    <Scene />
  );
}
