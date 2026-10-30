// Every .json file in this folder is a StatSim save (same format as "Save State") and shows up in the
// app's Presets window automatically. Optional metadata in the file:  "preset": { "title", "emoji", "blurb", "order" }
const files = import.meta.glob('./*.json', { eager: true, import: 'default' });

const list = (v) => (Array.isArray(v) ? v.length : 0);

export const PRESETS = Object.entries(files)
  .filter(([, d]) => d && typeof d === 'object' && d.sim && typeof d.sim === 'object')
  .map(([path, d]) => {
    const p = d.preset || {}, s = d.sim;
    return {
      id: path.replace(/^\.\//, '').replace(/\.json$/, ''),
      title: String(p.title || s.name || path),
      emoji: p.emoji || s.curIcon || '🎁',
      blurb: String(p.blurb || ''),
      order: typeof p.order === 'number' ? p.order : 100,
      simName: s.name,
      data: d,
      counts: { shop: list(s.shop), powers: list(s.powers), groups: list(s.groups), weather: list(s.weather), quests: list(s.quests), eggs: list(s.petGroups) },
    };
  })
  .sort((a, b) => a.order - b.order || a.title.localeCompare(b.title));
