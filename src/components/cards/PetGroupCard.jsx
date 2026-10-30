import { useState } from 'react';
import { motion } from 'framer-motion';
import { Ico, IconField, NumIn, Btn, PaySel, pop } from '../ui/Controls.jsx';
import { jumpLast, Paged } from '../ui/Paged.jsx';
import { bal, payIcon } from '../../game/economy.js';
import { gachaCfg, trackOf, pityRamp, gachaDist, gachaCost } from '../../game/gacha.js';
import { balance } from '../../game/pets.js';
import { fmt, pct } from '../../utils/format.js';
import { uid } from '../../utils/misc.js';

function GachaCurve({ g, H = 46 }) {
  const c = gachaCfg(g), t = trackOf(g), d = gachaDist(g, t.since), N = Math.max(1, c.hard - 1);
  if (!d.live) return <div className="hint">Pity is inactive{c.enabled ? `: this egg needs at least one rare pet (chance ≤ ${c.rareBelow}%) and one common pet.` : '.'}</div>;
  const W = 200, steps = 48, at = (n) => d.R + (d.peak - d.R) * pityRamp(c, n), X = (n) => (n / N) * W, Y = (v) => H - 4 - v * (H - 8);
  const pts = Array.from({ length: steps + 1 }, (_, k) => { const n = (k / steps) * N; return `${X(n).toFixed(1)},${Y(at(n)).toFixed(1)}`; }).join(' ');
  const cur = Math.min(t.since, N);
  return (
    <div className="gcurve">
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', display: 'block' }}>
        <line x1="0" x2={W} y1={Y(d.R)} y2={Y(d.R)} stroke="#fff6" strokeDasharray="4 3" />
        <polyline points={pts} fill="none" stroke={g.color} strokeWidth="2.5" strokeLinejoin="round" />
        <line x1={X(cur)} x2={X(cur)} y1="0" y2={H} stroke="#7dff7d" strokeWidth="1.5" />
        <circle cx={X(cur)} cy={Y(at(cur))} r="4" fill="#7dff7d" stroke="#1b1b3a" strokeWidth="2" />
      </svg>
      <div className="gaxis"><span>0 misses</span><span>rare {pct(d.R)}% → {pct(d.peak)}%</span><span>{N}</span></div>
    </div>
  );
}

