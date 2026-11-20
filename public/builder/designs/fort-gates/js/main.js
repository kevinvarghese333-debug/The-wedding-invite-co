/* Aditya & Meher: the fort gates.
   The opening is a pure function of scroll: the gates swing open, then the camera walks through the arch
   into the courtyard where the couple is dancing. Scrolling back up closes them again.
   At the end of the page the same gates swing shut over the countdown. */
(() => {
  'use strict';
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });

  const C = window.INVITE, L = window.LAYOUT;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const root = document.documentElement;
  const reduce = root.classList.contains('reduced');
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const mix = (a, b, t) => a + (b - a) * t;
  const smooth = (a, b, v) => { const t = clamp((v - a) / (b - a)); return t * t * (3 - 2 * t); };
  const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  scrollTo(0, 0);

  /* ---------- words ---------- */

  for (const [k, v] of Object.entries(C.colours)) root.style.setProperty('--' + k, v);
  const alias = { b: 'blessing', p: 'partner', count: 'countdown' };
  const pick = path => {
    if (path === 'one' || path === 'oneFull') return C.couple.one.first;
    if (path === 'two' || path === 'twoFull') return C.couple.two.first;
    if (path === 'joiner') return C.couple.joiner;
    return path.split('.').reduce((o, k) => o?.[alias[k] || k], C);
  };
  $$('[data-t]').forEach(el => { el.textContent = pick(el.dataset.t); });
  $$('[data-lines]').forEach(el => el.replaceChildren(...pick(el.dataset.lines).map(l => Object.assign(document.createElement('span'), { textContent: l }))));
  // letters in their own boxes, so each can arrive on its own
  $$('[data-split]').forEach(el => {
    const text = pick(el.dataset.split);
    el.setAttribute('aria-label', text);
    el.innerHTML = text.split(' ').map(w => `<span class="w" aria-hidden="true">${[...w].map(c => `<span class="ch">${c}</span>`).join('')}</span>`).join(' ');
  });
  $('.gate__names').setAttribute('aria-label', `${C.couple.one.first} ${C.couple.joiner} ${C.couple.two.first}`);
  document.title = `${C.couple.one.first} weds ${C.couple.two.first}`;

  const fmt = (iso, o) => new Intl.DateTimeFormat('en-GB', { timeZone: C.wedding.timezone, ...o }).format(new Date(iso));
  const time = iso => fmt(iso, { hour: 'numeric', minute: '2-digit', hour12: true }).replace(':00', '').toUpperCase();
  const orn = '<svg class="card__orn" viewBox="0 0 70 12" aria-hidden="true"><path pathLength="1" d="M2 6H26M44 6H68M30 6C32 1 38 1 35 6C32 11 38 11 40 6"/></svg>';
  $('#cards').innerHTML = C.events.map((e, i) => `
    <li class="card" style="--ar:${L.frame[0] / L.frame[1]};--d:${(i * .7).toFixed(1)}s">
      <div class="card__fill"></div>
      <img class="card__frame" src="assets/frame.webp" alt="" loading="lazy">
      <div class="card__in">
        <h3>${e.name}</h3>
        <p class="card__day">${fmt(e.start, { weekday: 'long' })}</p>
        <p class="card__date"><time datetime="${e.start}">${fmt(e.start, { day: 'numeric', month: 'long', year: 'numeric' })}</time></p>
        ${orn}
        <p>${time(e.start)} onwards</p>
        <p>${e.venue}, ${e.place}</p>
        ${e.dress ? `<p class="card__dress">Dress code: ${e.dress}</p>` : ''}
        <a href="${e.map}" target="_blank" rel="noopener">See the route</a>
      </div>
    </li>`).join('');

  $('#knowList').innerHTML = C.know.items.map(i => `
    <li data-rise><svg aria-hidden="true"><use href="#i-${i.icon}"/></svg><h3>${i.title}</h3><p>${i.text}</p></li>`).join('');

  // personal link: ?to=The Mehta Family
  const guest = (new URLSearchParams(location.search).get('to') || '').trim().slice(0, 40);
  if (guest) { const t = $('#gateTo'); t.textContent = `Dear ${guest},`; t.hidden = false; }
  const wa = C.rsvp.message.replace('{guest}', guest ? `This is ${guest},` : '').replace('{one}', C.couple.one.first).replace('{two}', C.couple.two.first).replace(/\s+/g, ' ').trim();
  $('#venueSeal').href = C.venue.map;
  $('#rsvpSeal').href = `https://wa.me/${C.rsvp.whatsapp}?text=${encodeURIComponent(wa)}`;
  $('#followSeal').href = C.follow.instagram;

  /* ---------- countdown ---------- */

  const clock = $('#clock'), target = new Date(C.wedding.start).getTime();
  clock.innerHTML = ['days', 'hours', 'mins', 'secs'].map(l => `<span><b>00</b><small>${l}</small></span>`).join('');
  const digits = $$('b', clock);
  const tick = () => {
    const left = target - Date.now();
    if (left <= 0) { $('.count__title').textContent = C.countdown.done; clock.hidden = true; return; }
    const s = Math.floor(left / 1000);
    [Math.floor(s / 86400), Math.floor(s / 3600) % 24, Math.floor(s / 60) % 60, s % 60].forEach((v, i) => { digits[i].textContent = String(v).padStart(2, '0'); });
  };
  tick(); setInterval(tick, 1000);

  /* ---------- music, only if a file is named in config ---------- */

  if (C.music) {
    const b = $('#music'), a = new Audio(C.music); a.loop = true; b.hidden = false;
    b.addEventListener('click', () => { const on = a.paused; on ? a.play() : a.pause(); b.setAttribute('aria-pressed', on); b.setAttribute('aria-label', on ? 'Pause music' : 'Play music'); });
  }

  /* ---------- falling rose petals ---------- */

  const petalImgs = Array.from({ length: L.petals }, (_, i) => Object.assign(new Image(), { src: `assets/petal-${i}.webp` }));
  class Petals {
    constructor(canvas, count) { this.c = canvas; this.x = canvas.getContext('2d'); this.n = count; this.on = false; this.list = []; }
    size() {
      const d = Math.min(devicePixelRatio || 1, 2), w = this.c.clientWidth, h = this.c.clientHeight;
      this.c.width = w * d; this.c.height = h * d; this.x.setTransform(d, 0, 0, d, 0, 0); this.w = w; this.h = h;
      const n = Math.round(this.n * clamp(w / 900, .55, 1));
      while (this.list.length < n) this.list.push(this.spawn(true));
      this.list.length = n;
    }
    spawn(any) {
      const s = 12 + Math.random() * 16;
      return { img: petalImgs[Math.floor(Math.random() * petalImgs.length)], s, x: Math.random() * (this.w || innerWidth), y: any ? Math.random() * (this.h || innerHeight) : -40,
        vy: 26 + Math.random() * 36 + s, sway: 20 + Math.random() * 40, ph: Math.random() * 6.3, f: .6 + Math.random() * 1.4, r: Math.random() * 6.3, vr: (Math.random() - .5) * 2 };
    }
    frame(dt, t) {
      const { x } = this; x.clearRect(0, 0, this.w, this.h);
      for (const p of this.list) {
        p.y += p.vy * dt; p.r += p.vr * dt;
        if (p.y > this.h + 40) Object.assign(p, this.spawn(false));
        const px = p.x + Math.sin(t * p.f + p.ph) * p.sway, flip = Math.cos(t * p.f * 1.7 + p.ph);
        if (!p.img.complete || !p.img.naturalWidth) continue;
        const ar = p.img.naturalHeight / p.img.naturalWidth;
        x.save(); x.translate(px, p.y); x.rotate(p.r); x.scale(1, .35 + .65 * Math.abs(flip));
        x.globalAlpha = .92; x.drawImage(p.img, -p.s / 2, -p.s * ar / 2, p.s, p.s * ar); x.restore();
      }
    }
  }
  const petals = [new Petals($('#petals'), 34), new Petals($('#petals2'), 22)];
  const watch = (el, p) => new IntersectionObserver(([e]) => { p.on = e.isIntersecting; }).observe(el);
  watch($('#gate'), petals[0]); watch($('#finale'), petals[1]);
  if (!reduce) {
    let last = performance.now();
    gsap.ticker.add(() => {
      const now = performance.now(), dt = Math.min(.05, (now - last) / 1000); last = now;
      petals.forEach(p => p.on && p.frame(dt, now / 1000));
    });
  }

  /* ---------- the fort: one geometry for the opening and the finale ---------- */

  class Fort {
    constructor(pin, { push }) {
      this.pin = pin; this.push = push;
      this.world = $('.world', pin); this.box = $('.fortbox', pin); this.view = $('.view', pin); this.viewIn = $('.view__in', pin);
      this.doors = $('.doors', pin); this.dl = $('.door--l', pin); this.dr = $('.door--r', pin);
      this.shades = $$('.door__shade', pin); this.light = $('.view__light', pin);
      this.court = $('.courtyard', pin); this.dancers = $('.dancers', pin);
      this.fol = $$('.foliage__half', pin);
    }
    measure() {
      const W = this.W = this.pin.clientWidth, H = this.H = this.pin.clientHeight, f = L.fort, fa = f.h / f.w, tall = W < H * .9;
      const [vx0, vy0, vx1, vy1] = f.view, vw = vx1 - vx0;
      // portrait: the arch takes about half the width; landscape: the whole gatehouse fits
      let fw = tall ? Math.max(W * 1.1, W * .5 / vw) : Math.min(W, H * .62 / fa);
      fw = Math.min(fw, H * (tall ? .64 : .62) / fa);
      const fh = fw * fa, top = H - fh, left = (W - fw) / 2;
      Object.assign(this, { fw, fh, top, left, tall });
      Object.assign(this.box.style, { width: fw + 'px', height: fh + 'px', left: left + 'px', top: top + 'px', bottom: 'auto' });
      const put = (el, [x0, y0, x1, y1]) => Object.assign(el.style, { left: x0 * fw + 'px', top: y0 * fh + 'px', width: (x1 - x0) * fw + 'px', height: (y1 - y0) * fh + 'px' });
      put(this.view, f.view); put(this.doors, f.doors);
      const half = f.doors[4];
      this.dl.style.width = half * 100 + '%'; this.dr.style.width = (1 - half) * 100 + '%';
      // the arch on screen
      this.ax = left + (vx0 + vx1) / 2 * fw; this.aTop = top + vy0 * fh; this.aBot = Math.min(H, top + vy1 * fh); this.aw = vw * fw; this.ah = this.aBot - this.aTop;
      // walk-in: zoom about the middle of the arch's straight part until it covers the screen
      const it = vy0 + (vy1 - vy0) * .4, oyr = (it + vy1) / 2;
      this.ox = W / 2; this.oy = top + oyr * fh;
      const sEnd = Math.max(W / (vw * fw * .86), this.oy / ((oyr - it) * fh), (H - this.oy) / ((vy1 - oyr) * fh));
      this.sEnd = sEnd * 1.12;
      this.world.style.transformOrigin = `${this.ox}px ${this.oy}px`;
      this.vLeft = left + vx0 * fw; this.vTop = top + vy0 * fh;
      // courtyard: at the end it covers the screen
      const car = 1500 / (L.courtyardH || 2667);
      this.cw = Math.max(W, H * car); this.ch = this.cw / car;
      this.k0 = Math.max(this.aw / this.cw * 1.25, this.ah * 1.5 / this.ch);
      if (!this.push) { Object.assign(this.viewIn.style, { inset: '0', width: '100%', height: '100%' }); return; }
      Object.assign(this.viewIn.style, { width: this.cw + 'px', height: this.ch + 'px', left: '0', top: '0', transformOrigin: '0 0' });
      const dar = L.couple[0] / L.couple[1];
      this.dh0 = this.ah * .6; this.dh1 = H * (tall ? .5 : .56);
      Object.assign(this.dancers.style, { height: 'auto', bottom: 'auto', left: '0', top: '0', width: this.dh0 * dar + 'px', transform: 'none' });
      this.dancers.firstElementChild.style.height = 'auto'; this.dancers.firstElementChild.style.width = '100%';
      this.dar = dar;
    }
    // something drawn in screen space at (x, y) with screen size w x h, put inside the zoomed view
    toView(S, x, y) { return [(this.ox + (x - this.ox) / S) - this.vLeft, (this.oy + (y - this.oy) / S) - this.vTop]; }
    render(open, walk) {
      const ang = 106 * ease(open);
      this.dl.style.transform = `rotateY(${-ang}deg)`; this.dr.style.transform = `rotateY(${ang}deg)`;
      this.shades.forEach(s => { s.style.opacity = (.62 * Math.sin(Math.min(ang, 90) / 90 * Math.PI / 2)).toFixed(3); });
      if (!this.push) return;
      const w = ease(walk), S = Math.pow(this.sEnd, w);
      this.world.style.transform = `scale(${S})`;
      this.light.style.opacity = (open * .9 * (1 - w)).toFixed(3);
      // courtyard: from a window view of the pool to filling the screen
      // ...but never smaller than the part of the arch that is on screen, so no gap ever shows
      const rt = Math.max(0, this.oy + (this.aTop - this.oy) * S), rb = Math.min(this.H, this.oy + (this.aBot - this.oy) * S);
      const rw = Math.min(this.W, this.aw * S);
      const k = Math.max(mix(this.k0, 1, w), rw * 1.02 / this.cw, (rb - rt) * 1.02 / this.ch);
      let top = mix(this.oy - this.ch * this.k0 * .52, this.H / 2 - this.ch * k / 2, w);
      top = Math.min(top, rt); top = Math.max(top, rb - this.ch * k);
      const [cx, cyy] = this.toView(S, this.W / 2 - this.cw * k / 2, top);
      this.viewIn.style.transform = `translate(${cx}px,${cyy}px) scale(${k / S})`;
      // the dancers: feet on the courtyard floor, growing as you walk up to them
      const dh = mix(this.dh0, this.dh1, w), dw = dh * this.dar, foot = mix(this.aBot - this.ah * .05, this.H * .93, w);
      const [dx, dy] = this.toView(S, this.W / 2 - dw / 2, foot - dh);
      // the dancers live inside viewIn, so undo its transform too
      const vk = k / S;
      this.dancers.style.transform = `translate(${(dx - cx) / vk}px,${(dy - cyy) / vk}px) scale(${dh / this.dh0 / k})`;
      this.dancers.style.transformOrigin = '0 0';
      $('.fort', this.pin).style.opacity = (1 - smooth(.86, .97, walk)).toFixed(3);
      this.fol.forEach((el, i) => { const s = i ? 1 : -1; el.style.transform = `translateX(${s * w * 70}%) scale(${1 + w * .5})`; el.style.transformOrigin = i ? '0% 100%' : '100% 100%'; });
    }
  }

  const gate = new Fort($('.gate__pin'), { push: true });
  const end = new Fort($('.finale__pin'), { push: false });
  const words = $('.gate__words'), names = $('.gate__names'), tag = $('.gate__tag'), haze = $('.gate__haze'), sky = $('.gate__sky');

  let gateP = 0, endP = 0;
  function layout() {
    gate.measure(); end.measure(); petals.forEach(p => p.size());
    // names centred in the sky above the battlements
    const skyH = gate.top + gate.fh * .16;
    words.style.top = Math.max(18, (skyH - words.offsetHeight) / 2) + 'px';
    const c = $('#count'); c.style.top = Math.max(18, (end.top + end.fh * .16 - c.offsetHeight) / 2) + 'px';
    drawGate(gateP); drawEnd(endP);
  }
  function drawGate(p) {
    gateP = p;
    const open = smooth(.03, .4, p), walk = smooth(.3, .88, p);
    gate.render(open, walk);
    $('#cue').style.opacity = 1 - smooth(0, .04, p);
    haze.style.opacity = 1 - walk;
    sky.style.transform = `scale(${1 + walk * .2})`;
    // names drift up with the scroll, then settle small at the top over the courtyard
    const wt = gate.top + gate.fh * .16, nh = words.offsetHeight, y0 = parseFloat(words.style.top) || 0;
    const sc = mix(1, gate.tall ? .7 : .62, ease(walk));
    const y = mix(0, Math.max(14, gate.H * .05) - y0 - nh * (1 - sc) / 2, ease(walk)) - smooth(0, .3, p) * gate.H * .03;
    words.style.transform = `translateY(${y}px) scale(${sc})`;
    // step aside while the stone wall slides past behind them, return over the courtyard sky
    words.style.opacity = (1 - smooth(.04, .2, walk) + smooth(.5, .72, walk)).toFixed(3);
    tag.style.opacity = smooth(.82, .96, p);
    tag.style.transform = `translateY(${(1 - smooth(.82, .96, p)) * 14}px)`;
  }
  function drawEnd(p) { endP = p; end.render(1 - smooth(.25, .85, p), 0); }

  /* ---------- the opening, before any scroll: sky, fort rising, names tilting upright ---------- */

  function intro() {
    if (reduce) return;
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl.from(sky, { opacity: 0, duration: 1.6, ease: 'power1.out' }, 0)
      .from('#fortbox', { yPercent: 16, scale: .9, transformOrigin: '50% 100%', duration: 1.8 }, .15)
      .from($$('.gate__names .ch'), { yPercent: 70, rotate: (i) => (i % 2 ? 1 : -1) * 22, opacity: 0, duration: 1.1, stagger: .06, transformOrigin: '50% 100%' }, .55)
      .from('.gate .foliage__half--l', { xPercent: -30, yPercent: 30, duration: 1.4 }, .4)
      .from('.gate .foliage__half--r', { xPercent: 30, yPercent: 30, duration: 1.4 }, .4)
      .from('#cue', { opacity: 0, y: 10, duration: .8 }, 1.9);
  }

  /* ---------- scroll ---------- */

  let lenis;
  if (!reduce && window.Lenis) {
    lenis = window.__lenis = new Lenis({ lerp: .1 });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(t => lenis.raf(t * 1000)); gsap.ticker.lagSmoothing(0);
  }

  if (reduce) { drawGate(.3); drawEnd(0); }
  else {
    ScrollTrigger.create({ trigger: '#gate', start: 'top top', end: 'bottom bottom', onUpdate: s => drawGate(s.progress) });
    ScrollTrigger.create({ trigger: '#finale', start: 'top top', end: 'bottom bottom', onUpdate: s => drawEnd(s.progress) });
    // the countdown arrives as the finale slides in
    gsap.from('#count > *', { y: 40, opacity: 0, stagger: .12, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: '#finale', start: 'top 60%' } });
  }

  if (!reduce) {
    // generic rise: words float up out of a soft blur
    ScrollTrigger.batch('[data-rise]', {
      start: 'top 88%', once: true,
      onEnter: els => gsap.fromTo(els, { y: 34, opacity: 0, filter: 'blur(6px)' }, { y: 0, opacity: 1, filter: 'blur(0px)', duration: 1.1, ease: 'power3.out', stagger: .09, clearProps: 'filter' })
    });
    // names in the invitation: letters flip up one by one
    $$('.bigname').forEach(el => gsap.from($$('.ch', el), { yPercent: 90, rotateX: -80, opacity: 0, duration: .9, ease: 'back.out(1.6)', stagger: .07, transformOrigin: '50% 100% -20px', scrollTrigger: { trigger: el, start: 'top 86%' } }));
    // the gold arch draws itself as you read down
    // apex first, down the curves, then the pillars run down the page as you read
    $$('.archway__top path').forEach(p => {
      gsap.set(p, { strokeDasharray: 1, strokeDashoffset: 1 });
      gsap.to(p, { strokeDashoffset: 0, ease: 'none', scrollTrigger: { trigger: '.archway', start: 'top 80%', end: 'top 25%', scrub: .5 } });
    });
    gsap.from('.archway__top circle', { scale: 0, transformOrigin: '50% 50%', duration: .8, ease: 'back.out(3)', scrollTrigger: { trigger: '.archway', start: 'top 80%' } });
    gsap.fromTo('.archway__side', { scaleY: 0 }, { scaleY: 1, ease: 'none', scrollTrigger: { trigger: '.archway', start: 'top 25%', end: 'bottom bottom', scrub: .5 } });
    $$('[data-draw] path').forEach(p => {
      gsap.set(p, { strokeDasharray: 1, strokeDashoffset: 1 });
      gsap.to(p, { strokeDashoffset: 0, duration: 1.6, ease: 'power2.inOut', scrollTrigger: { trigger: p, start: 'top 88%' } });
    });
    gsap.fromTo('.ganesha', { scale: .6, rotate: -10, opacity: 0 }, { scale: 1, rotate: 0, opacity: 1, duration: 1.6, ease: 'elastic.out(1, .6)', scrollTrigger: { trigger: '.ganesha', start: 'top 88%' } });
    gsap.to('.ganesha', { filter: 'drop-shadow(0 0 30px rgba(243,220,156,.65))', duration: 2.2, yoyo: true, repeat: -1, ease: 'sine.inOut' });

    // event cards swing up like opening windows, then float at different speeds
    ScrollTrigger.batch('.card', {
      start: 'top 90%', once: true,
      onEnter: els => els.forEach((el, i) => {
        const tl = gsap.timeline({ delay: i * .12 });
        tl.fromTo(el, { rotateX: 38, y: 90, opacity: 0, transformOrigin: '50% 100%' }, { rotateX: 0, y: 0, opacity: 1, duration: 1.2, ease: 'power3.out' })
          .from($$('.card__in > *', el), { y: 16, opacity: 0, duration: .7, stagger: .07, ease: 'power2.out' }, .45)
          .fromTo($('.card__orn path', el), { strokeDasharray: 1, strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1 }, .8);
      })
    });
    $$('.card').forEach((el, i) => gsap.to(el, { yPercent: (i % 3 - 1) * -6, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true } }));

    // rotating seals also swell as they come into view
    $$('.seal').forEach(s => gsap.fromTo(s, { scale: .7 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: s, start: 'top bottom', end: 'center 55%', scrub: true } }));

    // the wedding elephant walks across while you read about the couple
    const el = $('#elephant');
    ScrollTrigger.create({
      trigger: '#parade', start: 'top bottom', end: 'bottom top',
      onUpdate: s => {
        const W = el.parentElement.clientWidth, ew = el.offsetWidth, p = s.progress;
        const x = mix(-ew * .9, W - ew * .1, p), step = p * 26 * Math.PI;
        el.style.transform = `translate(${x}px, ${-Math.abs(Math.sin(step)) * 5}px) rotate(${Math.sin(step) * .9}deg)`;
      }
    });

    // know: icons draw themselves
    ScrollTrigger.batch('.know li', {
      start: 'top 88%', once: true,
      onEnter: els => els.forEach((li, i) => gsap.to($('svg', li), { strokeDashoffset: 0, duration: 1.6, delay: .2 + i * .12, ease: 'power2.inOut' }))
    });
    $$('.know svg').forEach(s => { s.style.strokeDasharray = 1; s.style.strokeDashoffset = 1; });

    // jharokha rises past you, its window glowing
    gsap.fromTo('#jharokha', { y: 90 }, { y: -30, ease: 'none', scrollTrigger: { trigger: '#follow', start: 'top bottom', end: 'bottom top', scrub: true } });
    gsap.to('#jGlow', { opacity: .72, scale: .97, duration: 1.3, yoyo: true, repeat: -1, ease: 'sine.inOut' });
  }

  /* ---------- jharokha geometry ---------- */
  {
    const [x0, y0, x1, y1] = L.jharokha.window, g = $('#jGlow'), s = $('#followSeal');
    Object.assign(g.style, { left: x0 * 100 + '%', top: y0 * 100 + '%', width: (x1 - x0) * 100 + '%', height: (y1 - y0) * 100 + '%' });
    Object.assign(s.style, { left: (x0 + x1) / 2 * 100 + '%', top: (y0 + (y1 - y0) * .58) * 100 + '%' });
  }

  /* ---------- gallery ---------- */
  {
    const list = $('#slides'), dots = $('#dots');
    list.innerHTML = C.gallery.photos.map((p, i) => `<li class="slide" aria-roledescription="slide" aria-label="${i + 1} of ${C.gallery.photos.length}"><div class="slide__frame"><img src="${p.src}" alt="${p.alt}" loading="lazy"></div></li>`).join('');
    dots.innerHTML = C.gallery.photos.map((_, i) => `<button type="button" role="tab" aria-label="Photo ${i + 1}"></button>`).join('');
    const slides = $$('.slide', list), btns = $$('button', dots);
    let cur = -1, idle = 0;
    const go = i => { i = (i + slides.length) % slides.length; const s = slides[i]; list.scrollTo({ left: s.offsetLeft - (list.clientWidth - s.offsetWidth) / 2, behavior: reduce ? 'auto' : 'smooth' }); };
    const sync = () => {
      const mid = list.scrollLeft + list.clientWidth / 2;
      let best = 0, d = 1e9;
      slides.forEach((s, i) => { const dd = Math.abs(s.offsetLeft + s.offsetWidth / 2 - mid); if (dd < d) { d = dd; best = i; } });
      if (best === cur) return; cur = best;
      slides.forEach((s, i) => s.classList.toggle('is-on', i === best));
      btns.forEach((b, i) => b.setAttribute('aria-selected', i === best));
    };
    list.addEventListener('scroll', sync, { passive: true });
    const touch = () => { idle = Date.now(); };
    ['pointerdown', 'wheel', 'touchstart'].forEach(e => list.addEventListener(e, touch, { passive: true }));
    $('#prev').addEventListener('click', () => { touch(); go(cur - 1); });
    $('#next').addEventListener('click', () => { touch(); go(cur + 1); });
    btns.forEach((b, i) => b.addEventListener('click', () => { touch(); go(i); }));
    let seen = false;
    new IntersectionObserver(([e]) => { seen = e.isIntersecting; }).observe(list);
    if (!reduce) setInterval(() => { if (seen && Date.now() - idle > 6000) go(cur + 1); }, 4200);
    requestAnimationFrame(() => { go(0); sync(); });
  }

  /* ---------- go ---------- */

  // lazy pictures must not move the page under the scroll triggers: reserve their boxes up front
  $('#jharokha img').style.aspectRatio = L.jharokha.size[0] / L.jharokha.size[1];
  $('.ganesha').style.aspectRatio = L.ganesha[0] / L.ganesha[1];
  let rh, lastH = 0;
  new ResizeObserver(() => { const h = document.body.scrollHeight; if (Math.abs(h - lastH) < 2) return; lastH = h; clearTimeout(rh); rh = setTimeout(() => ScrollTrigger.refresh(), 150); }).observe(document.body);
  const ready = () => { layout(); ScrollTrigger.refresh(); intro(); };
  let rt; addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { layout(); ScrollTrigger.refresh(); }, 120); });
  if (document.fonts?.ready) document.fonts.ready.then(() => requestAnimationFrame(ready)); else addEventListener('load', ready);
})();
