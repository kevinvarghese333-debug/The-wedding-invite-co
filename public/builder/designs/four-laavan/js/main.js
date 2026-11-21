/* Harman & Simran: the four laavan.
   The opening is a pure function of scroll. Each step draws one ring of gold thread around the names,
   with two beads (the couple) walking the circle, groom leading. After the fourth ring the camera drops
   through the sunset, the palace rises, the near lanterns lift away and the names settle in the sky.
   At the end the same scene at dusk draws four rings around the countdown. */
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
  const NS = 'http://www.w3.org/2000/svg';
  const el = (tag, attrs = {}, parent) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); parent && parent.appendChild(e); return e; };
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
  $$('[data-t]').forEach(e => { e.textContent = pick(e.dataset.t); });
  $$('[data-lines]').forEach(e => e.replaceChildren(...pick(e.dataset.lines).map(l => Object.assign(document.createElement('span'), { textContent: l }))));
  $$('[data-split]').forEach(e => {
    const text = pick(e.dataset.split);
    e.setAttribute('aria-label', text);
    e.innerHTML = text.split(' ').map(w => `<span class="w" aria-hidden="true">${[...w].map(c => `<span class="ch">${c}</span>`).join('')}</span>`).join(' ');
  });
  $('#names').setAttribute('aria-label', `${C.couple.one.first} and ${C.couple.two.first}`);
  document.title = `${C.couple.one.first} & ${C.couple.two.first}`;

  const fmt = (iso, o) => new Intl.DateTimeFormat('en-GB', { timeZone: C.wedding.timezone, ...o }).format(new Date(iso));
  const time = iso => fmt(iso, { hour: 'numeric', minute: '2-digit', hour12: true }).replace(':00', '').toUpperCase();

  // event cards: the text sits in the frame's oval, with a little lantern swinging above each one
  const [fx0, fy0, fx1, fy1] = L.frame.inner, fw = fx1 - fx0, fh = fy1 - fy0;
  const inset = `${(fy0 + fh * .14) * 100}% ${(1 - fx1 + fw * .13) * 100}% ${(1 - fy1 + fh * .12) * 100}% ${(fx0 + fw * .13) * 100}%`;
  const orn = '<svg class="card__orn" viewBox="0 0 70 12" aria-hidden="true"><path pathLength="1" d="M2 6H26M44 6H68M30 6C32 1 38 1 35 6C32 11 38 11 40 6"/></svg>';
  $('#cards').innerHTML = C.events.map((e, i) => `
    <li class="card" style="--d:${(i * .6).toFixed(1)}s;--sw:${(3.2 + (i % 3) * .5).toFixed(1)}s">
      <div class="card__hang" aria-hidden="true"><img src="assets/lantern-${i % L.lanterns.length}.webp" alt="" loading="lazy"></div>
      <div class="card__oval" style="--ar:${L.frame.size[0] / L.frame.size[1]}">
        <div class="card__fill"></div>
        <img class="card__frame" src="assets/frame.webp" alt="" loading="lazy">
        <div class="card__in" style="inset:${inset}">
          <h3>${e.name}</h3>
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

  // personal link: ?to=The Dhillon Family
  const guest = (new URLSearchParams(location.search).get('to') || '').trim().slice(0, 40);
  if (guest) { const t = $('#to'); t.textContent = `Dear ${guest},`; t.hidden = false; }
  const wa = C.rsvp.message.replace('{guest}', guest ? `This is ${guest},` : '').replace('{one}', C.couple.one.first).replace('{two}', C.couple.two.first).replace(/\s+/g, ' ').trim();
  $('#venueSeal').href = C.venue.map;
  $('#rsvpSeal').href = `https://wa.me/${C.rsvp.whatsapp}?text=${encodeURIComponent(wa)}`;
  $('#followSeal').href = C.follow.instagram;

  // ornaments drawn in code: leaves round the Ik Onkar ring, lotus petals round the RSVP medallion
  {
    const g = $('.onkar__ring .petals');
    for (let i = 0; i < 16; i++) {
      const a = i / 16 * 360;
      el('path', { d: 'M100 1.5c3 3 3 7 0 10c-3-3-3-7 0-10Z', transform: `rotate(${a} 100 100)` }, g);
    }
    const m = $('.medal__petals');
    for (let i = 0; i < 24; i++) {
      const a = i / 24 * 360;
      el('path', { pathLength: 1, d: 'M150 22C140 12 142 2 150-6C158 2 160 12 150 22M150 14C146 9 147 4 150 0', transform: `rotate(${a} 150 150)` }, m);
    }
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

  /* ---------- far lanterns: a canvas of small lanterns drifting up through the sky ---------- */

  const lanternImgs = L.lanterns.map((_, i) => Object.assign(new Image(), { src: `assets/lantern-${i}.webp` }));
  const glow = (() => {
    const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d');
    const g = x.createRadialGradient(64, 64, 0, 64, 64, 64);
    g.addColorStop(0, 'rgba(255,200,110,.55)'); g.addColorStop(.4, 'rgba(255,160,80,.18)'); g.addColorStop(1, 'rgba(255,140,60,0)');
    x.fillStyle = g; x.fillRect(0, 0, 128, 128); return c;
  })();
  class Drift {
    constructor(canvas, count) { this.c = canvas; this.x = canvas.getContext('2d'); this.n = count; this.on = false; this.list = []; this.shift = 0; this.fade = 1; }
    size() {
      const d = Math.min(devicePixelRatio || 1, 2), w = this.c.clientWidth, h = this.c.clientHeight;
      this.c.width = w * d; this.c.height = h * d; this.x.setTransform(d, 0, 0, d, 0, 0); this.w = w; this.h = h;
      const n = Math.round(this.n * clamp(w / 1000, .6, 1));
      while (this.list.length < n) this.list.push(this.spawn(true));
      this.list.length = n;
    }
    spawn(any) {
      const z = Math.random();  // 0 far, 1 near
      const s = 10 + z * z * 30;
      return { img: lanternImgs[Math.floor(Math.random() * lanternImgs.length)], s, z, x: Math.random() * (this.w || innerWidth), y: any ? Math.random() * (this.h || innerHeight) * 1.2 : (this.h || innerHeight) + 60,
        vy: 6 + z * 16, sway: 6 + Math.random() * 14, ph: Math.random() * 6.3, f: .3 + Math.random() * .6, a: .45 + z * .55 };
    }
    frame(dt, t) {
      const { x } = this; x.clearRect(0, 0, this.w, this.h);
      if (this.fade <= 0) return;
      for (const p of this.list) {
        p.y -= p.vy * dt;
        // scrolling pushes the lanterns up too, near ones faster (parallax)
        const y = p.y - this.shift * (.3 + p.z * .9);
        if (y < -80) { Object.assign(p, this.spawn(false)); p.y += this.shift * (.3 + p.z * .9); continue; }
        if (y > this.h + 80) continue;
        if (!p.img.complete || !p.img.naturalWidth) continue;
        const px = p.x + Math.sin(t * p.f + p.ph) * p.sway, ar = p.img.naturalHeight / p.img.naturalWidth, h = p.s * ar;
        x.globalAlpha = p.a * this.fade;
        x.drawImage(glow, px - p.s * 1.6, y - p.s * 1.1, p.s * 3.2, p.s * 3.2);
        x.save(); x.translate(px, y); x.rotate(Math.sin(t * p.f * 1.3 + p.ph) * .08);
        x.drawImage(p.img, -p.s / 2, -h * .35, p.s, h); x.restore();
      }
      x.globalAlpha = 1;
    }
  }
  const drift = new Drift($('#drift'), 26), drift2 = new Drift($('#drift2'), 34);
  const watch = (e, d) => new IntersectionObserver(([en]) => { d.on = en.isIntersecting; }).observe(e);
  watch($('#laav'), drift); watch($('#finale'), drift2);
  if (!reduce) {
    let last = performance.now();
    gsap.ticker.add(() => {
      const now = performance.now(), dt = Math.min(.05, (now - last) / 1000); last = now;
      [drift, drift2].forEach(d => d.on && d.frame(dt, now / 1000));
    });
  }

  /* ---------- the four rings: one SVG builder for the opening and the finale ---------- */

  class Vows {
    constructor(svg, id) {
      this.svg = svg; svg.innerHTML = '';
      const defs = el('defs', {}, svg);
      const hg = el('radialGradient', { id: 'haloGrad' + id }, defs);
      el('stop', { offset: '0', 'stop-color': '#ffe2a8', 'stop-opacity': '.35' }, hg);
      el('stop', { offset: '1', 'stop-color': '#ffb070', 'stop-opacity': '0' }, hg);
      this.g = el('g', {}, svg);
      this.halo = el('circle', { class: 'halo', fill: `url(#haloGrad${id})`, r: 1 }, this.g);
      this.rings = [1, 2, 3, 4].map(n => {
        const m = el('mask', { id: `vm${id}${n}`, maskUnits: 'userSpaceOnUse', x: -2000, y: -2000, width: 4000, height: 4000 }, defs);
        const mc = el('circle', { fill: 'none', stroke: '#fff', 'stroke-width': 16, pathLength: 1, 'stroke-dasharray': '1 1', 'stroke-dashoffset': 1, transform: 'rotate(-90)' }, m);
        const ring = el('circle', { class: `ring ring--${n}`, mask: `url(#vm${id}${n})` }, this.g);
        const knots = [0, 1, 2, 3].map(() => el('path', { class: 'knot', d: 'M0-5L4 0L0 5L-4 0Z' }, this.g));
        return { mc, ring, knots };
      });
      this.beadB = el('circle', { class: 'bead bead--b', r: 4.2 }, this.g);
      this.beadA = el('circle', { class: 'bead bead--a', r: 5.2 }, this.g);
    }
    setRadius(r0, gap) {
      this.r = [0, 1, 2, 3].map(i => r0 + i * gap);
      this.rings.forEach((R, i) => { R.ring.setAttribute('r', this.r[i]); R.mc.setAttribute('r', this.r[i]); });
      this.halo.setAttribute('r', this.r[3] * 1.25);
    }
    place(x, y, s) { this.g.setAttribute('transform', `translate(${x} ${y}) scale(${s})`); }
    // t: 0..4, how many rings are drawn (fractional = the one being drawn now)
    render(t, glowAmt = 0) {
      this.rings.forEach((R, i) => {
        const k = clamp(t - i);
        R.mc.setAttribute('stroke-dashoffset', 1 - k);
        R.ring.style.opacity = k > 0 ? 1 : 0;
        const done = smooth(i + 1, i + 1.25, t);
        R.knots.forEach((kn, j) => {
          const a = j * Math.PI / 2 - Math.PI / 2, r = this.r[i];
          kn.setAttribute('transform', `translate(${Math.cos(a) * r} ${Math.sin(a) * r}) rotate(${j * 90}) scale(${done * (i % 2 ? .8 : 1.1)})`);
        });
      });
      // the couple walking the current ring: groom leads, bride follows holding the palla
      const i = Math.min(3, Math.floor(t)), k = t >= 4 ? 1 : t - i, walking = t > 0 && t < 4;
      const at = (kk, r) => { const a = -Math.PI / 2 + Math.PI * 2 * kk; return [Math.cos(a) * r, Math.sin(a) * r]; };
      const r = this.r[i], [ax, ay] = at(k, r), [bx, by] = at(Math.max(0, k - .045), r);
      const vis = walking ? 1 : 0;
      this.beadA.setAttribute('cx', ax); this.beadA.setAttribute('cy', ay); this.beadA.style.opacity = vis;
      this.beadB.setAttribute('cx', bx); this.beadB.setAttribute('cy', by); this.beadB.style.opacity = vis * smooth(0, .04, k);
      this.halo.style.opacity = clamp(t / 4) * .8 + glowAmt;
    }
  }
  const vows = new Vows($('#vows'), 'a'), vows2 = new Vows($('#vows2'), 'b');

  /* ---------- near lanterns: big ones around the names that drift and turn with the scroll ---------- */

  const NEAR = [ // x, y as shares of the screen; size as share of the short side; scroll speed; turn; blur
    { x: .08, y: .14, s: .19, v: .5, r: -14, k: 0, b: 1 },
    { x: .9, y: .1, s: .15, v: .35, r: 12, k: 2 },
    { x: .03, y: .66, s: .24, v: .85, r: 10, k: 3, b: 1 },
    { x: .95, y: .6, s: .2, v: .7, r: -10, k: 1 },
    { x: .3, y: .03, s: .09, v: .22, r: 8, k: 6 },
    { x: .9, y: .92, s: .13, v: .95, r: -8, k: 5 },
    { x: .66, y: .02, s: .08, v: .18, r: -6, k: 7 }
  ];
  const near = $('#near');
  near.innerHTML = NEAR.map((n, i) => `<div class="lantern${n.b ? ' blur' : ''}" style="--t:${(4 + i * .7).toFixed(1)}s;--dl:-${(i * .9).toFixed(1)}s"><img src="assets/lantern-${n.k}.webp" alt=""></div>`).join('');
  const nearEls = $$('.lantern', near);

  /* ---------- the scene: sky, sun, palace and flowers, framed by one camera ---------- */

  class Scene {
    constructor(pin) {
      this.pin = pin; this.sky = $('.sky', pin); this.palace = $('.palace', pin); this.bushes = $$('.bush', pin); this.sun = $('.sun', pin);
    }
    measure() {
      const W = this.W = this.pin.clientWidth, H = this.H = this.pin.clientHeight;
      this.tall = W < H * .9;
      // sky: tall enough to pan through from plum to saffron
      const sar = 2133 / 1200;
      this.sw = Math.max(W, H * 1.75 / sar); this.sh = this.sw * sar;
      Object.assign(this.sky.style, { width: this.sw + 'px', left: (W - this.sw) / 2 + 'px' });
      // palace: wide enough on phones that the central dome reads; its top never above 36% of the screen
      const [pw0, ph0] = L.palace.size, par = ph0 / pw0;
      this.pw = this.tall ? W * 1.85 : Math.max(W * 1.02, H * .9 / par * .62);
      this.ph = this.pw * par;
      this.pTop = Math.max(H - this.ph * .96, H * (this.tall ? .47 : .44));
      Object.assign(this.palace.style, { width: this.pw + 'px', marginLeft: -this.pw / 2 + 'px', top: this.pTop + 'px' });
    }
    // cam: 0 looks at the upper sky, 1 at the horizon; rise: 0 palace below the screen, 1 in place
    render(cam, rise) {
      const { W, H } = this;
      const skyY = -cam * (this.sh - H);
      this.sky.style.transform = `translate3d(0,${skyY}px,0)`;
      if (this.sun) {
        const sy = skyY + this.sh * .93;
        this.sun.style.top = '0px';
        this.sun.style.transform = `translate3d(0,${sy - this.sun.offsetHeight / 2}px,0)`;
        this.sun.style.opacity = (.25 + cam * .75).toFixed(3);
      }
      const e = ease(rise);
      // hidden: pushed down far enough that even the scaled-up finial is below the screen
      this.palace.style.transform = `translate3d(0,${(1 - e) * (H - this.pTop + this.ph * .14 + 40)}px,0) scale(${mix(1.12, 1, e)})`;
      // the right bush is mirrored with `scale: -1 1`, which also mirrors this translate: -30% pushes both outward
      this.bushes.forEach(b => { b.style.transform = `translate3d(${(1 - e) * -40}%,${(1 - e) * 95}%,0)`; });
    }
  }
  const scene = new Scene($('#pin')), dusk = new Scene($('#finPin'));

  const words = $('#words'), names = $('#names'), tag = $('#tag'), round = $('#round');
  const rGm = $('#roundGm'), rEn = $('#roundEn'), rMean = $('#roundMean'), rBeads = $$('#roundBeads li');

  // timeline of the opening, as shares of its scroll
  const R0 = .05, RL = .14, REV0 = .62, REV1 = .9;
  let laavP = 0, endP = 0, cur = -1, geo = {};

  function setRound(i) {
    if (i === cur) return; cur = i;
    const r = C.laavan.rounds[i];
    rGm.textContent = r.gurmukhi; rEn.textContent = r.english; rMean.textContent = r.meaning;
    if (!reduce) gsap.fromTo([rGm, rEn, rMean], { y: 14, opacity: 0, filter: 'blur(4px)' }, { y: 0, opacity: 1, filter: 'blur(0px)', duration: .6, stagger: .06, ease: 'power2.out', overwrite: true });
  }

  function layout() {
    scene.measure(); dusk.measure(); drift.size(); drift2.size();
    const { W, H } = scene;
    const r0 = Math.min(W / 2 - 46, H * .29, 240), gap = clamp(r0 * .07, 8, 14);
    vows.setRadius(r0, gap); vows2.setRadius(r0, gap);
    const nh = words.offsetHeight, mid = names.offsetTop + names.offsetHeight / 2;
    words.style.transformOrigin = `50% ${mid}px`;
    geo.cy0 = H * (scene.tall ? .41 : .42);
    geo.top0 = geo.cy0 - mid;
    geo.rOut = r0 + gap * 3;
    // after the reveal: names smaller, centred in the sky above the domes
    geo.sc1 = scene.tall ? .78 : .74;
    // the whole block (greeting, names, tagline) centred in the sky above the palace
    const room = scene.pTop + scene.ph * L.palace.roof * .2;
    geo.cy1 = Math.max(16, (room - nh * geo.sc1) / 2) + mid * geo.sc1;
    round.style.top = (geo.cy0 + geo.rOut + 22) + 'px';
    words.style.top = geo.top0 + 'px';
    // finale: the countdown inside the rings, above the dusk domes
    const cnt = $('#count'), ch = cnt.offsetHeight;
    geo.cyE = Math.min(dusk.pTop * .5 + 10, H * .4);
    cnt.style.top = (geo.cyE - ch / 2) + 'px';
    // rings round the countdown, but never off the top of the screen
    vows2.setRadius(Math.max(90, Math.min(W / 2 - 40, Math.max(ch * .62, 150), geo.cyE - 14 - gap * 3)), gap);
    vows2.place(W / 2, geo.cyE, 1);
    drawLaav(laavP); drawEnd(endP);
  }

  function drawLaav(p) {
    laavP = p;
    const { W, H } = scene;
    const t = clamp((p - R0) / RL, 0, 4) * 1.0;
    const tDraw = Math.min(4, Math.floor(t) + clamp((t - Math.floor(t)) / .85));  // each ring finishes a little before its slot ends
    const rev = smooth(REV0, REV1, p);
    scene.render(mix(.12, .4, smooth(0, REV0, p)) + rev * .6, rev);
    // names and rings move together
    const sc = mix(1, geo.sc1, ease(rev)), cy = mix(geo.cy0, geo.cy1, ease(rev));
    words.style.transform = `translateY(${cy - geo.cy0}px) scale(${sc})`;
    vows.place(W / 2, cy, sc * mix(1, .92, ease(rev)));
    vows.render(tDraw, smooth(.85, 1, rev) * .2);
    $('#vows').style.opacity = (1 - smooth(.55, 1, rev) * .45).toFixed(3);
    // which laav we are on
    setRound(Math.min(3, Math.max(0, Math.floor(t))));
    rBeads.forEach((b, i) => b.classList.toggle('on', tDraw >= i + 1));
    round.style.opacity = (smooth(.02, R0, p) * (1 - smooth(REV0 - .01, REV0 + .06, p))).toFixed(3);
    round.style.transform = `translateY(${-smooth(REV0 - .01, REV0 + .08, p) * 40}px)`;
    $('#cue').style.opacity = 1 - smooth(0, .035, p);
    tag.style.opacity = smooth(.86, .95, p);
    tag.style.transform = `translateY(${(1 - smooth(.86, .95, p)) * 14}px)`;
    // near lanterns: rise and turn with the scroll, then lift right away at the reveal
    const short = Math.min(W, H);
    NEAR.forEach((n, i) => {
      const e = nearEls[i], size = short * n.s * (scene.tall ? 1 : .8);
      e.style.width = size + 'px';
      const y = n.y * H - p * n.v * H * .55 - ease(rev) * H * (1 + n.v);
      const x = n.x * W - size / 2 + Math.sin(p * 7 + i) * 12;
      e.style.transform = `translate3d(${x}px,${y}px,0) rotate(${n.r * p * 2}deg)`;
    });
    drift.shift = p * H * 1.6;
  }

  function drawEnd(p) {
    endP = p;
    dusk.render(.92, 1);
    vows2.render(smooth(.05, .7, p) * 4, .15);
    drift2.shift = p * dusk.H * .8;
  }

  /* ---------- the opening, before any scroll ---------- */

  function intro() {
    if (reduce) return;
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl.from('#sky', { opacity: 0, scale: 1.08, duration: 2, ease: 'power1.out' }, 0)
      .from('#drift', { opacity: 0, duration: 2 }, .3)
      .from(nearEls.map(e => e.firstElementChild), { y: () => innerHeight * .5, opacity: 0, duration: 2.4, stagger: .12, ease: 'power2.out' }, .2)
      // names rise from tilted positions and settle upright, letter by letter
      .from($$('#names .ch'), { yPercent: 80, rotate: i => (i % 2 ? 1 : -1) * 24, opacity: 0, duration: 1.2, stagger: .065, transformOrigin: '50% 100%' }, .7)
      .fromTo('#vows', { opacity: 0 }, { opacity: 1, duration: 1 }, 1.4)
      .from('#round', { y: 16, duration: .9 }, 2)
      .from('#cue', { opacity: 0, y: 10, duration: .8 }, 2.2);
  }

  /* ---------- scroll ---------- */

  let lenis;
  if (!reduce && window.Lenis) {
    lenis = window.__lenis = new Lenis({ lerp: .1 });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(t => lenis.raf(t * 1000)); gsap.ticker.lagSmoothing(0);
  }

  if (reduce) { drawLaav(1); drawEnd(1); }
  else {
    ScrollTrigger.create({ trigger: '#laav', start: 'top top', end: 'bottom bottom', onUpdate: s => drawLaav(s.progress) });
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

    // Ik Onkar: the ring draws round, the leaves bloom outward, the glyph rises out of light
    const ok = $('#onkar');
    gsap.set($$('circle', ok)[0], { strokeDasharray: 1, strokeDashoffset: 1 });
    const otl = gsap.timeline({ scrollTrigger: { trigger: ok, start: 'top 82%' } });
    otl.to($$('circle', ok)[0], { strokeDashoffset: 0, duration: 1.8, ease: 'power2.inOut' })
      .fromTo($$('circle', ok)[1], { opacity: 0, rotate: -40, transformOrigin: '50% 50%' }, { opacity: 1, rotate: 0, duration: 1.6, ease: 'power2.out' }, .3)
      .from($$('.petals path', ok), { scale: 0, transformOrigin: '100px 100px', opacity: 0, duration: .6, stagger: .04, ease: 'back.out(3)' }, .6)
      .fromTo('.onkar__glyph', { clipPath: 'inset(100% 0 0 0)', y: 20 }, { clipPath: 'inset(0% 0 0 0)', y: 0, duration: 1.4, ease: 'power3.out' }, .5);
    gsap.to('.onkar__ring .petals', { rotate: 360, transformOrigin: '100px 100px', ease: 'none', scrollTrigger: { trigger: '#blessing', start: 'top bottom', end: 'bottom top', scrub: true } });
    gsap.to('.onkar__glyph', { filter: 'drop-shadow(0 0 30px rgba(246,221,156,.7))', duration: 2.4, yoyo: true, repeat: -1, ease: 'sine.inOut' });
    // gold vines grow down both edges as you read
    $$('.vine path').forEach(pth => {
      gsap.set(pth, { strokeDasharray: 1, strokeDashoffset: 1 });
      gsap.to(pth, { strokeDashoffset: 0, ease: 'none', scrollTrigger: { trigger: '#blessing', start: 'top 70%', end: 'bottom 60%', scrub: .6 } });
    });

    // event cards: each oval turns to face you like a coin, its ivory filling from the centre
    ScrollTrigger.batch('.card', {
      start: 'top 88%', once: true,
      onEnter: els => els.forEach((c, i) => {
        const tl = gsap.timeline({ delay: i * .14 });
        tl.fromTo($('.card__oval', c), { rotateY: -85, y: 60, opacity: 0, transformOrigin: '50% 50%' }, { rotateY: 0, y: 0, opacity: 1, duration: 1.3, ease: 'power3.out' })
          .fromTo($('.card__fill', c), { clipPath: 'ellipse(0% 0% at 50% 50%)' }, { clipPath: 'ellipse(75% 75% at 50% 50%)', duration: 1.1, ease: 'power2.out' }, .35)
          .from($$('.card__in > *', c), { y: 14, opacity: 0, duration: .6, stagger: .06, ease: 'power2.out' }, .7)
          .fromTo($('.card__orn path', c), { strokeDasharray: 1, strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1 }, 1)
          .from($('.card__hang', c), { y: -80, opacity: 0, duration: 1.2, ease: 'elastic.out(1, .5)' }, .2);
      })
    });
    $$('.card').forEach((c, i) => gsap.to(c, { yPercent: (i % 3 - 1) * -5, ease: 'none', scrollTrigger: { trigger: c, start: 'top bottom', end: 'bottom top', scrub: true } }));

    // seals swell as they come into view
    $$('.seal').forEach(s => gsap.fromTo(s, { scale: .7 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: s, start: 'top bottom', end: 'center 55%', scrub: true } }));

    // meet: the arch draws up and over as you scroll, the couple steps forward into its light
    $$('.portrait__arch path').forEach((pth, i) => {
      if (!i) gsap.set(pth, { strokeDasharray: 1, strokeDashoffset: 1 });
      gsap.fromTo(pth, i ? { opacity: 0 } : { strokeDashoffset: 1 }, { ...(i ? { opacity: 1 } : { strokeDashoffset: 0 }), ease: 'none', scrollTrigger: { trigger: '#portrait', start: 'top 85%', end: 'center 45%', scrub: .6 } });
    });
    gsap.fromTo('#portrait img', { y: 60, scale: .92, opacity: 0 }, { y: 0, scale: 1, opacity: 1, ease: 'none', scrollTrigger: { trigger: '#portrait', start: 'top 85%', end: 'center 50%', scrub: .6 } });
    gsap.fromTo('.portrait__glow', { opacity: 0, scale: .6 }, { opacity: 1, scale: 1, ease: 'none', scrollTrigger: { trigger: '#portrait', start: 'top 70%', end: 'center 45%', scrub: .6 } });
    gsap.to('#portrait img', { y: -24, ease: 'none', scrollTrigger: { trigger: '#meet', start: 'center center', end: 'bottom top', scrub: true } });

    // RSVP medallion: outer ring, pearls and lotus petals draw in, then the petals keep turning with the scroll
    const md = $('#medal');
    gsap.set($$('circle, path', md), { strokeDasharray: 1, strokeDashoffset: 1 });
    gsap.set($('circle.dots', md), { strokeDasharray: '.001 .016' });
    const mtl = gsap.timeline({ scrollTrigger: { trigger: md, start: 'top 80%' } });
    mtl.to($$('circle', md)[0], { strokeDashoffset: 0, duration: 2, ease: 'power2.inOut' })
      .fromTo($('circle.dots', md), { opacity: 0 }, { opacity: 1, strokeDashoffset: 0, duration: 1.4 }, .4)
      .to($$('.medal__petals path', md), { strokeDashoffset: 0, duration: .9, stagger: .035, ease: 'power1.out' }, .6);
    gsap.to('.medal__petals', { rotate: 50, transformOrigin: '150px 150px', ease: 'none', scrollTrigger: { trigger: '#rsvp', start: 'top bottom', end: 'bottom top', scrub: true } });

    // know: icons draw themselves
    $$('.know svg').forEach(s => { s.style.strokeDasharray = 1; s.style.strokeDashoffset = 1; });
    ScrollTrigger.batch('.know li', {
      start: 'top 88%', once: true,
      onEnter: els => els.forEach((li, i) => gsap.to($('svg', li), { strokeDashoffset: 0, duration: 1.6, delay: .2 + i * .12, ease: 'power2.inOut' }))
    });

    // the moon rises and grows as you scroll past, its halo breathing
    gsap.fromTo('#moon', { y: 140, scale: .8, rotate: -8 }, { y: -20, scale: 1, rotate: 0, ease: 'none', scrollTrigger: { trigger: '#follow', start: 'top bottom', end: 'bottom 70%', scrub: true } });
    gsap.to('.moon__halo', { scale: 1.08, opacity: .7, duration: 2.6, yoyo: true, repeat: -1, ease: 'sine.inOut' });
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
  $('#moon img').style.aspectRatio = L.moon[0] / L.moon[1];
  let rh, lastH = 0;
  new ResizeObserver(() => { const h = document.body.scrollHeight; if (Math.abs(h - lastH) < 2) return; lastH = h; clearTimeout(rh); rh = setTimeout(() => ScrollTrigger.refresh(), 150); }).observe(document.body);
  const ready = () => { layout(); ScrollTrigger.refresh(); intro(); };
  let rt; addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { layout(); ScrollTrigger.refresh(); }, 120); });
  if (document.fonts?.ready) document.fonts.ready.then(() => requestAnimationFrame(ready)); else addEventListener('load', ready);
})();
