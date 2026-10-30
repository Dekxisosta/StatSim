import { useState } from 'react';
import { gain } from '../game/economy.js';
import { maxPlan } from '../game/stats.js';
import { fmt, pct } from '../utils/format.js';

/* ---------- Statistics graph: best possible currency per addition (log scale, updates live with the simulator) ---------- */
export function StatsChart({ sim, sims }) {
  const [craft, setCraft] = useState(true);
  const P = maxPlan(sim, craft), now = gain(sim), L = (v) => Math.log10(Math.max(1, v));
  const den = L(Math.max(P.total, now, 10)), w = (v) => Math.min(100, Math.max(1.5, (L(v) / den) * 100));
  const rows = [
    { k: 'now', name: 'You now', total: now, tone: 'now' },
    ...P.stages.map((x) => ({ k: x.name, name: x.name, total: x.total, factor: x.factor, tone: x.factor > 1 ? 'st' : 'st off' })),
    { k: 'max', name: 'Maximum', total: P.total, tone: 'max' },
  ];
  const share = P.total > 0 ? Math.min(100, (now / P.total) * 100) : 100;
  return (
    <div className="schart">
      <div className="hint"><b>Best case per addition</b> if every upgrade in every component were bought. Each bar adds one component on top of the ones above it (log scale).</div>
      <div className="sc-rows">
        {rows.map((r) => (
          <div className={'sc-row ' + r.tone} key={r.k}>
            <span className="sc-n">{r.name}</span>
            <span className="sc-track"><i style={{ width: `${w(r.total)}%` }} /></span>
            <span className="sc-v">{fmt(r.total)}{r.factor != null && <small> {r.factor > 1 ? `×${fmt(r.factor)}` : '—'}</small>}</span>
          </div>
        ))}
      </div>
      <div className="sub">{sim.name} is at <b>{pct(share / 100)}%</b> of its maximum ({fmt(now)} of {fmt(P.total)} {sim.curName} per addition)</div>
      <label className="chk"><input type="checkbox" checked={craft} onChange={(e) => setCraft(e.target.checked)} /> Count the biggest crafted pet size</label>
      {sims.length > 1 && (
        <table className="stbl">
          <thead><tr><th>All simulators</th><th>Now</th><th>Maximum</th><th>Reached</th></tr></thead>
          <tbody>{sims.map((x) => { const m = maxPlan(x, craft).total, n = gain(x); return <tr key={x.id}><td>{x.name}</td><td>{fmt(n)}</td><td>{fmt(m)}</td><td>{m > 0 ? pct(Math.min(1, n / m)) : 100}%</td></tr>; })}</tbody>
        </table>
      )}
    </div>
  );
}
