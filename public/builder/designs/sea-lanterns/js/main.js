(() => {
  const C = window.CONFIG;
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  /* If the lantern script fails to load on a poor connection, the invitation must still open */
  const Lanterns = window.Lanterns || { prepare: async () => {}, release() {}, still() {}, drain() {}, nudge() {}, tick() {} };
  const fine = matchMedia('(pointer: fine)').matches;
  const small = innerWidth < 760;
  if (reduce) document.documentElement.classList.add('reduced');
  scrollTo(0, 0);

  /* ---------- Words from config ---------- */
  const get = p => p.split('.').reduce((o, k) => (o ? o[k] : ''), C);
  $$('[data-t]').forEach(el => { el.textContent = get(el.dataset.t); });
  $$('[data-chars]').forEach(el => {
    const text = el.textContent; el.textContent = ''; el.setAttribute('aria-label', text);
    text.split(' ').forEach((w, i) => {
      if (i) el.append(' ');
      const word = document.createElement('span'); word.className = 'word'; word.setAttribute('aria-hidden', 'true');
      [...w].forEach(c => { const s = document.createElement('span'); s.className = 'ch'; s.textContent = c; word.append(s); });
      el.append(word);
    });
  });
  const to = new URLSearchParams(location.search).get('to');
  if (to) { const d = $('#dear'); d.textContent = `Dear ${to.slice(0, 40)},`; d.hidden = false; }

  /* Events */
  const maps = C.venue.map;
  $('#events').append(...C.events.map(e => {
    const a = document.createElement('article'); a.className = 'ev';
    a.innerHTML = `<div class="ev__art"><div class="ev__pic"><img src="assets/events/${e.id}.webp" alt="" loading="lazy" width="660" height="880"></div>
      <img class="ev__frame" src="assets/img/frame.webp" alt="" loading="lazy" width="820" height="1025"><i class="ev__sheen"></i></div>
      <h3></h3><p></p><a target="_blank" rel="noopener">See the route</a>`;
    $('.ev__pic img', a).alt = `Illustration of the couple at the ${e.title}`;
    $('h3', a).textContent = e.title;
    const p = $('p', a); [e.date, e.place || C.venue.name, e.time].forEach((l, i) => { if (i) p.append(document.createElement('br')); p.append(l); });
    $('a', a).href = e.map || maps;
    return a;
  }));
  $('#route').href = maps;
  $('#moon').href = C.instagram;
  $('#pearl').href = `https://wa.me/${C.rsvp.whatsapp}?text=${encodeURIComponent(C.rsvp.text)}`;
  $('#knowLead').textContent = C.know.lead;
  $('#closing').textContent = C.closing;
  $('#knowGrid').append(...C.know.items.map(k => {
    const d = document.createElement('div'); d.className = 'know__item';
    d.innerHTML = `<img src="assets/img/ic-${k.icon}.webp" alt="" loading="lazy"><h3></h3><p></p>`;
    $('h3', d).textContent = k.title; $('p', d).textContent = k.text; return d;
  }));
  const msg = $('#messageText');
  C.message.split(' ').forEach((w, i) => { if (i) msg.append(' '); const s = document.createElement('span'); s.className = 'w'; s.textContent = w; msg.append(s); });

  /* Photo reel */
  const reel = $('#reel'), dots = $('#reelDots');
  C.photos.forEach((p, i) => {
    const f = document.createElement('figure'); f.className = 'reel__item';
    const im = new Image(); im.src = `assets/photos/${p.src}.webp`; im.alt = p.alt; im.loading = 'lazy'; im.width = 880; im.height = 1100; f.append(im); reel.append(f);
    const b = document.createElement('button'); b.type = 'button'; b.setAttribute('aria-label', `Photo ${i + 1}`); b.addEventListener('click', () => { hold(); goTo(i); }); dots.append(b);
  });
  const items = $$('.reel__item', reel), dotBtns = $$('button', dots);
  let current = -1, autoplay = true;
  const hold = () => { autoplay = false; };
  const goTo = i => { const it = items[(i + items.length) % items.length]; reel.scrollTo({ left: it.offsetLeft - (reel.clientWidth - it.clientWidth) / 2, behavior: reduce ? 'auto' : 'smooth' }); };
  function onReel() {
    const mid = reel.scrollLeft + reel.clientWidth / 2; let best = 0, bd = 1e9;
    items.forEach((it, i) => {
      const c = it.offsetLeft + it.clientWidth / 2, d = c - mid;
      if (Math.abs(d) < bd) { bd = Math.abs(d); best = i; }
      if (!reduce) it.firstChild.style.transform = `translateX(${Math.max(-1, Math.min(1, d / it.clientWidth)) * -7}%)`;
    });
    if (best !== current) { current = best; dotBtns.forEach((b, i) => b.setAttribute('aria-current', i === best)); }
  }
  reel.addEventListener('scroll', onReel, { passive: true });
  ['pointerdown', 'wheel', 'touchstart'].forEach(e => reel.addEventListener(e, hold, { passive: true }));
  $('#reelPrev').addEventListener('click', () => { hold(); goTo(current - 1); });
  $('#reelNext').addEventListener('click', () => { hold(); goTo(current + 1); });
  requestAnimationFrame(onReel);

  /* ---------- Countdown ---------- */
  const clock = $('#clock'), target = new Date(C.weddingStart).getTime();
  const units = ['Days', 'Hours', 'Minutes', 'Seconds'].map(n => {
    const u = document.createElement('div'); u.className = 'unit'; u.innerHTML = `<b></b><small>${n}</small>`; clock.append(u); return { el: $('b', u), v: null };
  });
  function setUnit(u, v) {
    if (u.v === v) return;
    const old = u.v; u.v = v; u.el.textContent = '';
    [...v].forEach((c, i) => {
      const s = document.createElement('span'); s.textContent = c; u.el.append(s);
      if (old !== null && (old[i] !== c) && !reduce && window.gsap) gsap.fromTo(s, { yPercent: -35, opacity: .1 }, { yPercent: 0, opacity: 1, duration: .45, ease: 'power3.out' });
    });
  }
  function tickClock() {
    let left = Math.max(0, target - Date.now());
    if (left === 0) { $('#count h2').textContent = 'Today is the day'; clock.hidden = true; return; }
    const d = Math.floor(left / 864e5); left -= d * 864e5;
    const h = Math.floor(left / 36e5); left -= h * 36e5;
    const m = Math.floor(left / 6e4); left -= m * 6e4;
    const s = Math.floor(left / 1e3), pad = n => String(n).padStart(2, '0');
    [String(d), pad(h), pad(m), pad(s)].forEach((v, i) => setUnit(units[i], v));
    setTimeout(tickClock, 1000 - (Date.now() % 1000));
  }
  tickClock();

  /* ---------- Sound ---------- */
  const btn = $('#sound'), audio = $('#music');
  let soundOn = false;
  const setBtn = on => { soundOn = on; btn.classList.toggle('off', !on); btn.setAttribute('aria-label', on ? 'Pause music' : 'Play music'); };
  function playSound() {
    if (C.music) { audio.src = audio.src || C.music; audio.play().then(() => setBtn(true)).catch(() => setBtn(false)); return; }
    setBtn(Sound.play());
  }
  function pauseSound() { if (C.music) audio.pause(); else Sound.pause(); setBtn(false); }
  btn.addEventListener('click', () => (soundOn ? pauseSound() : playSound()));
  document.addEventListener('visibilitychange', () => {
    if (!soundOn) return;
    if (document.hidden) { C.music ? audio.pause() : Sound.pause(); } else { C.music ? audio.play() : Sound.play(); }
  });

  /* ---------- Motion ---------- */
  if (!window.gsap) { document.body.classList.remove('locked'); $('#cover').remove(); $('#names').style.visibility = 'visible'; return; }
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });
  gsap.defaults({ overwrite: 'auto' });

  let lenis = null;
  if (fine && !reduce && window.Lenis) {
    lenis = new Lenis({ lerp: .1 });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(t => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    lenis.stop();
  }

  /* Living layers */
  Lanterns.prepare().then(() => { if (reduce) Lanterns.still(); });
  if (!reduce) {
    GL.water($('#heroGL'), { src: 'assets/img/hero.webp', mask: 'assets/img/hero-mask.png', horizon: .446, amp: 1, width: small ? 1100 : 1456 });
    $$('[data-sea]').forEach(c => GL.water(c, { src: c.dataset.sea, horizon: +c.dataset.horizon, amp: 1.5, width: small ? 720 : 1024 }));
  } else { $$('#heroGL, [data-sea]').forEach(c => { c.style.display = 'none'; }); }
  let moonState = null;
  if (!reduce) GL.moon($('#moonGL'), 'assets/img/moon-map.jpg').then(s => { moonState = s; });
  else $('#moonGL').style.display = 'none';

  /* Petals in the first room: the same falling petals as Keerthy and Rosheel's invite */
  const petals = (() => {
    const cv = $('#petals'), g = cv.getContext('2d'); let W, H, list = [], live = false;
    const COLS = ['#F6A21E', '#EE7A1B', '#F7C948', '#E4375F', '#F58AA0'];
    const make = top => ({ x: Math.random() * W, y: top ? -20 : Math.random() * H, s: 5 + Math.random() * 8, r: Math.random() * 6.28, vr: (Math.random() - .5) * .05, vy: .5 + Math.random() * .8, ph: Math.random() * 6.28, c: COLS[Math.random() * COLS.length | 0] });
    const size = () => { const D = Math.min(2, devicePixelRatio || 1); W = cv.clientWidth; H = cv.clientHeight; cv.width = W * D; cv.height = H * D; g.setTransform(D, 0, 0, D, 0, 0); };
    function step(dt) {
      g.clearRect(0, 0, W, H);
      for (const p of list) {
        p.ph += .04 * dt; p.r += p.vr * dt; p.y += p.vy * dt; p.x += Math.sin(p.ph * .5) * .5 * dt;
        if (p.y > H + 20) Object.assign(p, make(true));
        g.save(); g.translate(p.x, p.y); g.rotate(p.r); g.scale(Math.cos(p.ph) * .9 + .1, 1); g.fillStyle = p.c; g.globalAlpha = .9;
        const s = p.s; g.beginPath(); g.moveTo(0, -s); g.bezierCurveTo(s * .95, -s * .55, s * .55, s * .85, 0, s); g.bezierCurveTo(-s * .55, s * .85, -s * .95, -s * .55, 0, -s); g.fill(); g.restore();
      }
    }
    return {
      on() { if (reduce) return; if (!list.length) { size(); list = Array.from({ length: small ? 22 : 36 }, () => make(false)); } live = true; },
      off() { live = false; },
      tick(dt) { if (live) step(dt); },
      resize() { if (list.length) size(); },
    };
  })();

  /* One clock for everything that moves on its own */
  let last = 0;
  gsap.ticker.add(time => {
    const dt = Math.min(.05, time - last) || .016; last = time;
    Lanterns.tick(dt, time); GL.tick(time); petals.tick(dt * 60);
  });

  /* Room geometry */
  const rooms = $$('.room').map(el => ({ el, view: $('.room__view', el), box: $('.room__box', el), ring: el.id === 'ring', D: 0 }));
  function layoutRooms() {
    rooms.forEach(r => {
      const W = r.view.clientWidth, H = r.view.clientHeight, portrait = H > W;
      const P = Math.max(W, H) * (portrait ? 1 : .92), s = portrait ? .64 : .5, D = P * (1 / s - 1);
      const aspect = r.ring ? 760 / 1140 : 671 / 943;
      const FH = r.ring ? Math.min(H * .82, W * 1.5 / aspect) : Math.min(H * .63, W * .92 / aspect);
      const ZF = D * .56;
      r.view.style.perspective = `${P}px`; r.D = D; r.FH = FH;
      const st = r.el.style;
      st.setProperty('--D', `${D}px`); st.setProperty('--FH', `${FH}px`); st.setProperty('--FW', `${FH * aspect}px`); st.setProperty('--ZF', `${ZF}px`);
      st.setProperty('--ZS', `${-ZF + FH * aspect * .23}px`);
    });
  }
  layoutRooms();
  addEventListener('resize', () => { layoutRooms(); petals.resize(); });

  const rise = (el, vars = {}) => gsap.from(el, { y: 26, autoAlpha: 0, duration: 1.05, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 90%', once: true }, ...vars });

  function buildScenes() {
    if (reduce) return;

    /* Hero: the camera pushes toward the groom while the curtain climbs */
    gsap.timeline({ scrollTrigger: { trigger: '.hero-run', start: 'top top', end: 'bottom bottom', scrub: .7 } })
      .to('.hero__art', { scale: 1.2, ease: 'none', duration: 1 }, 0)
      .to('#names', { y: () => -innerHeight * .2, autoAlpha: 0, ease: 'power1.in', duration: .34 }, 0)
      .to('#cue', { autoAlpha: 0, duration: .08 }, 0);
    gsap.fromTo('.curtain__p', { yPercent: 26 }, { yPercent: 0, ease: 'none', scrollTrigger: { trigger: '#invite', start: 'top bottom', end: 'top top', scrub: .6 } });

    /* Lanterns float off once the invitation is being read, and come back if you scroll up */
    ScrollTrigger.create({ trigger: '#invite', start: 'top 12%', onEnter: () => Lanterns.drain(true), onLeaveBack: () => Lanterns.drain(false) });
    ScrollTrigger.create({ start: 0, end: 'max', onUpdate: s => Lanterns.nudge(s.getVelocity() * .22) });

    /* Plain reveals */
    $$('[data-rise]').forEach(el => rise(el));
    $$('[data-chars]').forEach(el => {
      if (el.closest('#names')) return;
      gsap.from($$('.ch', el), { yPercent: 55, autoAlpha: 0, rotation: 5, duration: 1, stagger: .035, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 88%', once: true } });
    });
    $$('[data-rule]').forEach(el => gsap.from(el, { scaleX: 0, duration: 1, ease: 'power2.out', scrollTrigger: { trigger: el, start: 'top 90%', once: true } }));
    gsap.fromTo('#cross', { '--r': '0%', autoAlpha: .2 }, { '--r': '130%', autoAlpha: 1, duration: 2.2, ease: 'sine.inOut', scrollTrigger: { trigger: '#cross', start: 'top 82%', once: true } });

    /* Event frames turn in like coins, then the gold catches the light */
    $$('.ev').forEach((ev, i) => {
      const art = $('.ev__art', ev);
      gsap.fromTo(art, { rotationY: i % 2 ? -72 : 72, scale: .82, autoAlpha: 0 }, { rotationY: 0, scale: 1, autoAlpha: 1, duration: 1.35, ease: 'power3.out', scrollTrigger: { trigger: ev, start: 'top 88%', once: true, onEnter: () => ev.classList.add('lit') } });
      gsap.from([...ev.children].slice(1), { y: 16, autoAlpha: 0, duration: .9, stagger: .08, delay: .35, ease: 'power2.out', scrollTrigger: { trigger: ev, start: 'top 80%', once: true } });
      gsap.fromTo($('.ev__pic img', ev), { yPercent: -4 }, { yPercent: 4, ease: 'none', scrollTrigger: { trigger: ev, start: 'top bottom', end: 'bottom top', scrub: true } });
      if (fine) {
        const ry = gsap.quickTo(art, 'rotationY', { duration: .6, ease: 'power3' }), rx = gsap.quickTo(art, 'rotationX', { duration: .6, ease: 'power3' });
        ev.addEventListener('pointermove', e => { const b = ev.getBoundingClientRect(); ry(((e.clientX - b.left) / b.width - .5) * 16); rx(((e.clientY - b.top) / b.height - .5) * -10); });
        ev.addEventListener('pointerleave', () => { ry(0); rx(0); });
      }
    });

    /* The wax seal is pressed down as it arrives */
    gsap.fromTo('.seal__disc', { scale: 1.7, rotation: -14, autoAlpha: 0 }, { scale: 1, rotation: 0, autoAlpha: 1, ease: 'power2.in', scrollTrigger: { trigger: '#route', start: 'top 92%', end: 'top 42%', scrub: .5 } });
    gsap.from('.seal__text', { y: 26, autoAlpha: 0, ease: 'power2.out', scrollTrigger: { trigger: '.seal__text', start: 'top 92%', end: 'top 72%', scrub: .6 } });

    /* Rooms: walk in */
    rooms.forEach(r => {
      const tl = gsap.timeline({ scrollTrigger: { trigger: r.el, start: 'top top', end: 'bottom bottom', scrub: .8, invalidateOnRefresh: true } });
      tl.fromTo(r.box, { z: 0 }, { z: () => r.D * .42, ease: 'none', duration: 1 }, 0);
      const title = $('.room__title', r.el);
      gsap.from(title.children, { y: 34, autoAlpha: 0, duration: 1.1, stagger: .12, ease: 'power3.out', scrollTrigger: { trigger: r.el, start: 'top 55%', once: true } });
      if (r.ring) {
        // Rope runs at a slight angle, so the pull follows it: the free end slides behind the groom's hands
        const dy = () => r.FH * .058;
        tl.fromTo('#pull', { y: 0, x: 0 }, { y: dy, x: () => -dy() * .148, ease: 'power2.inOut', duration: .62 }, .16);
      }
    });
    ScrollTrigger.create({ trigger: '#meet', start: 'top bottom', end: 'bottom top', onToggle: s => (s.isActive ? petals.on() : petals.off()) });

    /* Message: the sentence warms up as you read it */
    gsap.fromTo($$('.w', msg), { opacity: .22 }, { opacity: 1, stagger: .05, ease: 'none', scrollTrigger: { trigger: msg, start: 'top 82%', end: 'bottom 52%', scrub: .5 } });
    gsap.from(items, { y: 50, scale: .94, autoAlpha: 0, duration: 1.1, stagger: .09, ease: 'power3.out', scrollTrigger: { trigger: reel, start: 'top 84%', once: true } });
    ScrollTrigger.create({ trigger: reel, start: 'top 80%', end: 'bottom 20%', onToggle: s => { reel.dataset.live = s.isActive ? '1' : ''; } });
    setInterval(() => { if (autoplay && reel.dataset.live === '1') goTo(current + 1); }, 3800);

    /* Shell: it opens, and the pearl comes out */
    gsap.timeline({ scrollTrigger: { trigger: '#shell', start: 'top 80%', end: 'center 56%', scrub: .7 } })
      .fromTo('.shell__hinge', { rotationX: 78 }, { rotationX: 0, ease: 'power2.out', duration: 1 }, 0)
      .fromTo('.shell__words', { autoAlpha: 0 }, { autoAlpha: 1, duration: .35 }, .62)
      .fromTo('#pearl', { scale: 0 }, { scale: 1, ease: 'back.out(2.2)', duration: .5 }, .35);

    /* Things to know */
    gsap.from('.know__item', { y: 34, autoAlpha: 0, duration: 1, stagger: .12, ease: 'power3.out', scrollTrigger: { trigger: '#knowGrid', start: 'top 84%', once: true } });

    /* The moon rises and turns as you scroll */
    gsap.fromTo('#moon', { y: 140, scale: .78 }, { y: 0, scale: 1, ease: 'power1.out', scrollTrigger: { trigger: '#moon', start: 'top 100%', end: 'center 54%', scrub: .7 } });
    ScrollTrigger.create({ trigger: '#moon', start: 'top bottom', end: 'bottom top', onUpdate: s => { if (moonState) moonState.extra = s.progress * .16; } });

    rise('.clock', { y: 20 });
  }

  /* ---------- Opening: light the lantern ---------- */
  function revealNames() {
    gsap.set('#names', { visibility: 'visible' });
    const ch = $$('#names .ch');
    gsap.fromTo(ch, { yPercent: 70, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: 1.1, stagger: .05, ease: 'power3.out' });
    gsap.fromTo('#names .w, #names .date', { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 1, delay: .6, stagger: .2, ease: 'power2.out' });
    gsap.to('#cue', { opacity: 1, duration: 1, delay: 1.6 });
  }
  function unlock() {
    document.body.classList.remove('locked');
    if (lenis) lenis.start();
    btn.hidden = false;
    buildScenes();
    ScrollTrigger.refresh();
  }
  let lit = false;
  function light(skip) {
    if (lit) return; lit = true;
    if (!skip) playSound();
    if (reduce || skip) {
      gsap.set('#cover', { display: 'none' }); if (!reduce) Lanterns.release(); revealNames(); unlock(); return;
    }
    Sound.spark();
    const lamp = $('#light');
    $$('.halo', lamp).forEach(h => { h.style.animation = 'none'; });
    gsap.timeline()
      .to('#light img', { filter: 'brightness(1) saturate(1)', duration: 1, ease: 'power2.out' }, 0)
      .to('.flame', { opacity: 1, scale: 1, duration: .5, ease: 'back.out(3)' }, 0)
      .to('.halo', { opacity: 1, scale: 1.15, duration: 1.1, ease: 'power2.out' }, 0)
      .to('.cover__hint, .cover__top', { autoAlpha: 0, duration: .55 }, .1)
      .to(lamp, { y: () => -innerHeight * 1.05, scale: .34, duration: 3.6, ease: 'power1.in' }, .75)
      .to(lamp, { x: 26, rotation: 5, duration: 1.8, ease: 'sine.inOut', yoyo: true, repeat: 1 }, .75)
      .to('.dusk, .stars', { autoAlpha: 0, duration: 2.6, ease: 'sine.inOut' }, 1)
      .add(() => Lanterns.release(), 1.05)
      .add(revealNames, 2.3)
      .add(unlock, 3.1)
      .set('#cover', { display: 'none' }, 4.5);
  }
  $('#light').addEventListener('click', () => light(false));
  if (location.hash === '#open') light(true);

  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => ScrollTrigger.refresh());
  addEventListener('load', () => ScrollTrigger.refresh());
})();
