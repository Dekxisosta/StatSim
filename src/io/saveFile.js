import { newSim, norm } from '../game/defaults.js';
import { uid, num, isObj, withIds } from '../utils/misc.js';

export const SAVE_TAG = 'statsim-save', BACKUP_TAG = 'statsim-backup', FILE_VERSION = 1, MAX_FILE = 8e6;

const cleanSim = (raw) => {
  if (!isObj(raw) || !Array.isArray(raw.shop)) throw new Error('unreadable simulator');
  const n = norm(raw), b = newSim(1);
  const shop = withIds(n.shop).map((it) => ({ ...it, name: String(it.name ?? 'Item'), icon: it.icon || '⭐', val: num(it.val, 1), cost: Math.max(0, num(it.cost, 10)), owned: num(it.owned, 0) > 0 ? 1 : 0 }));
  return {
    ...n, shop, equipped: shop.some((i) => i.id === n.equipped && i.owned > 0) ? n.equipped : null,
    name: String(n.name || 'Imported'), id: n.id || uid(),
    cur: Math.max(0, num(n.cur, 0)), gems: Math.max(0, num(n.gems, 0)), runtime: Math.max(0, Math.floor(num(n.runtime, 0))), totalRuntime: Math.max(0, Math.floor(num(n.totalRuntime, 0))),
    maxPets: Math.max(1, Math.floor(num(n.maxPets, b.maxPets))), interval: Math.max(0.1, num(n.interval, 1)), weatherLeft: Math.max(0, Math.floor(num(n.weatherLeft, 0))),
    powers: withIds(n.powers), weather: withIds(n.weather), quests: withIds(n.quests),
    groups: withIds(n.groups).map((g) => ({ ...g, items: withIds(g.items) })),
    petGroups: withIds(n.petGroups).map((g) => ({ ...g, pets: withIds(g.pets) })),
    inv: Array.isArray(n.inv) ? n.inv.filter((e) => isObj(e) && e.pid).map((e) => ({ ...e, tier: Math.max(0, Math.floor(num(e.tier, 0))), count: Math.max(0, Math.floor(num(e.count, 0))), eq: Math.max(0, Math.floor(num(e.eq, 0))) })) : [],
    tSec: 0, tAuto: 0, running: false, auto: false,
  };
};

// Accepts: a single-simulator save, a multi-simulator backup, a bare simulator object, a list of simulators, or the raw localStorage blob.
export const parseImport = (text) => {
  const t = String(text).replace(/^\uFEFF/, '').trim();
  if (!t) throw new Error('The file is empty.');
  let d;
  try { d = JSON.parse(t); } catch (e) { throw new Error(`Not valid JSON (${e.message}).`); }
  const warn = [];
  if (isObj(d) && num(d.version, 0) > FILE_VERSION) warn.push('This file comes from a newer StatSim, so some data may be ignored.');
  let raw, extras = {}, backup = false;
  if (Array.isArray(d)) { raw = d; backup = true; }
  else if (isObj(d) && isObj(d.sim)) raw = [d.sim];
  else if (isObj(d) && Array.isArray(d.sims)) {
    raw = d.sims; backup = true;
    if (typeof d.logo === 'string' && d.logo.length < 700000) extras.logo = d.logo;
    if (typeof d.anim === 'boolean') extras.anim = d.anim;
    if (d.activeId) extras.activeId = d.activeId;
  } else if (isObj(d) && Array.isArray(d.shop)) raw = [d];
  else throw new Error('This is not a StatSim file.');
  const sims = [];
  raw.slice(0, 50).forEach((r, i) => { try { sims.push(cleanSim(r)); } catch { warn.push(`Skipped item ${i + 1}: it could not be read.`); } });
  if (raw.length > 50) warn.push('Only the first 50 simulators were read.');
  if (!sims.length) throw new Error('No simulators found in this file.');
  return { backup: backup || sims.length > 1, sims, extras, warn };
};

export const download = (name, text) => {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([text], { type: 'application/json' }));
  a.download = name; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
};
