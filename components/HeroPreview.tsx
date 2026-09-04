import { cv } from "@/data/cv";
import { BreezeController } from "@/components/BreezeController";
import { BoardScrollController } from "@/components/BoardScrollController";
import Image from "next/image";

const sectionBoards = [
  {
    id: "profile-board",
    number: "00",
    marker: "purple",
    eyebrow: "Profile / System Owner",
    title: "Engineer behind the board",
    summary: "A senior software engineer focused on making complex production systems understandable, recoverable, and fast.",
    cards: [
      ["Core craft", "Backend systems", "Java, concurrency, distributed workflows, and performance-sensitive services.", null],
      ["Operating principle", "Trace the evidence", "Start with observable behavior, follow the failure path, and measure the recovery.", null],
      ["Current direction", "Agentic AI", "Building useful agents with production-grade constraints, tooling, and guardrails.", null],
    ],
  },
  {
    id: "work-board",
    number: "01",
    marker: "red",
    eyebrow: "Systems / Work",
    title: "Evidence from production",
    summary: "High-throughput systems, deliberate failure paths, and recovery that can be measured.",
    cards: [
      ["Low-latency trading", "20× throughput", "Concurrency, partitioning, and backpressure without losing ordering.", null],
      ["Reliability engineering", "90% less downtime", "Recovery paths, replayable queues, and safer operational defaults.", null],
      ["Agentic AI systems", "Tools with guardrails", "Observable agents designed to operate inside real production constraints.", null],
    ],
  },
  {
    id: "blog-board",
    number: "02",
    marker: "blue",
    eyebrow: "Field Notes / Blog",
    title: "Writing from the failure path",
    summary: "Practical essays about systems, AI, performance, and the decisions hidden between the diagrams.",
    cards: [
      ["Failure paths first", "Systems essay", "Why the recovery story should be designed before the happy path.", null],
      ["Agents under load", "AI engineering", "What changes when an agent becomes part of a production control loop.", null],
      ["Concurrency field notes", "Performance", "Patterns, bottlenecks, and lessons gathered from Java systems.", null],
    ],
  },
  {
    id: "life-board",
    number: "03",
    marker: "green",
    eyebrow: "Off the Clock / Life",
    title: "The human side of the map",
    summary: "Books, unfinished ideas, visual observations, and the side quests that make the systems work better.",
    cards: [
      ["Reading pile", "Books + marginalia", "Notes from systems thinking, history, design, and good fiction.", null],
      ["Side quests", "Small experiments", "Tools, sketches, and curious prototypes without a roadmap.", null],
      ["Elsewhere", "Places + perspective", "Street-level observations and the ideas that travel back to the work.", null],
    ],
  },
  {
    id: "contact-board",
    number: "04",
    marker: "gold",
    eyebrow: "Contact / Open Channel",
    title: "Bring me the hard problem",
    summary: "For backend systems, production reliability, and agentic AI work, open a channel directly.",
    cards: [
      ["Email", "Start a conversation", "Best for project context, roles, and detailed engineering questions.", `mailto:${cv.email}`],
      ["LinkedIn", "Professional profile", "Experience, background, and a direct way to connect.", cv.linkedin],
      ["GitHub", "Code + experiments", "Projects, prototypes, and the engineering trail behind the board.", cv.github],
    ],
  },
] as const;

