import { useState } from 'react';
import { motion } from 'framer-motion';
import AVATAR from '../../assets/avatar.png';

/* ---------- Shameless plug ---------- */
export function Plug() {
  const [bad, setBad] = useState(false);
  return (
    <motion.a className="plug panel" href="https://github.com/Dekxisosta" target="_blank" rel="noopener noreferrer"
      initial={{ y: 24, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
      {bad
        ? <span className="plugav fb">👾</span>
        : <img className="plugav" src={AVATAR} alt="Dekxisosta" onError={() => setBad(true)} />}
      <span className="plugtx">
        <small>Made by</small>
        <b>Dekxisosta</b>
        <small>github.com/Dekxisosta ↗</small>
      </span>
    </motion.a>
  );
}
