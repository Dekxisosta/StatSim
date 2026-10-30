import { useEffect, useState } from 'react';
import { PRESETS } from '../../presets/index.js';
import { Ico, Btn } from '../ui/Controls.jsx';
import { Modal } from '../ui/Modal.jsx';
import { Paged } from '../ui/Paged.jsx';
import { parseImport } from '../../io/saveFile.js';

/* ---------- Presets: every .json in src/presets is listed here automatically ---------- */
export function PresetsModal({ open, onClose, sims, onAdd }) {
  const [err, setErr] = useState('');
  useEffect(() => { if (!open) setErr(''); }, [open]);
  const add = (p) => {
    try { const r = parseImport(JSON.stringify(p.data)); onAdd(r.sims); onClose(); }
    catch (e) { setErr(`${p.title}: ${e.message}`); }
  };
  return (
    <Modal open={open} onClose={onClose} wide>
      <div className="ttl"><span>🎁 Presets</span><Btn sm tone="red" onClick={onClose}>✕</Btn></div>
      <div className="hint">Ready-made simulators. Adding one opens it in a new tab and leaves your other tabs alone. Any save file dropped into <b>src/presets</b> shows up here automatically.</div>
      {err && <div className="hint bad">{err}</div>}
      {!PRESETS.length ? <div className="hint">No presets found.</div> : (
        <Paged id="presets" items={PRESETS} size={5}>{(sl) => (
          <div className="prelist">{sl.map((p) => {
            const have = sims.some((x) => x.name === p.simName), c = p.counts;
            return (
              <div className="pre" key={p.id}>
                <div className="preico"><Ico v={p.emoji} size={40} /></div>
                <div className="preinfo">
                  <b>{p.title}{have && <span className="pretag">in your tabs</span>}</b>
                  {p.blurb && <div className="sub">{p.blurb}</div>}
                  <div className="sub dim">{c.shop} gear · {c.powers} powerups · {c.groups} multiplier groups · {c.weather} weathers · {c.eggs} eggs · {c.quests} quests</div>
                </div>
                <Btn sm tone="gold" onClick={() => add(p)}>{have ? '＋ Add again' : '＋ Add'}</Btn>
              </div>
            );
          })}</div>
        )}</Paged>
      )}
    </Modal>
  );
}
