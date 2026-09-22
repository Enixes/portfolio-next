import type { ReactNode } from "react";

type PostcardProps = {
  subject: "botw" | "witcher" | "fma" | "frieren" | "haikyuu";
  place: string;
  title: string;
  note: string;
  children: ReactNode;
};

export function LifePostcard({ subject, place, title, note, children }: PostcardProps) {
  return (
    <article className={`life-postcard life-${subject}`} data-life-scene={subject} tabIndex={0} aria-labelledby={`life-${subject}-title`}>
      <div className="life-postcard-art" aria-hidden="true">{children}</div>
      <div className="life-postcard-caption">
        <small>{place}</small>
        <h4 id={`life-${subject}-title`}>{title}</h4>
        <p>{note}</p>
      </div>
    </article>
  );
}

// Original ink-and-wash miniatures. Moving groups have no positioning transforms;
// the interaction layer can return them to their drawn resting state cleanly.
export function HyrulePostcard() {
  return <svg viewBox="0 0 360 210" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path fill="#dce9d9" d="m5 9 345-4 5 190-350 8Z" />
    <path fill="#ecedc9" opacity=".7" d="M13 15h329v83C241 81 138 75 13 96Z" />
    <circle cx="278" cy="41" r="22" fill="#f4e9a4" opacity=".8" />
    <g stroke="#708d83" strokeWidth="1.2" strokeLinejoin="round">
      <path fill="#acc5b8" d="m4 104 40-36 18 13 45-53 48 56 29-26 39 25 43-20 47 36 42-22v55H4Z" />
      <path fill="#e2e4cf" d="m84 57 23-29 21 26-13-4-7 6-7-7Z" />
      <path d="m106 34 9 42 11 10M47 73l9 16m130-28 11 23" opacity=".5" />
    </g>
    <path className="life-motion field-far" fill="#99b77a" stroke="#5f8155" strokeWidth="1.4" d="M3 123C59 83 90 87 144 114s94-33 130-18 59 5 81 14v90H3Z" />
    <path fill="#bfd08a" opacity=".6" d="M8 127c56-34 98-21 136-1 59 32 139-38 207-7v29H8Z" />
    <path className="life-motion field-near" fill="#789952" stroke="#496d45" strokeWidth="1.5" d="M2 159c68-50 120-5 182-19s104-30 172-1v63H2Z" />
    <path fill="#bfd37e" d="M5 183c78-19 114-14 177-20 77-8 94-23 173-7v46H5Z" />
    <path stroke="#ecdf9f" strokeWidth="9" opacity=".75" d="M328 202c-56-35-86-10-78-33s26-34 0-36-39-15-33-22" />
    <path stroke="#576f45" strokeDasharray="3 6" strokeWidth="1.4" d="M333 197c-58-30-88-12-80-32s23-27-6-30" />
    <g className="life-motion grass-back" stroke="#526f40" strokeWidth="1.4" strokeLinecap="round">
      <path d="m23 152-3-9m3 9 5-6m30-9 2-8m-2 8-4-4m57 4-4-9m4 9 4-7m61 18-2-9m2 9 6-5m103-8-2-8m2 8 4-4m32 6 3-8" />
    </g>
    <g stroke="#334d3c" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path fill="#735e43" d="m120 137-7 33-10 22 12 1 14-23 10-24m4-7 7 30 9 23 12-2-12-26-2-29" />
      <path fill="#527863" d="m125 77-15 26 10 44 37 1 3-49-15-19Z" />
      <path className="life-motion hero-cloak" fill="#657d47" d="m124 78 21 3 11 27 11 39-39-8-16 7 2-37Z" />
      <path fill="#72a7a3" d="m132 81-9 12 5 31 23 1-1-31-7-13" />
      <path d="m124 123 29 2m-12-37-6 34" stroke="#c3c792" strokeWidth="3" />
      <path fill="#ead6a0" d="m129 58 18-1 2 12-8 13-10-5-4-9-11-7 13 1Z" />
      <path fill="#d5bd66" d="m124 62 4-14 13-5 12 12-8 2-4-5-6 13-6 8-1-12Z" />
      <path d="m137 67 3-1" />
      <g className="life-motion hero-sword">
        <path fill="#72a7a3" d="m124 92-12-9-8 6 13 16Z" />
        <path fill="#ead6a0" d="m111 84-4-6-5 3 4 9Z" />
        <path fill="#cbd1bc" d="m105 80-7-41 5-2 9 41Z" />
        <path d="m97 77 19-4m-10 3 3 11" stroke="#7a704c" strokeWidth="3" />
        <path className="life-motion sword-glint" stroke="#fffde6" strokeWidth="2.5" d="m96 45 13 7m-10 3 7-13" />
      </g>
      <path fill="#65777d" d="m150 98 19 6-2 24-18 10-13-17 2-22Z" />
      <path d="m148 104 13 4-2 17-8 6-9-11 1-14Z" stroke="#b8c4ad" />
      <path d="m151 110-4 8 10 1Z" stroke="#d3bd62" />
      <path d="m157 105 6-15 6 5-2 12" fill="#ead6a0" />
    </g>
    <g className="life-motion grass-front" stroke="#426039" strokeWidth="1.7" strokeLinecap="round">
      <path d="m13 201 4-23 5 23m-4-9-8-6m26 16 3-17 6 15m18 1-5-17m5 17 6-9m30 10-5-10m82 8 5-20 5 20m-5-8-7-4m27 11 7-20 1 20m84 0 5-16 4 16m23 0 7-23 2 23m21-1-1-17 9 17" />
    </g>
    <g className="life-motion wind-ink" stroke="#f9f6d7" strokeWidth="1.8" strokeLinecap="round" opacity=".8">
      <path pathLength="1" d="M20 43c22-8 37 7 57-1m140 20c24-10 44 6 64-5m4 71c24-5 28 3 47-1" />
    </g>
    <g className="life-motion leaf-a" fill="#6e8a41" stroke="#465e37" strokeWidth=".8"><path d="M204 82q15-11 20-4-9 12-20 4Z" /><path d="m206 83 13-4" /></g>
    <g className="life-motion leaf-b" fill="#acb950" stroke="#617840" strokeWidth=".8"><path d="M59 106q7-12 13-8-1 12-13 8Z" /></g>
    <path className="life-motion sword-sweep" pathLength="1" stroke="#fff5c6" strokeWidth="4" d="M83 46C36 78 60 148 120 155" />
    <g fill="#465c42" className="life-art-note"><text x="23" y="28">take the long way.</text><text x="271" y="187" transform="rotate(-7 271 187)">to anywhere →</text></g>
    <path stroke="#577446" strokeWidth="1.2" d="m307 30 5-9 4 9m-8-3h7m-4 6v9m-6-4h12" />
  </svg>;
}

