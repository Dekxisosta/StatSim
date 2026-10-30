import { uid, num } from '../utils/misc.js';

/* ---------- Crafting: tier t (1-based) is made from pets of tier t-1 (tier 0 = the normal pet) ----------
   Using `min` pets gives `chance`% to craft one pet of the next size; each extra pet raises the odds linearly until `sure` pets, which always works.
   A failed craft uses the pets up. `mult` multiplies the pet's boost. */
export const defCraft = () => ({ tiers: [
  { id: uid(), name: 'Big', mult: 4, min: 2, chance: 66, sure: 3 },
  { id: uid(), name: 'Huge', mult: 16, min: 3, chance: 50, sure: 5 },
  { id: uid(), name: 'Giant', mult: 64, min: 4, chance: 40, sure: 8 },
] });

export const cleanTier = (t, i) => ({ id: t.id || uid(), name: String(t.name ?? `Size ${i + 1}`), mult: Math.max(0, num(t.mult, 1)), min: num(t.min, 2), chance: num(t.chance, 50), sure: num(t.sure, 3) });

// Read-time normalisation, so half-typed config values never break a craft.
export const recipeOf = (d) => {
  const min = Math.max(2, Math.floor(num(d.min, 2)));
  return { min, sure: Math.max(min, Math.floor(num(d.sure, min))), chance: Math.min(100, Math.max(0, num(d.chance, 50))) };
};

export const craftChance = (r, n) => (n >= r.sure ? 100 : n < r.min ? 0 : r.chance + ((100 - r.chance) * (n - r.min)) / Math.max(1, r.sure - r.min));
