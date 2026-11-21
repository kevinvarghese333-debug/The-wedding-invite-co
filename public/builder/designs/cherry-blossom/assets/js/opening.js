/* Sneha & Jerin: the opening.
   The hummingbird delivers the card. Tapping the wax seal cracks it, the card swings
   open like a pair of garden doors, and a gust of petals blows through into the walk. */
(() => {
  'use strict';
  window.__opening = true;

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const root = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const cover = $('#cover'), btn = $('#openBtn');
  const leafL = $('.leaf.l'), leafR = $('.leaf.r');
  scrollTo(0, 0);

  // Both leaves show the same card, each clipped to its own half
  const clone = $('.face', leafL).cloneNode(true);
  clone.setAttribute('aria-hidden', 'true');
  leafR.prepend(clone);

  const slot = $('.seal-slot', leafL);
  const seals = $$('.seal');

  // The two halves meet along a straight line that turns jagged where it crosses the wax
  const ZIG = [0, 5, -4, 7, -3, 6, -6, 4, -2, 5, 0];
  function fit() {
    const r = slot.getBoundingClientRect();
    const W = innerWidth, H = innerHeight, cx = r.left + r.width / 2;
    const crack = ZIG.map((o, i) => [cx + o * (r.width / 96), r.top + r.height * (i / (ZIG.length - 1))]);
    const fmt = (pts, nudge) => pts.map(([x, y]) => `${(x + nudge).toFixed(1)}px ${y.toFixed(1)}px`).join(',');
    leafL.style.clipPath = `polygon(0 0,${cx + .5}px 0,${fmt(crack, .5)},${cx + .5}px ${H}px,0 ${H}px)`;
    leafR.style.clipPath = `polygon(${W}px 0,${cx - .5}px 0,${fmt(crack, -.5)},${cx - .5}px ${H}px,${W}px ${H}px)`;
    const pad = 12;
    Object.assign(btn.style, { left: `${r.left - pad}px`, top: `${r.top - pad}px`, width: `${r.width + pad * 2}px`, height: `${r.height + pad * 2}px` });
  }
  fit();
  addEventListener('resize', () => { if (!opened) fit(); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { if (!opened) fit(); });

  /* ---------- The hero text after the doors open ---------- */

  const namesEl = $('#names');
  const chars = [];
  function splitNames() {
    const text = namesEl.textContent;
    namesEl.textContent = '';
    [...text].forEach(c => {
      const s = document.createElement('span');
      s.className = 'ch';
      s.setAttribute('aria-hidden', 'true');
      s.textContent = c === ' ' ? ' ' : c;
      namesEl.appendChild(s);
      chars.push(s);
    });
  }

  function revealHero(instant) {
    const box = $('.hero-in');
    gsap.set(box, { visibility: 'visible' });
    if (instant || reduce) { gsap.set('.cue,.skip', { opacity: 1 }); return; }
    splitNames();
    gsap.fromTo(chars, { opacity: 0, y: 14, filter: 'blur(7px)' }, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 1.1, stagger: .035, ease: 'power3.out' });
    gsap.fromTo('.hero-date', { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: .9, ease: 'power3.out', delay: .6 });
    gsap.to('.cue,.skip', { opacity: 1, duration: .9, delay: 1 });
  }

  /* ---------- A soft chime as the seal breaks ---------- */

  function chime() {
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      const ac = new AC(), now = ac.currentTime;
      [1318.5, 1760, 2637].forEach((f, i) => {
        const o = ac.createOscillator(), g = ac.createGain(), t = now + i * .085;
        o.type = 'sine';
        o.frequency.value = f;
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(.05, t + .012);
        g.gain.exponentialRampToValueAtTime(.0001, t + 1.5);
        o.connect(g).connect(ac.destination);
        o.start(t);
        o.stop(t + 1.6);
      });
      setTimeout(() => ac.close(), 2400);
    } catch (_) { /* sound is a nicety */ }
  }

  /* ---------- Arrival: the card appears and the bird brings it in ---------- */

  const bird = window.Bird.make('cover-bird');
  cover.appendChild(bird);
  let hover = null, intro = null;

  if (!reduce) {
    intro = gsap.timeline({ delay: .25 });
    intro
      .from('.cover-blossoms', { opacity: 0, scale: 1.05, transformOrigin: '100% 0%', duration: 1.8, ease: 'power2.out' }, 0)
      .from('.cover-branch', { opacity: 0, x: -30, duration: 1.8, ease: 'power2.out' }, .2)
      .from('.cover-of', { opacity: 0, y: 12, duration: .9, ease: 'power3.out' }, .5)
      .from('.cover-names', { opacity: 0, y: 16, duration: 1.1, ease: 'power3.out' }, .62)
      .from('.cover-date', { opacity: 0, y: 12, duration: .9, ease: 'power3.out' }, .85)
      .from('.seal', { opacity: 0, scale: 1.35, duration: .55, ease: 'power3.in' }, 1)
      .from('.cover-tap', { opacity: 0, duration: .8 }, 1.5)
      .add(() => cover.classList.add('settled'), 1.6)
      .fromTo(bird, { x: () => -bird.getBoundingClientRect().left - 170, y: -90, rotation: 12 }, { x: 0, y: 0, rotation: 0, duration: 1.7, ease: 'power3.out' }, .9)
      .add(() => {
        hover = gsap.timeline({ repeat: -1, yoyo: true, defaults: { ease: 'sine.inOut' } })
          .to(bird, { y: 9, x: 5, rotation: -2, duration: 1.15 });
      });
    window.Petals.start();
  }

  /* ---------- Opening ---------- */

  let opened = false;

  function finish() {
    cover.classList.add('gone');
    root.classList.remove('is-locked');
    document.dispatchEvent(new CustomEvent('invite:open'));
  }

  function open() {
    if (opened) return;
    opened = true;
    btn.disabled = true;
    if (window.__startMusic) window.__startMusic();
    if (reduce) { revealHero(true); finish(); return; }

    chime();
    if (intro) intro.progress(1);
    if (hover) hover.kill();
    cover.classList.add('opening');

    const r = slot.getBoundingClientRect();
    const cx = r.left + r.width / 2, cy = r.top + r.height / 2;

    gsap.timeline({ onComplete: finish })
      // the press, then the crack
      .to(seals, { scale: .92, duration: .09, ease: 'power2.out' }, 0)
      .to(seals, { scale: 1, duration: .24, ease: 'back.out(3)' }, .09)
      .add(() => window.Petals.burst(cx, cy, 34), .14)
      .to(leafL, { x: -5, duration: .2, ease: 'power2.out' }, .14)
      .to(leafR, { x: 5, duration: .2, ease: 'power2.out' }, .14)
      // the bird startles back, then darts off
      .to(bird, { x: '-=16', y: '+=8', rotation: 4, duration: .16, ease: 'power2.out' }, 0)
      .to(bird, { x: innerWidth + 220, y: '-=260', rotation: -14, duration: .95, ease: 'power2.in' }, .16)
      // the doors
      .to(leafL, { rotationY: 94, duration: 1.45, ease: 'power3.inOut' }, .4)
      .to(leafR, { rotationY: -94, duration: 1.45, ease: 'power3.inOut' }, .4)
      .to('.shade', { opacity: 1, duration: 1.1, ease: 'power2.in' }, .45)
      .add(() => window.Petals.gust(46), .72)
      .add(() => revealHero(false), 1.05);
  }

  btn.addEventListener('click', open);

  // Links that go straight to a section skip the ceremony
  if (/^#(open|rsvp|details|countdown)$/.test(location.hash)) {
    opened = true;
    if (intro) intro.progress(1).kill();
    revealHero(true);
    gsap.set(bird, { display: 'none' });
    window.Petals.start();
    finish();
  }
})();
