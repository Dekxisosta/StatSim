import { motion } from 'framer-motion';
import { FX_TINT } from '../../game/constants.js';

export function WeatherFx({ fx, anim }) {
  if (!fx || fx === 'none') return null;
  const drops = fx === 'rain' || fx === 'storm';
  return (
    <div className="wfx" style={{ background: FX_TINT[fx] }}>
      {anim && drops && [...Array(40)].map((_, i) => (
        <motion.i key={i} className="drop" style={{ left: `${(i * 37) % 100}%` }} animate={{ y: ['-10vh', '110vh'] }}
          transition={{ duration: 0.6 + (i % 5) * 0.12, repeat: Infinity, ease: 'linear', delay: (i % 9) * 0.11 }} />
      ))}
      {anim && fx === 'snow' && [...Array(32)].map((_, i) => (
        <motion.span key={i} className="flake" style={{ left: `${(i * 31) % 100}%` }} animate={{ y: ['-10vh', '110vh'], x: [0, 20, -20, 0], rotate: 360 }}
          transition={{ duration: 6 + (i % 6), repeat: Infinity, ease: 'linear', delay: (i % 8) * 0.7 }}>❄</motion.span>
      ))}
      {anim && fx === 'sun' && <motion.div className="sunray" animate={{ rotate: 360 }} transition={{ duration: 40, repeat: Infinity, ease: 'linear' }} />}
      {anim && fx === 'storm' && <motion.div className="flash" animate={{ opacity: [0, 0, 0.55, 0, 0.35, 0, 0, 0] }} transition={{ duration: 6, repeat: Infinity }} />}
    </div>
  );
}
