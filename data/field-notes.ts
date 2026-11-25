export const tailCacheSeries = [
  {
    slug: "the-cost-of-a-hit",
    title: "What does a cache hit cost?",
    date: "2026-09-05",
    summary: "Two calls to get() can return the same bytes and do quite different work.",
    evidence: [["Original benchmark methodology", "516b823cd910f2babb07259bd89acdffdbfb9bec/docs/METHODOLOGY.md"]],
  },
  {
    slug: "same-keys-same-work",
    title: "Giving both caches the same work",
    date: "2026-09-19",
    summary: "A seeded replay made the comparison repeatable. A bank of replacement arrays exposed its limits.",
    evidence: [["Mixed-workload harness and validation", "a15af5075f1a363af17d621f234c3b8e24cb7fc0/docs/TAILCACHE_05.md"]],
  },
  {
    slug: "the-unresolved-midpoint",
    title: "The midpoint that refused to settle",
    date: "2026-11-10",
    summary: "At 104 MiB, two clean runs pointed in opposite directions. The threshold counts explained how.",
    evidence: [["Midpoint results and recorded warnings", "5fda648c557bf46d999d00ad9752678f669d3e0e/docs/TAILCACHE_MIDPOINT_RESULTS.md"], ["Paired response measurements", "5fda648c557bf46d999d00ad9752678f669d3e0e/docs/figures/midpoint_response_and_ratio.svg"]],
  },
  {
    slug: "where-the-writes-land",
    title: "Same write rate, different winner",
    date: "2026-11-23",
    summary: "Spreading writes across the cache reversed the response-time ranking on two machines.",
    evidence: [["Preprint and paired results", "22485c7d787d0dd866a05a5e447ba2ba8d9ff80d/docs/preprint/MANUSCRIPT.md"], ["Timing and G1 audit", "22485c7d787d0dd866a05a5e447ba2ba8d9ff80d/docs/preprint/timing-audit.json"]],
  },
] as const;

export type NoteSlug = typeof tailCacheSeries[number]["slug"];
export const notePath = (slug: NoteSlug) => `/field-notes/tailcache/${slug}`;

const dateFormat = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
export const milestoneDate = (date: string) => dateFormat.format(new Date(date + "T00:00:00Z"));
