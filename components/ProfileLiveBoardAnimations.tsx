const styles = `
/* Keep the profile assembly independent from native scrolling. The parent panel is
   still scroll-driven; the collage only performs its tactile settle once the panel
   reaches its readable state. */
.scroll-board-purple:not([style*="opacity: 1"]) .profile-live-header,
.scroll-board-purple:not([style*="opacity: 1"]) .profile-animate { opacity:0; }

.scroll-board-purple[style*="opacity: 1"] .profile-live-header {
  animation:profileHeaderLand .72s cubic-bezier(.16,.82,.24,1) both;
}
.scroll-board-purple[style*="opacity: 1"] .profile-status-stamp {
  animation:profileStamp .62s cubic-bezier(.2,1.35,.35,1) .18s both;
}
.scroll-board-purple[style*="opacity: 1"] .profile-live-photo {
  --r:3.2deg;
  animation:profileChitDrop .82s cubic-bezier(.18,.88,.22,1.12) .22s both;
}
.scroll-board-purple[style*="opacity: 1"] .profile-now-card {
  animation:profileChitDrop .88s cubic-bezier(.18,.88,.22,1.12) .3s both;
}
.scroll-board-purple[style*="opacity: 1"] .profile-project-tailcache {
  animation:profileChitDrop .9s cubic-bezier(.18,.88,.22,1.12) .44s both;
}
.scroll-board-purple[style*="opacity: 1"] .profile-project-agent {
  animation:profileChitDrop .9s cubic-bezier(.18,.88,.22,1.12) .58s both;
}
.scroll-board-purple[style*="opacity: 1"] .profile-project-game {
  animation:profileChitDrop .9s cubic-bezier(.18,.88,.22,1.12) .72s both;
}
.scroll-board-purple[style*="opacity: 1"] .profile-brief-chit {
  animation:profileChitDrop .78s cubic-bezier(.18,.88,.22,1.12) .86s both;
}
.scroll-board-purple[style*="opacity: 1"] .profile-signal {
  animation:profileSignalSlide .72s cubic-bezier(.2,.78,.22,1) .94s both;
}
.scroll-board-purple[style*="opacity: 1"] .profile-offclock-chit {
  animation:profileChitDrop .78s cubic-bezier(.18,.88,.22,1.12) 1.02s both;
}

.scroll-board-purple:not([style*="opacity: 1"]) .profile-thread-main,
.scroll-board-purple:not([style*="opacity: 1"]) .profile-thread-branch {
  stroke-dasharray:100;
  stroke-dashoffset:100;
}
.scroll-board-purple[style*="opacity: 1"] .profile-thread-main {
  stroke-dasharray:100;
  stroke-dashoffset:100;
  animation:profileThreadDraw 1.55s cubic-bezier(.2,.72,.24,1) .34s forwards;
}
.scroll-board-purple[style*="opacity: 1"] .profile-thread-branch {
  stroke-dasharray:100;
  stroke-dashoffset:100;
  animation:profileThreadDraw .82s cubic-bezier(.2,.72,.24,1) 1.02s forwards;
}
.scroll-board-purple[style*="opacity: 1"] .profile-thread-branch:nth-of-type(3) { animation-delay:1.08s; }
.scroll-board-purple[style*="opacity: 1"] .profile-thread-branch:nth-of-type(4) { animation-delay:1.18s; }
.scroll-board-purple[style*="opacity: 1"] .profile-thread-branch:nth-of-type(5) { animation-delay:1.28s; }

.scroll-board-purple[style*="opacity: 1"] .profile-pencil-one { animation:profilePencilFloat 4.8s ease-in-out 1.4s infinite alternate; }
.scroll-board-purple[style*="opacity: 1"] .profile-pencil-two { animation:profilePencilFloatAlt 5.4s ease-in-out 1.8s infinite alternate; }
.scroll-board-purple[style*="opacity: 1"] .profile-pencil-three { animation:profilePencilFloat 5.8s ease-in-out 2.1s infinite alternate-reverse; }

.profile-live-board .profile-project-card,
.profile-live-board .profile-now-card,
.profile-live-board .profile-mini-chit {
  transition:box-shadow .2s ease, translate .2s ease, rotate .2s ease!important;
}
.profile-live-board .profile-project-card:hover,
.profile-live-board .profile-now-card:hover,
.profile-live-board .profile-mini-chit:hover {
  translate:0 -7px;
  rotate:-.7deg;
}
.profile-live-board .profile-project-card:hover .profile-state { transform:rotate(-2deg) scale(1.04); }

@keyframes profileHeaderLand {
  0% { opacity:0; transform:translate3d(-38px,34px,0) scale(1.08) rotate(-2deg); filter:blur(3px); }
  64% { opacity:1; transform:translate3d(4px,-3px,0) scale(.995) rotate(.3deg); filter:blur(0); }
  100% { opacity:1; transform:none; filter:blur(0); }
}
@keyframes profileChitDrop {
  0% { opacity:0; transform:translate3d(0,72px,0) scale(.72) rotate(calc(var(--r, 0deg) - 8deg)); filter:blur(2px); }
  62% { opacity:1; transform:translate3d(0,-7px,0) scale(1.025) rotate(calc(var(--r, 0deg) + 1.4deg)); filter:blur(0); }
  100% { opacity:1; transform:translate3d(0,0,0) scale(1) rotate(var(--r, 0deg)); filter:blur(0); }
}
@keyframes profileStamp {
  0% { opacity:0; transform:scale(2.1) rotate(-19deg); filter:blur(2px); }
  68% { opacity:1; transform:scale(.93) rotate(-8deg); filter:blur(0); }
  100% { opacity:1; transform:scale(1) rotate(-10deg); }
}
@keyframes profileSignalSlide {
  0% { opacity:0; transform:translate3d(-54px,0,0) scaleX(.72) rotate(-2deg); transform-origin:left center; }
  70% { opacity:1; transform:translate3d(5px,0,0) scaleX(1.02) rotate(.2deg); }
  100% { opacity:1; transform:translate3d(0,0,0) scaleX(1) rotate(-.5deg); }
}
@keyframes profileThreadDraw { to { stroke-dashoffset:0; } }
@keyframes profilePencilFloat { from { translate:0 0; rotate:0deg; } to { translate:5px -5px; rotate:1.3deg; } }
@keyframes profilePencilFloatAlt { from { translate:0 0; rotate:0deg; } to { translate:-5px 4px; rotate:-1.2deg; } }

@media (prefers-reduced-motion:reduce) {
  .profile-live-header,.profile-animate { opacity:1!important; animation:none!important; }
  .profile-thread-main,.profile-thread-branch { stroke-dasharray:none!important; stroke-dashoffset:0!important; animation:none!important; }
  .profile-pencil { animation:none!important; }
}
`;

export function ProfileLiveBoardAnimations() {
  return <style dangerouslySetInnerHTML={{ __html: styles }} />;
}