export function HeroPreview() {
  return (
    <main id="top" className="portfolio-preview">
      <BreezeController />
      <BoardScrollController />

      <div className="war-room-intro" aria-hidden="true">
        <p className="intro-case">Case board 01 · systems / reliability</p>
        <div className="intro-copy">
          <span>Systems war room</span>
          <strong>Tracing the evidence</strong>
          <i className="intro-progress" />
        </div>
        <p className="intro-signal">Signal acquired · zooming in</p>
        <Image
          className="war-room-silhouettes"
          src="/war-room-silhouettes-hires.png"
          alt=""
          width="1935"
          height="812"
          sizes="100vw"
          priority
        />
      </div>

      <header className="preview-header" aria-label="Primary navigation">
        <a className="preview-brand" href="#top" aria-label="Asu Singh, home">
          <span aria-hidden="true" />
          ASU / SYSTEMS
        </a>

        <nav className="preview-nav">
          <a href="#work-board">Work</a>
          <a href="#blog-board">Blog</a>
          <a href="#life-board">Life</a>
          <a href="#contact-board">Contact</a>
        </nav>

        <a className="preview-status" href={`mailto:${cv.email}`}>
          <span aria-hidden="true" /> Available for hard problems
        </a>
      </header>

      <section className="preview-hero" aria-labelledby="hero-title">
        <Image
          className="room-atmosphere"
          src="/war-room-environment-anime.jpg"
          alt=""
          width="1672"
          height="941"
          sizes="100vw"
          priority
        />

        <div className="evidence-board-wrap">
          <div className="evidence-board-frame">
            <div className="evidence-board">
              <p className="board-index">Case board 01 · systems / writing / life</p>
              <p className="board-date">Last mapped · 2026</p>

              <span className="note-spotlight spotlight-thesis" aria-hidden="true" />
              <span className="note-spotlight spotlight-result" aria-hidden="true" />

              <a className="board-zone board-zone-profile" href="#profile-board" aria-label="Open the Profile board">
                <svg className="zone-mark zone-mark-profile" viewBox="0 0 180 56" aria-hidden="true">
                  <path pathLength={100} d="M13 11 C48 7 118 8 166 11 L163 44 C116 48 54 47 10 42 Z" />
                  <path pathLength={100} d="M18 7 L170 14 M7 38 L157 50" />
                </svg>
                <span>00 / Profile</span>
              </a>
              <a className="board-zone board-zone-work" href="#work-board" aria-label="Open the Systems and Work board">
                <svg className="zone-mark zone-mark-work" viewBox="0 0 235 58" aria-hidden="true">
                  <path pathLength={100} d="M17 4 L207 3 L229 27 L207 55 L18 54 L5 28 Z" />
                  <path pathLength={100} d="M3 42 L17 56 M209 2 L232 17" />
                </svg>
                <span>01 / Systems + Work</span>
              </a>
              <a className="board-zone board-zone-blog" href="#blog-board" aria-label="Open the Field Notes and Blog board">
                <svg className="zone-mark zone-mark-blog" viewBox="0 0 205 60" aria-hidden="true">
                  <path pathLength={100} d="M22 13 C61 3 161 4 191 20 C215 35 174 53 96 52 C34 52 3 40 14 22 C18 15 28 10 38 8" />
                  <path pathLength={100} d="M15 19 C25 9 39 6 50 7" />
                </svg>
                <span>02 / Field Notes</span>
              </a>
              <a className="board-zone board-zone-life" href="#life-board" aria-label="Open the Life board">
                <svg className="zone-mark zone-mark-life" viewBox="0 0 150 66" aria-hidden="true">
                  <path pathLength={100} d="M22 48 C7 47 4 36 15 29 C8 18 18 9 31 13 C37 2 55 4 59 14 C69 3 88 7 89 19 C102 10 119 17 116 29 C137 27 143 42 127 49 C106 57 47 58 22 48 Z" />
                  <path pathLength={100} d="M13 51 C43 61 111 60 136 47" />
                </svg>
                <span>03 / Life</span>
              </a>

              <article className="board-paper identity-file">
                <span className="board-pin pin-blue" aria-hidden="true" />
                <p className="paper-eyebrow">Subject / 01</p>
                <h2>Backend systems engineer</h2>
                <ul>
                  <li>Java + concurrency</li>
                  <li>Production reliability</li>
                  <li>Agentic AI systems</li>
                </ul>
                <span className="sketch-arrow" aria-hidden="true">↘</span>
              </article>

              <figure className="board-paper profile-photo">
                <span className="board-pin" aria-hidden="true" />
                <Image
                  src="https://avatars.githubusercontent.com/u/20127633?s=240&v=4"
                  alt="Asu Singh"
                  width="240"
                  height="240"
                  sizes="(max-width: 760px) 26vw, 8vw"
                  referrerPolicy="no-referrer"
                />
                <figcaption>Asu / system owner</figcaption>
              </figure>

              <article className="board-sticky sticky-yellow thesis-card">
                <span className="board-pin" aria-hidden="true" />
                <p className="thesis-role">Senior Software Engineer</p>
                <span className="thesis-kicker">Working thesis</span>
                <h1 id="hero-title">
                  I make complex systems <em>behave.</em>
                </h1>
                <span className="red-underline" aria-hidden="true" />
              </article>

              <article className="board-sticky sticky-blue metric-card metric-throughput">
                <span className="board-pin pin-green" aria-hidden="true" />
                <strong>20×</strong>
                <span>trade throughput</span>
              </article>

              <article className="board-sticky sticky-green metric-card metric-recovery">
                <span className="board-pin pin-blue" aria-hidden="true" />
                <strong>90%</strong>
                <span>downtime removed</span>
              </article>

              <article className="board-paper system-map">
                <span className="paper-tape" aria-hidden="true" />
                <p>request → queue → worker → recovery</p>
                <div className="map-symbols" aria-hidden="true">
                  <i /><b>→</b><i /><b>→</b><i />
                </div>
                <small>design for the failure path</small>
              </article>

              <aside className="war-note api-gateway-note">
                <span className="board-pin pin-yellow" aria-hidden="true" />
                <strong>API gateway</strong>
                <span>auth · quota · idempotency</span>
              </aside>

              <aside className="war-note queue-depth-note">
                <span className="board-pin pin-blue" aria-hidden="true" />
                <strong>Backpressure</strong>
                <span>pause consumers @ 80%</span>
              </aside>

              <aside className="war-note idempotency-note">
                <span className="board-pin pin-yellow" aria-hidden="true" />
                <strong>Idempotency keys</strong>
                <span>edge dedupe · safe retry</span>
              </aside>

              <aside className="war-note autoscale-note">
                <span className="board-pin pin-blue" aria-hidden="true" />
                <strong>Load shedding</strong>
                <span>backpressure → scale</span>
              </aside>

              <aside className="war-note cache-note">
                <span className="board-pin pin-green" aria-hidden="true" />
                <strong>Off-heap cache</strong>
                <span>warm-up → persist → recover</span>
              </aside>

              <aside className="war-note failure-note">
                <span className="board-pin" aria-hidden="true" />
                <strong>Failure path</strong>
                <span>retry ×3 → DLQ → replay</span>
              </aside>

              <aside className="war-note partition-note">
                <span className="board-pin pin-yellow" aria-hidden="true" />
                <strong>Partition key</strong>
                <span>account_id / ordered</span>
              </aside>

              <p className="latency-ring">
                p99
                <strong>&lt; 120 ms</strong>
              </p>

              <article className="board-paper observability-card">
                <span className="paper-tape" aria-hidden="true" />
                <p>Observability / live</p>
                <div className="signal-chart" aria-hidden="true">
                  <i /><i /><i /><i /><i /><i />
                </div>
                <span>latency · errors · queue depth</span>
              </article>

              <p className="blueprint-arrow blueprint-arrow-one" aria-hidden="true">queue → workers</p>
              <p className="blueprint-arrow blueprint-arrow-two" aria-hidden="true">checkpoint ↗ resume</p>
              <p className="blueprint-arrow blueprint-arrow-three" aria-hidden="true">logs → parser → signal</p>

              <p className="board-scrawl scrawl-draft">draft → challenge → evidence</p>
              <p className="board-scrawl scrawl-footnotes">keep the useful footnotes</p>

              <svg
                className="board-diagram diagram-fanout"
                viewBox="0 0 300 150"
                role="img"
                aria-label="Queue fan-out with three workers, retry, and a dead-letter queue"
              >
                <defs>
                  <marker id="fanout-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M1 1 L9 5 L2 9" fill="none" stroke="#2d7591" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </marker>
                  <marker id="retry-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M1 1 L9 5 L2 9" fill="none" stroke="#a52d26" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </marker>
                </defs>
                <g className="diagram-blue">
                  <path className="diagram-node" d="M5 59 Q8 56 15 57 L48 58 Q53 60 52 66 L51 84 Q50 89 44 89 L10 88 Q4 87 4 81 L4 65 Q4 61 5 59 Z" />
                  <path className="diagram-node" d="M84 56 Q88 53 95 55 L134 55 Q141 56 140 63 L139 86 Q138 92 131 92 L89 91 Q82 90 82 84 L83 61 Q83 58 84 56 Z" />
                  <path className="diagram-node" d="M194 9 Q199 6 206 8 L257 8 Q264 10 262 16 L261 31 Q260 37 253 36 L198 37 Q191 35 192 29 L192 14 Q192 11 194 9 Z" />
                  <path className="diagram-node" d="M193 58 Q198 54 205 56 L257 57 Q263 58 262 64 L261 79 Q261 85 254 84 L199 85 Q191 84 192 78 L191 63 Q191 60 193 58 Z" />
                  <path className="diagram-node" d="M194 105 Q200 102 207 104 L257 104 Q264 106 262 112 L261 127 Q260 134 253 132 L198 133 Q191 131 192 125 L192 110 Q192 107 194 105 Z" />
                  <path className="diagram-line" markerEnd="url(#fanout-arrow)" d="M54 73 C64 71 71 72 80 73" />
                  <path className="diagram-line" markerEnd="url(#fanout-arrow)" d="M142 72 C164 66 165 22 190 22" />
                  <path className="diagram-line" markerEnd="url(#fanout-arrow)" d="M142 73 C161 73 170 71 190 71" />
                  <path className="diagram-line" markerEnd="url(#fanout-arrow)" d="M142 75 C164 81 166 117 190 118" />
                </g>
                <g className="diagram-red">
                  <path className="diagram-node" d="M98 117 Q103 114 109 116 L145 116 Q151 118 149 124 L149 138 Q147 144 141 142 L102 143 Q95 141 96 135 L96 122 Q96 119 98 117 Z" />
                  <path className="diagram-line" markerEnd="url(#retry-arrow)" d="M191 119 C174 145 160 143 152 132" />
                  <path className="diagram-line diagram-dashed" markerEnd="url(#retry-arrow)" d="M122 115 C116 106 112 102 111 95" />
                </g>
                <g className="diagram-labels">
                  <text x="14" y="77">API</text>
                  <text x="94" y="78">queue</text>
                  <text x="207" y="27">worker A</text>
                  <text x="207" y="75">worker B</text>
                  <text x="207" y="123">worker C</text>
                  <text x="108" y="134">DLQ</text>
                  <text className="diagram-label-red" x="151" y="143">retry ×3</text>
                </g>
              </svg>

              <svg
                className="board-diagram diagram-circuit"
                viewBox="0 0 230 140"
                role="img"
                aria-label="Circuit breaker states moving from closed to open to half-open and back"
              >
                <defs>
                  <marker id="circuit-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M1 1 L9 5 L2 9" fill="none" stroke="#a52d26" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </marker>
                </defs>
                <g className="diagram-circuit-lines">
                  <path markerEnd="url(#circuit-arrow)" d="M67 102 C94 126 142 128 168 103" />
                  <path markerEnd="url(#circuit-arrow)" d="M183 78 C179 41 151 18 119 22" />
                  <path markerEnd="url(#circuit-arrow)" d="M94 27 C55 25 34 49 39 79" />
                </g>
                <path className="circuit-node circuit-closed" d="M20 95 C21 77 33 66 50 67 C68 67 80 79 79 97 C78 115 67 126 48 125 C30 124 19 113 20 95 Z" />
                <path className="circuit-node circuit-open" d="M85 25 C85 11 94 2 108 2 C123 3 132 12 131 26 C130 40 121 49 107 48 C93 47 84 39 85 25 Z" />
                <path className="circuit-node circuit-half" d="M149 90 C150 69 163 55 184 56 C206 56 220 70 219 92 C218 113 204 127 182 126 C161 125 148 112 149 90 Z" />
                <g className="diagram-labels circuit-labels">
                  <text x="49" y="100">closed</text>
                  <text x="108" y="29">open</text>
                  <text x="184" y="88">half-open</text>
                  <text x="184" y="103">probe 1%</text>
                </g>
              </svg>

              <article className="board-sticky sticky-pink blog-note">
                <span className="board-pin" aria-hidden="true" />
                <p>Field notes / Blog</p>
                <strong>Systems, AI &amp; performance</strong>
                <span>Long-form writing is part of the map →</span>
              </article>

              <aside className="war-note blog-topic-one">
                <span className="board-pin pin-blue" aria-hidden="true" />
                <strong>Failure paths first</strong>
                <span>essay draft / 01</span>
              </aside>

              <aside className="war-note blog-topic-two">
                <span className="board-pin" aria-hidden="true" />
                <strong>Agents under load</strong>
                <span>field note / 02</span>
              </aside>

              <article className="board-paper life-note">
                <span className="board-pin pin-yellow" aria-hidden="true" />
                <p>Off the clock / Life</p>
                <strong>Ideas, books &amp; elsewhere</strong>
                <span>Personal notes, kept human.</span>
              </article>

              <aside className="war-note life-topic-one">
                <span className="board-pin pin-green" aria-hidden="true" />
                <strong>Reading pile</strong>
                <span>books + marginalia</span>
              </aside>

              <aside className="war-note life-topic-two">
                <span className="board-pin pin-yellow" aria-hidden="true" />
                <strong>Side quests</strong>
                <span>experiments + elsewhere</span>
              </aside>

              <p className="board-caption">
                Real-time systems · recovery paths · measurable outcomes
              </p>
            </div>

            <div className="marker-tray" aria-hidden="true">
              <span className="marker marker-black" />
              <span className="marker marker-red" />
              <span className="marker marker-blue" />
            </div>
          </div>
        </div>

        <p className="preview-scroll">Follow the thread <span aria-hidden="true">↓</span></p>
      </section>

      <section className="board-scroll-story" data-board-story aria-label="Portfolio section boards">
        {sectionBoards.map((section, index) => (
          <span
            id={section.id}
            key={`${section.id}-stop`}
            className="board-story-stop"
            data-board-stop
            style={{ top: `${((index + .42) / sectionBoards.length) * 100}%` }}
            aria-hidden="true"
          />
        ))}

        <div className="board-scroll-sticky">
          <Image
            className="board-story-room"
            src="/war-room-environment-anime.jpg"
            alt=""
            width="1672"
            height="941"
            sizes="100vw"
          />

          <div className="board-story-progress" aria-hidden="true">
            <span>Scroll through the boards</span>
            <div>
              {sectionBoards.map((section, index) => (
                <i
                  key={`${section.id}-dot`}
                  className={index === 0 ? "is-active" : undefined}
                  data-board-dot
                />
              ))}
            </div>
          </div>

          <div className="board-scroll-track" data-board-track>
            {sectionBoards.map((section) => (
              <article
                key={`${section.id}-story`}
                className={`scroll-board-panel scroll-board-${section.marker}`}
                data-board-panel
                tabIndex={-1}
                aria-labelledby={`${section.id}-story-title`}
              >
                <div className="story-board-frame">
                  <div className="story-board-surface">
                    <p className="story-board-index">Case board / {section.number}</p>
                    <header className="story-board-header">
                      <span>{section.eyebrow}</span>
                      <h2 id={`${section.id}-story-title`}>{section.title}</h2>
                      <p>{section.summary}</p>
                    </header>

                    <div className="story-board-grid">
                      {section.cards.map(([title, result, description, href], cardIndex) => (
                        <article className="story-case" key={`${section.id}-${title}`}>
                          <span className="board-pin" aria-hidden="true" />
                          <small>Evidence / 0{cardIndex + 1}</small>
                          <h3>{title}</h3>
                          <strong>{result}</strong>
                          <p>{description}</p>
                          {href ? (
                            <a
                              className="story-case-link"
                              href={href}
                              target={href.startsWith("http") ? "_blank" : undefined}
                              rel={href.startsWith("http") ? "noreferrer" : undefined}
                            >
                              Open channel <span aria-hidden="true">↗</span>
                            </a>
                          ) : null}
                        </article>
                      ))}
                    </div>

                    <p className="story-board-footnote">
                      {section.id === "contact-board" ? "The board stays open." : "Zoom out. Follow the next board →"}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
