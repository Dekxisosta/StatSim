import { useEffect, useRef, useState } from 'react';
import { uid, shuffle } from '../utils/misc.js';

/* ---------- Background music (Jamendo API, Creative Commons) ---------- */
const MUSIC_KEY = 'statsim:music';

const ENV_JAMENDO_ID = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_JAMENDO_CLIENT_ID) || '';

export const MOODS = [['lofi', 'Lo-fi'], ['chillout', 'Chill'], ['ambient', 'Ambient'], ['relaxation', 'Relax'], ['electronic', 'Electronic'], ['jazz', 'Jazz'], ['classical', 'Classical'], ['soundtrack', 'Cinematic'], ['rock', 'Rock'], ['pop', 'Pop']];

const jsonp = (url) => new Promise((res, rej) => {
  const cb = 'jm_' + uid(), s = document.createElement('script');
  const done = () => { delete window[cb]; s.remove(); };
  window[cb] = (d) => { done(); res(d); };
  s.onerror = () => { done(); rej(new Error('Could not reach Jamendo.')); };
  s.src = `${url}&callback=${cb}`; document.head.appendChild(s);
});

const jamendo = async (path, params) => {
  const url = `https://api.jamendo.com/v3.0/${path}/?${new URLSearchParams({ format: 'json', ...params })}`;
  let d;
  try { d = await (await fetch(url)).json(); } catch { d = await jsonp(url); }
  if (!d.headers || d.headers.status !== 'success') throw new Error((d.headers && d.headers.error_message) || 'Jamendo request failed.');
  return d.results || [];
};

const loadMusicCfg = () => {
  const def = { tag: 'lofi', instr: true, safe: true, vol: 0.4, id: '' };
  try { return { ...def, ...JSON.parse(localStorage.getItem(MUSIC_KEY)) }; } catch { return def; }
};

export function useMusic() {
  const [cfg, setCfg] = useState(loadMusicCfg);
  const [tracks, setTracks] = useState([]);
  const [i, setI] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const au = useRef(null), want = useRef(false), fails = useRef(0), nextRef = useRef(() => {});
  const clientId = cfg.id || ENV_JAMENDO_ID;
  const track = tracks[i];

  useEffect(() => { try { localStorage.setItem(MUSIC_KEY, JSON.stringify(cfg)); } catch {} }, [cfg]);
  useEffect(() => {
    const el = new Audio(); el.preload = 'none'; el.volume = cfg.vol; au.current = el;
    el.addEventListener('play', () => setPlaying(true));
    el.addEventListener('pause', () => setPlaying(false));
    el.addEventListener('playing', () => { fails.current = 0; setErr(''); });
    el.addEventListener('ended', () => nextRef.current(true));
    el.addEventListener('error', () => {
      if (!el.getAttribute('src')) return;
      if (++fails.current > 3) { want.current = false; setErr('Could not play these tracks. Try another mood.'); } else nextRef.current(true);
    });
    return () => { el.pause(); el.removeAttribute('src'); el.load(); };
  }, []);
  useEffect(() => { if (au.current) au.current.volume = cfg.vol; }, [cfg.vol]);
  useEffect(() => {
    const el = au.current;
    if (!el || !track) return;
    if (el.getAttribute('src') !== track.audio) el.src = track.audio;
    if (want.current && el.paused) el.play().catch(() => { want.current = false; setErr('Your browser blocked playback. Press play.'); });
  }, [track]);

  const upd = (p) => setCfg((c) => ({ ...c, ...p }));
  const load = async (autoplay, over = {}) => {
    const c = { ...cfg, ...over }, id = c.id || ENV_JAMENDO_ID;
    if (!id) { setErr('Add your free Jamendo client ID first.'); return; }
    setBusy(true); setErr('');
    try {
      const rs = await jamendo('tracks', {
        client_id: id, limit: 100, tags: c.tag, audioformat: 'mp32', imagesize: 100, boost: 'popularity_month', type: 'single albumtrack',
        ...(c.instr ? { vocalinstrumental: 'instrumental' } : {}),
      });
      const list = shuffle(rs.filter((t) => t.audio && (!c.safe || (t.license_ccurl && !/-nc/.test(t.license_ccurl))))).slice(0, 40);
      if (!list.length) throw new Error('No tracks found. Try another mood or relax the filters.');
      fails.current = 0; want.current = autoplay; setTracks(list); setI(0);
    } catch (e) { setErr(e.message || 'Could not reach Jamendo.'); } finally { setBusy(false); }
  };
  const step = (d, auto) => {
    const el = au.current; if (!el || !tracks.length) return;
    want.current = true;
    if (tracks.length === 1) { el.currentTime = 0; el.play().catch(() => {}); return; }
    setI((x) => (x + d + tracks.length) % tracks.length);
  };
  nextRef.current = (auto) => step(1, auto);
  const toggle = () => {
    const el = au.current; if (!el) return;
    if (!track) { load(true); return; }
    if (el.paused) { want.current = true; setErr(''); el.play().catch(() => { want.current = false; setErr('Your browser blocked playback. Press play.'); }); }
    else { want.current = false; el.pause(); }
  };
  const change = (p) => { upd(p); if (tracks.length) load(playing, p); };
  return { cfg, upd, change, track, tracks, playing, busy, err, clientId, toggle, next: () => step(1), prev: () => step(-1), load };
}
