import '@fontsource/lilita-one';
import '@fontsource/fredoka-one';
import '@fontsource/fredoka/400.css';
import '@fontsource/fredoka/600.css';
import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, MotionConfig, MotionGlobalConfig, Reorder } from 'framer-motion';
import { StatsChart } from './components/StatsChart.jsx';
import { PetGroupCard } from './components/cards/PetGroupCard.jsx';
import { PowerCard } from './components/cards/PowerCard.jsx';
import { QuestCard } from './components/cards/QuestCard.jsx';
import { ShopCard } from './components/cards/ShopCard.jsx';
import { WeatherCard } from './components/cards/WeatherCard.jsx';
import { Confetti } from './components/effects/Confetti.jsx';
import { INTRO_KEY, introWanted, Intro } from './components/effects/Intro.jsx';
import { WeatherFx } from './components/effects/WeatherFx.jsx';
import { CurrencyPill } from './components/header/CurrencyPill.jsx';
import { TabName } from './components/header/TabName.jsx';
import { CraftModal } from './components/modals/CraftModal.jsx';
import { DataModal } from './components/modals/DataModal.jsx';
import { MusicModal } from './components/modals/MusicModal.jsx';
import { PresetsModal } from './components/modals/PresetsModal.jsx';
import { Ico, IconField, NumIn, Btn, PaySel, pop } from './components/ui/Controls.jsx';
import { Modal } from './components/ui/Modal.jsx';
import { jumpLast, Paged } from './components/ui/Paged.jsx';
import { Plug } from './components/ui/Plug.jsx';
import { TitleEdit } from './components/ui/TitleEdit.jsx';
import { KEY, DEFAULT_LOGO, TITLE_ICON } from './game/constants.js';
import { recipeOf, craftChance } from './game/craft.js';
import { newSim, norm } from './game/defaults.js';
import { shopCost, groupMult, totalMult, shopOrder, powMult, wMult, bestOwned, gain, bal, spend, bump, earn, payIcon, rbCost, rbMult } from './game/economy.js';
import { gachaCost, gachaRun } from './game/gacha.js';
import { statOf, totalEq, ek, petBoost, petName, petSize, petMult, trim, addPet } from './game/pets.js';
import { STAT_ROWS, metricVal, qProg } from './game/stats.js';
import { tick } from './game/tick.js';
import { useMusic } from './hooks/useMusic.js';
import { useTablet } from './hooks/useTablet.js';
import { SAVE_TAG, download, FILE_VERSION, BACKUP_TAG } from './io/saveFile.js';
import { fmt, clock, pct } from './utils/format.js';
import { uid } from './utils/misc.js';

