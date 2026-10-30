import { num, isObj } from '../utils/misc.js';

/* ---------- Gacha: weighted pulls with a sigmoid pity ramp ----------
   Each egg is a probability distribution over its pets (the base chances). "Rare" pets are those whose chance is <= rareBelow %.
   Misses since the last rare ("pity") move probability mass from the common pool to the rare pool along a normalised sigmoid:
   P(rare | n) = R + (peak - R) * ramp(n), where R is the base rare share and ramp(0)=0, ramp(hard-1)=1.
   Inside each pool the original relative weights are kept. A pull is then a weighted random pick over that adjusted distribution. */
const GACHA_DEF = { enabled: true, rareBelow: 5, mid: 40, steep: 0.12, hard: 80, cap: 100, discount: 0 };

export const gachaCfg = (g) => {
  const o = (g && g.gacha) || {}, n = (k, lo, hi) => Math.min(hi, Math.max(lo, num(o[k], GACHA_DEF[k])));
  return { enabled: o.enabled !== false, rareBelow: n('rareBelow', 0, 100), mid: n('mid', 0, 1e5), steep: n('steep', 0, 100), hard: Math.floor(n('hard', 1, 1e5)), cap: n('cap', 0, 100), discount: n('discount', 0, 90) };
};

export const trackOf = (g) => {
  const t = (g && g.track) || {}, n = (v) => Math.max(0, Math.floor(num(v, 0)));
  return { pulls: n(t.pulls), rares: n(t.rares), since: n(t.since), longest: n(t.longest), counts: isObj(t.counts) ? t.counts : {} };
};

const sigm = (x) => 1 / (1 + Math.exp(-x));

export const pityRamp = (c, n) => {
  const H = c.hard - 1;
  if (!c.enabled) return 0;
  if (H <= 0 || n >= H) return 1;
  if (n <= 0) return 0;
  if (c.steep === 0) return n / H;
  const a = sigm(-c.steep * c.mid), b = sigm(c.steep * (H - c.mid));
  if (!(b - a > 1e-12)) return n / H;
  return Math.min(1, Math.max(0, (sigm(c.steep * (n - c.mid)) - a) / (b - a)));
};

export const gachaDist = (g, since) => {
  const c = gachaCfg(g), tot = g.pets.reduce((a, p) => a + Math.max(0, p.chance), 0) || 1;
  const base = g.pets.map((p) => Math.max(0, p.chance) / tot), rare = g.pets.map((p) => p.chance <= c.rareBelow);
  const R = base.reduce((a, w, i) => a + (rare[i] ? w : 0), 0);
  const live = c.enabled && R > 1e-9 && R < 1 - 1e-9, ramp = live ? pityRamp(c, since) : 0;
  const peak = Math.max(R, c.cap / 100), pr = live ? R + (peak - R) * ramp : R;
  const p = live ? base.map((w, i) => (rare[i] ? (w / R) * pr : (w / (1 - R)) * (1 - pr))) : base;
  return { p, base, rare, R, pr, peak, ramp, live };
};

const pickWeighted = (w, r = Math.random()) => {
  const sum = w.reduce((a, x) => a + x, 0);
  let t = r * sum, last = -1;
  for (let i = 0; i < w.length; i++) { if (w[i] <= 0) continue; last = i; if (t < w[i]) return i; t -= w[i]; }
  return last;
};

export const gachaCost = (g, n) => Math.ceil(g.cost * n * (n > 1 ? 1 - gachaCfg(g).discount / 100 : 1));

// Runs n sequential pulls, carrying the pity counter between them. Pure apart from the rng.
export const gachaRun = (g, n, rng = Math.random) => {
  const t = trackOf(g), counts = { ...t.counts }, items = [];
  let { pulls, rares, since, longest } = t;
  for (let k = 0; k < n; k++) {
    const d = gachaDist(g, since), i = pickWeighted(d.p, rng());
    if (i < 0) break;
    const pet = g.pets[i], rare = d.rare[i];
    items.push({ pet, rare, rate: d.p[i] * 100, pity: since });
    pulls++; counts[pet.id] = (counts[pet.id] || 0) + 1;
    if (rare) { rares++; since = 0; } else { since++; longest = Math.max(longest, since); }
  }
  return { items, track: { pulls, rares, since, longest, counts } };
};
