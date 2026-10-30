import { totalMult, powMult, wMult, gain, rbMult } from './economy.js';
import { trackOf } from './gacha.js';
import { petMult } from './pets.js';
import { clock } from '../utils/format.js';
import { num } from '../utils/misc.js';

export const METRICS = [['earned', 'Total earned'], ['manual', 'Manual adds'], ['auto', 'Auto additions'], ['shopBuys', 'Shop purchases'], ['multBuys', 'Multipliers bought'], ['powerBuys', 'Powerups bought'], ['hatches', 'Pets hatched'], ['crafts', 'Pets crafted (attempts)'], ['rebirth', 'Rebirths'], ['runtime', 'Seconds run']];

export const defStats = () => ({ earned: 0, manual: 0, auto: 0, spentCur: 0, spentGems: 0, shopBuys: 0, multBuys: 0, powerBuys: 0, hatches: 0, quests: 0, runs: 0, maxGain: 0, crafts: 0, crafted: 0 });

/* Best case per addition if every upgrade in every component were bought: best shop item, every multiplier in every group, every powerup,
   the strongest weather, `maxPets` copies of the strongest pet (at the biggest craftable size when `craft` is on), and the rebirth bonus you have now.
   Returns each stage's factor and the running total, so the stats window can draw it as a graph. */
export const maxPlan = (s, craft = true) => {
  const best = s.shop.reduce((a, i) => Math.max(a, num(i.val, 0)), 0);
  const topBoost = s.petGroups.reduce((a, g) => g.pets.reduce((b, p) => Math.max(b, num(p.boost, 0)), a), 0);
  const topSize = craft ? (s.craft?.tiers || []).reduce((a, t) => Math.max(a, num(t.mult, 1)), 1) : 1;
  const f = [
    ['Best shop item', 1 + best],
    ['Multiplier groups', s.groups.reduce((a, g) => a * (1 + g.items.reduce((x, m) => x + num(m.val, 0), 0)), 1)],
    ['Powerups', s.powers.reduce((a, p) => a * Math.max(1, num(p.mult, 1)), 1)],
    ['Best weather', s.weather.reduce((a, w) => Math.max(a, num(w.mult, 1)), 1)],
    ['Best pets', 1 + s.maxPets * topBoost * topSize],
    ['Rebirth bonus', rbMult(s)],
  ];
  let run = 1;
  const stages = f.map(([name, factor]) => { run *= factor; return { name, factor, total: run }; });
  return { stages, total: run };
};

export const STAT_ROWS = [
  ['Total earned', (s) => s.stats.earned, 'sum'],
  ['Manual adds', (s) => s.stats.manual, 'sum'],
  ['Auto additions', (s) => s.stats.auto, 'sum'],
  ['Per addition now', (s) => gain(s), 'max'],
  ['Max per addition (all upgrades)', (s) => maxPlan(s).total, 'max'],
  ['Highest single addition', (s) => s.stats.maxGain, 'max'],
  ['Currency spent', (s) => s.stats.spentCur, 'sum'],
  ['Premium spent', (s) => s.stats.spentGems, 'sum'],
  ['Shop purchases', (s) => s.stats.shopBuys, 'sum'],
  ['Multipliers bought', (s) => s.stats.multBuys, 'sum'],
  ['Powerups bought', (s) => s.stats.powerBuys, 'sum'],
  ['Pets hatched', (s) => s.stats.hatches, 'sum'],
  ['Crafts attempted', (s) => s.stats.crafts, 'sum'],
  ['Crafts succeeded', (s) => s.stats.crafted, 'sum'],
  ['Rare pulls', (s) => s.petGroups.reduce((a, g) => a + trackOf(g).rares, 0), 'sum'],
  ['Longest rare drought', (s) => s.petGroups.reduce((a, g) => Math.max(a, trackOf(g).longest), 0), 'max'],
  ['Pets owned', (s) => s.inv.reduce((a, e) => a + e.count, 0), 'sum'],
  ['Rebirths', (s) => s.rb.count, 'sum'],
  ['Quests claimed', (s) => s.stats.quests, 'sum'],
  ['Runs started', (s) => s.stats.runs, 'sum'],
  ['Total runtime', (s) => s.totalRuntime, 'sum', clock],
  ['Total multiplier', (s) => totalMult(s) * powMult(s) * wMult(s) * petMult(s) * rbMult(s), 'max'],
];

export const metricVal = (s, m) => (m === 'rebirth' ? s.rb.count : m === 'runtime' ? s.totalRuntime : s.stats[m] || 0);

export const qProg = (s, q) => Math.max(0, metricVal(s, q.metric) - q.base);
