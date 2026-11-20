/* Karthik & Meenakshi: the kolam at the threshold.
   The opening is a pure function of scroll. One unbroken rice-flour line is drawn round a 7 x 7 grid of dots;
   when it closes, every dot blooms into a flower, the kolam lies down on the threshold floor, the floor sinks
   to the horizon and the temple rises behind the names. Scrolling up undoes it all.
   At the end the same temple at night, with a small kolam drawing itself under the countdown. */
(() => {
  'use strict';
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });

  const C = window.INVITE, L = window.LAYOUT, K = window.KOLAM;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const root = document.documentElement;
  const reduce = root.classList.contains('reduced');
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const mix = (a, b, t) => a + (b - a) * t;
  const smooth = (a, b, v) => { const t = clamp((v - a) / (b - a)); return t * t * (3 - 2 * t); };
  const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  const NS = 'http://www.w3.org/2000/svg';
  const el = (tag, attrs = {}, parent) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); parent && parent.appendChild(e); return e; };
  scrollTo(0, 0);

  /* ---------- words ---------- */

  for (const [k, v] of Object.entries(C.colours)) root.style.setProperty('--' + k, v);
  const alias = { b: 'blessing', p: 'partner', count: 'countdown' };
  const pick = path => {
    if (path === 'one' || path === 'oneFull') return C.couple.one.first;
    if (path === 'two' || path === 'twoFull') return C.couple.two.first;
    if (path === 'oneTitle') return C.couple.one.title;
    if (path === 'twoTitle') return C.couple.two.title;
    if (path === 'joiner') return C.couple.joiner;
    return path.split('.').reduce((o, k) => o?.[alias[k] || k], C);
  };
  $$('[data-t]').forEach(e => { e.textContent = pick(e.dataset.t); });
  $$('[data-lines]').forEach(e => e.replaceChildren(...pick(e.dataset.lines).map(l => Object.assign(document.createElement('span'), { textContent: l }))));
  $$('[data-split]').forEach(e => {
    const text = pick(e.dataset.split);
    e.setAttribute('aria-label', text);
    e.innerHTML = text.split(' ').map(w => `<span class="w" aria-hidden="true">${[...w].map(c => `<span class="ch">${c}</span>`).join('')}</span>`).join(' ');
  });
  // the mantra is revealed word by word: splitting Devanagari by letter would break its conjuncts
  $('.mantra').innerHTML = C.blessing.mantra.map(l => `<span>${l.split(' ').map(w => `<span class="w">${w}</span>`).join(' ')}</span>`).join('');
  $('#names').setAttribute('aria-label', `${C.couple.one.first} and ${C.couple.two.first}`);
  document.title = `${C.couple.one.first} & ${C.couple.two.first}`;

  const fmt = (iso, o) => new Intl.DateTimeFormat('en-GB', { timeZone: C.wedding.timezone, ...o }).format(new Date(iso));
  const time = iso => fmt(iso, { hour: 'numeric', minute: '2-digit', hour12: true }).replace(':00', '').toUpperCase();

  // event cards: a cream temple-window arch with a green border, its own object floating over the top
  const ARCH = 'M14 424V150C14 70 80 18 150 10C220 18 286 70 286 150V424Z';
  const ARCH_IN = 'M28 410V153C28 84 88 38 150 27C212 38 272 84 272 153V410Z';
  const ARCH_DOT = 'M21 417V151C21 77 84 28 150 18C216 28 279 77 279 151V417Z';
  const jas = (x, y, s) => `<g class="jas" transform="translate(${x} ${y}) scale(${s})">${[0, 72, 144, 216, 288].map(a => `<circle r="4.2" cx="${(Math.cos(a * Math.PI / 180) * 6).toFixed(2)}" cy="${(Math.sin(a * Math.PI / 180) * 6).toFixed(2)}"/>`).join('')}<circle class="c" r="2.6"/></g>`;
  const orn = '<svg class="card__orn" viewBox="0 0 70 12" aria-hidden="true"><path pathLength="1" d="M2 6H24M46 6H68M28 6a3 3 0 1 1 6 0a3 3 0 1 1-6 0M36 6a3 3 0 1 1 6 0a3 3 0 1 1-6 0"/></svg>';
  $('#cards').innerHTML = C.events.map((e, i) => `
    <li class="card" style="--d:${(-i * .7).toFixed(1)}s;--bob:${(3.4 + (i % 3) * .5).toFixed(1)}s">
      <div class="card__icon" aria-hidden="true"><img src="assets/icon-${e.icon}.webp" alt="" loading="lazy"></div>
      <div class="card__arch">
        <svg viewBox="0 0 300 430" aria-hidden="true">
          <path class="fill" d="${ARCH}"/>
          <path class="b1" pathLength="1" d="${ARCH}"/>
          <path class="b2" pathLength="1" d="${ARCH_DOT}"/>
          <path class="b3" pathLength="1" d="${ARCH_IN}"/>
          ${jas(40, 96, 1.1)}${jas(260, 96, 1.1)}${jas(18, 420, .9)}${jas(282, 420, .9)}
        </svg>
        <div class="card__in">
          <h3${e.name.length > 11 ? ' class="long"' : ''}>${e.name}</h3>
          <p class="card__day">${fmt(e.start, { weekday: 'long' })}</p>
          <p class="card__date"><time datetime="${e.start}">${fmt(e.start, { day: 'numeric', month: 'long', year: 'numeric' })}</time></p>
          ${orn}
          <p>${time(e.start)} onwards</p>
          <p>${e.venue}, ${e.place}</p>
          ${e.dress ? `<p class="card__dress">${e.dress}</p>` : ''}
          <a href="${e.map}" target="_blank" rel="noopener">See the route</a>
        </div>
      </div>
    </li>`).join('');

  $('#knowList').innerHTML = C.know.items.map(i => `
    <li data-rise><svg aria-hidden="true"><use href="#i-${i.icon}"/></svg><h3>${i.title}</h3><p>${i.text}</p></li>`).join('');

  // personal link: ?to=The Iyer Family
  const guest = (new URLSearchParams(location.search).get('to') || '').trim().slice(0, 40);
  if (guest) { const t = $('#to'); t.textContent = `Dear ${guest},`; t.hidden = false; }
  const wa = C.rsvp.message.replace('{guest}', guest ? `This is ${guest},` : '').replace('{one}', C.couple.one.first).replace('{two}', C.couple.two.first).replace(/\s+/g, ' ').trim();
  $('#venueSeal').href = C.venue.map;
  $('#rsvpSeal').href = `https://wa.me/${C.rsvp.whatsapp}?text=${encodeURIComponent(wa)}`;
  $('#followSeal').href = C.follow.instagram;

  // ornaments drawn in code: a dotted ring and kolam loops round Ganesha
  {
    const ring = $('.ganesha__ring'), dots = $('.dots', ring), petals = $('.petals', ring);
    for (let i = 0; i < 36; i++) { const a = i / 36 * Math.PI * 2; el('circle', { cx: 100 + Math.cos(a) * 86, cy: 100 + Math.sin(a) * 86, r: 1.3 }, dots); }
    for (let i = 0; i < 12; i++) el('path', { pathLength: 1, d: 'M100 6C108 -4 118 2 112 10C108 15 102 12 100 6C98 12 92 15 88 10C82 2 92 -4 100 6Z', transform: `rotate(${i * 30} 100 100)` }, petals);
  }

  /* ---------- the kolam: one SVG builder for the opening, the finale and the couple ---------- */

  // rice flour is never a clean line: a speckled mask gives the stroke a powdery grain
  const grain = (() => {
    const c = document.createElement('canvas'); c.width = c.height = 96; const x = c.getContext('2d'), d = x.createImageData(96, 96);
    for (let i = 0; i < d.data.length; i += 4) { const r = Math.random(); d.data[i] = d.data[i + 1] = d.data[i + 2] = 255; d.data[i + 3] = r < .05 ? 40 : 190 + Math.random() * 65; }
    x.putImageData(d, 0, 0); return c.toDataURL();
  })();
  const KD = K.path(), DOTS = K.dots(), MID = K.m;  // centre dot sits at (m, m) in doubled units
  const PETAL = 'M0 0C.28-.18 .3-.56 0-.74C-.3-.56-.28-.18 0 0Z';
  const BLOOM = ['#c8283c', '#f08a1e', '#f3c847', '#e2557f'];

  class Kolam {
    constructor(svg, id) {
      const g0 = -1.6, sz = 2 * K.m + 3.2;
      svg.setAttribute('viewBox', `${g0} ${g0} ${sz} ${sz}`);
      svg.style.webkitMaskImage = svg.style.maskImage = `url(${grain})`;
      svg.style.webkitMaskSize = svg.style.maskSize = '72px 72px';
      const defs = el('defs', {}, svg);
      const hg = el('radialGradient', { id: 'headGrad' + id }, defs);
      el('stop', { offset: '0', 'stop-color': '#fff6d8', 'stop-opacity': '.9' }, hg);
      el('stop', { offset: '1', 'stop-color': '#ffd98a', 'stop-opacity': '0' }, hg);
      this.glow = el('path', { class: 'line line--glow', d: KD, 'stroke-width': .5 }, svg);
      this.dots = DOTS.map(([x, y]) => el('circle', { class: 'dot', cx: x, cy: y, r: .15 }, svg));
      this.line = el('path', { class: 'line', d: KD, 'stroke-width': .17 }, svg);
      this.trail = el('path', { class: 'line', d: KD, 'stroke-width': .34, opacity: .35 }, svg);
      this.len = this.line.getTotalLength();
      this.line.style.strokeDasharray = `${this.len} ${this.len}`;
      this.trail.style.strokeDasharray = `${this.len * .025} ${this.len}`;
      this.blooms = DOTS.map(([x, y]) => {
        const ring = Math.max(Math.abs(x - MID), Math.abs(y - MID)) / 2;
        const g = el('g', { class: 'bloom' }, svg);
        for (let i = 0; i < 5; i++) el('path', { d: PETAL, fill: BLOOM[ring % BLOOM.length], transform: `rotate(${i * 72})` }, g);
        el('circle', { r: .14 }, g);
        return { g, x, y, ring, d: Math.hypot(x - MID, y - MID) };
      });
      this.headGlow = el('circle', { fill: `url(#headGrad${id})`, r: 1 }, svg);
      this.head = el('circle', { class: 'head', r: .2 }, svg);
      this.k = -1;
    }
    // k: how much of the line is drawn; b: how far the dots have bloomed; glow: a soft halo once it closes
    render(k, b = 0, glow = 0) {
      if (k !== this.k) {
        this.k = k;
        this.line.style.strokeDashoffset = this.len * (1 - k);
        this.trail.style.strokeDashoffset = -this.len * Math.max(0, k - .025);
        this.trail.style.opacity = k > 0 && k < 1 ? .35 : 0;
        const live = k > 0 && k < 1;
        if (live) {
          const p = this.line.getPointAtLength(this.len * k);
          this.head.setAttribute('cx', p.x); this.head.setAttribute('cy', p.y);
          this.headGlow.setAttribute('cx', p.x); this.headGlow.setAttribute('cy', p.y);
        }
        this.head.style.opacity = this.headGlow.style.opacity = live ? 1 : 0;
      }
      this.blooms.forEach(o => {
        const s = ease(clamp(b * 1.6 - o.d / 8.5 * .6));
        o.g.setAttribute('transform', `translate(${o.x} ${o.y}) rotate(${(1 - s) * -90}) scale(${s})`);
      });
      this.glow.style.opacity = glow;
    }
    // the dots arrive first, rippling out from the middle
    showDots() {
      if (reduce) return;
      gsap.from(this.dots, { attr: { r: 0 }, duration: .7, ease: 'back.out(3)', stagger: i => Math.hypot(DOTS[i][0] - MID, DOTS[i][1] - MID) * .07 });
    }
  }
  const kolam = new Kolam($('#kolamSvg'), 'a'), kolam2 = new Kolam($('#kolamSvg2'), 'b');

  // the couple's kolam: thin and white, behind them, drawn as you scroll
  {
    const s = $('.portrait__kolam');
    s.setAttribute('viewBox', `-1.6 -1.6 ${2 * K.m + 3.2} ${2 * K.m + 3.2}`);
    DOTS.forEach(([x, y]) => el('circle', { cx: x, cy: y, r: .13 }, s));
    el('path', { d: KD, pathLength: 1 }, s);
  }

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

  /* ---------- stars: a canvas of small twinkling points over the temple ---------- */

  class Stars {
    constructor(c, n) { this.c = c; this.x = c.getContext('2d'); this.n = n; this.on = false; this.fade = 1; this.list = []; }
    size() {
      const d = Math.min(devicePixelRatio || 1, 2), w = this.c.clientWidth, h = this.c.clientHeight;
      this.c.width = w * d; this.c.height = h * d; this.x.setTransform(d, 0, 0, d, 0, 0); this.w = w; this.h = h;
      const n = Math.round(this.n * clamp(w * h / 900000, .5, 1.2));
      this.list = Array.from({ length: n }, () => ({ x: Math.random() * w, y: Math.pow(Math.random(), 1.6) * h * .7, r: .5 + Math.random() * 1.3, f: .6 + Math.random() * 2, ph: Math.random() * 6.3 }));
    }
    frame(t) {
      const { x } = this; x.clearRect(0, 0, this.w, this.h);
      if (this.fade <= 0) return;
      x.fillStyle = '#fff8e6';
      for (const s of this.list) {
        x.globalAlpha = this.fade * (.35 + .65 * (.5 + .5 * Math.sin(t * s.f + s.ph)));
        x.beginPath(); x.arc(s.x, s.y, s.r, 0, 6.283); x.fill();
      }
      x.globalAlpha = 1;
    }
  }
  const stars = new Stars($('#stars'), 120), stars2 = new Stars($('#stars2'), 150);
  const watch = (e, d) => new IntersectionObserver(([en]) => { d.on = en.isIntersecting; }).observe(e);
  watch($('#open'), stars); watch($('#finale'), stars2);
  if (!reduce) gsap.ticker.add(() => { const t = performance.now() / 1000; [stars, stars2].forEach(s => s.on && s.frame(t)); });

  /* ---------- the scene: sky, temple, palms and the threshold floor ---------- */

  class Scene {
    constructor(pin) {
      this.pin = pin; this.sky = $('.sky', pin); this.temple = $('.temple', pin); this.palms = $$('.palm', pin); this.ground = $('.ground', pin);
    }
    measure() {
      const W = this.W = this.pin.clientWidth, H = this.H = this.pin.clientHeight;
      this.tall = W < H * .9;
      const sar = L.sky[1] / L.sky[0];
      this.sw = Math.max(W, H * 1.2 / sar); this.sh = this.sw * sar;
      Object.assign(this.sky.style, { width: this.sw + 'px', left: (W - this.sw) / 2 + 'px' });
      // the horizon: where the floor meets the temple
      this.hz = H * (this.tall ? .7 : .72);
      const [tw0, th0] = L.temple, tar = th0 / tw0;
      this.tw = this.tall ? W * 1.12 : Math.min(W * .7, H * .4 / tar);
      this.th = this.tw * tar;
      this.tTop = this.hz - this.th * .985;
      Object.assign(this.temple.style, { width: this.tw + 'px', marginLeft: -this.tw / 2 + 'px', top: this.tTop + 'px' });
      const [pw0, ph0] = L.palms, ph = H * (this.tall ? .5 : .66), pw = ph * pw0 / ph0;
      this.pw = pw;
      this.palms.forEach((p, i) => Object.assign(p.style, { height: ph + 'px', width: pw + 'px', [i ? 'right' : 'left']: (this.tall ? -pw * .38 : -pw * .12) + 'px', bottom: (H - this.hz - H * .02) + 'px' }));
    }
    // rev: 0 looking down at the floor, 1 the floor at the horizon with the temple standing on it
    render(rev) {
      const { H } = this, e = ease(rev);
      this.ground.style.transform = `translate3d(0,${e * this.hz}px,0)`;
      this.sky.style.transform = `translate3d(0,${-(1 - e) * H * .25 - (this.sh - H) * .35}px,0)`;
      const tr = ease(smooth(.15, 1, rev));
      this.temple.style.transform = `translate3d(0,${(1 - tr) * (this.th * .8 + 40)}px,0) scale(${mix(.94, 1, tr)})`;
      this.temple.style.opacity = smooth(.1, .4, rev);
      const pr = ease(smooth(.35, 1, rev));
      this.palms.forEach((p, i) => { p.style.transform = `translate3d(${(1 - pr) * (i ? 1 : -1) * this.pw * .9 * (i ? -1 : 1)}px,${(1 - pr) * 60}px,0)`; });
    }
  }
  const scene = new Scene($('#pin')), night = new Scene($('#finPin'));

  const words = $('#words'), names = $('#names'), tag = $('#tag'), lede = $('#lede'), meter = $('#meter i');
  const nameChars = $$('#names .ch'), stage = $('#kolam'), stage2 = $('#kolam2');

  // timeline of the opening, as shares of its scroll
  const D0 = .03, D1 = .5, B0 = .49, B1 = .6, R0 = .56, R1 = .84, N0 = .62, N1 = .86;
  let openP = 0, endP = 0, geo = {};

  // lay the kolam on the floor: in front of the temple, tilted away from the eye
  const place = (node, cx, cy, size, tilt, s) => {
    node.style.width = node.style.height = size + 'px';
    node.style.transform = `translate3d(${cx - size / 2}px,${cy - size / 2}px,0) rotateX(${tilt}deg) scale(${s})`;
  };

  function layout() {
    scene.measure(); night.measure(); stars.size(); stars2.size();
    const { W, H, tall } = scene;
    geo.S = Math.min(W * .84, H * .58, 600);
    geo.cy0 = H * (tall ? .42 : .43);
    // on the floor: about as wide as the screen on a phone, a little narrower on a laptop
    geo.sF = Math.min(W * (tall ? .92 : .4), H * .62, 640) / geo.S;
    geo.cyF = scene.hz + (H - scene.hz) * .5;
    geo.tilt = 66;
    // names: the whole block centred in the sky above the gopuram's finials
    const nh = words.offsetHeight;
    geo.wTop = Math.max(18, (scene.tTop - nh) / 2 + (tall ? 10 : 0));
    words.style.top = geo.wTop + 'px';
    // finale: countdown above the temple, a small kolam on the floor
    const cnt = $('#count'), ch = cnt.offsetHeight;
    cnt.style.top = Math.max(20, (night.tTop - ch) / 2) + 'px';
    drawOpen(openP); drawEnd(endP);
  }

  function drawOpen(p) {
    openP = p;
    const { W, H } = scene;
    const k = clamp((p - D0) / (D1 - D0));
    const b = clamp((p - B0) / (B1 - B0));
    const rev = smooth(R0, R1, p);
    const e = ease(rev);
    scene.render(rev);
    kolam.render(k, b, smooth(D1 - .02, D1 + .03, p) * (1 - smooth(B1, R0 + .1, p)) * .55);
    // the kolam lies down onto the floor and slides to the threshold
    place(stage, W / 2, mix(geo.cy0, geo.cyF, e), geo.S, mix(0, geo.tilt, e), mix(1, geo.sF, e));
    stars.fade = smooth(R0 + .05, R1, p);
    // the names rise from tilted positions and settle upright, one letter after another
    const n = nameChars.length;
    nameChars.forEach((c, i) => {
      const a = N0 + (i / n) * (N1 - N0 - .07), t = smooth(a, a + .07, p);
      c.style.transform = `translate3d(0,${(1 - t) * 70}%,0) rotate(${(1 - t) * (i % 2 ? 22 : -22)}deg)`;
      c.style.opacity = t;
    });
    $$('.nm--and .ch').forEach(c => { c.style.opacity = smooth(N0 + .08, N0 + .14, p); });
    tag.style.opacity = smooth(N1 - .02, N1 + .06, p);
    tag.style.transform = `translateY(${(1 - smooth(N1 - .02, N1 + .06, p)) * 14}px)`;
    $('#to').style.opacity = smooth(N0 - .04, N0 + .02, p);
    lede.style.opacity = 1 - smooth(D0, D0 + .05, p);
    meter.style.transform = `scaleX(${k})`;
    meter.parentElement.style.opacity = smooth(0, D0, p) * (1 - smooth(D1, D1 + .04, p));
  }

  function drawEnd(p) {
    endP = p;
    night.render(1);
    const { W, H, tall } = night;
    const S = Math.min(W * .84, H * .58, 600), sF = Math.min(W * (tall ? .8 : .34), H * .5, 560) / S;
    place(stage2, W / 2, night.hz + (H - night.hz) * .5, S, 66, sF);
    kolam2.render(smooth(.05, .62, p), clamp((p - .6) / .2), 0);
    stars2.fade = 1;
  }

  /* ---------- the opening, before any scroll ---------- */

  function intro() {
    if (reduce) return;
    kolam.showDots();
    gsap.from('#lede > *', { y: 18, opacity: 0, duration: 1.1, stagger: .2, delay: .6, ease: 'power3.out' });
    gsap.from('.ground', { opacity: 0, duration: 1.4, ease: 'power1.out' });
  }

  /* ---------- scroll ---------- */

  let lenis;
  if (!reduce && window.Lenis) {
    lenis = window.__lenis = new Lenis({ lerp: .1 });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(t => lenis.raf(t * 1000)); gsap.ticker.lagSmoothing(0);
  }

  if (reduce) { drawOpen(1); drawEnd(1); }
  else {
    ScrollTrigger.create({ trigger: '#open', start: 'top top', end: 'bottom bottom', onUpdate: s => drawOpen(s.progress) });
    ScrollTrigger.create({ trigger: '#finale', start: 'top top', end: 'bottom bottom', onUpdate: s => drawEnd(s.progress) });
    gsap.from('#count > *', { y: 40, opacity: 0, stagger: .12, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: '#finale', start: 'top 60%' } });

    // generic rise: words float up out of a soft blur
    ScrollTrigger.batch('[data-rise]', {
      start: 'top 88%', once: true,
      onEnter: els => gsap.fromTo(els, { y: 34, opacity: 0, filter: 'blur(6px)' }, { y: 0, opacity: 1, filter: 'blur(0px)', duration: 1.1, ease: 'power3.out', stagger: .09, clearProps: 'filter' })
    });
    // names in the invitation: letters flip up one by one
    $$('.bigname').forEach(e => gsap.from($$('.ch', e), { yPercent: 90, rotateX: -80, opacity: 0, duration: .9, ease: 'back.out(1.6)', stagger: .07, transformOrigin: '50% 100% -20px', scrollTrigger: { trigger: e, start: 'top 86%' } }));
    $$('[data-draw] path').forEach(pth => {
      gsap.set(pth, { strokeDasharray: 1, strokeDashoffset: 1 });
      gsap.to(pth, { strokeDashoffset: 0, duration: 1.6, ease: 'power2.inOut', scrollTrigger: { trigger: pth, start: 'top 88%' } });
    });

    // thoranam: drops in on its string, then sways as you scroll
    gsap.fromTo('.thoranam', { yPercent: -70 }, { yPercent: 0, ease: 'none', scrollTrigger: { trigger: '#blessing', start: 'top bottom', end: 'top 30%', scrub: .6 } });
    gsap.to('.thoranam img', { rotate: .8, skewX: 1.5, transformOrigin: '50% 0', duration: 2.8, yoyo: true, repeat: -1, ease: 'sine.inOut' });

    // Ganesha: the ring draws round, the dots and kolam loops bloom outward, the figure rises out of light
    const gn = $('#ganesha');
    gsap.set($('circle', gn), { strokeDasharray: 1, strokeDashoffset: 1 });
    gsap.set($$('.petals path', gn), { strokeDasharray: 1, strokeDashoffset: 1 });
    const gtl = gsap.timeline({ scrollTrigger: { trigger: gn, start: 'top 80%' } });
    gtl.to($('circle', gn), { strokeDashoffset: 0, duration: 1.8, ease: 'power2.inOut' })
      .from($$('.dots circle', gn), { scale: 0, transformOrigin: '50% 50%', opacity: 0, duration: .4, stagger: .025, ease: 'back.out(3)' }, .3)
      .to($$('.petals path', gn), { strokeDashoffset: 0, duration: .8, stagger: .06, ease: 'power1.out' }, .6)
      .fromTo('#ganesha img', { y: 30, scale: .85, opacity: 0, filter: 'brightness(2) blur(8px)' }, { y: 0, scale: 1, opacity: 1, filter: 'brightness(1) blur(0px)', duration: 1.6, ease: 'power3.out' }, .4);
    gsap.to('.ganesha__ring .petals', { rotate: 120, transformOrigin: '100px 100px', ease: 'none', scrollTrigger: { trigger: '#blessing', start: 'top bottom', end: 'bottom top', scrub: true } });
    gsap.to('.ganesha__ring .dots', { rotate: -90, transformOrigin: '100px 100px', ease: 'none', scrollTrigger: { trigger: '#blessing', start: 'top bottom', end: 'bottom top', scrub: true } });
    gsap.to('#ganesha img', { filter: 'drop-shadow(0 0 34px rgba(244,220,156,.75))', duration: 2.6, yoyo: true, repeat: -1, ease: 'sine.inOut', delay: 2 });
    // the mantra arrives word by word, each one out of a golden blur
    gsap.from('.mantra .w', { y: 16, opacity: 0, filter: 'blur(6px)', duration: .9, stagger: .12, ease: 'power2.out', scrollTrigger: { trigger: '.mantra', start: 'top 86%' } });

    // event cards: the green border draws round the arch, the cream fills it, the object drops in on a bounce
    ScrollTrigger.batch('.card', {
      start: 'top 86%', once: true,
      onEnter: els => els.forEach((c, i) => {
        const tl = gsap.timeline({ delay: i * .16 });
        const [b1, b2, b3] = ['.b1', '.b2', '.b3'].map(s => $(s, c));
        gsap.set([b1, b3], { strokeDasharray: 1, strokeDashoffset: 1 });
        tl.fromTo($('.fill', c), { opacity: 0, scaleY: .2, transformOrigin: '50% 100%', transformBox: 'fill-box' }, { opacity: 1, scaleY: 1, duration: 1.1, ease: 'power3.out' })
          .to(b1, { strokeDashoffset: 0, duration: 1.5, ease: 'power2.inOut' }, 0)
          .to(b3, { strokeDashoffset: 0, duration: 1.5, ease: 'power2.inOut' }, .25)
          .from(b2, { opacity: 0, duration: .8 }, .9)
          .from($$('.jas', c), { scale: 0, transformOrigin: '50% 50%', transformBox: 'fill-box', duration: .6, stagger: .08, ease: 'back.out(3)' }, 1)
          .from($$('.card__in > *', c), { y: 14, opacity: 0, duration: .6, stagger: .06, ease: 'power2.out' }, .6)
          .fromTo($('.card__orn path', c), { strokeDasharray: 1, strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1 }, 1)
          .from($('.card__icon', c), { y: -90, scale: .6, opacity: 0, duration: 1.3, ease: 'elastic.out(1, .55)' }, .3);
      })
    });
    $$('.card').forEach((c, i) => gsap.to(c, { yPercent: (i % 3 - 1) * -5, ease: 'none', scrollTrigger: { trigger: c, start: 'top bottom', end: 'bottom top', scrub: true } }));

    // seals swell as they come into view
    $$('.seal').forEach(s => gsap.fromTo(s, { scale: .7 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: s, start: 'top bottom', end: 'center 55%', scrub: true } }));

    // meet: the white kolam draws behind them as you scroll and keeps turning; the couple steps up into it
    const pk = $('.portrait__kolam path');
    gsap.set(pk, { strokeDasharray: 1, strokeDashoffset: 1 });
    gsap.to(pk, { strokeDashoffset: 0, ease: 'none', scrollTrigger: { trigger: '#portrait', start: 'top 90%', end: 'center 40%', scrub: .6 } });
    gsap.from($$('.portrait__kolam circle'), { scale: 0, transformOrigin: '50% 50%', transformBox: 'fill-box', duration: .5, stagger: { each: .02, from: 'center', grid: [K.m, K.m] }, scrollTrigger: { trigger: '#portrait', start: 'top 90%' } });
    gsap.fromTo('.portrait__kolam', { rotate: -20, scale: .85, opacity: .3 }, { rotate: 25, scale: 1, opacity: 1, ease: 'none', scrollTrigger: { trigger: '#meet', start: 'top bottom', end: 'bottom top', scrub: true } });
    gsap.fromTo('#portrait img', { y: 80, scale: .9, opacity: 0 }, { y: 0, scale: 1, opacity: 1, ease: 'none', scrollTrigger: { trigger: '#portrait', start: 'top 92%', end: 'center 55%', scrub: .6 } });

    // RSVP: the lamp rises and its glow spreads; the flames flicker
    gsap.fromTo('#lamp', { y: 80, opacity: 0 }, { y: 0, opacity: 1, ease: 'none', scrollTrigger: { trigger: '#rsvp', start: 'top 90%', end: 'center 60%', scrub: .6 } });
    gsap.fromTo('.lamp__glow', { scale: .2, opacity: 0 }, { scale: 1, opacity: 1, ease: 'none', scrollTrigger: { trigger: '#rsvp', start: 'top 70%', end: 'center 45%', scrub: .6 } });
    const flicker = () => gsap.to('.lamp__glow', { '--f': 1, filter: `brightness(${.85 + Math.random() * .35})`, duration: .12 + Math.random() * .25, ease: 'none', onComplete: flicker });
    flicker();

    // know: the kolam edge draws along the top, then the icons draw themselves
    const edge = $('.edge path');
    gsap.set(edge, { strokeDasharray: 1, strokeDashoffset: 1 });
    gsap.to(edge, { strokeDashoffset: 0, ease: 'none', scrollTrigger: { trigger: '#know', start: 'top 95%', end: 'top 30%', scrub: .6 } });
    $$('.know svg').forEach(s => { s.style.strokeDasharray = 1; s.style.strokeDashoffset = 1; });
    ScrollTrigger.batch('.know li', {
      start: 'top 88%', once: true,
      onEnter: els => els.forEach((li, i) => gsap.to($('svg', li), { strokeDashoffset: 0, duration: 1.6, delay: .2 + i * .12, ease: 'power2.inOut' }))
    });

    // follow: the ring draws, the marigold dots turn with the scroll, the parrot bobs on its lotus
    const pr = $('.parrot__ring circle');
    gsap.set(pr, { strokeDasharray: 1, strokeDashoffset: 1 });
    gsap.to(pr, { strokeDashoffset: 0, duration: 2, ease: 'power2.inOut', scrollTrigger: { trigger: '#parrot', start: 'top 80%' } });
    gsap.to('.parrot__ring .dots', { rotate: 180, transformOrigin: '100px 100px', ease: 'none', scrollTrigger: { trigger: '#follow', start: 'top bottom', end: 'bottom top', scrub: true } });
    gsap.fromTo('#parrot img', { y: 120, scale: .8, rotate: -6 }, { y: 0, scale: 1, rotate: 0, ease: 'none', scrollTrigger: { trigger: '#follow', start: 'top bottom', end: 'center 55%', scrub: true } });
    gsap.to('#parrot img', { rotate: 3, y: -6, duration: 2.4, yoyo: true, repeat: -1, ease: 'sine.inOut' });
  }

  /* ---------- meet: strands of jasmine lower like a curtain and part around the couple ---------- */
  {
    const box = $('#jasmine');
    const strandSvg = len => {
      let s = `<svg viewBox="-7 0 14 ${len}" height="${len}"><path d="M0 0V${len}" stroke="#7a9a6a" stroke-width=".8"/>`;
      for (let y = 10; y < len - 4; y += 9) {
        const r = Math.random();
        if (r < .08) s += `<circle cx="0" cy="${y + 3}" r="4.6" fill="#c8283c"/><circle cx="0" cy="${y + 3}" r="2" fill="#8e1527"/>`, y += 6;
        else if (r < .14) s += `<circle cx="0" cy="${y + 3}" r="4.4" fill="#f08a1e"/><circle cx="0" cy="${y + 3}" r="1.8" fill="#c35f0c"/>`, y += 6;
        else s += `<ellipse cx="${y % 2 ? -1.6 : 1.6}" cy="${y}" rx="2.6" ry="3.8" fill="#fffdf6" stroke="#e5dcc4" stroke-width=".5" transform="rotate(${y % 2 ? -18 : 18} ${y % 2 ? -1.6 : 1.6} ${y})"/>`;
      }
      return s + `<circle cx="0" cy="${len}" r="3" fill="#fffdf6"/></svg>`;
    };
    const build = () => {
      const W = box.clientWidth, n = Math.round(W / (W < 700 ? 34 : 46));
      box.innerHTML = Array.from({ length: n }, (_, i) => {
        const x = (i + .5) / n, len = Math.round(Math.min(250, 110 + Math.abs(Math.sin(i * 1.7)) * 80 + Math.abs(x - .5) * 140));
        return `<div class="strand" data-x="${x.toFixed(3)}" style="left:${(x * 100).toFixed(2)}%">${strandSvg(len)}</div>`;
      }).join('');
      return $$('.strand', box);
    };
    const strands = build();
    if (!reduce) {
      strands.forEach((s, i) => {
        const x = +s.dataset.x, side = x < .5 ? -1 : 1, near = 1 - Math.min(1, Math.abs(x - .5) / .32);
        gsap.fromTo(s, { yPercent: -100 }, { yPercent: 0, ease: 'none', scrollTrigger: { trigger: '#meet', start: 'top 95%', end: 'top 25%', scrub: .8 } });
        // the strands over the couple part to the sides as they come into view
        gsap.to(s, { x: side * near * (innerWidth < 700 ? 90 : 170), rotate: side * near * 8, ease: 'none', scrollTrigger: { trigger: '#portrait', start: 'top 80%', end: 'center 50%', scrub: .8 } });
        gsap.to($('svg', s), { rotate: (i % 2 ? 2.5 : -2.5), transformOrigin: '50% 0', duration: 2.6 + (i % 5) * .4, yoyo: true, repeat: -1, ease: 'sine.inOut', delay: -(i % 7) * .4 });
      });
    }
  }

  /* ---------- gallery ---------- */
  {
    const list = $('#slides'), dots = $('#dots');
    list.innerHTML = C.gallery.photos.map((p, i) => `<li class="slide" style="--tilt:${i % 2 ? 2.5 : -2.5}deg" aria-roledescription="slide" aria-label="${i + 1} of ${C.gallery.photos.length}"><div class="slide__frame"><img src="${p.src}" alt="${p.alt}" loading="lazy"></div></li>`).join('');
    dots.innerHTML = C.gallery.photos.map((_, i) => `<button type="button" role="tab" aria-label="Photo ${i + 1}"></button>`).join('');
    const slides = $$('.slide', list), btns = $$('button', dots);
    let at = -1, idle = 0;
    const go = i => { i = (i + slides.length) % slides.length; const s = slides[i]; list.scrollTo({ left: s.offsetLeft - (list.clientWidth - s.offsetWidth) / 2, behavior: reduce ? 'auto' : 'smooth' }); };
    const sync = () => {
      const mid = list.scrollLeft + list.clientWidth / 2;
      let best = 0, d = 1e9;
      slides.forEach((s, i) => { const dd = Math.abs(s.offsetLeft + s.offsetWidth / 2 - mid); if (dd < d) { d = dd; best = i; } });
      if (best === at) return; at = best;
      slides.forEach((s, i) => s.classList.toggle('is-on', i === best));
      btns.forEach((b, i) => b.setAttribute('aria-selected', i === best));
    };
    list.addEventListener('scroll', sync, { passive: true });
    const touch = () => { idle = Date.now(); };
    ['pointerdown', 'wheel', 'touchstart'].forEach(e => list.addEventListener(e, touch, { passive: true }));
    $('#prev').addEventListener('click', () => { touch(); go(at - 1); });
    $('#next').addEventListener('click', () => { touch(); go(at + 1); });
    btns.forEach((b, i) => b.addEventListener('click', () => { touch(); go(i); }));
    let seen = false;
    new IntersectionObserver(([e]) => { seen = e.isIntersecting; }).observe(list);
    if (!reduce) setInterval(() => { if (seen && Date.now() - idle > 6000) go(at + 1); }, 4200);
    requestAnimationFrame(() => { go(0); sync(); });
  }

  /* ---------- go ---------- */

  // lazy pictures must not move the page under the scroll triggers: reserve their boxes up front
  $('#portrait').style.setProperty('--ar', L.couple[0] / L.couple[1]);
  $('.thoranam img').style.aspectRatio = L.thoranam[0] / L.thoranam[1];
  $('#lamp img').style.aspectRatio = L.lamp[0] / L.lamp[1];
  $$('.card__icon img').forEach((im, i) => { const s = L.icons[C.events[i].icon]; im.style.aspectRatio = s[0] / s[1]; });
  let rh, lastH = 0;
  new ResizeObserver(() => { const h = document.body.scrollHeight; if (Math.abs(h - lastH) < 2) return; lastH = h; clearTimeout(rh); rh = setTimeout(() => ScrollTrigger.refresh(), 150); }).observe(document.body);
  const ready = () => { layout(); ScrollTrigger.refresh(); intro(); };
  let rt, lastW = innerWidth; addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { layout(); ScrollTrigger.refresh(); }, 120); });
  if (document.fonts?.ready) document.fonts.ready.then(() => requestAnimationFrame(ready)); else addEventListener('load', ready);
})();
