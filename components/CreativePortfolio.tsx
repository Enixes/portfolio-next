import Image from "next/image";
import { cv } from "@/data/cv";
import { CreativePortfolioController } from "@/components/CreativePortfolioController";

type IconName = "terminal" | "bolt" | "shield" | "brain" | "book" | "mail" | "github" | "linkedin" | "arrow" | "cache" | "chart" | "compass";

const iconPaths: Record<IconName, string[]> = {
  terminal: ["M4 5h16v14H4z", "m7 9 3 3-3 3", "M12 15h5"],
  bolt: ["m13 2-7 11h6l-1 9 7-12h-6z"],
  shield: ["M12 3 5 6v5c0 5 3 8 7 10 4-2 7-5 7-10V6z", "m9 12 2 2 4-5"],
  brain: ["M9 5a3 3 0 0 0-5 2.2A3 3 0 0 0 5 12a3 3 0 0 0 4 4", "M15 5a3 3 0 0 1 5 2.2A3 3 0 0 1 19 12a3 3 0 0 1-4 4", "M9 5v14M15 5v14", "M9 9H7M15 9h2M9 15H7M15 15h2"],
  book: ["M4 5.5A3.5 3.5 0 0 1 7.5 2H11v17H7.5A3.5 3.5 0 0 0 4 22z", "M20 5.5A3.5 3.5 0 0 0 16.5 2H13v17h3.5A3.5 3.5 0 0 1 20 22z"],
  mail: ["M3 5h18v14H3z", "m4 8 5 4 5-4"],
  github: ["M12 2a10 10 0 0 0-3.2 19.5c.5.1.7-.2.7-.5v-2c-2.9.6-3.5-1.2-3.5-1.2-.5-1.2-1.2-1.5-1.2-1.5-1-.7.1-.7.1-.7 1.1.1 1.7 1.2 1.7 1.2 1 .1 1.6-.7 2-.9.1-.7.4-1.2.7-1.5-2.3-.3-4.7-1.1-4.7-5A3.9 3.9 0 0 1 7 8c-.1-.3-.5-1.6.1-3.2 0 0 1-.3 3.3 1.2A11.6 11.6 0 0 1 12 5.6c1 0 2 .1 3 .4 2.3-1.5 3.3-1.2 3.3-1.2.6 1.6.2 2.9.1 3.2a3.9 3.9 0 0 1 1 2.7c0 3.9-2.4 4.7-4.7 5 .4.3.7 1 .7 2v3.3c0 .3.2.6.7.5A10 10 0 0 0 12 2z"],
  linkedin: ["M5 9v10M5 5v.1M10 19V9h4v2c1-2 5-2 5 2v6M10 13c0-3 9-5 9 0"],
  arrow: ["M5 12h14", "m14 7 5 5-5 5"],
  cache: ["M4 7c0 2 4 3 8 3s8-1 8-3-4-3-8-3-8 1-8 3Z", "v5c0 2 4 3 8 3s8-1 8-3V7", "v5c0 2 4 3 8 3s8-1 8-3"],
  chart: ["M4 20V10M10 20V4M16 20v-7M22 20H2"],
  compass: ["M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z", "m15 9-2 5-5 2 2-5z"],
};

function Icon({ name }: { name: IconName }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="cw-icon">
      {iconPaths[name].map((path, index) => (
        <path key={`${name}-${index}`} d={path} />
      ))}
    </svg>
  );
}

const outcomes = [
  { value: "20×", label: "trade throughput", note: "Java concurrency refactor", icon: "bolt" as const },
  { value: "50×", label: "supported workflows", note: "off-heap persistent cache", icon: "cache" as const },
  { value: "90%", label: "downtime removed", note: "automatic recovery path", icon: "shield" as const },
];

const noteCards = [
  ["Failure paths first", "Design the recovery story before the happy path.", "red"],
  ["Measure before myth", "p99, queue depth, replay cost, then opinions.", "blue"],
  ["Keep systems legible", "The person on-call should understand the map at 3 AM.", "green"],
  ["AI needs rails", "Agents are production software: observable, bounded, interruptible.", "yellow"],
] as const;

