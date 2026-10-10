import { cv } from "./cv";

export type SystemsSkillCluster = {
  id: string;
  category: string;
  items: readonly string[];
  aside: string;
  caseId: string;
  caseLabel: string;
  tone: "yellow" | "blue" | "green" | "pink" | "lilac" | "mint" | "peach" | "cream";
  motif: "code" | "plug" | "pulse" | "database" | "spark" | "tick" | "conversation" | "compass";
};

type CoreCategory = (typeof cv.skills)[number]["category"];

// Publicly shown skills from the earlier Systems board remain on the bench.
const additions: Record<CoreCategory, readonly string[]> = {
  Languages: ["C++", "TypeScript"],
  "Backend & APIs": [],
  "Systems & Reliability": ["Caching", "Distributed systems", "Kafka", "IBM MQ", "Networking"],
  "Data & Observability": [],
  "AI & Agentic": [],
  "Engineering Practice": [],
  "Client Delivery": [],
};

const details: Record<CoreCategory, Omit<SystemsSkillCluster, "id" | "category" | "items">> = {
  Languages: { aside: "Production Java and Python tools; C++ and TypeScript connect to earlier builds.", caseId: "throughput", caseLabel: "20× throughput", tone: "yellow", motif: "code" },
  "Backend & APIs": { aside: "Service boundaries, APIs, and a Django tool used in daily logistics operations.", caseId: "holisol", caseLabel: "Holisol run sheet", tone: "blue", motif: "plug" },
  "Systems & Reliability": { aside: "Concurrency, messaging, recovery, and failure paths in live trading workflows.", caseId: "recovery", caseLabel: "90% less downtime", tone: "green", motif: "pulse" },
  "Data & Observability": { aside: "Logs, databases, and measurements that make a production problem legible.", caseId: "alazium", caseLabel: "Alazium triage", tone: "pink", motif: "database" },
  "AI & Agentic": { aside: "Published feature-selection research and an independently built assistant.", caseId: "hsgo", caseLabel: "published research", tone: "lilac", motif: "spark" },
  "Engineering Practice": { aside: "Tests, delivery pipelines, and tools that survive release day.", caseId: "ci", caseLabel: "faster CI", tone: "mint", motif: "tick" },
  "Client Delivery": { aside: "Requirements, cutovers, and clear communication with the people affected.", caseId: "holisol", caseLabel: "Holisol delivery", tone: "peach", motif: "conversation" },
};

export const systemsSkillClusters: readonly SystemsSkillCluster[] = [
  ...cv.skills.map((group, index) => ({
    id: `core-${index}`,
    category: group.category,
    items: [...group.items, ...additions[group.category]],
    ...details[group.category],
  })),
  {
    id: "experiments",
    category: "Current experiments",
    items: ["Benchmarking", "JMH", "Chronicle Map", "Caffeine", "Deterministic simulation", "Godot"],
    aside: "TailCache measures heap and off-heap trade-offs under repeatable workloads; Godot belongs to the side projects.",
    caseId: "tailcache",
    caseLabel: "TailCache",
    tone: "cream",
    motif: "compass",
  },
];

/** Only skills with an explicit example on this board lead to a case. */
export const systemsSkillEvidence: Readonly<Record<string, string>> = {
  "Java 8+": "throughput",
  Multithreading: "throughput",
  "Performance tuning": "throughput",
  "Event-driven systems": "recovery",
  Python: "alazium",
  "Log analysis": "alazium",
  "Production debugging": "alazium",
  SQL: "database",
  Oracle: "database",
  AWS: "ci",
  "CI/CD": "ci",
  "Parallel data processing": "ci",
  Django: "holisol",
  "Requirements gathering": "holisol",
  "Production deployments": "holisol",
  Caching: "cache",
  "Machine learning": "hsgo",
  "Empirical evaluation": "hsgo",
  "Computer vision": "mining",
  Benchmarking: "tailcache",
  JMH: "tailcache",
  Caffeine: "tailcache",
  "Chronicle Map": "tailcache",
  "Deterministic simulation": "tailcache",
};
