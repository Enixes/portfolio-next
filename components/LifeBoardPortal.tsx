"use client";

import type { CSSProperties } from "react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import gsap from "gsap";

type AnimeFavorite = {
  id: number;
  title: string;
  score: number;
  siteUrl: string;
};

type AnimeStats = {
  count: number;
  meanScore: number;
};

type AnimeCache = {
  savedAt: number;
  favorites: AnimeFavorite[];
  stats: AnimeStats | null;
};

const ANILIST_PROFILE = "https://anilist.co/user/enixes";
const ANILIST_CACHE_KEY = "life-board:anilist:enixes:v1";
const ANILIST_CACHE_TTL = 1000 * 60 * 60 * 24 * 7;

const styles = `
.life-live-mounted > .story-board-index,
.life-live-mounted > .story-board-header,
.life-live-mounted > .story-board-grid,
.life-live-mounted > .story-board-footnote,
.life-live-mounted > .tech-life { display:none!important; }
.scroll-board-green .story-board-frame { height:100%!important; min-height:0!important; overflow:hidden!important; }
.life-live-mounted { position:relative; display:block!important; height:100%!important; min-height:0!important; overflow:hidden!important; padding:0!important; }
.life-live-board {
  --life-x:0;
  --life-y:0;
  position:relative;
  width:100%;
  height:100%;
  overflow:hidden;
  padding:clamp(28px,3.6vw,50px) clamp(24px,4vw,58px) clamp(24px,3vw,42px);
  color:#27251f;
  background:
    radial-gradient(circle at 78% 18%,rgba(255,255,255,.44),transparent 24%),
    radial-gradient(circle at 13% 78%,rgba(218,235,190,.2),transparent 28%),
    linear-gradient(rgba(83,66,39,.027) 1px,transparent 1px),
    linear-gradient(90deg,rgba(83,66,39,.027) 1px,transparent 1px);
  background-size:auto,auto,27px 27px,27px 27px;
  isolation:isolate;
}
.life-live-board:before {
  content:"";
  position:absolute;
  inset:0;
  z-index:0;
  pointer-events:none;
  background:linear-gradient(112deg,transparent 8%,rgba(255,255,255,.17) 38%,transparent 59%);
  opacity:.46;
}
.life-header { position:relative; z-index:8; display:flex; align-items:flex-start; justify-content:space-between; gap:24px; }
.life-header-copy { max-width:720px; }
.life-kicker { display:block; color:#4e7d3e; font:800 9px/1 var(--mono); letter-spacing:.14em; text-transform:uppercase; }
.life-header h2 { margin:8px 0 7px; font:900 clamp(34px,4.15vw,60px)/.9 var(--marker,var(--hand)); letter-spacing:-.035em; transform:rotate(-.8deg); }
.life-header p { max-width:660px; margin:0; color:#5d5b54; font:9px/1.55 var(--mono); }
.life-header em { color:#a12f29; font-style:normal; }
.life-united-scarf {
  position:relative;
  flex:0 0 auto;
  width:min(220px,23vw);
  min-width:150px;
  padding:10px 16px 9px;
  border-block:5px solid #f1d361;
  color:#fff8df;
  background:#9f2524;
  box-shadow:4px 7px 13px rgba(56,34,24,.18);
  font:900 clamp(13px,1.35vw,18px)/1 var(--marker,var(--hand));
  letter-spacing:.05em;
  text-align:center;
  text-transform:uppercase;
  transform:rotate(2deg);
  transform-origin:80% 50%;
}
.life-united-scarf:before,.life-united-scarf:after { content:""; position:absolute; top:-5px; width:15px; bottom:-5px; background:repeating-linear-gradient(90deg,#f1d361 0 2px,transparent 2px 5px); }
.life-united-scarf:before { left:-13px; }
.life-united-scarf:after { right:-13px; }

.life-grid {
  position:absolute;
  z-index:4;
  top:25%;
  right:4%;
  bottom:5%;
  left:4%;
  display:grid;
  grid-template-columns:1.08fr .92fr 1fr;
  grid-template-rows:.86fr 1.14fr;
  gap:clamp(12px,1.5vw,22px);
}
.life-card { position:relative; min-width:0; overflow:hidden; border:1px solid rgba(70,62,48,.12); box-shadow:4px 7px 15px rgba(59,43,27,.15); transform-origin:50% 12%; will-change:transform; }
.life-card .board-pin { z-index:8; }
.life-card-label { display:block; color:#6d6a62; font:800 7px/1 var(--mono); letter-spacing:.13em; text-transform:uppercase; }
.life-card h3 { margin:8px 0 5px; font:900 clamp(22px,2.35vw,34px)/.94 var(--marker,var(--hand)); }
.life-card p { margin:0; color:#4e514b; font:8px/1.48 var(--mono); }

.life-football {
  grid-column:1;
  grid-row:1 / span 2;
  padding:clamp(20px,2.2vw,30px);
  background:linear-gradient(145deg,#eaf0dc 0 24%,#dfe9ca 24% 100%);
  transform:rotate(-.7deg);
}
.life-football:after { content:""; position:absolute; right:-13%; bottom:-13%; width:56%; aspect-ratio:1; border:18px solid rgba(66,112,62,.06); border-radius:50%; }
.life-football-head { display:flex; justify-content:space-between; gap:15px; align-items:flex-start; }
.life-cam-tag { padding:6px 9px; border:2px solid #9f2d28; border-radius:52% 48% 48% 52%; color:#9f2d28; background:rgba(255,252,232,.76); font:900 14px/1 var(--marker,var(--hand)); transform:rotate(5deg); }
.life-football h3 strong { color:#a12f29; }
.life-football-note { margin-top:7px!important; max-width:300px; }
.life-pitch { position:absolute; right:7%; bottom:6%; left:7%; height:52%; border:2px solid rgba(72,115,63,.56); border-radius:2px; background:repeating-linear-gradient(90deg,rgba(76,128,68,.05) 0 12%,rgba(255,255,255,.1) 12% 24%); }
.life-pitch:before { content:""; position:absolute; top:0; bottom:0; left:50%; border-left:2px solid rgba(72,115,63,.48); }
.life-pitch:after { content:""; position:absolute; top:50%; left:50%; width:20%; aspect-ratio:1; border:2px solid rgba(72,115,63,.48); border-radius:50%; transform:translate(-50%,-50%); }
.life-box { position:absolute; top:24%; width:18%; height:52%; border:2px solid rgba(72,115,63,.48); }
.life-box-left { left:-2px; border-left:0; }
.life-box-right { right:-2px; border-right:0; }
.life-player { position:absolute; width:10px; height:10px; border:2px solid rgba(48,75,44,.64); border-radius:50%; background:#edf2df; transform:translate(-50%,-50%); }
.life-player:nth-of-type(3){left:24%;top:26%}.life-player:nth-of-type(4){left:27%;top:70%}.life-player:nth-of-type(5){left:61%;top:25%}.life-player:nth-of-type(6){left:72%;top:70%}
.life-cam-dot { position:absolute; z-index:4; left:49%; top:52%; width:15px; height:15px; border:3px solid #fff7dd; border-radius:50%; background:#ad312b; box-shadow:0 0 0 2px rgba(163,47,42,.26); transform:translate(-50%,-50%); }
.life-cam-dot:after { content:"CAM"; position:absolute; top:16px; left:50%; color:#8f2f2a; font:900 8px/1 var(--marker,var(--hand)); transform:translateX(-50%) rotate(-3deg); }
.life-pass-line { position:absolute; z-index:3; left:49%; top:52%; width:37%; height:2px; border-top:3px dashed #ad312b; transform:rotate(-21deg); transform-origin:left center; opacity:.78; }
.life-pass-line:after { content:"›"; position:absolute; right:-2px; top:-11px; color:#ad312b; font:900 20px/1 var(--sans); }
.life-ball { position:absolute; z-index:6; left:48%; top:50%; width:9px; height:9px; border:1px solid #2a2a27; border-radius:50%; background:#fff; box-shadow:inset 2px 1px 0 rgba(0,0,0,.18); }
.life-playmaker { position:absolute; right:9%; top:34%; width:108px; color:#41643b; font:900 12px/1.08 var(--marker,var(--hand)); transform:rotate(-5deg); }

.life-book {
  grid-column:2;
  grid-row:1;
  padding:clamp(18px,2vw,26px);
  background:#fff5c8;
  transform:rotate(.8deg);
}
.life-book:before { content:""; position:absolute; top:-7px; left:45%; width:72px; height:19px; background:rgba(223,200,147,.7); transform:rotate(-3deg); }
.life-book-title { max-width:360px; margin-top:9px!important; font-size:clamp(22px,2.05vw,31px)!important; }
.life-book-fav { color:#9b302a!important; font:900 11px/1 var(--marker,var(--hand))!important; transform:rotate(-2deg); }
.life-margin-notes { display:flex; flex-wrap:wrap; gap:7px; margin-top:15px; }
.life-margin-notes span { padding:5px 7px; border:1px solid rgba(94,76,40,.16); color:#565045; background:rgba(255,255,255,.44); font:800 7px/1 var(--mono); transform:rotate(var(--r,-1deg)); }
.life-margin-notes span:nth-child(2){--r:1.5deg}.life-margin-notes span:nth-child(3){--r:-2deg}
.life-bookmark { position:absolute; top:-4px; right:14%; width:18px; height:64px; background:#9f302a; clip-path:polygon(0 0,100% 0,100% 100%,50% 82%,0 100%); transform-origin:50% 0; }

.life-games {
  grid-column:2;
  grid-row:2;
  padding:clamp(17px,1.8vw,24px);
  background:#e5e7f3;
  transform:rotate(-.45deg);
}
.life-game-stack { display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-top:13px; }
.life-game-ticket { position:relative; min-height:118px; padding:13px 12px 12px; overflow:hidden; background:#fffdf5; box-shadow:2px 4px 9px rgba(53,43,33,.14); transform:rotate(var(--game-r,-1.2deg)); }
.life-game-ticket:nth-child(2){--game-r:1.4deg;background:#e8f0dc}.life-game-ticket small { color:#73706a; font:800 6.5px/1 var(--mono); text-transform:uppercase; letter-spacing:.1em; }
.life-game-ticket strong { display:block; max-width:150px; margin-top:7px; font:900 clamp(16px,1.5vw,22px)/.95 var(--marker,var(--hand)); }
.life-game-ticket em { position:absolute; right:9px; bottom:8px; color:#6f5c83; font:900 10px/1 var(--marker,var(--hand)); font-style:normal; transform:rotate(-4deg); }
.life-controller { position:absolute; right:15px; top:13px; width:50px; height:29px; border:2px solid rgba(79,72,100,.46); border-radius:44% 44% 50% 50%; transform:rotate(5deg); opacity:.74; }
.life-controller:before { content:"+"; position:absolute; left:9px; top:4px; color:#655a78; font:900 15px/1 var(--mono); }.life-controller:after { content:"••"; position:absolute; right:7px; top:4px; color:#655a78; font:900 13px/1 var(--mono); letter-spacing:2px; }

.life-anime {
  grid-column:3;
  grid-row:1 / span 2;
  padding:clamp(18px,1.9vw,27px);
  background:#f2e0df;
  transform:rotate(.65deg);
}
.life-anime-head { display:flex; align-items:flex-start; justify-content:space-between; gap:10px; }
.life-anime-head a { color:#9e302a; font:800 7px/1 var(--mono); text-decoration:none; text-transform:uppercase; letter-spacing:.08em; border-bottom:1px solid currentColor; }
.life-anime-meta { margin-top:4px!important; color:#6d625f!important; }
.life-anime-list { display:grid; gap:8px; margin-top:15px; }
.life-anime-ticket { position:relative; display:grid; grid-template-columns:44px 1fr; gap:9px; align-items:center; min-height:54px; padding:9px 10px 8px 8px; background:#fffaf4; box-shadow:2px 4px 8px rgba(58,42,37,.12); transform:rotate(var(--anime-r,-.55deg)); }
.life-anime-ticket:nth-child(even){--anime-r:.65deg;background:#f9f2d8}.life-anime-score { display:grid; place-items:center; width:38px; height:38px; border:2px solid #a5312b; border-radius:50%; color:#9c302b; font:900 11px/1 var(--marker,var(--hand)); transform:rotate(-5deg); }.life-anime-score small { display:block; margin-top:-5px; font:700 5px/1 var(--mono); }
.life-anime-ticket strong { display:block; font:900 clamp(13px,1.1vw,17px)/1.03 var(--marker,var(--hand)); }.life-anime-ticket span { display:block; margin-top:4px; color:#79716c; font:700 6px/1 var(--mono); text-transform:uppercase; letter-spacing:.09em; }
.life-anime-skeleton { opacity:.55; }.life-anime-skeleton strong { height:8px; width:72%; border-radius:999px; background:rgba(90,73,68,.18); }.life-anime-skeleton span { height:6px; width:42%; border-radius:999px; background:rgba(90,73,68,.11); }
.life-anime-error { margin-top:15px!important; padding:11px; border:1px dashed rgba(157,47,42,.28); background:rgba(255,255,255,.36); }

.life-wind { position:absolute; z-index:2; inset:0; overflow:visible; pointer-events:none; opacity:.46; }
.life-wind path { fill:none; stroke:#5c7e72; stroke-width:1.8; stroke-linecap:round; stroke-dasharray:13 17; vector-effect:non-scaling-stroke; }
.life-wind path:nth-child(2){stroke:#af7831;stroke-width:1.2;opacity:.62}.life-wind path:nth-child(3){stroke:#4f873c;stroke-width:1.1;opacity:.55}
.life-leaf { position:absolute; z-index:6; width:18px; height:8px; border-radius:100% 0 100% 0; background:#6e9356; opacity:.58; pointer-events:none; }
.life-leaf-a { top:16%; right:30%; transform:rotate(22deg); }.life-leaf-b { bottom:7%; left:37%; width:13px; height:6px; background:#b58c42; transform:rotate(-18deg); }
.life-scribble { position:absolute; z-index:7; left:44%; bottom:2%; color:rgba(79,87,62,.7); font:900 10px/1 var(--marker,var(--hand)); transform:rotate(-4deg); }

.life-live-board[data-life-active="true"] .life-united-scarf { animation:lifeScarf 5.8s ease-in-out 1.1s infinite; }
.life-live-board[data-life-active="true"] .life-bookmark { animation:lifeBookmark 4.4s ease-in-out 1.5s infinite; }
.life-live-board[data-life-active="true"] .life-football { animation:lifePaperA 7.2s ease-in-out 1.2s infinite; }
.life-live-board[data-life-active="true"] .life-book { animation:lifePaperB 6.6s ease-in-out 1.45s infinite; }
.life-live-board[data-life-active="true"] .life-games { animation:lifePaperA 8.1s ease-in-out 1.7s infinite reverse; }
.life-live-board[data-life-active="true"] .life-anime { animation:lifePaperB 7.7s ease-in-out 1.35s infinite reverse; }
.life-live-board[data-life-active="true"] .life-wind path { animation:lifeWind 7s linear 1s infinite; }
.life-live-board[data-life-active="true"] .life-wind path:nth-child(2){animation-duration:8.5s;animation-direction:reverse}.life-live-board[data-life-active="true"] .life-wind path:nth-child(3){animation-duration:10s}
.life-live-board[data-life-active="true"] .life-ball { animation:lifeBall 4.8s cubic-bezier(.46,.03,.52,.96) 1.5s infinite; }
.life-live-board[data-life-active="true"] .life-pass-line { animation:lifePassPulse 3.8s ease-in-out 1.4s infinite; }
.life-live-board[data-life-active="true"] .life-leaf-a { animation:lifeLeafA 8.4s ease-in-out 1.2s infinite; }.life-live-board[data-life-active="true"] .life-leaf-b { animation:lifeLeafB 9.6s ease-in-out 2s infinite; }
@keyframes lifeScarf{0%,100%{transform:rotate(2deg) skewX(0)}50%{transform:rotate(.4deg) skewX(-1.2deg)}}
@keyframes lifeBookmark{0%,100%{transform:rotate(0deg)}50%{transform:rotate(4deg)}}
@keyframes lifePaperA{0%,100%{translate:0 0;rotate:-.7deg}50%{translate:0 -2px;rotate:-.25deg}}
@keyframes lifePaperB{0%,100%{translate:0 0;rotate:.65deg}50%{translate:0 -2px;rotate:.15deg}}
@keyframes lifeWind{to{stroke-dashoffset:-120}}
@keyframes lifeBall{0%,18%,100%{transform:translate(0,0)}45%{transform:translate(43px,-16px)}67%{transform:translate(88px,-42px)}82%{transform:translate(118px,-55px)}}
@keyframes lifePassPulse{0%,100%{opacity:.48}45%{opacity:.9}}
@keyframes lifeLeafA{0%,100%{translate:0 0;rotate:22deg}45%{translate:-25px 14px;rotate:70deg}72%{translate:-8px 25px;rotate:128deg}}
@keyframes lifeLeafB{0%,100%{translate:0 0;rotate:-18deg}48%{translate:20px -11px;rotate:27deg}76%{translate:7px -20px;rotate:75deg}}

@media(max-width:900px){
 .life-live-board{padding:28px 26px 24px}.life-header h2{font-size:44px}.life-header p{font-size:8px}.life-united-scarf{width:170px}.life-grid{top:25%;right:3%;left:3%;gap:11px;grid-template-columns:1fr 1fr;grid-template-rows:1.05fr .95fr}.life-football{grid-column:1;grid-row:1}.life-book{grid-column:2;grid-row:1}.life-games{grid-column:1;grid-row:2}.life-anime{grid-column:2;grid-row:2}.life-pitch{height:48%;}.life-anime-list{grid-template-columns:1fr 1fr;gap:6px}.life-anime-ticket{grid-template-columns:34px 1fr;min-height:46px;padding:7px}.life-anime-score{width:31px;height:31px;font-size:9px}.life-anime-ticket strong{font-size:12px}.life-playmaker{display:none}
}
@media(max-width:760px){
 .life-live-board{padding:20px 16px 14px}.life-header{gap:10px}.life-kicker{font-size:7px}.life-header h2{margin-top:5px;font-size:clamp(31px,8vw,40px)}.life-header p{max-width:72%;font-size:7px;line-height:1.38}.life-united-scarf{width:128px;min-width:0;padding:7px 8px 6px;border-block-width:4px;font-size:11px}.life-grid{top:23.5%;bottom:3.5%;gap:8px}.life-card{box-shadow:2px 4px 9px rgba(59,43,27,.13)}.life-football,.life-book,.life-games,.life-anime{padding:12px 11px}.life-card-label{font-size:5.7px}.life-card h3{margin:5px 0 4px;font-size:18px}.life-card p{font-size:6.2px;line-height:1.3}.life-cam-tag{padding:4px 6px;font-size:10px}.life-pitch{right:8%;bottom:6%;left:8%;height:43%}.life-player{width:7px;height:7px}.life-cam-dot{width:10px;height:10px;border-width:2px}.life-cam-dot:after{top:11px;font-size:6px}.life-pass-line{border-top-width:2px}.life-book-title{font-size:16px!important}.life-book-fav{font-size:8px!important}.life-margin-notes{gap:4px;margin-top:8px}.life-margin-notes span{padding:3px 4px;font-size:5.4px}.life-bookmark{right:10%;width:13px;height:43px}.life-game-stack{gap:6px;margin-top:7px}.life-game-ticket{min-height:77px;padding:8px}.life-game-ticket small{font-size:5px}.life-game-ticket strong{margin-top:4px;font-size:13px}.life-game-ticket em{right:5px;bottom:5px;font-size:7px}.life-controller{display:none}.life-anime-head a{font-size:5.4px}.life-anime-meta{display:none}.life-anime-list{margin-top:7px;gap:4px}.life-anime-ticket{grid-template-columns:26px 1fr;min-height:38px;padding:5px}.life-anime-score{width:24px;height:24px;border-width:1px;font-size:7px}.life-anime-score small{font-size:4px}.life-anime-ticket strong{font-size:9px}.life-anime-ticket span{margin-top:2px;font-size:4.6px}.life-scribble{display:none}.life-leaf{opacity:.42}
}
@media(max-width:520px){.life-header p{display:none}.life-grid{top:21.5%}.life-united-scarf{width:105px;font-size:9px}.life-margin-notes span:nth-child(3){display:none}.life-anime-ticket:nth-child(n+4){display:none}.life-pitch{height:39%}}
@media(prefers-reduced-motion:reduce){.life-live-board *{animation:none!important}.life-wind path{stroke-dashoffset:0!important}.life-ball{transform:none!important}}
`;

