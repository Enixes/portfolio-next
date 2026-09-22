// Retained from the Life board's original doodle pass. Render beside the content
// so these sketches need no discovery loop, MutationObserver, or nested portals.
export function Footballer() {
  return <div className="life-motion life-doodle life-doodle-football" aria-hidden="true"><svg viewBox="0 0 150 170">
    <path className="life-doodle-wash" fill="#b7cf93" d="M49 31c17-12 38-9 49 4l-8 36 20 35-20 53H57L43 103l17-34z"/>
    <path className="life-doodle-line" d="M70 16c8-5 20-2 24 6 4 9 0 20-8 24-10 4-21-1-24-10-3-8 1-16 8-20Zm-11 35 27-1 13 39-16 20-2 45M65 79 48 111l-18 25M89 83l22 24 20 11M55 63 36 79l-16 4"/>
    <path className="life-doodle-soft" d="M67 51c8 9 14 13 23 13M51 111c12 4 22 9 31 18M21 84c9 2 18 5 25 10"/>
    <path className="life-doodle-accent" d="M60 55 81 51 93 86 71 93Zm4 9 16 1M72 66v17M69 73h8"/>
    <g className="life-motion football-sketch-ball">
      <circle className="life-doodle-accent" cx="120" cy="132" r="12"/>
      <path className="life-doodle-soft" d="M108 132h24M120 120v24M112 124l16 16M128 124l-16 16"/>
    </g>
    <text x="68" y="82" fill="#9e302a" fontSize="15" fontWeight="900" textAnchor="middle">10</text>
  </svg></div>;
}

export function Reader() {
  return <div className="life-motion life-doodle life-doodle-book" aria-hidden="true"><svg viewBox="0 0 130 110">
    <path className="life-doodle-wash" fill="#dfbd62" d="M8 47c22-11 39-9 57 1 17-10 36-13 57-2l-6 49c-17-8-34-5-50 4-15-9-32-12-52-4z"/>
    <path className="life-doodle-line" d="M9 45c20-9 38-7 56 3 18-10 37-12 56-3l-5 47c-17-7-34-4-51 5-16-9-33-12-51-5Zm56 3v49"/>
    <path className="life-doodle-soft" d="M19 55c13-3 25-1 37 5M18 66c13-3 26-1 38 5M74 57c13-5 25-6 37-2M74 69c13-5 25-6 37-2"/>
    <g className="life-motion reader-page">
      <path fill="#fff4cc" stroke="#63756d" strokeWidth="1.2" d="M65 48c18-10 37-12 56-3l-5 47c-17-7-34-4-51 5Z" />
      <path className="life-doodle-soft" d="M74 57c13-5 25-6 37-2M74 69c13-5 25-6 37-2m-36 12 25-3" />
    </g>
    <path className="life-doodle-accent" d="M43 24c5-12 13-18 24-18 10 0 18 6 22 17M56 27c7 4 15 4 22 0M54 21c3-4 7-5 11-2M73 19c4-2 8-1 11 2"/>
  </svg></div>;
}
