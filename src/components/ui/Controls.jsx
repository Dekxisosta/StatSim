import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { isImg, readImg } from '../../utils/image.js';

export function Ico({ v, size = 26, wide }) {
  return isImg(v)
    ? <img src={v} alt="" referrerPolicy="no-referrer" style={wide ? { height: size, width: 'auto', maxWidth: 220, objectFit: 'contain' } : { width: size, height: size, objectFit: 'contain' }} />
    : <span style={{ fontSize: size * 0.9, lineHeight: 1 }}>{v || '❔'}</span>;
}

export function IconField({ value, onChange }) {
  return (
    <div className="icof">
      <Ico v={value} size={22} />
      <input type="text" placeholder="emoji or image URL" value={String(value).startsWith('data:') ? '' : value} onChange={(e) => onChange(e.target.value)} />
      <label className="up" title="Upload image">📁
        <input type="file" accept="image/*" hidden onChange={(e) => e.target.files[0] && readImg(e.target.files[0], onChange)} />
      </label>
    </div>
  );
}

export function NumIn({ value, onChange, min = 0, ...p }) {
  const [t, setT] = useState(String(value));
  useEffect(() => { if (parseFloat(t) !== value) setT(String(value)); }, [value]);
  return (
    <input type="number" min={min} step="any" value={t} {...p}
      onChange={(e) => { setT(e.target.value); const n = parseFloat(e.target.value); if (!isNaN(n)) onChange(Math.max(min, n)); }} />
  );
}

export function Btn({ tone = '', sm, className = '', ...p }) {
  return (
    <motion.button className={`btn ${tone} ${sm ? 'sm' : ''} ${className}`}
      whileHover={p.disabled ? {} : { scale: 1.05 }} whileTap={p.disabled ? {} : { scale: 0.92, y: 3 }} {...p} />
  );
}

export const PaySel = ({ v, onChange, s, disabled }) => (
  <select value={v} disabled={disabled} onChange={(e) => onChange(e.target.value)}>
    <option value="cur">{s.curName}</option><option value="gems">{s.gemName}</option>
  </select>
);

export const pop = { initial: { scale: 0.6, opacity: 0 }, animate: { scale: 1, opacity: 1 }, exit: { scale: 0.6, opacity: 0 } };
