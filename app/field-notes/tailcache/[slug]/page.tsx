import type { Metadata } from "next";
import { siteUrl } from "@/lib/site-url";
import { notFound } from "next/navigation";
import { tailCacheSeries, milestoneDate, notePath } from "@/data/field-notes";
import { TailCacheSketch } from "@/components/TailCacheSketch";
import { articles } from "./articles";
import "@/components/blog-board.css";

type Props = { params: Promise<{ slug: string }> };
export const generateStaticParams = () => tailCacheSeries.map(({ slug }) => ({ slug }));

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const note = tailCacheSeries.find(item => item.slug === slug);
  if (!note) return {};
  const title = `${note.title} | TailCache Field Notes`;
  const url = notePath(note.slug);
  return {
    title, description: note.summary, alternates: { canonical: url },
    openGraph: { type: "article", title, description: note.summary, url, authors: ["Asu Singh"] },
    twitter: { card: "summary", title, description: note.summary },
  };
}

export default async function TailCacheArticle({ params }: Props) {
  const { slug } = await params;
  const index = tailCacheSeries.findIndex(note => note.slug === slug);
  if (index < 0) notFound();
  const note = tailCacheSeries[index];
  const previous = tailCacheSeries[index - 1];
  const next = tailCacheSeries[index + 1];

  return <main className="tc-reader">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: note.title,
      description: note.summary,
      author: { "@type": "Person", name: "Asu Singh", url: siteUrl },
      mainEntityOfPage: new URL(notePath(note.slug), siteUrl).href,
      isPartOf: { "@type": "Blog", name: "Field Notes", url: new URL("/field-notes", siteUrl).href },
      temporalCoverage: note.date,
    }).replace(/</g, "\\u003c") }} />
    <div className="tc-reader-shell">
      <nav className="tc-reader-nav" aria-label="Portfolio"><a href="/field-notes">← Field Notes</a><a href="/">Asu Singh</a></nav>
      <article className="tc-page">
        <header>
          <span className="tc-label">TailCache · Part {index + 1} of {tailCacheSeries.length}</span>
          <h1>{note.title}</h1>
          <p className="tc-standfirst">{note.summary}</p>
          <p className="tc-byline">Asu Singh <span> / </span> Milestone · <time dateTime={note.date}>{milestoneDate(note.date)}</time></p>
        </header>
        <div className="tc-prose">{articles[note.slug]}</div>
        <aside className="tc-evidence"><h2>From the lab notebook</h2>{note.evidence.map(([label, source]) =>
          <a key={source} href={`https://github.com/Enixes/TailCache/blob/${source}`}>{label} ↗</a>)}</aside>
        <nav className="tc-turn" aria-label="Series navigation">
          {previous && <a href={notePath(previous.slug)}><small>← Previous note</small>{previous.title}</a>}
          {next ? <a href={notePath(next.slug)}><small>Next note →</small>{next.title}</a> : <a href="/field-notes"><small>Back to contents ↑</small>Field Notes</a>}
        </nav>
      </article>
      <aside className="tc-bookmark"><TailCacheSketch /><nav aria-label="In this series"><h2>In this series</h2><ol>{tailCacheSeries.map(item => <li key={item.slug}><a href={notePath(item.slug)} aria-current={item.slug === slug ? "page" : undefined}>{item.title}</a></li>)}</ol></nav></aside>
    </div>
  </main>;
}
