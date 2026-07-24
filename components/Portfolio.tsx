"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { FormEvent, useEffect, useState } from "react";
import { cv, type Project } from "@/data/cv";
import { Hero3D } from "@/components/three/Hero3D";

const reveal = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-10%" },
  transition: { duration: 0.65, ease: [0.2, 0.7, 0.2, 1] as const },
};

const particleSkills = ["SYSTEM", "JAVA", "AI", "C#", "PYTHON", "SQL", "SPRING"];

function ProjectModal({
  project,
  onClose,
}: {
  project: Project;
  onClose: () => void;
}) {
  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", closeOnEscape);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", closeOnEscape);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <motion.div
      className="fixed inset-0 z-[100] grid place-items-center bg-black/70 p-3 backdrop-blur-md sm:p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onMouseDown={(event) => {
        if (event.currentTarget === event.target) onClose();
      }}
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby="project-title"
        className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-[30px] border border-white/10 bg-[#0c1016] p-6 shadow-2xl sm:p-10"
        initial={{ opacity: 0, y: 30, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.97 }}
        transition={{ duration: 0.28 }}
      >
        <div className="flex items-start justify-between gap-6">
          <div>
            <p className="mono-label text-[#27e8ff]">Selected project</p>
            <h2
              id="project-title"
              className="mt-4 text-4xl font-medium tracking-[-0.05em] sm:text-6xl"
            >
              {project.title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-white/10 text-xl transition hover:bg-white hover:text-black"
            aria-label="Close project details"
          >
            ×
          </button>
        </div>

        <p className="mt-7 max-w-2xl text-lg leading-relaxed text-[#a2acb0]">
          {project.summary}
        </p>
        <div className="mt-8 space-y-4 border-t border-white/10 pt-7">
          {project.details.map((detail) => (
            <p key={detail} className="leading-relaxed text-[#d2d8da]">
              {detail}
            </p>
          ))}
        </div>
        <div className="mt-8 flex flex-wrap gap-2">
          {project.stack.map((item) => (
            <span key={item} className="skill-chip">
              {item}
            </span>
          ))}
        </div>
        <a
          href={cv.github}
          target="_blank"
          rel="noreferrer"
          className="mt-9 inline-flex rounded-full bg-white px-5 py-3 font-mono text-xs uppercase tracking-[0.12em] text-black transition hover:bg-[#27e8ff]"
        >
          Explore GitHub profile ↗
        </a>
      </motion.div>
    </motion.div>
  );
}

