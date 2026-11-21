/* Malavika & Hari · everything after the opening:
   mist over the pond, the invitation, the story, the day itself, and the RSVP. */
(() => {
  'use strict';
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const NS = 'http://www.w3.org/2000/svg';
  const svgEl = (tag, attrs) => {
    const el = document.createElementNS(NS, tag);
    for (const k in attrs) el.setAttribute(k, attrs[k]);
    return el;
  };
  const root = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const pond = window.Pond;

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
  $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
    const target = $(a.getAttribute('href'));
    if (!target || !lenis) return;
    e.preventDefault();
    lenis.scrollTo(target, { duration: 1.6 });
  }));

  /* ---------- The pond: mist rolls in over their photo ---------- */

  function pondMotion() {
    gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: { trigger: '.pond-scene', start: 'top top', end: '+=70%', pin: true, scrub: .6 }
    })
      .fromTo(pond, { zoom: 1 }, { zoom: 1.12, duration: 1, onUpdate: () => pond.wake && pond.wake() }, 0)
      .fromTo(pond, { mist: 0 }, { mist: 1, duration: .85, ease: 'power1.in' }, .15)
      .fromTo('.hero-words', { y: 0, opacity: 1 }, { y: -70, opacity: 0, duration: .45, ease: 'power1.in', immediateRender: false }, 0)
      .fromTo('.scrollcue', { opacity: 1 }, { opacity: 0, duration: .15, immediateRender: false }, 0)
      .fromTo('.pond-fog', { opacity: 0 }, { opacity: 1, duration: .8 }, .2);
  }

  /* ---------- Headings and the invitation wording ---------- */

  function revealMotion() {
    const items = $$('.rv');
    gsap.set(items, { opacity: 0, y: 24 });
    ScrollTrigger.batch(items, {
      start: 'top 88%',
      once: true,
      onEnter: batch => gsap.to(batch, { opacity: 1, y: 0, duration: 1.1, stagger: .12, ease: 'expo.out', overwrite: true })
    });
    // The little lotus draws itself
    $$('.lotus-line path').forEach(p => {
      const len = p.getTotalLength();
      gsap.fromTo(p, { strokeDasharray: len, strokeDashoffset: len }, {
        strokeDashoffset: 0, duration: 2.2, ease: 'power2.inOut',
        scrollTrigger: { trigger: '.lotus-line', start: 'top 85%', once: true }
      });
    });
  }

  /* ---------- Story: a stream runs through the chapters ---------- */

  const stream = $('.stream'), bed = $('.stream-bed'), flow = $('.stream-flow'), bud = $('.stream-bud');
  let streamLen = 0;

  function drawStream() {
    const box = stream.getBoundingClientRect(), w = box.width, h = box.height;
    $('.stream-line').setAttribute('viewBox', `0 0 ${w} ${h}`);
    const pts = $$('.chap-photo', stream).map(f => {
      const r = f.getBoundingClientRect();
      return { x: r.left + r.width / 2 - box.left, y: r.top + r.height / 2 - box.top };
    });
    pts.unshift({ x: w / 2, y: 0 });
    pts.push({ x: w / 2, y: h });
    // On one column the photos line up, so the stream swings out to the sides between them
    const straight = pts.every(p => Math.abs(p.x - w / 2) < 4);
    let d = `M${pts[0].x} ${pts[0].y}`;
    for (let i = 1; i < pts.length; i++) {
      const a = pts[i - 1], b = pts[i], dy = (b.y - a.y) * .55, s = straight ? (i % 2 ? 1 : -1) * w * .44 : 0;
      d += `C${a.x + s} ${a.y + dy} ${b.x + s} ${b.y - dy} ${b.x} ${b.y}`;
    }
    bed.setAttribute('d', d);
    flow.setAttribute('d', d);
    streamLen = flow.getTotalLength();
    flow.style.strokeDasharray = streamLen;
  }

  function setStream(p) {
    flow.style.strokeDashoffset = streamLen * (1 - p);
    const pt = flow.getPointAtLength(streamLen * p);
    bud.style.transform = `translate(${pt.x}px, ${pt.y}px)`;
    bud.style.opacity = p > .002 && p < .998 ? 1 : 0;
  }

  function storyMotion() {
    drawStream();
    ScrollTrigger.addEventListener('refreshInit', drawStream);
    ScrollTrigger.create({
      trigger: stream, start: 'top 55%', end: 'bottom 55%', scrub: .5,
      onUpdate: self => setStream(self.progress),
      onRefresh: self => setStream(self.progress)
    });

    $$('.chap').forEach(ch => {
      const photo = $('.chap-photo', ch);
      gsap.timeline({ scrollTrigger: { trigger: ch, start: 'top 78%', once: true } })
        .fromTo(photo, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.6, ease: 'expo.out', clearProps: 'clipPath' })
        .fromTo($('img', photo), { scale: 1.3 }, { scale: 1, duration: 1.8, ease: 'expo.out' }, 0)
        .fromTo($$('.chap-text > *', ch), { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 1.1, stagger: .1, ease: 'expo.out' }, .25);
      gsap.fromTo($('.chap-year', ch), { yPercent: -10 }, {
        yPercent: -90, ease: 'none',
        scrollTrigger: { trigger: ch, start: 'top bottom', end: 'bottom top', scrub: true }
      });
    });
    return () => ScrollTrigger.removeEventListener('refreshInit', drawStream);
  }

  /* ---------- The muhurtham dial: 10:42 to 11:20 ---------- */

  const dial = $('.dial svg');
  const R = 92, angle = m => (m * 6 - 90) * Math.PI / 180;
  const at = m => [R * Math.cos(angle(m)), R * Math.sin(angle(m))];
  (() => {
    const g = $('.dial-ticks', dial);
    for (let i = 0; i < 60; i++) {
      const a = (i * 6 - 90) * Math.PI / 180, major = i % 5 === 0, r0 = major ? 101 : 104;
      g.appendChild(svgEl('line', {
        x1: r0 * Math.cos(a), y1: r0 * Math.sin(a), x2: 109 * Math.cos(a), y2: 109 * Math.sin(a),
        class: major ? 'major' : ''
      }));
    }
    const [x0, y0] = at(42), [x1, y1] = at(80);
    $('.dial-arc', dial).setAttribute('d', `M${x0} ${y0}A${R} ${R} 0 1 1 ${x1} ${y1}`);
  })();

  function dialMotion() {
    const arc = $('.dial-arc', dial), sun = $('.dial-sun', dial), hand = $('.dial-hand', dial);
    const len = arc.getTotalLength(), pos = { p: 0 };
    const place = () => {
      arc.style.strokeDashoffset = len * (1 - pos.p);
      const pt = arc.getPointAtLength(len * pos.p);
      sun.setAttribute('transform', `translate(${pt.x} ${pt.y})`);
      hand.setAttribute('transform', `rotate(${252 + 228 * pos.p})`);
    };
    arc.style.strokeDasharray = len;
    place();
    gsap.timeline({ scrollTrigger: { trigger: '.muhurtham', start: 'top 72%', once: true } })
      .fromTo('.muhurtham', { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 1.2, ease: 'expo.out' })
      .to(pos, { p: 1, duration: 2.6, ease: 'power2.inOut', onUpdate: place }, .3)
      .fromTo('.muhurtham .fn-num span', { yPercent: 110 }, { yPercent: 0, duration: 1, ease: 'expo.out' }, .3)
      .fromTo($$('.mu-text > :not(.fn-date)'), { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: .9, stagger: .07, ease: 'expo.out' }, .35);
  }

  function dialStill() {
    const arc = $('.dial-arc', dial), pt = arc.getPointAtLength(arc.getTotalLength());
    $('.dial-sun', dial).setAttribute('transform', `translate(${pt.x} ${pt.y})`);
    $('.dial-hand', dial).setAttribute('transform', 'rotate(480)');
  }

  function functionsMotion() {
    gsap.fromTo('.fns-bg img', { yPercent: -8 }, {
      yPercent: 0, ease: 'none',
      scrollTrigger: { trigger: '.fns', start: 'top bottom', end: 'bottom top', scrub: true }
    });
    $$('.fn').forEach((fn, i) => {
      gsap.timeline({ scrollTrigger: { trigger: '.fn-row', start: 'top 82%', once: true }, delay: i * .12 })
        .fromTo(fn, { opacity: 0, y: 60 }, { opacity: 1, y: 0, duration: 1.2, ease: 'expo.out' })
        .fromTo($('.fn-num span', fn), { yPercent: 110 }, { yPercent: 0, duration: 1, ease: 'expo.out' }, .15)
        .fromTo($('.kasavu', fn), { scaleX: 0 }, { scaleX: 1, duration: 1.4, ease: 'power3.inOut' }, .3);
    });
  }

  /* ---------- Add to calendar (.ics) ---------- */

  const EVENTS = [
    { id: 'mehendi', title: 'Mehendi & music', start: '20270220T113000Z', end: '20270220T160000Z', place: "Sreeragam, the bride's home, Poonkunnam, Thrissur" },
    { id: 'muhurtham', title: 'Wedding · muhurtham 10:42 to 11:20 AM', start: '20270221T044500Z', end: '20270221T060000Z', place: 'Sree Krishna Temple, Kalyana Mandapam, East Nada, Guruvayur' },
    { id: 'sadhya', title: 'Sadhya', start: '20270221T063000Z', end: '20270221T090000Z', place: 'Padmam Auditorium, East Nada, Guruvayur' },
    { id: 'reception', title: 'Reception', start: '20270221T130000Z', end: '20270221T163000Z', place: 'The Kole Pavilion, Adat, Thrissur' }
  ]; // times are IST, written in UTC
  const icsEscape = s => s.replace(/[\\,;]/g, m => '\\' + m);

  function addToCalendar(i) {
    const e = EVENTS[i];
    const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+/, '');
    const ics = [
      'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Malavika and Hari//Invitation//EN', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      `UID:${e.id}-2027@malavika-hari`, `DTSTAMP:${stamp}`, `DTSTART:${e.start}`, `DTEND:${e.end}`,
      `SUMMARY:${icsEscape(e.title + ' · ' + ((window.__WIC || {}).ONE || '') + ' & ' + ((window.__WIC || {}).TWO || ''))}`,
      `LOCATION:${icsEscape(e.place)}`,
      `URL:${location.href.split('#')[0]}`,
      'END:VEVENT', 'END:VCALENDAR'
    ].join('\r\n');
    const url = URL.createObjectURL(new Blob([ics], { type: 'text/calendar;charset=utf-8' }));
    const a = Object.assign(document.createElement('a'), { href: url, download: `malavika-hari-${e.id}.ics` });
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
  }
  $$('[data-cal]').forEach(b => b.addEventListener('click', () => addToCalendar(+b.dataset.cal)));

  /* ---------- Sadhya: the leaf, then each dish in the order it's served ---------- */

  // x, y on the leaf, size, colour; o is the serving order; la puts the label above
  const DISHES = [
    { name: 'Salt', x: 150, y: 178, r: 8, c: '#F6F3EC', o: 5 },
    { name: 'Banana chips', x: 205, y: 148, r: 19, c: '#E9B83E', o: 2 },
    { name: 'Sharkara varatti', x: 262, y: 116, r: 17, c: '#9C501F', o: 3, la: 1 },
    { name: 'Lime pickle', x: 320, y: 98, r: 13, c: '#C7A23B', o: 4 },
    { name: 'Mango pickle', x: 370, y: 92, r: 13, c: '#C4491F', o: 6, la: 1 },
    { name: 'Inji puli', x: 420, y: 88, r: 13, c: '#6E2F1B', o: 7 },
    { name: 'Thoran', x: 482, y: 96, r: 23, c: '#CCD47E', o: 8, la: 1 },
    { name: 'Avial', x: 552, y: 98, r: 26, c: '#E8DBA9', o: 9 },
    { name: 'Olan', x: 622, y: 100, r: 23, c: '#EEF0DB', o: 10, la: 1 },
    { name: 'Kaalan', x: 690, y: 104, r: 23, c: '#E9C04A', o: 11 },
    { name: 'Pachadi', x: 754, y: 110, r: 21, c: '#B83B6C', o: 12, la: 1 },
    { name: 'Kichadi', x: 812, y: 120, r: 19, c: '#E8E0C2', o: 13 },
    { name: 'Erissery', x: 866, y: 134, r: 22, c: '#D9822B', o: 14, la: 1 },
    { name: 'Koottu curry', x: 918, y: 156, r: 20, c: '#8C5A2B', o: 15 },
    { name: 'Pazham', x: 132, y: 286, rx: 46, ry: 13, rot: -14, c: '#EFC94C', o: 1 },
    { name: 'Pappadam', x: 250, y: 300, r: 38, c: '#F3E3B4', o: 16, pappadam: 1 },
    { name: 'Rice', x: 520, y: 300, r: 76, c: '#FAF7EE', o: 17, rice: 1, ly: 398 },
    { name: 'Parippu & ghee', x: 494, y: 288, r: 24, c: '#E8B93A', o: 18, ly: 226 },
    { name: 'Sambar', x: 566, y: 318, r: 28, c: '#B5521F', o: 19, lx: 628, ly: 290 },
    { name: 'Rasam', x: 694, y: 338, r: 21, c: '#A9381F', o: 20 },
    { name: 'Moru', x: 760, y: 366, r: 16, c: '#F4F1E6', o: 23 },
    { name: 'Ada pradhaman', x: 820, y: 292, r: 28, c: '#8A5A2C', o: 21, la: 1 },
    { name: 'Pal payasam', x: 902, y: 322, r: 25, c: '#F1E3C6', o: 22 }
  ];

  (() => {
    const leaf = $('.leaf'), blade = $('.leaf-blade', leaf);
    const defs = $('defs', leaf);
    const clip = svgEl('clipPath', { id: 'leafclip' });
    clip.appendChild(svgEl('path', { d: blade.getAttribute('d') }));
    defs.appendChild(clip);
    const sheen = svgEl('radialGradient', { id: 'dishsheen', cx: '.35', cy: '.3', r: '.7' });
    sheen.append(svgEl('stop', { offset: '0', 'stop-color': '#fff', 'stop-opacity': '.45' }), svgEl('stop', { offset: '1', 'stop-color': '#fff', 'stop-opacity': '0' }));
    defs.appendChild(sheen);

    // Side veins, curving from the midrib to the edges
    const veins = $('.leaf-veins', leaf);
    veins.setAttribute('clip-path', 'url(#leafclip)');
    for (let x = 50; x < 990; x += 26) {
      veins.appendChild(svgEl('path', { d: `M${x} 213Q${x + 18} 130 ${x + 60} 20` }));
      veins.appendChild(svgEl('path', { d: `M${x} 217Q${x + 18} 300 ${x + 60} 420` }));
    }

    const g = $('.dishes', leaf), list = $('.dish-list');
    [...DISHES].sort((a, b) => a.o - b.o).forEach(d => {
      const dish = svgEl('g', { class: 'dish', transform: `translate(${d.x} ${d.y})` });
      const body = svgEl('g', { class: 'dish-body' });
      if (d.rx) {
        body.appendChild(svgEl('ellipse', { rx: d.rx, ry: d.ry, fill: d.c, transform: `rotate(${d.rot})` }));
        body.appendChild(svgEl('ellipse', { rx: d.rx, ry: d.ry, fill: 'url(#dishsheen)', transform: `rotate(${d.rot})` }));
      } else {
        body.appendChild(svgEl('circle', { r: d.r, fill: d.c, stroke: 'rgba(40,40,20,.18)', 'stroke-width': 1 }));
        if (d.rice) {
          for (let i = 0; i < 46; i++) {
            const a = Math.random() * Math.PI * 2, rr = Math.sqrt(Math.random()) * (d.r - 8);
            body.appendChild(svgEl('ellipse', { cx: Math.cos(a) * rr, cy: Math.sin(a) * rr, rx: 3.4, ry: 1.4, fill: '#E9E2CF', transform: `rotate(${Math.random() * 180} ${Math.cos(a) * rr} ${Math.sin(a) * rr})` }));
          }
        }
        if (d.pappadam) {
          for (let i = 0; i < 14; i++) {
            const a = Math.random() * Math.PI * 2, rr = Math.sqrt(Math.random()) * (d.r - 6);
            body.appendChild(svgEl('circle', { cx: Math.cos(a) * rr, cy: Math.sin(a) * rr, r: 1.5 + Math.random() * 2.5, fill: 'none', stroke: '#D9BF83', 'stroke-width': 1 }));
          }
        }
        body.appendChild(svgEl('circle', { r: d.r, fill: 'url(#dishsheen)' }));
      }
      dish.appendChild(body);
      const r = d.r || d.ry;
      const lx = (d.lx || d.x) - d.x;
      const ly = (d.ly || (d.la ? d.y - r - 9 : d.y + r + 17)) - d.y;
      const label = svgEl('text', { class: 'dish-label', x: lx, y: ly, 'text-anchor': 'middle' });
      label.textContent = d.name;
      dish.appendChild(label);
      g.appendChild(dish);
      const li = document.createElement('li');
      li.textContent = d.name;
      list.appendChild(li);
    });
  })();

  function sadhyaMotion() {
    const leaf = $('.leaf');
    const tl = gsap.timeline({ scrollTrigger: { trigger: leaf, start: 'top 75%', once: true } });
    tl.fromTo('.leaf-body', { scaleX: 0, opacity: 0 }, { scaleX: 1, opacity: 1, duration: 1.4, ease: 'expo.out', svgOrigin: '18 214' })
      .fromTo('.dish-body', { scale: 0 }, { scale: 1, duration: .6, ease: 'back.out(2.2)', stagger: .11 }, .7)
      .fromTo('.dish-label', { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: .5, stagger: .11 }, .85);
  }

  /* ---------- Countdown, with rolling digits ---------- */

  const WEDDING = Number((window.__WIC || {}).TS) || Date.UTC(2027, 1, 21, 5, 12); // 10:42 AM IST, Sunday 21 February 2027

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

  function countdownMotion() {
    gsap.fromTo('.cd-bg', { yPercent: -8 }, {
      yPercent: 8, ease: 'none',
      scrollTrigger: { trigger: '.cd', start: 'top bottom', end: 'bottom top', scrub: true }
    });
  }

  /* ---------- Gallery: a strip along the water ---------- */

  const strip = $('.gal-strip'), galItems = $$('.gal-item');

  function gallery() {
    const bar = $('.gal-progress i');
    const update = () => {
      const max = strip.scrollWidth - strip.clientWidth;
      const p = max > 0 ? strip.scrollLeft / max : 1;
      bar.style.transform = `scaleX(${.1 + p * .9})`;
    };
    strip.addEventListener('scroll', update, { passive: true });
    addEventListener('resize', update);
    update();
    $$('.gal-btn').forEach(b => b.addEventListener('click', () => {
      const step = galItems[0].getBoundingClientRect().width + 20;
      strip.scrollBy({ left: step * 2 * Number(b.dataset.dir), behavior: reduce ? 'auto' : 'smooth' });
    }));
    // A vertical wheel over the strip still scrolls the page; shift or a trackpad moves the strip
  }

  function galleryMotion() {
    gsap.fromTo(galItems, { clipPath: 'inset(100% 0% 0% 0%)', y: 40 }, {
      clipPath: 'inset(0% 0% 0% 0%)', y: 0, duration: 1.4, ease: 'expo.out', stagger: .08, clearProps: 'clipPath',
      scrollTrigger: { trigger: strip, start: 'top 80%', once: true }
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
      if (lenis) lenis.stop();
      gsap.fromTo(lb, { opacity: 0 }, { opacity: 1, duration: .3 });
      if (!reduce) gsap.fromTo(img, { scale: .94, opacity: 0 }, { scale: 1, opacity: 1, duration: .6, ease: 'expo.out' });
      $('.lb-close', lb).focus();
    };
    const close = () => gsap.to(lb, {
      opacity: 0, duration: .25,
      onComplete: () => {
        lb.hidden = true;
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
      const dinner = fns.includes('the Reception') ? ` ${f.get('food') === 'vegetarian' ? 'Vegetarian' : 'Non-vegetarian'} at the reception, noted.` : '';
      $('.done-msg', done).textContent = yes
        ? `We've kept ${guests} ${guests === 1 ? 'seat' : 'seats'} for you at ${list(fns)}.${dinner}${f.get('stay') ? " We'll be in touch about a stay in Guruvayur." : ''}`
        : "We'll miss you, and we're grateful you let us know.";

      swap(body, done, () => {
        done.focus({ preventScroll: true });
        if (yes && !reduce) petals(done);
      });
    });

    $('[data-again]', done).addEventListener('click', () => swap(done, body));
  }

  // A handful of lotus petals drift down over the reply
  function petals(box) {
    const r = box.getBoundingClientRect();
    for (let i = 0; i < 16; i++) {
      const p = document.createElement('i');
      p.className = 'petal-fx';
      document.body.appendChild(p);
      const x = r.left + r.width * (.1 + Math.random() * .8);
      gsap.set(p, { left: x, top: r.top - 20, rotation: Math.random() * 360, scale: .6 + Math.random() * .7 });
      gsap.to(p, {
        y: r.height * (.6 + Math.random() * .6), x: (Math.random() - .5) * 120, rotation: '+=' + (Math.random() * 240 - 120),
        opacity: 0, duration: 2.4 + Math.random() * 1.6, ease: 'power1.in', delay: Math.random() * .5,
        onComplete: () => p.remove()
      });
    }
  }

  /* ---------- Closing: the lotus folds for the night ---------- */

  const dusk = $('.dusk-lotus');
  const DUSK = [[-56, .9, 'pb'], [56, .9, 'pb'], [-28, .96, 'pb'], [28, .96, 'pb'], [0, 1, 'pb'], [-70, .74, 'pf'], [70, .74, 'pf'], [-36, .82, 'pf'], [36, .82, 'pf']];
  const duskPetals = DUSK.map(([a, s, fill]) => {
    const g = svgEl('g', { 'data-a': a, 'data-s': s });
    g.appendChild(svgEl('use', { href: '#petal', fill: `url(#${fill})` }));
    $('.dl-petals', dusk).appendChild(g);
    return g;
  });

  function closingMotion() {
    duskPetals.forEach(p => gsap.set(p, { svgOrigin: '0 0', rotation: +p.dataset.a, scale: +p.dataset.s }));
    gsap.to(duskPetals, {
      rotation: (i, el) => +el.dataset.a * .1,
      scaleX: (i, el) => +el.dataset.s * .56,
      ease: 'none',
      scrollTrigger: { trigger: '.closing', start: 'top 60%', end: 'bottom bottom', scrub: .8 }
    });
  }

  function closingStill() {
    duskPetals.forEach(p => gsap.set(p, { svgOrigin: '0 0', rotation: +p.dataset.a * .1, scaleX: +p.dataset.s * .56, scaleY: +p.dataset.s }));
  }

  countdown();
  gallery();
  lightbox();
  rsvp();

  // Created in page order, so each pin's spacing is measured before the next
  const mm = gsap.matchMedia();
  mm.add('(prefers-reduced-motion: no-preference)', () => {
    pondMotion();
    revealMotion();
    const undoStory = storyMotion();
    dialMotion();
    functionsMotion();
    sadhyaMotion();
    countdownMotion();
    galleryMotion();
    closingMotion();
    return undoStory;
  });
  mm.add('(prefers-reduced-motion: reduce)', () => {
    dialStill();
    closingStill();
    $('.stream-line').style.display = 'none';
  });

  addEventListener('load', () => ScrollTrigger.refresh());
})();