export function WitcherPostcard() {
  return <svg viewBox="0 0 360 210" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path fill="#c7d1cf" d="m6 7 346 4-4 191-345-5Z" />
    <path fill="#b4c4c4" d="M6 10h343v137L3 170Z" opacity=".6" />
    <circle cx="270" cy="48" r="28" fill="#ebecdb" />
    <path stroke="#7a9392" strokeWidth="1" d="m241 30 58 32m-63-20 59 7" opacity=".2" />
    <g className="life-motion forest-far" fill="#6e8883" opacity=".6">
      <path d="m8 144 24-89 23 89Zm27 0 37-116 26 116Zm51-9 22-77 27 83Zm126 8 26-92 31 92Zm42 6 36-111 26 111Zm48-4 28-88 26 88Z" />
    </g>
    <g className="life-motion forest-near" fill="#3d5a54" stroke="#3f554e" strokeWidth="1.5" strokeLinejoin="round">
      <path d="m7 164 16-24H10l20-30H17l20-32-4-19 12 27-8-5 21 32H44l20 31H48l20 31Zm254-6 16-27h-12l21-27h-11l21-34 3-30 9 37 20 24h-12l19 31h-12l19 32Zm49 22 21-29h-12l14-23h-7l14-27 12 31-7-3 10 35Z" />
      <path d="m37 104 3 85m256-89 1 85" stroke="#a4b3a2" />
    </g>
    <path fill="#8e9b83" d="M4 182c68-28 118-17 164-28s122 4 186 27v20H4Z" />
    <g stroke="#33403d" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <path fill="#3f4644" d="m150 138-6 48-10 10h19l16-47 8 43 17 2-8-12-4-46Z" />
      <path className="life-motion witcher-coat" fill="#4b5854" d="m151 76-17 23 8 31-7 35 35-5 27 3-12-69-14-16Z" />
      <path fill="#69716b" d="m152 80 19-2 15 24-7 39-35-2-5-33Z" />
      <path d="m146 102 36 22m-34-39 23 55m-30-25 42 1m-38 12 36 2" stroke="#b1b19b" strokeWidth="2.5" />
      <path d="m140 89-12 25-3 31 7 3 12-32m37-28 16 28 9 13-6 5-17-16" fill="#4b5854" />
      <path fill="#d9d6c5" d="m153 54 18-2 4 15-10 17-13-9-3-13Z" />
      <path fill="#e3e4d7" d="m148 63 2-17 14-7 11 8 1 11-12-11-8 7-1 16Z" />
      <path className="life-motion witcher-hair" fill="#e0e2d6" d="m172 48 5 10-1 22 11 10-15-3-7-10 8-14Z" />
      <path d="m157 63 4 1m6-2 4-1m-16 6 3 5" stroke="#845d4f" strokeWidth="1.2" />
      <path d="m160 76 6 1 5-6" />
      <path fill="#d3d4c5" d="m176 82 25-44 12-17-7 22-24 45Z" />
      <path fill="#aebbb5" d="m143 88-13-42-4-25 11 22 13 41Z" />
      <path d="m194 42 13 7m-82-5 17-5" stroke="#5c5548" strokeWidth="4" />
    </g>
    <g className="life-motion wolf-medallion" stroke="#4c5149" strokeWidth="1.1" strokeLinejoin="round">
      <path d="m154 82 5 17 10-18" />
      <path fill="#d1d4c8" d="m150 99 3-7 5 5 6-5 5 7-4 11-7 5-5-9Z" />
      <path d="m153 101 5 4 6-5m-9 8 4 2 3-4" />
    </g>
    <g className="life-motion fog-low" fill="#d9e0d7" opacity=".45"><path d="M4 165c44-9 83 13 138 5s89 3 127-6 65-4 85 4v11c-78-7-134 17-213 5S54 183 4 178Z" /></g>
    <g className="life-motion fog-high" stroke="#dde5db" strokeWidth="5" strokeLinecap="round" opacity=".4"><path d="M11 143c29 0 42-7 71-2m145-18c44 4 54-7 101-3" /></g>
    <g fill="#586652" className="witcher-tracks">
      <path className="life-motion track-one" d="m229 188 5-4 3 7-6 3Zm10-11 5-4 3 6-5 4Z" />
      <path className="life-motion track-two" d="m242 165 4-3 3 6-5 2Zm8-7 4-3 2 5-4 2Z" />
      <path className="life-motion track-three" d="m250 146 4-2 1 5-4 1Zm7-6 3-1 1 4-3 1Z" />
    </g>
    <path className="life-motion sword-glint" stroke="#f6f6e4" strokeWidth="1.8" d="m197 31 12 4m-8-7 4 12" />
    <path className="life-motion witcher-sign" pathLength="1" stroke="#a6533d" strokeWidth="2" d="m58 175 6-12 7 12-13-1Z" opacity=".8" />
    <path className="life-motion sign-radiance" pathLength="1" stroke="#c18b51" strokeWidth="1.8" d="M52 164q-9 18 12 22t15-23m-36 9-7 2m45-19 5-6m-24 43v6" />
    <g className="life-art-note" fill="#40574f"><text x="22" y="30">silver for monsters.</text><text x="266" y="195" transform="rotate(-4 266 195)">follow the tracks</text></g>
  </svg>;
}