async function loadAniList(): Promise<AnimeCache> {
  const cached = window.localStorage.getItem(ANILIST_CACHE_KEY);
  if (cached) {
    try {
      const parsed = JSON.parse(cached) as AnimeCache;
      if (Date.now() - parsed.savedAt < ANILIST_CACHE_TTL && parsed.favorites?.length) return parsed;
    } catch {
      window.localStorage.removeItem(ANILIST_CACHE_KEY);
    }
  }

  const query = `
    query LifeBoardAnime($name: String) {
      MediaListCollection(userName: $name, type: ANIME) {
        lists {
          entries {
            status
            score(format: POINT_100)
            media { id siteUrl title { english romaji } }
          }
        }
      }
      User(name: $name) { statistics { anime { count meanScore } } }
    }
  `;

  const response = await fetch("https://graphql.anilist.co", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ query, variables: { name: "enixes" } }),
  });
  if (!response.ok) throw new Error(`AniList ${response.status}`);

  const payload = (await response.json()) as {
    data?: {
      MediaListCollection?: { lists?: Array<{ entries?: Array<{ status?: string; score?: number; media?: { id: number; siteUrl?: string; title?: { english?: string | null; romaji?: string | null } } }> }> };
      User?: { statistics?: { anime?: AnimeStats } };
    };
  };

  const entries = payload.data?.MediaListCollection?.lists?.flatMap((list) => list.entries ?? []) ?? [];
  const seen = new Set<number>();
  const favorites = entries
    .filter((entry) => entry.status === "COMPLETED" && (entry.score ?? 0) > 0 && entry.media)
    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
    .filter((entry) => {
      const id = entry.media!.id;
      if (seen.has(id)) return false;
      seen.add(id);
      return true;
    })
    .slice(0, 4)
    .map((entry) => ({
      id: entry.media!.id,
      title: entry.media!.title?.english || entry.media!.title?.romaji || "Untitled",
      score: Math.round(entry.score ?? 0),
      siteUrl: entry.media!.siteUrl || ANILIST_PROFILE,
    }));

  const result: AnimeCache = {
    savedAt: Date.now(),
    favorites,
    stats: payload.data?.User?.statistics?.anime ?? null,
  };
  if (favorites.length) window.localStorage.setItem(ANILIST_CACHE_KEY, JSON.stringify(result));
  return result;
}

