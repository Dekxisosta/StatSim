import { useEffect, useRef, useState } from 'react';
import { isImg } from '../../utils/image.js';

/* ---------- Intro: pure CSS keyframes, so it still plays when the in-app Animations setting is OFF ---------- */
export const INTRO_KEY = 'statsim:intro';

const INTRO_MS = 2600, OPEN_MS = 900;

const INTRO_TIPS = ['Counting coins…', 'Hatching eggs…', 'Polishing gems…', 'Waking the weather…', 'Ready!'];

export const introWanted = () => {
  try {
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
    return localStorage.getItem(INTRO_KEY) !== '0';
  } catch { return true; }
};

export function Intro({ logo, onReveal, onDone }) {
  const [open, setOpen] = useState(false), [tip, setTip] = useState(0), [bad, setBad] = useState(false);
  const go = useRef(null);
  go.current = () => { if (!open) { setOpen(true); onReveal(); } };
  useEffect(() => {
    const t = setTimeout(() => go.current(), INTRO_MS);
    const iv = setInterval(() => setTip((n) => Math.min(n + 1, INTRO_TIPS.length - 1)), INTRO_MS / INTRO_TIPS.length);
    const key = () => go.current();
    window.addEventListener('keydown', key);
    return () => { clearTimeout(t); clearInterval(iv); window.removeEventListener('keydown', key); };
  }, []);
  useEffect(() => { if (!open) return; const t = setTimeout(onDone, OPEN_MS); return () => clearTimeout(t); }, [open]);
  const img = isImg(logo);
  return (
    <div className={'intro' + (open ? ' open' : '')} onClick={() => go.current()}>
      <div className="intro-half l" /><div className="intro-half r" />
      <div className="intro-fx">{[...Array(16)].map((_, i) => (
        <span key={i} style={{ left: `${(i * 7 + 3) % 96}%`, animationDelay: `${(i % 8) * 0.28}s`, animationDuration: `${2.8 + (i % 4) * 0.6}s` }}>{['🪙', '💎', '★', '✦', '🥚', '🐾', '⭐', '🎵'][i % 8]}</span>
      ))}</div>
      <div className="intro-core">
        <div className="intro-logo">{img && !bad
          ? <img src={logo} alt="" referrerPolicy="no-referrer" onError={() => setBad(true)} />
          : <span>{img ? '📊' : logo || '📊'}</span>}</div>
        <h1 className="intro-title" aria-label="StatSim">{[...'StatSim'].map((c, i) => <span key={i} style={{ '--i': i }}>{c}</span>)}</h1>
        <div className="intro-sub">A tycoon simulator of numerical values</div>
        <div className="intro-bar"><i /></div>
        <div className="intro-tip">{INTRO_TIPS[tip]}</div>
      </div>
      <div className="intro-skip">click or press any key to skip</div>
    </div>
  );
}
