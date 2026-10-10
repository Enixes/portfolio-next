"use client";

import { useEffect, useRef, useState } from "react";
import { birdCall, fadeRoom, makeRoomSoundscape, quietVoices, ringGlass, roomGust, type RoomSoundscape } from "@/lib/room-audio";

export function FurinChime() {
  const [enabled, setEnabled] = useState(false);
  const [message, setMessage] = useState("");
  const soundscape = useRef<RoomSoundscape | null>(null);
  const enabledRef = useRef(false);
  const swayTimer = useRef<number | undefined>(undefined);
  const strikeTimer = useRef<number | undefined>(undefined);
  const suspendTimer = useRef<number | undefined>(undefined);
  const intent = useRef(0);
  const button = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onGust = (event: Event) => {
      if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        button.current?.classList.remove("is-gusting");
        // Restart the short swing even when the next gust arrives early.
        void button.current?.offsetWidth;
        button.current?.classList.add("is-gusting");
        window.clearTimeout(swayTimer.current);
        swayTimer.current = window.setTimeout(() => button.current?.classList.remove("is-gusting"), 1700);
      }
      if (enabledRef.current && document.visibilityState === "visible" && soundscape.current?.context.state === "running") {
        const heroVisible = Boolean((event as CustomEvent<{ heroVisible?: boolean }>).detail?.heroVisible);
        roomGust(soundscape.current, heroVisible);
        if (heroVisible && Math.random() < .3) birdCall(soundscape.current);
        if (Math.random() < .44) {
          window.clearTimeout(strikeTimer.current);
          strikeTimer.current = window.setTimeout(() => {
            if (!enabledRef.current || document.visibilityState !== "visible" || soundscape.current?.context.state !== "running") return;
            ringGlass(soundscape.current);
            button.current?.classList.remove("is-ringing");
            void button.current?.offsetWidth;
            button.current?.classList.add("is-ringing");
            window.dispatchEvent(new Event("room:chime-strike"));
            window.setTimeout(() => button.current?.classList.remove("is-ringing"), 1000);
          }, 360);
        }
      }
    };
    const onVisibility = () => {
      const active = soundscape.current;
      if (document.visibilityState === "hidden") {
        window.clearTimeout(strikeTimer.current);
        window.clearTimeout(suspendTimer.current);
        button.current?.classList.remove("is-ringing");
        if (!active) return;
        fadeRoom(active, 0, enabledRef.current ? .24 : .12);
        suspendTimer.current = window.setTimeout(() => {
          quietVoices(active);
          void active.context.suspend().catch(() => {});
        }, 300);
      } else if (active && enabledRef.current) {
        window.clearTimeout(suspendTimer.current);
        const currentIntent = intent.current;
        void active.context.resume().then(() => {
          if (enabledRef.current && intent.current === currentIntent && document.visibilityState === "visible") fadeRoom(active, .82, 1.2);
        }).catch(() => {
          if (intent.current !== currentIntent) return;
          enabledRef.current = false;
          setEnabled(false);
          setMessage("Sound is unavailable here.");
        });
      }
    };
    window.addEventListener("room:gust", onGust);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("room:gust", onGust);
      document.removeEventListener("visibilitychange", onVisibility);
      window.clearTimeout(swayTimer.current);
      window.clearTimeout(strikeTimer.current);
      window.clearTimeout(suspendTimer.current);
      const active = soundscape.current;
      if (active) {
        quietVoices(active);
        active.source.stop();
        active.breath.stop();
        void active.context.close().catch(() => {});
        soundscape.current = null;
      }
    };
  }, []);

  const toggle = async () => {
    const currentIntent = ++intent.current;
    try {
      if (enabledRef.current) {
        enabledRef.current = false;
        setEnabled(false);
        setMessage("Wind chime sound off.");
        window.clearTimeout(strikeTimer.current);
        window.clearTimeout(suspendTimer.current);
        button.current?.classList.remove("is-ringing");
        const active = soundscape.current;
        if (active) {
          fadeRoom(active, 0, .85);
          suspendTimer.current = window.setTimeout(() => {
            if (intent.current !== currentIntent || enabledRef.current) return;
            quietVoices(active);
            void active.context.suspend().catch(() => {});
          }, 950);
        }
        return;
      }
      window.clearTimeout(suspendTimer.current);
      const active = soundscape.current ?? makeRoomSoundscape();
      soundscape.current = active;
      enabledRef.current = true;
      await active.context.resume();
      if (intent.current !== currentIntent || !enabledRef.current) return;
      fadeRoom(active, .82, 1.2);
      setEnabled(true);
      setMessage("Wind chime sound on.");
    } catch {
      if (intent.current !== currentIntent) return;
      enabledRef.current = false;
      setEnabled(false);
      setMessage("Sound is unavailable here.");
    }
  };

  return <>
    <button ref={button} className={`furin-button${enabled ? " is-sounding" : ""}`} type="button"
      aria-label={enabled ? "Turn off wind chime sound" : "Turn on wind chime sound"}
      aria-pressed={enabled} title={enabled ? "Mute wind chime" : "Play wind chime"} onClick={toggle}>
      <svg viewBox="0 0 52 112" aria-hidden="true" focusable="false">
        <defs>
          <linearGradient id="furin-glass" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#ffffff" stopOpacity=".32" />
            <stop offset=".52" stopColor="#e5fbff" stopOpacity=".08" />
            <stop offset="1" stopColor="#c5eaf2" stopOpacity=".38" />
          </linearGradient>
          <linearGradient id="furin-paper" x1="0" x2="1">
            <stop stopColor="#fffbeb" /><stop offset="1" stopColor="#e5ebd7" />
          </linearGradient>
        </defs>
        <path className="furin-hanger" d="M26 0v12" />
        <g className="furin-bell">
          <path d="M26 11C14 11 8 20 8 34v8c0 5 8 8 18 8s18-3 18-8v-8C44 20 38 11 26 11Z" fill="url(#furin-glass)" stroke="#91b9c4" strokeWidth="1.4" />
          <path d="M12 38c7 5 21 6 29 0M16 24c3-6 7-8 12-8" fill="none" stroke="#fff" strokeOpacity=".88" strokeWidth="2" strokeLinecap="round" />
        </g>
        <g className="furin-tail">
          <path d="M26 49v12" stroke="#72898a" strokeWidth="1.1" />
          <circle className="furin-clapper" cx="26" cy="55" r="4.5" fill="#a9c1c2" stroke="#63828a" strokeWidth="1" />
          <path d="M26 59v7" stroke="#72898a" strokeWidth="1.1" />
          <path className="furin-tanzaku" d="M17 66h18l-1.5 43-16-2Z" fill="url(#furin-paper)" stroke="#9eab91" strokeWidth="1" />
        </g>
      </svg>
      <span className="furin-sound-mark" aria-hidden="true">♪</span>
    </button>
    <span className="furin-status" role="status">{message}</span>
  </>;
}
