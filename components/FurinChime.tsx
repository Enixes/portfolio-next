"use client";

import { useEffect, useRef, useState } from "react";

type Soundscape = {
  context: AudioContext;
  wind: GainNode;
  filter: BiquadFilterNode;
  leaves: GainNode;
  source: AudioBufferSourceNode;
};

function makeSoundscape(): Soundscape {
  const context = new AudioContext();
  const buffer = context.createBuffer(1, context.sampleRate * 3, context.sampleRate);
  const samples = buffer.getChannelData(0);
  for (let index = 0; index < samples.length; index++) samples[index] = Math.random() * 2 - 1;

  const source = context.createBufferSource();
  source.buffer = buffer;
  source.loop = true;
  const highpass = context.createBiquadFilter();
  highpass.type = "highpass";
  highpass.frequency.value = 90;
  const filter = context.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 360;
  const wind = context.createGain();
  wind.gain.value = 0.008;
  source.connect(highpass).connect(filter).connect(wind).connect(context.destination);
  const leafFilter = context.createBiquadFilter();
  leafFilter.type = "bandpass";
  leafFilter.frequency.value = 1700;
  leafFilter.Q.value = 0.55;
  const leaves = context.createGain();
  leaves.gain.value = 0;
  source.connect(leafFilter).connect(leaves).connect(context.destination);
  source.start();
  return { context, wind, filter, leaves, source };
}

function ring({ context }: Soundscape, quiet = false) {
  const start = context.currentTime;
  // High, slightly inharmonic partials give a small glass bell its airy character.
  for (const [frequency, level, decay] of [
    [1174, 0.014, 2.4], [1762, 0.008, 1.9], [2811, 0.003, 1.25],
  ]) {
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(frequency * (0.996 + Math.random() * 0.008), start);
    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(level * (quiet ? 0.55 : 1), start + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.00001, start + decay);
    oscillator.connect(gain).connect(context.destination);
    oscillator.start(start);
    oscillator.stop(start + decay + 0.02);
    oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
  }
}

function bird({ context }: Soundscape) {
  const start = context.currentTime;
  for (let note = 0; note < 2; note++) {
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const at = start + note * .16;
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(1930 + note * 160, at);
    oscillator.frequency.exponentialRampToValueAtTime(2650 + note * 100, at + .09);
    oscillator.frequency.exponentialRampToValueAtTime(2050 + note * 120, at + .18);
    gain.gain.setValueAtTime(.00001, at);
    gain.gain.linearRampToValueAtTime(.0035, at + .035);
    gain.gain.exponentialRampToValueAtTime(.00001, at + .19);
    oscillator.connect(gain).connect(context.destination);
    oscillator.start(at);
    oscillator.stop(at + .2);
    oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
  }
}

function gust(soundscape: Soundscape, heroVisible: boolean) {
  const { context, wind, filter, leaves } = soundscape;
  const now = context.currentTime;
  wind.gain.cancelScheduledValues(now);
  wind.gain.setValueAtTime(wind.gain.value, now);
  wind.gain.linearRampToValueAtTime(0.018, now + 0.5);
  wind.gain.linearRampToValueAtTime(0.008, now + 2.8);
  filter.frequency.cancelScheduledValues(now);
  filter.frequency.setValueAtTime(filter.frequency.value, now);
  filter.frequency.linearRampToValueAtTime(680, now + 0.65);
  filter.frequency.linearRampToValueAtTime(360, now + 2.8);
  leaves.gain.cancelScheduledValues(now);
  leaves.gain.setValueAtTime(leaves.gain.value, now);
  leaves.gain.linearRampToValueAtTime(heroVisible ? 0.011 : 0, now + .4);
  leaves.gain.linearRampToValueAtTime(0, now + 2.8);
  if (Math.random() < 0.83) ring(soundscape, true);
}

export function FurinChime() {
  const [enabled, setEnabled] = useState(false);
  const [message, setMessage] = useState("");
  const soundscape = useRef<Soundscape | null>(null);
  const enabledRef = useRef(false);
  const swayTimer = useRef<number | undefined>(undefined);
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
        gust(soundscape.current, heroVisible);
        if (heroVisible && Math.random() < .34) {
          bird(soundscape.current);
        }
      }
    };
    const onVisibility = () => {
      const active = soundscape.current;
      if (!active || !enabledRef.current) return;
      if (document.visibilityState === "hidden") {
        void active.context.suspend().catch(() => {});
      } else {
        void active.context.resume().catch(() => {
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
      const active = soundscape.current;
      if (active) {
        active.source.stop();
        void active.context.close().catch(() => {});
        soundscape.current = null;
      }
    };
  }, []);

  const toggle = async () => {
    try {
      if (enabledRef.current) {
        enabledRef.current = false;
        setEnabled(false);
        setMessage("Wind chime sound off.");
        await soundscape.current?.context.suspend();
        return;
      }
      const active = soundscape.current ?? makeSoundscape();
      soundscape.current = active;
      await active.context.resume();
      enabledRef.current = true;
      setEnabled(true);
      setMessage("Wind chime sound on.");
      ring(active);
    } catch {
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
          <circle cx="26" cy="55" r="4.5" fill="#a9c1c2" stroke="#63828a" strokeWidth="1" />
          <path d="M26 59v7" stroke="#72898a" strokeWidth="1.1" />
          <path className="furin-tanzaku" d="M17 66h18l-1.5 43-16-2Z" fill="url(#furin-paper)" stroke="#9eab91" strokeWidth="1" />
        </g>
      </svg>
      <span className="furin-sound-mark" aria-hidden="true">♪</span>
    </button>
    <span className="furin-status" role="status">{message}</span>
  </>;
}
