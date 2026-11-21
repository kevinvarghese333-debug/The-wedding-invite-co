/* Sneha & Jerin: everything after the opening.
   The walk, the two portraits, the countdown, the hanging signs and the RSVP. */
(() => {
  'use strict';
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const root = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const CONFIG = window.INVITE;
  const Walk = window.Walk;
  const Petals = window.Petals;
  const hasWalk = () => !root.classList.contains('no-gl');

  /* ---------- Smooth scrolling, held while the card is closed ---------- */

  let lenis = null;
  if (!reduce && window.Lenis) {
    lenis = new Lenis({ lerp: .1 });
    window.__lenis = lenis;
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(t => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    if (root.classList.contains('is-locked')) lenis.stop();
  }

  const goTo = target => {
    if (!target) return;
    if (lenis) lenis.scrollTo(target, { duration: 1.8 });
    else target.scrollIntoView();
  };
  $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
    e.preventDefault();
    goTo($(a.getAttribute('href')));
  }));

  document.addEventListener('invite:open', () => {
    if (lenis) lenis.start();
    ScrollTrigger.refresh();
    if (/^#(rsvp|details|countdown)$/.test(location.hash)) requestAnimationFrame(() => goTo($(location.hash)));
  });

  /* ---------- The walk ---------- */

  let walkTrigger = null, walkOn = true, pointerX = 0, pointerY = 0;

  function walkMotion() {
    const tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: { trigger: '.walk', start: 'top top', end: 'bottom bottom', scrub: .35 }
    });
    walkTrigger = tl.scrollTrigger;

    tl.to({}, { duration: 1 }, 0)
      // leaving the first screen
      .to('.hero-words', { opacity: 0, y: -36, duration: .07, ease: 'power1.in' }, .012)
      .to('.cue', { opacity: 0, duration: .03 }, .004)
      .to('.walk-fog', { opacity: 0, duration: .12 }, .012)
      .to('.walk-margin', { yPercent: -10, xPercent: -8, opacity: 0, duration: .5, ease: 'power1.in' }, 0)
      // up the path and through the door
      .fromTo(Walk, { zoomA: 1 }, { zoomA: 7, duration: .4, ease: 'power2.in' }, 0)
      .fromTo(Walk, { open: 0 }, { open: 1, duration: .2, ease: 'power1.inOut' }, .07)
      // down the aisle
      .fromTo(Walk, { zoomB: 1 }, { zoomB: 1.16, duration: .28 }, 0)
      .to(Walk, { zoomB: 2.3, duration: .54, ease: 'sine.inOut' }, .28)
      .fromTo('.aisle-line', { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: .06, ease: 'power1.out' }, .46)
      .to('.aisle-line', { opacity: 0, y: -14, duration: .05, ease: 'power1.in' }, .66)
      // into the white, and the arch
      .fromTo(Walk, { white: 0 }, { white: 1, duration: .14, ease: 'power1.in' }, .72)
      .to('.skip', { autoAlpha: 0, duration: .04 }, .8)
      .to('.walk-window', { autoAlpha: 0, duration: .02 }, .85)
      .fromTo('.arrival', { autoAlpha: 0 }, { autoAlpha: 1, duration: .05 }, .84)
      .fromTo('.arrival-arch', { scale: 1.5, yPercent: -6 }, { scale: 1, yPercent: 0, duration: .1, ease: 'power2.out' }, .83)
      .fromTo('.aw', { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: .035, stagger: .016, ease: 'power1.out' }, .89);

    ScrollTrigger.create({ trigger: '.walk', start: 'top bottom', end: 'bottom top', onToggle: s => { walkOn = s.isActive; } });

    addEventListener('pointermove', e => {
      pointerX = e.clientX / innerWidth - .5;
      pointerY = e.clientY / innerHeight - .5;
    }, { passive: true });

    gsap.ticker.add(time => {
      if (!walkOn || !Walk.ok) return;
      const p = walkTrigger ? walkTrigger.progress : 0;
      Walk.px = Math.sin(time * .45) * .005 + pointerX * .014;
      Walk.py = Math.cos(time * .33) * .004 + pointerY * .01 + Math.sin(p * 54) * .0016; // the rise and fall of walking
      Walk.render();
    });
  }

  /* ---------- The two portraits meet ---------- */

  function pairMotion() {
    const span = { trigger: '.pair-row', start: 'top 94%', end: 'top 26%', scrub: .5 };
    gsap.fromTo('.p-a', { xPercent: -64, rotation: -5 }, { xPercent: 0, rotation: 0, ease: 'power1.out', scrollTrigger: span });
    gsap.fromTo('.p-b', { xPercent: 64, rotation: 5 }, { xPercent: 0, rotation: 0, ease: 'power1.out', scrollTrigger: { ...span } });
    const wing = { trigger: '.pair-row', start: 'top 82%', end: 'top 14%', scrub: .9 };
    gsap.timeline({ scrollTrigger: wing })
      .fromTo('.f-a', { x: () => -innerWidth * .6 }, { x: 0, ease: 'none' }, 0)
      .fromTo('.f-a', { y: 170 }, { y: 0, ease: 'sine.out' }, 0)
      .fromTo('.f-b', { x: () => innerWidth * .6 }, { x: 0, ease: 'none' }, 0)
      .fromTo('.f-b', { y: -90 }, { y: 0, ease: 'sine.in' }, 0);
  }

  /* ---------- Countdown ---------- */

  const target = new Date(CONFIG.weddingStart).getTime();
  const cd = { d: $('#cd-d'), h: $('#cd-h'), m: $('#cd-m'), s: $('#cd-s') };
  const note = $('#cd-note');
  const branch = $('#countBranch');
  let countInView = false;
  note.textContent = CONFIG.weddingNote;

  const pad = n => String(n).padStart(2, '0');
  function setNum(el, v) {
    if (el.textContent === v) return;
    el.textContent = v;
    if (!reduce) { el.classList.remove('tick'); void el.offsetWidth; el.classList.add('tick'); }
  }
  function tickClock() {
    let diff = Math.max(0, target - Date.now());
    if (diff === 0) {
      $('#clock').hidden = true;
      note.textContent = Date.now() < target + 864e5 ? 'Today is the day. Thank you for celebrating with us.' : 'Married on 30 December 2026. Thank you for your love and blessings.';
      return;
    }
    const d = Math.floor(diff / 864e5); diff -= d * 864e5;
    const h = Math.floor(diff / 36e5); diff -= h * 36e5;
    const m = Math.floor(diff / 6e4); diff -= m * 6e4;
    const s = Math.floor(diff / 1e3);
    setNum(cd.d, String(d)); setNum(cd.h, pad(h)); setNum(cd.m, pad(m)); setNum(cd.s, pad(s));
    // One petal lets go of the branch with every second
    if (countInView && !document.hidden) {
      const r = branch.getBoundingClientRect();
      Petals.drop(r.left + r.width * (.2 + Math.random() * .75), r.top + r.height * (.45 + Math.random() * .4));
    }
    setTimeout(tickClock, 1000 - (Date.now() % 1000));
  }
  tickClock();

  /* ---------- The celebrations ---------- */

  const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const ICON_PIN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/></svg>';
  const ICON_CAL = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><rect x="3.5" y="5" width="17" height="15.5" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4"/></svg>';
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const ladder = $('#ladder');
  const PLANKS = [[1002, 348], [948, 294], [948, 354], [972, 312]]; // set up front so the signs never shift the page

  CONFIG.events.forEach((ev, i) => {
    const [, mo, d] = ev.date.split('-').map(Number);
    const art = document.createElement('article');
    art.className = 'rung';
    art.innerHTML = `
      <div class="plank p${i + 1}">
        <img src="assets/img/plank-${i + 1}.webp" alt="" width="${PLANKS[i][0]}" height="${PLANKS[i][1]}" decoding="async">
        <time datetime="${ev.date}">${d} ${MONTHS[mo - 1]}</time>
      </div>
      <div class="rung-body">
        <h3>${esc(ev.title)}</h3>
        ${ev.host ? `<p class="host">${esc(ev.host)}</p>` : ''}
        ${ev.parts.map(p => `
          <p class="part"><strong>${esc(ev.weekday)}, ${esc(p.time)}</strong><br>${esc(p.where)}</p>
          ${p.map ? `<a class="btn" href="${esc(p.map)}" target="_blank" rel="noopener">${ICON_PIN}Directions</a>` : ''}`).join('')}
        <div class="cal"><button class="btn" type="button" data-cal="${i}" aria-expanded="false">${ICON_CAL}Add to calendar</button></div>
      </div>`;
    ladder.appendChild(art);
  });

  /* Calendar */
  const NAMES = `${CONFIG.couple.first} & ${CONFIG.couple.second}`;
  const utc = iso => new Date(iso).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  const calText = ev => ev.parts.map(p => `${p.time}: ${ev.title}, ${p.where}${p.map ? ` (${p.map})` : ''}`).join('\n') + `\n\n${NAMES}`;
  function gcal(ev) {
    const u = new URL('https://calendar.google.com/calendar/render');
    u.searchParams.set('action', 'TEMPLATE');
    u.searchParams.set('text', `${ev.title}: ${NAMES}`);
    u.searchParams.set('dates', `${utc(ev.cal.start)}/${utc(ev.cal.end)}`);
    u.searchParams.set('details', calText(ev));
    u.searchParams.set('location', ev.parts[0].where);
    u.searchParams.set('ctz', 'Asia/Kolkata');
    return u.toString();
  }
  function ics(ev) {
    const escI = s => s.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;');
    const body = ['BEGIN:VCALENDAR', 'VERSION:2.0', `PRODID:-//${NAMES}//Invitation//EN`, 'CALSCALE:GREGORIAN', 'BEGIN:VEVENT',
      `UID:${ev.id}-2026@wedding`, `DTSTAMP:${utc(new Date().toISOString())}`, `DTSTART:${utc(ev.cal.start)}`, `DTEND:${utc(ev.cal.end)}`,
      `SUMMARY:${escI(`${ev.title}: ${NAMES}`)}`, `LOCATION:${escI(ev.parts[0].where)}`, `DESCRIPTION:${escI(calText(ev))}`,
      'BEGIN:VALARM', 'TRIGGER:-PT3H', 'ACTION:DISPLAY', 'DESCRIPTION:Reminder', 'END:VALARM', 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([body], { type: 'text/calendar' }));
    a.download = `wedding-${ev.id}.ics`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }
  let openMenu = null;
  function closeMenu() {
    if (!openMenu) return;
    openMenu.menu.remove();
    openMenu.btn.setAttribute('aria-expanded', 'false');
    openMenu = null;
  }
  ladder.addEventListener('click', e => {
    const btn = e.target.closest('[data-cal]');
    if (!btn) return;
    e.stopPropagation();
    const same = openMenu && openMenu.btn === btn;
    closeMenu();
    if (same) return;
    const ev = CONFIG.events[+btn.dataset.cal];
    const menu = document.createElement('div');
    menu.className = 'cal-menu';
    menu.innerHTML = `<a href="${esc(gcal(ev))}" target="_blank" rel="noopener">Google Calendar</a><button type="button">Apple or Outlook (.ics)</button>`;
    menu.querySelector('button').addEventListener('click', () => { ics(ev); closeMenu(); });
    btn.parentElement.appendChild(menu);
    btn.setAttribute('aria-expanded', 'true');
    openMenu = { btn, menu };
  });
  document.addEventListener('click', e => { if (openMenu && !openMenu.menu.contains(e.target)) closeMenu(); });
  addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });

  /* The signs hang on chains, so scrolling sets them swinging */
  const rungs = $$('.rung').map((el, i) => ({ el, a: 0, v: 0, k: 30 - i * 2.5 }));
  let signsOn = false;

  function signsMotion() {
    ScrollTrigger.create({ trigger: '.days', start: 'top bottom', end: 'bottom top', onToggle: s => { signsOn = s.isActive; } });
    rungs.forEach(r => ScrollTrigger.create({ trigger: r.el, start: 'top 88%', onEnter: () => { r.v += 15; }, onEnterBack: () => { r.v -= 8; } }));
  }

  /* ---------- One clock for everything that reacts to scrolling ---------- */

  let lastY = scrollY;
  gsap.ticker.add((time, delta) => {
    const y = scrollY, dy = y - lastY;
    lastY = y;
    if (reduce) return;
    Petals.scroll(dy);
    if (!signsOn) return;
    const dt = Math.min(.033, delta / 1000);
    for (const r of rungs) {
      const force = -r.k * r.a - 2.6 * r.v + dy * 1.1;
      r.v += force * dt;
      r.a = Math.max(-2.4, Math.min(2.4, r.a + r.v * dt));
      r.el.style.transform = `rotate(${r.a.toFixed(3)}deg)`;
    }
  });

  /* ---------- RSVP: the hummingbird carries the reply ---------- */

  const form = $('#rsvpForm'), err = $('#rsvpErr'), submit = $('#rsvpSubmit');
  const gOut = $('#rsvp-guests'), gMinus = $('#g-minus'), gPlus = $('#g-plus'), guestsField = $('#guestsField');
  const thanks = $('#thanks');
  let guests = 2, reply = null;

  function setGuests(n) {
    guests = Math.max(1, Math.min(10, n));
    gOut.textContent = guests;
    gMinus.disabled = guests <= 1;
    gPlus.disabled = guests >= 10;
  }
  gMinus.addEventListener('click', () => setGuests(guests - 1));
  gPlus.addEventListener('click', () => setGuests(guests + 1));
  setGuests(2);
  form.addEventListener('change', e => { if (e.target.name === 'attending') guestsField.hidden = e.target.value === 'no'; });

  function showThanks(r) {
    const first = r.name.split(/\s|&/)[0];
    $('#thanksTitle').textContent = r.attending === 'yes' ? `Thank you, ${first}` : 'Thank you';
    $('#thanksMsg').textContent = (r.attending === 'yes'
      ? `${CONFIG.couple.first} and ${CONFIG.couple.second} can’t wait to celebrate with you on ${(window.__WIC || {}).DATE_DM || 'the day'}.`
      : `${CONFIG.couple.first} and ${CONFIG.couple.second} will miss you, and they’re grateful for your love and prayers.`)
      + (CONFIG.rsvpEndpoint ? '' : ' This is a sample invitation, so your reply wasn’t saved.');
    if (CONFIG.rsvpEndpoint) document.querySelectorAll('.demo-note').forEach((n) => n.remove());
    form.hidden = true;
    thanks.hidden = false;
    gsap.set(form, { clearProps: 'opacity' });
  }

  // The form folds into a note, the bird takes it and flies off
  function flight(done) {
    if (reduce) { done(); return; }
    const card = $('#rsvpCard').getBoundingClientRect();
    const cx = card.left + card.width / 2, cy = Math.min(innerHeight * .62, card.top + card.height / 2);

    const paper = document.createElement('div');
    paper.className = 'paper-note';
    paper.setAttribute('aria-hidden', 'true');
    document.body.appendChild(paper);

    const bird = window.Bird.make('rsvp-bird');
    document.body.appendChild(bird);
    const bw = bird.offsetWidth;
    // the bird hovers just above the note, with its ribbons over it
    const hoverX = cx - bw * .52, hoverY = cy - bw * .78;
    gsap.set(paper, { left: cx - 34, top: cy - 23, scale: 2.2, opacity: 0, rotation: -5 });
    gsap.set(bird, { left: 0, top: 0, x: -bw - 20, y: cy - bw * 1.7, rotation: 10 });

    gsap.timeline({ onComplete: () => { paper.remove(); bird.remove(); } })
      .to(form, { opacity: 0, duration: .4, ease: 'power2.in' }, 0)
      .to(paper, { opacity: 1, scale: 1, rotation: 3, duration: .55, ease: 'power3.out' }, .22)
      .to(bird, { x: hoverX, duration: 1.15, ease: 'power3.out' }, .3)
      .to(bird, { y: hoverY, rotation: 0, duration: 1.15, ease: 'sine.out' }, .3)
      .add(() => { done(); Petals.burst(cx, cy, 22); }, 1.75)
      .to([bird, paper], { y: `-=${cy + bw * 1.3}`, duration: 1.15, ease: 'power2.in' }, 1.6)
      .to([bird, paper], { x: `+=${innerWidth * .9}`, duration: 1.15, ease: 'power1.in' }, 1.6)
      .to(bird, { rotation: -16, duration: .6, ease: 'power1.in' }, 1.6);
  }

  $('#editReply').addEventListener('click', () => {
    if (reply) {
      $('#rsvp-name').value = reply.name;
      $(reply.attending === 'no' ? '#rsvp-no' : '#rsvp-yes').checked = true;
      guestsField.hidden = reply.attending === 'no';
      setGuests(reply.guests || 1);
      $('#rsvp-msg').value = reply.message || '';
    }
    thanks.hidden = true;
    form.hidden = false;
    $('#rsvp-name').focus();
  });

  form.addEventListener('submit', e => {
    e.preventDefault();
    err.textContent = '';
    const name = $('#rsvp-name').value.trim();
    if (name.length < 2) {
      err.textContent = 'Enter your name so the couple know who’s replying.';
      $('#rsvp-name').focus();
      return;
    }
    const attending = form.attending.value;
    reply = { name, attending, guests: attending === 'yes' ? guests : 0, message: $('#rsvp-msg').value.trim() };
    if (CONFIG.rsvpEndpoint) fetch(CONFIG.rsvpEndpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(reply) }).catch(() => {});
    submit.disabled = true;
    flight(() => {
      showThanks(reply);
      submit.disabled = false;
    });
  });

  /* ---------- Closing ---------- */

  function closingMotion() {
    gsap.fromTo('.closing-photo', { scale: 1.14 }, {
      scale: 1, ease: 'none',
      scrollTrigger: { trigger: '.closing', start: 'top bottom', end: 'bottom bottom', scrub: .5 }
    });
  }

  /* ---------- Music, if a track has been added ---------- */

  const audio = $('#music'), mBtn = $('#musicBtn');
  if (CONFIG.music) {
    audio.src = CONFIG.music;
    audio.addEventListener('canplay', () => { mBtn.hidden = false; }, { once: true });
    audio.addEventListener('error', () => { mBtn.hidden = true; });
    const setPlaying = on => {
      mBtn.classList.toggle('playing', on);
      mBtn.setAttribute('aria-label', on ? 'Pause music' : 'Play music');
    };
    mBtn.addEventListener('click', () => {
      if (audio.paused) audio.play().then(() => setPlaying(true)).catch(() => {});
      else { audio.pause(); setPlaying(false); }
    });
    window.__startMusic = () => { audio.load(); audio.play().then(() => { mBtn.hidden = false; setPlaying(true); }).catch(() => {}); };
  }

  /* ---------- Start ---------- */

  ScrollTrigger.create({ trigger: '.count', start: 'top 85%', end: 'bottom 15%', onToggle: s => { countInView = s.isActive; } });
  if (!reduce) {
    Walk.ready.then(ok => { if (ok && hasWalk()) { walkMotion(); ScrollTrigger.refresh(); } });
    pairMotion();
    signsMotion();
    closingMotion();
  }
})();
