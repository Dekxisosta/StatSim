import { useState } from 'react';
import { motion } from 'framer-motion';
import { Ico, NumIn, Btn, PaySel, pop } from '../ui/Controls.jsx';
import { payIcon } from '../../game/economy.js';
import { METRICS, metricVal, qProg } from '../../game/stats.js';
import { fmt, pct } from '../../utils/format.js';

export function QuestCard({ q, s, run, onClaim, onPatch, onDel }) {
  const [ed, setEd] = useState(false);
  const prog = qProg(s, q), done = prog >= q.target, pct = Math.min(100, (prog / q.target) * 100);
  const label = (METRICS.find((m) => m[0] === q.metric) || [])[1];
  return (
    <motion.div layout {...pop} className={'card' + (done && !q.claimed ? ' eq' : '')}>
      {ed && !run ? (
        <div className="edit">
          <input type="text" value={q.name} onChange={(e) => onPatch({ name: e.target.value })} />
          <label>Track <select value={q.metric} onChange={(e) => onPatch({ metric: e.target.value, base: metricVal(s, e.target.value), claimed: false })}>{METRICS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></label>
          <label>Target <NumIn value={q.target} min={1} onChange={(target) => onPatch({ target })} /></label>
          <label>Reward <NumIn value={q.reward} onChange={(reward) => onPatch({ reward })} /></label>
          <PaySel v={q.pay} s={s} onChange={(pay) => onPatch({ pay })} />
          <label className="chk"><input type="checkbox" checked={q.repeat} onChange={(e) => onPatch({ repeat: e.target.checked })} /> Repeatable</label>
          <div className="row"><Btn sm onClick={() => setEd(false)}>✔ Done</Btn><Btn sm tone="red" onClick={onDel}>🗑</Btn></div>
        </div>
      ) : (
        <>
          <div>{q.name} {q.repeat && '🔁'}</div>
          <div className="bar"><motion.div className="fill" animate={{ width: `${pct}%` }} /></div>
          <div className="sub">{fmt(Math.min(prog, q.target))} / {fmt(q.target)} · {label}</div>
          <Btn sm tone="gold" disabled={!done || q.claimed} onClick={onClaim}>{q.claimed ? '✔ Claimed' : <>Claim <Ico v={payIcon(s, q.pay)} size={14} /> {fmt(q.reward)}</>}</Btn>
          <Btn sm tone="blue" disabled={run} onClick={() => setEd(true)}>✏️</Btn>
        </>
      )}
    </motion.div>
  );
}
