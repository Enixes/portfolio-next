"use client";

import { useEffect } from "react";

type SketchDecoration = {
  wash: string;
  washPath: string;
  detailPaths: string[];
};

const SVG_NS = "http://www.w3.org/2000/svg";

const decorations: Record<string, SketchDecoration[]> = {
  profile: [
    {
      wash: "#e8bb63",
      washPath: "M18 94 C42 54 76 52 104 66 C128 76 144 44 169 31 L171 63 C143 62 135 94 104 96 C77 98 48 86 18 104 Z",
      detailPaths: [
        "M24 82 C42 76 57 77 72 82 M104 60 C119 53 130 40 140 29",
        "M39 69 l6 11 m5-14 l5 12 m8-11 l4 11 M127 44 l7 8 m3-16 l6 7",
      ],
    },
    {
      wash: "#83b8c8",
      washPath: "M16 104 L18 41 L54 40 L57 20 L99 17 L100 50 L140 51 L140 105 Z",
      detailPaths: [
        "M22 108 L54 78 L98 78 L138 106 M55 40 L99 50 M54 78 L54 40 M99 78 L99 18",
        "M28 53 h17 M28 62 h17 M65 32 h19 M65 42 h19 M111 64 h18 M111 74 h18 M111 84 h18",
        "M16 111 C43 116 84 114 145 108",
      ],
    },
  ],
  work: [
    {
      wash: "#d8b6d9",
      washPath: "M6 52 H52 V91 H6 Z M84 23 H141 V61 H84 Z M84 70 H141 V108 H84 Z M173 46 H218 V87 H173 Z",
      detailPaths: [
        "M17 49 l8 -8 m6 8 l8 -8 M95 20 l8 -8 m8 8 l8 -8 M184 43 l8 -8 m8 8 l8 -8",
        "M61 55 C70 50 77 43 83 36 M61 83 C72 87 77 92 83 97 M143 40 C155 43 162 51 171 59 M143 95 C155 89 162 80 171 72",
      ],
    },
    {
      wash: "#efd170",
      washPath: "M17 92 C37 78 42 84 55 61 C67 43 72 58 84 40 C96 21 108 45 121 27 C130 16 139 15 145 14 L145 99 L17 99 Z",
      detailPaths: [
        "M22 83 l9 6 m10-22 l10 6 m11-24 l9 5 m12-21 l8 5 m13-17 l9 4",
        "M29 99 v-8 M52 99 v-8 M75 99 v-8 M98 99 v-8 M121 99 v-8",
      ],
    },
  ],
  blog: [
    {
      wash: "#9fd0d7",
      washPath: "M18 31 C50 21 81 28 105 45 V124 C78 107 50 103 18 111 Z M202 31 C170 21 139 28 115 45 V124 C142 107 170 103 202 111 Z",
      detailPaths: [
        "M108 44 V126 M28 92 C55 84 80 88 98 98 M122 98 C143 88 166 85 192 92",
        "M29 38 l8 -8 M47 34 l7 -8 M173 34 l-7 -8 M192 39 l-8 -8",
      ],
    },
    {
      wash: "#e9a8a8",
      washPath: "M18 77 C42 45 61 45 78 58 C96 71 108 60 121 42 C132 26 142 24 151 27 L149 53 C135 51 128 60 118 73 C103 92 86 92 69 82 C52 72 39 72 23 92 Z",
      detailPaths: [
        "M36 90 c13 8 27 10 43 7 M50 48 l5 10 m7-13 l5 10 M116 42 l7 8 m4-15 l7 7",
        "M20 100 C47 108 75 109 101 103",
      ],
    },
  ],
  life: [
    {
      wash: "#d8b16f",
      washPath: "M30 217 L44 80 L93 66 L98 35 L151 22 L158 69 L202 58 L211 92 L264 78 L276 217 Z",
      detailPaths: [
        "M45 80 L95 111 L158 69 L210 92 L264 78 M95 111 L95 217 M158 69 L158 217 M210 92 L210 217",
        "M34 188 L95 159 L158 178 L210 151 L274 178 M31 203 L95 174 L158 192 L210 166 L274 194",
        "M48 69 l49 -35 M94 65 l64 -43 M157 68 l45 -11 M203 57 l61 21",
        "M52 98 l-12 82 M75 90 l-10 102 M121 75 l-11 128 M183 79 l-8 128 M233 87 l-6 119",
      ],
    },
    {
      wash: "#8eb8d7",
      washPath: "M24 59 C24 37 38 23 57 23 C77 23 90 38 90 59 C90 79 77 94 56 94 C36 94 24 79 24 59 Z",
      detailPaths: [
        "M28 58 C42 51 69 50 85 58 M55 28 C61 41 65 72 56 89",
        "M101 78 C118 52 137 46 165 49 M109 84 l8 -3 m8 -8 l8 -4 m10 -9 l9 -2",
      ],
    },
  ],
  contact: [
    {
      wash: "#efc969",
      washPath: "M15 26 H181 V108 H15 Z",
      detailPaths: [
        "M27 39 h38 M27 50 h51 M123 86 h41 M123 96 h28",
        "M147 36 C158 35 166 42 166 53 C166 65 156 70 147 66 C138 61 138 43 147 36 Z",
      ],
    },
    {
      wash: "#9fc9d5",
      washPath: "M17 95 C49 78 69 60 83 35 C94 17 113 15 147 21 L139 43 C116 37 107 43 99 56 C84 80 60 99 24 108 Z",
      detailPaths: [
        "M58 77 l9 2 m4-12 l10 1 m2-13 l10 -2 M113 28 l9 -4 m7 0 l10 -2",
        "M31 99 C48 104 61 104 75 101",
      ],
    },
  ],
};

