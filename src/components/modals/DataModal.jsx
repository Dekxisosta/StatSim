import { useEffect, useRef, useState } from 'react';
import { Btn } from '../ui/Controls.jsx';
import { Modal } from '../ui/Modal.jsx';
import { Paged } from '../ui/Paged.jsx';
import { parseImport, MAX_FILE } from '../../io/saveFile.js';
import { fmt, clock } from '../../utils/format.js';

export function DataModal({ open, onClose, sim, sims, onExportOne, onExportAll, onReplaceOne, onAdd, onReplaceAll }) {
  const [inc, setInc] = useState(null), [err, setErr] = useState(''), [over, setOver] = useState(false);
  const ref = useRef(null);
  useEffect(() => { if (!open) { setInc(null); setErr(''); setOver(false); } }, [open]);
  const anyRun = sims.some((s) => s.running);
  const read = async (f) => {
    setErr(''); setInc(null);
    if (!f) return;
    if (f.size > MAX_FILE) { setErr('That file is too large (8 MB max).'); return; }
    try { setInc({ ...parseImport(await f.text()), file: f.name }); } catch (e) { setErr(e.message); }
  };
  const go = (fn) => { fn(); onClose(); };
  return (
    <Modal open={open} onClose={onClose} wide>
      <div className="ttl"><span>📦 Import / Export</span><Btn sm tone="red" onClick={onClose}>✕</Btn></div>
      <div className="hint">Export</div>
      <div className="row2">
        <Btn tone="gold" onClick={onExportOne}>💾 This simulator</Btn>
        <Btn tone="blue" onClick={onExportAll}>🗂 All + settings</Btn>
      </div>
      <div className="hint">Import a StatSim .json file</div>
      <div className={'dz' + (over ? ' over' : '')} onClick={() => ref.current && ref.current.click()}
        onDragOver={(e) => { e.preventDefault(); setOver(true); }} onDragLeave={() => setOver(false)}
        onDrop={(e) => { e.preventDefault(); setOver(false); read(e.dataTransfer.files[0]); }}>
        📂 Drop a file here or click to choose
      </div>
      <input ref={ref} type="file" accept=".json,application/json" hidden onChange={(e) => { read(e.target.files[0]); e.target.value = ''; }} />
      {err && <div className="hint bad">{err}</div>}
      {inc && (
        <>
          <div className="hint">{inc.file} · {inc.sims.length} simulator{inc.sims.length > 1 ? 's' : ''}{inc.backup ? ' (backup)' : ''}</div>
          <Paged id="import" items={inc.sims} size={5}>{(sl) => (<table className="stbl">
            <thead><tr><th>Name</th><th>{'Currency'}</th><th>Rebirths</th><th>Runtime</th></tr></thead>
            <tbody>{sl.map((s) => <tr key={s.id}><td>{s.name}</td><td>{fmt(s.cur)}</td><td>{s.rb.count}</td><td>{clock(s.totalRuntime)}</td></tr>)}</tbody>
          </table>)}</Paged>
          {inc.warn.map((w, i) => <div className="hint bad" key={i}>{w}</div>)}
          <div className="row2">
            {inc.sims.length === 1 && <Btn tone="gold" disabled={sim.running} onClick={() => confirm(`Replace "${sim.name}" with "${inc.sims[0].name}"?`) && go(() => onReplaceOne(inc.sims[0]))}>↻ Replace {sim.name}</Btn>}
            <Btn tone="blue" onClick={() => go(() => onAdd(inc.sims))}>＋ Add as new tab{inc.sims.length > 1 ? 's' : ''}</Btn>
            {inc.backup && <Btn tone="red" disabled={anyRun} onClick={() => confirm('Replace ALL simulators and settings with this backup?') && go(() => onReplaceAll(inc.sims, inc.extras))}>⚠ Replace everything</Btn>}
          </div>
          {(sim.running && inc.sims.length === 1) || (anyRun && inc.backup) ? <div className="hint">Stop running simulators to enable replacing.</div> : null}
        </>
      )}
    </Modal>
  );
}
