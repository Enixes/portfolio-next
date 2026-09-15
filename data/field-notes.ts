export type FieldNote = {
  id: string;
  kind: "systems" | "philosophy";
  scene: "recovery" | "agents" | "concurrency" | "margins";
  title: string;
  label: string;
  summary: string;
  tags: readonly string[];
  /** Publication date (YYYY-MM-DD) and reading minutes, once known. */
  date: string | null;
  readTime: number | null;
  status: "draft" | "in-progress" | "published";
  href: string | null;
  accent: "red" | "blue" | "ochre" | "violet";
};

/** Add a URL to turn a pending note into a real article link. */
export const fieldNotes: readonly FieldNote[] = [
  {
    id: "failure-paths-first",
    kind: "systems",
    scene: "recovery",
    title: "Failure paths first",
    label: "Systems / recovery",
    summary: "Design the recovery story before the happy path. Notes on retries, replay, and knowing what survived the failure.",
    tags: ["reliability", "replay", "idempotency"],
    date: null,
    readTime: null,
    status: "in-progress",
    href: null,
    accent: "red",
  },
  {
    id: "agents-under-load",
    kind: "systems",
    scene: "agents",
    title: "Agents under load",
    label: "AI engineering",
    summary: "When an agent joins a production control loop, the queue, the budget, and the escape hatch become part of the prompt.",
    tags: ["agents", "backpressure"],
    date: null,
    readTime: null,
    status: "draft",
    href: null,
    accent: "blue",
  },
  {
    id: "concurrency-field-notes",
    kind: "systems",
    scene: "concurrency",
    title: "Concurrency field notes",
    label: "Performance / Java",
    summary: "Follow the waiting time. Bottlenecks, ordering, and the small decisions that make parallel work useful.",
    tags: ["concurrency", "latency"],
    date: null,
    readTime: null,
    status: "draft",
    href: null,
    accent: "ochre",
  },
  {
    id: "the-useful-question",
    kind: "philosophy",
    scene: "margins",
    title: "The useful question",
    label: "Margins / philosophy",
    summary: "Some questions open a door. Others just keep us busy. A note on attention, uncertainty, and choosing what deserves an answer.",
    tags: ["attention", "perspective"],
    date: null,
    readTime: null,
    status: "draft",
    href: null,
    accent: "violet",
  },
];
