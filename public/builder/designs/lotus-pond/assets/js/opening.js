/* Malavika & Hari · the opening.
   A lotus bud on still, dark water. A touch sends ripples out, the lotus opens,
   their names rise, and the pond stills into their photo. */
(() => {
  'use strict';
  window.__opening = true;

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const root = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const pond = window.Pond;

  const scene = $('.pond-scene');
  const lotusBox = $('.lotus', scene), lotus = $('.lotus-in', scene), lotusSvg = $('svg', lotus);
  const flower = $('.flower', scene), heart = $('.heart', scene), glow = $('.glow', scene);
  const rows = $$('.flower > .row', scene); // low petals, back row, front row
  const petals = $$('.petal', scene);
  const padsBox = $('.pads', scene), pads = $$('.pad', scene);
  const intro = $('.intro', scene), words = $('.bloom-words', scene), hero = $('.hero-words', scene);
  const shade = $('.pond-shade', scene), cue = $('.scrollcue', scene);
  const skipBtn = $('.skip', scene), touchBtn = $('.touch', scene), soundBtn = $('.sound');

  // Faces sit near these points, so narrow screens crop around them
  const PHOTOS = {
    wide: { src: 'assets/img/hero-wide.jpg', focus: [.6, .3] },
    tall: { src: 'assets/img/hero.jpg', focus: [.58, .32] }
  };
  const photoReady = pond.ok ? pond.usePhotos(PHOTOS) : Promise.resolve(true);

  let state = 'idle'; // idle → blooming → diving → open
  let play = null;

  /* ---------- Sound, all synthesised ---------- */

  const audio = (() => {
    let ctx = null, out = null, amb = null, muted = false, ambOn = true, timer = 0;

    function init() {
      if (ctx) { if (ctx.state === 'suspended') ctx.resume(); return; }
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      ctx = new AC();
      out = ctx.createGain();
      out.gain.value = .9;
      const comp = ctx.createDynamicsCompressor();
      out.connect(comp);
      comp.connect(ctx.destination);
      ambience();
    }
    const live = () => ctx && !muted;

    // A drop: a little bubble whose pitch rises, then a smaller one
    function drop(k = 1) {
      if (!live()) return;
      const t = ctx.currentTime;
      [[1, 0, .2], [1.6, .055, .07]].forEach(([m, dt, g0]) => {
        const o = ctx.createOscillator(), g = ctx.createGain();
        const f = (650 + Math.random() * 450) * m;
        o.type = 'sine';
        o.frequency.setValueAtTime(f * .5, t + dt);
        o.frequency.exponentialRampToValueAtTime(f, t + dt + .07);
        g.gain.setValueAtTime(0, t + dt);
        g.gain.linearRampToValueAtTime(g0 * k, t + dt + .006);
        g.gain.exponentialRampToValueAtTime(.0001, t + dt + .2);
        o.connect(g);
        g.connect(out);
        o.start(t + dt);
        o.stop(t + dt + .22);
      });
    }

    // A small brass temple bell: inharmonic partials that ring and beat
    function bell(k = 1, f0 = 587.33) {
      if (!live()) return;
      const t = ctx.currentTime;
      [[1, 1, 4.5], [1.004, .6, 4.2], [2.01, .3, 2.6], [2.76, .42, 2.2], [5.4, .18, 1.1], [8.93, .08, .6]].forEach(([m, g0, d]) => {
        const o = ctx.createOscillator(), g = ctx.createGain();
        o.frequency.value = f0 * m;
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(g0 * .11 * k, t + .004);
        g.gain.exponentialRampToValueAtTime(.0001, t + d);
        o.connect(g);
        g.connect(out);
        o.start(t);
        o.stop(t + d + .05);
      });
    }

    // A warm chord as the photo surfaces
    function swell() {
      if (!live()) return;
      const t = ctx.currentTime;
      const lp = ctx.createBiquadFilter(), g = ctx.createGain();
      lp.type = 'lowpass';
      lp.frequency.value = 1300;
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(.085, t + 1.8);
      g.gain.exponentialRampToValueAtTime(.0001, t + 7);
      lp.connect(g);
      g.connect(out);
      [220, 329.63, 440, 554.37, 659.25].forEach((f, i) => {
        const o = ctx.createOscillator();
        o.type = i % 2 ? 'triangle' : 'sine';
        o.frequency.value = f;
        o.detune.value = (Math.random() - .5) * 9;
        o.connect(lp);
        o.start(t);
        o.stop(t + 7.1);
      });
      bell(.6, 880);
    }

    // Night on the water: low brown noise, and crickets now and then
    function ambience() {
      const len = ctx.sampleRate * 3, buf = ctx.createBuffer(1, len, ctx.sampleRate), d = buf.getChannelData(0);
      let b = 0;
      for (let i = 0; i < len; i++) { b = (b + .02 * (Math.random() * 2 - 1)) / 1.02; d[i] = b * 3.5; }
      const src = ctx.createBufferSource(), lp = ctx.createBiquadFilter();
      src.buffer = buf;
      src.loop = true;
      lp.type = 'lowpass';
      lp.frequency.value = 520;
      amb = ctx.createGain();
      amb.gain.setValueAtTime(0, ctx.currentTime);
      amb.gain.linearRampToValueAtTime(.05, ctx.currentTime + 2.5);
      src.connect(lp);
      lp.connect(amb);
      amb.connect(out);
      src.start();
      crickets();
    }
    function crickets() {
      clearTimeout(timer);
      timer = setTimeout(() => {
        if (ambOn && live() && !document.hidden) {
          const t = ctx.currentTime, o = ctx.createOscillator(), g = ctx.createGain();
          o.frequency.value = 4300 + Math.random() * 500;
          g.gain.setValueAtTime(0, t);
          for (let i = 0; i < 3; i++) {
            const s = t + i * .07;
            g.gain.setValueAtTime(0, s);
            g.gain.linearRampToValueAtTime(.01, s + .012);
            g.gain.linearRampToValueAtTime(0, s + .045);
          }
          o.connect(g);
          g.connect(out);
          o.start(t);
          o.stop(t + .25);
        }
        crickets();
      }, 900 + Math.random() * 2200);
    }
    function setAmbience(on) {
      ambOn = on;
      if (amb) amb.gain.setTargetAtTime(on ? .05 : 0, ctx.currentTime, .7);
    }
    function setMuted(m) {
      muted = m;
      if (out) out.gain.setTargetAtTime(m ? 0 : .9, ctx.currentTime, .05);
    }
    return { init, drop, bell, swell, setAmbience, setMuted, get ready() { return !!ctx; } };
  })();

  function showSound() {
    if (!audio.ready || !soundBtn.hidden) return;
    soundBtn.hidden = false;
    gsap.fromTo(soundBtn, { opacity: 0, scale: .8 }, { opacity: 1, scale: 1, duration: .6, ease: 'back.out(2)' });
  }
  soundBtn.addEventListener('click', () => {
    const off = soundBtn.getAttribute('aria-pressed') !== 'true';
    soundBtn.setAttribute('aria-pressed', String(off));
    soundBtn.setAttribute('aria-label', off ? 'Turn sound on' : 'Turn sound off');
    audio.setMuted(off);
  });

  /* ---------- Fireflies over the water, and pollen when the lotus opens ---------- */

  const motes = $('#motes'), mctx = motes.getContext('2d');
  const flies = [], pollen = [];
  const fade = { a: 1 };
  let W = 0, H = 0;

  function sprite(rgb) {
    const c = document.createElement('canvas');
    c.width = c.height = 48;
    const x = c.getContext('2d'), g = x.createRadialGradient(24, 24, 0, 24, 24, 24);
    g.addColorStop(0, `rgba(${rgb},1)`);
    g.addColorStop(.25, `rgba(${rgb},.55)`);
    g.addColorStop(1, `rgba(${rgb},0)`);
    x.fillStyle = g;
    x.fillRect(0, 0, 48, 48);
    return c;
  }
  const GOLD = sprite('246,214,140'), PINK = sprite('248,180,204');

  function sizeMotes() {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    W = scene.clientWidth;
    H = scene.clientHeight;
    motes.width = W * dpr;
    motes.height = H * dpr;
    mctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  for (let i = 0; i < 30; i++) {
    flies.push({ x: Math.random(), y: .12 + Math.random() * .85, vx: (Math.random() - .5) * .01, vy: -(.003 + Math.random() * .008), p: Math.random() * 7, s: 10 + Math.random() * 14 });
  }

  function burst(x, y) {
    for (let i = 0; i < 70; i++) {
      const a = -Math.PI / 2 + (Math.random() - .5) * 2.2, v = 40 + Math.random() * 170;
      pollen.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: 0, max: 1.4 + Math.random() * 1.8, s: 6 + Math.random() * 12, img: Math.random() < .65 ? GOLD : PINK });
    }
  }

  let last = performance.now();
  function drawMotes() {
    const now = performance.now(), dt = Math.min(.05, (now - last) / 1000), t = now / 1000;
    last = now;
    mctx.clearRect(0, 0, W, H);
    if (fade.a <= 0 && !pollen.length) return;
    mctx.globalCompositeOperation = 'lighter';
    for (const f of flies) {
      f.x += f.vx * dt + Math.sin(t * .6 + f.p) * .0004;
      f.y += f.vy * dt;
      if (f.y < .05) { f.y = 1.02; f.x = Math.random(); }
      const a = (.25 + .75 * Math.max(0, Math.sin(t * 1.4 + f.p * 3))) * fade.a * .75;
      if (a < .02) continue;
      mctx.globalAlpha = a;
      mctx.drawImage(GOLD, f.x * W - f.s / 2, f.y * H - f.s / 2, f.s, f.s);
    }
    for (let i = pollen.length - 1; i >= 0; i--) {
      const p = pollen[i];
      p.life += dt;
      if (p.life > p.max) { pollen.splice(i, 1); continue; }
      p.vx *= .985;
      p.vy = p.vy * .985 - 6 * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      mctx.globalAlpha = Math.min(1, (1 - p.life / p.max) * 1.4) * .9;
      mctx.drawImage(p.img, p.x - p.s / 2, p.y - p.s / 2, p.s, p.s);
    }
    mctx.globalAlpha = 1;
  }

  /* ---------- Ripples: on the water, and the pads and lotus bob as they pass ---------- */

  function local(e) {
    const r = scene.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  }

  function heartPoint() {
    const r = heart.getBoundingClientRect(), s = scene.getBoundingClientRect();
    const x = r.left + r.width / 2 - s.left, y = r.top + r.height / 2 - s.top;
    return { x, y, u: x / s.width, v: y / s.height };
  }

  function splash(x, y, amp) {
    const w = scene.clientWidth, h = scene.clientHeight;
    pond.addDrop(x / w, y / h, amp);
    if (!pond.ok) ring(x, y);
    if (state === 'open') return;
    pads.forEach(p => {
      const r = p.getBoundingClientRect();
      const d = Math.hypot(r.left + r.width / 2 - x, r.top + r.height / 2 - y) / h;
      gsap.fromTo($('svg', p), { scale: 1 }, { scale: 1 + amp * 2.2, duration: .45, delay: d / .26, yoyo: true, repeat: 1, ease: 'sine.inOut', overwrite: 'auto' });
    });
    const hp = heartPoint(), d = Math.hypot(hp.x - x, hp.y - y) / h;
    gsap.fromTo(lotusSvg, { rotation: 0 }, {
      keyframes: [{ rotation: amp * 90, duration: .4 }, { rotation: -amp * 50, duration: .5 }, { rotation: 0, duration: .7 }],
      delay: d / .26, ease: 'sine.inOut', transformOrigin: '50% 66%', overwrite: 'auto'
    });
  }

  // Without WebGL, a ring drawn on the page stands in for the ripple
  function ring(x, y) {
    const el = document.createElement('i');
    el.className = 'ring-fx';
    el.style.left = x + 'px';
    el.style.top = y + 'px';
    scene.appendChild(el);
    gsap.fromTo(el, { scale: .2, opacity: .8 }, { scale: 9, opacity: 0, duration: 2.4, ease: 'power2.out', onComplete: () => el.remove() });
  }

  /* ---------- The lotus ---------- */

  // Stamens around the seed pod
  (() => {
    const NS = 'http://www.w3.org/2000/svg', g = $('.stamens', heart);
    for (let i = 0; i < 20; i++) {
      const k = i / 19 - .5;
      const x0 = k * 32, y0 = -50, x1 = k * 60 + (Math.random() - .5) * 5, y1 = -64 - (1 - Math.abs(k) * 1.5) * 12 - Math.random() * 5;
      const l = document.createElementNS(NS, 'line'), c = document.createElementNS(NS, 'circle');
      l.setAttribute('x1', x0); l.setAttribute('y1', y0); l.setAttribute('x2', x1); l.setAttribute('y2', y1);
      c.setAttribute('cx', x1); c.setAttribute('cy', y1); c.setAttribute('r', 1.9);
      g.append(l, c);
    }
  })();

  function budState() {
    petals.forEach(p => {
      const a = +p.dataset.a, s = +p.dataset.s;
      gsap.set(p, { svgOrigin: '0 0', rotation: a * .07, scaleX: s * .46, scaleY: s * .92 });
    });
    gsap.set(flower, { svgOrigin: '0 0', scale: .74 });
    gsap.set(heart, { svgOrigin: '0 -52', scale: .3, opacity: 0 });
    gsap.set(glow, { svgOrigin: '0 -64', scale: .7, opacity: .35 });
  }

  function bloomState() {
    petals.forEach(p => {
      const s = +p.dataset.s;
      gsap.set(p, { svgOrigin: '0 0', rotation: +p.dataset.a, scaleX: s, scaleY: s });
    });
    gsap.set(flower, { svgOrigin: '0 0', scale: 1 });
    gsap.set(heart, { svgOrigin: '0 -52', scale: 1, opacity: 1 });
    gsap.set(glow, { svgOrigin: '0 -64', scale: 1.05, opacity: 1 });
  }

  function bloom(dur = 2.6) {
    const t = gsap.timeline();
    t.to(flower, { scale: 1, duration: dur, ease: 'power3.out' }, 0)
      .to(glow, { opacity: 1, scale: 1.05, duration: dur, ease: 'power2.out' }, 0)
      .to(heart, { scale: 1, opacity: 1, duration: 1.6, ease: 'expo.out' }, .6);
    // The back row opens first, the outer petals settle onto the water, then the front row
    [[rows[1], 0], [rows[0], .3], [rows[2], .45]].forEach(([row, at]) => {
      t.to($$('.petal', row), {
        rotation: (i, el) => +el.dataset.a,
        scaleX: (i, el) => +el.dataset.s,
        scaleY: (i, el) => +el.dataset.s,
        duration: dur,
        ease: 'expo.out',
        stagger: .07
      }, at);
    });
    return t;
  }

  // Letters for the names, so they can rise one by one
  $$('.names > span', words).forEach(span => {
    if (span.classList.contains('amp')) { span.classList.add('ch'); return; }
    span.innerHTML = [...span.textContent].map(c => `<span class="ch">${c}</span>`).join('');
  });

  function rise() {
    return gsap.timeline()
      .set(words, { autoAlpha: 1 })
      .fromTo($('.ml', words), { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 1.2, ease: 'expo.out' }, 0)
      .fromTo($$('.names .ch', words), { opacity: 0, yPercent: 70, filter: 'blur(10px)' },
        { opacity: 1, yPercent: 0, filter: 'blur(0px)', duration: 1.5, ease: 'expo.out', stagger: .045 }, .1)
      .fromTo($('.sub', words), { opacity: 0, letterSpacing: '.6em' }, { opacity: 1, letterSpacing: '.34em', duration: 1.6, ease: 'expo.out' }, .7);
  }

  function heroIn() {
    return gsap.timeline()
      .call(() => scene.classList.add('is-revealed'))
      .set(hero, { autoAlpha: 1 })
      .to(pond.ok ? pond : shade, pond.ok ? { shade: 1, duration: 1.6, ease: 'power2.out' } : { opacity: 1, duration: 1.6 }, 0)
      .fromTo(hero.children, { opacity: 0, y: 26 }, { opacity: 1, y: 0, duration: 1.4, stagger: .14, ease: 'expo.out' }, .1)
      .fromTo(cue, { autoAlpha: 0 }, { autoAlpha: 1, duration: 1 }, .9);
  }

  const setClip = () => scene.style.setProperty('--reveal', pond.reveal * 150 + '%');

  /* ---------- The sequence ---------- */

  let bob = null;

  function begin(x, y) {
    if (state !== 'idle') return;
    state = 'blooming';
    audio.init();
    showSound();
    audio.drop(1);
    splash(x, y, .03);
    play = gsap.timeline({ onComplete: () => photoReady.then(dive) })
      .to(intro, { autoAlpha: 0, y: 14, duration: .7, ease: 'power2.in' }, 0)
      .to(lotusBox, { '--ly': '68%', duration: 2.6, ease: 'power2.inOut' }, .2) // room above for their names
      .call(() => { const h = heartPoint(); splash(h.x, h.y, .022); audio.bell(); }, null, .5)
      .add(bloom(), .5)
      .call(() => { const h = heartPoint(); burst(h.x, h.y); }, null, 1.2)
      .add(rise(), 1.7)
      .to({}, { duration: 1.5 }); // a moment with the open lotus and their names
  }

  function dive() {
    if (state !== 'blooming') return;
    state = 'diving';
    const h = heartPoint(), s = scene.getBoundingClientRect();
    pond.center = [h.u, h.v];
    scene.style.setProperty('--cx', h.u * 100 + '%');
    scene.style.setProperty('--cy', h.v * 100 + '%');
    if (bob) bob.kill();
    gsap.set(lotus, { y: 0, rotation: 0 });
    // Drop into the heart of the flower
    const r = lotus.getBoundingClientRect();
    gsap.set(lotus, { transformOrigin: `${h.x + s.left - r.left}px ${h.y + s.top - r.top}px` });

    play = gsap.timeline({ onComplete: settle })
      .call(() => { splash(h.x, h.y, .04); audio.swell(); }, null, 0)
      .to(words, { autoAlpha: 0, y: -26, filter: 'blur(8px)', duration: 1.1, ease: 'power2.in' }, 0)
      .to(petals, { rotation: (i, el) => +el.dataset.a * 1.3, duration: 2.2, ease: 'power2.in' }, 0)
      .to(lotus, { scale: 6, duration: 2.4, ease: 'power3.in' }, .15)
      .to(lotusBox, { opacity: 0, duration: .9, ease: 'power1.in' }, 1.5)
      .to(pads, { opacity: 0, duration: 1.8, ease: 'power2.in', stagger: .04 }, .1)
      .to($$('.pad svg', scene), { scale: 1.35, duration: 2, ease: 'power2.in' }, .1)
      .to(pond, { reveal: 1, duration: 3, ease: 'power2.inOut', onUpdate: setClip }, .5)
      .to(fade, { a: 0, duration: 2 }, .6)
      .add(heroIn(), 2.6);
  }

  function settle() {
    if (state === 'open') return;
    state = 'open';
    gsap.set([lotusBox, padsBox, intro, words], { autoAlpha: 0 });
    root.classList.remove('is-locked');
    scene.classList.add('is-open');
    document.dispatchEvent(new CustomEvent('invite:open'));
  }

  function skip() {
    if (state === 'open' || state === 'diving' && pond.reveal > .6) return;
    if (play) play.kill();
    if (bob) bob.kill();
    state = 'diving';
    fade.a = 0;
    gsap.to([intro, words, lotusBox, padsBox], { autoAlpha: 0, duration: .5 });
    gsap.timeline({ onComplete: settle })
      .to(pond, { reveal: 1, duration: reduce ? 0 : 1.4, ease: 'power2.inOut', onUpdate: setClip }, 0)
      .add(heroIn(), reduce ? 0 : .5);
  }

  /* ---------- Start ---------- */

  scrollTo(0, 0);
  sizeMotes();
  addEventListener('resize', sizeMotes);
  gsap.ticker.add(drawMotes);

  if (reduce) {
    // No ripples or blooming: an open lotus, then a plain fade into their photo
    bloomState();
    gsap.set(words, { autoAlpha: 1 });
    gsap.set($('.tease', intro), { display: 'none' });
    touchBtn.lastChild.textContent = 'Open the invitation';
    touchBtn.addEventListener('click', () => {
      if (state !== 'idle') return;
      state = 'diving';
      scene.style.setProperty('--reveal', '150%');
      gsap.timeline({ onComplete: settle })
        .to([intro, words, lotusBox, padsBox], { autoAlpha: 0, duration: .6 })
        .fromTo('.pond-still', { opacity: 0 }, { opacity: 1, duration: .8 })
        .add(heroIn());
    });
    fade.a = .6;
  } else {
    budState();
    gsap.from(lotusBox, { opacity: 0, y: 30, duration: 2.2, ease: 'expo.out', delay: .2 });
    gsap.from(intro.children, { opacity: 0, y: 18, duration: 1.4, stagger: .12, ease: 'expo.out', delay: .6 });
    bob = gsap.to(lotus, { y: -7, rotation: .8, duration: 3.2, ease: 'sine.inOut', yoyo: true, repeat: -1 });
    pads.forEach((p, i) => {
      gsap.to($('svg', p), { rotation: `+=${(i % 2 ? -1 : 1) * (12 + i * 3)}`, duration: 26 + i * 4, ease: 'sine.inOut', yoyo: true, repeat: -1 });
    });

    touchBtn.addEventListener('click', () => { const h = heartPoint(); begin(h.x, h.y); });
    scene.addEventListener('pointerdown', e => {
      if (e.target.closest('button, a')) return;
      const p = local(e);
      if (state === 'idle') begin(p.x, p.y);
      else if (state === 'open') { splash(p.x, p.y, .02); audio.drop(.6); }
    });

    // On their photo, the water follows the pointer
    let lx = -1e3, ly = 0, lt = 0, quietSince = performance.now();
    scene.addEventListener('pointermove', e => {
      if (state !== 'open' || e.pointerType === 'touch') return;
      const p = local(e), now = performance.now();
      if (Math.hypot(p.x - lx, p.y - ly) < 46 || now - lt < 70) return;
      lx = p.x; ly = p.y; lt = quietSince = now;
      pond.addDrop(p.x / scene.clientWidth, p.y / scene.clientHeight, .006);
    });

    // Now and then something touches the water on its own
    (function drip() {
      setTimeout(() => {
        if (state === 'idle' || state === 'open' && performance.now() - quietSince > 3000) {
          pond.addDrop(.08 + Math.random() * .84, .25 + Math.random() * .7, state === 'idle' ? .008 : .005);
        }
        drip();
      }, 2600 + Math.random() * 3200);
    })();
  }

  skipBtn.addEventListener('click', skip);

  // The pond goes quiet when it's scrolled away
  new IntersectionObserver(([e]) => audio.setAmbience(e.isIntersecting), { threshold: .15 }).observe(scene);
})();
