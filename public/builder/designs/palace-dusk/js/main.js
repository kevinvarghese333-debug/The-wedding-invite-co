/* Veer & Naina: the drive.
   One car, one evening. It leaves at sunset, runs through the colours of the page and comes home at night.
   Every car scene is a pure function of scroll, so scrolling back up reverses the car cleanly.

   The car scenes share one idea: ground point at depth z sits at  y = horizon + k / z,  and things there
   are drawn at 1 / z of their size. Car, road, lanterns and palace all use it, so they stay locked together. */
(() => {
  'use strict';
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });

  const C = window.INVITE;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const root = document.documentElement;
  const reduce = root.classList.contains('reduced');
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const mix = (a, b, t) => a + (b - a) * t;
  const smooth = (a, b, v) => { const t = clamp((v - a) / (b - a)); return t * t * (3 - 2 * t); };
  scrollTo(0, 0);

  /* ---------- words ---------- */

  for (const [k, v] of Object.entries(C.colours)) root.style.setProperty('--' + k, v);

  const alias = { b: 'blessing', p: 'partner', count: 'countdown' };
  const pick = path => {
    if (path === 'one' || path === 'two') return C.couple[path].first;
    if (path === 'joiner') return C.couple.joiner;
    if (path === 'invocation') return C.blessing.invocation;
    return path.split('.').reduce((o, k) => o?.[alias[k] || k], C);
  };
  $$('[data-t]').forEach(el => { el.textContent = pick(el.dataset.t); });
  $$('[data-lines]').forEach(el => {
    el.replaceChildren(...pick(el.dataset.lines).map(l => Object.assign(document.createElement('span'), { textContent: l })));
  });
  $$('[data-plate]').forEach(el => { el.textContent = C.plate; });

  const fmt = (iso, o) => new Intl.DateTimeFormat('en-GB', { timeZone: C.wedding.timezone, ...o }).format(new Date(iso));
  const clockTime = iso => fmt(iso, { hour: 'numeric', minute: '2-digit', hour12: true }).replace(':00', '').toLowerCase();

  $('#events').innerHTML = C.events.map(e => `
    <li class="card" data-rise>
      <h3 style="--len:${e.name.length}">${e.name}</h3>
      <p><time datetime="${e.start}">${fmt(e.start, { weekday: 'long' })},<br>${fmt(e.start, { day: 'numeric', month: 'long', year: 'numeric' })}</time></p>
      <p>${e.venue}, ${e.place}</p>
      <p>${clockTime(e.start)} onwards</p>
      <a href="${e.map}" target="_blank" rel="noopener">See the route</a>
      <img class="rose rose--a" src="assets/roses.webp" alt="" loading="lazy">
      <img class="rose rose--b" src="assets/roses.webp" alt="" loading="lazy">
    </li>`).join('');

  $('#knowList').innerHTML = C.know.items.map(i => `
    <li data-rise><svg aria-hidden="true"><use href="#i-${i.icon}"/></svg><h3>${i.title}</h3><p>${i.text}</p></li>`).join('');

  const photo = $('#couplePhoto'); photo.src = C.meet.photo; photo.alt = C.meet.alt;

  // A personal link: ?to=Priya
  const guest = (new URLSearchParams(location.search).get('to') || '').trim().slice(0, 40);
  if (guest) { const t = $('#heroTo'); t.textContent = `Dear ${guest},`; t.hidden = false; }
  const names = { one: C.couple.one.first, two: C.couple.two.first };
  const wa = C.rsvp.message.replace('{guest}', guest ? `This is ${guest},` : '').replace('{one}', names.one).replace('{two}', names.two).replace(/\s+/g, ' ').trim();
  $('#routeRing').href = C.route.map;
  $('#rsvpRing').href = `https://wa.me/${C.rsvp.whatsapp}?text=${encodeURIComponent(wa)}`;
  $('#followRing').href = C.follow.instagram;

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
    const b = $('#music'), a = new Audio(C.music); a.loop = true; b.hidden = false; b.textContent = '▶';
    b.addEventListener('click', () => { const on = a.paused; on ? a.play() : a.pause(); b.textContent = on ? '❚❚' : '▶'; b.setAttribute('aria-pressed', on); b.setAttribute('aria-label', on ? 'Pause music' : 'Play music'); });
  }

  /* ---------- a painted scene: sky, palace, road, lanterns, car ---------- */

  const probe = $('.probe');
  const dpr = () => Math.min(devicePixelRatio || 1, 1.75);
  const GATE = 180 / 3200;   // how wide the palace gate is, as a share of its picture

  class Scene {
    constructor(el, { road, fog, lantern, car }) {
      this.el = el; this.sky = $('.sky', el); this.palace = $('.palace', el); this.car = $(car, el);
      this.body = $('.car__body', this.car); this.lamps = $$('.lamp', this.car);
      this.ground = new Ground($('.ground', el), road, fog);
      this.lanterns = [];
      const box = $('.lanterns', el);
      for (let i = 0; i < 9; i++) for (const side of [-1, 1]) {
        const d = document.createElement('div'); d.className = 'lantern';
        d.innerHTML = `<img src="${lantern}" alt="">`; box.append(d);
        this.lanterns.push({ el: d, z: 1.7 + i * 1.5, side });
      }
    }
    measure() {
      const { el, palace, car } = this, W = this.W = el.clientWidth, H = this.H = el.clientHeight, S = probe.clientHeight, tall = W < H;
      this.hz = S * (tall ? .565 : .655);                 // the horizon, in pixels from the top
      this.k = H - this.hz;                               // z = 1 is the bottom edge of the screen
      const contact = S * (tall ? .915 : .925);           // where the tyres touch when the car is at rest
      this.zc = this.k / (contact - this.hz);
      this.cw = car.offsetWidth; this.ch = car.offsetHeight;
      this.Rw = .8 * this.cw * this.zc;                   // half the road, measured at z = 1
      const pw = palace.offsetWidth, ph = palace.offsetHeight || pw * 1010 / 3200;
      this.zp = 2 * this.Rw / (pw * GATE);                // the depth where the road is as wide as the gate
      this.yb = this.hz + this.k / this.zp;               // so that is where the palace must stand
      palace.style.top = (this.yb - ph) + 'px';
      palace.style.transformOrigin = `50% ${this.hz - (this.yb - ph)}px`;
      this.sky.style.transformOrigin = `50% ${this.hz}px`;
      this.travel = this.zp * .46;                        // how far the camera drives
      const lh = this.ch * this.zc * .86;
      this.lanterns.forEach(l => { l.el.style.height = lh + 'px'; l.w = lh * .375; l.h = lh; });
      this.ground.size(W, H, dpr());
    }
    // cam: how far the camera has come up the road
    world(cam) {
      const { W, hz, k, zp, Rw } = this;
      const near = zp - cam;
      this.ground.draw({ hz, k, off: cam, halfTile: Rw / .62, len: 3.4, fogNear: Math.min(7, near * .5), fogFar: near + 1 });
      this.palace.style.transform = `scale(${zp / near})`;
      for (const l of this.lanterns) {
        const z = l.z - cam, show = z > .34 && z < near - .25;
        if (show !== l.on) { l.on = show; l.el.style.visibility = show ? 'visible' : 'hidden'; }
        if (!show) continue;
        const s = 1 / z, x = W / 2 + l.side * Rw * 1.17 * s, y = hz + k * s;
        l.el.style.transform = `translate3d(${x - l.w / 2}px,${y - l.h}px,0) scale(${s})`;
        l.el.style.opacity = clamp((z - .34) / .3);
      }
    }
    // z: how far the car is in front of the camera. x: sideways, at z = 1
    putCar(z, x = 0, tilt = 0) {
      const { W, hz, k, cw, ch, zc } = this, s = zc / z;
      this.carPos = [W / 2 + x / z, hz + k / z, s];
      this.car.style.transform = `translate3d(${W / 2 + x / z - cw / 2}px,${hz + k / z - ch}px,0) rotate(${tilt}deg) scale(${s})`;
    }
  }

  const hero = new Scene($('#hero .scene'), { road: 'assets/road-dusk.webp', fog: [.86, .55, .4], lantern: 'assets/lantern-dusk.webp', car: '.car--rear' });
  const home = new Scene($('#finale .scene'), { road: 'assets/road-night.webp', fog: [.2, .19, .46], lantern: 'assets/lantern-night.webp', car: '.car--night' });

  const flare = $('#hero .flare'), words = $('.hero__words'), cue = $('#cue'), rearCar = $('.car--rear');
  const count = $('#count'), pool = $('.pool');

  /* ---------- stages: scroll in, smoothed progress and speed out ---------- */

  const stages = [];
  const stage = (el, render, fixed) => {
    const o = { el, render, raw: 0, p: 0, prev: 0, speed: 0, on: false, fixed };
    if (!reduce) {
      ScrollTrigger.create({ trigger: el, start: 'top top', end: 'bottom bottom', onUpdate: s => { o.raw = s.progress; }, onRefresh: s => { o.raw = s.progress; } });
      ScrollTrigger.create({ trigger: el, start: 'top bottom', end: 'bottom top', onToggle: s => { o.on = s.isActive; } });
    }
    stages.push(o); return o;
  };

  /* Sunset: the camera follows the car up the road, then the car pulls away through the gate. */
  let intro = reduce ? 0 : 1;
  stage($('#hero'), (o, t) => {
    const S = hero, p = o.p, go = clamp(o.speed * 2.6);
    const cam = S.travel * smooth(0, .96, p);
    S.world(cam);
    S.sky.style.transform = `scale(${1 + .07 * p})`;
    const pull = smooth(.6, .95, p) ** 2.2;
    const z = mix(S.zc * (1 - .42 * intro), S.zp - cam - .35, pull);
    const sway = Math.sin(cam * 1.6) * S.Rw * .1 * smooth(0, .12, p) * (1 - pull);
    S.putCar(z, sway, sway / S.Rw * 3);
    const idle = 1 - clamp(go * 5);
    S.body.style.transform = `translate3d(0,${Math.sin(cam * 24) * 2.6 * go + Math.sin(t * 44) * .5 * idle}px,0) rotate(${Math.sin(cam * 11) * .3 * go}deg)`;
    S.car.style.opacity = (1 - smooth(.91, .985, p)) * clamp(1.4 - intro * 1.6);
    // the brake lights come on whenever you stop scrolling
    S.lamps.forEach(l => l.style.setProperty('--o', (.16 + .78 * idle * idle).toFixed(3)));
    rearCar.classList.toggle('is-idle', p < .012 && intro < .3);
    flare.style.top = S.yb + 'px';
    flare.style.opacity = smooth(.78, .97, p) * .95;
    words.style.opacity = (1 - smooth(.02, .13, p)) * (1 - intro);
    words.style.transform = `translate3d(0,${-70 * smooth(0, .15, p) + 16 * intro}px,0)`;
    cue.style.opacity = (1 - smooth(.003, .03, p)) * (intro < .2 ? 1 : 0);
  });

  /* Side on: the wheels turn exactly as far as the car has rolled. */
  const side = $('.car--side'), sideBody = $('.car__body', side), trail = $('.trail');
  const rims = $$('.wheel img:not(.wheel__blur)', side), spun = $$('.wheel__blur', side);
  stage($('#route'), o => {
    const pin = o.el.firstElementChild, W = pin.clientWidth, H = probe.clientHeight, cw = side.offsetWidth, ch = side.offsetHeight;
    const kerb = parseFloat(getComputedStyle(root).getPropertyValue('--kerb')) / 100;
    const from = -cw * 1.04, to = W + cw * .06, x = mix(from, to, o.fixed ?? o.p);
    const line = pin.clientHeight - pin.clientHeight * kerb;
    const go = clamp(o.speed * 1.9);
    const roll = x / (2 * Math.PI * cw * .0738) * 360;
    rims.concat(spun).forEach(w => { w.style.transform = `rotate(${roll}deg)`; });
    spun.forEach(w => { w.style.opacity = smooth(.34, .9, go); });
    rims.forEach(w => { w.style.opacity = 1 - smooth(.5, 1, go) * .75; });
    side.style.transform = `translate3d(${x}px,${line - ch * .94}px,0)`;
    sideBody.style.transform = `translate3d(0,${Math.sin(x * .05) * 1.5 * go}px,0) rotate(${-.55 * go + Math.sin(x * .021) * .22 * go}deg)`;
    trail.style.width = Math.max(0, x + cw * .06) + 'px';
    void H;
  }, reduce ? .42 : undefined);

  /* Head on: from a dot on the colour line to full size, then the next colour carries it away. */
  const front = $('.car--front'), frontBody = $('.car__body', front), frontLamps = $$('.lamp', front);
  stage($('#rsvp'), o => {
    const pin = o.el.firstElementChild, W = pin.clientWidth, H = probe.clientHeight, cw = front.offsetWidth, ch = front.offsetHeight;
    const kerb = parseFloat(getComputedStyle(root).getPropertyValue('--kerb')) / 100;
    const e = 1 - (1 - clamp((o.fixed ?? o.p) / .94)) ** 2.3;
    const z = mix(13, 1, e), s = 1 / z, top = pin.clientHeight * (1 - kerb), end = H - Math.min(26, H * .03);
    const go = clamp(o.speed * 2.2);
    front.style.transform = `translate3d(${W / 2 - cw / 2}px,${top + (end - top) * s - ch}px,0) scale(${s})`;
    frontBody.style.transform = `translate3d(0,${Math.sin(z * 9) * 2.2 * go}px,0) rotate(${Math.sin(z * 5) * .35 * go}deg)`;
    frontLamps.forEach(l => l.style.setProperty('--o', .34 + .42 * (1 - s)));
  }, reduce ? 1 : undefined);

  /* Night: the car comes back down the road towards you and stops with its lights on. */
  stage($('#finale'), (o, t) => {
    const S = home, p = o.fixed ?? o.p, e = 1 - (1 - clamp(p / .78)) ** 2.5, go = clamp(o.speed * 2.6);
    const cam = S.travel * .55 * (1 - e);
    S.world(cam);
    S.sky.style.transform = `scale(${1.05 - .05 * e})`;
    const z = mix(S.zp - cam - .4, S.zc, e);
    S.putCar(z, 0, 0);
    S.body.style.transform = `translate3d(0,${Math.sin(z * 22) * 2.4 * go}px,0)`;
    S.lamps.forEach(l => l.style.setProperty('--o', .55 + .4 * smooth(.2, 1, e)));
    const [cx, cy, cs] = S.carPos;
    pool.style.transform = `translate3d(${cx}px,${cy + S.ch * .05 * cs}px,0) scale(${cs})`;
    pool.style.opacity = smooth(.15, .9, e);
    count.style.opacity = smooth(.5, .76, p);
    count.style.transform = `translate3d(0,${18 * (1 - smooth(.5, .76, p))}px,0)`;
  }, reduce ? 1 : undefined);

  /* ---------- one clock for everything ---------- */

  const measure = () => { hero.measure(); home.measure(); stages.forEach(s => { s.dirty = true; }); };
  let last = 0;
  const frame = time => {
    const dt = Math.min(.05, time - last) || .016; last = time;
    for (const o of stages) {
      if (!(o.on || o.dirty || (o === stages[0] && intro > 0))) continue;
      o.p += (o.raw - o.p) * (1 - Math.exp(-dt * 11));       // a heavy car does not stop dead
      const v = Math.abs(o.p - o.prev) / dt; o.prev = o.p;
      o.speed += (v - o.speed) * (1 - Math.exp(-dt * 7));
      o.dirty = false;
      o.render(o, time);
    }
  };

  /* ---------- smooth wheel scrolling on desktop; touch stays native ---------- */

  let lenis = null;
  if (!reduce && window.Lenis) {
    lenis = new Lenis({ lerp: .1 });
    window.__lenis = lenis;
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(t => lenis.raf(t * 1000));
  }
  gsap.ticker.lagSmoothing(0);
  gsap.ticker.add(frame);

  /* ---------- things that rise in ---------- */

  if (!reduce) {
    ScrollTrigger.batch('[data-rise]', {
      start: 'top 90%', once: true,
      onEnter: els => gsap.to(els, { opacity: 1, y: 0, duration: 1, ease: 'power3.out', stagger: .09, overwrite: true })
    });
  }

  /* ---------- start ---------- */

  const veil = document.createElement('div'); veil.className = 'veil';
  veil.textContent = `${names.one} & ${names.two}`; document.body.prepend(veil);

  addEventListener('resize', () => { measure(); ScrollTrigger.refresh(); });

  const loaded = src => new Promise(r => { const i = new Image(); i.onload = i.onerror = r; i.src = src; });
  Promise.race([
    Promise.all([loaded('assets/sky-dusk.webp'), loaded('assets/palace-dusk.webp'), loaded('assets/car-rear.webp'), hero.ground.loaded, document.fonts?.ready]),
    new Promise(r => setTimeout(r, 6000))
  ]).then(() => {
    measure();
    ScrollTrigger.refresh();
    root.classList.add('ready');
    // fetch the rest one at a time, in page order, so a fast scroller never reaches a scene with its car missing
    [...$$('img[loading=lazy]')].reduce((turn, i) => turn.then(() => new Promise(next => {
      if (i.complete && i.naturalWidth) return next();
      i.addEventListener('load', next, { once: true });
      i.addEventListener('error', next, { once: true });
      i.loading = 'eager';
    })), Promise.resolve());
    setTimeout(() => veil.remove(), 1100);
    if (reduce) { stages.forEach(o => { o.p = o.raw = 0; o.render(o, 0); }); return; }
    const box = { v: 1 };
    gsap.to(box, { v: 0, duration: 2.1, delay: .25, ease: 'power3.out', onUpdate: () => { intro = box.v; } });
  });

  window.__invite = { hero, home, stages };
})();
