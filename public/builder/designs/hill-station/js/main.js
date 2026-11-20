/* Aarav & Tanvi: a night in the hills.
   The opening is a paper-cut diorama under a starry sky. Scrolling walks you through its gold arch,
   past Shiva and Parvati, into the valley, where a balloon rises and the hotel drifts in on a cloud.
   Every scene is a pure function of scroll, so scrolling back up plays it backwards. */
(() => {
  'use strict';
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });

  const C = window.INVITE, S = window.Scenery;
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
  root.style.setProperty('--damask', S.damask(C.colours.gold, .16));
  root.style.setProperty('--buti', S.buti(C.colours.sage, .2));
  root.style.setProperty('--florals', S.florals(C.colours.gold, .13));

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

  // Split into letters, keeping each word together so lines still wrap between words.
  const split = el => {
    const parts = el.children.length ? [...el.children] : [el];
    parts.forEach(part => {
      const words = part.textContent.split(/(\s+)/);
      part.textContent = '';
      words.forEach(w => {
        if (!w) return;
        if (/^\s+$/.test(w)) { part.append(' '); return; }
        const box = document.createElement('span'); box.style.cssText = 'display:inline-block;white-space:nowrap';
        [...w].forEach(ch => box.append(Object.assign(document.createElement('span'), { className: 'ch', textContent: ch })));
        part.append(box);
      });
    });
    return $$('.ch', el);
  };
  $$('[data-split]').forEach(split);

  // the date written into the sky
  const dl = $('#dateline');
  dl.setAttribute('aria-label', C.dateLine.replace('\n', ', '));
  dl.innerHTML = '<small>Save the date</small>';
  const dateChars = [...C.dateLine].flatMap(ch => { if (ch === '\n') { dl.append(document.createElement('br')); return []; } const s = document.createElement('span'); s.className = 'ch'; s.textContent = ch === ' ' ? '\u00a0' : ch; dl.append(s); return [s]; });

  const fmt = (iso, o) => new Intl.DateTimeFormat('en-GB', { timeZone: C.wedding.timezone, ...o }).format(new Date(iso));
  const clockTime = iso => fmt(iso, { hour: 'numeric', minute: '2-digit', hour12: true }).replace(':00', '').toLowerCase();
  const miniCloud = '<svg class="oval__cloud" viewBox="0 0 120 50" aria-hidden="true"><g fill="#e9eef7"><circle cx="30" cy="34" r="14"/><circle cx="52" cy="24" r="20"/><circle cx="78" cy="30" r="15"/><circle cx="96" cy="36" r="10"/><rect x="18" y="34" width="86" height="12" rx="6"/></g><rect x="20" y="44" width="82" height="3" rx="1.5" fill="#bccbe2"/></svg>';

  $('#events').innerHTML = C.events.map(e => `
    <li class="card">
      <div class="oval">
        <div class="oval__img"><img src="${e.art}" alt="${e.name} illustration" loading="lazy"></div>
        <svg class="oval__ring" viewBox="0 0 300 500" preserveAspectRatio="none" aria-hidden="true">
          <ellipse cx="150" cy="250" rx="147" ry="247" pathLength="1" stroke-width="2" vector-effect="non-scaling-stroke"/>
          <ellipse cx="150" cy="250" rx="139" ry="239" pathLength="1" stroke-width="1" vector-effect="non-scaling-stroke"/>
        </svg>
        <img class="oval__balloon" src="assets/balloon.webp" alt="" aria-hidden="true" loading="lazy">
        <div class="oval__moon" aria-hidden="true"><i></i></div>
        ${miniCloud}
      </div>
      <h3 data-rise>${e.name}</h3>
      <p data-rise><time datetime="${e.start}">${fmt(e.start, { weekday: 'long' })}, ${fmt(e.start, { day: 'numeric', month: 'long', year: 'numeric' })}</time></p>
      <p data-rise>${e.venue}, ${e.place}<br>${clockTime(e.start)} onwards</p>
      <a data-rise href="${e.map}" target="_blank" rel="noopener">See the route</a>
    </li>`).join('');

  $('#knowList').innerHTML = C.know.items.map(i => `
    <li data-rise><svg aria-hidden="true"><use href="#i-${i.icon}"/></svg><h3>${i.title}</h3><p>${i.text}</p></li>`).join('');
  // <use> content cannot be styled per instance, so copy the icon paths in
  $$('#knowList svg').forEach(svg => {
    const sym = $(svg.firstElementChild.getAttribute('href'));
    svg.setAttribute('viewBox', sym.getAttribute('viewBox'));
    // one path per stroke, so each part draws fully on its own
    svg.innerHTML = [...sym.querySelectorAll('path')]
      .flatMap(p => p.getAttribute('d').split(/(?=M)/))
      .map(d => `<path pathLength="1" d="${d}"/>`).join('');
  });

  const photo = $('#couplePhoto'); photo.src = C.meet.photo; photo.alt = C.meet.alt;

  // A personal link: ?to=The Rawat Family
  const guest = (new URLSearchParams(location.search).get('to') || '').trim().slice(0, 40);
  if (guest) { const t = $('#heroTo'); t.textContent = `Dear ${guest},`; t.hidden = false; }
  const names = { one: C.couple.one.first, two: C.couple.two.first };
  const wa = C.rsvp.message.replace('{guest}', guest ? `This is ${guest},` : '').replace('{one}', names.one).replace('{two}', names.two).replace(/\s+/g, ' ').trim();
  $('#routeRing').href = C.route.map;
  $('#rsvpRing').href = `https://wa.me/${C.rsvp.whatsapp}?text=${encodeURIComponent(wa)}`;
  $('#followRing').href = C.follow.instagram;

  /* ---------- drawn scenery ---------- */

  const scallop = S.scallops(24);
  $$('.edge path').forEach(p => p.setAttribute('d', scallop));
  S.mandala($('#mandala'), C.colours.gold);
  S.rays($('.sunburst__rays'), '#c99a45');

  const navy = C.colours.navy;
  const ridges = S.buildHills($('#hills'), [
    { fill: '#3a5a8e', top: '#5678ad', base: 270, amp: 95, waves: [1, 2.3, 5.1], pines: 0, pineH: 0, mist: .55 },
    { fill: '#2c4b7f', top: '#3f6198', base: 350, amp: 62, waves: [1.4, 3.3, 7], pines: 46, pineH: 30, mist: .35 },
    { fill: '#213e6e', top: '#2f5187', base: 440, amp: 46, waves: [1.8, 3.9, 8], pines: 52, pineH: 46, mist: .2 },
    { fill: '#17305b', top: '#21406f', base: 530, amp: 34, waves: [2.2, 5], pines: 40, pineH: 64 },
    { fill: navy, top: '#163159', base: 625, amp: 24, waves: [2.6, 6], pines: 30, pineH: 86 }
  ], 7);
  const clouds = S.buildClouds($('#clouds'), [
    { top: 40, w: 26, x: .05, sp: .5, drift: 6, fill: '#c9d6ea', shade: '#9fb2d0' },
    { top: 44, w: 34, x: .62, sp: -.4, drift: 5, fill: '#dde6f3', shade: '#b4c4dd' },
    { top: 58, w: 22, x: .3, sp: .7, drift: 8 },
    { top: 36, w: 18, x: .82, sp: .3, drift: 4, fill: '#b9c8e0', shade: '#94a8c8' }
  ], 3);
  const nightRidges = S.buildHills($('#hillsNight'), [
    { fill: '#203761', top: '#2c4777', base: 300, amp: 90, waves: [1.1, 2.6, 5], pines: 0, pineH: 0, mist: .25 },
    { fill: '#182c52', top: '#223a66', base: 400, amp: 55, waves: [1.5, 3.4], pines: 50, pineH: 36 },
    { fill: '#112243', top: '#192f57', base: 500, amp: 40, waves: [2, 4.6], pines: 44, pineH: 56 },
    { fill: '#0a1730', top: '#10213f', base: 610, amp: 26, waves: [2.6, 6], pines: 30, pineH: 84 }
  ], 19);
  const roadPath = S.routeMap($('#routeMap'), { gold: C.colours.gold, navy, tall: innerWidth < innerHeight });

  const heroStars = new S.Stars($('#hero .stars'), { count: 110, sparkles: 16, seed: 11 });
  const nightStars = new S.Stars($('#finale .stars'), { count: 140, sparkles: 18, seed: 23 });

  /* ---------- countdown ---------- */

  const clock = $('#clock'), target = new Date(C.wedding.start).getTime();
  clock.innerHTML = ['days', 'hours', 'mins', 'secs'].map(l => `<span><b>00</b><small>${l}</small></span>`).join('');
  const digits = $$('b', clock);
  const tick = () => {
    const left = target - Date.now();
    if (left <= 0) { $('.count__title').textContent = C.countdown.done; clock.hidden = true; return; }
    const s = Math.floor(left / 1000);
    [Math.floor(s / 86400), Math.floor(s / 3600) % 24, Math.floor(s / 60) % 60, s % 60].forEach((v, i) => {
      const txt = String(v).padStart(2, '0'), d = digits[i];
      if (d.textContent === txt) return;
      d.textContent = txt;
      if (!reduce) { d.classList.remove('flip'); void d.offsetWidth; d.classList.add('flip'); }
    });
  };
  tick(); setInterval(tick, 1000);

  /* ---------- music, only if a file is named in config ---------- */

  if (C.music) {
    const b = $('#music'), a = new Audio(C.music); a.loop = true; b.hidden = false;
    b.addEventListener('click', () => {
      const on = a.paused; on ? a.play() : a.pause();
      b.setAttribute('aria-pressed', on); b.setAttribute('aria-label', on ? 'Pause music' : 'Play music');
    });
  }

  /* ---------- the opening ---------- */

  const pin = $('#hero .pin'), medal = $('.medallion'), halo = $('.halo');
  const words = $('.words'), cue = $('#cue');
  const hotel = $('.hotel'), balloon = $('.balloon'), moon = $('#hero .moon');
  const bands = { back: $('.band--back'), mid: $('.band--mid'), front: $('.band--front') };
  const sides = { back: $$('.side--back'), front: $$('.side--front') };
  const LEAF = 899 / 2200;
  let M = {};

  // How far each layer has grown in on arrival: 0 is hidden below the screen, 1 is in place.
  // They come up one after another, back to front, like a pop-up book opening.
  const grow = { back: 0, sideBack: 0, mid: 0, sideFront: 0, front: 0 };
  if (reduce) Object.keys(grow).forEach(k => { grow[k] = 1; });

  const measure = () => {
    const W = pin.clientWidth, H = pin.clientHeight, tall = W < H;
    const vis = Math.min(W * (tall ? .22 : .26), H * .22);
    M = { W, H, tall, vis, visb: vis * 1.45,
      lw: H * 1.04 * LEAF, lwb: H * .96 * LEAF, ms: medal.offsetWidth,
      bandH: { back: bands.back.offsetHeight, mid: bands.mid.offsetHeight, front: bands.front.offsetHeight },
      hw: hotel.offsetWidth, hh: hotel.offsetWidth * 1111 / 1489,
      balW: balloon.offsetWidth, balH: balloon.offsetWidth * 1.754 };
    moon.style.setProperty('--m', moon.offsetWidth + 'px');
    heroStars.size(); nightStars.size();
    $$('.finale__moon').forEach(m => m.style.setProperty('--m', m.offsetWidth + 'px'));
  };

  let intro = reduce ? 0 : 1;
  const renderHero = (p, t) => {
    if (!M.bandH) return;                                   // not measured yet
    const { W, H, tall, vis, visb, lw, lwb, ms, bandH } = M;
    const k = 1 - intro;                                     // 0 while the page is still settling in
    const walk = smooth(.3, .66, p), part = smooth(.28, .6, p);
    // a soft breeze: two slow waves, a different phase for every layer
    const breeze = (ph, a) => (Math.sin(t * .55 + ph) + .35 * Math.sin(t * 1.27 + ph * 2.3)) * a;

    // the three bands grow up from below, then sink away at their own speeds as you walk through
    const band = (key, sink, swell, ph) => {
      const el = bands[key], g = grow[key];
      const y = (1 - g) * (bandH[key] + 60) + walk * H * sink;
      const tilt = (1 - g) * (key === 'mid' ? 3 : -3) + breeze(ph, .35) * (1 - walk);
      el.style.transform = `translate3d(-50%,${y}px,0) rotate(${tilt}deg) scale(${1 + walk * swell},${1 + walk * swell + breeze(ph + 1, .012)})`;
    };
    band('back', .3, .12, 0);
    band('mid', .5, .28, 1.7);
    band('front', .78, .5, 3.1);

    // the side layers slide in from the edges, sway, then part like curtains
    const side = (els, g, w, v, out, ph, swell) => {
      const off = (1 - g) * (v + 80) + part * (v + 90) * out, lift = (1 - g) * H * .18;
      const rot = breeze(ph, .9) * (1 - part) + (1 - g) * 4;
      els[0].style.transform = `translate3d(${-(w - v) - off}px,${lift}px,0) rotate(${-rot}deg) scale(${1 + part * swell})`;
      els[1].style.transform = `translate3d(${W - v + off}px,${lift}px,0) scaleX(-1) rotate(${-rot}deg) scale(${1 + part * swell})`;
    };
    side(sides.back, grow.sideBack, lwb, visb, .7, .9, .1);
    side(sides.front, grow.sideFront, lw, vis, 1, 2.4, .25);

    // Shiva and Parvati rise up between the back and middle layers, glow, then drift up and away
    const mIn = smooth(.04, .3, p), mOut = smooth(.4, .54, p);
    const my = mix(H * 1.02, H * (tall ? .52 : .47), mIn) - ms / 2 - mOut * H * .16;
    medal.style.transform = `translate3d(-50%,${my}px,0) scale(${(.84 + .16 * mIn) * (1 + mOut * .45)})`;
    medal.style.opacity = smooth(.02, .1, p) * (1 - mOut);
    halo.style.opacity = .55 + .45 * Math.sin(t * 1.6);

    // the names lift away as Shiva and Parvati come up
    words.style.opacity = (1 - smooth(.08, .26, p));
    words.style.transform = `translate3d(0,${-H * .22 * smooth(0, .3, p)}px,0)`;
    cue.style.opacity = (1 - smooth(.004, .03, p)) * (intro < .25 ? 1 : 0);

    // the valley: hills settle, clouds drift, the hotel sails in on its cloud, the balloon climbs
    const v = smooth(.18, .78, p);
    ridges.forEach((r, i) => {
      const d = (ridges.length - i) / ridges.length;
      r.style.transform = `translate3d(0,${(1 - v) * H * .12 * (1.4 - d) + intro * 40}px,0) scale(${1 + (1 - v) * .06 * (1 - d)})`;
    });
    clouds.forEach(c => {
      const x = ((c.x + c.sp * p * .6 + t * .004 * c.drift) % 1.3 + 1.3) % 1.3 - .25;
      c.el.style.transform = `translate3d(${x * W}px,${-p * H * .05 * c.sp}px,0)`;
      c.el.style.opacity = smooth(.16, .36, p);
    });
    const h = smooth(.42, .76, p);
    hotel.style.opacity = smooth(.4, .55, p);
    hotel.style.transform = `translate3d(${mix(W * 1.05, W * (tall ? .6 : .68), h) - M.hw / 2}px,${mix(H * .5, H * (tall ? .56 : .52), h) - M.hh / 2 + Math.sin(t * .8) * 4}px,0)`;
    const b = smooth(.36, .95, p);
    const bx = mix(W * (tall ? .14 : .2), W * (tall ? .2 : .26), b) + Math.sin(b * 5) * W * .03;
    const by = mix(H * 1.05, H * (tall ? .4 : .38), b);
    balloon.style.transform = `translate3d(${bx - M.balW / 2}px,${by - M.balH / 2}px,0) scale(${.75 + .25 * b})`;
    balloon.style.opacity = smooth(.36, .44, p);

    moon.style.transform = `translate3d(0,${p * H * .06}px,0) rotate(${-25 + p * 70}deg)`;

    // the date is written into the sky one letter at a time
    const n = dateChars.length;
    dl.firstElementChild.style.opacity = smooth(.68, .76, p);
    dateChars.forEach((c, i) => {
      const q = smooth(.7 + i / n * .16, .74 + i / n * .16, p);
      c.style.opacity = q;
      c.style.transform = `translate3d(0,${(1 - q) * 14}px,0) rotate(${(1 - q) * (i % 2 ? 10 : -10)}deg)`;
    });

    heroStars.draw(t, p * H * .5 * k);
  };

  /* ---------- the route: a balloon follows the road up the hill ---------- */

  const routeEl = $('#route'), mapSvg = $('#routeMap'), reveal = $('#roadReveal'), rBalloon = $('#routeBalloon');
  const rmHotel = $('.rm-hotel'), rmPin = $('.rm-pin'), rmRidges = $$('.rm-ridge');
  const roadLen = roadPath.getTotalLength();
  const renderRoute = (p, t) => {
    const r = smooth(.05, .82, p);
    reveal.style.strokeDashoffset = 1 - r;
    const pt = roadPath.getPointAtLength(roadLen * r);
    const m = mapSvg.getScreenCTM(), box = routeEl.firstElementChild.getBoundingClientRect();
    if (m) {
      const x = m.a * pt.x + m.c * pt.y + m.e - box.left, y = m.b * pt.x + m.d * pt.y + m.f - box.top;
      const bw = rBalloon.offsetWidth, bh = bw * 1.754;
      rBalloon.style.transform = `translate3d(${x - bw / 2}px,${y - bh - 10 + Math.sin(t * 2) * 5}px,0) rotate(${Math.sin(t * 1.3) * 2}deg)`;
    }
    rmHotel.style.opacity = smooth(.6, .85, p);
    rmPin.style.opacity = smooth(.75, .85, p);
    rmRidges.forEach((g, i) => { g.style.transform = `translateY(${(1 - p) * (3 - i) * 14}px)`; });
  };

  /* ---------- the finale: the moon rises, the countdown appears ---------- */

  const finEl = $('#finale'), fMoon = $('.finale__moon'), fBalloon = $('.finale__balloon'), count = $('#count');
  const renderFinale = (p, t) => {
    const H = finEl.firstElementChild.clientHeight, W = finEl.firstElementChild.clientWidth;
    const m = smooth(0, .7, p);
    fMoon.style.transform = `translate3d(0,${mix(H * .72, H * .1, m)}px,0)`;
    nightRidges.forEach((r, i) => { r.style.transform = `translate3d(0,${(1 - m) * (nightRidges.length - i) * 16}px,0)`; });
    const b = smooth(.05, 1, p), bw = fBalloon.offsetWidth;
    fBalloon.style.transform = `translate3d(${mix(-bw, W + bw, b)}px,${mix(H * .42, H * .18, b) + Math.sin(t * 1.4) * 6}px,0)`;
    count.style.opacity = smooth(.3, .55, p);
    count.style.transform = `translate3d(0,${24 * (1 - smooth(.3, .55, p))}px,0)`;
    nightStars.draw(t, 0);
  };

  /* ---------- stages: scroll in, smoothed progress out ---------- */

  const stages = [];
  const addStage = (el, render) => {
    const o = { el, render, raw: 0, p: 0, on: false };
    if (!reduce) {
      ScrollTrigger.create({ trigger: el, start: 'top top', end: 'bottom bottom', onUpdate: s => { o.raw = s.progress; }, onRefresh: s => { o.raw = s.progress; } });
      ScrollTrigger.create({ trigger: el, start: 'top bottom', end: 'bottom top', onToggle: s => { o.on = s.isActive; } });
    } else o.on = true;
    stages.push(o); return o;
  };
  const heroStage = addStage($('#hero'), o => renderHero(o.p, o.t));
  addStage(routeEl, o => renderRoute(reduce ? 1 : o.p, o.t));
  addStage(finEl, o => renderFinale(reduce ? 1 : o.p, o.t));

  /* ---------- the mandala and the sunburst turn with scroll and time ---------- */

  const mRings = $$('#mandala .m-ring'), rays = $('.sunburst__rays');
  let mandalaOn = false, raysOn = false;
  new IntersectionObserver(([e]) => { mandalaOn = e.isIntersecting; }).observe($('#mandala'));
  new IntersectionObserver(([e]) => { raysOn = e.isIntersecting; }).observe(rays);

  /* ---------- one clock for everything ---------- */

  let last = 0;
  const frame = time => {
    const dt = Math.min(.05, time - last) || .016; last = time;
    for (const o of stages) {
      if (!(o.on || (o === heroStage && intro > 0))) continue;
      o.p += (o.raw - o.p) * (1 - Math.exp(-dt * 9));
      o.t = time;
      o.render(o);
    }
    if (mandalaOn && !reduce) {
      const sy = scrollY * .04;
      mRings.forEach(r => { r.setAttribute('transform', `rotate(${((sy + time * 5) * +r.dataset.spin).toFixed(2)})`); });
    }
    if (raysOn && !reduce) rays.style.transform = `rotate(${(scrollY * .05 + time * 3).toFixed(2)}deg)`;
  };

  let lenis = null;
  if (!reduce && window.Lenis) {
    lenis = new Lenis({ lerp: .1 });
    window.__lenis = lenis;
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(t => lenis.raf(t * 1000));
  }
  gsap.ticker.lagSmoothing(0);
  gsap.ticker.add(frame);

  /* ---------- section motion ---------- */

  const letterIn = (chars, delay = 0) => gsap.fromTo(chars,
    { opacity: 0, y: 46, rotation: () => gsap.utils.random(-16, 16), transformOrigin: '50% 100%' },
    { opacity: 1, y: 0, rotation: 0, duration: 1.1, ease: 'back.out(1.6)', stagger: .055, delay, overwrite: true });

  if (!reduce) {
    ScrollTrigger.batch('[data-rise]', {
      start: 'top 90%', once: true,
      onEnter: els => gsap.to(els, { opacity: 1, y: 0, duration: 1, ease: 'power3.out', stagger: .09, overwrite: true })
    });
    $$('[data-split]').filter(el => !el.closest('#hero')).forEach(el => {
      ScrollTrigger.create({ trigger: el, start: 'top 88%', once: true, onEnter: () => letterIn($$('.ch', el)) });
    });

    // Ganesha draws downwards as you read
    gsap.fromTo('#ganesha', { '--draw': '0%' }, { '--draw': '100%', ease: 'none', scrollTrigger: { trigger: '#ganesha', start: 'top 88%', end: 'bottom 52%', scrub: .6 } });

    // each oval: the gold ring draws, the picture settles, the moon turns, the cloud drifts
    $$('.card').forEach((card, i) => {
      const st = { trigger: card, start: 'top 96%', end: 'center 50%', scrub: .8 };
      gsap.fromTo(card.querySelector('.oval'), { '--ring': 1, '--zoom': 1.22 }, { '--ring': 0, '--zoom': 1, ease: 'none', scrollTrigger: st });
      gsap.fromTo(card.querySelector('.oval__moon'), { rotation: -50 }, { rotation: 40, ease: 'none', scrollTrigger: { trigger: card, start: 'top bottom', end: 'bottom top', scrub: 1 } });
      gsap.fromTo(card.querySelector('.oval__cloud'), { xPercent: i % 2 ? 30 : -30 }, { xPercent: i % 2 ? -14 : 14, ease: 'none', scrollTrigger: { trigger: card, start: 'top bottom', end: 'bottom top', scrub: 1 } });
    });

    // the couple: sprigs sway in, the arch frame draws, the photo settles
    gsap.fromTo('.sprig--l', { rotation: -14, xPercent: -30 }, { rotation: 4, xPercent: -8, ease: 'none', scrollTrigger: { trigger: '#meet', start: 'top bottom', end: 'center center', scrub: 1 } });
    gsap.fromTo('.sprig--r', { rotation: 14, xPercent: 30, scaleX: -1 }, { rotation: -4, xPercent: 8, scaleX: -1, ease: 'none', scrollTrigger: { trigger: '#meet', start: 'top bottom', end: 'center center', scrub: 1 } });
    gsap.fromTo('#archPhoto', { '--ring': 1, '--zoom': 1.16 }, { '--ring': 0, '--zoom': 1, ease: 'none', scrollTrigger: { trigger: '#archPhoto', start: 'top 92%', end: 'center 55%', scrub: .8 } });

    // the mandala opens like a flower
    gsap.fromTo('#mandala', { scale: .55, opacity: 0, rotation: -90 }, { scale: 1, opacity: 1, rotation: 0, ease: 'power2.out', scrollTrigger: { trigger: '.mandala-wrap', start: 'top 92%', end: 'center 55%', scrub: .8 } });
    gsap.fromTo('#rsvpRing', { scale: .4, opacity: 0 }, { scale: 1, opacity: 1, ease: 'back.out(2)', duration: .9, scrollTrigger: { trigger: '.mandala-wrap', start: 'top 70%', once: true } });

    // icons draw themselves
    $$('#knowList li').forEach(li => {
      gsap.fromTo(li.querySelector('svg'), { '--ink-draw': 1 }, { '--ink-draw': 0, ease: 'none', scrollTrigger: { trigger: li, start: 'top 92%', end: 'top 60%', scrub: .6 } });
    });

    // the follow sun swells in
    gsap.fromTo('.sunburst__face', { scale: .7, opacity: 0 }, { scale: 1, opacity: 1, ease: 'power2.out', scrollTrigger: { trigger: '#sunburst', start: 'top 90%', end: 'center 60%', scrub: .8 } });
    gsap.fromTo('.sunburst__rays', { scale: .4, opacity: 0 }, { scale: 1, opacity: 1, ease: 'power2.out', scrollTrigger: { trigger: '#sunburst', start: 'top 95%', end: 'center 55%', scrub: .8 } });
  } else {
    $$('.ch').forEach(c => { c.style.opacity = 1; });
  }

  /* ---------- album ---------- */

  const track = $('#track'), dots = $('#dots'), view = $('.album__view');
  track.innerHTML = C.gallery.map((g, i) => `<figure class="shot" aria-label="Photo ${i + 1} of ${C.gallery.length}"><img src="${g.src}" alt="${g.alt}" loading="lazy" draggable="false"></figure>`).join('');
  dots.innerHTML = C.gallery.map((_, i) => `<button type="button" aria-label="Show photo ${i + 1}"></button>`).join('');
  const shots = $$('.shot', track), dotBtns = $$('button', dots);
  let cur = 0, dragX = 0, lastTouch = 0;
  const slideX = i => { const w = shots[0].offsetWidth, gap = parseFloat(getComputedStyle(track).columnGap) || 0; return view.clientWidth / 2 - (i * (w + gap) + w / 2); };
  const show = (i, instant) => {
    cur = (i + shots.length) % shots.length;
    const d = instant || reduce ? 0 : .9;
    gsap.to(track, { x: slideX(cur), duration: d, ease: 'power3.out', overwrite: true });
    shots.forEach((s, k) => {
      const off = k - cur;
      gsap.to(s, { scale: off ? .84 : 1, rotation: off ? Math.sign(off) * 4 : 0, y: off ? 16 : 0, opacity: Math.abs(off) > 1 ? .5 : off ? .8 : 1, duration: d, ease: 'power3.out', overwrite: true });
    });
    dotBtns.forEach((b, k) => b.setAttribute('aria-current', k === cur));
  };
  $('#prev').addEventListener('click', () => { lastTouch = Date.now(); show(cur - 1); });
  $('#next').addEventListener('click', () => { lastTouch = Date.now(); show(cur + 1); });
  dotBtns.forEach((b, k) => b.addEventListener('click', () => { lastTouch = Date.now(); show(k); }));
  let down = null;
  view.addEventListener('pointerdown', e => { down = { x: e.clientX, y: e.clientY, base: slideX(cur) }; dragX = 0; });
  addEventListener('pointermove', e => {
    if (!down) return;
    dragX = e.clientX - down.x;
    if (Math.abs(dragX) > 6) gsap.set(track, { x: down.base + dragX });
  });
  addEventListener('pointerup', () => {
    if (!down) return;
    lastTouch = Date.now();
    down = null;
    if (Math.abs(dragX) > 50) show(cur + (dragX < 0 ? 1 : -1)); else show(cur);
  });
  let albumOn = false;
  new IntersectionObserver(([e]) => { albumOn = e.isIntersecting; }).observe(view);
  if (!reduce) setInterval(() => { if (albumOn && Date.now() - lastTouch > 7000) show(cur + 1); }, 4200);

  /* ---------- start ---------- */

  const veil = document.createElement('div'); veil.className = 'veil';
  veil.textContent = `${names.one} & ${names.two}`; document.body.prepend(veil);

  addEventListener('resize', () => { measure(); show(cur, true); ScrollTrigger.refresh(); });

  const loaded = src => new Promise(r => { const i = new Image(); i.onload = i.onerror = r; i.src = src; });
  Promise.race([
    Promise.all(['assets/band-back.webp', 'assets/band-mid.webp', 'assets/band-front.webp', 'assets/foliage-side.webp', 'assets/shiva.webp', 'assets/hotel.webp', 'assets/balloon.webp'].map(loaded).concat(document.fonts?.ready)),
    new Promise(r => setTimeout(r, 6000))
  ]).then(() => {
    measure();
    show(0, true);
    ScrollTrigger.refresh();
    root.classList.add('ready');
    // fetch the rest one at a time, in page order
    $$('img[loading=lazy]').reduce((turn, i) => turn.then(() => new Promise(next => {
      if (i.complete && i.naturalWidth) return next();
      i.addEventListener('load', next, { once: true });
      i.addEventListener('error', next, { once: true });
      i.loading = 'eager';
    })), Promise.resolve());
    setTimeout(() => veil.remove(), 1200);
    if (reduce) { stages.forEach(o => { o.t = 0; o.render(o); }); return; }
    const box = { v: 1 };
    gsap.to(box, { v: 0, duration: 3, delay: .3, ease: 'power3.out', onUpdate: () => { intro = box.v; } });
    // the garden comes up one layer at a time, back to front
    gsap.timeline({ delay: .25 })
      .to(grow, { back: 1, duration: 1.9, ease: 'expo.out' }, 0)
      .to(grow, { sideBack: 1, duration: 1.9, ease: 'expo.out' }, .2)
      .to(grow, { mid: 1, duration: 1.8, ease: 'back.out(1.2)' }, .42)
      .to(grow, { sideFront: 1, duration: 1.8, ease: 'expo.out' }, .62)
      .to(grow, { front: 1, duration: 1.7, ease: 'back.out(1.25)' }, .8);
    letterIn($$('#hero .ch').filter(c => !c.closest('.dateline')), 1.1);
    gsap.fromTo('.weds', { opacity: 0, letterSpacing: '.5em' }, { opacity: 1, letterSpacing: '.14em', duration: 1.6, delay: 1.5, ease: 'power2.out' });
  });

  window.__invite = { stages, M: () => M };
})();