export function AlchemyPostcard() {
  return <svg viewBox="0 0 360 210" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path fill="#e9dbbb" d="m4 6 349 5 2 188-350 5Z" />
    <path fill="#c8b991" opacity=".3" d="m13 20 165-4 54 94-54 92-164-12Z" />
    <g stroke="#925345" strokeWidth="1.7" className="alchemy-circle">
      <circle className="life-motion circle-outer" pathLength="1" cx="141" cy="106" r="83" />
      <circle className="life-motion circle-inner" pathLength="1" cx="141" cy="106" r="69" />
      <path className="life-motion circle-geometry" pathLength="1" d="m141 24 72 124H70Zm0 164L70 65h143ZM59 105h166M141 24v164" />
      <circle cx="141" cy="106" r="28" strokeWidth="1.1" />
      <path strokeWidth="1" d="m141 80 23 40h-46Zm-12 10 25 31m-36-16h47M95 58l9 8m69-8-8 9M82 140l10-4m96 0 11 4" />
    </g>
    <g stroke="#525149" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path fill="#a2a69a" opacity=".78" d="m282 58 11-20 6 11 14-3 14 15-4 17 20 24 6 58-27-7-8 35-18 2-10-34-27 5 6-61 16-19Z" />
      <path d="m286 70 33-3-5 10-24 1Zm-2 25-11 17 5 22m45-39 13 17-4 20m-46 7 31 1m-18-56 1 57" />
      <path d="m291 49 3-10m11 7 5-10m-40 67 12-5m47 1 10 6" />
      <path fill="#414b45" d="m292 69 7 2-4 4Zm17 1 7-2-2 7Z" />
      <path fill="#373d37" d="m216 137-12 50-9 8 17 1 15-47 9 42 14 4-6-16-1-43Z" />
      <path className="life-motion alchemist-coat" fill="#a63c32" d="m223 74-25 32 5 34-14 32 30-6 10-23 13 22 25-5-20-31-8-45Z" />
      <path fill="#333d39" d="m223 81-10 24 9 35 20-1-8-38-1-19Z" />
      <path fill="#e5c888" d="m219 54 19-2 1 15-9 12-12-9Z" />
      <path fill="#c7a54c" d="m213 62 2-16 16-5 11 11-8-2-4 12-5-9-2 14-9 9Z" />
      <path d="m236 57 5 24 8 8" stroke="#c6a64e" strokeWidth="4" />
      <path fill="#9f3b31" d="m205 95-21 14 3 11 26-12" />
      <g className="life-motion metal-arm" fill="#a2aaa0">
        <path d="m235 89 15 9-16 15-31 8-5-7 30-13Z" />
        <path d="m216 109 2 8m7-11 2 7m7-11 4 7m-39 5-10-5-4 4 7 8 12-1" />
      </g>
    </g>
    <g className="life-motion alchemy-sparks" stroke="#b77632" strokeWidth="2" strokeLinecap="round"><path d="m166 70 5-8m-10 31-11-4m18 36-3 9m13-55 4 2M104 30l-3-8m79 156 4 7m-72-37-6 5" /></g>
    <path className="life-motion sword-glint" stroke="#fff3cd" strokeWidth="2.5" d="m226 110 15-7" />
    <g className="life-art-note" fill="#76654d"><text x="16" y="20">equivalent exchange</text><text x="15" y="194">Fe + will = ?</text><text x="265" y="24">all is one</text><text x="272" y="194">one is all.</text></g>
  </svg>;
}

