import { useEffect, useRef } from 'react';

/* ---------- Simulator tab name: read-only (so the tab can be dragged) until double-clicked ---------- */
export function TabName({ value, editing, onChange, onDone }) {
  const ref = useRef(null);
  useEffect(() => { if (editing && ref.current) { ref.current.focus(); ref.current.select(); } }, [editing]);
  return (
    <input ref={ref} value={value} readOnly={!editing} aria-label="Simulator name" tabIndex={editing ? 0 : -1}
      onChange={(e) => onChange(e.target.value)} onBlur={onDone} onClick={(e) => editing && e.stopPropagation()}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === 'Escape') e.currentTarget.blur(); }} />
  );
}