export function LifeBoardPortal() {
  const [target, setTarget] = useState<HTMLElement | null>(null);
  const [favorites, setFavorites] = useState<AnimeFavorite[]>([]);
  const [animeStats, setAnimeStats] = useState<AnimeStats | null>(null);
  const [animeState, setAnimeState] = useState<"loading" | "ready" | "error">("loading");
  const boardRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const title = document.getElementById("life-board-story-title");
    const surface = title?.closest<HTMLElement>(".story-board-surface") ?? null;
    if (!surface) return;
    surface.classList.add("life-live-mounted");
    setTarget(surface);
    return () => {
      surface.classList.remove("life-live-mounted");
      setTarget(null);
    };
  }, []);

  useEffect(() => {
    if (!target) return;
    let cancelled = false;
    loadAniList()
      .then((data) => {
        if (cancelled) return;
        setFavorites(data.favorites);
        setAnimeStats(data.stats);
        setAnimeState(data.favorites.length ? "ready" : "error");
      })
      .catch(() => !cancelled && setAnimeState("error"));
    return () => { cancelled = true; };
  }, [target]);

  useEffect(() => {
    const board = boardRef.current;
    if (!board || !target) return;
    const panel = target.closest<HTMLElement>("[data-board-panel]") ?? target;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let intro: gsap.core.Timeline | null = null;

    const playIntro = () => {
      board.dataset.lifeActive = "true";
      if (reduced.matches) return;
      intro?.kill();
      const reveal = board.querySelectorAll<HTMLElement>("[data-life-reveal]");
      const tickets = board.querySelectorAll<HTMLElement>(".life-anime-ticket");
      intro = gsap.timeline({ defaults: { overwrite: "auto" } });
      intro.fromTo(board.querySelector(".life-header-copy"), { y: 13, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: .34, ease: "power2.out" }, 0)
        .fromTo(board.querySelector(".life-united-scarf"), { x: 20, rotation: 7, autoAlpha: 0 }, { x: 0, rotation: 2, autoAlpha: 1, duration: .36, ease: "back.out(1.35)" }, .04)
        .fromTo(reveal, { y: 16, rotation: (i) => i % 2 ? 2.4 : -2.2, autoAlpha: 0, scale: .975 }, { y: 0, rotation: 0, autoAlpha: 1, scale: 1, duration: .38, stagger: .055, ease: "power2.out" }, .12)
        .fromTo(tickets, { x: 13, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: .26, stagger: .045, ease: "power1.out" }, .34);
    };

    const stopAmbient = () => {
      board.dataset.lifeActive = "false";
      intro?.kill();
      intro = null;
    };

    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => entry.intersectionRatio > .52 ? playIntro() : stopAmbient()),
      { threshold: [.2, .52, .78] },
    );
    observer.observe(panel);

    let pointerFrame = 0;
    const handlePointer = (event: PointerEvent) => {
      if (board.dataset.lifeActive !== "true") return;
      if (pointerFrame) cancelAnimationFrame(pointerFrame);
      pointerFrame = requestAnimationFrame(() => {
        const rect = board.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / Math.max(1, rect.width) - .5) * 2;
        const y = ((event.clientY - rect.top) / Math.max(1, rect.height) - .5) * 2;
        board.style.setProperty("--life-x", x.toFixed(3));
        board.style.setProperty("--life-y", y.toFixed(3));
      });
    };
    panel.addEventListener("pointermove", handlePointer, { passive: true });

    return () => {
      observer.disconnect();
      panel.removeEventListener("pointermove", handlePointer);
      cancelAnimationFrame(pointerFrame);
      intro?.kill();
      gsap.killTweensOf(board.querySelectorAll("*"));
    };
  }, [target]);

  if (!target) return null;

  const boardStyle = { "--life-x": 0, "--life-y": 0 } as CSSProperties;

  return createPortal(
    <>
      <style>{styles}</style>
      <div ref={boardRef} className="life-live-board" data-life-active="false" style={boardStyle}>
        <svg className="life-wind" viewBox="0 0 1200 760" preserveAspectRatio="none" aria-hidden="true">
          <path d="M1184 108 C1068 68 940 130 852 118 C756 105 717 45 625 58" />
          <path d="M1107 198 C1005 167 931 202 851 227 C737 263 663 224 596 191" />
          <path d="M62 641 C180 596 260 616 337 650 C405 681 471 674 530 641" />
        </svg>
        <i className="life-leaf life-leaf-a" aria-hidden="true" />
        <i className="life-leaf life-leaf-b" aria-hidden="true" />

        <header className="life-header">
          <div className="life-header-copy">
            <span className="life-kicker">Case board / 03 · off the clock</span>
            <h2>Life, between the lines.</h2>
            <p>Football, books, anime and games — the things I disappear into when I am not debugging a system. <em>Less roadmap. More curiosity.</em></p>
          </div>
          <div className="life-united-scarf" aria-label="Manchester United supporter">Manchester United</div>
        </header>

        <div className="life-grid">
          <section className="life-card life-football" data-life-reveal aria-label="Football">
            <span className="board-pin pin-green" aria-hidden="true" />
            <div className="life-football-head">
              <div><span className="life-card-label">Football / playmaker</span><h3>Give me the <strong>#10</strong> space.</h3></div>
              <span className="life-cam-tag">CAM</span>
            </div>
            <p className="life-football-note">Manchester United supporter. I love playing as the attacking midfielder — receive between the lines, turn, and find the final ball.</p>
            <span className="life-playmaker">scan → turn → create</span>
            <div className="life-pitch" aria-hidden="true">
              <i className="life-box life-box-left" /><i className="life-box life-box-right" />
              <i className="life-player" /><i className="life-player" /><i className="life-player" /><i className="life-player" />
              <i className="life-cam-dot" /><i className="life-pass-line" /><i className="life-ball" />
            </div>
          </section>

          <section className="life-card life-book" data-life-reveal aria-label="Books">
            <span className="board-pin pin-yellow" aria-hidden="true" />
            <i className="life-bookmark" aria-hidden="true" />
            <span className="life-card-label">Reading / favourite so far</span>
            <h3 className="life-book-title">The Almanack of Naval Ravikant</h3>
            <p className="life-book-fav">the current #1 on my shelf</p>
            <div className="life-margin-notes" aria-label="Ideas on the margin">
              <span>specific knowledge</span><span>leverage</span><span>judgment</span>
            </div>
          </section>

          <section className="life-card life-games" data-life-reveal aria-label="Games">
            <span className="board-pin pin-blue" aria-hidden="true" />
            <span className="life-card-label">Games / worlds worth getting lost in</span>
            <div className="life-controller" aria-hidden="true" />
            <div className="life-game-stack">
              <article className="life-game-ticket"><small>Hyrule / exploration</small><strong>Breath of the Wild</strong><em>wander ↗</em></article>
              <article className="life-game-ticket"><small>The Continent / story</small><strong>The Witcher 3</strong><em>choose →</em></article>
            </div>
          </section>

          <section className="life-card life-anime" data-life-reveal aria-label="Anime favourites">
            <span className="board-pin" aria-hidden="true" />
            <div className="life-anime-head">
              <div><span className="life-card-label">Anime / top shelf</span><h3>Highest scored.</h3></div>
              <a href={ANILIST_PROFILE} target="_blank" rel="noreferrer">AniList ↗</a>
            </div>
            <p className="life-anime-meta">{animeStats ? `${animeStats.count} titles tracked · ${animeStats.meanScore.toFixed(1)} mean` : "pulled from my AniList scores"}</p>
            <div className="life-anime-list">
              {animeState === "ready" && favorites.map((anime) => (
                <a className="life-anime-ticket" href={anime.siteUrl} target="_blank" rel="noreferrer" key={anime.id}>
                  <span className="life-anime-score">{anime.score}<small>/100</small></span>
                  <span><strong>{anime.title}</strong><span>completed · top rated</span></span>
                </a>
              ))}
              {animeState === "loading" && [0, 1, 2, 3].map((index) => (
                <div className="life-anime-ticket life-anime-skeleton" key={index}><span className="life-anime-score">…</span><span><strong /><span /></span></div>
              ))}
            </div>
            {animeState === "error" && <p className="life-anime-error">AniList is taking a break. The profile link above still has the full list.</p>}
          </section>
        </div>

        <span className="life-scribble">same brain, different rabbit holes →</span>
      </div>
    </>,
    target,
  );
}