export function FrierenPostcard() {
  return <svg viewBox="0 0 360 210" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path fill="#dfe9dc" d="m6 5 349 6-5 190-344 3Z" />
    <path fill="#c8dddd" opacity=".6" d="M8 10h340v106L8 126Z" />
    <path fill="#afc7bf" d="m7 115 55-42 21 10 49-36 58 65 39-28 50 13 29-34 44 44v40H7Z" />
    <path stroke="#ebebd9" strokeWidth="2" d="m115 70 17-23 21 25-13-4-8 6-7-6" />
    <g stroke="#95a699" strokeWidth="1.5" fill="#ccd4bd">
      <path d="M68 124V91h13v-8h23v10h10v42H98v-23q-10-18-18 0v23Z" />
      <path d="M59 129V99h9m46 26 17-7v22m-64-35h10m7-14h14m-24 31h-8" />
    </g>
    <path fill="#b6c995" stroke="#82976b" strokeWidth="1.2" d="M6 144c87-42 99 2 167-9s123-13 179 17v50H6Z" />
    <path fill="#d9dbb4" d="M59 202c-3-27 85-32 73-42-15-13-50-16-44-24 5-6 15-5 18-11-1 9-24 9 4 16 34 9 68 16 47 29-13 8-50 11-44 32Z" />
    <path stroke="#98b080" strokeWidth="1.5" d="M13 172c53-15 53-15 75-10m179-8 66 12" />
    <ellipse className="life-motion mage-shadow" cx="222" cy="193" rx="27" ry="5" fill="#6c825d" opacity=".22" />
    <g className="life-motion mage-figure" stroke="#53675b" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path fill="#766e58" d="m205 146-3 40-8 9 18-2 10-46m2-2 8 43 11 5-1-9-4-41" />
      <path className="life-motion mage-cloak" fill="#f0edd9" d="m211 85-18 22 2 22-11 37 37 8 34-14-13-43-11-34Z" />
      <path d="m215 87 14 1 16 47-41 6-3-24Z" fill="#d8ddc7" />
      <path d="m202 141 47-7m-40 7-3 20m26-23 9 23" stroke="#c3b774" strokeWidth="3" />
      <path fill="#ede0b8" d="m210 59 20-2 2 17-10 15-13-11-2-9-14-8 14 1m24-2 14-7-12 14" />
      <path fill="#eef0e4" d="m205 70-1-15 13-12 15 5 5 14-9-8-7 12-4-12-9 17Z" />
      <g className="life-motion mage-hair" fill="#e9eddf">
        <path d="m205 65-5 13-3 29 12-9 3-17-2-16m22-7 4 15-1 29 12 10-12-2-9-10 1-22Z" />
      </g>
      <path d="m214 71 3 1m7-1 3-1" />
      <path d="m199 100-15 22 8 6 17-20m28-11 13 21 10-4" fill="#eeead3" />
      <path d="m262 71-8 109" stroke="#847150" strokeWidth="4" />
      <path fill="#c6ba79" d="m264 44 12 14-14 17-14-15Z" />
      <path fill="#84b5ad" d="m264 50 6 9-8 10-7-9Z" />
      <path d="m258 117 8-2" stroke="#e6d9b3" strokeWidth="5" />
    </g>
    <g className="life-motion meadow-flowers" stroke="#739066" strokeWidth="1.3" strokeLinecap="round">
      <path d="m29 190 2-19m0 12-6-4m6 2 7-6m28 19-2-22m0 12-5-6m35 15 3-18m75 20-3-17m112 18 4-26m-3 14 8-7m25 22-2-17m19 14 3-24" />
      <g fill="#eee9c4" stroke="#cbbd77"><circle cx="32" cy="168" r="4" /><circle cx="63" cy="171" r="3" /><circle cx="97" cy="173" r="3" /><circle cx="170" cy="176" r="3" /><circle cx="287" cy="170" r="4" /><circle cx="316" cy="180" r="3" /><circle cx="340" cy="164" r="4" /></g>
    </g>
    <g className="life-motion magic-particles" fill="#bf9f51"><circle cx="273" cy="92" r="2" /><circle cx="243" cy="47" r="1.6" /><circle cx="293" cy="129" r="1.7" /><circle cx="177" cy="106" r="1.6" /><circle cx="197" cy="38" r="1.7" /><path d="m303 64 2-4 2 4-2 4Zm-141 81 2-4 2 4-2 4Z" /></g>
    <g className="life-motion meadow-wind" stroke="#f8f6de" strokeWidth="2.4" strokeLinecap="round">
      <path pathLength="1" d="M25 143c38-24 70 14 113-9m20 29c48-24 99 17 161-10M127 80c37-16 68 5 89-6" />
    </g>
    <path className="life-motion landing-ring" stroke="#edf1d0" strokeWidth="2" d="M183 191c9-8 65-10 78 0m-87 6c23 7 73 6 96-2" />
    <path className="life-motion magic-arc" stroke="#b29d5b" strokeWidth="1.4" pathLength="1" d="M169 125c-9-58 99-126 129-73 7 12-2 32-17 39" />
    <g className="life-art-note" fill="#657c67"><text x="22" y="30">there is still time.</text><text x="16" y="112" transform="rotate(-5 16 112)">a familiar road</text></g>
  </svg>;
}

