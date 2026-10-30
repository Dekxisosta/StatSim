import { defCraft, cleanTier } from './craft.js';
import { defStats } from './stats.js';
import { uid, isObj } from '../utils/misc.js';

const defShop = () => [
  { id: uid(), name: 'Pebble', icon: '🪨', val: 2, cost: 10, owned: 0 },
  { id: uid(), name: 'Coin Stack', icon: '💰', val: 10, cost: 100, owned: 0 },
  { id: uid(), name: 'Gold Bar', icon: '🥇', val: 50, cost: 700, owned: 0 },
  { id: uid(), name: 'Crystal', icon: '🔮', val: 300, cost: 5000, owned: 0 },
];

const defPow = () => [
  { id: uid(), name: 'Double Up', icon: '⚡', mult: 2, cost: 5, pay: 'gems', bought: false },
  { id: uid(), name: 'Triple Threat', icon: '🔥', mult: 3, cost: 12, pay: 'gems', bought: false },
  { id: uid(), name: 'Mega Boost', icon: '🚀', mult: 5, cost: 25, pay: 'gems', bought: false },
];

const defWeather = () => [
  { id: uid(), name: 'Sunny', icon: '☀️', fx: 'sun', mult: 2, duration: 60 },
  { id: uid(), name: 'Rainy', icon: '🌧️', fx: 'rain', mult: 3, duration: 45 },
  { id: uid(), name: 'Snowy', icon: '❄️', fx: 'snow', mult: 5, duration: 30 },
  { id: uid(), name: 'Stormy', icon: '⛈️', fx: 'storm', mult: 10, duration: 20 },
];

const defPetGroups = () => [
  { id: uid(), name: 'Basic Egg', icon: '🥚', color: '#ffd93b', cost: 100, pay: 'cur', pets: [
    { id: uid(), name: 'Cat', icon: '🐱', boost: 0.1, chance: 60 },
    { id: uid(), name: 'Dog', icon: '🐶', boost: 0.25, chance: 30 },
    { id: uid(), name: 'Dragon', icon: '🐉', boost: 1, chance: 9 },
    { id: uid(), name: 'Unicorn', icon: '🦄', boost: 5, chance: 1 },
  ] },
  { id: uid(), name: 'Gem Egg', icon: '🥚', color: '#7df9ff', cost: 10, pay: 'gems', pets: [
    { id: uid(), name: 'Fox', icon: '🦊', boost: 0.5, chance: 70 },
    { id: uid(), name: 'Eagle', icon: '🦅', boost: 3, chance: 25 },
    { id: uid(), name: 'Rainbow', icon: '🌈', boost: 15, chance: 5 },
  ] },
];

const defQuests = () => [
  { id: uid(), name: 'Getting Started', metric: 'earned', target: 100, reward: 50, pay: 'cur', repeat: false, base: 0, claimed: false },
  { id: uid(), name: 'Clicker', metric: 'manual', target: 25, reward: 1, pay: 'gems', repeat: false, base: 0, claimed: false },
  { id: uid(), name: 'Shopper', metric: 'shopBuys', target: 5, reward: 100, pay: 'cur', repeat: false, base: 0, claimed: false },
  { id: uid(), name: 'Hatchling', metric: 'hatches', target: 3, reward: 2, pay: 'gems', repeat: false, base: 0, claimed: false },
  { id: uid(), name: 'Marathon (sec)', metric: 'runtime', target: 120, reward: 5, pay: 'gems', repeat: true, base: 0, claimed: false },
  { id: uid(), name: 'Reborn', metric: 'rebirth', target: 1, reward: 10, pay: 'gems', repeat: false, base: 0, claimed: false },
];

const defTitles = () => ({ shop: 'Shop', power: 'Powerups', mult: 'Multipliers', weather: 'Weather Effects', pets: 'Pets' });

export const newSim = (n) => {
  const shop = defShop();
  return {
    id: uid(), name: `Sim ${n}`, cur: 0, gems: 0, running: false, auto: false, interval: 1, titles: defTitles(), craft: defCraft(), autoEquip: true,
    curName: 'Coins', curIcon: '🪙', gemName: 'Gems', gemIcon: '💎',
    shop, equipped: null, powers: defPow(), groups: [], weather: defWeather(), activeWeather: null, weatherLeft: 0, runtime: 0, totalRuntime: 0,
    rb: { count: 0, baseCost: 1000, scale: 2, bonus: 0.5, gems: 1, resetShop: true, resetMult: false }, stats: defStats(), quests: defQuests(), petGroups: defPetGroups(), inv: [], maxPets: 3,
  };
};

export const norm = (s) => {
  const b = newSim(1), ok = Array.isArray(s.shop);
  const shop = (ok ? s.shop : b.shop).map((it) => ({ ...it, owned: it.owned > 0 ? 1 : 0 })); // shop items are one-time purchases
  return {
    ...b, ...s, shop, equipped: shop.some((i) => i.id === s.equipped && i.owned > 0) ? s.equipped : null,
    powers: Array.isArray(s.powers) ? s.powers : b.powers,
    rb: { ...b.rb, ...(s.rb || {}) }, stats: { ...b.stats, ...(s.stats || {}) }, quests: Array.isArray(s.quests) ? s.quests : b.quests,
    weather: Array.isArray(s.weather) ? s.weather.map((w) => ({ duration: 60, ...w })) : b.weather,
    groups: (s.groups || []).map((g) => ({ pay: 'cur', ...g })), running: false, auto: false, tSec: 0, tAuto: 0,
    autoEquip: s.autoEquip !== false,
    titles: { ...b.titles, ...Object.fromEntries(Object.entries(isObj(s.titles) ? s.titles : {}).filter(([k, v]) => k in b.titles && typeof v === 'string' && v.trim())) },
    craft: { tiers: isObj(s.craft) && Array.isArray(s.craft.tiers) ? s.craft.tiers.filter(isObj).map(cleanTier) : b.craft.tiers },
  };
};
