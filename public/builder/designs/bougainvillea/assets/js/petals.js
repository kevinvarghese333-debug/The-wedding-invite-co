/* Petal + gold-flake particles on one canvas over the stage. */
window.Petals = (() => {
  const c = document.getElementById('petals');
  const x = c.getContext('2d');
  const COLORS = ['#c8336f', '#de5f92', '#f2b8cd', '#fff6ef', '#e6c47e', '#b8924a', '#9c1f3d'];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const phone = matchMedia('(hover: none)').matches;   // phones: fewer petals, lighter canvas
  let W = 0, H = 0, dpr = 1, P = [], raf = 0, rain = 0, rainAcc = 0;

  function size() {
    const r = c.getBoundingClientRect();
    dpr = Math.min(phone ? 1.5 : 2, devicePixelRatio || 1);
    W = r.width; H = r.height;
    c.width = Math.round(W * dpr); c.height = Math.round(H * dpr);
    x.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  addEventListener('resize', size);
  size();

  function make(px, py, vx, vy) {
    const col = COLORS[(Math.random() * COLORS.length) | 0];
    return {
      x: px, y: py, vx, vy, col,
      r: 2.6 + Math.random() * 4.2,
      a: Math.random() * 6.28, va: (Math.random() - 0.5) * 0.12,
      f: Math.random() * 6.28, vf: 0.04 + Math.random() * 0.1,
      sway: 0.3 + Math.random() * 0.7,
      life: 0, max: 380 + Math.random() * 320, o: 1
    };
  }

  function loop() {
    x.clearRect(0, 0, W, H);
    if (rain) {
      rainAcc += rain;
      while (rainAcc >= 1) { rainAcc--; P.push(make(Math.random() * W, -12, (Math.random() - 0.5) * 0.4, 0.4 + Math.random() * 0.8)); }
    }
    for (let i = P.length - 1; i >= 0; i--) {
      const p = P[i];
      p.vy += 0.045; p.vx *= 0.982; p.vy *= 0.982;
      if (p.vy > 1.5) p.vy = 1.5;
      p.f += p.vf; p.a += p.va; p.life++;
      p.x += p.vx + Math.sin(p.f) * p.sway; p.y += p.vy;
      if (p.life > p.max - 60) p.o = Math.max(0, (p.max - p.life) / 60);
      if (p.y > H + 20 || p.life > p.max) { P.splice(i, 1); continue; }
      x.save();
      x.globalAlpha = p.o * 0.95;
      x.translate(p.x, p.y); x.rotate(p.a);
      x.scale(Math.max(0.15, Math.abs(Math.cos(p.f))), 1);
      x.fillStyle = p.col;
      x.beginPath(); x.ellipse(0, 0, p.r, p.r * 0.62, 0, 0, 6.283); x.fill();
      x.restore();
    }
    raf = (P.length || rain) ? requestAnimationFrame(loop) : 0;
  }
  const kick = () => { if (!raf) raf = requestAnimationFrame(loop); };

  return {
    size,
    burst(px, py, n = 120, power = 1) {
      if (reduce) n = Math.round(n / 4); else if (phone) n = Math.round(n * .55);
      for (let i = 0; i < n; i++) {
        const ang = Math.random() * Math.PI * 2, sp = (1.5 + Math.random() * 7) * power;
        P.push(make(px, py, Math.cos(ang) * sp, Math.sin(ang) * sp - 2.2 * power));
      }
      kick();
    },
    shower(n = 70) {
      if (reduce) n = Math.round(n / 4); else if (phone) n = Math.round(n * .55);
      for (let i = 0; i < n; i++) {
        const p = make(Math.random() * W, -10 - Math.random() * H * 0.5, (Math.random() - 0.5) * 0.6, 0.5 + Math.random());
        P.push(p);
      }
      kick();
    },
    rain(rate) { rain = reduce ? 0 : rate; kick(); },
    clear() { P = []; rain = 0; }
  };
})();
