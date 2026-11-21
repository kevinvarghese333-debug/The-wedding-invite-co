/* Sneha & Jerin: the living things in the garden.
   Petals: real painted petals on one fixed canvas, pushed about by scrolling.
   Bird: the hummingbird, built from body and wing layers so it can flutter. */
(() => {
  'use strict';

  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const canvas = document.getElementById('petals');
  const ctx = canvas.getContext('2d');
  const CELL = 96, CELLS = 8;

  const atlas = new Image();
  atlas.src = 'assets/img/petals.webp';

  let W = 0, H = 0, running = false, last = 0;
  let wind = 0;              // sideways push, eases back to nothing
  let lift = 0;              // scroll velocity, moves petals past the viewer
  const petals = [];

  const rand = (a, b) => a + Math.random() * (b - a);

  function resize() {
    const dpr = Math.min(2, devicePixelRatio || 1);
    W = innerWidth; H = innerHeight;
    canvas.width = W * dpr; canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function base(depth) {
    return {
      depth, cell: (Math.random() * CELLS) | 0,
      size: 12 + depth * 18,
      r: rand(0, 6.28), vr: rand(-.025, .025),
      ph: rand(0, 6.28), vph: rand(.02, .05),
      alpha: .55 + depth * .4,
      life: 1, decay: 0
    };
  }

  // A petal drifting down from above the screen
  const ambient = () => Object.assign(base(rand(.1, 1)), {
    x: rand(-40, W), y: rand(-H, -20), vx: rand(.15, .5), vy: rand(.45, 1), loop: true
  });

  function frame(t) {
    if (!running) return;
    const dt = Math.min(3, (t - last) / 16.7 || 1);
    last = t;
    wind *= Math.pow(.965, dt);
    lift *= Math.pow(.9, dt);
    ctx.clearRect(0, 0, W, H);
    if (atlas.complete && atlas.naturalWidth) {
      for (let i = petals.length - 1; i >= 0; i--) {
        const p = petals[i];
        p.ph += p.vph * dt;
        p.r += p.vr * dt;
        if (p.gravity) { p.vy += p.gravity * dt; p.vx *= .985; }
        if (p.decay) p.life -= p.decay * dt;
        p.x += (p.vx + wind * (.4 + p.depth) + Math.sin(p.ph * .6) * .45) * dt;
        p.y += (p.vy - lift * (.3 + p.depth * .7)) * dt;
        if (p.life <= 0) { petals.splice(i, 1); continue; }
        if (p.y > H + 30 || p.y < -H * 1.2 || p.x > W + 60 || p.x < -80) {
          if (p.loop) Object.assign(p, ambient(), { y: lift > 0 ? H + 20 : -24 });
          else { petals.splice(i, 1); continue; }
        }
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.r);
        ctx.scale(Math.cos(p.ph) * .8 + .2, 1);   // tumbling, seen edge-on now and then
        ctx.globalAlpha = p.alpha * Math.min(1, p.life * 2);
        const c = p.cell, s = p.size;
        ctx.drawImage(atlas, (c % 4) * CELL, ((c / 4) | 0) * CELL, CELL, CELL, -s / 2, -s / 2, s, s);
        ctx.restore();
      }
    }
    requestAnimationFrame(frame);
  }

  function run() {
    if (running || reduce) return;
    running = true;
    last = performance.now();
    requestAnimationFrame(frame);
  }

  window.Petals = {
    start() {
      if (reduce) return;
      resize();
      const n = W < 600 ? 13 : 22;
      while (petals.filter(p => p.loop).length < n) petals.push(ambient());
      run();
    },
    // Thrown outward from a point, like breaking the seal or sending a reply
    burst(x, y, n = 36) {
      if (reduce) return;
      for (let i = 0; i < n; i++) {
        const a = rand(0, 6.28), v = rand(1.5, 7);
        petals.push(Object.assign(base(rand(.3, 1)), {
          x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 2.5, gravity: .08, decay: .005
        }));
      }
      run();
    },
    // A gust that sweeps across the whole screen from the left
    gust(n = 44) {
      if (reduce) return;
      for (let i = 0; i < n; i++) {
        petals.push(Object.assign(base(rand(.2, 1)), {
          x: rand(-W * .9, -20), y: rand(-20, H), vx: rand(6, 11), vy: rand(-.8, 1.6), decay: .0035
        }));
      }
      wind = 2.4;
      run();
    },
    // One petal letting go of a branch
    drop(x, y) {
      if (reduce) return;
      petals.push(Object.assign(base(rand(.4, .9)), { x, y, vx: rand(-.15, .35), vy: .5, gravity: .012, decay: .0018 }));
      run();
    },
    scroll(v) { lift = Math.max(-16, Math.min(16, v * .34)); wind += v * .004; },
    resize() { if (running) resize(); }
  };

  addEventListener('resize', () => window.Petals.resize());
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) running = false;
    else if (petals.length) run();
  });

  /* ---------- The hummingbird ---------- */

  window.Bird = {
    make(className = '') {
      const el = document.createElement('div');
      el.className = `bird ${className}`.trim();
      el.setAttribute('aria-hidden', 'true');
      el.innerHTML = `<div class="bird-in">
        <img class="wing far" src="assets/img/bird-wing-far.webp" alt="">
        <img class="body" src="assets/img/bird-body.webp" alt="">
        <img class="wing near" src="assets/img/bird-wing-near.webp" alt="">
      </div>`;
      return el;
    }
  };
})();
