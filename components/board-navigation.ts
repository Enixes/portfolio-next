/** Shared by gesture routing, hash navigation and the camera. The first
 * checkpoint is the start of the sticky board, with no invisible lead-in. */
export const BOARD_NAVIGATE_EVENT = "board:navigate";
export type BoardNavigation = { index: number; immediate?: boolean; reset?: boolean };

/** Spatial stops mirror the clickable zones on the overview board:
 * Profile (upper-left) -> Systems (upper-right) -> Field Notes (lower-left)
 * -> Life -> Contact. Camera motion and the travel marker both consume this
 * map, so forward and reverse navigation always trace the same route. */
export const BOARD_SPATIAL_MAP = [
  { x: 0, y: 0 },
  { x: 1.12, y: 0 },
  { x: 0, y: 1.08 },
  { x: 1.12, y: 1.08 },
  { x: 2.24, y: 1.08 },
] as const;

export function boardGeometry(story: HTMLElement, count: number) {
  const top = window.scrollY + story.getBoundingClientRect().top;
  const travel = Math.max(1, story.offsetHeight - window.innerHeight);
  const step = travel / Math.max(1, count - 1);
  return { top, step, stop: (index: number) => top + step * index };
}

export function boardSurface(panel: HTMLElement) {
  return panel.querySelector<HTMLElement>(
    ".work-cv-board,.life-live-board,.blog-live-board,.profile-live-mounted",
  ) ?? panel.querySelector<HTMLElement>(".story-board-surface");
}

/** Keep successive reading views overlapping, and stop at subsection headers
 * before reading farther down a long dossier. Recalculate after portal layout. */
export function readingDestination(surface: HTMLElement, direction: number) {
  const maximum = Math.max(0, surface.scrollHeight - surface.clientHeight);
  const current = surface.scrollTop;
  const page = Math.max(120, surface.clientHeight * .72);
  const edge = surface.getBoundingClientRect().top;
  const headings = Array.from(surface.querySelectorAll<HTMLElement>(
    ".work-section-heading,.work-story-company,.blog-article,.blog-archive,.life-card,.profile-project-card,.profile-mini-chit",
  )).map((node) => Math.max(0, Math.min(maximum,
    current + node.getBoundingClientRect().top - edge - 24)));
  const stops = [0, ...headings, maximum].sort((a, b) => a - b);
  const next = direction > 0 ? stops.find((value) => value > current + 8)
    : stops.findLast((value) => value < current - 8);
  return direction > 0 ? Math.min(current + page, next ?? maximum)
    : Math.max(current - page, next ?? 0);
}