const styles = `
/* Doodles are a third visual lane: not behind the cards, not on top of them.
   The controller below reserves actual negative space for each sketch. */
.board-alive-layer {
  z-index: 3 !important;
  overflow: hidden !important;
}
.board-alive-layer > svg,
.board-alive-layer > .alive-marker-note {
  visibility: hidden;
}
.board-alive-layer > svg[data-doodle-placed="true"],
.board-alive-layer > .alive-marker-note[data-doodle-placed="true"] {
  visibility: visible;
}
.board-alive-layer svg {
  isolation: isolate;
}
.board-alive-wash {
  stroke: none;
  opacity: 0;
  transform-box: fill-box;
  transform-origin: center;
}
.board-alive-detail {
  fill: none;
  stroke: color-mix(in srgb, var(--doodle-ink, #315d72) 72%, #20262a 28%);
  stroke-width: 1.25;
  stroke-linecap: round;
  stroke-linejoin: round;
  vector-effect: non-scaling-stroke;
  stroke-dasharray: 1;
  stroke-dashoffset: 1;
  opacity: .56;
}
.scroll-board-panel[style*="opacity: 1"] .board-alive-detail {
  animation: aliveDetailDraw var(--dur,9s) cubic-bezier(.22,.72,.22,1) calc(var(--delay,0s) + .22s) infinite;
}
.scroll-board-panel[style*="opacity: 1"] .board-alive-wash {
  animation: aliveColorWash var(--dur,9s) cubic-bezier(.2,.7,.22,1) var(--delay,0s) infinite;
}

/* Make the marker wash look hand-applied instead of like a clean SVG fill. */
.board-alive-layer svg:nth-of-type(odd) .board-alive-wash { transform:rotate(-1.4deg) scale(.98,1.03); }
.board-alive-layer svg:nth-of-type(even) .board-alive-wash { transform:rotate(1.2deg) scale(1.025,.97); }

@keyframes aliveDetailDraw {
  0%,14% { stroke-dashoffset:1; opacity:.04; }
  26%,68% { stroke-dashoffset:0; opacity:.6; }
  82%,100% { stroke-dashoffset:1; opacity:.03; }
}
@keyframes aliveColorWash {
  0%,27% { opacity:0; transform:scale(.72) rotate(-2deg); }
  37% { opacity:.12; }
  46%,68% { opacity:.28; transform:scale(1) rotate(.7deg); }
  78% { opacity:.18; }
  90%,100% { opacity:0; transform:scale(1.04) rotate(1.2deg); }
}

@media (max-width:760px) {
  .board-alive-layer { z-index:2!important; }
}

@media (prefers-reduced-motion:reduce) {
  .board-alive-detail { stroke-dashoffset:0!important; animation:none!important; }
  .board-alive-wash { opacity:.18!important; animation:none!important; }
}
`;

function intersects(a: DOMRect, b: DOMRect, gap = 12) {
  return !(
    a.right + gap <= b.left ||
    a.left >= b.right + gap ||
    a.bottom + gap <= b.top ||
    a.top >= b.bottom + gap
  );
}

function enrichSketches(surface: HTMLElement, kind: string) {
  const svgs = Array.from(surface.querySelectorAll<SVGSVGElement>(".board-alive-layer svg"));
  const specs = decorations[kind] ?? [];

  svgs.forEach((svg, index) => {
    if (svg.dataset.polished === "true") return;
    const spec = specs[index % Math.max(1, specs.length)];
    if (!spec) return;

    const wash = document.createElementNS(SVG_NS, "path");
    wash.setAttribute("class", "board-alive-wash");
    wash.setAttribute("d", spec.washPath);
    wash.setAttribute("fill", spec.wash);
    svg.insertBefore(wash, svg.firstChild);

    spec.detailPaths.forEach((d) => {
      const detail = document.createElementNS(SVG_NS, "path");
      detail.setAttribute("class", "board-alive-detail");
      detail.setAttribute("pathLength", "1");
      detail.setAttribute("d", d);
      svg.appendChild(detail);
    });

    svg.dataset.polished = "true";
  });
}

