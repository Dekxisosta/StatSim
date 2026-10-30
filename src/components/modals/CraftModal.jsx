import { useState } from 'react';
import { Ico, NumIn, Btn } from '../ui/Controls.jsx';
import { Modal } from '../ui/Modal.jsx';
import { Paged } from '../ui/Paged.jsx';
import { recipeOf, craftChance } from '../../game/craft.js';
import { statOf, ek, petBoost, petName, petSize } from '../../game/pets.js';
import { fmt, pct } from '../../utils/format.js';
import { uid, num } from '../../utils/misc.js';

/* ---------- Crafting place: merge pets into bigger sizes ---------- */
export function CraftModal({ open, onClose, s, run, res, onCraft, onTiers }) {
  const [t, setT] = useState(1), [amt, setAmt] = useState({});
  const tiers = s.craft.tiers, tt = Math.min(Math.max(1, t), Math.max(1, tiers.length)), d = tiers[tt - 1], r = d && recipeOf(d);
  const rows = d ? s.inv.filter((e) => (e.tier || 0) === tt - 1).sort((a, b) => petBoost(s, b) - petBoost(s, a)) : [];
  const patchTier = (i, p) => onTiers(tiers.map((x, j) => (j === i ? { ...x, ...p } : x)));
  const addTier = () => { const l = tiers[tiers.length - 1], rl = l && recipeOf(l); onTiers([...tiers, { id: uid(), name: `Size ${tiers.length + 1}`, mult: l ? l.mult * 4 : 4, min: rl ? rl.min + 1 : 2, chance: rl ? Math.max(10, rl.chance - 10) : 66, sure: rl ? rl.sure + 2 : 3 }]); setT(tiers.length + 1); };
  const lastUsed = tiers.length > 0 && s.inv.some((e) => (e.tier || 0) >= tiers.length);
  return (
    <Modal open={open} onClose={onClose} wide>
      <div className="ttl"><span>🔨 Crafting</span><Btn sm tone="red" onClick={onClose}>✕</Btn></div>
      <div className="hint">Merge pets of the same kind into the next size. Use fewer than the guaranteed number and it's a gamble: if it fails, the pets are used up. Bigger sizes need more pets and give a bigger boost.{!run && ' Start the simulator to craft.'}</div>
      {res && <div key={res.k} className={'cres ' + (res.ok ? 'ok' : 'bad')}>{res.ok ? `✨ Success! You crafted a ${res.to}` : `💔 Failed. ${res.n} ${res.from} lost`}</div>}
      {d ? (
        <>
          <div className="sec">{tiers.map((x, i) => <Btn key={x.id} tone={tt === i + 1 ? 'gold' : 'blue'} onClick={() => setT(i + 1)}>{x.name}</Btn>)}</div>
          <div className="hint">
            {tt === 1 ? 'Normal' : tiers[tt - 2].name} → <b>{d.name}</b>: {r.min} pets = {pct(r.chance / 100)}%{r.sure > r.min ? `, ${r.sure} pets = guaranteed` : ''} · boost ×{fmt(d.mult)}
          </div>
          {rows.length === 0 && <div className="hint">No {tt === 1 ? 'normal' : tiers[tt - 2].name} pets yet. Hatch some eggs{tt > 1 ? ' or craft the smaller size first' : ''}.</div>}
          <Paged id={`${s.id}:craft:${tt}`} items={rows} size={6}>{(sl) => sl.map((e) => {
            const k = ek(e), cap = Math.min(r.sure, e.count), can = e.count >= r.min, n = Math.min(cap, Math.max(r.min, amt[k] ?? cap)), ch = craftChance(r, n), st = statOf(s, e);
            return (
              <div className="craftrow" key={k}>
                <Ico v={st.icon} size={petSize(e, 30)} />
                <div className="cinfo">
                  <div>{petName(s, e)} <span className="g">×{e.count}</span></div>
                  <div className="sub">{can ? `→ ${d.name} ${st.name} · +${fmt((st.boost || 0) * d.mult)}` : `Need ${r.min}+ to craft`}</div>
                </div>
                <div className="step">
                  <Btn sm tone="blue" disabled={!can || n <= r.min} onClick={() => setAmt({ ...amt, [k]: n - 1 })}>−</Btn>
                  <b>{can ? n : '–'}</b>
                  <Btn sm tone="blue" disabled={!can || n >= cap} onClick={() => setAmt({ ...amt, [k]: n + 1 })}>＋</Btn>
                </div>
                <Btn sm tone={ch >= 100 ? 'green' : 'gold'} disabled={!run || !can} onClick={() => onCraft(e, n)}>🔨 {can ? (ch >= 100 ? 'Sure' : `${pct(ch / 100)}%`) : ''}</Btn>
              </div>
            );
          })}</Paged>
        </>
      ) : <div className="hint">No sizes are set up. Add one below.</div>}
      <details className="cfgbox">
        <summary>⚙ Recipes (configurable)</summary>
        {run && <div className="hint">Stop the simulator to edit recipes.</div>}
        {tiers.map((x, i) => {
          const rc = recipeOf(x), bad = num(x.sure, 0) < rc.min || num(x.min, 2) < 2;
          return (
            <div className="trow" key={x.id}>
              <div className="thead"><b>{i === 0 ? 'Normal' : tiers[i - 1].name} →</b><input type="text" value={x.name} disabled={run} onChange={(e) => patchTier(i, { name: e.target.value })} />
                {i === tiers.length - 1 && <Btn sm tone="red" disabled={run || tiers.length < 2 || lastUsed} title={lastUsed ? 'Pets of this size exist' : 'Delete size'} onClick={() => { onTiers(tiers.slice(0, -1)); setT(1); }}>✕</Btn>}</div>
              <div className="tgrid">
                <label>Boost ×<NumIn value={x.mult} disabled={run} onChange={(mult) => patchTier(i, { mult })} /></label>
                <label>Min pets<NumIn value={x.min} min={2} disabled={run} onChange={(min) => patchTier(i, { min })} /></label>
                <label>Chance % at min<NumIn value={x.chance} disabled={run} onChange={(chance) => patchTier(i, { chance: Math.min(100, chance) })} /></label>
                <label>Guaranteed at<NumIn value={x.sure} min={1} disabled={run} onChange={(sure) => patchTier(i, { sure })} /></label>
              </div>
              {bad && <div className="hint bad">Min pets must be 2 or more and guaranteed must be at least min. Using {rc.min} / {rc.sure} for now.</div>}
            </div>
          );
        })}
        <div className="hint">Chance rises evenly from the min-pets value up to 100% at the guaranteed amount. Only the newest size can be deleted, and only while no pets of that size exist.</div>
        <Btn sm tone="blue" disabled={run} onClick={addTier}>＋ Size</Btn>
      </details>
    </Modal>
  );
}
