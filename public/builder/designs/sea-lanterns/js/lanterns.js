/* The lantern sky: one canvas, with lanterns in nine colours and small gold sparkles among them. */
window.Lanterns = (() => {
  const cv = document.getElementById('lanterns'), g = cv.getContext('2d');
  /* Each lantern has its own glow colour */
  const kinds = [['red', 255, 90, 50], ['teal', 80, 220, 190], ['orange', 255, 140, 60], ['floral', 255, 170, 60], ['rose', 255, 70, 165],
    ['violet', 150, 90, 255], ['aqua', 70, 225, 225], ['blue', 90, 140, 255], ['gold', 255, 205, 80]];
  const sprites = [], glows = [];
  let W = 0, H = 0, DPR = 1, list = [], sparks = [], star, ready = false, on = false, shown = 0, push = 0, rush = 0, draining = false, away = 0;
  const rnd = (a, b) => a + Math.random() * (b - a);

  const load = () => Promise.all(kinds.map(k => new Promise(res => {
    const i = new Image(); i.onload = () => res(i); i.onerror = () => res(null); i.src = `assets/img/lantern-${k[0]}.webp`;
  })));

  function makeGlow(r, gr, b) {
    const c = document.createElement('canvas'); c.width = c.height = 256; const x = c.getContext('2d');
    const d = x.createRadialGradient(128, 128, 0, 128, 128, 128);
    d.addColorStop(0, `rgba(${r},${gr},${b},.62)`); d.addColorStop(.38, `rgba(${r},${gr},${b},.2)`); d.addColorStop(1, `rgba(${r},${gr},${b},0)`);
    x.fillStyle = d; x.fillRect(0, 0, 256, 256); return c;
  }
  function makeStar() {   // A soft four-pointed sparkle
    const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d');
    x.translate(32, 32); x.shadowColor = 'rgba(255,225,110,.95)'; x.shadowBlur = 12; x.fillStyle = '#FFF2A0';
    x.beginPath(); for (let i = 0; i < 4; i++) { x.rotate(Math.PI / 2); x.moveTo(0, -17); x.quadraticCurveTo(2, -2, 17, 0); x.quadraticCurveTo(2, 2, 0, 17); x.quadraticCurveTo(-2, 2, -17, 0); x.quadraticCurveTo(-2, -2, 0, -17); }
    x.fill(); return c;
  }
  function resize() {
    DPR = Math.min(1.75, devicePixelRatio || 1); W = innerWidth; H = innerHeight;
    cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR); g.setTransform(DPR, 0, 0, DPR, 0, 0);
  }
  function make(i, n) {
    const z = Math.pow(i / n, 1.5) * .92 + .2;        // Most are far away, a few are close
    const big = z > .34, left = Math.random() < .5;    // Big ones keep to the sides, so the bride stays in view
    const edge = W < 700 ? .16 : .3;
    return {
      z, sp: (i * 4) % kinds.length,                  // Neighbours never share a colour
      x: big ? (left ? rnd(-.03, edge) : rnd(1 - edge, 1.03)) : rnd(-.02, 1.02),
      y: H + rnd(20, H * .85),
      v: rnd(16, 26) * (.5 + z * .8),
      ph: rnd(0, 6.28), rate: rnd(.25, .5), amp: rnd(6, 20) * z,
      tilt: rnd(-.09, .09), fl: rnd(0, 6.28),
    };
  }
  function populate() {
    const small = W < 700, n = small ? 24 : 38;
    list = Array.from({ length: n }, (_, i) => make(i, n));
    sparks = Array.from({ length: small ? 16 : 28 }, () => ({ x: Math.random(), y: rnd(0, H), v: rnd(5, 14), s: rnd(7, 17), ph: rnd(0, 6.28), rate: rnd(1.2, 2.6) }));
  }
  function draw(dt, t) {
    g.clearRect(0, 0, W, H);
    if (shown <= .01) return;
    const base = Math.min(H * .2, 190);
    for (const L of list) {
      if (L.gone) continue;
      L.y -= (L.v * (1 + rush * 14 + away * 9) + push * L.z * 2.2) * dt;
      if (L.y < -base * 1.6) { if (draining) { L.gone = true; continue; } L.y = H + rnd(30, H * .4); }
      const rise = Math.max(0, Math.min(1, L.y / H));
      const s = L.z * (.62 + .38 * rise), img = sprites[L.sp];
      const h = base * s, w = h * img.width / img.height;
      const x = L.x * W + Math.sin(t * L.rate + L.ph) * L.amp, y = L.y;
      const flick = .8 + .2 * Math.sin(t * 7 + L.fl) * Math.sin(t * 3.1 + L.fl * 2);
      g.save(); g.translate(x, y); g.rotate(L.tilt + Math.sin(t * L.rate * .8 + L.ph) * .05);
      g.globalCompositeOperation = 'lighter'; g.globalAlpha = shown * .6 * flick;
      g.drawImage(glows[L.sp], -w * 1.25, -h * 1.15, w * 2.5, h * 2.3);
      g.globalCompositeOperation = 'source-over'; g.globalAlpha = shown;
      g.drawImage(img, -w / 2, -h / 2, w, h);
      g.restore();
    }
    g.globalCompositeOperation = 'lighter';
    for (const p of sparks) {
      p.y -= (p.v * (1 + rush * 6)) * dt; if (p.y < -20) { p.y = H + 20; p.x = Math.random(); }
      const a = (.35 + .65 * Math.pow(Math.sin(t * p.rate + p.ph) * .5 + .5, 2)) * shown * (1 - away);
      if (a <= .01) continue;
      g.globalAlpha = a; g.drawImage(star, p.x * W - p.s, p.y - p.s, p.s * 2, p.s * 2);
    }
    g.globalCompositeOperation = 'source-over';
    g.globalAlpha = 1;
  }

  return {
    async prepare() {
      const imgs = await load();
      if (imgs.some(i => !i)) return;
      imgs.forEach((im, i) => { sprites.push(im); glows.push(makeGlow(kinds[i][1], kinds[i][2], kinds[i][3])); });
      star = makeStar(); resize(); populate(); ready = true;
      addEventListener('resize', () => { resize(); });
    },
    release() { on = true; rush = 1; },
    still() {   // Reduced motion: one quiet frame
      if (!ready) return; on = false; shown = 1;
      list.forEach(L => { L.y = Math.random() * H * .8; }); draw(0, 0);
    },
    /* Lanterns leave by floating away, not by fading out */
    drain(v) {
      draining = v;
      if (!v) list.forEach(L => { if (L.gone) { L.gone = false; L.y = H + rnd(20, H * .8); } });
    },
    nudge(v) { push = Math.max(-260, Math.min(420, v)); },
    tick(dt, t) {
      if (!ready || !on) return;
      shown += (1 - shown) * Math.min(1, dt * 3);
      rush *= Math.pow(.5, dt);
      push *= Math.pow(.05, dt);
      away += ((draining ? 1 : 0) - away) * Math.min(1, dt * 1.6);
      if (draining && list.every(L => L.gone)) { if (cv.style.visibility !== 'hidden') { g.clearRect(0, 0, W, H); cv.style.visibility = 'hidden'; } return; }
      if (cv.style.visibility === 'hidden') cv.style.visibility = 'visible';
      draw(dt, t);
    },
  };
})();
