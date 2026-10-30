import { useMemo } from 'react';

/* ---------- Confetti: pure CSS keyframes (like the intro), so it also plays with the in-app Animations setting OFF ---------- */
const CONFETTI_COLORS = ['#ffd93b', '#7df9ff', '#7dff7d', '#ff8ad8', '#ff6b6b', '#ffffff', '#ffa94d'];

export function Confetti({ k, big }) {
  const bits = useMemo(() => Array.from({ length: big ? 130 : 80 }, (_, i) => {
    const a = Math.random() * Math.PI * 2, v = 160 + Math.random() * (big ? 520 : 380);
    return {
      i, c: CONFETTI_COLORS[i % CONFETTI_COLORS.length], w: 6 + Math.random() * 7, h: 9 + Math.random() * 9, round: Math.random() < 0.25,
      dx: Math.cos(a) * v, up: -Math.abs(Math.sin(a)) * v * 0.9 - 80, fall: 260 + Math.random() * 420,
      rot: (Math.random() - 0.5) * 1440, dur: 1.5 + Math.random() * 1.1, delay: Math.random() * 0.12,
    };
  }), [k, big]);
  return (
    <div className="confetti" aria-hidden="true">
      {bits.map((b) => (
        <i key={b.i} style={{ background: b.c, width: b.w, height: b.h, borderRadius: b.round ? '50%' : 2, animationDuration: `${b.dur}s`, animationDelay: `${b.delay}s`, '--dx': `${b.dx}px`, '--up': `${b.up}px`, '--fall': `${b.fall}px`, '--rot': `${b.rot}deg` }} />
      ))}
    </div>
  );
}
