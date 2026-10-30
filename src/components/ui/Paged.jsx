import { useState } from 'react';
import { Btn } from './Controls.jsx';

/* ---------- Pagination: remembers page + page size per list id, so tabs/modals keep their place ---------- */
const pageMem = new Map();

export const jumpLast = (id) => pageMem.set(id, { ...(pageMem.get(id) || {}), page: 1e9 });

export function Paged({ id, items, size = 8, fixed, label, children }) {
  const [, redraw] = useState(0);
  const m = pageMem.get(id) || {}, sz = fixed ? size : (m.size ?? 5);
  const pages = sz === 0 ? 1 : Math.max(1, Math.ceil(items.length / sz));
  const page = Math.min(Math.max(0, m.page ?? 0), pages - 1);
  const set = (patch) => { pageMem.set(id, { ...m, page, ...patch }); redraw((n) => n + 1); };
  const slice = sz === 0 ? items : items.slice(page * sz, (page + 1) * sz);
  const opts = [5, 10, 20, 50];
  const bar = (fixed ? items.length > size : items.length > 5) && (
    <div className={'pager' + (fixed ? ' one' : '')}>
      <Btn sm tone="blue" disabled={page === 0} onClick={() => set({ page: 0 })} title="First">«</Btn>
      <Btn sm tone="blue" disabled={page === 0} onClick={() => set({ page: page - 1 })} title="Previous">‹</Btn>
      <span className="pinfo">{page + 1} / {pages}</span>
      <Btn sm tone="blue" disabled={page >= pages - 1} onClick={() => set({ page: page + 1 })} title="Next">›</Btn>
      <Btn sm tone="blue" disabled={page >= pages - 1} onClick={() => set({ page: pages - 1 })} title="Last">»</Btn>
      {fixed
        ? label && slice[0] && <b className="plabel">{label(slice[0])}</b>
        : <><select value={sz} onChange={(e) => set({ size: +e.target.value, page: 0 })} title="Items per page">
            {opts.map((n) => <option key={n} value={n}>{n} / page</option>)}<option value={0}>All</option>
          </select><span className="sub">{items.length} total</span></>}
    </div>
  );
  return (
    <>
      {fixed && bar}
      <div key={page}>{children(slice)}</div>
      {!fixed && bar}
    </>
  );
}