export function PetGroupCard({ g, s, run, onPatch, onDel, onHatch }) {
  const [ed, setEd] = useState(false);
  const total = Math.round(g.pets.reduce((a, p) => a + p.chance, 0) * 100) / 100;
  const ok = g.pets.length > 0 && Math.abs(total - 100) < 0.005;
  const setPet = (id, patch) => onPatch({ pets: g.pets.map((p) => (p.id === id ? { ...p, ...patch } : p)) });
  const c = gachaCfg(g), t = trackOf(g), d = gachaDist(g, t.since), setG = (x) => onPatch({ gacha: { ...c, ...x } });
  return (
    <motion.div layout {...pop} className="grp" style={{ borderColor: g.color }}>
      {ed && !run ? (
        <div className="edit">
          <div className="ghead"><input type="color" value={g.color} onChange={(e) => onPatch({ color: e.target.value })} /><IconField value={g.icon} onChange={(icon) => onPatch({ icon })} /></div>
          <input type="text" value={g.name} onChange={(e) => onPatch({ name: e.target.value })} />
          <label>Hatch cost (per egg) <NumIn value={g.cost} onChange={(cost) => onPatch({ cost })} /></label>
          <PaySel v={g.pay} s={s} onChange={(pay) => onPatch({ pay })} />
          <Paged id={`${s.id}:pe:${g.id}`} items={g.pets} size={5}>{(sl) => sl.map((p) => (
            <div className="petrow" key={p.id}>
              <IconField value={p.icon} onChange={(icon) => setPet(p.id, { icon })} />
              <input type="text" value={p.name} onChange={(e) => setPet(p.id, { name: e.target.value })} />
              <Btn sm tone="red" onClick={() => onPatch({ pets: g.pets.filter((x) => x.id !== p.id) })}>✕</Btn>
              <label>Boost + <NumIn value={p.boost} onChange={(boost) => setPet(p.id, { boost })} /></label>
              <label>Chance % <NumIn value={p.chance} onChange={(chance) => setPet(p.id, { chance })} /></label>
            </div>
          ))}</Paged>
          <div className={'hint' + (ok ? '' : ' bad')}>Total {total}% {ok ? '✔' : '— must equal 100%'}</div>
          <div className="row">
            <Btn sm tone="blue" onClick={() => { jumpLast(`${s.id}:pe:${g.id}`); onPatch({ pets: [...g.pets, { id: uid(), name: 'New Pet', icon: '🐾', boost: 0.1, chance: 0 }] }); }}>＋ Pet</Btn>
            <Btn sm tone="gold" onClick={() => onPatch({ pets: balance(g.pets) })}>⚖ Balance to 100%</Btn>
          </div>
          <div className="gset">
            <b>🎲 Gacha &amp; sigmoid pity</b>
            <label className="chk"><input type="checkbox" checked={c.enabled} onChange={(e) => setG({ enabled: e.target.checked })} /> Pity ramp enabled</label>
            <label>Rare = chance ≤ % <NumIn value={c.rareBelow} onChange={(rareBelow) => setG({ rareBelow })} /></label>
            <label>Ramp midpoint (misses) <NumIn value={c.mid} onChange={(mid) => setG({ mid })} /></label>
            <label>Steepness k (0 = linear) <NumIn value={c.steep} onChange={(steep) => setG({ steep })} /></label>
            <label>Peak reached at pull # <NumIn value={c.hard} min={1} onChange={(hard) => setG({ hard: Math.max(1, Math.floor(hard)) })} /></label>
            <label>Peak rare chance % (100 = guaranteed) <NumIn value={c.cap} onChange={(cap) => setG({ cap: Math.min(100, cap) })} /></label>
            <label>×5 / ×10 discount % <NumIn value={c.discount} onChange={(discount) => setG({ discount: Math.min(90, discount) })} /></label>
            <GachaCurve g={g} H={60} />
            <div className="hint">Each miss moves the rare chance along an S-curve from its base value up to the peak. Common and rare pets keep their relative odds inside their own group.</div>
            <Btn sm tone="red" onClick={() => onPatch({ track: { pulls: 0, rares: 0, since: 0, longest: 0, counts: {} } })}>↺ Reset tracking</Btn>
          </div>
          <div className="row"><Btn sm onClick={() => setEd(false)}>✔ Done</Btn><Btn sm tone="red" onClick={onDel}>🗑 Group</Btn></div>
        </div>
      ) : (
        <>
          <div className="ghead"><Ico v={g.icon} size={30} /><b style={{ color: g.color, flex: 1 }}>{g.name}</b><Btn sm tone="blue" disabled={run} onClick={() => setEd(true)}>✏️</Btn></div>
          <Paged id={`${s.id}:pv:${g.id}`} items={g.pets.map((p, i) => ({ p, i }))} size={6}>{(sl) => (<div className="plist">{sl.map(({ p, i }) => (
            <div className="prow" key={p.id} title={`Base ${p.chance}%`}>
              <Ico v={p.icon} size={16} />
              <span className="pn">{d.rare[i] && d.live ? '★ ' : ''}{p.name} <span className="g">+{fmt(p.boost)}</span></span>
              <span className={'sub pr' + (d.live && d.ramp > 0 && d.rare[i] ? ' up' : '')}>{pct(d.p[i])}%</span>
              {t.counts[p.id] > 0 && <span className="cnt">×{t.counts[p.id]}</span>}
            </div>
          ))}</div>)}</Paged>
          {!ok && <div className="hint bad">Chances total {total}% — edit the group to reach 100%.</div>}
          {d.live && (
            <div className="pity">
              <div className="sub">Misses {t.since}/{Math.max(1, c.hard - 1)} · rare chance <b>{pct(d.pr)}%</b></div>
              <div className="bar"><div className="fill" style={{ width: `${Math.min(100, (t.since / Math.max(1, c.hard - 1)) * 100)}%` }} /></div>
              <GachaCurve g={g} H={40} />
            </div>
          )}
          <div className="sub small">Pulls {t.pulls} · Rare {t.rares}{t.pulls ? ` (${pct(t.rares / t.pulls)}%)` : ''} · Longest drought {t.longest}</div>
          <div className="hbtns">
            {[1, 5, 10].map((n) => {
              const cost = gachaCost(g, n);
              return (
                <Btn key={n} sm tone={n === 1 ? 'green' : n === 5 ? 'blue' : 'gold'} disabled={!run || !ok || bal(s, g.pay) < cost} onClick={() => onHatch(n)}>
                  <span>🥚 ×{n}</span><span className="hc"><Ico v={payIcon(s, g.pay)} size={12} /> {fmt(cost)}</span>
                </Btn>
              );
            })}
          </div>
        </>
      )}
    </motion.div>
  );
}
