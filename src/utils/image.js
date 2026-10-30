export const isImg = (v) => /^(data:image|https?:)/.test(v || '');

export const readImg = (file, cb) => {
  const r = new FileReader();
  r.onload = () => {
    const im = new Image();
    im.onload = () => {
      const k = Math.min(1, 96 / Math.max(im.width, im.height)), c = document.createElement('canvas');
      c.width = im.width * k; c.height = im.height * k;
      c.getContext('2d').drawImage(im, 0, 0, c.width, c.height);
      cb(c.toDataURL('image/png'));
    };
    im.src = r.result;
  };
  r.readAsDataURL(file);
};
