"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

type Targets = {
  board: HTMLElement;
  football: HTMLElement | null;
  book: HTMLElement | null;
  games: HTMLElement | null;
  gameTickets: HTMLElement[];
  anime: HTMLElement | null;
};

const styles = `
.life-football,.life-book,.life-games,.life-anime,.life-game-ticket{container-type:inline-size}
.life-doodle{position:absolute;z-index:5;pointer-events:none;mix-blend-mode:multiply;opacity:.82;filter:none}
.life-doodle svg{display:block;width:100%;height:auto;overflow:visible}
.life-doodle-line,.life-doodle-soft,.life-doodle-accent{fill:none;stroke-linecap:round;stroke-linejoin:round;vector-effect:non-scaling-stroke;stroke-dasharray:1;stroke-dashoffset:1}
.life-doodle-line{stroke:#3f4f46;stroke-width:2.15}.life-doodle-soft{stroke:#63756d;stroke-width:1.2;opacity:.5}.life-doodle-accent{stroke:#9e302a;stroke-width:2.1}.life-doodle-wash{opacity:0}
.life-live-board[data-life-active="true"] .life-doodle-line,
.life-live-board[data-life-active="true"] .life-doodle-soft,
.life-live-board[data-life-active="true"] .life-doodle-accent{animation:lifeDoodleInk 9.4s cubic-bezier(.2,.74,.2,1) var(--doodle-delay,0s) infinite}
.life-live-board[data-life-active="true"] .life-doodle-soft{--doodle-delay:.16s}.life-live-board[data-life-active="true"] .life-doodle-accent{--doodle-delay:.28s}
.life-live-board[data-life-active="true"] .life-doodle-wash{animation:lifeDoodleWash 9.4s ease-in-out .55s infinite}
@keyframes lifeDoodleInk{0%,7%{stroke-dashoffset:1;opacity:0}18%,67%{stroke-dashoffset:0;opacity:1}78%{stroke-dashoffset:0;opacity:.58}90%,100%{stroke-dashoffset:-1;opacity:0}}
@keyframes lifeDoodleWash{0%,24%{opacity:0;transform:scale(.88)}38%,67%{opacity:.12;transform:scale(1)}84%,100%{opacity:0;transform:scale(1.03)}}

.life-doodle-football{right:4%;bottom:4%;width:min(34%,132px);transform:rotate(3deg)}
.life-doodle-book{right:4%;bottom:6%;width:min(36%,110px);transform:rotate(-4deg)}
.life-doodle-link{right:2%;bottom:0;width:min(49%,98px);transform:rotate(1deg)}
.life-doodle-geralt{right:-2%;bottom:-3%;width:min(52%,102px);transform:rotate(-2deg)}
.life-doodle-anime{right:3%;bottom:2%;width:min(38%,126px);transform:rotate(2deg);opacity:.72}
.life-doodle-anime-label{position:absolute;right:3px;bottom:-1px;color:#77545a;font:900 8px/1 var(--marker,var(--hand));transform:rotate(-5deg)}

.life-anime-ticket{grid-template-columns:66px 1fr!important;min-height:72px!important;padding:9px 12px 9px 8px!important;gap:11px!important}
.life-anime-score{width:58px!important;height:58px!important;border-width:3px!important;font-size:19px!important;line-height:.88!important;background:rgba(255,253,245,.76)!important;box-shadow:0 1px 0 rgba(255,255,255,.7) inset}
.life-anime-score small{margin-top:-7px!important;font-size:7px!important;letter-spacing:.02em!important}
.life-anime-ticket strong{font-size:clamp(14px,1.16vw,18px)!important}

@container (max-width:250px){.life-doodle-book,.life-doodle-anime{display:none}.life-anime-ticket{grid-template-columns:54px 1fr!important}.life-anime-score{width:47px!important;height:47px!important;font-size:15px!important}.life-anime-score small{font-size:6px!important}}
@container (max-width:205px){.life-doodle-football,.life-doodle-link,.life-doodle-geralt{display:none}}
@media(max-width:900px){.life-doodle-anime{display:none}.life-doodle-football{width:94px}.life-doodle-book{width:74px}.life-anime-ticket{grid-template-columns:52px 1fr!important;min-height:58px!important}.life-anime-score{width:46px!important;height:46px!important;font-size:15px!important}.life-anime-score small{font-size:6px!important}}
@media(max-width:760px){.life-doodle-book{display:none}.life-doodle-link,.life-doodle-geralt{width:62px;opacity:.66}.life-doodle-football{width:70px;opacity:.64}.life-anime-ticket{grid-template-columns:46px 1fr!important;min-height:52px!important;padding:6px!important;gap:6px!important}.life-anime-score{width:40px!important;height:40px!important;font-size:13px!important;border-width:2px!important}.life-anime-score small{font-size:5px!important;margin-top:-5px!important}.life-anime-ticket strong{font-size:10px!important}}
@media(max-width:520px){.life-doodle{display:none!important}.life-anime-ticket{grid-template-columns:43px 1fr!important}.life-anime-score{width:38px!important;height:38px!important;font-size:12px!important}}
@media(prefers-reduced-motion:reduce){.life-doodle-line,.life-doodle-soft,.life-doodle-accent{stroke-dashoffset:0!important;animation:none!important}.life-doodle-wash{opacity:.08!important;animation:none!important}}
`;

