export const statOf = (s, e) => { for (const g of s.petGroups) { const p = g.pets.find((x) => x.id === e.pid); if (p) return p; } return e.snap; };

export const totalEq = (inv) => inv.reduce((a, e) => a + e.eq, 0);

// Inventory entries are one stack per (pet, size). `tier` is missing on older saves, which means 0 (normal size).
export const ek = (e) => `${e.pid}:${e.tier || 0}`;

const tierDef = (s, t) => (t > 0 ? s.craft?.tiers?.[t - 1] : null);

const tierName = (s, t) => (tierDef(s, t) ? tierDef(s, t).name : '');

export const petBoost = (s, e) => (statOf(s, e).boost || 0) * (tierDef(s, e.tier || 0) ? tierDef(s, e.tier || 0).mult : 1);

export const petName = (s, e) => [tierName(s, e.tier || 0), statOf(s, e).name].filter(Boolean).join(' ');

export const petSize = (e, base) => base + Math.min(e.tier || 0, 4) * 6; // bigger pets are drawn a little bigger

export const petMult = (s) => 1 + s.inv.reduce((a, e) => a + e.eq * petBoost(s, e), 0);

export const trim = (inv, max) => {
  let ex = totalEq(inv) - max;
  if (ex <= 0) return inv;
  return [...inv].reverse().map((e) => { const d = Math.min(e.eq, Math.max(ex, 0)); ex -= d; return { ...e, eq: e.eq - d }; }).reverse();
};

export const balance = (pets) => {
  if (!pets.length) return pets;
  const sum = pets.reduce((a, p) => a + p.chance, 0);
  const ch = pets.map((p) => Math.round((sum > 0 ? p.chance / sum : 1 / pets.length) * 10000) / 100);
  let k = ch.length - 1;
  if (sum > 0) while (k > 0 && ch[k] === 0) k--;
  ch[k] = Math.round((ch[k] + 100 - ch.reduce((a, b) => a + b, 0)) * 100) / 100;
  return pets.map((p, i) => ({ ...p, chance: ch[i] }));
};

export const addPet = (s, pet, tier = 0) => {
  const snap = { name: pet.name, icon: pet.icon, boost: pet.boost }, slot = totalEq(s.inv) < s.maxPets ? 1 : 0;
  const same = (e) => e.pid === pet.id && (e.tier || 0) === tier;
  return s.inv.some(same)
    ? s.inv.map((e) => (same(e) ? { ...e, count: e.count + 1, eq: e.eq + slot, snap } : e))
    : [...s.inv, { pid: pet.id, tier, count: 1, eq: slot, snap }];
};
