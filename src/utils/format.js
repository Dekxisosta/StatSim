// K, M, B, T, Qa, Qi, then Sx (sextillion) up to Vg (vigintillion, 1e63). Past that it switches to scientific notation (1.23e66).
const SUFFIX = ['', 'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No', 'Dc', 'Ud', 'Dd', 'Td', 'Qad', 'Qid', 'Sxd', 'Spd', 'Ocd', 'Nod', 'Vg'];

export const fmt = (n) => {
  if (!isFinite(n)) return n > 0 ? '∞' : n < 0 ? '-∞' : '0';
  if (Math.abs(n) >= 1e66) return n.toExponential(2).replace('e+', 'e');
  let i = 0;
  while (Math.abs(n) >= 1000 && i < SUFFIX.length - 1) { n /= 1000; i++; }
  if (i && i < SUFFIX.length - 1 && Math.abs(n).toFixed(2) === '1000.00') { n /= 1000; i++; } // 999.999K rounds up to 1.00M, not 1000.00K
  return (i ? n.toFixed(2) : String(Math.round(n * 100) / 100)) + SUFFIX[i];
};

export const clock = (n) => [Math.floor(n / 3600), Math.floor(n / 60) % 60, n % 60].map((v) => String(v).padStart(2, '0')).join(':');

export const pct = (x) => Math.round(x * 10000) / 100;
