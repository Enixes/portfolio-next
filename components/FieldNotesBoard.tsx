import { tailCacheSeries, milestoneDate, notePath } from "@/data/field-notes";
import { BoardEndCue } from "./BoardEndCue";
import { TailCacheSketch } from "./TailCacheSketch";
import "./blog-board.css";

export function FieldNotesBoard({ standalone = false }: { standalone?: boolean }) {
  const Heading = standalone ? "h1" : "h2";
  return <div className="story-board-surface tc-host">
    <div className="blog-live-board tc-board">
      <div className="tc-index">
        <header className="tc-masthead"><Heading id="blog-board-story-title">{standalone ? "Field Notes" : <a href="/field-notes">Field Notes</a>}</Heading><span>Asu Singh’s notebook</span></header>
        <div className="tc-spread">
          <section className="tc-cover">
            <span className="tc-tape" aria-hidden="true" />
            <p className="tc-label">Performance engineering</p>
            <h3>TailCache</h3>
            <p className="tc-deck">Where do the slow requests go when a Java cache moves off-heap?</p>
            <TailCacheSketch />
            <a className="tc-start" href={notePath(tailCacheSeries[0].slug)}>Read from the start <span aria-hidden="true">→</span></a>
          </section>
          <nav className="tc-contents" aria-label="TailCache articles">
            <h3>Contents <span>{tailCacheSeries.length} milestone notes</span></h3>
            <ol>{tailCacheSeries.map((note, index) => <li key={note.slug} className="blog-article">
              <a href={notePath(note.slug)}>
                <span className="tc-part" aria-hidden="true">0{index + 1}</span>
                <div><time dateTime={note.date}>{milestoneDate(note.date)}</time><h4>{note.title}</h4><p>{note.summary}</p></div>
                <span className="tc-arrow" aria-hidden="true">↗</span>
              </a>
            </li>)}</ol>
          </nav>
        </div>
        {standalone ? <a className="tc-home" href="/">← Asu Singh’s portfolio</a> : <BoardEndCue from="blog" />}
      </div>
    </div>
  </div>;
}