function Footballer() {
  return <div className="life-doodle life-doodle-football" aria-hidden="true"><svg viewBox="0 0 150 170">
    <path className="life-doodle-wash" fill="#b7cf93" d="M49 31c17-12 38-9 49 4l-8 36 20 35-20 53H57L43 103l17-34z"/>
    <path className="life-doodle-line" pathLength="1" d="M70 16c8-5 20-2 24 6 4 9 0 20-8 24-10 4-21-1-24-10-3-8 1-16 8-20Zm-11 35 27-1 13 39-16 20-2 45M65 79 48 111l-18 25M89 83l22 24 20 11M55 63 36 79l-16 4"/>
    <path className="life-doodle-soft" pathLength="1" d="M67 51c8 9 14 13 23 13M51 111c12 4 22 9 31 18M21 84c9 2 18 5 25 10"/>
    <path className="life-doodle-accent" pathLength="1" d="M60 55 81 51 93 86 71 93Zm4 9 16 1M72 66v17M69 73h8"/>
    <circle className="life-doodle-accent" pathLength="1" cx="120" cy="132" r="12"/>
    <path className="life-doodle-soft" pathLength="1" d="M108 132h24M120 120v24M112 124l16 16M128 124l-16 16"/>
    <text x="68" y="82" fill="#9e302a" fontSize="15" fontWeight="900" textAnchor="middle">10</text>
  </svg></div>;
}

function Reader() {
  return <div className="life-doodle life-doodle-book" aria-hidden="true"><svg viewBox="0 0 130 110">
    <path className="life-doodle-wash" fill="#dfbd62" d="M8 47c22-11 39-9 57 1 17-10 36-13 57-2l-6 49c-17-8-34-5-50 4-15-9-32-12-52-4z"/>
    <path className="life-doodle-line" pathLength="1" d="M9 45c20-9 38-7 56 3 18-10 37-12 56-3l-5 47c-17-7-34-4-51 5-16-9-33-12-51-5Zm56 3v49"/>
    <path className="life-doodle-soft" pathLength="1" d="M19 55c13-3 25-1 37 5M18 66c13-3 26-1 38 5M74 57c13-5 25-6 37-2M74 69c13-5 25-6 37-2"/>
    <path className="life-doodle-accent" pathLength="1" d="M43 24c5-12 13-18 24-18 10 0 18 6 22 17M56 27c7 4 15 4 22 0M54 21c3-4 7-5 11-2M73 19c4-2 8-1 11 2"/>
  </svg></div>;
}

function LinkDoodle() {
  return <div className="life-doodle life-doodle-link" aria-hidden="true"><svg viewBox="0 0 115 170">
    <path className="life-doodle-wash" fill="#8fb26e" d="M49 28 72 35l17 44-12 51-39 3-13-48 13-39z"/>
    <path className="life-doodle-line" pathLength="1" d="M51 17c8-8 19-6 25 1l-6 14 13 18 4 37-14 44M51 17l-11 16 9 13-17 27-5 50M42 52l-16 25-15 6M74 51l18 23 13 4M46 132l-9 25M73 132l11 24"/>
    <path className="life-doodle-soft" pathLength="1" d="M49 18 38 10M75 20l13-7M33 71c16 5 31 4 47-3M28 84c18 11 37 11 58 3"/>
    <path className="life-doodle-accent" pathLength="1" d="M78 62c15 3 23 12 24 27-4 15-13 24-28 27-15-3-24-12-27-27 3-14 13-23 31-27Zm-2 7v39M58 88h39"/>
    <path className="life-doodle-line" pathLength="1" d="M78 45 98 20M95 21l8-11M38 48 17-20"/>
  </svg></div>;
}

