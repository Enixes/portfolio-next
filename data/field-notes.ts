export const tailCacheSeries = [
  {
    slug: "one-copy-per-machine",
    title: "Why did every program need its own copy?",
    date: "2026-06-05",
    summary: "At a hackathon at ION Trading, my team built a way for several programs to share one copy of a record. TailCache grew out of the question that stayed with me.",
    evidence: [["The study that grew out of the prototype", "909f9708eabbae95a276d340f623fd53f32de7fe/README.md"]],
  },
  {
    slug: "when-does-off-heap-pay",
    title: "When is an off-heap Java cache worth the copy?",
    date: "2026-08-15",
    summary: "Caffeine keeps records in memory that Java manages. Chronicle Map stores their bytes outside it. Reading one record a thousand times helped me see the trade.",
    evidence: [["How the trade-off became a benchmark", "516b823cd910f2babb07259bd89acdffdbfb9bec/docs/METHODOLOGY.md"]],
  },
  {
    slug: "the-cost-of-a-hit",
    title: "What does a cache hit cost?",
    date: "2026-09-05",
    summary: "A Java cache can find a record before the program can use it. Deciding when to stop the timer shaped my first Caffeine and Chronicle Map benchmark.",
    evidence: [["Original benchmark methodology", "516b823cd910f2babb07259bd89acdffdbfb9bec/docs/METHODOLOGY.md"]],
  },
  {
    slug: "same-keys-same-work",
    title: "How do you give two Java caches the same work?",
    date: "2026-09-19",
    summary: "I gave both caches the same list of records to read and update. One shortcut in the test code could still have made Caffeine look cheaper to run.",
    evidence: [["Mixed-workload harness and validation", "a15af5075f1a363af17d621f234c3b8e24cb7fc0/docs/TAILCACHE_05.md"]],
  },
  {
    slug: "the-unresolved-midpoint",
    title: "Why the same cache test gave me two answers",
    date: "2026-11-10",
    summary: "At the same memory setting, two runs picked different winners. Counting how many requests took longer than 100 microseconds helped explain the split.",
    evidence: [["Midpoint results and recorded warnings", "5fda648c557bf46d999d00ad9752678f669d3e0e/docs/TAILCACHE_MIDPOINT_RESULTS.md"], ["Paired response measurements", "5fda648c557bf46d999d00ad9752678f669d3e0e/docs/figures/midpoint_response_and_ratio.svg"]],
  },
  {
    slug: "where-the-writes-land",
    title: "Same write rate, different winner",
    date: "2026-11-23",
    summary: "Both Java caches handled about 2,500 updates a second. Changing which records got updated reversed which cache gave the quicker response near the slow end.",
    evidence: [["Preprint and paired results", "22485c7d787d0dd866a05a5e447ba2ba8d9ff80d/docs/preprint/MANUSCRIPT.md"], ["November 23 load tests and rejected timing pilots", "3b342fc3cc17e542a89a06d3fbf5563955058657/docs/nov23-popos-followup/README.md"], ["Timing and G1 audit", "22485c7d787d0dd866a05a5e447ba2ba8d9ff80d/docs/preprint/timing-audit.json"]],
  },
] as const;

export type NoteSlug = typeof tailCacheSeries[number]["slug"];
export const notePath = (slug: NoteSlug) => `/field-notes/tailcache/${slug}`;

const dateFormat = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
export const milestoneDate = (date: string) => dateFormat.format(new Date(date + "T00:00:00Z"));
