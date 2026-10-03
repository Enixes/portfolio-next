export type ProfileMilestone = {
  id: string;
  year: string;
  title: string;
  aside: string;
  highlight: string;
  chapter: string;
  paragraphs: string[];
  proof: { label: string; href: string }[];
  artifact?: { src: string; alt: string; caption: string };
  tone: "yellow" | "blue" | "green" | "pink" | "lilac";
  doodle: "spark" | "brackets" | "wireless" | "route" | "clock" | "graph" | "house" | "pencil";
};

/** The short cards state what happened; their notes keep the longer story and proof. */
export const profileMilestones: ProfileMilestone[] = [
  {
    id: "recognition", year: "2013", title: "Earned school merit; attended DST INSPIRE", aside: "Curiosity got its first stamp.", chapter: "The curious years",
    highlight: "School merit and a place at the DST INSPIRE science camp.", tone: "yellow", doodle: "spark",
    paragraphs: [
      "A Kendriya Vidyalaya Certificate of Merit recognised A1 grades across every subject in the 2013 CBSE secondary examination. The same year, a DST INSPIRE fellowship brought me to a science camp at Kirori Mal College, University of Delhi.",
      "The useful part was the invitation to ask how things worked. That curiosity eventually found its way into software, research, and production engineering.",
    ],
    proof: [
      { label: "School merit certificate", href: "https://drive.google.com/file/d/10PW4yXqo32Vf_mNwf2IZDXAqxivURHhW/view?usp=sharing" },
      { label: "DST INSPIRE certificate", href: "https://drive.google.com/file/d/1c_SQwB4BwVROMEjaj3iV-DW1NYgHSiUr/view?usp=sharing" },
    ],
  },
  {
    id: "degree", year: "2016", title: "Started computer science at MAIT", aside: "The syllabus was only the beginning.", chapter: "A foundation",
    highlight: "Began a B.Tech in Computer Science and Engineering in Delhi.", tone: "blue", doodle: "brackets",
    paragraphs: [
      "At Maharaja Agrasen Institute of Technology, affiliated with GGSIPU, I began a four-year Computer Science and Engineering degree. I graduated in 2020 with an 8.25/10 CGPA.",
      "The degree gave structure to a curiosity that increasingly moved outside lectures and into building tools of my own.",
    ],
    proof: [{ label: "Degree grade sheet", href: "https://drive.google.com/file/d/1X3ihQC2I4Si5AzFIHvylql58OJk4IBIC/view?usp=sharing" }],
  },
  {
    id: "vide", year: "2017–18", title: "Built vIDE and Injectorist", aside: "From editor tabs to wireless packets.", chapter: "Learning by making",
    highlight: "Built an IDE and a wireless-card testing script while exploring systems.", tone: "green", doodle: "wireless",
    paragraphs: [
      "I started programming in earnest and built vIDE, a personal C++ and Python editor shaped by the quick compile-and-run loop I wanted while learning. Its public repository is still a snapshot of that early instinct to make my own tools.",
      "Injectorist was another early experiment: a Bash script that checks connected wireless cards for packet injection capability. It grew out of my exploration of networking and cybersecurity, alongside a brief spell of competitive programming.",
    ],
    artifact: { src: "/profile/vide-ide.png", alt: "Screenshot of the vIDE editor from its GitHub repository", caption: "A screenshot kept in the vIDE repository." },
    proof: [
      { label: "vIDE · GitHub", href: "https://github.com/Enixes/vIDE" },
      { label: "Injectorist · GitHub", href: "https://github.com/Enixes/Injectorist" },
    ],
  },
  {
    id: "holisol", year: "2019", title: "Shipped Holisol’s daily run-sheet tool", aside: "The code got a real shift.", chapter: "First production delivery",
    highlight: "Built a Django delivery tool approved for daily operations.", tone: "pink", doodle: "route",
    paragraphs: [
      "During a software development internship at Holisol Logistics, I took a Daily Run Sheet Generator from requirements through a Django frontend to deployment. It helped plan logistics deliveries and was approved by the founder for live daily operations.",
      "It was the first time the outcome of my code depended on people using it at work, every day. That changed what delivery meant to me.",
    ],
    proof: [{ label: "Academic CV account", href: "https://docs.google.com/document/d/18Doo1tMaCr-BnjtHryovwuKkkuCZRNkLwYFxggUtCi4/edit?tab=t.0" }],
  },
  {
    id: "ion", year: "2020–now", title: "Joined ION to work on trading systems", aside: "The edge cases had a clock.", chapter: "Production systems",
    highlight: "Working on real-time trading workflows, recovery, and throughput.", tone: "lilac", doodle: "clock",
    paragraphs: [
      "At ION I work on XTP, a real-time back-office trading product used by major financial firms. The work crosses Java concurrency, event-driven processing, Oracle, production incidents, and client delivery.",
      "The journey has included a 20× trade-processing throughput improvement, a 90% cut in downtime through automatic recovery, and an IONathon-winning off-heap cache. The Systems board opens up the engineering behind those results.",
    ],
    proof: [
      { label: "Explore the Systems board", href: "#work-board" },
      { label: "IONathon recognition", href: "https://lnkd.in/p/g48cHXEA" },
      { label: "Academic CV account", href: "https://docs.google.com/document/d/18Doo1tMaCr-BnjtHryovwuKkkuCZRNkLwYFxggUtCi4/edit?tab=t.0" },
    ],
  },
  {
    id: "paper", year: "2021", title: "Published first-author optimisation research", aside: "The question left the notebook.", chapter: "Research",
    highlight: "A feature-selection study appeared in Cognitive Computation.", tone: "blue", doodle: "graph",
    paragraphs: [
      "I developed Hybrid Social Group Optimization to improve exploration in a machine-learning feature-selection task. Paired with a support vector classifier, the published chest X-ray study reported 99.65% accuracy on its study dataset.",
      "The paper was published online in 2021 in Cognitive Computation. It taught me to be precise about what a measured result does, and does not, say.",
    ],
    proof: [{ label: "Read the published paper", href: "https://link.springer.com/article/10.1007/s12559-021-09848-3" }],
  },
  {
    id: "boxy", year: "2024–now", title: "Co-founded Boxy Buildcon", aside: "The systems stepped off-screen.", chapter: "Home automation",
    highlight: "Leading technical work for home-automation projects.", tone: "green", doodle: "house",
    paragraphs: [
      "As co-founder and Technical Director for Home Automation at Boxy Buildcon, I translate client requirements into system designs, contribute hands-on technical work, and occasionally supervise on-site execution.",
      "The work keeps the same engineering question in view: does the design survive contact with the place and people it was made for?",
    ],
    proof: [{ label: "Academic CV account", href: "https://docs.google.com/document/d/18Doo1tMaCr-BnjtHryovwuKkkuCZRNkLwYFxggUtCi4/edit?tab=t.0" }],
  },
  {
    id: "current", year: "Now", title: "Benchmarking TailCache; building an AI assistant", aside: "The next chapter is in pencil.", chapter: "Current projects",
    highlight: "Studying tail latency and building an assistant with persistent state.", tone: "yellow", doodle: "pencil",
    paragraphs: [
      "TailCache is a reproducible Java 21/JMH study comparing Caffeine and Chronicle Map. It looks at p50 through p99.9 latency and the trade-offs between heap pressure and off-heap access. The research is in progress.",
      "A personal assistant project brings together asynchronous Python messaging, NVIDIA models, persistent state, Docker, and Prometheus/Grafana monitoring. It has run across more than 100 sessions with sub-two-second median response and no data loss during a 30-day continuous run.",
      "I keep returning to the same habit: make a useful thing, observe it honestly, and improve what the evidence reveals.",
    ],
    proof: [
      { label: "Explore TailCache", href: "https://github.com/Enixes/TailCache" },
      { label: "Academic CV account", href: "https://docs.google.com/document/d/18Doo1tMaCr-BnjtHryovwuKkkuCZRNkLwYFxggUtCi4/edit?tab=t.0" },
    ],
  },
];
