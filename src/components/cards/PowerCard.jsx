import { useState } from 'react';
import { motion } from 'framer-motion';
import { Ico, IconField, NumIn, Btn, PaySel, pop } from '../ui/Controls.jsx';
import { bal, payIcon } from '../../game/economy.js';
import { fmt } from '../../utils/format.js';

export function PowerCard({ p, s, run, onBuy, onPatch, onDel }) {
  const [ed, setEd] = useState(false);
  return (
    <motion.div layout {...pop} whileHover={{ y: -3 }} className={'card rowc' + (p.bought ? ' eq' : '')}>
      {ed && !run ? (
        <div className="edit">
          <IconField value={p.icon} onChange={(icon) => onPatch({ icon })} />
          <input type="text" value={p.name} onChange={(e) => onPatch({ name: e.target.value })} />
          <label>Multiplier x <NumIn value={p.mult} min={1} onChange={(mult) => onPatch({ mult })} /></label>
          <label>Cost <NumIn value={p.cost} onChange={(cost) => onPatch({ cost })} /></label>
          <PaySel v={p.pay} s={s} onChange={(pay) => onPatch({ pay })} />
          <div className="row"><Btn sm onClick={() => setEd(false)}>✔ Done</Btn><Btn sm tone="red" onClick={onDel}>🗑</Btn></div>
        </div>
      ) : (
        <>
          <motion.div className="e" animate={p.bought ? { rotate: [0, 8, -8, 0] } : {}} transition={{ repeat: Infinity, duration: 2 }}><Ico v={p.icon} size={36} /></motion.div>
          <div className="info">
            <div className="nm">{p.name} <span className="g">x{fmt(p.mult)}</span></div>
            <div className="sub">{p.bought ? 'Owned' : 'One-time'}</div>
          </div>
          <div className="btns">
            <Btn sm tone="blue" disabled={!run || p.bought || bal(s, p.pay) < p.cost} onClick={onBuy}>
              {p.bought ? '✔' : <><Ico v={payIcon(s, p.pay)} size={14} /> {fmt(p.cost)}</>}
            </Btn>
            <Btn sm tone="blue" disabled={run || p.bought} onClick={() => setEd(true)}>✏️</Btn>
          </div>
        </>
      )}
    </motion.div>
  );
}
