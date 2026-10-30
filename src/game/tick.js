import { gain, earn } from './economy.js';

export const tick = (s, dt) => {
  if (!s.running) return s.tSec || s.tAuto ? { ...s, tSec: 0, tAuto: 0 } : s;
  let x = { ...s, tSec: (s.tSec || 0) + dt, tAuto: (s.tAuto || 0) + dt };
  while (x.tSec >= 1000) {
    x.tSec -= 1000;
    x = { ...x, runtime: x.runtime + 1, totalRuntime: x.totalRuntime + 1 };
    if (x.activeWeather) {
      const w = x.weather.find((q) => q.id === x.activeWeather);
      if (!w) x = { ...x, activeWeather: null, weatherLeft: 0 };
      else if (w.duration > 0) { const left = x.weatherLeft - 1; x = left <= 0 ? { ...x, activeWeather: null, weatherLeft: 0 } : { ...x, weatherLeft: left }; }
    }
  }
  if (!x.auto) return { ...x, tAuto: 0 };
  const iv = Math.max(0.1, x.interval) * 1000;
  if (x.tAuto < iv) return x;
  return { ...earn(x, gain(x), 'auto'), tAuto: Math.min(x.tAuto - iv, iv) };
};