export function Portfolio() {
  const reduceMotion = useReducedMotion();
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [particleSkillIndex, setParticleSkillIndex] = useState(0);
  const activeParticleSkill = particleSkills[particleSkillIndex];
  const nextParticleSkill =
    particleSkills[(particleSkillIndex + 1) % particleSkills.length];

  useEffect(() => {
    setMounted(true);
  }, []);

  const submitContact = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") || "");
    const message = String(form.get("message") || "");
    window.location.href = `mailto:${cv.email}?subject=${encodeURIComponent(
      `Portfolio enquiry from ${name}`,
    )}&body=${encodeURIComponent(message)}`;
  };

  return (
    <>
      <div className="noise" />

      <header className="fixed left-3 right-3 top-3 z-50 sm:left-6 sm:right-6 sm:top-5">
        <div className="mx-auto flex h-14 max-w-[1440px] items-center justify-between rounded-full border border-white/10 bg-[#090c11]/80 px-4 shadow-[0_10px_40px_rgba(0,0,0,.28)] backdrop-blur-xl sm:h-16 sm:px-6">
          <a href="#top" className="text-sm font-medium tracking-[-0.02em]">
            Asu Singh
          </a>
          <nav className="hidden items-center gap-1 md:flex" aria-label="Main navigation">
            {["About", "Experience", "Projects", "Skills", "Contact"].map(
              (item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  className="rounded-full px-4 py-3 font-mono text-[10px] uppercase tracking-[0.12em] text-[#a2acb0] transition hover:bg-white hover:text-black"
                >
                  {item}
                </a>
              ),
            )}
          </nav>
          <a
            href={`mailto:${cv.email}`}
            className="hidden items-center gap-2 font-mono text-[10px] uppercase tracking-[0.12em] sm:flex"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-[#70ff91] shadow-[0_0_12px_#70ff91]" />
            Let&apos;s talk
          </a>
          <button
            type="button"
            className="grid h-9 w-9 place-items-center rounded-full border border-white/10 font-mono text-sm md:hidden"
            aria-label="Toggle navigation"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? "×" : "≡"}
          </button>
        </div>
        <AnimatePresence>
          {menuOpen && (
            <motion.nav
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mx-auto mt-2 grid max-w-[1440px] rounded-3xl border border-white/10 bg-[#0c1016] p-3 shadow-xl md:hidden"
              aria-label="Mobile navigation"
            >
              {["About", "Experience", "Projects", "Skills", "Contact"].map(
                (item) => (
                  <a
                    key={item}
                    href={`#${item.toLowerCase()}`}
                    onClick={() => setMenuOpen(false)}
                    className="rounded-2xl px-4 py-3 font-mono text-xs uppercase tracking-[0.12em] hover:bg-white/5"
                  >
                    {item}
                  </a>
                ),
              )}
            </motion.nav>
          )}
        </AnimatePresence>
      </header>

      <main>
        <section
          id="top"
          className="relative min-h-[920px] overflow-hidden pt-28 sm:min-h-screen"
        >
          <div className="container-shell relative min-h-[880px] sm:min-h-[max(900px,calc(100vh-80px))]">
            <motion.div
              className="relative z-10 max-w-[730px] pt-24 sm:pt-36 lg:pt-44"
              initial={reduceMotion ? false : { opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="mono-label flex items-center gap-3 text-[#27e8ff]">
                <span className="h-2 w-2 rounded-full bg-[#27e8ff] shadow-[0_0_18px_#27e8ff]" />
                {cv.role}
              </div>
              <h1 className="mt-7 text-[clamp(4.4rem,8vw,9rem)] font-[480] leading-[0.85] tracking-[-0.075em]">
                I make complex systems{" "}
                <button
                  type="button"
                  onClick={() =>
                    setParticleSkillIndex(
                      (current) => (current + 1) % particleSkills.length,
                    )
                  }
                  className="group relative cursor-pointer text-left text-[#6f7980] transition-colors duration-300 hover:text-white"
                  aria-label={`Morph particles into ${nextParticleSkill}`}
                  title={`Click to morph particles into ${nextParticleSkill}`}
                >
                  behave.
                  <span className="absolute -bottom-1 left-1 h-[2px] w-0 bg-gradient-to-r from-[#27e8ff] via-[#7857ff] to-[#ff43d1] transition-all duration-300 group-hover:w-[94%]" />
                </button>
              </h1>
              <div
                className="mt-5 flex items-center gap-3 font-mono text-[9px] uppercase tracking-[0.15em] text-[#738087]"
                aria-live="polite"
              >
                <span className="text-[#27e8ff]">Particle mode</span>
                <span className="h-px w-6 bg-white/15" />
                {activeParticleSkill}
                <span className="hidden text-[#59646a] sm:inline">
                  · click “behave.” to cycle
                </span>
              </div>
              <p className="mt-8 max-w-xl text-lg leading-relaxed text-[#a2acb0] sm:text-xl">
                Backend engineering for environments where throughput, recovery,
                and reliability are not optional.
              </p>
              <div className="mt-12 flex flex-col items-start gap-7 sm:flex-row sm:items-center sm:gap-11">
                <a
                  href="#projects"
                  className="rounded-full bg-white px-5 py-3.5 font-mono text-[11px] uppercase tracking-[0.12em] text-black transition hover:bg-[#27e8ff]"
                >
                  Explore the systems
                </a>
                <a
                  href={`mailto:${cv.email}`}
                  className="font-mono text-xs text-[#a2acb0] transition hover:text-[#27e8ff]"
                >
                  {cv.email} ↗
                </a>
              </div>
            </motion.div>

            <div className="pointer-events-auto absolute -right-[26%] top-[34%] h-[560px] w-[760px] -translate-y-1/2 sm:-right-[16%] sm:top-1/2 sm:h-[720px] sm:w-[900px] lg:-right-[4%] xl:right-[-2%]">
              <Hero3D activeSkill={activeParticleSkill} />
            </div>

            <div className="absolute bottom-3 left-0 right-0 z-10 border-t border-white/10 pt-6">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <span className="mono-label text-[#77848a]">
                  Java · concurrency · event-driven systems · agentic AI
                </span>
                <div className="flex gap-7 sm:gap-10">
                  {cv.metrics.map((metric) => (
                    <div key={metric.label} className="flex items-baseline gap-2">
                      <strong className="text-2xl font-medium tracking-[-0.05em]">
                        {metric.value}
                      </strong>
                      <span className="font-mono text-[9px] uppercase tracking-[0.1em] text-[#77848a]">
                        {metric.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="about" className="section-pad border-t border-white/10">
          <div className="container-shell grid gap-12 lg:grid-cols-[0.7fr_1.3fr]">
            <motion.div {...reveal}>
              <p className="mono-label text-[#27e8ff]">01 / About</p>
            </motion.div>
            <motion.div {...reveal}>
              <h2 className="section-title">
                Built for the <span>messy middle.</span>
              </h2>
              <p className="mt-10 max-w-3xl text-xl leading-relaxed text-[#a2acb0] sm:text-2xl">
                {cv.summary}
              </p>
              <div className="mt-12 grid gap-6 border-t border-white/10 pt-7 sm:grid-cols-3">
                <div>
                  <div className="text-3xl font-medium tracking-[-0.05em]">5+</div>
                  <div className="mono-label mt-2 text-[#77848a]">Years in production</div>
                </div>
                <div>
                  <div className="text-3xl font-medium tracking-[-0.05em]">100 GB+</div>
                  <div className="mono-label mt-2 text-[#77848a]">Logs parsed</div>
                </div>
                <div>
                  <div className="text-3xl font-medium tracking-[-0.05em]">24/7</div>
                  <div className="mono-label mt-2 text-[#77848a]">Agentic system</div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        <section id="experience" className="section-pad bg-[#0a0d12] text-[#f2f7f5]">
          <div className="container-shell">
            <motion.div {...reveal} className="flex items-end justify-between gap-6">
              <div>
                <p className="mono-label text-[#ff43d1]">02 / Experience</p>
                <h2 className="section-title mt-8">
                  Systems in <span className="!text-[#686c6d]">production.</span>
                </h2>
              </div>
              <span className="mono-label hidden text-[#777c7e] sm:block">
                India · 2019—Present
              </span>
            </motion.div>

            <div className="mt-20 space-y-5">
              {cv.experiences.map((experience, index) => (
                <motion.article
                  key={`${experience.company}-${experience.role}`}
                  {...reveal}
                  className="grid gap-8 rounded-[30px] border border-white/10 bg-white/[0.025] p-6 sm:p-9 lg:grid-cols-[0.36fr_0.64fr]"
                >
                  <div>
                    <p className="mono-label text-[#ff43d1]">0{index + 1}</p>
                    <h3 className="mt-5 text-3xl font-medium tracking-[-0.045em]">
                      {experience.role}
                    </h3>
                    <p className="mt-3 text-lg text-[#a7abad]">{experience.company}</p>
                    <p className="mono-label mt-5 leading-relaxed text-[#6f7476]">
                      {experience.location}
                      <br />
                      {experience.dates}
                    </p>
                  </div>
                  <ul className="space-y-5">
                    {experience.bullets.map((bullet) => (
                      <li
                        key={bullet}
                        className="grid grid-cols-[16px_1fr] gap-3 leading-relaxed text-[#c9cccd]"
                      >
                        <span className="mt-2.5 h-1 w-1 rounded-full bg-[#ff43d1] shadow-[0_0_8px_#ff43d1]" />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </motion.article>
              ))}
            </div>
          </div>
        </section>

        <section id="projects" className="section-pad">
          <div className="container-shell">
            <motion.div {...reveal}>
              <p className="mono-label text-[#27e8ff]">03 / Projects</p>
              <h2 className="section-title mt-8">
                Built past the <span>prototype.</span>
              </h2>
            </motion.div>

            <div className="mt-16 grid gap-5 md:grid-cols-2">
              {cv.projects.map((project, index) => (
                <motion.button
                  key={project.slug}
                  type="button"
                  className="project-card cursor-pointer text-left"
                  onClick={() => setActiveProject(project)}
                  {...reveal}
                  aria-label={`View ${project.title} details`}
                >
                  <div className="project-visual">
                    <span className="mono-label absolute left-6 top-6 z-10 text-[#88949a]">
                      System / 0{index + 1}
                    </span>
                    <span className="absolute bottom-6 right-6 z-10 grid h-11 w-11 place-items-center rounded-full bg-white text-lg text-black">
                      ↗
                    </span>
                  </div>
                  <div className="p-6 sm:p-8">
                    <h3 className="text-3xl font-medium tracking-[-0.045em] sm:text-4xl">
                      {project.title}
                    </h3>
                    <p className="mt-4 max-w-xl leading-relaxed text-[#9da7ab]">
                      {project.summary}
                    </p>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        </section>

        <section id="skills" className="section-pad border-y border-white/10 bg-[#0b0f15]">
          <div className="container-shell">
            <motion.div {...reveal} className="grid gap-10 lg:grid-cols-[0.6fr_1.4fr]">
              <div>
                <p className="mono-label text-[#70ff91]">04 / Capabilities</p>
                <h2 className="mt-8 text-5xl font-medium leading-[0.92] tracking-[-0.06em] sm:text-7xl">
                  Tools follow the system.
                </h2>
              </div>
              <div className="grid gap-4">
                {cv.skills.map((group, groupIndex) => (
                  <motion.div
                    key={group.category}
                    className="rounded-[26px] border border-white/10 bg-white/[0.025] p-5 sm:p-7"
                    initial={reduceMotion ? false : { opacity: 0, x: groupIndex % 2 ? 24 : -24 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-8%" }}
                    transition={{ duration: 0.5, delay: groupIndex * 0.035 }}
                  >
                    <p className="mono-label text-[#89949a]">{group.category}</p>
                    <div className="skill-row mt-5">
                      {group.items.map((item) => (
                        <span key={item} className="skill-chip">
                          {item}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        <section className="section-pad">
          <div className="container-shell">
            <motion.div {...reveal}>
              <p className="mono-label text-[#27e8ff]">05 / Research & recognition</p>
              <h2 className="section-title mt-8">
                Curious by <span>default.</span>
              </h2>
            </motion.div>

            <div className="mt-16 grid gap-5 lg:grid-cols-2">
              <motion.article {...reveal} className="rounded-[30px] border border-white/10 p-7 sm:p-9">
                <p className="mono-label text-[#27e8ff]">Publication · {cv.publication.date}</p>
                <h3 className="mt-6 text-3xl font-medium tracking-[-0.045em] sm:text-4xl">
                  {cv.publication.title}
                </h3>
                <p className="mt-3 text-[#7f8b90]">{cv.publication.publisher}</p>
                <p className="mt-7 leading-relaxed text-[#a2acb0]">
                  {cv.publication.detail}
                </p>
              </motion.article>
              <motion.article {...reveal} className="rounded-[30px] border border-white/10 p-7 sm:p-9">
                <p className="mono-label text-[#ff43d1]">Recognition</p>
                <ul className="mt-6 space-y-5">
                  {cv.recognition.map((item) => (
                    <li key={item} className="grid grid-cols-[12px_1fr] gap-3 leading-relaxed">
                      <span className="mt-2.5 h-1 w-1 rounded-full bg-[#ff43d1]" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.article>
              <motion.article {...reveal} className="rounded-[30px] border border-white/10 p-7 sm:p-9 lg:col-span-2">
                <div className="grid gap-8 sm:grid-cols-[0.35fr_0.65fr] sm:items-end">
                  <p className="mono-label text-[#70ff91]">Education</p>
                  <div>
                    <h3 className="text-4xl font-medium tracking-[-0.045em] sm:text-6xl">
                      {cv.education.degree}
                    </h3>
                    <p className="mt-4 text-lg text-[#9da7ab]">
                      {cv.education.institution} · {cv.education.result}
                    </p>
                  </div>
                </div>
              </motion.article>
            </div>
          </div>
        </section>

        <section id="contact" className="section-pad bg-[radial-gradient(circle_at_80%_20%,#7928ff,transparent_42%),#15102b] text-white">
          <div className="container-shell grid gap-14 lg:grid-cols-[0.8fr_1.2fr]">
            <motion.div {...reveal}>
              <p className="mono-label text-white/70">06 / Contact</p>
              <h2 className="mt-8 text-[clamp(4rem,8vw,8rem)] font-[480] leading-[0.85] tracking-[-0.075em]">
                Let&apos;s build something resilient.
              </h2>
              <div className="mt-10 flex flex-wrap gap-x-6 gap-y-3 font-mono text-xs">
                <a href={cv.linkedin} target="_blank" rel="noreferrer" className="hover:underline">
                  LinkedIn ↗
                </a>
                <a href={cv.github} target="_blank" rel="noreferrer" className="hover:underline">
                  GitHub ↗
                </a>
                <a href={`mailto:${cv.email}`} className="hover:underline">
                  Email ↗
                </a>
              </div>
            </motion.div>

            {mounted ? (
              <motion.form
                {...reveal}
                onSubmit={submitContact}
                className="rounded-[32px] border border-white/10 bg-[#090c12] p-6 text-white sm:p-9"
              >
                <div className="grid gap-6 sm:grid-cols-2">
                  <label className="grid gap-2">
                    <span className="mono-label text-[#8e999e]">Name</span>
                    <input
                      required
                      name="name"
                      autoComplete="name"
                      className="border-b border-white/15 bg-transparent py-3 outline-none focus:border-[#27e8ff]"
                      placeholder="Your name"
                    />
                  </label>
                  <label className="grid gap-2">
                    <span className="mono-label text-[#8e999e]">Email</span>
                    <input
                      required
                      type="email"
                      name="email"
                      autoComplete="email"
                      className="border-b border-white/15 bg-transparent py-3 outline-none focus:border-[#27e8ff]"
                      placeholder="you@example.com"
                    />
                  </label>
                </div>
                <label className="mt-8 grid gap-2">
                  <span className="mono-label text-[#8e999e]">Message</span>
                  <textarea
                    required
                    name="message"
                    rows={5}
                    className="resize-none border-b border-white/15 bg-transparent py-3 outline-none focus:border-[#27e8ff]"
                    placeholder="What are you building?"
                  />
                </label>
                <button
                  type="submit"
                  className="mt-8 rounded-full bg-white px-6 py-3.5 font-mono text-[11px] uppercase tracking-[0.12em] text-black transition hover:bg-[#27e8ff]"
                >
                  Compose email ↗
                </button>
              </motion.form>
            ) : (
              <div
                aria-hidden="true"
                className="min-h-[370px] rounded-[32px] border border-white/10 bg-[#090c12]"
              />
            )}
          </div>
        </section>
      </main>

      <footer className="bg-[#05070a] py-8 text-[#f2f7f5]">
        <div className="container-shell flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-sm">Asu Singh · {cv.location}</span>
          <span className="mono-label text-[#777c7e]">
            Built for clarity · engineered for pressure
          </span>
        </div>
      </footer>

      <AnimatePresence>
        {activeProject && (
          <ProjectModal
            project={activeProject}
            onClose={() => setActiveProject(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
