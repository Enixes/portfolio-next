export type Experience = {
  role: string;
  company: string;
  location: string;
  dates: string;
  bullets: string[];
};

export type Project = {
  slug: string;
  title: string;
  summary: string;
  details: string[];
  stack: string[];
};

export type SkillGroup = {
  category: string;
  items: string[];
};

export const cv = {
  name: "Asu Singh",
  role: "Senior Software Engineer",
  location: "India",
  phone: "+91-9910521365",
  email: "itsasusingh@gmail.com",
  linkedin: "https://linkedin.com/in/asusingh",
  github: "https://github.com/Enixes/",
  summary:
    "Senior Software Engineer with 5+ years building production systems for demanding enterprise clients. Deep expertise in Java, multithreading, performance optimisation, and production reliability. Independently built an agentic AI assistant using free NVIDIA models — prototype to deployed 24/7 system. Combines engineering discipline with AI capability to deliver reliable, high-impact solutions.",
  metrics: [
    { value: "20×", label: "trade throughput" },
    { value: "50×", label: "supported workflows" },
    { value: "90%", label: "downtime removed" },
  ],
  experiences: [
    {
      role: "Senior Software Development Engineer",
      company: "ION Trading",
      location: "Noida, India",
      dates: "Aug 2020–Present",
      bullets: [
        "Designed and delivered XTP, ION's real-time back-office trading product, in production for major global trading firms and banks.",
        "Led a Java multithreading refactor that increased trade-processing throughput by 20x during end-of-day batch runs — scoped requirements with traders, delivered with zero production incidents.",
        "Won IONathon XTP 1.0 for developing an off-heap persistent cache that eliminates inter-process calls, boosting XTP's performance by up to 50x in supported workflows.",
        "Developed Alazium, an automated log-analysis tool (Python + regex, parsing 100 GB+ of production logs), reducing incident triage time by 30% for the engineering team.",
        "Designed and deployed an automatic recovery feature for halted end-of-day processing, cutting downtime by 90% and eliminating after-hours operator calls.",
        "Built a caching layer for CI builds that predownloads artifacts in parallel, cutting build times by up to 40% and AWS monthly costs by 35%.",
        "Built features on XTP's in-house event-driven messaging system (MQ-like, Kafka-like), handling async workflows and failure recovery at scale.",
        "Led cross-team migration of CI infrastructure from Red Hat 7 to Red Hat 8 — coordinated cutover windows, documented migration paths, zero downtime.",
        "Redesigned historical-data cleanup with a linear-regression approach, improving database performance by 95% under peak load.",
        "Designed C#/.NET pagination for the XTP GUI, enabling on-demand loading of millions of contracts instead of multi-minute loads and client crashes in affected workflows.",
      ],
    },
    {
      role: "Software Development Intern",
      company: "Holisol Logistics",
      location: "Delhi, India",
      dates: "Jun 2019–Sep 2019",
      bullets: [
        "Built a Daily Run Sheet Generator with a Django frontend to optimize logistics deliveries — end-to-end from requirements to deployment.",
        "Presented directly to the company founder and secured production deployment approval.",
      ],
    },
  ] satisfies Experience[],
  projects: [
    {
      slug: "agentic-personal-assistant",
      title: "Agentic Personal Assistant",
      summary:
        "A fault-tolerant AI assistant designed to remain useful—and alive—around the clock.",
      details: [
        "Built a personal AI assistant using free NVIDIA models and a coding harness — prototype to deployed 24/7 system accessible from a phone via messenger apps.",
        "Designed for async message handling, persistent state, and fault-tolerant 24/7 operation on constrained free-tier hardware.",
        "Containerised for portable deployment; includes metrics and monitoring for response latency, uptime, and error rates.",
      ],
      stack: ["AI agents", "NVIDIA models", "Docker", "Prometheus", "Grafana"],
    },
    {
      slug: "hybrid-social-group-algorithm",
      title: "Hybrid Social Group Algorithm",
      summary:
        "A published optimisation approach for escaping local minima and maxima.",
      details: [
        "Developed a meta-heuristic algorithm to overcome local minima and maxima in machine-learning processes.",
        "Applied the algorithm to COVID-19 detection from chest X-ray images, achieving 99.31% accuracy.",
        "Published the work in Cognitive Computation, where it has been cited by several publications.",
      ],
      stack: ["Machine learning", "Computer vision", "Meta-heuristics"],
    },
    {
      slug: "wardrobe-ai",
      title: "Wardrobe AI",
      summary:
        "A personal wardrobe assistant built around existing photos and virtual try-on.",
      details: [
        "Built a personal wardrobe assistant that lets users scan existing photos to automatically create a digital wardrobe.",
        "Enables users to try on clothes virtually and make better-informed purchasing decisions.",
      ],
      stack: ["AI", "Computer vision"],
    },
    {
      slug: "lung-disease-prediction",
      title: "Lung Disease Prediction",
      summary:
        "Automated X-ray analysis for detecting and predicting lung disease onset.",
      details: [
        "Developed an automated application to detect and predict the onset of lung diseases from X-ray images.",
        "Achieved over 99% accuracy using a meta-heuristic algorithm.",
      ],
      stack: ["Machine learning", "Computer vision", "Meta-heuristics"],
    },
  ] satisfies Project[],
  skills: [
    { category: "Languages", items: ["Java 8+", "Python", "C#", "JavaScript", "SQL"] },
    {
      category: "Backend & APIs",
      items: ["Spring Boot", "Microservices", "REST APIs", "Hibernate", "Django", "C#/.NET"],
    },
    {
      category: "Systems & Reliability",
      items: [
        "Multithreading",
        "Performance tuning",
        "Event-driven systems",
        "Async systems",
        "Production debugging",
        "Log analysis",
        "On-call incident response",
        "RCA",
      ],
    },
    {
      category: "Data & Observability",
      items: ["Oracle", "PostgreSQL", "AWS", "Grafana", "Prometheus", "numpy", "pandas", "Plotly", "Parallel data processing"],
    },
    {
      category: "AI & Agentic",
      items: ["AI agents", "LLMs", "Machine learning", "Computer vision", "Empirical evaluation"],
    },
    {
      category: "Engineering Practice",
      items: ["TDD", "JUnit", "Mockito", "Agile", "Unix", "Docker", "CI/CD"],
    },
    {
      category: "Client Delivery",
      items: [
        "Requirements gathering",
        "Stakeholder engagement",
        "Cross-team collaboration",
        "Production deployments",
        "Incident communication",
      ],
    },
  ] satisfies SkillGroup[],
  publication: {
    title: "COVID-19 Infection Detection from Chest X-Ray Images",
    publisher: "Springer",
    date: "Mar 2021",
    detail:
      "Developed the Hybrid Social Group Optimization algorithm for COVID-19 detection from chest X-ray images with over 99% accuracy. Published in the Cognitive Computation journal.",
  },
  education: {
    degree: "Bachelor of Technology",
    institution: "Maharaja Agrasen Institute of Technology, Delhi",
    result: "CGPA: 8.3",
  },
  recognition: [
    "Top 0.1% performer at ION Trading.",
    "Inspire program fellow: Awarded for outstanding academics in Xth standard.",
    "Top 10, inaugural HackBMU Hackathon, for developing an Illegal Mining Detector.",
    "99.9 percentile in JEE Advanced.",
  ],
} as const;
