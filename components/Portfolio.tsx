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
      className="fixed inset-0 z-[100] grid place-items-center bg-[#111315]/35 p-3 backdrop-blur-md sm:p-6"
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
        className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-[30px] border border-[#d4d4ce] bg-[#f3f2ed] p-6 shadow-2xl sm:p-10"
        initial={{ opacity: 0, y: 30, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.97 }}
        transition={{ duration: 0.28 }}
      >
        <div className="flex items-start justify-between gap-6">
          <div>
            <p className="mono-label text-[#2155ff]">Selected project</p>
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
            className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-[#d4d4ce] text-xl transition hover:bg-[#111315] hover:text-white"
            aria-label="Close project details"
          >
            ×
          </button>
        </div>

        <p className="mt-7 max-w-2xl text-lg leading-relaxed text-[#62686b]">
          {project.summary}
        </p>
        <div className="mt-8 space-y-4 border-t border-[#d4d4ce] pt-7">
          {project.details.map((detail) => (
            <p key={detail} className="leading-relaxed text-[#353a3c]">
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
          className="mt-9 inline-flex rounded-full bg-[#111315] px-5 py-3 font-mono text-xs uppercase tracking-[0.12em] text-white transition hover:bg-[#2155ff]"
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
        <div className="mx-auto flex h-14 max-w-[1440px] items-center justify-between rounded-full border border-[#d4d4ce] bg-[#f7f6f1]/85 px-4 shadow-[0_2px_9px_rgba(17,19,21,.08)] backdrop-blur-xl sm:h-16 sm:px-6">
          <a href="#top" className="text-sm font-medium tracking-[-0.02em]">
            Asu Singh
          </a>
          <nav className="hidden items-center gap-1 md:flex" aria-label="Main navigation">
            {["About", "Experience", "Projects", "Skills", "Contact"].map(
              (item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  className="rounded-full px-4 py-3 font-mono text-[10px] uppercase tracking-[0.12em] text-[#5f6466] transition hover:bg-[#111315] hover:text-white"
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
            <span className="h-1.5 w-1.5 rounded-full bg-[#35b65a]" />
            Let&apos;s talk
          </a>
          <button
            type="button"
            className="grid h-9 w-9 place-items-center rounded-full border border-[#d4d4ce] font-mono text-sm md:hidden"
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
              className="mx-auto mt-2 grid max-w-[1440px] rounded-3xl border border-[#d4d4ce] bg-[#f7f6f1] p-3 shadow-xl md:hidden"
              aria-label="Mobile navigation"
            >
              {["About", "Experience", "Projects", "Skills", "Contact"].map(
                (item) => (
                  <a
                    key={item}
                    href={`#${item.toLowerCase()}`}
                    onClick={() => setMenuOpen(false)}
                    className="rounded-2xl px-4 py-3 font-mono text-xs uppercase tracking-[0.12em] hover:bg-[#e8e7e1]"
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
          <div className="container-shell relative min-h-[800px] sm:min-h-[calc(100vh-80px)]">
            <motion.div
              className="relative z-10 max-w-[730px] pt-24 sm:pt-36 lg:pt-44"
              initial={reduceMotion ? false : { opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="mono-label flex items-center gap-3 text-[#2155ff]">
                <span className="h-2 w-2 rounded-full bg-[#2155ff] shadow-[0_0_0_6px_rgba(33,85,255,.08)]" />
                {cv.role}
              </div>
              <h1 className="mt-7 text-[clamp(4.4rem,8vw,9rem)] font-[480] leading-[0.85] tracking-[-0.075em]">
                I make complex systems{" "}
                <span className="text-[#929493]">behave.</span>
              </h1>
              <p className="mt-8 max-w-xl text-lg leading-relaxed text-[#596063] sm:text-xl">
                Backend engineering for environments where throughput, recovery,
                and reliability are not optional.
              </p>
              <div className="mt-9 flex flex-wrap items-center gap-5">
                <a
                  href="#projects"
                  className="rounded-full bg-[#111315] px-5 py-3.5 font-mono text-[11px] uppercase tracking-[0.12em] text-white transition hover:bg-[#2155ff]"
                >
                  Explore the systems
                </a>
                <a
                  href={`mailto:${cv.email}`}
                  className="font-mono text-xs text-[#52585a] transition hover:text-[#2155ff]"
                >
                  {cv.email} ↗
                </a>
              </div>
            </motion.div>

            <div className="pointer-events-auto absolute -right-[26%] top-[34%] h-[560px] w-[760px] -translate-y-1/2 sm:-right-[16%] sm:top-1/2 sm:h-[720px] sm:w-[900px] lg:-right-[4%] xl:right-[-2%]">
              <Hero3D />
            </div>

            <div className="absolute bottom-8 left-0 right-0 z-10 border-t border-[#d4d4ce] pt-5">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <span className="mono-label text-[#777c7e]">
                  Java · concurrency · event-driven systems · agentic AI
                </span>
                <div className="flex gap-7 sm:gap-10">
                  {cv.metrics.map((metric) => (
                    <div key={metric.label} className="flex items-baseline gap-2">
                      <strong className="text-2xl font-medium tracking-[-0.05em]">
                        {metric.value}
                      </strong>
                      <span className="font-mono text-[9px] uppercase tracking-[0.1em] text-[#777c7e]">
                        {metric.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="about" className="section-pad border-t border-[#d4d4ce]">
          <div className="container-shell grid gap-12 lg:grid-cols-[0.7fr_1.3fr]">
            <motion.div {...reveal}>
              <p className="mono-label text-[#2155ff]">01 / About</p>
            </motion.div>
            <motion.div {...reveal}>
              <h2 className="section-title">
                Built for the <span>messy middle.</span>
              </h2>
              <p className="mt-10 max-w-3xl text-xl leading-relaxed text-[#555b5e] sm:text-2xl">
                {cv.summary}
              </p>
              <div className="mt-12 grid gap-6 border-t border-[#d4d4ce] pt-7 sm:grid-cols-3">
                <div>
                  <div className="text-3xl font-medium tracking-[-0.05em]">5+</div>
                  <div className="mono-label mt-2 text-[#777c7e]">Years in production</div>
                </div>
                <div>
                  <div className="text-3xl font-medium tracking-[-0.05em]">100 GB+</div>
                  <div className="mono-label mt-2 text-[#777c7e]">Logs parsed</div>
                </div>
                <div>
                  <div className="text-3xl font-medium tracking-[-0.05em]">24/7</div>
                  <div className="mono-label mt-2 text-[#777c7e]">Agentic system</div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        <section id="experience" className="section-pad bg-[#111315] text-[#f3f2ed]">
          <div className="container-shell">
            <motion.div {...reveal} className="flex items-end justify-between gap-6">
              <div>
                <p className="mono-label text-[#7393ff]">02 / Experience</p>
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
                    <p className="mono-label text-[#7393ff]">0{index + 1}</p>
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
                        <span className="mt-2.5 h-1 w-1 rounded-full bg-[#7393ff]" />
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
              <p className="mono-label text-[#2155ff]">03 / Projects</p>
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
                    <span className="mono-label absolute left-6 top-6 z-10 text-[#63696b]">
                      System / 0{index + 1}
                    </span>
                    <span className="absolute bottom-6 right-6 z-10 grid h-11 w-11 place-items-center rounded-full bg-[#111315] text-lg text-white">
                      ↗
                    </span>
                  </div>
                  <div className="p-6 sm:p-8">
                    <h3 className="text-3xl font-medium tracking-[-0.045em] sm:text-4xl">
                      {project.title}
                    </h3>
                    <p className="mt-4 max-w-xl leading-relaxed text-[#62686b]">
                      {project.summary}
                    </p>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        </section>

        <section id="skills" className="section-pad border-y border-[#d4d4ce] bg-[#ebeae4]">
          <div className="container-shell">
            <motion.div {...reveal} className="grid gap-10 lg:grid-cols-[0.6fr_1.4fr]">
              <div>
                <p className="mono-label text-[#2155ff]">04 / Capabilities</p>
                <h2 className="mt-8 text-5xl font-medium leading-[0.92] tracking-[-0.06em] sm:text-7xl">
                  Tools follow the system.
                </h2>
              </div>
              <div className="grid gap-4">
                {cv.skills.map((group, groupIndex) => (
                  <motion.div
                    key={group.category}
                    className="rounded-[26px] border border-[#d1d1cb] bg-[#f3f2ed]/65 p-5 sm:p-7"
                    initial={reduceMotion ? false : { opacity: 0, x: groupIndex % 2 ? 24 : -24 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-8%" }}
                    transition={{ duration: 0.5, delay: groupIndex * 0.035 }}
                  >
                    <p className="mono-label text-[#6c7274]">{group.category}</p>
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
              <p className="mono-label text-[#2155ff]">05 / Research & recognition</p>
              <h2 className="section-title mt-8">
                Curious by <span>default.</span>
              </h2>
            </motion.div>

            <div className="mt-16 grid gap-5 lg:grid-cols-2">
              <motion.article {...reveal} className="rounded-[30px] border border-[#d4d4ce] p-7 sm:p-9">
                <p className="mono-label text-[#2155ff]">Publication · {cv.publication.date}</p>
                <h3 className="mt-6 text-3xl font-medium tracking-[-0.045em] sm:text-4xl">
                  {cv.publication.title}
                </h3>
                <p className="mt-3 text-[#777c7e]">{cv.publication.publisher}</p>
                <p className="mt-7 leading-relaxed text-[#555b5e]">
                  {cv.publication.detail}
                </p>
              </motion.article>
              <motion.article {...reveal} className="rounded-[30px] border border-[#d4d4ce] p-7 sm:p-9">
                <p className="mono-label text-[#2155ff]">Recognition</p>
                <ul className="mt-6 space-y-5">
                  {cv.recognition.map((item) => (
                    <li key={item} className="grid grid-cols-[12px_1fr] gap-3 leading-relaxed">
                      <span className="mt-2.5 h-1 w-1 rounded-full bg-[#2155ff]" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.article>
              <motion.article {...reveal} className="rounded-[30px] border border-[#d4d4ce] p-7 sm:p-9 lg:col-span-2">
                <div className="grid gap-8 sm:grid-cols-[0.35fr_0.65fr] sm:items-end">
                  <p className="mono-label text-[#2155ff]">Education</p>
                  <div>
                    <h3 className="text-4xl font-medium tracking-[-0.045em] sm:text-6xl">
                      {cv.education.degree}
                    </h3>
                    <p className="mt-4 text-lg text-[#62686b]">
                      {cv.education.institution} · {cv.education.result}
                    </p>
                  </div>
                </div>
              </motion.article>
            </div>
          </div>
        </section>

        <section id="contact" className="section-pad bg-[#2155ff] text-white">
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

            <motion.form
              {...reveal}
              onSubmit={submitContact}
              className="rounded-[32px] bg-[#f3f2ed] p-6 text-[#111315] sm:p-9"
            >
              <div className="grid gap-6 sm:grid-cols-2">
                <label className="grid gap-2">
                  <span className="mono-label text-[#6e7377]">Name</span>
                  <input
                    required
                    name="name"
                    autoComplete="name"
                    className="border-b border-[#c9c9c3] bg-transparent py-3 outline-none focus:border-[#2155ff]"
                    placeholder="Your name"
                  />
                </label>
                <label className="grid gap-2">
                  <span className="mono-label text-[#6e7377]">Email</span>
                  <input
                    required
                    type="email"
                    name="email"
                    autoComplete="email"
                    className="border-b border-[#c9c9c3] bg-transparent py-3 outline-none focus:border-[#2155ff]"
                    placeholder="you@example.com"
                  />
                </label>
              </div>
              <label className="mt-8 grid gap-2">
                <span className="mono-label text-[#6e7377]">Message</span>
                <textarea
                  required
                  name="message"
                  rows={5}
                  className="resize-none border-b border-[#c9c9c3] bg-transparent py-3 outline-none focus:border-[#2155ff]"
                  placeholder="What are you building?"
                />
              </label>
              <button
                type="submit"
                className="mt-8 rounded-full bg-[#111315] px-6 py-3.5 font-mono text-[11px] uppercase tracking-[0.12em] text-white transition hover:bg-[#2155ff]"
              >
                Compose email ↗
              </button>
            </motion.form>
          </div>
        </section>
      </main>

      <footer className="bg-[#111315] py-8 text-[#f3f2ed]">
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