export function CreativePortfolio() {
  return (
    <main className="cw-site" data-creative-portfolio>
      <CreativePortfolioController />

      <header className="cw-topbar">
        <a href="#home" className="cw-brand" aria-label="Asu Singh portfolio home">
          <span className="cw-brand-dot" />
          <span>ASU / SYSTEMS LAB</span>
        </a>
        <nav className="cw-nav" aria-label="Primary navigation">
          <a href="#work">Work</a>
          <a href="#lab">Lab</a>
          <a href="#notes">Notes</a>
          <a href="#contact">Contact</a>
        </nav>
        <a className="cw-signal" href={`mailto:${cv.email}`}>
          <span /> open channel
        </a>
      </header>

      <section id="home" className="cw-hero" data-section-id="home" data-parallax-scene>
        <Image className="cw-room cw-room-back" src="/war-room-environment-anime.jpg" alt="" fill sizes="100vw" priority />
        <div className="cw-room-vignette" />
        <div className="cw-grid-floor" data-parallax="0.03" />
        <div className="cw-dust cw-dust-a" />
        <div className="cw-dust cw-dust-b" />

        <div className="cw-hero-copy" data-parallax="-0.035" data-reveal>
          <p className="cw-kicker"><span>Case file 00</span> Senior Software Engineer</p>
          <h1>I build systems that stay <em>fast</em> when reality gets messy.</h1>
          <p className="cw-lede">High-throughput backend systems, production recovery, off-heap caching, and agentic AI — mapped like an evidence wall instead of a résumé.</p>
          <div className="cw-hero-actions">
            <a href="#work" className="cw-btn cw-btn-primary">Enter the war room <Icon name="arrow" /></a>
            <a href={cv.github} target="_blank" rel="noreferrer" className="cw-btn cw-btn-ghost"><Icon name="github" /> GitHub</a>
          </div>
        </div>

        <div className="cw-board-wrap" data-reveal>
          <div className="cw-board-frame">
            <div className="cw-board">
              <div className="cw-board-spotlight" />
              <p className="cw-board-label">ACTIVE INVESTIGATION / PRODUCTION SYSTEMS</p>
              <p className="cw-board-date">Mapped 2026 · Noida / India</p>

              <div className="cw-thread cw-thread-1" /><div className="cw-thread cw-thread-2" /><div className="cw-thread cw-thread-3" /><div className="cw-thread cw-thread-4" />
              <span className="cw-pin cw-pin-a" /><span className="cw-pin cw-pin-b" /><span className="cw-pin cw-pin-c" /><span className="cw-pin cw-pin-d" />

              <article className="cw-paper cw-profile-card" data-parallax="0.025">
                <span className="cw-tape" />
                <Image src="https://avatars.githubusercontent.com/u/20127633?s=320&v=4" alt="Asu Singh" width={320} height={320} sizes="180px" referrerPolicy="no-referrer" />
                <div><small>SUBJECT / 01</small><strong>Asu Singh</strong><span>systems engineer</span></div>
              </article>

              <article className="cw-sticky cw-thesis" data-parallax="-0.018">
                <span className="cw-thumbtack" />
                <small>WORKING THESIS</small>
                <strong>Complexity is fine.<br />Mystery is not.</strong>
                <p>trace → measure → recover</p>
              </article>

              <article className="cw-paper cw-system-sketch">
                <small>FAILURE PATH / SKETCH</small>
                <div className="cw-flow"><span>API</span><i>→</i><span>queue</span><i>→</i><span>workers</span><i>↘</i><span>DLQ</span></div>
                <p>ordered · replayable · observable</p>
              </article>

              {outcomes.map((item, index) => (
                <article key={item.value} className={`cw-metric cw-metric-${index + 1}`}>
                  <Icon name={item.icon} />
                  <strong>{item.value}</strong>
                  <span>{item.label}</span>
                  <small>{item.note}</small>
                </article>
              ))}

              <article className="cw-handnote cw-handnote-a">“If it cannot recover, it is not finished.”</article>
              <article className="cw-handnote cw-handnote-b">p99 &gt; averages<br /><u>always.</u></article>
              <article className="cw-mini-note cw-mini-note-a"><b>BACKPRESSURE</b><span>pause consumers @ 80%</span></article>
              <article className="cw-mini-note cw-mini-note-b"><b>CACHE</b><span>warm → persist → recover</span></article>
              <article className="cw-mini-note cw-mini-note-c"><b>REPLAY</b><span>retry ×3 → DLQ</span></article>

              <a href="#work" className="cw-board-hotspot cw-hotspot-work"><span>01</span> work</a>
              <a href="#lab" className="cw-board-hotspot cw-hotspot-lab"><span>02</span> lab</a>
              <a href="#notes" className="cw-board-hotspot cw-hotspot-notes"><span>03</span> notes</a>
            </div>
          </div>
        </div>

        <div className="cw-scroll-cue"><span>follow the red thread</span><i /></div>
      </section>

      <section id="work" className="cw-detail cw-detail-work" data-section-id="work" data-parallax-scene>
        <div className="cw-section-ghost" data-parallax="0.04">01</div>
        <div className="cw-detail-board" data-reveal>
          <header className="cw-section-head">
            <p><span>01</span> PRODUCTION EVIDENCE</p>
            <h2>Work that survived contact with production.</h2>
            <p>Not a list of responsibilities — the actual constraints, interventions, and measured outcomes.</p>
          </header>

          <div className="cw-outcome-row">
            {outcomes.map((item) => (
              <article className="cw-outcome-card" key={item.value}>
                <Icon name={item.icon} /><strong>{item.value}</strong><span>{item.label}</span><small>{item.note}</small>
              </article>
            ))}
          </div>

          <div className="cw-work-grid">
            <article className="cw-casefile cw-casefile-main">
              <div className="cw-casefile-tag">ION TRADING / XTP</div>
              <h3>Real-time back-office trading systems</h3>
              <p>Concurrency, asynchronous workflows, recovery, performance tuning, caching, and operational tooling for systems where end-of-day failures are expensive.</p>
              <div className="cw-casefile-columns">
                <div><small>CONSTRAINT</small><p>Ordering, huge data volumes, client-specific workflows, and production safety.</p></div>
                <div><small>METHOD</small><p>Instrument first. Partition work. Design replay. Remove repeated cross-process cost.</p></div>
                <div><small>RESULT</small><p>20× throughput, 50× in supported cache workflows, 90% less downtime.</p></div>
              </div>
            </article>

            <article className="cw-timeline-card">
              <span className="cw-tape" />
              <small>SELECTED SYSTEM CHANGES</small>
              <ol>
                <li><b>Concurrency refactor</b><span>20× trade-processing throughput</span></li>
                <li><b>Persistent off-heap cache</b><span>up to 50× faster workflows</span></li>
                <li><b>Automated recovery</b><span>90% downtime reduction</span></li>
                <li><b>Log analysis tooling</b><span>30% faster incident triage</span></li>
                <li><b>CI artifact cache</b><span>40% faster builds · 35% lower AWS cost</span></li>
              </ol>
            </article>

            <article className="cw-handnote cw-handnote-work">Production principle:<br /><b>make the failure path boring.</b></article>
          </div>
        </div>
      </section>

      <section id="lab" className="cw-detail cw-detail-lab" data-section-id="lab" data-parallax-scene>
        <div className="cw-section-ghost" data-parallax="0.04">02</div>
        <div className="cw-detail-board" data-reveal>
          <header className="cw-section-head">
            <p><span>02</span> LAB / SIDE SYSTEMS</p>
            <h2>Things I build when the roadmap ends.</h2>
            <p>Experiments around AI, algorithms, and tools — with the same bias toward measurable behavior.</p>
          </header>

          <div className="cw-project-grid">
            <article className="cw-project-card cw-project-featured">
              <div className="cw-project-icon"><Icon name="brain" /></div>
              <small>ACTIVE SYSTEM</small>
              <h3>{cv.projects[0].title}</h3>
              <p>{cv.projects[0].summary}</p>
              <ul>{cv.projects[0].details.slice(0, 2).map((detail) => <li key={detail}>{detail}</li>)}</ul>
              <div className="cw-tags">{cv.projects[0].stack.map((tag) => <span key={tag}>{tag}</span>)}</div>
            </article>

            <article className="cw-project-card">
              <div className="cw-project-icon"><Icon name="chart" /></div>
              <small>PUBLISHED RESEARCH</small>
              <h3>{cv.projects[1].title}</h3>
              <p>{cv.projects[1].summary}</p>
              <div className="cw-paper-result"><b>99.31%</b><span>reported accuracy</span></div>
            </article>

            <article className="cw-project-card">
              <div className="cw-project-icon"><Icon name="compass" /></div>
              <small>PRODUCT EXPERIMENT</small>
              <h3>{cv.projects[2].title}</h3>
              <p>{cv.projects[2].summary}</p>
              <div className="cw-tags">{cv.projects[2].stack.map((tag) => <span key={tag}>{tag}</span>)}</div>
            </article>

            <article className="cw-lab-scribble">
              <span>next rabbit holes</span>
              <b>cache behavior / tail latency / agent reliability / systems evaluation</b>
              <i>↗ keep measuring the weird parts</i>
            </article>
          </div>
        </div>
      </section>

      <section id="notes" className="cw-detail cw-detail-notes" data-section-id="notes" data-parallax-scene>
        <div className="cw-section-ghost" data-parallax="0.04">03</div>
        <div className="cw-detail-board cw-notes-board" data-reveal>
          <header className="cw-section-head">
            <p><span>03</span> FIELD NOTES</p>
            <h2>The margins matter.</h2>
            <p>Short principles, half-finished ideas, and the notes that usually never make it into architecture diagrams.</p>
          </header>

          <div className="cw-notes-scatter">
            {noteCards.map(([title, text, tone], index) => (
              <article key={title} className={`cw-note-card cw-note-${tone} cw-note-pos-${index + 1}`}>
                <span className="cw-thumbtack" />
                <small>NOTE / 0{index + 1}</small>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
            <article className="cw-margin-paper">
              <span className="cw-tape" />
              <Icon name="book" />
              <p>Reading pile</p>
              <b>distributed systems · performance · design · history · fiction</b>
              <small>good systems are partly technical and partly human</small>
            </article>
            <div className="cw-pencil-line cw-pencil-line-a" /><div className="cw-pencil-line cw-pencil-line-b" />
            <p className="cw-big-scrawl">keep the useful footnotes.</p>
          </div>
        </div>
      </section>

      <section id="contact" className="cw-detail cw-detail-contact" data-section-id="contact" data-parallax-scene>
        <div className="cw-section-ghost" data-parallax="0.04">04</div>
        <div className="cw-contact-board" data-reveal>
          <div className="cw-contact-copy">
            <p className="cw-kicker"><span>Open channel</span> Contact</p>
            <h2>Bring me the hard system.</h2>
            <p>Backend scale, production reliability, performance work, distributed workflows, agentic AI — or a strange engineering problem worth mapping properly.</p>
            <a className="cw-contact-mail" href={`mailto:${cv.email}`}><Icon name="mail" /><span><small>EMAIL</small>{cv.email}</span><Icon name="arrow" /></a>
          </div>
          <div className="cw-contact-links">
            <a href={cv.linkedin} target="_blank" rel="noreferrer"><Icon name="linkedin" /><span><b>LinkedIn</b><small>experience + connect</small></span><Icon name="arrow" /></a>
            <a href={cv.github} target="_blank" rel="noreferrer"><Icon name="github" /><span><b>GitHub</b><small>code + experiments</small></span><Icon name="arrow" /></a>
            <div className="cw-contact-status"><i /><span><b>Signal status</b><small>available for hard problems</small></span></div>
          </div>
          <p className="cw-contact-scrawl">“systems should explain themselves.”</p>
        </div>
      </section>

      <footer className="cw-footer"><span>ASU / SYSTEMS LAB</span><span>Java · distributed systems · reliability · AI</span><a href="#home">back to board ↑</a></footer>
    </main>
  );
}
