/* ---------- Section title that can be renamed in place ---------- */
export function TitleEdit({ icon, value, def, onChange }) {
  return (
    <span className="ttlw">
      {icon}
      <input className="ttlin" type="text" value={value} maxLength={30} spellCheck={false} title="Click to rename" aria-label="Section title"
        onChange={(e) => onChange(e.target.value)} onBlur={() => !value.trim() && onChange(def)} onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()} />
    </span>
  );
}
