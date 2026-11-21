/* Tara & Kabir: the film.
   One bow, untied at the start and tied again at the end. Between the two, the red and
   black lines cross, draw a heart, and feed the printer in the middle of the page.

   Every scrubbed scene is a pure function of its timeline state, so scrolling back up
   un-prints the paper as cleanly as scrolling down prints it. */
(() => {
  'use strict';
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });

  const C = window.INVITE;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const root = document.documentElement;
  const reduce = root.classList.contains('reduced');
  const NS = 'http://www.w3.org/2000/svg';
  const RED = '#A31621', INK = '#16130F';
  const clamp = (a, b, v) => Math.min(b, Math.max(a, v));
  const mix = (a, b, t) => a + (b - a) * t;
  scrollTo(0, 0);

  /* ---------- Words ---------- */

  const one = C.couple.one, two = C.couple.two;
  const names = `${one.first} & ${two.first}`;
  const start = new Date(C.wedding.start);
  const fmt = (o, d = start) => new Intl.DateTimeFormat('en-GB', { timeZone: C.wedding.timezone, ...o }).format(d);
  const dateLong = fmt({ weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const timeText = fmt({ hour: 'numeric', minute: '2-digit', hour12: true }).toUpperCase();
  const fill = s => s.replace('{one}', one.first).replace('{two}', two.first)
    .replace('{oneLast}', one.last).replace('{twoLast}', two.last);

  const binds = {
    names, one: one.first, two: two.first, dateLong,
    place: C.wedding.place, venue: C.wedding.venue,
    namesCaps: names.toUpperCase(), invTitle: C.invitation.title
  };
  $$('[data-bind]').forEach(el => { el.textContent = binds[el.dataset.bind]; });

  // A personal link: ?to=Priya
  const guest = (new URLSearchParams(location.search).get('to') || '').trim().slice(0, 40);
  $('#coverTo').textContent = guest ? `for ${guest}` : 'for you';

  const penLine = (el, text) => {
    el.textContent = '';
    const s = document.createElement('span');
    s.className = 'wipe';
    s.textContent = text;
    el.appendChild(s);
    return s;
  };

  /* ---------- Smooth scrolling, held until the bow is untied ---------- */

  let lenis = null;
  if (!reduce && window.Lenis) {
    lenis = new Lenis({ lerp: .1 });
    window.__lenis = lenis;
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(t => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    lenis.stop();
  }

  /* ---------- Doodles and lines ---------- */

  $$('.dd').forEach(el => Doodle.mount(el));
  Doodle.start();

  function line(svg, d, color, width = 2.3) {
    const p = document.createElementNS(NS, 'path');
    p.setAttribute('d', d);
    p.setAttribute('stroke', color);
    p.setAttribute('stroke-width', width);
    svg.appendChild(p);
    p._L = p.getTotalLength();
    p.style.strokeDasharray = `${p._L} ${p._L + 6}`;
    setLine(p, 0);
    return p;
  }
  function setLine(p, t, eaten = 0) {
    p.style.strokeDashoffset = eaten > 0 ? -p._L * eaten : p._L * (1 - t);
    p.style.opacity = t > .001 && eaten < .999 ? 1 : 0;
  }
  function dot(svg, color) {
    const c = document.createElementNS(NS, 'circle');
    c.setAttribute('r', 3.4);
    c.setAttribute('fill', color);
    svg.appendChild(c);
    return c;
  }
  function setDot(c, p, t) {
    const at = p.getPointAtLength(p._L * t);
    c.setAttribute('cx', at.x);
    c.setAttribute('cy', at.y);
    c.style.opacity = t > .002 && t < .998 ? 1 : 0;
  }
  // Two strands that twist around each other on their way down the page
  function twist(cx, y0, y1, side, turns = 3, amp = 9) {
    const n = Math.max(24, Math.round((y1 - y0) / 5));
    let d = '';
    for (let i = 1; i <= n; i++) {
      const t = i / n, a = amp * Math.pow(Math.sin(Math.PI * t), .6);
      d += `L${(cx + side * a * Math.sin(t * Math.PI * 2 * turns)).toFixed(1)} ${(y0 + (y1 - y0) * t).toFixed(1)}`;
    }
    return d;
  }

  /* ---------- The folded letter ---------- */

  const cover = $('#cover'), bowArt = $('#bowArt'), bowBtn = $('#bowBtn');
  let stringL, stringR, opened = false;

  function buildCover() {
    bowArt.classList.add('dd');
    bowArt.setAttribute('data-d', 'bow');
    Doodle.mount(bowArt);
    bowArt.style.strokeWidth = 1.5;
    // Each side of the bow belongs to one line
    $$('g', bowArt).forEach(g => $$('path', g).forEach((p, i) => { p.style.stroke = i === 1 || i === 4 ? INK : RED; }));
    Doodle.setDraw(bowArt, 1);

    const W = innerWidth, H = innerHeight, cx = W / 2, cy = H / 2, svg = $('#string');
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    svg.innerHTML = '';
    stringL = line(svg, `M${cx} ${cy}C${cx * .7} ${cy + 3} ${cx * .4} ${cy - 3} -8 ${cy + 1}`, RED, 2.4);
    stringR = line(svg, `M${cx} ${cy}C${cx * 1.3} ${cy - 3} ${cx * 1.6} ${cy + 3} ${W + 8} ${cy - 1}`, INK, 2.4);
    setLine(stringL, 1);
    setLine(stringR, 1);
    if (!reduce) gsap.to(bowBtn, { rotation: 2.4, duration: .9, ease: 'sine.inOut', yoyo: true, repeat: -1, transformOrigin: '50% 42%' });
  }

  function released() {
    root.classList.remove('is-locked');
    if (lenis) lenis.start();
    ScrollTrigger.refresh();
  }

  function untie() {
    if (opened) return;
    opened = true;
    Sound.unlock();
    if (reduce) {
      gsap.to(cover, { opacity: 0, duration: .3, onComplete() { cover.remove(); released(); playHero(); } });
      return;
    }
    gsap.killTweensOf(bowBtn);
    const s = { t: 0 };
    const shadeT = $('.fold-top .fold-shade'), shadeB = $('.fold-bot .fold-shade');
    gsap.timeline({ onComplete() { cover.remove(); released(); } })
      .to(bowBtn, { scale: 1.1, rotation: 0, duration: .14, ease: 'power2.out' }, 0)
      .to('#coverHint', { opacity: 0, duration: .2 }, 0)
      .to(Doodle.handle(bowArt), { p: 0, duration: .5, ease: 'power2.in' }, .1)
      // the two strands whip away to opposite edges
      .to(s, { t: 1, duration: .46, ease: 'power3.in', onUpdate() { setLine(stringL, 1, s.t); setLine(stringR, 1, s.t); } }, .34)
      .add(() => Sound.rip(), .5)
      .to('.fold-top', { rotationX: 104, duration: 1, ease: 'power2.inOut' }, .66)
      .to('.fold-bot', { rotationX: -104, duration: 1, ease: 'power2.inOut' }, .72)
      .to([shadeT, shadeB], { opacity: .34, duration: .8, ease: 'power1.in' }, .7)
      .add(playHero, 1.08);
  }
  bowBtn.addEventListener('click', untie);

  /* ---------- The names ---------- */

  const heroLine = penLine($('#heroLine'), $('#heroLine').textContent);
  const heroArt = $$('#hero .art .dd');
  const heroWipes = $$('#names .wipe');

  function playHero() {
    if (reduce) { heroArt.forEach(d => Doodle.setDraw(d, 1)); return; }
    const tl = gsap.timeline();
    tl.fromTo(heroWipes[0], { '--w': 0 }, { '--w': 112, duration: .95, ease: 'power1.inOut' }, 0)
      .fromTo(heroWipes[1], { '--w': 0 }, { '--w': 112, duration: 1.2, ease: 'power1.inOut' }, .72)
      .fromTo(heroLine, { '--w': 0 }, { '--w': 112, duration: .7, ease: 'power1.inOut' }, 1.75)
      .fromTo('#heroDate', { opacity: 0 }, { opacity: 1, duration: .5 }, 2.25);
    heroArt.forEach((d, i) => tl.to(Doodle.handle(d), { p: 1, duration: .8, ease: 'power1.inOut' }, .5 + i * .24));
    tl.to(Doodle.handle($('#cue .dd')), { p: 1, duration: .6, ease: 'power1.inOut' }, 2.5);
    tl.add(() => gsap.to('#cue', { y: 7, duration: .9, ease: 'sine.inOut', yoyo: true, repeat: -1 }));
  }
  if (!reduce) {
    gsap.set('#heroDate', { opacity: 0 });
    ScrollTrigger.create({ trigger: '#hero', start: 'top top', end: '18% top', scrub: true,
      animation: gsap.to('#cue', { opacity: 0, ease: 'none' }) });
  }

  /* ---------- Two lines, one heart ---------- */

  let storyTl = null;

  function buildStory() {
    if (storyTl) { storyTl.scrollTrigger.kill(); storyTl.kill(); }
    const stage = $('#story .stage'), W = stage.clientWidth, H = stage.clientHeight, svg = $('#storyLines');
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    svg.innerHTML = '';

    const cx = W / 2, s = Math.min(W * .68, H * .4, 430), y0 = H * .34, tip = y0 + s * .98;
    const half = k => `C${cx + k * .1 * s} ${y0 - .4 * s} ${cx + k * .62 * s} ${y0 - .46 * s} ${cx + k * .62 * s} ${y0 + .05 * s}` +
      `C${cx + k * .62 * s} ${y0 + .5 * s} ${cx + k * .2 * s} ${y0 + .72 * s} ${cx} ${tip}`;

    // Tara comes in from the left with a loop on the way; Kabir from the right, a little lower
    const a = `M-14 ${H * .1}C${W * .1} ${H * .03} ${W * .24} ${H * .13} ${W * .15} ${H * .18}` +
      `C${W * .07} ${H * .22} ${W * .04} ${H * .12} ${W * .2} ${H * .12}` +
      `C${W * .34} ${H * .12} ${cx - .08 * s} ${y0 - .34 * s} ${cx} ${y0}` + half(1) + twist(cx, tip, H + 8, 1, 3.5);
    const b = `M${W + 14} ${H * .2}C${W * .9} ${H * .26} ${W * .82} ${H * .14} ${W * .72} ${H * .1}` +
      `C${W * .62} ${H * .06} ${W * .6} ${H * .17} ${W * .67} ${H * .16}` +
      `C${W * .74} ${H * .15} ${cx + .1 * s} ${y0 - .32 * s} ${cx} ${y0}` + half(-1) + twist(cx, tip, H + 8, -1, 3.5);

    const red = line(svg, a, RED), black = line(svg, b, INK);
    const redTip = dot(svg, RED), blackTip = dot(svg, INK);

    const notes = $('#storyNotes');
    notes.innerHTML = '';
    notes.style.top = `${y0 + s * .2}px`;
    notes.style.width = `${Math.min(s * .98, W - 40)}px`;
    const said = C.story.map(text => {
      const p = document.createElement('p');
      notes.appendChild(p);
      return { p, w: penLine(p, text) };
    });

    if (reduce) {
      setLine(red, 1); setLine(black, 1);
      redTip.remove(); blackTip.remove();
      said.forEach((n, i) => { if (i < said.length - 1) n.p.hidden = true; });
      return;
    }

    const st = { a: 0, b: 0 };
    const paint = () => {
      setLine(red, st.a); setLine(black, st.b);
      setDot(redTip, red, st.a); setDot(blackTip, black, st.b);
    };
    storyTl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: { trigger: '#story', start: 'top 62%', end: 'bottom bottom', scrub: .4 }
    });
    storyTl.to(st, { a: 1, duration: 1, onUpdate: paint }, 0)
      .to(st, { b: 1, duration: .96, onUpdate: paint }, .04);

    const span = .92 / said.length;
    said.forEach((n, i) => {
      const at = .05 + i * span;
      storyTl.fromTo(n.w, { '--w': 0 }, { '--w': 112, duration: span * .42 }, at);
      if (i < said.length - 1) storyTl.to(n.p, { opacity: 0, duration: span * .14 }, at + span * .82);
    });
  }

  /* ---------- The printer ---------- */

  const papers = $('#papers'), slip = $('#slip'), slipClip = $('#slipClip');
  const pBody = $('#pBody'), led = $('#led'), pStatus = $('#pStatus');
  let printTl = null, feedTl = null, P = [], S = { f: 0 }, slipH = 0, slotY = 0, skipEnds = .85;
  const feed = { draw: 0, eat: 0 };
  let strandA = null, strandB = null;
  let images = [];

  function slotPosition() {
    const stage = $('#printStage').getBoundingClientRect(), r = pBody.getBoundingClientRect();
    return { top: r.top - stage.top, y: r.top - stage.top + r.height * .58 };
  }

  // Everything about one print comes from its state: f = fed out, t = torn and fallen, q = fanned
  function pose(p) {
    const row = 3, off = Math.round(p.H * (1 - p.f) / row) * row;
    const e = p.t * p.t;
    const jerk = p.t > 0 && p.t < .12 ? Math.sin(p.t / .12 * Math.PI) * 9 : 0;
    let x = p.X * e, y = -off + p.Y * e + jerk, r = p.R * (1 - Math.pow(1 - p.t, 2.4)), sc = mix(1, p.S, e);
    if (p.q > 0) {
      x = mix(x, p.FX, p.q); y = mix(y, p.FY, p.q); r = mix(r, p.FR, p.q); sc = mix(sc, p.FS, p.q);
    }
    p.el.style.visibility = p.f > .001 ? 'visible' : 'hidden';
    p.el.style.transform = `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0) rotate(${r.toFixed(2)}deg) scale(${sc.toFixed(3)})`;
    p.el.style.clipPath = p.t > .001 ? 'none' : `inset(${off + p.m}px -30px -30px -30px)`;
    if (p.t > .04 && !p.ripped) { p.ripped = true; Sound.rip(); }
    if (p.t < .01) p.ripped = false;
  }

  function poseSlip() {
    const done = S.f >= .999;
    slipClip.style.visibility = S.f > .001 ? 'visible' : 'hidden';
    slipClip.classList.toggle('is-out', done);
    slip.style.transform = done ? 'none' : `translate3d(0,${(-slipH * (1 - S.f)).toFixed(1)}px,0)`;
  }

  function measureSlip() {
    const H = $('#printStage').clientHeight;
    slipH = slip.offsetHeight;
    $('#slipRoom').style.height = `${Math.max(0, slotY + slipH + 34 - H)}px`;
  }

  function buildPrint() {
    if (printTl) { printTl.scrollTrigger.kill(); printTl.kill(); }
    if (feedTl) { feedTl.scrollTrigger.kill(); feedTl.kill(); }
    const stage = $('#printStage'), W = stage.clientWidth, H = stage.clientHeight;
    const { top, y } = slotPosition();
    slotY = y;
    slipClip.style.top = `${slotY}px`;
    measureSlip();

    // The paper has to fit under the printer with room for the skip link, so the punchline can be read
    const tall = 1.84;   // a receipt is this many times taller than it is wide
    const pw = Math.floor(clamp(190, 300, Math.min(W - 54, (H - slotY - 52) / tall)));
    papers.innerHTML = '';
    const wide = W >= 760;
    const spread = wide ? Math.min(W * .3, 400) : W * .27;
    const small = wide ? .74 : .56, fan = wide ? .84 : .6;
    const pile = [
      { X: -spread, Y: H * .08, R: -9 },
      { X: spread, Y: H * .16, R: 8 },
      { X: wide ? -spread * .3 : 0, Y: H * .24, R: -3 }
    ];
    const fanOut = [
      { X: -spread * 1.04, Y: H * .1, R: -10 },
      { X: spread * 1.04, Y: H * .1, R: 10 },
      { X: 0, Y: H * .055, R: 1 }
    ];
    P = C.receipts.map((spec, i) => {
      const out = Receipt.render({ ...spec, head: names.toUpperCase(), image: images[i] }, pw, i);
      const el = document.createElement('div');
      el.className = 'paper';
      el.setAttribute('role', 'img');
      el.setAttribute('aria-label', `${spec.label}, ${spec.title}. ${spec.alt}. ${spec.items.map(t => t.join(': ')).join('. ')}. ${spec.total.join(': ')}.`);
      el.style.marginLeft = `${-(pw / 2 + out.margin)}px`;
      el.style.top = `${slotY - out.margin}px`;
      el.style.transformOrigin = `50% ${out.margin}px`;
      el.appendChild(out.canvas);
      papers.appendChild(el);
      const a = pile[i % 3], b = fanOut[i % 3];
      return { el, cv: out.canvas, H: out.height + 4, m: out.margin, f: 0, t: 0, q: 0,
        X: a.X, Y: a.Y, R: a.R, S: small, FX: b.X, FY: b.Y, FR: b.R, FS: fan };
    });

    const svg = $('#feedLines');
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    svg.innerHTML = '';
    const cx = W / 2;
    strandA = line(svg, `M${cx} -2` + twist(cx, -2, top + 6, 1, 1.5), RED);
    strandB = line(svg, `M${cx} -2` + twist(cx, -2, top + 6, -1, 1.5), INK);

    const proof = penLine($('#pProof'), C.proof), more = penLine($('#pMore'), C.oneMore);
    const noteTop = `${Math.min(H - 78, slotY + pw * fan * tall + H * .125)}px`;
    $('#pProof').style.top = noteTop;
    $('#pMore').style.top = noteTop;

    const doodles = $$('#printStage .art .dd');
    doodles.forEach(d => Doodle.setDraw(d, 0));
    gsap.set(['#pProof', '#pMore'], { clearProps: 'opacity' });
    if (reduce) {
      strandA.remove(); strandB.remove();
      P.forEach(p => { p.el.style.transform = 'none'; p.el.style.marginLeft = 0; p.el.style.top = 'auto'; p.el.style.clipPath = 'none'; });
      doodles.forEach(d => Doodle.setDraw(d, 1));
      led.classList.add('on');
      return;
    }

    const paintFeed = () => { setLine(strandA, feed.draw, feed.eat); setLine(strandB, feed.draw, feed.eat); };
    feed.draw = 0; feed.eat = 0;
    feedTl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: { trigger: '#print', start: 'top 100%', end: 'top 12%', scrub: .3 }
    }).to(feed, { draw: 1, duration: 1, onUpdate: paintFeed });

    S.f = 0;
    poseSlip();
    P.forEach(pose);

    const tl = printTl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: { trigger: '#print', start: 'top top', end: 'bottom bottom', scrub: .35 }
    });
    let t = 0;
    // the printer swallows the two lines, then wakes up
    tl.to(feed, { eat: 1, duration: 1, onUpdate: paintFeed }, t);
    t += .8;
    tl.fromTo('#pTitle', { '--w': 0 }, { '--w': 112, duration: .8 }, t);
    tl.fromTo('#pLabel', { opacity: 0 }, { opacity: 1, duration: .4 }, t + .3);
    doodles.forEach((d, i) => tl.to(Doodle.handle(d), { p: 1, duration: .55 }, t + i * .08));
    t += 1.3;

    P.forEach((p, i) => {
      const paint = () => pose(p);
      tl.to(p, { f: 1, duration: 2, onUpdate: paint }, t);
      t += 2.85;                                  // time to read the receipt
      tl.to(p, { t: 1, duration: .9, onUpdate: paint }, t);
      t += .85;
    });

    // all the evidence, fanned out
    const paintAll = () => P.forEach(pose);
    tl.to(P, { q: 1, duration: 1, ease: 'power1.inOut', onUpdate: paintAll }, t);
    tl.fromTo(proof, { '--w': 0 }, { '--w': 112, duration: .5 }, t + .75);
    tl.set('#pProof', { opacity: 1 }, t + .74);
    t += 2;
    tl.to('#pProof', { opacity: 0, duration: .25 }, t);
    tl.set('#pMore', { opacity: 1 }, t + .25);
    tl.fromTo(more, { '--w': 0 }, { '--w': 112, duration: .5 }, t + .26);
    t += 1.4;
    tl.to('#pMore', { opacity: 0, duration: .2 }, t);
    // and the one that never stops: the whole invitation rolls out
    tl.to(S, { f: 1, duration: 2.6, ease: 'power1.in', onUpdate: poseSlip }, t + .1);
    skipEnds = t / tl.duration();
  }

  // The machine itself: it shakes, blinks and buzzes only while paper is moving
  let lastFed = 0, lastLevel = 0, sway = 0, swayV = 0, hanging = null, machineOn = false, ticketPrinting = false;
  if (!reduce) ScrollTrigger.create({
    trigger: '#print', start: 'top bottom', end: 'bottom top',
    onToggle(s) { machineOn = s.isActive; if (!machineOn) { Sound.buzz(0); lastLevel = 0; pBody.style.transform = ''; } }
  });
  gsap.ticker.add(() => {
    if (!machineOn || !P.length) return;
    let fed = feed.eat * 240 + S.f * slipH, status = 'Ready', cur = null;
    P.forEach((p, i) => {
      fed += p.f * p.H;
      if (p.f > 0 && p.t === 0) { cur = p; status = p.f < 1 ? `Printing ${i + 1}/${P.length}` : `Tear ${i + 1}/${P.length}`; }
    });
    if (S.f > 0) status = S.f < .999 ? 'Printing' : 'Ready';
    const speed = Math.abs(fed - lastFed);
    lastFed = fed;
    const level = clamp(0, 1, speed / 7);
    if (!ticketPrinting && Math.abs(level - lastLevel) > .01) { Sound.buzz(level); lastLevel = level; }
    pBody.style.transform = level > .04 ? `translate3d(${((Math.random() - .5) * 1.2).toFixed(2)}px,${((Math.random() - .5) * 1.4).toFixed(2)}px,0)` : '';
    led.classList.toggle('on', feed.eat > .5 && (level < .04 || Math.random() > .35));
    if (pStatus.textContent !== status) pStatus.textContent = status;

    // Paper hanging from the slot swings a little when the scroll stops
    if (cur !== hanging) { if (hanging) hanging.cv.style.transform = ''; hanging = cur; sway = 0; swayV = 0; }
    if (hanging) {
      const kick = lenis ? clamp(-40, 40, lenis.velocity) * .0009 : 0;
      swayV += -sway * .045 - swayV * .09 + kick;
      sway += swayV;
      hanging.cv.style.transform = `rotate(${clamp(-2.2, 2.2, sway).toFixed(3)}deg)`;
    }
  });

  /* ---------- The invitation on the long receipt ---------- */

  const links = (box, ev) => {
    const act = (text) => {
      const a = document.createElement('a');
      a.className = 's-btn';
      a.textContent = text;
      box.appendChild(a);
      return a;
    };
    if (ev.map) {
      const d = act('Directions');
      d.href = ev.map; d.target = '_blank'; d.rel = 'noopener';
    }
    const s = new Date(ev.start), e = new Date(+s + (ev.hours || 2) * 36e5);
    const z = d => d.toISOString().replace(/[-:]|\.\d{3}/g, '');
    const title = `${ev.title}: ${names}`, where = ev.place ? `${ev.place}, ${C.wedding.venue}, ${C.wedding.place}` : `${C.wedding.venue}, ${C.wedding.place}`;
    const c = act('Add to calendar');
    if (/Android/i.test(navigator.userAgent)) {
      c.href = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${z(s)}/${z(e)}&location=${encodeURIComponent(where)}`;
      c.target = '_blank'; c.rel = 'noopener';
    } else {
      const ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Wedding//EN', 'BEGIN:VEVENT', `UID:${z(s)}@invite`, `DTSTAMP:${z(new Date())}`,
        `DTSTART:${z(s)}`, `DTEND:${z(e)}`, `SUMMARY:${title}`, `LOCATION:${where.replace(/,/g, '\\,')}`, 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
      c.href = `data:text/calendar;charset=utf-8,${encodeURIComponent(ics)}`;
      c.download = `${ev.title.toLowerCase().replace(/\W+/g, '-')}.ics`;
    }
  };

  function fillSlip() {
    const w = $('#wording');
    C.invitation.wording.forEach((text, i) => {
      const p = document.createElement('p');
      p.textContent = fill(text);
      if (/\{one\}/.test(text)) p.className = 'w-names';
      w.appendChild(p);
    });
    $('#factDate').textContent = fmt({ weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' });
    $('#factTime').textContent = timeText;
    links($('#mainActs'), { title: 'The wedding', start: C.wedding.start, hours: 3, map: C.wedding.map });

    if (C.invitation.dateNote) {
      const n = document.createElement('p');
      n.className = 'pen s-note';
      $('#facts').after(n);
      penLine(n, C.invitation.dateNote);
    }

    const days = $('#days');
    let group = null, last = '';
    C.weekend.forEach(ev => {
      if (ev.day !== last) {
        last = ev.day;
        const li = document.createElement('li');
        li.innerHTML = '<p class="s-day-head"></p><div class="s-day-items"></div>';
        $('.s-day-head', li).textContent = ev.day;
        days.appendChild(li);
        group = $('.s-day-items', li);
      }
      const it = document.createElement('div');
      it.className = 'item';
      it.innerHTML = '<div class="item-top"><span></span><span></span></div><p></p><p></p><div class="s-acts"></div>';
      const [ti, tm] = $$('.item-top span', it), [pl, wr] = $$('p', it);
      ti.textContent = ev.title; tm.textContent = ev.time;
      pl.textContent = ev.place; wr.textContent = `Wear: ${ev.wear}`;
      if (ev.note) {
        const n = document.createElement('p');
        n.className = 'pen s-note';
        wr.after(n);
        penLine(n, ev.note);
      }
      links($('.s-acts', it), ev);
      group.appendChild(it);
    });

    // A barcode to finish the receipt
    const code = $('#code');
    code.setAttribute('viewBox', '0 0 240 46');
    code.setAttribute('preserveAspectRatio', 'none');
    let x = 0, r = 77;
    let bars = '';
    while (x < 240) {
      r = (r * 9301 + 49297) % 233280;
      const b = 1 + r % 3;
      bars += `<rect x="${x}" y="0" width="${b}" height="46" fill="#211F1D"/>`;
      r = (r * 9301 + 49297) % 233280;
      x += b + 1 + r % 2;
    }
    code.innerHTML = bars;
  }

  // The receipt rides inside the held stage, so ScrollTrigger cannot measure its rows.
  // This gives the scroll position where a row reaches a given height on the screen.
  const rowAt = (el, view) => {
    const end = printTl ? printTl.scrollTrigger.end : 0;
    const off = el.getBoundingClientRect().top - slip.getBoundingClientRect().top;
    return Math.max(end - 40, end + slotY + off - innerHeight * view);
  };

  // Red pen on the printed paper, drawn as the guest scrolls past
  let inkTriggers = [];
  function annotate() {
    inkTriggers.forEach(t => t.kill());
    inkTriggers = [];
    $$('.ink', slip).forEach(n => n.remove());
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('class', 'ink');
    svg.setAttribute('aria-hidden', 'true');
    slip.appendChild(svg);
    const base = slip.getBoundingClientRect();
    const box = el => {
      const range = document.createRange();
      range.selectNodeContents(el);
      const r = range.getBoundingClientRect();
      return { x: r.left - base.left, y: r.top - base.top, w: r.width, h: r.height };
    };
    const circle = el => {
      const b = box(el), cx = b.x + b.w / 2, cy = b.y + b.h / 2, rx = b.w / 2 + 8, ry = b.h / 2 + 7;
      return `M${cx - rx * .3} ${cy - ry * 1.02}C${cx + rx * .95} ${cy - ry * 1.4} ${cx + rx * 1.42} ${cy + ry * 1} ${cx + rx * .05} ${cy + ry * 1.08}` +
        `C${cx - rx * 1.42} ${cy + ry * 1.2} ${cx - rx * 1.5} ${cy - ry * .95} ${cx + rx * .32} ${cy - ry * 1.26}`;
    };
    const under = el => {
      const b = box(el), y = b.y + b.h + 2;
      return `M${b.x - 2} ${y}C${b.x + b.w * .3} ${y + 3} ${b.x + b.w * .7} ${y - 2} ${b.x + b.w + 3} ${y + 1}` +
        `C${b.x + b.w * .7} ${y + 3} ${b.x + b.w * .4} ${y + 3} ${b.x + b.w * .2} ${y + 6}`;
    };
    const marks = [[circle($('#factDate')), $('#factDate')]];
    if (C.rsvp) marks.push([under($('#rsvpBy')), $('#rsvpBy')]);
    marks.forEach(([d, el]) => {
      const p = line(svg, d, RED, 2.2);
      if (reduce) return setLine(p, 1);
      const s = { t: 0 };
      inkTriggers.push(ScrollTrigger.create({
        start: () => rowAt(el, .76), end: () => rowAt(el, .76) + 240, scrub: .4,
        animation: gsap.to(s, { t: 1, ease: 'none', onUpdate() { setLine(p, s.t); } })
      }));
    });
    $$('.s-note .wipe', slip).forEach(w => {
      if (reduce) return;
      inkTriggers.push(ScrollTrigger.create({
        start: () => rowAt(w, .84), end: () => rowAt(w, .84) + 170, scrub: .4,
        animation: gsap.fromTo(w, { '--w': 0 }, { '--w': 112, ease: 'none' })
      }));
    });
    if (!reduce) $$('#sideArt .dd').forEach(d => {
      Doodle.setDraw(d, 0);
      inkTriggers.push(ScrollTrigger.create({
        trigger: d, start: 'top 88%', end: 'top 56%', scrub: .4,
        animation: gsap.to(Doodle.handle(d), { p: 1, ease: 'none' })
      }));
    });
    else $$('#sideArt .dd').forEach(d => Doodle.setDraw(d, 1));
    // The date stamp sits beside the venue and lands with a thump
    const stamp = $('#stampDate'), row = $('#facts > div:last-child');
    stamp.style.top = `${row.getBoundingClientRect().top - base.top - 12}px`;
    if (reduce) { stamp.style.opacity = .86; return; }
    inkTriggers.push(ScrollTrigger.create({
      start: () => rowAt(row, .62), end: () => rowAt(row, .62) + 1,
      onEnter: () => thump(stamp),
      onLeaveBack: () => gsap.set(stamp, { opacity: 0 })
    }));
  }

  function thump(stamp) {
    gsap.fromTo(stamp, { opacity: 0, scale: 2.5 }, { opacity: .86, scale: 1, duration: .2, ease: 'power4.in', onComplete() {
      Sound.thump();
      if (navigator.vibrate) navigator.vibrate(12);
      // shake the wrapper: the slip's own transform belongs to the scrubbed roll-out
      gsap.fromTo(slipClip, { x: 0 }, { x: 1.5, duration: .04, yoyo: true, repeat: 3, clearProps: 'transform' });
    } });
  }

  /* ---------- Countdown ---------- */

  const pad = (n, l = 2) => String(n).padStart(l, '0');
  function tick() {
    const left = start.getTime() - Date.now();
    if (left <= 0) {
      $('#clock').hidden = true;
      $('#cdDone').hidden = false;
      clearInterval(clock);
      return;
    }
    const s = Math.floor(left / 1000);
    $('#cdD').textContent = pad(Math.floor(s / 86400), 3);
    $('#cdH').textContent = pad(Math.floor(s % 86400 / 3600));
    $('#cdM').textContent = pad(Math.floor(s % 3600 / 60));
    $('#cdS').textContent = pad(s % 60);
  }
  const clock = setInterval(tick, 1000);
  tick();

  /* ---------- The reply ---------- */

  function setupRsvp() {
    const R = C.rsvp;
    if (!R) { $('#rsvp').remove(); return; }
    const form = $('#rsvpForm'), ticket = $('#ticket'), name = $('#rsvpName'), note = $('#rsvpNote');
    const error = $('#rsvpError'), send = $('#rsvpSend'), yes = $('#rsvpYes');
    const row = $('#rsvpGuestsRow'), count = $('#rsvpCount'), less = $('#rsvpLess'), more = $('#rsvpMore');
    const open = $('#tOpen'), maxGuests = Math.max(1, +R.maxGuests || 1);
    let guests = 1, sending = false;

    if (guest) name.value = guest;
    const by = new Date(`${R.deadline}T12:00:00`);
    const byEl = $('#rsvpBy');
    byEl.textContent = R.deadline ? `Please reply by ${fmt({ day: 'numeric', month: 'long' }, by)}.` : '';
    if (R.note) {
      const n = document.createElement('p');
      n.className = 'pen s-note';
      byEl.after(n);
      penLine(n, R.note);
    }

    const setGuests = n => {
      guests = clamp(1, maxGuests, n);
      count.textContent = guests;
      less.disabled = guests === 1;
      more.disabled = guests === maxGuests;
    };
    const showError = (text, field) => {
      error.textContent = text;
      error.hidden = false;
      if (field) {
        if (field === name) name.setAttribute('aria-invalid', 'true');
        field.focus();
      }
    };
    const clearError = () => { error.hidden = true; name.removeAttribute('aria-invalid'); };
    const setSending = on => {
      sending = on;
      send.disabled = on;
      send.textContent = on ? 'Sending' : 'Send my reply';
    };

    function done(reply, url) {
      const coming = reply.attending === 'yes', first = reply.name.split(/\s+/)[0];
      $('#tKind').textContent = coming ? `Admit ${reply.guests}` : 'Refund issued';
      $('#tName').textContent = reply.name;
      $('#tLine').textContent = url ? 'Your reply is written. Press send in the app that opened.'
        : coming ? `${dateLong}, ${C.wedding.venue}` : `One hug for ${first}, redeemable after the wedding.`;
      $('#tDemo').hidden = !(R.demo && !url);
      $('#stampReplyText').textContent = coming ? 'See you there' : 'Missed you';
      open.hidden = !url;
      if (url) {
        open.href = url;
        if (/^https:/.test(url)) { open.target = '_blank'; open.rel = 'noopener'; }
      }
      form.hidden = true;
      ticket.hidden = false;
      ticket.focus({ preventScroll: true });
      // The form was taller than the ticket, so take the guest back up to it
      const y = ticket.getBoundingClientRect().top + scrollY - innerHeight * .3;
      if (lenis) lenis.scrollTo(y, { duration: .7 });
      else scrollTo(0, y);
      const stamp = $('#stampReply');
      if (reduce) { stamp.style.opacity = .86; }
      else {
        gsap.set(stamp, { opacity: 0 });
        // the customer copy prints out of the receipt, row by row
        ticketPrinting = true;
        Sound.buzz(1);
        gsap.fromTo(ticket, { height: 0 }, { height: 'auto', duration: 1, ease: 'steps(18)', clearProps: 'height', onComplete() {
          ticketPrinting = false;
          Sound.buzz(0);
          thump(stamp);
        } });
      }
      if (url) open.click();     // a real link opens more reliably in phone in-app browsers
    }

    const replyText = reply => {
      const lines = [`RSVP: ${names}`, `${reply.name}: ${reply.attending === 'yes' ? 'Joyfully, yes' : 'Sadly, no'}`];
      if (reply.attending === 'yes') lines.push(`Guests: ${reply.guests}`);
      if (reply.message) lines.push(reply.message);
      return lines.join('\n');
    };
    const appLink = reply => {
      const text = encodeURIComponent(replyText(reply));
      if (R.whatsapp) return `https://wa.me/${String(R.whatsapp).replace(/\D/g, '')}?text=${text}`;
      return `mailto:${R.email}?subject=${encodeURIComponent(`RSVP from ${reply.name}`)}&body=${text}`;
    };
    function post(reply) {
      const body = new FormData();
      Object.keys(reply).forEach(k => body.append(k, reply[k]));
      setSending(true);
      fetch(R.endpoint, { method: 'POST', body, headers: { Accept: 'application/json' } })
        .then(r => {
          if (!r.ok) throw new Error(`RSVP endpoint answered ${r.status}`);
          setSending(false);
          done(reply, null);
        })
        .catch(() => {
          setSending(false);
          showError('Your reply did not send. Check your connection and try again.');
        });
    }

    form.addEventListener('submit', e => {
      e.preventDefault();
      if (sending) return;
      clearError();
      const picked = $('input[name=attending]:checked', form), who = name.value.trim();
      if (!who) return showError('Please enter your name.', name);
      if (!picked) return showError('Please choose whether you can come.', yes);
      const coming = picked.value === 'yes';
      const reply = { name: who, attending: picked.value, guests: coming ? guests : 0, message: note.value.trim(), language: 'en' };
      if (R.endpoint) return post(reply);
      if (R.whatsapp || R.email) return done(reply, appLink(reply));
      if (R.demo) return done(reply, null);
      // Never tell a guest a reply was sent when it has nowhere to go
      showError('Replies are not connected yet. Add an endpoint, WhatsApp number or email under rsvp in js/config.js.');
    });
    form.addEventListener('change', e => {
      if (e.target.name !== 'attending') return;
      row.hidden = !yes.checked || maxGuests === 1;
      clearError();
    });
    name.addEventListener('input', clearError);
    less.addEventListener('click', () => setGuests(guests - 1));
    more.addEventListener('click', () => setGuests(guests + 1));
    $('#tChange').addEventListener('click', () => {
      ticket.hidden = true;
      form.hidden = false;
      name.focus({ preventScroll: true });
    });
    setGuests(1);
  }

  /* ---------- Tying the knot ---------- */

  let knotTl = null;

  function buildKnot() {
    if (knotTl) { knotTl.scrollTrigger.kill(); knotTl.kill(); }
    const stage = $('#knot .stage'), W = stage.clientWidth, H = stage.clientHeight, svg = $('#knotLines');
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    svg.innerHTML = '';
    const size = Math.min(W * .84, H * .46, 440), k = size / 100, cx = W / 2, ky = H * .24;

    // The same six strokes as the bow on the letter, now drawn the other way
    const parts = [...window.DOODLES.bow.matchAll(/ d="([^"]+)"/g)].map(m => Doodle.wobble(m[1], 1, .5));
    const g = document.createElementNS(NS, 'g');
    g.setAttribute('transform', `translate(${cx - 50 * k} ${ky - 42 * k}) scale(${k})`);
    svg.appendChild(g);
    const w = 2.3 / k;
    const [loopL, loopR, knot, tailL, tailR, creases] = parts.map((d, i) => line(g, d, i === 1 || i === 4 ? INK : RED, w));
    const inA = line(svg, `M${cx} -2` + twist(cx, -2, ky - 8, 1, 1.5, 7), RED);
    const inB = line(svg, `M${cx} -2` + twist(cx, -2, ky - 8, -1, 1.5, 7), INK);

    const noteEl = $('#knotNote'), note = penLine(noteEl, C.closing.note);
    gsap.set(['#knotNote', '#knotLine', '#maker'], { clearProps: 'opacity' });
    const closing = $('#knotLine');
    closing.textContent = `${C.closing.line}.`;
    closing.append(document.createElement('br'), dateLong);
    const all = [inA, inB, loopL, loopR, knot, tailL, tailR, creases];

    if (reduce) {
      all.forEach(p => setLine(p, 1));
      gsap.set(['#knotNote', '#knotLine', '#maker'], { opacity: 1 });
      return;
    }

    const draw = (p, at, dur) => {
      const s = { t: 0 };
      knotTl.to(s, { t: 1, duration: dur, onUpdate() { setLine(p, s.t); } }, at);
    };
    knotTl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: { trigger: '#knot', start: 'top 92%', end: 'bottom bottom', scrub: .4 }
    });
    knotTl.to({}, { duration: 1 }, 0);
    draw(inA, 0, .16); draw(inB, 0, .16);
    draw(loopL, .16, .2); draw(loopR, .2, .2);
    draw(knot, .4, .1);
    draw(tailL, .48, .14); draw(tailR, .5, .14);
    draw(creases, .62, .06);
    knotTl.set(noteEl, { opacity: 1 }, .64)
      .fromTo(note, { '--w': 0 }, { '--w': 112, duration: .08 }, .64)
      .fromTo('#knotNames', { '--w': 0 }, { '--w': 112, duration: .13 }, .72)
      .to('#knotLine', { opacity: 1, duration: .05 }, .87)
      .to('#maker', { opacity: 1, duration: .05 }, .93);
  }

  /* ---------- Skip past the film ---------- */

  const skip = $('#skip');
  function setupSkip() {
    ScrollTrigger.create({
      trigger: '#story', start: 'top 30%',
      end: () => printTl ? printTl.scrollTrigger.start + (printTl.scrollTrigger.end - printTl.scrollTrigger.start) * skipEnds : 'max',
      onToggle: s => skip.classList.toggle('on', s.isActive && !reduce)
    });
    skip.addEventListener('click', e => {
      e.preventDefault();
      const end = printTl ? printTl.scrollTrigger.end : slip.offsetTop;
      if (lenis) lenis.scrollTo(end, { duration: 2.6 });
      else scrollTo(0, end);
    });
  }

  /* ---------- Start ---------- */

  const soundBtn = $('#soundBtn');
  soundBtn.setAttribute('aria-pressed', Sound.on);
  soundBtn.addEventListener('click', () => soundBtn.setAttribute('aria-pressed', Sound.toggle()));

  function buildAll() {
    buildStory();
    buildPrint();
    buildKnot();
    annotate();
    ScrollTrigger.refresh();
  }

  fillSlip();
  setupRsvp();
  buildCover();

  const safely = p => Promise.race([p.catch(() => null), new Promise(ok => setTimeout(ok, 4000, null))]);
  Promise.all([
    ...['400 12px', '500 12px', '700 15px'].map(f => safely(document.fonts.load(`${f} "Sometype Mono"`))),
    safely(document.fonts.load('500 40px WindSong')),
    safely(document.fonts.load('30px "Reenie Beanie"')),
    Promise.all(C.receipts.map(r => safely(Receipt.load(r.photo))))
  ]).then(all => {
    images = all[all.length - 1];
    gsap.set('#pLabel', { opacity: reduce ? 1 : 0 });
    buildAll();
    setupSkip();

    // The reply form changes the receipt's length, and the page has to follow
    if ('ResizeObserver' in window) {
      let wait = 0;
      new ResizeObserver(() => {
        const before = slipH;
        measureSlip();
        if (slipH === before) return;
        clearTimeout(wait);
        wait = setTimeout(() => ScrollTrigger.refresh(), 120);
      }).observe(slip);
    }

    let width = innerWidth, wait = 0;
    addEventListener('resize', () => {
      if (innerWidth === width) return;
      width = innerWidth;
      clearTimeout(wait);
      wait = setTimeout(buildAll, 200);
    });
  });
})();