export default function App() {
  const [sims, setSims] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [logo, setLogo] = useState(DEFAULT_LOGO);
  const [loaded, setLoaded] = useState(false);
  const [view, setView] = useState('shop');
  const [settings, setSettings] = useState(false);
  const [pops, setPops] = useState([]);
  const [anim, setAnim] = useState(false);
  const [invOpen, setInvOpen] = useState(false);
  const [statsOpen, setStatsOpen] = useState(false);
  const [rbOpen, setRbOpen] = useState(false);
  const [qOpen, setQOpen] = useState(false);
  const [ioOpen, setIoOpen] = useState(false);
  const m = useMusic();
  const [musicOpen, setMusicOpen] = useState(false);
  const [presetOpen, setPresetOpen] = useState(false);
  const [introOn, setIntroOn] = useState(() => { try { return localStorage.getItem(INTRO_KEY) !== '0'; } catch { return true; } });
  const [stage, setStage] = useState(() => (introWanted() ? 'intro' : 'done')); // intro -> reveal -> done
  const toggleIntro = () => { const v = !introOn; setIntroOn(v); try { localStorage.setItem(INTRO_KEY, v ? '1' : '0'); } catch {} };
  const [editId, setEditId] = useState(null); // simulator tab being renamed
  const [craftOpen, setCraftOpen] = useState(false);
  const [craftRes, setCraftRes] = useState(null);
  const [hatch, setHatch] = useState(null);
  const [confetti, setConfetti] = useState(null);
  const celebrate = (big = false) => {
    const k = uid();
    setConfetti({ k, big });
    setTimeout(() => setConfetti((c) => (c && c.k === k ? null : c)), 3000);
  };
  const [multi, setMulti] = useState(null);
  const prev = useRef({ id: null, cur: 0 });
  const tablet = useTablet();
  // Sticky header (navbar + simulator tabs): publish its height as CSS vars so the side panel can stick right below it.
  const headObs = useRef(null);
  const headRef = useCallback((el) => {
    if (headObs.current) { headObs.current.disconnect(); headObs.current = null; }
    if (!el) return;
    const root = document.documentElement;
    const measure = () => {
      const bar = el.firstElementChild;
      root.style.setProperty('--headh', `${el.offsetHeight}px`);
      root.style.setProperty('--toph', `${bar ? bar.offsetHeight + parseFloat(getComputedStyle(bar).marginBottom || 0) : 0}px`);
    };
    measure();
    if (typeof ResizeObserver !== 'undefined') { headObs.current = new ResizeObserver(measure); headObs.current.observe(el); if (el.firstElementChild) headObs.current.observe(el.firstElementChild); }
  }, []);

  useEffect(() => {
    let d = null;
    try { d = JSON.parse(localStorage.getItem(KEY)); } catch {}
    if (d?.sims?.length) {
      setSims(d.sims.map(norm)); setActiveId(d.activeId ?? d.sims[0].id); if (d.logo && d.logo !== '📊') setLogo(d.logo); if (typeof d.anim === 'boolean') setAnim(d.anim);
    } else { const s = newSim(1); setSims([s]); setActiveId(s.id); }
    setLoaded(true);
  }, []);
  useEffect(() => {
    if (!loaded) return;
    try { localStorage.setItem(KEY, JSON.stringify({ sims, activeId, logo, anim })); } catch {}
  }, [sims, activeId, logo, anim, loaded]);

  useEffect(() => {
    let last = performance.now();
    const t = setInterval(() => {
      const now = performance.now(), dt = Math.min(now - last, 120000);
      last = now;
      // The updater must stay pure (React StrictMode runs it twice in dev), so all timing lives in the state and in dt.
      setSims((p) => {
        let ch = false;
        const n = p.map((s) => { const x = tick(s, dt); if (x !== s) ch = true; return x; });
        return ch ? n : p;
      });
    }, 100);
    return () => clearInterval(t);
  }, []);

  const sim = sims.find((s) => s.id === activeId) || sims[0];
  useEffect(() => {
    if (!sim) return;
    if (anim && prev.current.id === sim.id && sim.cur > prev.current.cur) {
      const id = uid(), d = sim.cur - prev.current.cur;
      setPops((p) => [...p.slice(-5), { id, t: '+' + fmt(d), x: Math.random() * 80 - 40 }]);
      setTimeout(() => setPops((p) => p.filter((q) => q.id !== id)), 900);
    }
    prev.current = { id: sim.id, cur: sim.cur };
  }, [sim?.cur, sim?.id]);

  MotionGlobalConfig.skipAnimations = !anim;
  if (!loaded || !sim) return null;
  const run = sim.running;
  const upd = (fn, id = sim.id) => setSims((p) => p.map((s) => (s.id === id ? fn(s) : s)));
  const set = (patch) => upd((s) => ({ ...s, ...patch }));
  const setTitle = (k, v) => upd((s) => ({ ...s, titles: { ...s.titles, [k]: v } }));
  const addTab = () => { const s = newSim(sims.length + 1); setSims([...sims, s]); setActiveId(s.id); };
  const closeTab = (id) => {
    if (!confirm('Delete this simulator?')) return;
    const rest = sims.filter((s) => s.id !== id); setSims(rest); if (id === activeId) setActiveId(rest[0].id);
  };
  const clearAll = () => {
    if (!confirm('Empty localStorage and reset everything?')) return;
    localStorage.removeItem(KEY);
    const s = newSim(1); setSims([s]); setActiveId(s.id); setLogo(DEFAULT_LOGO); setAnim(false); setSettings(false);
  };

  const stamp = () => new Date().toISOString();
  const saveState = () => {
    const safe = sim.name.replace(/[^\w-]+/g, '_') || 'sim';
    download(`statsim-${safe}.json`, JSON.stringify({ type: SAVE_TAG, version: FILE_VERSION, savedAt: stamp(), sim }, null, 2));
  };
  const exportAll = () => download(`statsim-backup-${stamp().slice(0, 10)}.json`, JSON.stringify({ type: BACKUP_TAG, version: FILE_VERSION, savedAt: stamp(), activeId, logo, anim, sims }, null, 2));
  const importReplaceOne = (n) => upd(() => ({ ...n, id: sim.id }));
  const importAdd = (arr) => { const add = arr.map((n) => ({ ...n, id: uid() })); setSims((p) => [...p, ...add]); setActiveId(add[0].id); };
  const importAll = (arr, ex) => {
    const seen = new Set(), all = arr.map((n) => { const id = n.id && !seen.has(n.id) ? n.id : uid(); seen.add(id); return { ...n, id }; });
    setSims(all); setActiveId(all.find((s) => s.id === ex.activeId) ? ex.activeId : all[0].id);
    if (ex.logo) setLogo(ex.logo);
    if (typeof ex.anim === 'boolean') setAnim(ex.anim);
  };

  const list = (k, fn) => upd((s) => ({ ...s, [k]: fn(s[k]) }));
  const addTo = (k, mk) => { if (k !== 'shop') jumpLast(`${sim.id}:${k}`); list(k, (a) => [...a, mk(a)]); };
  const patchIn = (k, id, patch) => list(k, (a) => a.map((x) => (x.id === id ? { ...x, ...patch } : x)));
  const buyShop = (it) => upd((s) => {
    const cur = s.shop.find((i) => i.id === it.id);
    if (!cur || cur.owned > 0 || s.cur < shopCost(cur)) return s; // one-time purchase
    const shop = s.shop.map((i) => (i.id === it.id ? { ...i, owned: 1 } : i));
    const n = bump({ ...spend(s, 'cur', shopCost(cur)), shop }, 'shopBuys');
    return s.autoEquip ? { ...n, equipped: bestOwned(shop, s.equipped) } : n; // auto-equip keeps the best owned item equipped
  });
  const setAutoEquip = (on) => upd((s) => (on ? { ...s, autoEquip: true, equipped: bestOwned(s.shop, s.equipped) } : { ...s, autoEquip: false }));
  const equipShop = (it) => upd((s) => (s.shop.some((i) => i.id === it.id && i.owned > 0) ? { ...s, equipped: it.id } : s)); // only purchased items
  const delShop = (id) => upd((s) => {
    const shop = s.shop.filter((i) => i.id !== id);
    return { ...s, shop, equipped: s.equipped === id ? null : s.equipped };
  });
  const buyPower = (p) => upd((s) => (bal(s, p.pay) < p.cost || p.bought ? s : bump({ ...spend(s, p.pay, p.cost), powers: s.powers.map((x) => (x.id === p.id ? { ...x, bought: true } : x)) }, 'powerBuys')));
  const rebirth = () => {
    if (!run || sim.cur < rbCost(sim) || !confirm('Rebirth? This resets your progress for a permanent bonus.')) return;
    upd((s) => {
      if (s.cur < rbCost(s)) return s;
      const n = { ...s, cur: 0, gems: s.gems + s.rb.gems, rb: { ...s.rb, count: s.rb.count + 1 } };
      if (s.rb.resetShop) { n.shop = s.shop.map((i) => ({ ...i, owned: 0 })); n.equipped = null; }
      if (s.rb.resetMult) n.groups = s.groups.map((g) => ({ ...g, items: g.items.map((m) => ({ ...m, bought: false })) }));
      return n;
    });
  };
  const claimQuest = (id) => upd((s) => {
    const q = s.quests.find((x) => x.id === id);
    if (!q || q.claimed || qProg(s, q) < q.target) return s;
    const n = bump(q.pay === 'gems' ? { ...s, gems: s.gems + q.reward } : { ...s, cur: s.cur + q.reward }, 'quests');
    return { ...n, quests: n.quests.map((x) => (x.id === id ? (x.repeat ? { ...x, base: metricVal(n, x.metric) } : { ...x, claimed: true }) : x)) };
  });
  const setMax = (n) => upd((s) => { const m = Math.max(1, Math.floor(n)); return { ...s, maxPets: m, inv: trim(s.inv, m) }; });
  const eqPet = (key, d) => upd((s) => {
    const tot = totalEq(s.inv);
    return { ...s, inv: s.inv.map((e) => { if (ek(e) !== key) return e; const n = e.eq + d; return n < 0 || n > e.count || (d > 0 && tot >= s.maxPets) ? e : { ...e, eq: n }; }) };
  });
  const bestPets = () => upd((s) => {
    let left = s.maxPets; const eq = {};
    s.inv.map((e, i) => [i, petBoost(s, e)]).sort((a, b) => b[1] - a[1]).forEach(([i]) => { const n = Math.min(s.inv[i].count, left); eq[i] = n; left -= n; });
    return { ...s, inv: s.inv.map((e, i) => ({ ...e, eq: eq[i] || 0 })) };
  });
  const clearPets = () => upd((s) => ({ ...s, inv: s.inv.map((e) => ({ ...e, eq: 0 })) }));
  const hatchEgg = (g, n = 1) => {
    const cost = gachaCost(g, n);
    if (!run || !g.pets.length || bal(sim, g.pay) < cost) return;
    const { items, track } = gachaRun(g, n); // random picks happen outside the state updater so it stays pure
    if (!items.length) return;
    upd((s) => {
      if (bal(s, g.pay) < cost) return s;
      let x = bump(spend(s, g.pay, cost), 'hatches', items.length);
      x = { ...x, petGroups: x.petGroups.map((q) => (q.id === g.id ? { ...q, track } : q)) };
      for (const r of items) x = { ...x, inv: addPet(x, r.pet) };
      return x;
    });
    const k = uid();
    const rares = items.filter((r) => r.rare).length;
    if (rares) celebrate(rares > 1 || items.length > 1);
    if (items.length === 1) {
      setMulti(null); setHatch({ k, pet: items[0].pet, rate: items[0].rate, rare: items[0].rare });
      setTimeout(() => setHatch((h) => (h && h.k === k ? null : h)), 1500);
    } else {
      setHatch(null); setMulti({ k, name: g.name, items });
      setTimeout(() => setMulti((m) => (m && m.k === k ? null : m)), 5000);
    }
  };
  // Merge `n` pets of one stack into one pet of the next size. The dice roll happens outside the updater so it stays pure.
  const craftPets = (e, n) => {
    const d = sim.craft.tiers[e.tier || 0];
    if (!run || !d) return;
    const r = recipeOf(d), key = ek(e), to = (e.tier || 0) + 1, base = statOf(sim, e);
    if (n < r.min || n > e.count) return;
    const ok = Math.random() * 100 < craftChance(r, n), pet = { id: e.pid, name: base.name, icon: base.icon, boost: base.boost };
    upd((s) => {
      const cur = s.inv.find((x) => ek(x) === key);
      if (!cur || cur.count < n) return s;
      const inv = s.inv.map((i) => (ek(i) === key ? { ...i, count: i.count - n, eq: Math.min(i.eq, i.count - n) } : i)).filter((i) => i.count > 0);
      const x = bump({ ...s, inv }, 'crafts');
      return ok ? { ...bump(x, 'crafted'), inv: addPet(x, pet, to) } : x;
    });
    if (ok) celebrate(false);
    const k = uid();
    setCraftRes({ k, ok, n, from: petName(sim, e), to: `${d.name} ${base.name}` });
    setTimeout(() => setCraftRes((c) => (c && c.k === k ? null : c)), 4000);
  };
  const setGroup = (gid, patch) => patchIn('groups', gid, patch);
  const setMult = (g, mid, patch) => setGroup(g.id, { items: g.items.map((m) => (m.id === mid ? { ...m, ...patch } : m)) });
  const buyMult = (g, m) => upd((s) => {
    if (bal(s, g.pay) < m.cost) return s;
    const n = bump(spend(s, g.pay, m.cost), 'multBuys');
    return { ...n, groups: n.groups.map((x) => (x.id === g.id ? { ...x, items: x.items.map((i) => (i.id === m.id ? { ...i, bought: true } : i)) } : x)) };
  });

  const shopSorted = shopOrder(sim), bestBuyId = (shopSorted.find((i) => i.owned < 1 && sim.cur >= shopCost(i)) || {}).id;
  const shopUI = (
    <>
      <div className="ttl"><TitleEdit icon={<span>{TITLE_ICON.shop}</span>} value={sim.titles.shop} def="Shop" onChange={(v) => setTitle('shop', v)} /><Btn sm tone="gold" onClick={() => addTo('shop', (a) => ({ id: uid(), name: 'New Item', icon: '⭐', val: 1, cost: 10, owned: 0 }))}>＋ Item</Btn></div>
      <div className="hint">One-time purchases. Buy an item to unlock it, then equip it: only the equipped item boosts the base addition. The shop sorts itself: equipped item on top, then the best item you can afford, then the rest by price, and purchased items at the bottom. Edit items while stopped.</div>
      <label className="chk" title="After every purchase, equip the owned item with the biggest boost"><input type="checkbox" checked={sim.autoEquip} onChange={(e) => setAutoEquip(e.target.checked)} /> Auto-equip best purchase</label>
      <Paged id={`${sim.id}:shop`} items={shopSorted} size={10}>{(sl) => (<div className="list rows"><AnimatePresence initial={false}>
        {sl.map((it) => (
          <ShopCard key={it.id} it={it} eq={sim.equipped === it.id} best={it.id === bestBuyId} run={run} curIcon={sim.curIcon} can={sim.cur >= shopCost(it)}
            onBuy={() => buyShop(it)} onEquip={() => equipShop(it)} onPatch={(p) => patchIn('shop', it.id, p)} onDel={() => delShop(it.id)} />
        ))}
      </AnimatePresence></div>)}</Paged>
    </>
  );
  const powUI = (
    <>
      <div className="ttl"><TitleEdit icon={sim.gemIcon ? <Ico v={sim.gemIcon} size={20} /> : null} value={sim.titles.power} def="Powerups" onChange={(v) => setTitle('power', v)} /><Btn sm tone="gold" onClick={() => addTo('powers', (a) => ({ id: uid(), name: 'New Power', icon: '✨', mult: 2, cost: 5, pay: 'gems', bought: false }))}>＋ Powerup</Btn></div>
      <div className="hint">Each powerup can be paid with {sim.curName} or {sim.gemName}.</div>
      <Paged id={`${sim.id}:powers`} items={sim.powers} size={10}>{(sl) => (<div className="list rows"><AnimatePresence initial={false}>
        {sl.map((p) => (
          <PowerCard key={p.id} p={p} s={sim} run={run} onBuy={() => buyPower(p)} onPatch={(x) => patchIn('powers', p.id, x)} onDel={() => list('powers', (a) => a.filter((q) => q.id !== p.id))} />
        ))}
      </AnimatePresence></div>)}</Paged>
    </>
  );
  const multUI = (
    <>
      <div className="ttl"><TitleEdit icon={<span>{TITLE_ICON.mult}</span>} value={sim.titles.mult} def="Multipliers" onChange={(v) => setTitle('mult', v)} /><Btn sm tone="gold" onClick={() => addTo('groups', (a) => ({ id: uid(), name: `Group ${a.length + 1}`, color: '#ffd93b', pay: 'cur', items: [] }))}>＋ Group</Btn></div>
      <Paged id={`${sim.id}:groups`} items={sim.groups} size={1} fixed label={(g) => g.name}>{(gsl) => (<AnimatePresence initial={false}>
        {gsl.map((g) => (
          <motion.div layout {...pop} className="grp" key={g.id} style={{ borderColor: g.color }}>
            <div className="ghead">
              <input type="color" value={g.color} onChange={(e) => setGroup(g.id, { color: e.target.value })} />
              <input type="text" value={g.name} onChange={(e) => setGroup(g.id, { name: e.target.value })} />
              <PaySel v={g.pay} s={sim} disabled={run} onChange={(pay) => setGroup(g.id, { pay })} />
              <motion.b key={groupMult(g)} initial={{ scale: 1.5 }} animate={{ scale: 1 }} style={{ color: g.color }}>x{fmt(groupMult(g))}</motion.b>
              <Btn sm tone="red" disabled={run} onClick={() => list('groups', (a) => a.filter((x) => x.id !== g.id))}>🗑</Btn>
            </div>
            <Paged id={`${sim.id}:mi:${g.id}`} items={g.items} size={5}>{(sl) => (<AnimatePresence initial={false}>
              {sl.map((m) => (
                <motion.div layout initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className={'mrow' + (m.bought ? ' done' : '')} key={m.id}>
                  <div className="mline">
                    <input type="text" value={m.name} disabled={m.bought} onChange={(e) => setMult(g, m.id, { name: e.target.value })} />
                    <Btn sm tone="red" disabled={run} onClick={() => setGroup(g.id, { items: g.items.filter((x) => x.id !== m.id) })}>✕</Btn>
                  </div>
                  <div className="mgrid">
                    <div className="mf"><span className="mfl">Cost</span><NumIn value={m.cost} title="Cost" disabled={m.bought} onChange={(cost) => setMult(g, m.id, { cost })} /></div>
                    <div className="mf"><span className="mfl">Adds +</span><NumIn value={m.val} title="Adds to group multiplier" disabled={m.bought} onChange={(val) => setMult(g, m.id, { val })} /></div>
                    <Btn sm disabled={!run || m.bought || bal(sim, g.pay) < m.cost} onClick={() => buyMult(g, m)}>{m.bought ? '✔' : <><Ico v={payIcon(sim, g.pay)} size={14} /> Buy</>}</Btn>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>)}</Paged>
            <Btn sm tone="blue" onClick={() => { jumpLast(`${sim.id}:mi:${g.id}`); setGroup(g.id, { items: [...g.items, { id: uid(), name: 'Multiplier', cost: 100, val: 1, bought: false }] }); }}>＋ Multiplier</Btn>
          </motion.div>
        ))}
      </AnimatePresence>)}</Paged>
      <div className="hint">Each multiplier: name, then cost and how much it adds to the group. Groups multiply each other. One group is shown at a time: use ‹ › to switch.</div>
    </>
  );

  const weatherUI = (
    <>
      <div className="ttl"><TitleEdit icon={<span>{TITLE_ICON.weather}</span>} value={sim.titles.weather} def="Weather Effects" onChange={(v) => setTitle('weather', v)} /><Btn sm tone="gold" onClick={() => addTo('weather', (a) => ({ id: uid(), name: 'New Weather', icon: '🌈', fx: 'none', mult: 2, duration: 60 }))}>＋ Weather</Btn></div>
      <div className="hint">Admin effects: turn one on any time (one at a time). Its duration counts down while the simulator runs; 0 means until turned off. Edit while stopped and off.</div>
      <Paged id={`${sim.id}:weather`} items={sim.weather} size={10}>{(sl) => (<div className="list rows"><AnimatePresence initial={false}>
        {sl.map((w) => (
          <WeatherCard key={w.id} w={w} run={run} active={sim.activeWeather === w.id} left={sim.weatherLeft}
            onToggle={() => set(sim.activeWeather === w.id ? { activeWeather: null, weatherLeft: 0 } : { activeWeather: w.id, weatherLeft: w.duration })}
            onPatch={(x) => patchIn('weather', w.id, x)} onDel={() => list('weather', (a) => a.filter((q) => q.id !== w.id))} />
        ))}
      </AnimatePresence></div>)}</Paged>
    </>
  );
  const petsUI = (
    <>
      <div className="ttl"><TitleEdit icon={<span>{TITLE_ICON.pets}</span>} value={sim.titles.pets} def="Pets" onChange={(v) => setTitle('pets', v)} /><Btn sm tone="gold" onClick={() => addTo('petGroups', (a) => ({ id: uid(), name: 'New Egg', icon: '🥚', color: '#ffd93b', cost: 100, pay: 'cur', pets: [] }))}>＋ Pet Group</Btn></div>
      <div className="row"><label>Max equipped</label><NumIn style={{ width: 70 }} min={1} disabled={run} value={sim.maxPets} onChange={setMax} /></div>
      <Btn tone="blue" onClick={() => setInvOpen(true)}>🎒 Inventory & Equipped ({totalEq(sim.inv)}/{sim.maxPets})</Btn>
      <Btn tone="gold" onClick={() => setCraftOpen(true)}>🔨 Crafting</Btn>
      <div className="hint">Hatch eggs for random pets (×1, ×5, ×10). Chances in a group must total 100%. Missing a rare builds pity on a sigmoid curve until one drops. Equipped pets add their boost to every addition.</div>
      <Paged id={`${sim.id}:petGroups`} items={sim.petGroups} size={1} fixed label={(g) => g.name}>{(sl) => (<AnimatePresence initial={false}>
        {sl.map((g) => (
          <PetGroupCard key={g.id} g={g} s={sim} run={run} onPatch={(x) => patchIn('petGroups', g.id, x)} onDel={() => list('petGroups', (a) => a.filter((q) => q.id !== g.id))} onHatch={(n) => hatchEgg(g, n)} />
        ))}
      </AnimatePresence>)}</Paged>
    </>
  );
  const setRb = (patch) => set({ rb: { ...sim.rb, ...patch } });
  const rbNow = rbCost(sim);
  const rbUI = (
    <>
      <div className="ttl"><span>🔄 Rebirth</span><Btn sm tone="red" onClick={() => setRbOpen(false)}>✕</Btn></div>
      <div className="card">
        <div className="g" style={{ fontSize: 22 }}>Rebirths: {sim.rb.count}</div>
        <div className="sub">Bonus x{fmt(rbMult(sim))} → x{fmt(1 + (sim.rb.count + 1) * sim.rb.bonus)} next</div>
        <div className="bar"><motion.div className="fill" animate={{ width: `${Math.min(100, (sim.cur / rbNow) * 100)}%` }} /></div>
        <div className="sub"><Ico v={sim.curIcon} size={14} /> {fmt(sim.cur)} / {fmt(rbNow)}</div>
        <Btn tone="gold" disabled={!run || sim.cur < rbNow} onClick={rebirth}>🔄 Rebirth{sim.rb.gems > 0 ? ` (+${fmt(sim.rb.gems)} ${sim.gemName})` : ''}</Btn>
      </div>
      <div className="hint">Rebirth resets {sim.curName}{sim.rb.resetShop ? ', shop items' : ''}{sim.rb.resetMult ? ', multiplier purchases' : ''}. Pets, powerups, weather and quests are kept. Configure while stopped.</div>
      <div className="card edit">
        <label>Base cost <NumIn value={sim.rb.baseCost} min={1} disabled={run} onChange={(baseCost) => setRb({ baseCost })} /></label>
        <label>Cost growth x per rebirth <NumIn value={sim.rb.scale} min={1} disabled={run} onChange={(scale) => setRb({ scale })} /></label>
        <label>Bonus + per rebirth <NumIn value={sim.rb.bonus} disabled={run} onChange={(bonus) => setRb({ bonus })} /></label>
        <label>{sim.gemName} reward <NumIn value={sim.rb.gems} disabled={run} onChange={(gems) => setRb({ gems })} /></label>
        <label className="chk"><input type="checkbox" disabled={run} checked={sim.rb.resetShop} onChange={(e) => setRb({ resetShop: e.target.checked })} /> Reset shop items</label>
        <label className="chk"><input type="checkbox" disabled={run} checked={sim.rb.resetMult} onChange={(e) => setRb({ resetMult: e.target.checked })} /> Reset multiplier purchases</label>
      </div>
    </>
  );
  const claimable = sim.quests.filter((q) => !q.claimed && qProg(sim, q) >= q.target).length;
  const questUI = (
    <>
      <div className="ttl"><span>📜 Quests {claimable > 0 && <motion.b key={claimable} initial={{ scale: 1.6 }} animate={{ scale: 1 }} style={{ color: '#ffd93b' }}>({claimable})</motion.b>}</span>
        <span><Btn sm tone="gold" onClick={() => addTo('quests', (a) => ({ id: uid(), name: 'New Quest', metric: 'earned', target: 1000, reward: 100, pay: 'cur', repeat: false, base: metricVal(sim, 'earned'), claimed: false }))}>＋ Quest</Btn><Btn sm tone="red" onClick={() => setQOpen(false)}>✕</Btn></span></div>
      <div className="hint">Progress counts while the simulator runs. Claim rewards any time. Edit while stopped.</div>
      <Paged id={`${sim.id}:quests`} items={sim.quests} size={8}>{(sl) => (<div className="qlist"><AnimatePresence initial={false}>
        {sl.map((q) => (
          <QuestCard key={q.id} q={q} s={sim} run={run} onClaim={() => claimQuest(q.id)} onPatch={(x) => patchIn('quests', q.id, x)} onDel={() => list('quests', (a) => a.filter((z) => z.id !== q.id))} />
        ))}
      </AnimatePresence></div>)}</Paged>
    </>
  );
  const aw = sim.weather.find((w) => w.id === sim.activeWeather);
  const eqItem = sim.shop.find((i) => i.id === sim.equipped);
  return (
    <>
    {stage !== 'intro' && (
    <MotionConfig reducedMotion={anim ? 'never' : 'always'}>
    <div className={'app' + (anim ? '' : ' noanim')}>
      {aw && <WeatherFx fx={aw.fx} anim={anim} />}
      {anim && <div className="bgs">
        {[...Array(9)].map((_, i) => (
          <motion.span key={i} style={{ left: `${(i * 11 + 4) % 96}%`, top: `${(i * 23 + 8) % 90}%` }}
            animate={{ y: [0, -24, 0], rotate: [0, 180, 360], opacity: [0.3, 0.8, 0.3] }}
            transition={{ duration: 6 + (i % 4) * 2, repeat: Infinity, delay: i * 0.4 }}>{i % 2 ? '✦' : '★'}</motion.span>
        ))}
      </div>}

      <div className="stickyhead" ref={headRef}>
      <div className="top">
        <div className="logo"><motion.span whileHover={{ scale: 1.06 }} style={{ display: 'flex' }}><Ico v={logo} size={44} wide /></motion.span>StatSim</div>
        <CurrencyPill s={sim} kind="cur" upd={upd} />
        <CurrencyPill s={sim} kind="gems" upd={upd} />
        <Btn sm tone={m.playing ? 'gold' : 'blue'} title="Music" onClick={() => setMusicOpen(true)}>{m.playing ? '🎵' : '🎶'}</Btn>
        {m.track && <Btn sm tone="blue" title={m.playing ? 'Pause music' : 'Play music'} onClick={m.toggle}>{m.playing ? '⏸' : '▶'}</Btn>}
        <Btn sm tone="blue" onClick={() => setStatsOpen(true)}>📊</Btn>
        <Btn sm tone="blue" onClick={() => setSettings(true)}>⚙️</Btn>
      </div>

      <div className="tabs">
        {/* Ids (not sim objects) are the reorder values: sims get new objects on every tick, ids stay put while dragging. */}
        <Reorder.Group as="div" axis="x" className="tabgroup" values={sims.map((s) => s.id)} onReorder={(ids) => setSims((p) => ids.map((id) => p.find((x) => x.id === id)).filter(Boolean))}>
          {sims.map((s) => (
            <Reorder.Item as="div" key={s.id} value={s.id} className={'tab' + (s.id === sim.id ? ' on' : '')} title="Drag to reorder · double-click to rename"
              dragListener={editId !== s.id} whileDrag={{ scale: 1.06, boxShadow: '0 6px 14px #0006' }}
              onClick={() => setActiveId(s.id)} onDoubleClick={() => { setActiveId(s.id); setEditId(s.id); }}>
              {s.running ? '🟢' : '⚪'}
              <TabName value={s.name} editing={editId === s.id} onChange={(name) => upd((x) => ({ ...x, name }), s.id)} onDone={() => setEditId((e) => (e === s.id ? null : e))} />
              <button className="x" disabled={s.running || sims.length < 2} onPointerDown={(e) => e.stopPropagation()} onClick={(e) => { e.stopPropagation(); closeTab(s.id); }}>✕</button>
            </Reorder.Item>
          ))}
        </Reorder.Group>
        <Btn sm tone="gold" onClick={addTab} title="New simulator">＋</Btn>
        <Btn sm tone="blue" onClick={() => setPresetOpen(true)} title="Add a ready-made simulator">🎁 Presets</Btn>
      </div>
      </div>

      <div className="main">
        <div className="side">
        <motion.div className="panel" initial={{ y: 24, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
          <div className="pops"><AnimatePresence>
            {pops.map((p) => (
              <motion.div key={p.id} className="pop" style={{ marginLeft: p.x }} initial={{ y: 0, opacity: 1, scale: 0.6 }} animate={{ y: -50, opacity: 0, scale: 1.2 }} exit={{ opacity: 0 }} transition={{ duration: 0.9 }}>{p.t}</motion.div>
            ))}
          </AnimatePresence></div>
          <Btn tone={run ? 'red' : ''} className="runbtn" onClick={() => upd((s) => (s.running ? { ...s, running: false, auto: false } : bump({ ...s, running: true, auto: true, runtime: 0 }, 'runs')))}>{run ? '⏹ STOP SIMULATOR' : '▶ RUN SIMULATOR'}</Btn>
          <Btn tone="gold" className={'rbbtn' + (run && sim.cur >= rbCost(sim) ? ' ready' : '')} onClick={() => setRbOpen(true)}>
            <span className="rbico">🔄</span>
            <span className="rbtxt">REBIRTH<small>{sim.rb.count > 0 ? `x${sim.rb.count} so far` : 'Reset for a permanent bonus'}</small></span>
          </Btn>
          <div className="row2 iconrow">
            <Btn tone="blue" title="Quests" aria-label="Quests" onClick={() => setQOpen(true)}><span className="bigico">📜</span>
              <AnimatePresence>
                {claimable > 0 && <motion.span key={claimable} className="nbadge" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} transition={{ type: 'spring', stiffness: 500, damping: 14 }}>{claimable}</motion.span>}
              </AnimatePresence>
            </Btn>
            <Btn tone="blue" title={`Pet Inventory (${totalEq(sim.inv)}/${sim.maxPets} equipped)`} aria-label="Pet Inventory" onClick={() => setInvOpen(true)}><span className="bigico">🎒</span></Btn>
            <Btn tone="blue" title="Crafting" aria-label="Crafting" onClick={() => setCraftOpen(true)}><span className="bigico">🔨</span></Btn>
          </div>
          <div className="clock">⏱ {clock(sim.totalRuntime)}</div>
          <div className="sub small">Session runtime · {clock(sim.runtime)}</div>
          <div className="big"><Ico v={sim.curIcon} size={36} />
            <motion.span key={Math.floor(sim.cur)} initial={{ scale: 1.15 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 500, damping: 15 }}>{fmt(sim.cur)}</motion.span>
          </div>
          <div className="sub">{sim.curName} · +{fmt(gain(sim))} per addition · x{fmt(totalMult(sim) * powMult(sim) * wMult(sim) * petMult(sim) * rbMult(sim))}</div>
          <div className="sub">Equipped: {eqItem && eqItem.owned > 0 ? `${eqItem.name} (+${fmt(eqItem.val)})` : 'none'}</div>
          <div className="sub">Weather: {aw ? `${aw.name} (x${fmt(aw.mult)})${aw.duration > 0 ? ' · ' + clock(sim.weatherLeft) : ''}` : 'clear'}</div>
          <div className="sub">Pets: x{fmt(petMult(sim))} ({totalEq(sim.inv)}/{sim.maxPets})</div>
          <div className="slots">{sim.inv.flatMap((e) => Array.from({ length: e.eq }, (_, i) => (
            <motion.span key={ek(e) + i} title={petName(sim, e)} initial={{ scale: 0 }} animate={{ scale: 1 }}><Ico v={statOf(sim, e).icon} size={petSize(e, 22)} /></motion.span>
          )))}</div>
          {run && <motion.div className="badge" animate={{ opacity: [1, 0.4, 1] }} transition={{ repeat: Infinity, duration: 1.2 }}>● RUNNING</motion.div>}
          <Btn tone="blue" disabled={!run} onClick={() => set({ auto: !sim.auto })}>{sim.auto ? '⏸ Auto: ON' : '▶ Auto: OFF'}</Btn>
          <Btn tone="gold" disabled={!run} onClick={() => upd((s) => earn(s, gain(s), 'manual'))}>👆 Add Now</Btn>
          <div className="row"><label>⏱ Every (sec)</label><NumIn style={{ width: 80 }} min={0.1} value={sim.interval} onChange={(interval) => set({ interval })} /></div>
          <Btn tone="red" disabled={run || sim.cur === 0} onClick={() => set({ cur: 0 })}>🗑 Empty {sim.curName}</Btn>
          <div className="row2">
            <Btn tone="gold" onClick={saveState}>💾 Save State</Btn>
            <Btn tone="blue" onClick={() => setIoOpen(true)}>📂 Load State</Btn>
          </div>
        </motion.div>
        </div>

        {tablet ? (
          <div className="panel">
            <div className="sec">
              {['shop', 'power', 'mult', 'weather', 'pets'].map((k) => (
                <Btn key={k} tone={view === k ? 'gold' : 'blue'} onClick={() => setView(k)}>{TITLE_ICON[k] ? `${TITLE_ICON[k]} ` : ''}{sim.titles[k]}</Btn>
              ))}
            </div>
            <AnimatePresence mode="wait">
              <motion.div key={view} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.15 }}>
                {{ shop: shopUI, power: powUI, mult: multUI, weather: weatherUI, pets: petsUI }[view]}
              </motion.div>
            </AnimatePresence>
          </div>
        ) : (
          <div className="groups">{[shopUI, powUI, multUI, weatherUI, petsUI].map((u, i) => (
            <motion.div key={i} className="panel" initial={{ y: 24, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.08 * (i + 1) }}>{u}</motion.div>
          ))}</div>
        )}
      </div>

      <DataModal open={ioOpen} onClose={() => setIoOpen(false)} sim={sim} sims={sims} onExportOne={saveState} onExportAll={exportAll} onReplaceOne={importReplaceOne} onAdd={importAdd} onReplaceAll={importAll} />
      <PresetsModal open={presetOpen} onClose={() => setPresetOpen(false)} sims={sims} onAdd={importAdd} />
      <MusicModal open={musicOpen} onClose={() => setMusicOpen(false)} m={m} />
      <CraftModal open={craftOpen} onClose={() => setCraftOpen(false)} s={sim} run={run} res={craftRes} onCraft={craftPets} onTiers={(tiers) => set({ craft: { ...sim.craft, tiers } })} />
      <Modal open={rbOpen} onClose={() => setRbOpen(false)}>{rbUI}</Modal>
      <Modal open={qOpen} onClose={() => setQOpen(false)} wide>{questUI}</Modal>
      <AnimatePresence>
        {statsOpen && (
          <motion.div className="modal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setStatsOpen(false)}>
            <motion.div className="panel wide" initial={{ scale: 0.85, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.85, opacity: 0 }} onClick={(ev) => ev.stopPropagation()}>
              <div className="ttl"><span>📊 Statistics</span><Btn sm tone="red" onClick={() => setStatsOpen(false)}>✕</Btn></div>
              <Paged id="stats" items={STAT_ROWS} size={10}>{(sl) => (<table className="stbl">
                <thead><tr><th></th><th>{sim.name}</th><th>All sims ({sims.length})</th></tr></thead>
                <tbody>
                  {sl.map(([label, fn, how, f]) => (
                    <tr key={label}>
                      <td>{label}</td>
                      <td>{(f || fmt)(fn(sim))}</td>
                      <td>{(f || fmt)(how === 'max' ? Math.max(...sims.map(fn)) : sims.reduce((a, x) => a + fn(x), 0))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>)}</Paged>
              <StatsChart sim={sim} sims={sims} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {confetti && <Confetti k={confetti.k} big={confetti.big} />}
      <AnimatePresence>
        {hatch && (
          <motion.div key={hatch.k} className="hatch" initial={{ scale: 0.2, rotate: -40, opacity: 0 }} animate={{ scale: 1, rotate: 0, opacity: 1 }} exit={{ scale: 0.5, opacity: 0, y: -60 }} transition={{ type: 'spring', stiffness: 260, damping: 14 }}>
            <Ico v={hatch.pet.icon} size={90} />
            <div>{hatch.pet.name}</div>
            <div className="sub">{hatch.rare ? '★ RARE · ' : ''}+{fmt(hatch.pet.boost)} boost · {pct(hatch.rate / 100)}% chance</div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {multi && (
          <motion.div key={multi.k} className="multihatch" initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.7, opacity: 0 }} onClick={() => setMulti(null)}>
            <div className="ttl"><span>{multi.name} ×{multi.items.length}</span><span>★ {multi.items.filter((r) => r.rare).length}</span></div>
            <div className="rgrid">
              {multi.items.map((r, i) => (
                <motion.div key={i} className={'rcell' + (r.rare ? ' rare' : '')} title={`${r.pet.name} · ${pct(r.rate / 100)}%`} initial={{ scale: 0, rotate: -25 }} animate={{ scale: 1, rotate: 0 }} transition={{ delay: i * 0.06, type: 'spring', stiffness: 300, damping: 14 }}>
                  <Ico v={r.pet.icon} size={34} /><div className="rn">{r.pet.name}</div>
                </motion.div>
              ))}
            </div>
            <div className="sub">Tap to close</div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {invOpen && (
          <motion.div className="modal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setInvOpen(false)}>
            <motion.div className="panel wide" initial={{ scale: 0.85, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.85, opacity: 0 }} onClick={(ev) => ev.stopPropagation()}>
              <div className="ttl"><span>🎒 Pets</span><Btn sm tone="red" onClick={() => setInvOpen(false)}>✕</Btn></div>
              <div className="hint">Equipped {totalEq(sim.inv)}/{sim.maxPets} · click a pet to unequip it</div>
              <Paged id={`${sim.id}:equipped`} size={10} items={[
                ...[...sim.inv].sort((a, b) => petBoost(sim, b) - petBoost(sim, a)).flatMap((e) => Array.from({ length: e.eq }, (_, i) => ({ k: ek(e) + i, e }))),
                ...Array.from({ length: Math.min(12, Math.max(0, sim.maxPets - totalEq(sim.inv))) }, (_, i) => ({ k: 's' + i, slot: true })),
              ]}>{(sl) => (
                <div className="list">
                  {sl.map((x) => x.slot ? <div key={x.k} className="slot">empty</div> : (
                    <motion.div key={x.k} className="card eq" {...pop} whileHover={{ y: -3 }} style={{ cursor: 'pointer' }} onClick={() => eqPet(ek(x.e), -1)}>
                      <Ico v={statOf(sim, x.e).icon} size={petSize(x.e, 34)} /><div>{petName(sim, x.e)}</div><div className="sub">+{fmt(petBoost(sim, x.e))}</div>
                    </motion.div>
                  ))}
                </div>
              )}</Paged>
              <div className="row"><Btn sm tone="gold" onClick={bestPets}>★ Equip Best</Btn><Btn sm tone="blue" onClick={clearPets}>Unequip All</Btn></div>
              <div className="hint">Inventory</div>
              {sim.inv.length === 0 && <div className="hint">No pets yet. Hatch an egg!</div>}
              <Paged id={`${sim.id}:inventory`} items={[...sim.inv].sort((a, b) => (b.tier || 0) - (a.tier || 0) || petBoost(sim, b) - petBoost(sim, a))} size={10}>{(sl) => (<div className="list">
                {sl.map((e) => {
                  const st = statOf(sim, e);
                  return (
                    <motion.div layout key={ek(e)} className="card" {...pop}>
                      <Ico v={st.icon} size={petSize(e, 34)} /><div>{petName(sim, e)} ×{e.count}</div><div className="sub">+{fmt(petBoost(sim, e))} · equipped {e.eq}</div>
                      <Btn sm disabled={e.eq >= e.count || totalEq(sim.inv) >= sim.maxPets} onClick={() => eqPet(ek(e), 1)}>Equip</Btn>
                      <Btn sm tone="blue" disabled={e.eq < 1} onClick={() => eqPet(ek(e), -1)}>Unequip</Btn>
                    </motion.div>
                  );
                })}
              </div>)}</Paged>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {settings && (
          <motion.div className="modal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSettings(false)}>
            <motion.div className="panel" initial={{ scale: 0.8, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.8, opacity: 0 }} onClick={(e) => e.stopPropagation()}>
              <div className="ttl">⚙️ Settings</div>
              <div className="hint">Site logo</div><IconField value={logo} onChange={setLogo} />
              <div className="hint">Tip: click a currency in the top bar to rename it, change its icon or add value. Click a section title (Shop, Pets, …) to rename it.</div>
              <Btn tone={anim ? '' : 'red'} onClick={() => setAnim(!anim)}>🎞 Animations: {anim ? 'ON' : 'OFF'}</Btn>
              <Btn tone={introOn ? '' : 'red'} onClick={toggleIntro}>🎬 Intro on load: {introOn ? 'ON' : 'OFF'}</Btn>
              <Btn tone="red" onClick={clearAll}>🧨 Empty localStorage</Btn>
              <Btn tone="gold" onClick={() => setSettings(false)}>Close</Btn>
              <Plug />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
    </MotionConfig>
    )}
    {stage !== 'done' && <Intro logo={logo} onReveal={() => setStage('reveal')} onDone={() => setStage('done')} />}
    </>
  );
}
