import { useState } from 'react';
import { Btn } from '../ui/Controls.jsx';
import { Modal } from '../ui/Modal.jsx';
import { MOODS } from '../../hooks/useMusic.js';

export function MusicModal({ open, onClose, m }) {
  const [draft, setDraft] = useState('');
  const { cfg, track } = m;
  return (
    <Modal open={open} onClose={onClose}>
      <div className="ttl"><span>🎵 Music</span><Btn sm tone="red" onClick={onClose}>✕</Btn></div>
      {!m.clientId ? (
        <>
          <div className="hint">Paste your free Jamendo client ID to stream royalty-free music while you play. Get one at <a href="https://devportal.jamendo.com" target="_blank" rel="noreferrer">devportal.jamendo.com</a>.</div>
          <div className="fld">
            <input type="text" placeholder="Jamendo client ID" value={draft} onChange={(e) => setDraft(e.target.value)} />
            <Btn sm onClick={() => draft.trim() && m.upd({ id: draft.trim() })}>Save</Btn>
          </div>
        </>
      ) : (
        <>
          <div className="card np">
            {track ? (
              <>
                {track.image && <img src={track.image} alt="" referrerPolicy="no-referrer" />}
                <div>{track.name}</div>
                <div className="sub">{track.artist_name}</div>
                <div className="sub">
                  <a href={track.shareurl || `https://www.jamendo.com/track/${track.id}`} target="_blank" rel="noreferrer">Jamendo</a>
                  {track.license_ccurl && <> · <a href={track.license_ccurl} target="_blank" rel="noreferrer">License</a></>}
                </div>
              </>
            ) : <div className="sub">Pick a mood and press play.</div>}
            <div className="row3">
              <Btn sm tone="blue" disabled={!m.tracks.length} title="Previous" onClick={m.prev}>⏮</Btn>
              <Btn sm tone="gold" disabled={m.busy} title={m.playing ? 'Pause' : 'Play'} onClick={m.toggle}>{m.playing ? '⏸' : '▶'}</Btn>
              <Btn sm tone="blue" disabled={!m.tracks.length} title="Next" onClick={m.next}>⏭</Btn>
            </div>
          </div>
          <label className="vrow">🔊 <input className="vol" type="range" min="0" max="1" step="0.01" value={cfg.vol} onChange={(e) => m.upd({ vol: parseFloat(e.target.value) })} /></label>
          <div className="hint">Mood</div>
          <div className="moods">
            {MOODS.map(([k, l]) => <Btn key={k} sm tone={cfg.tag === k ? 'gold' : 'blue'} disabled={m.busy} onClick={() => m.change({ tag: k })}>{l}</Btn>)}
            {!m.tracks.length && <Btn sm tone="gold" disabled={m.busy} onClick={() => m.load(true)}>Load {MOODS.find((x) => x[0] === cfg.tag)[1]}</Btn>}
          </div>
          <label className="chk"><input type="checkbox" checked={cfg.instr} onChange={(e) => m.change({ instr: e.target.checked })} /> Instrumental only</label>
          <label className="chk"><input type="checkbox" checked={cfg.safe} onChange={(e) => m.change({ safe: e.target.checked })} /> Commercial-use licenses only</label>
          {m.busy && <div className="hint">Loading tracks…</div>}
          {m.err && <div className="hint bad">{m.err}</div>}
          <div className="hint">Music via Jamendo, licensed under Creative Commons. Keep the artist credit if you share or stream your game. <button className="lnk" onClick={() => m.upd({ id: '' })}>Change client ID</button></div>
        </>
      )}
    </Modal>
  );
}
