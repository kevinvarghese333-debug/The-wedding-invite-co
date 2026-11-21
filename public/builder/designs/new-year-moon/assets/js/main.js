/* Nila & Aaron · the scroll chapters after the opening:
   the moon hero, the invitation wording and the story timeline. */
(() => {
  'use strict';
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const root = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Smooth scrolling, held while the opening plays ---------- */

  let lenis = null;
  if (!reduce && window.Lenis) {
    lenis = new Lenis({ lerp: .1 });
    window.__lenis = lenis;
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(t => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    if (root.classList.contains('is-locked')) lenis.stop();
  }
  document.addEventListener('invite:open', () => {
    if (lenis) lenis.start();
    ScrollTrigger.refresh();
  });

  /* ---------- Hero: the moon grows into their photo ---------- */

  const hero = {
    pin: $('.hero-pin'), photo: $('.hero-photo'), moon: $('.hero-moon'), ring: $('.hero-ring'),
    head: $('.hero-head'), foot: $('.hero-foot'), shade: $('.hero-shade'), cap: $('.hero-caption')
  };
  const FOCUS = { x: .5, y: .33 }; // between their faces in hero.jpg
  const r0 = () => Math.min(innerWidth, hero.pin.clientHeight) * .26;
  const r1 = () => Math.hypot(innerWidth / 2, hero.pin.clientHeight / 2) + 4;

  // How far the focus point sits from the centre of the screen, for the cover-fitted photo
  function focusOffset() {
    const W = hero.pin.clientWidth, H = hero.pin.clientHeight;
    const iw = hero.photo.naturalWidth || 1500, ih = hero.photo.naturalHeight || 2000;
    const s = Math.max(W / iw, H / ih), dw = iw * s, dh = ih * s;
    return { x: (W - dw) * .5 + FOCUS.x * dw - W / 2, y: (H - dh) * .3 + FOCUS.y * dh - H / 2 }; // object-position 50% 30%
  }
  const setR0 = () => hero.pin.style.setProperty('--r0', r0() + 'px');
  setR0();
  ScrollTrigger.addEventListener('refreshInit', setR0);

  function heroMotion() {
    const S = 1.25; // the photo starts zoomed so the faces fill the moon
    gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: { trigger: hero.pin, start: 'top top', end: '+=170%', pin: true, scrub: .8, invalidateOnRefresh: true }
    })
      .fromTo(hero.pin, { '--r': () => r0() + 'px' }, { '--r': () => r1() + 'px', duration: .55, ease: 'power2.inOut' }, 0)
      .fromTo(hero.photo,
        { scale: S, x: () => -S * focusOffset().x, y: () => -S * focusOffset().y },
        { scale: 1, x: 0, y: 0, duration: .55, ease: 'power2.inOut' }, 0)
      .fromTo(hero.moon, { opacity: 1 }, { opacity: 0, duration: .26, ease: 'power1.in' }, .02)
      .fromTo(hero.ring, { opacity: 1 }, { opacity: 0, duration: .22 }, 0)
      .fromTo(hero.head, { y: 0, opacity: 1 }, { y: -50, opacity: 0, duration: .22, ease: 'power1.in' }, 0)
      .fromTo(hero.foot, { y: 0, opacity: 1 }, { y: 50, opacity: 0, duration: .22, ease: 'power1.in' }, 0)
      .fromTo(hero.shade, { opacity: 0 }, { opacity: 1, duration: .2 }, .5)
      .fromTo(hero.cap, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: .18, ease: 'power2.out' }, .62)
      .to({}, { duration: .2 }); // hold on the full photo before moving on
  }

  function heroStill() {
    gsap.set(hero.pin, { '--r': r1() + 'px' });
    gsap.set([hero.moon, hero.ring, hero.head, hero.foot], { autoAlpha: 0 });
    gsap.set([hero.shade, hero.cap], { opacity: 1 });
  }

  /* ---------- Invitation wording and section headings ---------- */

  function revealMotion() {
    const items = $$('.words .rv, .story-intro .rv, .fns-intro .rv, .day .rv');
    gsap.set(items, { opacity: 0, y: 24 });
    ScrollTrigger.batch(items, {
      start: 'top 86%',
      once: true,
      onEnter: batch => gsap.to(batch, { opacity: 1, y: 0, duration: 1, stagger: .12, ease: 'expo.out', overwrite: true })
    });
  }

  /* ---------- Story: a sideways timeline ---------- */

  function storyMotion() {
    const story = $('.story'), track = $('.track', story), chapters = $$('.chapter', story);
    const fill = $('.rail-fill', story), star = $('.rail-star', story), count = $('.story-count b', story);
    story.classList.add('is-horizontal');
    const dist = () => track.scrollWidth - innerWidth;

    // Photos further along the track sit off to the side, where lazy loading may not see them in time
    ScrollTrigger.create({
      trigger: story, start: 'top 250%', once: true,
      onEnter: () => $$('img[loading="lazy"]', story).forEach(img => { img.loading = 'eager'; })
    });
    let shown = 0;

    const move = gsap.to(track, {
      x: () => -dist(),
      ease: 'none',
      scrollTrigger: {
        trigger: '.story-pin',
        start: 'top top',
        end: () => '+=' + dist(),
        pin: true,
        scrub: .6,
        invalidateOnRefresh: true,
        onUpdate: self => {
          const p = self.progress;
          fill.style.transform = `scaleX(${p})`;
          star.style.left = p * 100 + '%';
          const i = Math.round(p * (chapters.length - 1));
          if (i !== shown) { shown = i; count.textContent = String(i + 1).padStart(2, '0'); }
        }
      }
    });

    chapters.forEach(ch => {
      // The photo drifts inside its arch, against the direction of travel
      gsap.fromTo($('img', ch), { xPercent: -6 }, {
        xPercent: 6, ease: 'none',
        scrollTrigger: { trigger: ch, containerAnimation: move, start: 'left right', end: 'right left', scrub: true }
      });
      gsap.from($$('.ch-text > *', ch), {
        opacity: 0, y: 22, duration: .9, stagger: .1, ease: 'expo.out',
        scrollTrigger: { trigger: ch, containerAnimation: move, start: 'left 70%', toggleActions: 'play none none reverse' }
      });
    });

    return () => story.classList.remove('is-horizontal');
  }

  /* ---------- Sky: night turns to dusk as the story begins ---------- */

  function skyMotion() {
    gsap.fromTo('.tint', { opacity: 0 }, {
      opacity: 1, ease: 'none',
      scrollTrigger: { trigger: '#invite', start: 'top 60%', end: () => '+=' + innerHeight * 1.4, scrub: true }
    });
  }

  /* ---------- Functions: cards along a line that draws itself ---------- */

  function functionsMotion() {
    gsap.fromTo('.fn-line i', { scaleY: 0 }, {
      scaleY: 1, ease: 'none',
      scrollTrigger: { trigger: '.fn-list', start: 'top 65%', end: 'bottom 65%', scrub: .6 }
    });
    $$('.fn').forEach(fn => {
      gsap.timeline({ scrollTrigger: { trigger: fn, start: 'top 82%', once: true } })
        .fromTo($('.fn-card', fn), { opacity: 0, y: 48, filter: 'blur(6px)' },
          { opacity: 1, y: 0, filter: 'blur(0px)', duration: 1.1, ease: 'expo.out', clearProps: 'filter' })
        .fromTo($('.fn-num span', fn), { yPercent: 110 }, { yPercent: 0, duration: 1, ease: 'expo.out' }, .15)
        .fromTo($$('.fn-card > :not(.fn-top)', fn), { opacity: 0, y: 14 },
          { opacity: 1, y: 0, duration: .8, stagger: .06, ease: 'expo.out' }, .2);
      // The node on the line lights up as its card reaches the middle of the screen
      ScrollTrigger.create({
        trigger: fn, start: 'top 60%',
        onEnter: () => fn.classList.add('is-lit'),
        onLeaveBack: () => fn.classList.remove('is-lit')
      });
    });
  }

  /* ---------- Daybreak: the sun comes up behind the functions ---------- */

  function daybreakMotion() {
    gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: { trigger: '#functions', start: 'top 70%', end: 'bottom bottom', scrub: true }
    })
      .fromTo('.daybreak', { opacity: 0 }, { opacity: 1, duration: .7, ease: 'power1.inOut' }, 0)
      .fromTo('.sun', { yPercent: 95 }, { yPercent: 42, duration: 1, ease: 'power2.out' }, 0)
      .fromTo('#sky', { opacity: 1 }, { opacity: .12, duration: .8 }, 0);
  }

  function daybreakStill() {
    gsap.set('.sun', { yPercent: 50 });
    ScrollTrigger.create({
      trigger: '#functions', start: 'top 60%',
      onEnter: () => gsap.to('.daybreak', { opacity: 1, duration: 1.2 }),
      onLeaveBack: () => gsap.to('.daybreak', { opacity: 0, duration: 1.2 })
    });
  }

  /* ---------- Add to calendar (.ics) ---------- */

  const EVENTS = [
    { id: 'madhuram-veppu', title: 'Madhuram Veppu', start: '20261230T130000Z', end: '20261230T160000Z', place: "Kizhakkethil, the bride's home, Panampilly Nagar, Kochi" },
    { id: 'new-years-eve', title: "New Year's Eve with the families", start: '20261231T153000Z', end: '20261231T190000Z', place: 'Harbour Lawn, Fort Kochi' },
    { id: 'holy-matrimony', title: 'Holy Matrimony', start: '20270101T053000Z', end: '20270101T070000Z', place: 'Our Lady of Light Church, Kadavanthra, Kochi' },
    { id: 'reception', title: 'Reception', start: '20270101T130000Z', end: '20270101T170000Z', place: 'Kayal Convention Centre, Marine Drive, Kochi' }
  ]; // times are IST, written in UTC
  const icsEscape = s => s.replace(/[\\,;]/g, m => '\\' + m);

  function addToCalendar(i) {
    const e = EVENTS[i];
    const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+/, '');
    const ics = [
      'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Nila and Aaron//Invitation//EN', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      `UID:${e.id}-2027@nila-aaron`, `DTSTAMP:${stamp}`, `DTSTART:${e.start}`, `DTEND:${e.end}`,
      `SUMMARY:${icsEscape(e.title + ' · ' + ((window.__WIC || {}).ONE || '') + ' & ' + ((window.__WIC || {}).TWO || ''))}`,
      `LOCATION:${icsEscape(e.place)}`,
      `URL:${location.href.split('#')[0]}`,
      'END:VEVENT', 'END:VCALENDAR'
    ].join('\r\n');
    const url = URL.createObjectURL(new Blob([ics], { type: 'text/calendar;charset=utf-8' }));
    const a = Object.assign(document.createElement('a'), { href: url, download: `nila-aaron-${e.id}.ics` });
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
  }
  $$('[data-cal]').forEach(b => b.addEventListener('click', () => addToCalendar(+b.dataset.cal)));

  /* ---------- Morning: the sky turns light for the last sections ---------- */

  function morningMotion() {
    gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: { trigger: '#countdown', start: 'top 90%', end: 'top 30%', scrub: true }
    })
      .fromTo('.morning', { opacity: 0 }, { opacity: 1 }, 0)
      .fromTo('#sky', { opacity: .12 }, { opacity: 0, immediateRender: false }, 0);
  }

  function morningStill() {
    ScrollTrigger.create({
      trigger: '#countdown', start: 'top 70%',
      onEnter: () => gsap.to('.morning', { opacity: 1, duration: 1.2 }),
      onLeaveBack: () => gsap.to('.morning', { opacity: 0, duration: 1.2 })
    });
  }

  /* ---------- Countdown, with the opening's rolling digits ---------- */

  const WEDDING = Number((window.__WIC || {}).TS) || Date.UTC(2027, 0, 1, 5, 30); // 11:00 AM IST, Friday 1 January 2027

  function roll(slot, ch, animate) {
    // Drop any digit still leaving (its animation may not have run if frames were paused)
    while (slot.children.length > 1) slot.firstElementChild.remove();
    const cur = slot.lastElementChild;
    if (cur && cur.textContent === ch) return;
    const next = document.createElement('span');
    next.className = 'd';
    next.textContent = ch;
    slot.appendChild(next);
    if (!cur) return;
    if (!animate) { cur.remove(); return; }
    gsap.fromTo(next, { yPercent: 100, opacity: 0 }, { yPercent: 0, opacity: 1, duration: .55, ease: 'expo.out' });
    gsap.to(cur, { yPercent: -100, opacity: 0, duration: .38, ease: 'power2.in', onComplete: () => cur.remove() });
  }

  function countdown() {
    const section = $('#countdown'), units = $('.cd-units', section);
    const nums = {};
    $$('.cd-num', units).forEach(n => { nums[n.dataset.unit] = n; });
    let lastLabel = '', timer = 0;

    function setNumber(box, str, animate) {
      while (box.children.length < str.length) {
        const s = document.createElement('span');
        s.className = 'slot';
        box.prepend(s);
      }
      while (box.children.length > str.length) box.firstElementChild.remove();
      [...box.children].forEach((slot, i) => roll(slot, str[i], animate));
    }

    function render(animate) {
      const left = Math.max(0, Math.floor((WEDDING - Date.now()) / 1000));
      const v = { d: Math.floor(left / 86400), h: Math.floor(left % 86400 / 3600), m: Math.floor(left % 3600 / 60), s: left % 60 };
      for (const k in v) setNumber(nums[k], String(v[k]).padStart(2, '0'), animate);
      const label = `${v.d} days, ${v.h} hours and ${v.m} minutes until the wedding`;
      if (label !== lastLabel) { units.setAttribute('aria-label', label); lastLabel = label; }
      if (!left) { section.classList.add('is-done'); clearInterval(timer); }
    }

    render(false);
    timer = setInterval(() => render(!reduce && !document.hidden), 1000);
  }

  /* ---------- Gallery: masonry columns that drift at different speeds ---------- */

  const galItems = $$('.gal-item');
  const SHAPE = { tall: 4 / 3, wide: 3 / 4, sq: 1 };

  // Put each photo in whichever column is shortest so far
  function galleryColumns(count) {
    const grid = $('.gal-grid');
    grid.textContent = '';
    grid.classList.add('cols');
    const cols = Array.from({ length: count }, () => {
      const c = document.createElement('div');
      c.className = 'gal-col';
      grid.appendChild(c);
      return { el: c, h: 0 };
    });
    galItems.forEach(item => {
      const col = cols.reduce((a, b) => (b.h < a.h ? b : a));
      col.el.appendChild(item);
      col.h += SHAPE[['tall', 'wide', 'sq'].find(k => item.classList.contains(k))] || 1;
    });
    return cols.map(c => c.el);
  }

  function galleryMotion(cols) {
    const drift = cols.length === 3 ? [0, -90, -35] : [0, -60];
    cols.forEach((col, i) => {
      if (!drift[i]) return;
      gsap.fromTo(col, { y: 0 }, {
        y: drift[i], ease: 'none',
        scrollTrigger: { trigger: '.gal-grid', start: 'top bottom', end: 'bottom top', scrub: true }
      });
    });
    galItems.forEach(item => {
      gsap.timeline({ scrollTrigger: { trigger: item, start: 'top 92%', once: true } })
        .fromTo(item, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.2, ease: 'expo.out', clearProps: 'clipPath' })
        .fromTo($('img', item), { scale: 1.25 }, { scale: 1, duration: 1.4, ease: 'expo.out', clearProps: 'transform' }, 0);
    });
  }

  /* ---------- Lightbox ---------- */

  function lightbox() {
    const lb = $('.lightbox'), img = $('.lb-img', lb), count = $('.lb-count', lb);
    const btns = $$('.lb-btn', lb);
    let i = 0, opener = null, x0 = null;

    const show = n => {
      i = (n + galItems.length) % galItems.length;
      const src = $('img', galItems[i]);
      img.src = src.currentSrc || src.src;
      img.alt = src.alt;
      count.textContent = `${i + 1} / ${galItems.length}`;
    };
    const step = d => {
      show(i + d);
      if (!reduce) gsap.fromTo(img, { x: 40 * d, opacity: 0 }, { x: 0, opacity: 1, duration: .5, ease: 'expo.out' });
    };
    const open = n => {
      opener = galItems[n];
      show(n);
      lb.hidden = false;
      root.classList.add('lb-open');
      if (lenis) lenis.stop();
      gsap.fromTo(lb, { opacity: 0 }, { opacity: 1, duration: .3 });
      if (!reduce) gsap.fromTo(img, { scale: .94, opacity: 0 }, { scale: 1, opacity: 1, duration: .6, ease: 'expo.out' });
      $('.lb-close', lb).focus();
    };
    const close = () => gsap.to(lb, {
      opacity: 0, duration: .25,
      onComplete: () => {
        lb.hidden = true;
        root.classList.remove('lb-open');
        if (lenis) lenis.start();
        if (opener) opener.focus({ preventScroll: true });
      }
    });

    galItems.forEach((item, n) => item.addEventListener('click', () => open(n)));
    $('.lb-close', lb).addEventListener('click', close);
    $('.lb-prev', lb).addEventListener('click', () => step(-1));
    $('.lb-next', lb).addEventListener('click', () => step(1));
    lb.addEventListener('click', e => { if (e.target === lb) close(); });
    document.addEventListener('keydown', e => {
      if (lb.hidden) return;
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowLeft') step(-1);
      else if (e.key === 'ArrowRight') step(1);
      else if (e.key === 'Tab') { // keep focus inside the lightbox
        const k = btns.indexOf(document.activeElement);
        e.preventDefault();
        btns[(k + (e.shiftKey ? -1 : 1) + btns.length) % btns.length].focus();
      }
    });
    // Swipe between photos
    img.addEventListener('pointerdown', e => { x0 = e.clientX; });
    img.addEventListener('pointerup', e => {
      if (x0 === null) return;
      const dx = e.clientX - x0;
      x0 = null;
      if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1);
    });
  }

  /* ---------- RSVP (a sample: nothing is saved or sent) ---------- */

  function rsvp() {
    const form = $('.rsvp-card'), body = $('.rsvp-form', form), done = $('.rsvp-done', form);
    const err = $('.rsvp-error', form), ifYes = $('.if-yes', form), out = $('output[name="guests"]', form);
    let guests = 2;

    form.addEventListener('change', e => {
      if (e.target.name === 'attend') ifYes.hidden = e.target.value !== 'yes';
    });
    $$('[data-step]', form).forEach(b => b.addEventListener('click', () => {
      guests = Math.min(8, Math.max(1, guests + Number(b.dataset.step)));
      out.value = guests;
    }));

    const list = a => (a.length < 2 ? a.join('') : `${a.slice(0, -1).join(', ')} and ${a[a.length - 1]}`);
    const fail = (msg, field) => {
      err.textContent = msg;
      if (field) field.focus();
      if (!reduce) gsap.fromTo(err, { x: -8 }, { x: 0, duration: .5, ease: 'elastic.out(1, .4)' });
    };
    const swap = (from, to, after) => gsap.to(from, {
      autoAlpha: 0, y: -12, duration: reduce ? 0 : .35, ease: 'power2.in',
      onComplete: () => {
        from.hidden = true;
        to.hidden = false;
        // Visible straight away (only fading), so it can take focus
        gsap.set(to, { visibility: 'visible' });
        gsap.fromTo(to, { opacity: 0, y: reduce ? 0 : 16 }, { opacity: 1, y: 0, duration: reduce ? .3 : .8, ease: 'expo.out' });
        ScrollTrigger.refresh();
        if (after) after();
      }
    });

    form.addEventListener('submit', e => {
      e.preventDefault();
      const f = new FormData(form);
      const name = String(f.get('name') || '').trim();
      const yes = f.get('attend') === 'yes';
      const fns = f.getAll('fn');
      if (!name) return fail('Please add your name.', form.elements.name);
      if (yes && !fns.length) return fail('Choose at least one of the celebrations.');
      err.textContent = '';

      $('.who', done).textContent = name.split(/\s+/)[0];
      $('.done-msg', done).textContent = yes
        ? `We've kept ${guests} ${guests === 1 ? 'seat' : 'seats'} for you at ${list(fns)}. ${f.get('food') === 'vegetarian' ? 'Vegetarian' : 'Non-vegetarian'}, noted.${f.get('stay') ? " We'll be in touch about a stay in Kochi." : ''}`
        : "We'll miss you, and we're grateful you let us know.";

      swap(body, done, () => {
        done.focus({ preventScroll: true });
        if (!yes || !window.__sparks) return;
        const r = done.getBoundingClientRect();
        [['gold', .3, 0], ['rose', .7, .18], ['ember', .5, .36]].forEach(([tone, fx, delay]) => {
          gsap.delayedCall(delay, () => window.__sparks(r.left + r.width * fx, r.top + r.height * .3, tone));
        });
      });
    });

    $('[data-again]', done).addEventListener('click', () => swap(done, body));
  }

  countdown();
  lightbox();
  rsvp();

  // Created in page order, so each pin's spacing is measured before the next
  const mm = gsap.matchMedia();
  mm.add('(prefers-reduced-motion: no-preference)', () => {
    heroMotion();
    revealMotion();
    const undoStory = storyMotion();
    skyMotion();
    functionsMotion();
    daybreakMotion();
    morningMotion();
    return undoStory;
  });
  mm.add('(prefers-reduced-motion: reduce)', () => {
    heroStill();
    gsap.set('.tint', { opacity: .6 });
    daybreakStill();
    morningStill();
  });
  // The gallery rebuilds its columns when the screen crosses the wide breakpoint
  mm.add({ wide: '(min-width: 900px)', motion: '(prefers-reduced-motion: no-preference)' }, ctx => {
    const cols = galleryColumns(ctx.conditions.wide ? 3 : 2);
    if (ctx.conditions.motion) galleryMotion(cols);
  });

  addEventListener('load', () => ScrollTrigger.refresh());
})();
