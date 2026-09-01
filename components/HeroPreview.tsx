import { cv } from "@/data/cv";
import { BreezeController } from "@/components/BreezeController";

const pins = [
  [108, 104],
  [274, 176],
  [394, 224],
  [598, 100],
  [786, 126],
  [944, 164],
  [216, 344],
  [252, 488],
  [548, 318],
  [730, 422],
  [888, 500],
  [962, 362],
] as const;

export function HeroPreview() {
  return (
    <main id="top" className="portfolio-preview">
      <BreezeController />
      <header className="preview-header" aria-label="Primary navigation">
        <a className="preview-brand" href="#top" aria-label="Asu Singh, home">
          <span aria-hidden="true" />
          ASU / SYSTEMS
        </a>

        <nav className="preview-nav">
          <a href="#work">Work</a>
          <a href="#blog">Blog</a>
          <a href="#life">Life</a>
          <a href={`mailto:${cv.email}`}>Contact</a>
        </nav>

        <a className="preview-status" href={`mailto:${cv.email}`}>
          <span aria-hidden="true" /> Available for hard problems
        </a>
      </header>

      <section className="preview-hero" aria-labelledby="hero-title">
        <div className="ambient-window ambient-window-left" aria-hidden="true" />
        <div className="ambient-window ambient-window-right" aria-hidden="true" />

        <div className="evidence-board-wrap">
          <div className="evidence-board-frame">
            <div className="evidence-board">
              <p className="board-index">Case board 01 · systems / writing / life</p>
              <p className="board-date">Last mapped · 2026</p>

              <svg
                className="evidence-thread"
                viewBox="0 0 1080 620"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <path d="M108 104 L274 176 L394 224 L598 100 L786 126 L944 164" />
                <path d="M108 104 L216 344 L252 488 L548 318 L888 500" />
                <path d="M274 176 L548 318 L786 126 L962 362 L888 500" />
                <path d="M216 344 L394 224 L730 422 L944 164" />
                <path d="M252 488 L730 422 L962 362" />
                {pins.map(([cx, cy]) => (
                  <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="7" />
                ))}
              </svg>

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

              <p className="handwritten-role">
                Senior Software Engineer
                <span aria-hidden="true" />
              </p>

              <figure className="board-paper profile-photo">
                <span className="board-pin" aria-hidden="true" />
                <img
                  src="https://avatars.githubusercontent.com/u/20127633?s=240&v=4"
                  alt="Asu Singh"
                  width="240"
                  height="240"
                  decoding="async"
                  fetchPriority="high"
                  referrerPolicy="no-referrer"
                />
                <figcaption>Asu / system owner</figcaption>
              </figure>

              <article className="board-sticky sticky-yellow thesis-card">
                <span className="board-pin" aria-hidden="true" />
                <p>Working thesis</p>
                <h1 id="hero-title">
                  I make complex systems <em>behave.</em>
                </h1>
                <span className="red-underline" aria-hidden="true" />
              </article>

              <article id="work" className="board-sticky sticky-blue metric-card metric-throughput">
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

              <article id="blog" className="board-sticky sticky-pink blog-note">
                <span className="board-pin" aria-hidden="true" />
                <p>Field notes / Blog</p>
                <strong>Systems, AI &amp; performance</strong>
                <span>Long-form writing is part of the map →</span>
              </article>

              <article id="life" className="board-paper life-note">
                <span className="board-pin pin-yellow" aria-hidden="true" />
                <p>Off the clock / Life</p>
                <strong>Ideas, books &amp; elsewhere</strong>
                <span>Personal notes, kept human.</span>
              </article>

              <div className="preview-actions">
                <a className="preview-primary" href="#work">
                  Trace the evidence <span aria-hidden="true">↘</span>
                </a>
                <a className="preview-secondary" href="#blog">Read field notes ↗</a>
              </div>

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
    </main>
  );
}
