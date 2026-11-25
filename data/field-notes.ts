export const tailCacheSeries = [
  {
    slug: "one-copy-per-machine",
    title: "Why keep a cache in every JVM?",
    date: "2026-06-05",
    summary: "At IONathon we tried sharing one off-heap store across Java services on the same machine. That left a question about the cost of a read.",
    evidence: [["The study that grew out of the prototype", "909f9708eabbae95a276d340f623fd53f32de7fe/README.md"]],
  },
  {
    slug: "when-does-off-heap-pay",
    title: "When does off-heap caching pay for the copy?",
    date: "2026-08-15",
    summary: "Caffeine can return an existing Java array. Chronicle Map can keep that array off the heap, but reading it back costs work. Which cost shows up at p99?",
    evidence: [["How the trade-off became a benchmark", "516b823cd910f2babb07259bd89acdffdbfb9bec/docs/METHODOLOGY.md"]],
  },
  {
    slug: "the-cost-of-a-hit",
    title: "What does a cache hit cost?",
    date: "2026-09-05",
    summary: "The first TailCache benchmark compares a Caffeine hit with a Chronicle Map read on Java 21. Both return the same bytes. Only one copies the value.",
    evidence: [["Original benchmark methodology", "516b823cd910f2babb07259bd89acdffdbfb9bec/docs/METHODOLOGY.md"]],
  },
  {
    slug: "same-keys-same-work",
    title: "Giving Caffeine and Chronicle Map the same writes",
    date: "2026-09-19",
    summary: "A seeded replay made the comparison repeatable. A bank of replacement arrays exposed its limits.",
    evidence: [["Mixed-workload harness and validation", "a15af5075f1a363af17d621f234c3b8e24cb7fc0/docs/TAILCACHE_05.md"]],
  },
  {
    slug: "the-unresolved-midpoint",
    title: "Why 104 MiB gave us two answers at p99.9",
    date: "2026-11-10",
    summary: "At 104 MiB of added heap data, Caffeine’s response p99.9 ranged from 33 to 426 µs. Counting requests above 100 µs explained the jump.",
    evidence: [["Midpoint results and recorded warnings", "5fda648c557bf46d999d00ad9752678f669d3e0e/docs/TAILCACHE_MIDPOINT_RESULTS.md"], ["Paired response measurements", "5fda648c557bf46d999d00ad9752678f669d3e0e/docs/figures/midpoint_response_and_ratio.svg"]],
  },
  {
    slug: "where-the-writes-land",
    title: "Same write rate, different winner",
    date: "2026-11-23",
    summary: "At 5% writes, changing which keys received updates reversed the p99.9 response-time ranking of Caffeine and Chronicle Map on two machines.",
    evidence: [["Preprint and paired results", "22485c7d787d0dd866a05a5e447ba2ba8d9ff80d/docs/preprint/MANUSCRIPT.md"], ["November 23 load tests and rejected timing pilots", "3b342fc3cc17e542a89a06d3fbf5563955058657/docs/nov23-popos-followup/README.md"], ["Timing and G1 audit", "22485c7d787d0dd866a05a5e447ba2ba8d9ff80d/docs/preprint/timing-audit.json"]],
  },
] as const;

export type NoteSlug = typeof tailCacheSeries[number]["slug"];
export const notePath = (slug: NoteSlug) => `/field-notes/tailcache/${slug}`;

const dateFormat = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
export const milestoneDate = (date: string) => dateFormat.format(new Date(date + "T00:00:00Z"));
