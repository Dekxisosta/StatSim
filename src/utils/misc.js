export const uid = () => Math.random().toString(36).slice(2, 9);

export const num = (v, d) => (typeof v === 'number' && isFinite(v) ? v : d);

export const isObj = (v) => v && typeof v === 'object' && !Array.isArray(v);

export const withIds = (arr) => (Array.isArray(arr) ? arr.filter(isObj).map((x) => ({ ...x, id: x.id || uid() })) : []);

export const shuffle = (a) => { const r = [...a]; for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [r[i], r[j]] = [r[j], r[i]]; } return r; };
