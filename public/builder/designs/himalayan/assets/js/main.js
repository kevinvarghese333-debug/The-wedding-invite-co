/* Fills the page from config.js and runs everything after the gate. */
(function () {
  const cfg = window.INVITE;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];

  /* ---------- Content ---------- */
  const fill = (attr, text) => $$(`[data-${attr}]`).forEach((el) => { el.textContent = text; });
  fill('bride', cfg.bride);
  fill('groom', cfg.groom);
  /* Keeps "Mr." and the like on the same line as the name after them. */
  const titled = (s) => s.replace(/\b(Mrs?\.|Smt\.|Shri|Late) /g, '$1 ');
  fill('blessings', titled(cfg.families.blessings));
  fill('bride-parents', titled(cfg.families.bride.parents));
  fill('bride-place', cfg.families.bride.place);
  fill('groom-parents', titled(cfg.families.groom.parents));
  fill('groom-place', cfg.families.groom.place);
  fill('map-label', cfg.map.label);
  fill('message', cfg.couple.message);
  fill('rsvp-by', cfg.rsvp.by);
  fill('hashtag', cfg.hashtag);

  $('#event-list').innerHTML = cfg.events.map((e) => `
    <article class="event">
      <figure class="oval-wrap">
        <div class="oval"><img src="assets/img/events/${e.id}.jpg" alt=""></div>
        ${Ornaments.ovalFrame()}
      </figure>
      <div class="event-text">
        <h3>${e.name}</h3>
        <p class="event-when">${e.date}, ${e.time}</p>
        <p class="event-venue">${e.venue}</p>
        <p class="event-route">${e.route}</p>
      </div>
    </article>`).join('');

  $('#info-list').innerHTML = cfg.guestInfo.map((t) => `
    <article class="tip">
      <div class="tip-art"><img src="assets/img/info/${t.id}.jpg" alt="" loading="lazy"></div>
      <div>
        <h3>${t.title}</h3>
        <p>${t.text.replace('{hashtag}', `<b>${cfg.hashtag}</b>`)}</p>
      </div>
    </article>`).join('');

  $('#map-link').href = cfg.map.url;
  $('#ig-link').href = cfg.instagram.url;
  $('[data-ig-handle]').innerHTML = `<a href="${cfg.instagram.url}" target="_blank" rel="noopener">${cfg.instagram.handle}</a>`;
  $('#wa').href = `https://wa.me/${cfg.rsvp.whatsapp}?text=${encodeURIComponent(cfg.rsvp.message)}`;

  $$('[data-arches]').forEach(Ornaments.arches);
  Ornaments.mandala($('#mandala'));

  /* ---------- Gallery: slides by arrow, dot, swipe, or on its own ---------- */
  (function gallery() {
    const track = $('#track');
    const dots = $('#dots');
    const box = $('#slides');
    const n = cfg.gallery.length;
    let at = 0;
    let timer = null;
    let inView = false;

    track.innerHTML = cfg.gallery.map((p, i) => `<img src="${p.src}" alt="${p.alt}, photo ${i + 1} of ${n}" draggable="false"${i ? ' loading="lazy"' : ''}>`).join('');
    dots.innerHTML = cfg.gallery.map((_, i) => `<button type="button" aria-label="Show photo ${i + 1}"></button>`).join('');
    const marks = [...dots.children];

    function go(i, instant) {
      at = (i + n) % n;
      gsap.to(track, { xPercent: -100 * at, duration: instant || reduce ? 0 : .7, ease: 'power3.inOut', overwrite: true });
      marks.forEach((m, k) => m.setAttribute('aria-current', String(k === at)));
    }
    function stop() { clearInterval(timer); timer = null; }
    function start() {
      stop();
      if (reduce || !inView || document.hidden) return;
      timer = setInterval(() => go(at + 1), 4500);
    }
    function user(i) { go(i); start(); }

    $('#next').addEventListener('click', () => user(at + 1));
    $('#prev').addEventListener('click', () => user(at - 1));
    marks.forEach((m, i) => m.addEventListener('click', () => user(i)));

    let x0 = null;
    box.addEventListener('pointerdown', (e) => { if (!e.target.closest('.nav')) x0 = e.clientX; });
    box.addEventListener('pointerup', (e) => {
      if (x0 === null) return;
      const dx = e.clientX - x0;
      x0 = null;
      if (Math.abs(dx) > 40) user(at + (dx < 0 ? 1 : -1));
    });
    box.addEventListener('pointercancel', () => { x0 = null; });
    box.addEventListener('mouseenter', stop);
    box.addEventListener('mouseleave', start);
    box.addEventListener('focusin', stop);
    box.addEventListener('focusout', start);
    document.addEventListener('visibilitychange', start);

    new IntersectionObserver(([e]) => { inView = e.isIntersecting; start(); }, { threshold: .4 }).observe(box);
    go(0, true);
  })();

  /* ---------- Cabinet: opens as it arrives; tapping it opens or closes it ---------- */
  (function cabinet() {
    const box = $('#cabinet');
    $('#cab-toggle').addEventListener('click', () => box.classList.toggle('is-open'));
    new IntersectionObserver(([e], io) => {
      if (e.isIntersecting) {
        box.classList.add('is-open');
        io.disconnect();
      }
    }, { threshold: .55 }).observe(box);
  })();

  /* ---------- Countdown ---------- */
  (function clock() {
    const end = Date.parse(cfg.weddingAt);
    const pad = (v) => String(v).padStart(2, '0');
    const out = { d: $('#c-d'), h: $('#c-h'), m: $('#c-m'), s: $('#c-s') };
    const note = $('#night-note');
    const when = cfg.events.find((e) => e.id === 'shaadi');
    function tick() {
      const left = end - Date.now();
      if (left <= 0) {
        Object.values(out).forEach((el) => { el.textContent = '00'; });
        note.textContent = 'Today is the day.';
        clearInterval(timer);
        return;
      }
      const s = Math.floor(left / 1000);
      out.d.textContent = pad(Math.floor(s / 86400));
      out.h.textContent = pad(Math.floor(s / 3600) % 24);
      out.m.textContent = pad(Math.floor(s / 60) % 60);
      out.s.textContent = pad(s % 60);
    }
    note.textContent = `${when.date}, ${when.time}`;
    const timer = setInterval(tick, 1000);
    tick();
  })();

  /* ---------- Stars: a slow twinkle over the top of the photo ---------- */
  (function stars() {
    if (reduce) return;
    const canvas = $('#stars');
    const box = canvas.parentElement;
    const ctx = canvas.getContext('2d');
    let list = [];
    let visible = false;
    let raf = 0;

    function size() {
      const dpr = Math.min(devicePixelRatio || 1, 2);
      const w = box.clientWidth;
      const h = box.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      list = Array.from({ length: Math.round(w / 8) + 30 }, () => ({
        x: Math.random() * w,
        y: Math.random() * h * .55,
        r: Math.random() * 1.1 + .4,
        p: Math.random() * 6.28,
        v: Math.random() * .0016 + .0006,
      }));
    }
    function draw(t) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const s of list) {
        ctx.globalAlpha = .25 + .75 * Math.abs(Math.sin(s.p + t * s.v));
        ctx.fillStyle = '#fff4dc';
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, 6.29);
        ctx.fill();
      }
      if (visible) raf = requestAnimationFrame(draw);
    }
    new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      cancelAnimationFrame(raf);
      if (visible) { size(); raf = requestAnimationFrame(draw); }
    }).observe(box);
    addEventListener('resize', () => { if (visible) size(); });
  })();

  /* ---------- Scroll and motion ---------- */
  const a = $('.nm-a');
  const b = $('.nm-b');
  const amp = $('.nm-amp');
  const when = $('.names-when');
  const cue = $('.stage-cue');
  const cueText = $('.stage-cue span');
  gsap.set('.layer', { xPercent: -50 });

  if (reduce) return;

  /* Names wait, tilted, off to each side until the gate has parted. */
  gsap.set(a, { rotation: -14, xPercent: -26, yPercent: 24, opacity: 0 });
  gsap.set(b, { rotation: 12, xPercent: 26, yPercent: 30, opacity: 0 });
  gsap.set(amp, { scale: .4, opacity: 0 });
  gsap.set([when, cueText], { opacity: 0 });

  gsap.registerPlugin(ScrollTrigger);
  const lenis = new Lenis({ lerp: .11 });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  window.lenis = lenis;
  /* Lenis scrolls by script, so overflow:hidden alone won't hold the page behind the gate. */
  lenis.stop();

  window.addEventListener('invite:open', () => {
    lenis.start();
    gsap.timeline({ defaults: { ease: 'power3.out' } })
      .to(a, { rotation: 0, xPercent: 0, yPercent: 0, opacity: 1, duration: 1.5 }, .1)
      .to(b, { rotation: 0, xPercent: 0, yPercent: 0, opacity: 1, duration: 1.5 }, .3)
      .to(amp, { scale: 1, opacity: 1, duration: .9, ease: 'back.out(2)' }, .95)
      .to(when, { opacity: 1, duration: .9 }, 1.25)
      .to(cueText, { opacity: 1, duration: .9 }, 1.7);
    ScrollTrigger.refresh();
  }, { once: true });

  /* One scrubbed timeline: every layer drifts at its own speed while the procession
     walks up the path toward the temple. */
  const vh = () => innerHeight;
  gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: { trigger: '#scene', start: 'top top', end: 'bottom bottom', scrub: true, invalidateOnRefresh: true },
  })
    .to('#names', { y: () => -vh() * .42 }, 0)
    .to('.sky', { y: () => -vh() * .06 }, 0)
    .to('.temple', { y: () => -vh() * .03, scale: 1.1 }, 0)
    .to('.ridge', { y: () => vh() * .02 }, 0)
    .to('.guests', { y: () => -vh() * .2, scale: .46 }, 0)
    .fromTo(cue, { opacity: 1 }, { opacity: 0, duration: .12 }, .02)
    .to('.stage-fade', { opacity: 1, duration: .28 }, .72);

  /* Ganesha is uncovered from the top, once. */
  gsap.fromTo('.ganesha', { clipPath: 'inset(0% 0% 100% 0%)' }, {
    clipPath: 'inset(0% 0% 0% 0%)', duration: 1.4, ease: 'power2.inOut',
    scrollTrigger: { trigger: '.jharokha', start: 'top 70%', once: true },
  });

  /* Each frame draws itself as its card reaches the reader, then the painting opens inside it. */
  $$('.event').forEach((card) => {
    const lines = $$('.of-draw', card);
    gsap.set(lines, { attr: { 'stroke-dasharray': '1 1', 'stroke-dashoffset': 1 } });
    gsap.set($$('.of-beads, .of-crown', card), { opacity: 0 });
    gsap.timeline({ scrollTrigger: { trigger: card, start: 'top 78%', once: true } })
      .to(lines, { attr: { 'stroke-dashoffset': 0 }, duration: 1.2, ease: 'power2.inOut', stagger: .12 }, 0)
      .fromTo($('.oval', card), { clipPath: 'ellipse(0% 0% at 50% 50%)' }, { clipPath: 'ellipse(72% 72% at 50% 50%)', duration: 1, ease: 'power2.out' }, .25)
      .to($$('.of-beads, .of-crown', card), { opacity: 1, duration: .6 }, .7)
      .from($('.event-text', card), { opacity: 0, duration: .7 }, .55);
  });

  /* The route draws itself along the map as you scroll past. */
  gsap.fromTo('#map-route', { strokeDashoffset: 1 }, {
    strokeDashoffset: 0, ease: 'none',
    scrollTrigger: { trigger: '.map', start: 'top 72%', end: 'bottom 62%', scrub: true },
  });

  /* The pink arches rise into the purple, and the marigolds settle into place. */
  gsap.fromTo('.arches-back', { y: 60 }, {
    y: 0, ease: 'none',
    scrollTrigger: { trigger: '#pink', start: 'top bottom', end: 'top 45%', scrub: true },
  });
  gsap.fromTo('.drape', { rotation: 1.5, scaleY: .86 }, {
    rotation: 0, scaleY: 1, ease: 'none',
    scrollTrigger: { trigger: '#pink', start: 'top 90%', end: 'top 15%', scrub: true },
  });

  addEventListener('load', () => ScrollTrigger.refresh());
})();
