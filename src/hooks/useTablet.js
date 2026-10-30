import { useEffect, useState } from 'react';

export const useTablet = () => {
  const [t, setT] = useState(false);
  useEffect(() => {
    const m = window.matchMedia('(max-width:1023px)'), f = () => setT(m.matches);
    f(); m.addEventListener('change', f); return () => m.removeEventListener('change', f);
  }, []);
  return t;
};