function layoutDoodles(surface: HTMLElement) {
  const layer = surface.querySelector<HTMLElement>(".board-alive-layer");
  if (!layer) return;

  const items = Array.from(
    layer.querySelectorAll<HTMLElement>("svg, .alive-marker-note"),
  );
  if (!items.length) return;

  const blockers = Array.from(
    surface.querySelectorAll<HTMLElement>(
      [
        ".story-board-header",
        ".story-case",
        ".story-board-footnote",
        ".profile-live-header",
        ".profile-live-photo",
        ".profile-now-card",
        ".profile-project-card",
        ".profile-mini-chit",
        ".profile-signal",
        ".profile-status-stamp",
        ".work-cv-header",
        ".work-company-chit",
        ".work-evidence-chit",
        ".work-tenure-tag",
        ".work-cv-legend",
        ".work-cv-footnote",
      ].join(","),
    ),
  ).filter((node) => !layer.contains(node) && node.getBoundingClientRect().width > 4);

  const surfaceRect = surface.getBoundingClientRect();
  if (surfaceRect.width < 40 || surfaceRect.height < 40) return;

  const candidates = [
    [0.02, 0.16], [0.78, 0.12], [0.02, 0.72], [0.78, 0.72],
    [0.40, 0.08], [0.40, 0.78], [0.02, 0.43], [0.82, 0.43],
    [0.22, 0.10], [0.62, 0.10], [0.22, 0.80], [0.62, 0.80],
  ] as const;

  const placed: DOMRect[] = [];
  const compact = window.innerWidth <= 760;

  items.forEach((item, itemIndex) => {
    item.dataset.doodlePlaced = "false";
    item.style.removeProperty("display");
    item.style.removeProperty("right");
    item.style.removeProperty("bottom");
    item.style.visibility = "hidden";

    const preferred = candidates.slice(itemIndex % candidates.length).concat(
      candidates.slice(0, itemIndex % candidates.length),
    );
    const scales = compact ? [0.72, 0.6, 0.5] : [1, 0.88, 0.76, 0.64];
    let found = false;

    for (const scale of scales) {
      item.style.scale = String(scale);
      for (const [nx, ny] of preferred) {
        const itemRect = item.getBoundingClientRect();
        const maxX = Math.max(8, surface.clientWidth - itemRect.width / Math.max(scale, .01) - 16);
        const maxY = Math.max(8, surface.clientHeight - itemRect.height / Math.max(scale, .01) - 16);
        item.style.left = `${8 + nx * Math.max(0, maxX - 8)}px`;
        item.style.top = `${8 + ny * Math.max(0, maxY - 8)}px`;

        const rect = item.getBoundingClientRect();
        const inside =
          rect.left >= surfaceRect.left + 5 &&
          rect.top >= surfaceRect.top + 5 &&
          rect.right <= surfaceRect.right - 5 &&
          rect.bottom <= surfaceRect.bottom - 5;
        if (!inside) continue;

        const overlapsContent = blockers.some((blocker) =>
          intersects(rect, blocker.getBoundingClientRect(), compact ? 7 : 12),
        );
        const overlapsDoodle = placed.some((other) => intersects(rect, other, compact ? 5 : 9));

        if (!overlapsContent && !overlapsDoodle) {
          item.dataset.doodlePlaced = "true";
          item.style.visibility = "visible";
          placed.push(rect);
          found = true;
          break;
        }
      }
      if (found) break;
    }

    if (!found) {
      // A missing doodle is preferable to art sitting on top of readable content.
      item.style.display = "none";
    }
  });
}

export function BoardDoodlePolish() {
  useEffect(() => {
    let frame = 0;
    let settleTimer = 0;

    const run = () => {
      document.querySelectorAll<HTMLElement>(".story-board-surface").forEach((surface) => {
        const layer = surface.querySelector<HTMLElement>(".board-alive-layer");
        if (!layer) return;
        const kindClass = Array.from(layer.classList).find((name) => name.startsWith("alive-"));
        const kind = kindClass?.replace("alive-", "") ?? "";
        enrichSketches(surface, kind);
        layoutDoodles(surface);
      });
    };

    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => requestAnimationFrame(run));
      window.clearTimeout(settleTimer);
      settleTimer = window.setTimeout(run, 1250);
    };

    schedule();
    const observer = new MutationObserver(schedule);
    observer.observe(document.body, { childList: true, subtree: true });
    window.addEventListener("resize", schedule, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", schedule);
      cancelAnimationFrame(frame);
      window.clearTimeout(settleTimer);
    };
  }, []);

  return <style dangerouslySetInnerHTML={{ __html: styles }} />;
}
