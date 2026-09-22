"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Footballer, Reader } from "./LifeBoardDoodles";
import { AlchemyPostcard, FrierenPostcard, HyrulePostcard, LifePostcard, VolleyballPostcard, WitcherPostcard } from "./LifePostcards";
import { useLifeBoardMotion } from "./useLifeBoardMotion";
import "./life-board.css";

const ANILIST_PROFILE = "https://anilist.co/user/enixes";

export function LifeBoardPortal() {
  const [target, setTarget] = useState<HTMLElement | null>(null);
  const [board, setBoard] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    const title = document.getElementById("life-board-story-title");
    const surface = title?.closest<HTMLElement>(".story-board-surface");
    if (!surface) return;
    // Keep the existing portal host, board label, and spatial camera untouched.
    surface.classList.add("life-live-mounted");
    const frame = requestAnimationFrame(() => setTarget(surface));
    return () => {
      cancelAnimationFrame(frame);
      surface.classList.remove("life-live-mounted");
    };
  }, []);

  useLifeBoardMotion(board);

  if (!target) return null;

  return createPortal(
    <div ref={setBoard} className="life-live-board" aria-label="Life, between the lines">
      <header className="life-header">
        <div className="life-header-copy">
          <span className="life-kicker">Case board / 03 · off the clock</span>
          <h2>Life, between the lines.</h2>
          <p>Football, books, anime and games — the things I disappear into when I am not debugging a system. <em>Less roadmap. More curiosity.</em></p>
        </div>
        <div className="life-united-scarf" aria-label="Manchester United supporter">Manchester United</div>
      </header>

      <div className="life-grid">
        <section className="life-card life-football" data-life-scene="football" tabIndex={0} aria-labelledby="life-football-title">
          <span className="board-pin pin-green" aria-hidden="true" />
          <div className="life-football-head">
            <div><span className="life-card-label">Football / playmaker</span><h3 id="life-football-title">Give me the <strong>#10</strong> space.</h3></div>
            <span className="life-cam-tag">CAM</span>
          </div>
          <p className="life-football-note">Manchester United supporter. I love playing as the attacking midfielder — receive between the lines, turn, and find the final ball.</p>
          <span className="life-playmaker">scan → turn → create</span>
          <div className="life-pitch" aria-hidden="true">
            <i className="life-box life-box-left" /><i className="life-box life-box-right" />
            <i className="life-motion life-player" /><i className="life-motion life-player" /><i className="life-motion life-player" /><i className="life-motion life-player" />
            <i className="life-motion life-cam-dot" /><i className="life-motion life-pass-line" /><i className="life-motion life-ball" />
          </div>
          <Footballer />
        </section>

        <section className="life-card life-book" data-life-scene="books" tabIndex={0} aria-labelledby="life-book-title">
          <span className="board-pin pin-yellow" aria-hidden="true" />
          <i className="life-motion life-bookmark" aria-hidden="true" />
          <span className="life-card-label">Reading / favourite so far</span>
          <h3 id="life-book-title">The Almanack of Naval Ravikant</h3>
          <p className="life-book-fav">the current #1 on my shelf</p>
          <div className="life-margin-notes" aria-label="Ideas on the margin"><span className="life-motion">specific knowledge</span><span className="life-motion">leverage</span><span className="life-motion">judgment</span></div>
          <Reader />
          <span className="life-book-margin" aria-hidden="true">a few pages,<br />a better question.</span>
        </section>

        <section className="life-card life-games" aria-labelledby="life-games-title">
          <span className="board-pin pin-blue" aria-hidden="true" />
          <span className="life-card-label">Games / worlds worth getting lost in</span>
          <h3 id="life-games-title">The scenic route.</h3>
          <div className="life-game-stack">
            <LifePostcard subject="botw" place="Hyrule / field notes" title="Breath of the Wild" note="No hurry. Just one more hill."><HyrulePostcard /></LifePostcard>
            <LifePostcard subject="witcher" place="The Continent / contracts" title="The Witcher 3" note="A good story rarely has an easy choice."><WitcherPostcard /></LifePostcard>
          </div>
        </section>

        <section className="life-card life-anime" aria-labelledby="life-anime-title">
          <span className="board-pin" aria-hidden="true" />
          <div className="life-anime-head">
            <div><span className="life-card-label">Anime / permanent favourites</span><h3 id="life-anime-title">These stay with me.</h3></div>
            <a href={ANILIST_PROFILE} target="_blank" rel="noreferrer">full list ↗</a>
          </div>
          <div className="life-anime-list">
            <LifePostcard subject="fma" place="01 / equivalent exchange" title="Fullmetal Alchemist" note="What we give. What we keep."><AlchemyPostcard /></LifePostcard>
            <LifePostcard subject="frieren" place="02 / beyond the journey" title="Frieren" note="The little things, remembered."><FrierenPostcard /></LifePostcard>
            <LifePostcard subject="haikyuu" place="03 / one more point" title="Haikyuu!!" note="A whole world on one court."><VolleyballPostcard /></LifePostcard>
          </div>
        </section>
      </div>
      <footer className="life-footer"><span>same brain, different rabbit holes →</span><span>Hover or focus a sketch to bring it to life.</span></footer>
    </div>,
    target,
  );
}
