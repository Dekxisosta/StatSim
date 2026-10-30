import { useState } from 'react';
import { motion } from 'framer-motion';
import { Ico, IconField, NumIn, Btn, pop } from '../ui/Controls.jsx';
import { shopCost } from '../../game/economy.js';
import { fmt } from '../../utils/format.js';

export function ShopCard({ it, eq, best, run, curIcon, can, onBuy, onEquip, onPatch, onDel }) {
  const [ed, setEd] = useState(false), owned = it.owned > 0;
  return (
    <motion.div layout {...pop} whileHover={{ y: -3 }} className={'card rowc' + (eq ? ' eq' : '') + (owned && !eq ? ' owned' : '') + (best ? ' best' : '')}>
      {ed && !run ? (
        <div className="edit">
          <IconField value={it.icon} onChange={(icon) => onPatch({ icon })} />
          <input type="text" value={it.name} onChange={(e) => onPatch({ name: e.target.value })} />
          <label>Boost + <NumIn value={it.val} onChange={(val) => onPatch({ val })} /></label>
          <label>Price <NumIn value={it.cost} onChange={(cost) => onPatch({ cost })} /></label>
          <div className="row"><Btn sm onClick={() => setEd(false)}>✔ Done</Btn><Btn sm tone="red" onClick={onDel}>🗑</Btn></div>
        </div>
      ) : (
        <>
          <motion.div className="e" whileHover={{ rotate: [0, -12, 12, 0] }}><Ico v={it.icon} size={36} /></motion.div>
          <div className="info">
            <div className="nm">{it.name} <span className="g">+{fmt(it.val)}</span></div>
            <div className="sub">{eq ? '★ Equipped' : owned ? '✔ Purchased' : best ? '⭐ Best buy' : can ? 'Affordable' : 'One-time'}</div>
          </div>
          <div className="btns">
            {owned
              ? <Btn sm tone={eq ? 'gold' : 'blue'} disabled={eq} onClick={onEquip}>{eq ? '★ On' : 'Equip'}</Btn>
              : <Btn sm disabled={!run || !can} onClick={onBuy}><Ico v={curIcon} size={14} /> {fmt(shopCost(it))}</Btn>}
            <Btn sm tone="blue" disabled={run} onClick={() => setEd(true)}>✏️</Btn>
          </div>
        </>
      )}
    </motion.div>
  );
}
