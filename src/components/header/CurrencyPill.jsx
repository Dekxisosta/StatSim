import { useEffect, useRef, useState } from 'react';
import { Ico, IconField, NumIn, Btn } from '../ui/Controls.jsx';
import { fmt } from '../../utils/format.js';

/* ---------- Currency pill: click it to rename the currency, change its icon, or add / take / set its value ---------- */
const CUR_KEYS = { cur: { name: 'curName', icon: 'curIcon', val: 'cur', def: 'Coins' }, gems: { name: 'gemName', icon: 'gemIcon', val: 'gems', def: 'Gems' } };

export function CurrencyPill({ s, kind, upd }) {
  const K = CUR_KEYS[kind], [open, setOpen] = useState(false), [amt, setAmt] = useState(100), ref = useRef(null);
  useEffect(() => {
    if (!open) return;
    const down = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    const key = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', down); document.addEventListener('keydown', key);
    return () => { document.removeEventListener('mousedown', down); document.removeEventListener('keydown', key); };
  }, [open]);
  const patch = (p) => upd((x) => ({ ...x, ...p }));
  const change = (fn) => upd((x) => ({ ...x, [K.val]: Math.max(0, fn(x[K.val])) }));
  return (
    <div className="cwrap" ref={ref}>
      <button type="button" className="pill cbtn" aria-expanded={open} title="Rename, change icon, or add value" onClick={() => setOpen(!open)}>
        <Ico v={s[K.icon]} size={32} />
        <i className="ctx"><i className="cn">{s[K.name]}</i><b className="cv">{fmt(s[K.val])}</b></i>
        <i className="cedit">✎</i>
      </button>
      {open && (
        <div className="cpop panel">
          <div className="hint">Name</div>
          <input type="text" value={s[K.name]} maxLength={20} onChange={(e) => patch({ [K.name]: e.target.value })} onBlur={() => !s[K.name].trim() && patch({ [K.name]: K.def })} />
          <div className="hint">Icon</div>
          <IconField value={s[K.icon]} onChange={(v) => patch({ [K.icon]: v })} />
          <div className="hint">Value: {fmt(s[K.val])}</div>
          <NumIn value={amt} onChange={setAmt} aria-label="Amount" />
          <div className="crow3">
            <Btn sm tone="green" onClick={() => change((v) => v + amt)}>＋ Add</Btn>
            <Btn sm tone="red" onClick={() => change((v) => v - amt)}>− Take</Btn>
            <Btn sm tone="gold" onClick={() => change(() => amt)}>＝ Set</Btn>
          </div>
          <div className="crow3 q">{[10, 100, 1e3, 1e6].map((n) => <Btn key={n} sm tone="blue" onClick={() => change((v) => v + n)}>+{fmt(n)}</Btn>)}</div>
        </div>
      )}
    </div>
  );
}
