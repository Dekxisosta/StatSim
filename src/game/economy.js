import { petMult } from './pets.js';

export const shopCost = (it) => it.cost; // one-time purchase: fixed price

export const groupMult = (g) => 1 + g.items.filter((m) => m.bought).reduce((a, m) => a + m.val, 0);

export const totalMult = (s) => s.groups.reduce((a, g) => a * groupMult(g), 1);

const baseAdd = (s) => { const it = s.shop.find((i) => i.id === s.equipped); return 1 + (it && it.owned > 0 ? it.val : 0); };

// Shop order: equipped item first, then what you can afford (best boost first), then the rest by price, bought items last.
export const shopOrder = (s) => {
  const eq = s.shop.find((i) => i.id === s.equipped && i.owned > 0), rest = s.shop.filter((i) => i !== eq);
  const buy = (i) => i.owned < 1 && s.cur >= i.cost;
  return [
    ...(eq ? [eq] : []),
    ...rest.filter(buy).sort((a, b) => b.val - a.val || a.cost - b.cost),
    ...rest.filter((i) => i.owned < 1 && !buy(i)).sort((a, b) => a.cost - b.cost || b.val - a.val),
    ...rest.filter((i) => i.owned > 0).sort((a, b) => b.val - a.val),
  ];
};

export const powMult = (s) => s.powers.reduce((a, p) => a * (p.bought ? p.mult : 1), 1);

export const wMult = (s) => { const w = s.weather.find((x) => x.id === s.activeWeather); return w ? w.mult : 1; };

// The best owned shop item (highest boost). Ties keep the currently equipped one.
export const bestOwned = (shop, cur) => {
  const eq = shop.find((i) => i.id === cur && i.owned > 0) || null;
  return (shop.filter((i) => i.owned > 0).reduce((b, i) => (!b || i.val > b.val ? i : b), eq) || {}).id ?? null;
};

export const gain = (s) => baseAdd(s) * totalMult(s) * powMult(s) * wMult(s) * petMult(s) * rbMult(s);

export const bal = (s, pay) => (pay === 'gems' ? s.gems : s.cur);

export const spend = (s, pay, c) => {
  const k = pay === 'gems' ? 'spentGems' : 'spentCur';
  const n = pay === 'gems' ? { ...s, gems: s.gems - c } : { ...s, cur: s.cur - c };
  return { ...n, stats: { ...n.stats, [k]: n.stats[k] + c } };
};

export const bump = (s, k, n = 1) => ({ ...s, stats: { ...s.stats, [k]: s.stats[k] + n } });

export const earn = (s, g, kind) => ({ ...s, cur: s.cur + g, stats: { ...s.stats, earned: s.stats.earned + g, [kind]: s.stats[kind] + 1, maxGain: Math.max(s.stats.maxGain, g) } });

export const rbCost = (s) => Math.ceil(s.rb.baseCost * Math.pow(s.rb.scale, s.rb.count));

export const rbMult = (s) => 1 + s.rb.count * s.rb.bonus;

export const payIcon = (s, pay) => (pay === 'gems' ? s.gemIcon : s.curIcon);