export function VolleyballPostcard() {
  return <svg viewBox="0 0 360 210" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path fill="#efdbb2" d="m5 9 346-4 4 195-350 5Z" />
    <path fill="#e7c78e" d="m5 108 350-9v101L5 204Z" />
    <g stroke="#bc9f6e" strokeWidth="1" opacity=".55"><path d="m5 137 349-18M5 163l349-20M5 188l349-20M65 107l-22 98m88-101-5 101m69-103 16 100m46-102 30 101m21-102 43 78" /></g>
    <path className="life-motion court-lines" stroke="#fff3d3" strokeWidth="3" pathLength="1" d="m16 192 56-81 218-8 52 85Zm21-36 284-11M173 109l8 81" />
    <path fill="#424841" stroke="#303c36" strokeWidth="1.8" d="m19 21 72-3 1 42-72 3Z" />
    <g fill="#eee7d0" fontFamily="monospace" fontSize="16"><text x="28" y="43">24:23</text><text x="32" y="54" fontSize="6" letterSpacing="2">HOME · AWAY</text></g>
    <g className="life-motion volleyball-net" stroke="#626555" strokeWidth="1.1" opacity=".8">
      <path d="m172 54 177 15-3 58-178-19Zm-1 13 177 14m-178 1 178 14m-179 0 178 15m-158-55-3 54m23-52-3 54m22-53-2 55m22-54-2 56m22-54-2 56m22-54-2 56m22-54-2 56m21-55-2 56" />
      <path d="m170 50-5 106m185-87-2 84m-177-99 178 15" strokeWidth="3" />
    </g>
    <g fill="#343f3a" stroke="#343f3a" strokeWidth="1.8" strokeLinejoin="round" opacity=".7">
      <path d="m281 123-5 20-9 21 8 4 16-25 6 22 12 3-7-28-4-19Zm-1-40-11 13-9-19-3-21-6 2 2 24 15 34 20 8 13-23 12-22-1-21-6 1-2 20-15 17Z" />
      <circle cx="285" cy="77" r="9" />
    </g>
    <g className="life-motion volleyball-player" stroke="#343c35" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path fill="#303934" d="m117 123-4 22-25 12 2 10 37-15 12-17 5 26 26 12 5-8-20-14-5-29Z" />
      <path fill="#f3ede0" d="m88 157-9 11 4 5 12-8m75-1 10 8-3 6-13-7" />
      <path fill="#f2d9ae" d="m118 75-19 11-17-12-6 5 19 19 27-8m20-20 14-26-2-18 7-1 3 20-13 35" />
      <path fill="#d47c35" d="m120 73-9 16 3 19-8 19 25 8 23-13-6-23-7-25Z" />
      <path fill="#303b34" d="m119 75 8 1-8 19 2 32-9-1 2-23-3-14m30-14 7 20 4 27-8 5-4-31-9-19" />
      <path fill="#ecd4a4" d="m121 52 20 2-2 15-10 9-11-10Z" />
      <path fill="#d7792e" d="m118 62-5-9 7-1-1-9 8 4 5-11 5 10 9-4-2 10 6 4-13 2-5-4-6 7Z" />
      <path d="m139 29 15 2m5-6 5-5" />
      <text x="125" y="111" fill="#f9edcf" stroke="none" fontFamily="monospace" fontSize="19" fontWeight="bold">10</text>
    </g>
    <g className="life-motion volleyball-ball" stroke="#585b44" strokeWidth="1.6" fill="#eee3a8">
      <circle cx="182" cy="30" r="14" /><path d="M174 19q1 14 18 22m-24-14q8-4 26 0m-15-11q10 7 8 27" /><path fill="#b3ba82" stroke="none" d="M186 18q8 3 9 11l-8-2Z" />
    </g>
    <g className="life-motion speed-lines" stroke="#8e693e" strokeWidth="1.8" strokeLinecap="round"><path d="m56 116 27-6m-19 25 22-7m-17 29 12-9m76-100 6-15m-2 44 13-28m-17 95 20 11m-12-28 23 5" /></g>
    <g className="life-motion ball-impact" stroke="#bf602d" strokeWidth="2.3" strokeLinecap="round"><path d="m277 175-13-5m22-2-5-11m16 12 6-13m0 21 15-4m-14 13 9 7m-22-5-3 10m-5-15-14 7" /></g>
    <g className="life-art-note" fill="#97562f"><text x="213" y="28" transform="rotate(3 213 28)">one more point!</text><text x="22" y="194">fly high.</text></g>
  </svg>;
}
