import type { SystemsSkillCluster } from "@/data/systems-skills";

/** Small self-contained ink scenes. Every part has a complete resting pose. */
export function SystemsSkillScene({ motif }: { motif: SystemsSkillCluster["motif"] }) {
  const art = {
    code: <>
      <rect x="21" y="10" width="144" height="72" rx="5" className="work-drawing-sheet" />
      <path d="M21 23h144M32 17h4m5 0h4m5 0h4" />
      <path d="M39 42h31m-31 12h59m-59 12h45" className="work-drawing-lines" />
      <path d="m112 38-10 10 10 10m18-20 10 10-10 10m-13 5 8-30" className="work-drawing-a" />
      <path d="M178 34h60m-60 15h49m-49 15h61" className="work-drawing-b" />
      <rect x="234" y="60" width="3" height="13" className="work-drawing-c" />
    </>,
    plug: <>
      <rect x="20" y="21" width="73" height="49" rx="8" className="work-drawing-sheet" />
      <rect x="179" y="21" width="73" height="49" rx="8" className="work-drawing-sheet" />
      <path d="M36 37h41m-41 11h28m-28 11h34M194 37h41m-41 11h32m-32 11h38" />
      <path d="M95 45h31m20 0h31" className="work-drawing-line" />
      <path d="M125 35v21m9-21v21m0-15h12v8h-12" className="work-drawing-a" />
      <path d="m119 21 3 7m21-7-3 7m-12 37v7" className="work-drawing-b" />
      <circle cx="134" cy="45" r="4" className="work-drawing-c" />
    </>,
    pulse: <>
      <path d="M17 62h50l9-25 17 43 17-37 11 19h42" className="work-drawing-a" />
      <path d="M160 54a38 38 0 1 1 35 32m-8-17 8 17 16-10" className="work-drawing-b" pathLength="1" />
      <circle cx="195" cy="47" r="11" className="work-drawing-sheet" />
      <path d="m189 47 5 5 9-11" className="work-drawing-c" />
      <circle cx="22" cy="23" r="3" /><circle cx="36" cy="23" r="3" /><circle cx="50" cy="23" r="3" />
    </>,
    database: <>
      <path d="M22 22h91v54H22zM31 35h70m-70 12h58m-58 12h64" className="work-drawing-sheet" />
      <path d="M43 14h91v54" className="work-drawing-b" />
      <ellipse cx="206" cy="29" rx="35" ry="11" className="work-drawing-a" />
      <path d="M171 29v36c0 15 70 15 70 0V29M171 47c0 15 70 15 70 0" className="work-drawing-a" />
      <path d="m142 42 20 0m-8-8 8 8-8 8" className="work-drawing-c" />
    </>,
    spark: <>
      <path d="M53 17h67v62H53zM66 32h39m-39 12h30m-30 12h39" className="work-drawing-sheet work-drawing-a" />
      <path d="M148 9h67v62h-67zM161 24h39m-39 12h31m-31 12h39" className="work-drawing-sheet work-drawing-b" />
      <path d="M126 20c-34-13-65-2-80 18m171 32c-25 23-69 19-92 9" className="work-drawing-orbit" />
      <path d="M132 45v12m-6-6h12m-46 24 6 6m103-72 6 6" className="work-drawing-c" />
      <circle cx="130" cy="51" r="12" className="work-drawing-c" />
    </>,
    tick: <>
      <path d="M29 11h174v68H29zM29 26h174" className="work-drawing-sheet" />
      <path d="M45 41h12v12H45zm0 23h12v12H45zm64-23h12v12h-12zm0 23h12v12h-12z" />
      <path d="m46 45 6 6 12-16m45 11 5 5 11-17m-79 35 6 6 12-16m45 10 5 6 11-17" className="work-drawing-a" pathLength="1" />
      <path d="M217 37h22m-22 11h15m-15 11h22" className="work-drawing-b" />
      <circle cx="244" cy="60" r="8" className="work-drawing-c" />
    </>,
    conversation: <>
      <path d="M20 15h99v49H52L33 78V64H20z" className="work-drawing-sheet work-drawing-a" />
      <path d="M154 28h99v45h-16v12l-21-12h-62z" className="work-drawing-sheet work-drawing-b" />
      <path d="M36 32h63m-63 11h48m83 2h66m-66 11h47" />
      <path d="M125 44h21m-8-8 8 8-8 8" className="work-drawing-c" />
      <circle cx="20" cy="10" r="3" /><circle cx="253" cy="20" r="3" />
    </>,
    compass: <>
      <path d="M20 24h204M20 46h204M20 68h204" className="work-drawing-lines" />
      <path d="M217 14v65m0-65h19l-6 9 6 9h-19" className="work-drawing-sheet" />
      <path d="M57 24h66m-53 22h95m-103 22h120" className="work-drawing-a" />
      <circle cx="123" cy="24" r="8" className="work-drawing-b" />
      <circle cx="165" cy="46" r="8" className="work-drawing-c" />
      <path d="m31 18 6 6-6 6m4 10 6 6-6 6" />
    </>,
  }[motif];

  return <div className="work-skill-art" aria-hidden="true">
    <svg className={`work-skill-art-svg scene-${motif}`} viewBox="0 0 270 92" preserveAspectRatio="xMidYMid meet" focusable="false">
      {art}
    </svg>
  </div>;
}
