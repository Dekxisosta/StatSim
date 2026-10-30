import { useState } from 'react';
import { motion } from 'framer-motion';
import { Ico, IconField, NumIn, Btn, pop } from '../ui/Controls.jsx';
import { FX } from '../../game/constants.js';
import { fmt, clock } from '../../utils/format.js';

export function WeatherCard({ w, run, active, left, onToggle, onPatch, onDel }) {
  const [ed, setEd] = useState(false);
  return (
    <motion.div layout {...pop} whileHover={{ y: -3 }} className={'card rowc' + (active ? ' eq' : '')}>
      {ed && !run && !active ? (
        <div className="edit">
          <IconField value={w.icon} onChange={(icon) => onPatch({ icon })} />
          <input type="text" value={w.name} onChange={(e) => onPatch({ name: e.target.value })} />
          <label>Effect <select value={w.fx} onChange={(e) => onPatch({ fx: e.target.value })}>{FX.map((f) => <option key={f} value={f}>{f}</option>)}</select></label>
          <label>Multiplier x <NumIn value={w.mult} min={1} onChange={(mult) => onPatch({ mult })} /></label>
          <label>Duration (sec, 0 = until off) <NumIn value={w.duration} onChange={(d) => onPatch({ duration: Math.floor(d) })} /></label>
          <div className="row"><Btn sm onClick={() => setEd(false)}>✔ Done</Btn><Btn sm tone="red" onClick={onDel}>🗑</Btn></div>
        </div>
      ) : (
        <>
          <motion.div className="e" animate={active ? { y: [0, -4, 0] } : {}} transition={{ repeat: Infinity, duration: 1.6 }}><Ico v={w.icon} size={36} /></motion.div>
          <div className="info">
            <div className="nm">{w.name} <span className="g">x{fmt(w.mult)}</span></div>
            <div className="sub">{active ? (w.duration > 0 ? `⏱ ${clock(left)} left` : '∞ until turned off') : (w.duration > 0 ? `${w.duration}s` : '∞')} · {w.fx}</div>
          </div>
          <div className="btns">
            <Btn sm tone={active ? 'gold' : 'blue'} onClick={onToggle}>{active ? '■ Off' : '▶ On'}</Btn>
            <Btn sm tone="blue" disabled={run || active} onClick={() => setEd(true)}>✏️</Btn>
          </div>
        </>
      )}
    </motion.div>
  );
}