function GeraltDoodle() {
  return <div className="life-doodle life-doodle-geralt" aria-hidden="true"><svg viewBox="0 0 120 174">
    <path className="life-doodle-wash" fill="#b9b9c7" d="M44 28 74 25l17 30-8 72-46 5-11-70z"/>
    <path className="life-doodle-line" pathLength="1" d="M47 15c9-7 20-5 27 1 5 7 4 16-1 23-9 8-20 8-29 0-5-7-4-17 3-24Zm-5 31 35-2 12 49-11 39M41 46 27 91l9 41M47 133l-8 27M76 132l8 29"/>
    <path className="life-doodle-soft" pathLength="1" d="M47 20c9 5 18 5 27 0M42 31c10-3 21-3 32 0M34 78c18 7 35 7 52 0"/>
    <path className="life-doodle-accent" pathLength="1" d="M61 56c6 8 10 15 11 23-4 7-8 11-12 13-6-4-11-9-14-15 4-8 8-15 15-21Zm-8 17 8 12 7-12"/>
    <path className="life-doodle-line" pathLength="1" d="M74 47 103 10M83 53l28-34M96 18l10-8M104 27l10-8"/>
  </svg></div>;
}

function AnimeDoodle() {
  return <div className="life-doodle life-doodle-anime" aria-hidden="true"><svg viewBox="0 0 150 165">
    <path className="life-doodle-wash" fill="#d6a9b2" d="M37 44c18-27 58-28 78-2l-4 58-32 37-37-24-15-42z"/>
    <path className="life-doodle-line" pathLength="1" d="M44 39c10-17 24-25 42-23 15 2 27 10 34 24-3 9-8 16-14 22M45 39c-10 10-15 23-14 38 2 23 18 39 42 47M106 62c2 19-6 37-24 52"/>
    <path className="life-doodle-soft" pathLength="1" d="M47 51c11-7 21-9 31-5M88 46c10-2 20 1 28 8M52 68c6 7 13 8 20 1M88 69c6 6 13 6 19 0M73 84c6 4 12 4 18 0"/>
    <path className="life-doodle-accent" pathLength="1" d="M38 41 23 20M48 32 37 8M101 31l13-21M111 42l18-18M56 104c14 7 27 7 40-1"/>
    <path className="life-doodle-soft" pathLength="1" d="M34 119c24 14 49 20 76 14M49 129c8 10 17 18 28 24M98 127c-5 12-12 21-22 28"/>
  </svg><span className="life-doodle-anime-label">manga margin</span></div>;
}

export function LifeBoardDoodles() {
  const [targets, setTargets] = useState<Targets | null>(null);

  useEffect(() => {
    let frame = 0;
    let observer: MutationObserver | null = null;
    const discover = () => {
      const board = document.querySelector<HTMLElement>(".life-live-board");
      if (!board) {
        frame = window.requestAnimationFrame(discover);
        return;
      }
      const gameTickets = Array.from(board.querySelectorAll<HTMLElement>(".life-game-ticket"));
      setTargets({
        board,
        football: board.querySelector<HTMLElement>(".life-football"),
        book: board.querySelector<HTMLElement>(".life-book"),
        games: board.querySelector<HTMLElement>(".life-games"),
        gameTickets,
        anime: board.querySelector<HTMLElement>(".life-anime"),
      });
      observer = new MutationObserver(() => {
        const tickets = Array.from(board.querySelectorAll<HTMLElement>(".life-game-ticket"));
        if (tickets.length !== gameTickets.length) {
          setTargets((current) => current ? { ...current, gameTickets: tickets } : current);
        }
      });
      observer.observe(board, { childList: true, subtree: true });
    };
    discover();
    return () => {
      window.cancelAnimationFrame(frame);
      observer?.disconnect();
    };
  }, []);

  if (!targets) return null;

  return <>
    {createPortal(<style>{styles}</style>, targets.board)}
    {targets.football && createPortal(<Footballer />, targets.football)}
    {targets.book && createPortal(<Reader />, targets.book)}
    {targets.gameTickets[0] && createPortal(<LinkDoodle />, targets.gameTickets[0])}
    {targets.gameTickets[1] && createPortal(<GeraltDoodle />, targets.gameTickets[1])}
    {targets.anime && createPortal(<AnimeDoodle />, targets.anime)}
  </>;
}
