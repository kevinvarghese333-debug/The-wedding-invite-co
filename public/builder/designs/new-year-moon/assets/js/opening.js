/* Nila & Aaron · opening
   11:59:50 PM on New Year's Eve. The guest taps, the clock runs to midnight,
   fireworks go up, and the sparks of the last one gather into the couple's names. */
(() => {
  'use strict';
  window.__opening = true;

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const root = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const DPR = Math.min(window.devicePixelRatio || 1, 2);
  const rand = (a, b) => a + Math.random() * (b - a);
  const clamp01 = v => (v < 0 ? 0 : v > 1 ? 1 : v);
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const store = {
    get: k => { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: (k, v) => { try { localStorage.setItem(k, v); } catch (e) { /* private mode */ } }
  };

  const PAL = {
    gold: [217, 187, 134], hi: [255, 236, 204], blush: [240, 185, 164],
    ember: [232, 145, 91], ivory: [251, 245, 234], rose: [214, 140, 160]
  };

  const el = {
    stage: $('.stage'), topbar: $('.topbar'), moon: $('.moon'), dawn: $('.dawn'),
    clockwrap: $('.clockwrap'), clock: $('.clock'), date: $('.date'), ampm: $('.ampm'),
    progress: $('.progress'), bar: $('.progress i'), ghost: $('.ghost'),
    prompt: $('.prompt'), ring: $('.ring'), again: $('.again'), skip: $('.skip'),
    reveal: $('.reveal'), names: $('.names'), after: $$('.reveal .after'),
    cue: $('.scrollcue'), sound: $('.sound'), sky: $('#sky'), fx: $('#fx')
  };
  const slots = $$('.slot', el.clock);

  /* ---------- Canvases ---------- */

  const sx = el.sky.getContext('2d');
  const fc = el.fx.getContext('2d');
  let W = 0, H = 0;

  const stars = Array.from({ length: 420 }, () => ({
    x: Math.random(), y: Math.random(), z: Math.random(),
    r: .3 + Math.random() ** 3 * 1.35, a: rand(.25, 1), ph: rand(0, 6.283), sp: rand(.5, 1.8)
  }));
  const sky = { warp: 0, drift: 0 };

  function size() {
    W = innerWidth; H = innerHeight;
    for (const [cv, c] of [[el.sky, sx], [el.fx, fc]]) {
      cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR);
      cv.style.width = W + 'px'; cv.style.height = H + 'px';
      c.setTransform(DPR, 0, 0, DPR, 0, 0);
    }
    if (reduce) drawSky(0, 0);
  }

  function drawSky(t, dt) {
    sx.clearRect(0, 0, W, H);
    const n = Math.min(stars.length, Math.round(W * H / 2300));
    const cx = W / 2, cy = H * .46, k = sky.warp * .24;
    sky.drift += dt * .00005;
    for (let i = 0; i < n; i++) {
      const s = stars[i];
      let x = ((s.x + sky.drift * (.3 + s.z)) % 1) * W, y = s.y * H;
      const kk = 1 + k * s.z;
      x = cx + (x - cx) * kk; y = cy + (y - cy) * kk;
      const a = s.a * (reduce ? .8 : .6 + .4 * Math.sin(t * s.sp + s.ph));
      sx.fillStyle = `rgba(255,246,228,${a.toFixed(3)})`;
      if (s.r < .9) sx.fillRect(x, y, s.r * 1.6, s.r * 1.6);
      else { sx.beginPath(); sx.arc(x, y, s.r, 0, 6.2832); sx.fill(); }
    }
  }

  /* ---------- Fireworks and the name particles ---------- */

  const shells = [], sparks = [], flashes = [], glyph = [];
  let glyphState = 'off', glyphClock = 0, fxAwake = false, idle = 0;
  const unit = () => Math.min(W, H) / 800;

  function dot(x, y, r, c, a) {
    fc.fillStyle = `rgba(${c[0]},${c[1]},${c[2]},${a.toFixed(3)})`;
    if (r < 1.1) fc.fillRect(x - r, y - r, r * 2, r * 2);
    else { fc.beginPath(); fc.arc(x, y, r, 0, 6.2832); fc.fill(); }
  }
  const mix = (a, b, k) => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k].map(Math.round);
  const spark = (x, y, vx, vy, c, s, max, g, fl) => ({ x, y, vx, vy, c, s, max, g, fl, life: 0 });

  function launch(o) {
    const x0 = o.x0 != null ? o.x0 : o.x + rand(-.05, .05) * W;
    const T = (o.T || 1) * 60;
    shells.push({ x0, y0: H + 10, x: x0, y: H + 10, tx: o.x, ty: o.y, age: 0, T, o });
    fxAwake = true;
    whoosh(T / 60, o.quiet);
  }

  function burst(x, y, o = {}) {
    const color = o.color || PAL.gold, power = o.power || 1;
    const count = Math.round((o.count || 120) * (W < 600 ? .75 : 1));
    const v0 = .0077 * Math.min(W, H) * power;
    for (let i = 0; i < count; i++) {
      const a = (i / count) * 6.2832 + rand(-.1, .1);
      const v = v0 * (.45 + .55 * Math.sqrt(Math.random()));
      const c = Math.random() < .22 ? PAL.hi : color;
      sparks.push(spark(x, y, Math.cos(a) * v, Math.sin(a) * v, c, rand(1, 2) * (o.quiet ? .7 : 1), rand(55, 100), 1, Math.random() < .3));
    }
    flashes.push({ x, y, r: Math.min(W, H) * .3 * power, life: 0, max: 16, a: o.quiet ? .18 : .45 });
    fxAwake = true;
    boom(o.quiet ? .3 : power);
  }

  function stepShells(dt) {
    for (let i = shells.length - 1; i >= 0; i--) {
      const s = shells[i];
      s.age += dt;
      const p = Math.min(1, s.age / s.T), e = 1 - (1 - p) * (1 - p);
      const px = s.x, py = s.y;
      s.x = s.x0 + (s.tx - s.x0) * e;
      s.y = s.y0 + (s.ty - s.y0) * e;
      // A short streak plus a few sparks along it, so the rocket reads as one line
      fc.strokeStyle = `rgba(255,236,204,${(.9 - p * .4).toFixed(3)})`;
      fc.lineWidth = 1.6;
      fc.lineCap = 'round';
      fc.beginPath(); fc.moveTo(px, py); fc.lineTo(s.x, s.y); fc.stroke();
      for (let j = 0; j < 3; j++) {
        const k = Math.random();
        sparks.push(spark(px + (s.x - px) * k, py + (s.y - py) * k, rand(-.25, .25), rand(.2, .7), PAL.hi, rand(.45, .9), rand(8, 18), .25, false));
      }
      dot(s.x, s.y, 1.8, PAL.hi, 1 - p * .4);
      if (p >= 1) {
        shells.splice(i, 1);
        burst(s.tx, s.ty, s.o);
        if (s.o.onBurst) s.o.onBurst(s.tx, s.ty);
      }
    }
  }

  function stepSparks(dt) {
    const g = .045 * unit(), drag = Math.pow(.965, dt);
    for (let i = sparks.length - 1; i >= 0; i--) {
      const p = sparks[i];
      p.life += dt;
      if (p.life >= p.max) { sparks[i] = sparks[sparks.length - 1]; sparks.pop(); continue; }
      p.vx *= drag;
      p.vy = p.vy * drag + g * p.g * dt;
      p.x += p.vx * dt; p.y += p.vy * dt;
      const k = 1 - p.life / p.max;
      let a = k * k;
      if (p.fl && Math.random() < .35) a *= .25;
      dot(p.x, p.y, p.s * (.5 + .5 * k), p.c, a);
    }
  }

  function stepFlashes(dt) {
    for (let i = flashes.length - 1; i >= 0; i--) {
      const f = flashes[i];
      f.life += dt;
      const k = f.life / f.max;
      if (k >= 1) { flashes.splice(i, 1); continue; }
      const r = f.r * (.55 + .45 * k), a = f.a * (1 - k) * (1 - k);
      const gr = fc.createRadialGradient(f.x, f.y, 0, f.x, f.y, r);
      gr.addColorStop(0, `rgba(255,240,214,${a.toFixed(3)})`);
      gr.addColorStop(.35, `rgba(243,221,176,${(a * .35).toFixed(3)})`);
      gr.addColorStop(1, 'rgba(243,221,176,0)');
      fc.fillStyle = gr;
      fc.beginPath(); fc.arc(f.x, f.y, r, 0, 6.2832); fc.fill();
    }
  }

  // Trace the names (as laid out on the page) into points for the sparks to fly to.
  function sampleNames() {
    const off = document.createElement('canvas');
    off.width = Math.ceil(W); off.height = Math.ceil(H);
    const o = off.getContext('2d', { willReadFrequently: true });
    const pts = [];
    for (const sp of $$('span', el.names)) {
      const fs = parseFloat(getComputedStyle(sp).fontSize);
      const range = document.createRange();
      range.selectNodeContents(sp);
      const r = range.getBoundingClientRect();
      const mark = document.createElement('i');
      mark.style.cssText = 'display:inline-block;width:0;height:0;vertical-align:baseline';
      sp.appendChild(mark);
      const base = mark.getBoundingClientRect().top;
      mark.remove();

      o.clearRect(0, 0, off.width, off.height);
      o.font = `400 ${fs}px Italiana, serif`;
      o.textBaseline = 'alphabetic';
      o.fillStyle = '#fff';
      o.fillText(sp.textContent, r.left, base);

      const step = Math.max(2, Math.round(fs / 30));
      const x0 = Math.max(0, Math.floor(r.left - 6)), y0 = Math.max(0, Math.floor(r.top - 6));
      const w = Math.min(off.width - x0, Math.ceil(r.width + 12)), h = Math.min(off.height - y0, Math.ceil(r.height + 12));
      if (w <= 0 || h <= 0) continue;
      const data = o.getImageData(x0, y0, w, h).data;
      const amp = sp.classList.contains('amp');
      for (let y = 0; y < h; y += step) {
        for (let x = 0; x < w; x += step) {
          if (data[(y * w + x) * 4 + 3] > 110) {
            pts.push({ x: x0 + x + rand(-.6, .6), y: y0 + y + rand(-.6, .6), c: amp ? PAL.gold : (Math.random() < .25 ? PAL.hi : PAL.ivory) });
          }
        }
      }
    }
    const cap = W < 600 ? 1100 : 1900;
    if (pts.length > cap) {
      for (let i = pts.length - 1; i > 0; i--) { const j = (Math.random() * (i + 1)) | 0; [pts[i], pts[j]] = [pts[j], pts[i]]; }
      pts.length = cap;
    }
    return pts;
  }

  function formNames(bx, by) {
    const targets = sampleNames();
    const R = Math.min(W, H) * .34;
    glyph.length = 0;
    for (const t of targets) {
      const a = rand(0, 6.2832), d = rand(.35, 1) * R;
      glyph.push({
        x: bx, y: by, bx, by, cx: bx + Math.cos(a) * d, cy: by + Math.sin(a) * d * .85,
        tx: t.x, ty: t.y, c: t.c, s: rand(.75, 1.3) * Math.max(.85, unit()),
        del: rand(0, .22), dur: rand(1, 1.3), ph: rand(0, 6.28),
        t: 0, vx: 0, vy: 0, life: 0, max: rand(70, 150), emberAt: rand(0, .9)
      });
    }
    glyphState = 'fly'; glyphClock = 0; fxAwake = true;
  }

  function stepGlyph(dt, now) {
    if (glyphState === 'off') return;
    glyphClock += dt / 60;
    for (let i = glyph.length - 1; i >= 0; i--) {
      const p = glyph[i];
      if (glyphState === 'fly') {
        const k = clamp01((glyphClock - p.del) / p.dur);
        if (k <= 0) continue;
        const e = 1 - Math.pow(1 - k, 3), u = 1 - e;
        p.x = u * u * p.bx + 2 * u * e * p.cx + e * e * p.tx;
        p.y = u * u * p.by + 2 * u * e * p.cy + e * e * p.ty;
        // Bright in flight, settling to the held glow (trails add up while still)
        const a = k < 1 ? Math.min(1, k * 6) * (1 - .72 * k) : .22 + .07 * Math.sin(now * 7 + p.ph);
        dot(p.x, p.y, p.s, p.c, a);
      } else {
        p.t += dt / 60;
        if (p.t < p.emberAt) { dot(p.x, p.y, p.s, p.c, .22 + .07 * Math.sin(now * 7 + p.ph)); continue; }
        p.life += dt;
        if (p.life >= p.max) { glyph[i] = glyph[glyph.length - 1]; glyph.pop(); continue; }
        p.vx = (p.vx + rand(-.02, .02) * dt) * .985;
        p.vy = (p.vy + .012 * unit() * dt) * .985;
        p.x += p.vx * dt; p.y += p.vy * dt;
        const k = 1 - p.life / p.max;
        dot(p.x, p.y, p.s * (.4 + .6 * k), mix(p.c, PAL.ember, 1 - k), k * k * .5);
      }
    }
    if (glyphState === 'ember' && !glyph.length) glyphState = 'off';
  }

  function stepFx(dt, now) {
    // Fade the last frame instead of clearing it, which leaves trails
    fc.globalCompositeOperation = 'destination-out';
    // Shorter trails while the sparks fly into the names, so the letters stay legible
    const keep = glyphState === 'fly' ? .6 : .72;
    fc.fillStyle = `rgba(0,0,0,${(1 - Math.pow(keep, dt)).toFixed(3)})`;
    fc.fillRect(0, 0, W, H);
    fc.globalCompositeOperation = 'lighter';
    stepShells(dt); stepSparks(dt); stepFlashes(dt); stepGlyph(dt, now);
    fc.globalCompositeOperation = 'source-over';
    if (shells.length || sparks.length || flashes.length || glyph.length) idle = 0;
    else if (++idle > 45) { fc.clearRect(0, 0, W, H); fxAwake = false; }
  }

  let last = performance.now();
  function frame(now) {
    const dt = Math.min(3, (now - last) / 16.667);
    last = now;
    if (!reduce) drawSky(now / 1000, dt);
    if (fxAwake) stepFx(dt, now / 1000);
    requestAnimationFrame(frame);
  }

  /* ---------- Sound (synthesised, plus optional music) ---------- */

  const A = { ctx: null, out: null, noise: null, music: null, musicGain: null, muted: store.get('na-muted') === '1' };

  function initAudio() {
    if (A.ctx) { if (A.ctx.resume) A.ctx.resume(); return; }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    try {
      const c = A.ctx = new AC();
      A.out = c.createGain();
      A.out.gain.value = A.muted ? 0 : .9;
      A.out.connect(c.destination);
      const n = c.sampleRate * 2, b = c.createBuffer(1, n, c.sampleRate), d = b.getChannelData(0);
      for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
      A.noise = b;
      // Add data-music="assets/audio/music.mp3" to <body> to play a track from midnight
      const src = document.body.dataset.music;
      if (src) {
        const m = new Audio(src);
        m.loop = true;
        A.musicGain = c.createGain();
        A.musicGain.gain.value = 0;
        c.createMediaElementSource(m).connect(A.musicGain).connect(A.out);
        m.play().catch(() => {});
        A.music = m;
      }
      if (c.resume) c.resume();
    } catch (e) { A.ctx = null; }
  }

  function noise(t, dur, { type = 'lowpass', f0 = 1000, f1 = f0, q = .7, gain = .2, attack = .005 } = {}) {
    const c = A.ctx, s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain();
    s.buffer = A.noise;
    f.type = type; f.Q.value = q;
    f.frequency.setValueAtTime(f0, t);
    f.frequency.exponentialRampToValueAtTime(f1, t + dur);
    g.gain.setValueAtTime(.0001, t);
    g.gain.exponentialRampToValueAtTime(gain, t + attack);
    g.gain.exponentialRampToValueAtTime(.0001, t + dur);
    s.connect(f).connect(g).connect(A.out);
    s.start(t, Math.random() * 1.2);
    s.stop(t + dur + .05);
  }

  function tone(t, freq, dur, gain, type = 'sine') {
    const c = A.ctx, o = c.createOscillator(), g = c.createGain();
    o.type = type; o.frequency.value = freq;
    g.gain.setValueAtTime(.0001, t);
    g.gain.exponentialRampToValueAtTime(gain, t + .006);
    g.gain.exponentialRampToValueAtTime(.0001, t + dur);
    o.connect(g).connect(A.out);
    o.start(t); o.stop(t + dur + .05);
  }

  function tick(strong) {
    if (!A.ctx) return;
    noise(A.ctx.currentTime, .05, { type: 'bandpass', f0: strong ? 1800 : 2600, q: 6, gain: strong ? .5 : .32, attack: .002 });
  }
  function thump() {
    if (!A.ctx) return;
    const t = A.ctx.currentTime;
    tone(t, 64, .32, .5); tone(t + .17, 58, .3, .3);
  }
  function whoosh(dur, quiet) {
    if (!A.ctx) return;
    noise(A.ctx.currentTime, dur, { type: 'bandpass', f0: 420, f1: 2200, q: 1.4, gain: quiet ? .015 : .045, attack: dur * .7 });
  }
  function boom(power = 1) {
    if (!A.ctx) return;
    const t = A.ctx.currentTime + .02;
    noise(t, 1.4 * power + .3, { f0: 1400, f1: 90, gain: .55 * power, attack: .008 });
    for (let i = 0; i < 10 * power; i++) noise(t + rand(.25, 1.1), .03, { type: 'highpass', f0: 4200, gain: rand(.03, .09) * power, attack: .001 });
  }
  function chime() {
    if (!A.ctx) return;
    const t = A.ctx.currentTime;
    [[659.25, .05], [1318.5, .07], [1975.5, .045], [2637, .025]].forEach(([f, g]) => tone(t, f, 3.2, g));
    if (A.musicGain) A.musicGain.gain.setTargetAtTime(.6, t + .6, 1.5);
  }

  function showSound() {
    el.sound.hidden = false;
    el.sound.setAttribute('aria-pressed', String(A.muted));
    el.sound.setAttribute('aria-label', A.muted ? 'Turn sound on' : 'Turn sound off');
    gsap.fromTo(el.sound, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: .6, delay: .4, ease: 'expo.out' });
  }
  function toggleSound() {
    A.muted = !A.muted;
    store.set('na-muted', A.muted ? '1' : '0');
    el.sound.setAttribute('aria-pressed', String(A.muted));
    el.sound.setAttribute('aria-label', A.muted ? 'Turn sound on' : 'Turn sound off');
    if (A.ctx) A.out.gain.setTargetAtTime(A.muted ? 0 : .9, A.ctx.currentTime, .08);
  }

  /* ---------- Rolling digits ---------- */

  function roll(box, text, { dur = .55, delay = 0 } = {}) {
    const cur = box.lastElementChild;
    if (cur && cur.textContent === text) return;
    const next = document.createElement('span');
    next.className = 'd';
    next.textContent = text;
    box.appendChild(next);
    gsap.fromTo(next, { yPercent: 100, opacity: 0 }, { yPercent: 0, opacity: 1, duration: dur, delay, ease: 'expo.out' });
    if (cur) gsap.to(cur, { yPercent: -100, opacity: 0, duration: dur * .7, delay, ease: 'power2.in', onComplete: () => cur.remove() });
  }

  function setTime(t, cascade) {
    const digits = t.replace(/:/g, '');
    slots.forEach((s, i) => roll(s, digits[i], { delay: cascade ? (slots.length - 1 - i) * .05 : 0 }));
  }

  function ghost(text, wide) {
    const prev = el.ghost.lastElementChild;
    if (prev) gsap.to(prev, { scale: .92, opacity: 0, duration: .45, ease: 'power2.in', onComplete: () => prev.remove() });
    if (!text) return;
    const g = document.createElement('span');
    g.textContent = text;
    if (wide) g.className = 'wide';
    el.ghost.appendChild(g);
    gsap.fromTo(g, { xPercent: -50, yPercent: -52, scale: 1.22, opacity: 0 }, { scale: 1, opacity: 1, duration: .6, ease: 'expo.out' });
  }

  function heartbeat() {
    gsap.fromTo(el.clock, { textShadow: '0 0 .6em rgba(243,221,176,.6)' }, { textShadow: '0 0 .35em rgba(217,187,134,.18)', duration: .7, ease: 'power2.out' });
    thump();
  }

  /* ---------- The sequence ---------- */

  const TICKS = [.66, .6, .56, .52, .5, .5, .56, .7, .82, .95]; // :50 → :51 … :59 → midnight
  const timelines = new Set();
  const track = t => (timelines.add(t), t);
  let started = false, finished = false;

  function start() {
    if (started) return;
    started = true;
    initAudio();
    store.set('na-opened', '1');
    showSound();
    if (reduce) { finish(false); return; }

    const rb = el.ring.getBoundingClientRect();
    burst(rb.left + rb.width / 2, rb.top + rb.height / 2, { power: .26, count: 46, quiet: true, color: PAL.gold });

    // Bring the clock to the centre as the prompt leaves
    const shift = (el.prompt.offsetHeight + parseFloat(getComputedStyle(el.prompt).marginTop)) / 2;
    const tl = track(gsap.timeline());
    tl.to(el.ring, { scale: .95, duration: .12, ease: 'power2.out' })
      .to(el.prompt, { autoAlpha: 0, y: 16, duration: .4, ease: 'power2.in' })
      .call(() => el.clockwrap.classList.remove('idle'), null, '<')
      .to(el.clockwrap, { y: shift, duration: .9, ease: 'power3.inOut' }, '<.1')
      .to(el.clock, { scale: 1.06, duration: .9, ease: 'power3.inOut' }, '<')
      .to([el.progress, el.skip], { autoAlpha: 1, duration: .5 }, '<.3')
      .call(() => ghost('10'), null, '<');

    let at = tl.duration() + .05;
    const total = TICKS.reduce((a, b) => a + b, 0);
    tl.fromTo(el.bar, { scaleX: 0 }, { scaleX: 1, duration: total, ease: 'none' }, at);
    tl.to(sky, { warp: 1, duration: total, ease: 'power2.in' }, at);
    TICKS.forEach((d, i) => {
      at += d;
      if (i > 8) return;
      const sec = 51 + i;
      tl.call(() => {
        setTime(`11:59:${sec}`);
        el.clock.setAttribute('aria-label', `11:59:${sec} PM`);
        ghost(String(9 - i));
        tick(i >= 6);
        if (i >= 6) heartbeat();
      }, null, at);
    });

    tl.addLabel('m', at)
      .call(midnight, null, 'm')
      .to(el.clock, { scale: 1.12, duration: .5, ease: 'expo.out' }, 'm')
      .to(el.progress, { autoAlpha: 0, duration: .4 }, 'm')
      .to(sky, { warp: 0, duration: 2.6, ease: 'power3.out' }, 'm+=.2')
      .fromTo(el.clockwrap, { filter: 'blur(0px)' }, { autoAlpha: 0, y: '-=40', filter: 'blur(12px)', duration: .7, ease: 'power2.in', immediateRender: false }, 'm+=1.1')
      .call(() => ghost('2027', true), null, 'm+=1.35')
      .call(() => ghost(''), null, 'm+=2.6');

    [[1.2, .24, .30, PAL.gold, 1], [1.5, .76, .25, PAL.blush, .95], [1.9, .44, .17, PAL.hi, .8], [2.25, .64, .36, PAL.ember, .85]]
      .forEach(([t, x, y, color, power]) => tl.call(() => launch({ x: x * W, y: y * H, color, power, T: .95 }), null, `m+=${t}`));
    tl.call(finale, null, 'm+=2.95');
  }

  function midnight() {
    setTime('12:00:00', true);
    roll(el.ampm, 'AM', { delay: .2 });
    roll(el.date, 'Friday · 1 January 2027', { delay: .3, dur: .7 });
    el.clock.setAttribute('aria-label', '12:00:00 AM');
    ghost('');
    chime();
    flashes.push({ x: W / 2, y: H * .46, r: Math.max(W, H) * .7, life: 0, max: 26, a: .35 });
    fxAwake = true;
  }

  function finale() {
    gsap.set(el.reveal, { autoAlpha: 1 });
    const r = el.names.getBoundingClientRect();
    const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    launch({
      x: cx, x0: cx, y: cy, color: PAL.hi, power: .7, count: 90, T: 1.05,
      onBurst: (x, y) => {
        formNames(x, y);
        track(gsap.timeline({ delay: 1 }))
          .fromTo(el.names, { opacity: 0, filter: 'blur(14px)' }, { opacity: 1, filter: 'blur(0px)', duration: 1.3, ease: 'power2.out' })
          .call(() => { glyphState = 'ember'; }, null, '-=.55')
          .fromTo(el.after, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: .8, stagger: .14, ease: 'expo.out' }, '-=.5')
          .call(settle, null, '-=.2');
      }
    });
  }

  // The invite is open: unlock scrolling and let a few quiet fireworks drift by
  function settle() {
    finished = true;
    root.classList.remove('is-locked');
    document.dispatchEvent(new CustomEvent('invite:open'));
    gsap.to(el.skip, { autoAlpha: 0, duration: .4 });
    gsap.to(el.dawn, { opacity: 1, duration: 3, ease: 'sine.inOut' });
    gsap.fromTo(el.cue, { autoAlpha: 0, y: -8 }, { autoAlpha: 1, y: 0, duration: .9, delay: .4, ease: 'expo.out' });
    if (reduce) return;
    [[1.4, .16, .2, PAL.blush], [3.8, .84, .16, PAL.gold], [7, .3, .12, PAL.rose]].forEach(([d, x, y, color]) => {
      track(gsap.delayedCall(d, () => {
        if (scrollY < H * .4) launch({ x: x * W, y: y * H, color, power: .45, count: 60, quiet: true, T: 1.1 });
      }));
    });
  }

  // Skip straight to the open invite
  function finish(celebrate) {
    if (finished) return;
    started = true;
    timelines.forEach(t => t.kill());
    timelines.clear();
    shells.length = sparks.length = flashes.length = glyph.length = 0;
    glyphState = 'off';
    fc.clearRect(0, 0, W, H);
    sky.warp = 0;
    gsap.to([el.prompt, el.clockwrap, el.ghost, el.progress], { autoAlpha: 0, duration: .35, ease: 'power2.in' });
    gsap.set(el.reveal, { autoAlpha: 1 });
    gsap.timeline({ delay: .25 })
      .fromTo(el.names, { opacity: 0, y: reduce ? 0 : 14, filter: 'blur(0px)' }, { opacity: 1, y: 0, duration: reduce ? .6 : .9, ease: 'expo.out' })
      .fromTo(el.after, { opacity: 0, y: reduce ? 0 : 12 }, { opacity: 1, y: 0, duration: .7, stagger: .12, ease: 'expo.out' }, '-=.55')
      .call(settle);
    if (celebrate && !reduce) {
      [[.25, .3, PAL.gold], [.75, .26, PAL.blush]].forEach(([x, y, color], i) => {
        track(gsap.delayedCall(.3 + i * .35, () => launch({ x: x * W, y: y * H, color, power: .7, T: .9 })));
      });
    }
  }

  /* ---------- Entrance and wiring ---------- */

  function enter() {
    gsap.set([el.stage, el.topbar, el.moon], { opacity: 1 });
    if (store.get('na-opened')) el.again.hidden = false;
    if (reduce) return;
    gsap.timeline({ defaults: { ease: 'expo.out' } })
      .fromTo(el.sky, { opacity: 0 }, { opacity: 1, duration: 2.2, ease: 'sine.out' }, 0)
      .fromTo(el.moon, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 2, ease: 'power2.out' }, .3)
      .fromTo(el.date, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 1 }, .35)
      .fromTo($$('.slot .d', el.clock), { yPercent: 105 }, { yPercent: 0, duration: 1.1, stagger: .06 }, .5)
      .fromTo(el.ampm, { opacity: 0 }, { opacity: 1, duration: .8, ease: 'power2.out' }, .9)
      .fromTo([...el.prompt.children], { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: .9, stagger: .12 }, 1)
      .fromTo(el.topbar, { opacity: 0 }, { opacity: 1, duration: 1.2, ease: 'power2.out' }, 1.2);
  }

  // Lets later sections (the RSVP) celebrate with the same sparks
  window.__sparks = (x, y, tone) => {
    if (reduce) return;
    burst(x, y, { power: .5, count: 70, quiet: true, color: PAL[tone] || PAL.gold });
  };

  el.ring.addEventListener('click', start);
  el.skip.addEventListener('click', () => finish(false));
  el.again.addEventListener('click', () => { started = true; initAudio(); showSound(); finish(true); });
  el.sound.addEventListener('click', toggleSound);
  el.cue.addEventListener('click', e => {
    e.preventDefault();
    const to = $('#hero');
    if (window.__lenis) window.__lenis.scrollTo(to, { duration: 1.6 });
    else to.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
  });
  addEventListener('resize', size);

  size();
  requestAnimationFrame(frame);
  const fontsReady = document.fonts ? document.fonts.load('400 100px Italiana').then(() => document.fonts.ready) : Promise.resolve();
  Promise.race([fontsReady, wait(1500)]).then(enter);
})();
