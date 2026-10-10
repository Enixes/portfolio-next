import type { ReactNode } from "react";

/** Original ink diagrams. They illustrate each case without posing as documentation. */
export function WorkCaseArtwork({ caseId }: { caseId: string }) {
  const drawings: Record<string, ReactNode> = {
    throughput: <><path d="M6 14h33m0 0 26 14m-26-14 26-4m-26 4 26 37m0-23h45m-45 23h45m-45-41h45" /><circle cx="39" cy="14" r="5" /><circle cx="65" cy="28" r="4" /><circle cx="65" cy="10" r="4" /><circle cx="65" cy="51" r="4" /><path d="m110 10 14 0m-14 18 26 0m-26 23 39 0" /></>,
    cache: <><path d="M6 35h28m-6-7 7 7-7 7M41 10h46v43H41zM50 20h28m-28 10h20m-20 10h28M89 35h27m-7-7 7 7-7 7" /><ellipse cx="141" cy="20" rx="17" ry="6" /><path d="M124 20v27c0 8 34 8 34 0V20M124 34c0 8 34 8 34 0" /></>,
    recovery: <><path d="M6 41h25l9-23 15 38 12-26 7 11h18" /><path d="M105 35a25 25 0 1 1 22 25m-4-13 4 13 12-6" /><path d="m113 35 8 8 14-16" /></>,
    alazium: <><path d="M8 14h83v43H8zM18 25h58m-58 10h43m-43 10h50" /><circle cx="112" cy="32" r="21" /><path d="m127 47 26 20m-50-35h17m-8-9v18" /></>,
    database: <><ellipse cx="37" cy="16" rx="27" ry="8" /><path d="M10 16v34c0 10 54 10 54 0V16M10 32c0 10 54 10 54 0" /><path d="M77 24h30m-7-7 7 7-7 7" /><path d="M119 12h36v43h-36zM125 25h24m-24 10h17m-17 10h24" /></>,
    ci: <><path d="M10 30h40m0 0 24-20m-24 20 24 20M74 10h35m-35 40h35m0-40 25 20m-25 20 25-20m0 0h24" /><circle cx="50" cy="30" r="6" /><rect x="129" y="22" width="25" height="16" rx="2" /></>,
    holisol: <><path d="M8 52c25-29 47 15 80-16s51 7 73-13" strokeDasharray="3 5" /><path d="M42 19h45v26H42zM53 26h23m-23 8h17m-17 8 6 5 12-14" /><path d="M98 39h29l8 9h7v9H93v-9h5z" /><circle cx="105" cy="57" r="5" /><circle cx="130" cy="57" r="5" /></>,
    tailcache: <><path d="M13 53a54 54 0 0 1 108 0M67 53l30-27" /><circle cx="67" cy="53" r="5" /><path d="M132 18h29m-29 12h24m-24 12h29" /></>,
    hsgo: <><circle cx="44" cy="30" r="20" /><circle cx="44" cy="30" r="5" /><path d="M64 30h34m0 0 20-15m-20 15 20 15m-20-15 31 0" /><circle cx="120" cy="15" r="7" /><circle cx="120" cy="45" r="7" /><circle cx="137" cy="30" r="7" /></>,
    mining: <><path d="M8 56 46 12l25 31 20-20 52 33H8z" /><path d="M57 41c16-17 41-17 57 0-16 17-41 17-57 0z" /><circle cx="85" cy="41" r="8" /></>,
  };
  return <span className="work-case-art" aria-hidden="true">
    <svg viewBox="0 0 168 70" preserveAspectRatio="xMidYMid meet" focusable="false">{drawings[caseId]}</svg>
  </span>;
}
