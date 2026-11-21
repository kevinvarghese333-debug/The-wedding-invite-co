(() => {
  const C = window.CONFIG, A = window.ART;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const easeIO = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  const easeOut = t => 1 - Math.pow(1 - t, 3);
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const bride = C.couple.bride, groom = C.couple.groom;

  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  window.scrollTo(0, 0);

  /* ---------- Build ---------- */
  $('#sealEdge').setAttribute('d', A.sealEdge());
  $('svg defs').insertAdjacentHTML('beforeend', A.sealSymbol());

  const to = new URLSearchParams(location.search).get('to');
  if (to) { const d = $('#coverDear'); d.textContent = `Dear ${to.slice(0, 60)},`; d.hidden = false; }

  $('#crestWrap').innerHTML = A.crest();
  $('#footCrest').innerHTML = A.crest() + `<div class="mono"><p><span>${esc(bride[0])}</span><span>${esc(groom[0])}</span></p></div>`;

  const letters = w => [...w].map(c => `<span class="l">${esc(c)}</span>`).join('');
  $('#names').innerHTML =
    `<span class="word"><span class="cap" id="capN"><span class="ink">${esc(bride[0])}</span></span>${letters(bride.slice(1))}</span>` +
    `<span class="amp">&amp;</span>` +
    `<span class="word"><span class="cap" id="capA"><span class="ink">${esc(groom[0])}</span></span>${letters(groom.slice(1))}</span>`;
  $('#rEyebrow').textContent = 'Together with their families';
  $('#rDate').textContent = C.dateLong;
  $('#rPlace').textContent = C.place;

  // Portrait
  const ph = (n, label) => `<div class="ph"><span class="ph-mono">${esc(bride[0])}${esc(groom[0])}</span><span class="ph-txt">${esc(label)}</span></div>`;
  $('#portraitPhoto').innerHTML = C.portrait.src
    ? `<img src="${esc(C.portrait.src)}" alt="${esc(C.portrait.alt)}">`
    : ph(0, 'Portrait coming soon');
  $('#portraitLine').textContent = C.portrait.line;

  // Invitation
  $('#kalash').innerHTML = A.kalash();
  $('#blessing').textContent = C.blessing;
  $('#invKicker').textContent = C.invitation.kicker;
  $('#invLead').textContent = C.invitation.lead;
  $('#invBride').textContent = bride;
  $('#invGroom').textContent = groom;
  $('#invBrideParents').textContent = C.invitation.brideParents;
  $('#invGroomParents').textContent = C.invitation.groomParents;
  $('#invDate').textContent = C.dateLong;
  $('#invClose').textContent = C.invitation.close;

  // Countdown
  $('#mandala').innerHTML = A.mandala();
  const first = C.events[0];
  $('#cdNote').textContent = `${C.dateLong} · ${first.time.split('–')[0].trim()} · ${C.venue.name}, Kota`;

  // Events
  const PIN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/></svg>';
  const CAL = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3.5" y="5" width="17" height="15" rx="2"/><path d="M3.5 10h17M8 3v4M16 3v4"/></svg>';
  const flower = () => {
    let s = '';
    for (let i = 0; i < 10; i++) {
      const a = i * Math.PI / 5;
      s += `<circle cx="${(23 + Math.cos(a) * 12).toFixed(1)}" cy="${(23 + Math.sin(a) * 12).toFixed(1)}" r="8" fill="${i % 2 ? '#f2b632' : '#e8862a'}" stroke="#b9621a" stroke-width=".6"/>`;
    }
    return `<svg viewBox="0 0 46 46">${s}<circle cx="23" cy="23" r="8" fill="#c96a17"/><circle cx="23" cy="23" r="4" fill="#f6c04a"/></svg>`;
  };
  const dayLabel = iso => { const d = new Date(iso + 'T12:00:00+05:30'); return `${DAYS[d.getUTCDay()]} · ${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`; };
  $('#timeline').insertAdjacentHTML('beforeend', C.events.map((ev, i) => `
    <article class="ev" data-i="${i}">
      <div class="ev-node" aria-hidden="true">${flower()}</div>
      <div class="ev-card">
        <svg class="ev-arch" data-arch="0" aria-hidden="true"></svg>
        <div class="ev-icon" aria-hidden="true" style="--d:0s">${A.icon(ev.icon)}</div>
        <p class="ev-date">${esc(dayLabel(ev.date))}</p>
        <h3 class="ev-title">${esc(ev.title)}</h3>
        <p class="ev-time">${esc(ev.time)}</p>
        ${ev.note ? `<p class="ev-note">${esc(ev.note)}</p>` : ''}
        <p class="ev-where">${esc(C.venue.name)}, Kota</p>
        <div class="ev-actions">
          <a class="btn" href="${esc(C.venue.map)}" target="_blank" rel="noopener">${PIN}Directions</a>
          <div class="cal"><button class="btn" type="button" data-cal="${i}" aria-expanded="false">${CAL}Add to calendar</button></div>
        </div>
      </div>
    </article>`).join(''));

  // Venue
  $('#venueName').textContent = C.venue.name;
  $('#venueAddr').innerHTML = C.venue.address.map(esc).join('<br>');
  $('#skyline').innerHTML = A.skyline();
  $('#venueMap').href = C.venue.map;
  $('#venueMap').innerHTML = `${PIN}Get directions`;

  // Gallery
  const photos = C.photos;
  $('#galleryGrid').innerHTML = photos.map((p, i) => `
    <figure class="g-item${p.src ? '' : ' placeholder'}" style="--i:${i}" data-i="${i}" ${p.src ? 'tabindex="0" role="button" aria-label="Open photo ' + (i + 1) + '"' : 'aria-hidden="true"'}>
      <div class="g-in">${p.src ? `<img src="${esc(p.src)}" alt="${esc(p.alt)}" loading="lazy">` : ph(i, 'Photo ' + (i + 1))}</div>
      <svg class="g-frame" viewBox="0 0 100 133" preserveAspectRatio="none"><path d="M4,133 L4,46 C4,30 24,21 38,15 C44,12 48,8 50,4 C52,8 56,12 62,15 C76,21 96,30 96,46 L96,133"/></svg>
    </figure>`).join('');

  // RSVP + footer
  if (C.rsvp.by) { $('#rsvpBy').textContent = `Kindly reply by ${C.rsvp.by}`; $('#rsvpBy').hidden = false; }
  $('#footDate').textContent = `${C.dateShort} · ${C.venue.name}`;
  $('#footSign').textContent = C.signoff;

  // Split text into letters
  $$('.split').forEach(el => {
    const t = el.textContent;
    el.setAttribute('aria-label', t);
    el.innerHTML = [...t].map((c, i) => c === ' ' ? '<span class="sp"> </span>' : `<span class="ch" aria-hidden="true" style="--i:${i}">${esc(c)}</span>`).join('');
  });

  /* ---------- Arch outlines, drawn in real pixels so the stroke draws cleanly ---------- */
  // Same shape as #archClip (fractions of the box), inset by i px.
  const ARCH = [[0, .19, .2, .11, .36, .07], [.44, .05, .48, .03, .5, 0], [.52, .03, .56, .05, .64, .07], [.8, .11, 1, .19, 1, .34]];
  function archD(w, h, i, open) {
    const X = x => (i + x * (w - 2 * i)).toFixed(1);
    const Y = y => (i + y * (h - 2 * i)).toFixed(1);
    const yb = open ? h : h - i;
    let d = `M${X(0)} ${yb} L${X(0)} ${Y(.34)}`;
    for (const c of ARCH) d += ` C${X(c[0])} ${Y(c[1])} ${X(c[2])} ${Y(c[3])} ${X(c[4])} ${Y(c[5])}`;
    d += ` L${X(1)} ${yb}`;
    return open ? d : d + ' Z';
  }
  function layoutArches() {
    $$('svg[data-arch]').forEach(svg => {
      const r = svg.getBoundingClientRect();
      const w = svg.clientWidth || r.width, h = svg.clientHeight || r.height;
      if (!w || !h) return;
      svg.setAttribute('viewBox', `0 0 ${w.toFixed(1)} ${h.toFixed(1)}`);
      const keep = [...svg.querySelectorAll('path')].map(p => p.style.cssText);
      svg.innerHTML = svg.dataset.arch.split(',').map(Number)
        .map((i, k) => `<path pathLength="1" class="${k ? 'thin' : ''}" d="${archD(w, h, i + 1, svg.dataset.open)}"/>`).join('');
      [...svg.querySelectorAll('path')].forEach((p, k) => { if (keep[k]) p.style.cssText = keep[k]; });
    });
  }
  layoutArches();

  /* ---------- Toran ---------- */
  function buildToran(el, small) {
    const w = el.clientWidth || innerWidth;
    el.innerHTML = A.toran(w, small);
  }
  buildToran($('#toran'), innerWidth < 700);
  buildToran($('#toran2'), true);

  /* ---------- Monogram reveal ---------- */
  const reveal = $('#reveal');
  const crestWrap = $('#crestWrap');
  const crest = $('.crest', crestWrap);
  const capN = $('#capN'), capA = $('#capA');
  const revLetters = $$('#names .l, #names .amp');
  const rIns = [$('#rEyebrow'), $('#rRule'), $('#rDate'), $('#rPlace')];
  const toran1 = $('#toran');
  const cue = $('#scrollCue');
  let M = null;           // measured monogram geometry
  let introDone = false;

  function measure() {
    capN.style.transform = capA.style.transform = '';
    const cr = crestWrap.getBoundingClientRect();
    const sr = $('.reveal-stick').getBoundingClientRect();
    const fs = parseFloat(getComputedStyle($('#names')).fontSize);
    const ringR = cr.width * 156 / 480;
    const cx = cr.left + cr.width / 2 - sr.left;
    const cy = cr.top + cr.height * (250 / 480) - sr.top;
    const em = ringR * 1.42;          // monogram letter size
    const s = em / fs;
    const geo = (el, tx, ty) => {
      const r = el.getBoundingClientRect();
      return { dx: tx - (r.left + r.width / 2 - sr.left), dy: ty - (r.top + r.height / 2 - sr.top) };
    };
    M = {
      s,
      n: geo(capN, cx - em * 0.17, cy - em * 0.04),
      a: geo(capA, cx + em * 0.19, cy + em * 0.05)
    };
  }

  function renderReveal() {
    if (!M) return;
    const r = reveal.getBoundingClientRect();
    const span = r.height - innerHeight;
    const p = reduce ? 1 : clamp(-r.top / span);
    const t = easeIO(clamp((p - 0.06) / 0.34));
    const place = (el, g) => {
      const k = 1 - t, sc = M.s + (1 - M.s) * t;
      el.style.transform = `translate(${(g.dx * k).toFixed(1)}px, ${(g.dy * k).toFixed(1)}px) scale(${sc.toFixed(3)})`;
    };
    place(capN, M.n);
    place(capA, M.a);
    crest.style.setProperty('--t', t.toFixed(3));
    revLetters.forEach((el, i) => {
      const o = easeOut(clamp((p - (0.34 + i * 0.026)) / 0.1));
      el.style.opacity = o;
      el.style.transform = o >= 1 ? '' : `translateY(${((1 - o) * 0.35).toFixed(3)}em) rotate(${((1 - o) * -10).toFixed(1)}deg)`;
    });
    rIns.forEach((el, i) => {
      const o = easeOut(clamp((p - (0.66 + i * 0.045)) / 0.1));
      el.style.opacity = o;
      el.style.transform = `translateY(${((1 - o) * 22).toFixed(1)}px)`;
    });
    if (p > 0.62) toran1.classList.add('on'); else if (p < 0.55) toran1.classList.remove('on');
    cue.classList.toggle('show', introDone && p < 0.03);
  }

  function startIntro() {
    crest.classList.add('on');
    $('.ink', capN).style.setProperty('--d', '.7s');
    $('.ink', capA).style.setProperty('--d', '1.2s');
    $('.ink', capN).classList.add('write');
    $('.ink', capA).classList.add('write');
    setTimeout(() => { introDone = true; renderReveal(); }, reduce ? 0 : 2800);
  }

  /* ---------- Other scroll-driven art ---------- */
  const jhPaths = () => $$('.jh-frame path');
  const jhImg = () => $('#portraitPhoto > *');
  const corners = $$('.inv-corner');
  const mandalaGs = $$('#mandala g');
  const vineFill = $('#vineFill');
  const timeline = $('#timeline');
  const evs = $$('.ev');
  const sky = $('#skyline');
  const skyPaths = $$('#skyline .lines path');
  const sun = $('#skyline .sun');

  const progressIn = (el, startFrac = 1, endFrac = 0.2) => {
    const r = el.getBoundingClientRect();
    const a = innerHeight * startFrac, b = innerHeight * endFrac;
    return clamp((a - r.top) / (a - b));
  };

  function renderRest() {
    // Jharokha frame draws, photo drifts
    const jp = progressIn($('#jharokha'), 1, 0.25);
    jhPaths().forEach((p, i) => p.style.strokeDashoffset = (1 - clamp(jp * 1.25 - i * 0.18)).toFixed(3));
    const img = jhImg();
    if (img) img.style.transform = `translateY(${((jp - 0.5) * -6).toFixed(2)}%) scale(${(1.12 - jp * 0.1).toFixed(3)})`;

    // Paisley corners turn with the scroll
    const ip = progressIn($('#invite'), 1, -0.6);
    corners.forEach((c, i) => {
      const flip = i % 2 ? -1 : 1, vflip = i > 1 ? -1 : 1;
      c.style.transform = `scale(${flip}, ${vflip}) rotate(${((ip - 0.5) * 40).toFixed(1)}deg)`;
    });

    // Mandala turns
    const mp = progressIn($('#countdown'), 1.2, -0.8);
    if (mandalaGs.length) {
      mandalaGs[0].style.transform = `rotate(${(mp * 90).toFixed(1)}deg)`;
      mandalaGs[1].style.transform = `rotate(${(-mp * 60).toFixed(1)}deg)`;
      mandalaGs[2].style.transform = `rotate(${(mp * 30).toFixed(1)}deg)`;
    }

    // Vine fills, flowers bloom as it reaches them
    const tr = timeline.getBoundingClientRect();
    const fill = clamp((innerHeight * 0.62 - tr.top) / tr.height);
    vineFill.style.height = (fill * 100).toFixed(2) + '%';
    evs.forEach(ev => {
      const n = $('.ev-node', ev).getBoundingClientRect();
      ev.classList.toggle('lit', tr.top + fill * tr.height >= n.top + n.height / 2 - 4);
    });

    // Rawla draws itself, sun sinks behind it
    const sp = progressIn(sky, 1.05, 0.35);
    skyPaths.forEach((p, i) => p.style.strokeDashoffset = (1 - clamp(sp * 1.6 - i * 0.035)).toFixed(3));
    sun.style.transform = `translateY(${(-40 + sp * 70).toFixed(1)}px)`;
    sky.style.setProperty('--fo', clamp(sp * 1.5 - 0.45).toFixed(3));
  }

  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => { ticking = false; renderReveal(); renderRest(); });
  };
  addEventListener('scroll', onScroll, { passive: true });
  let rw = innerWidth;
  addEventListener('resize', () => {
    if (Math.abs(innerWidth - rw) > 40) { rw = innerWidth; buildToran(toran1, innerWidth < 700); buildToran($('#toran2'), true); }
    layoutArches(); measure(); renderReveal(); renderRest();
  });

  /* ---------- Reveal on view ---------- */
  const io = new IntersectionObserver(entries => entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); if (e.target.matches('.foot-crest')) $('.crest', e.target).classList.add('on'); if (e.target.id === 'toran2') e.target.classList.add('on'); io.unobserve(e.target); }
  }), { rootMargin: '0px 0px -12% 0px', threshold: 0.12 });
  $$('.rv, .split, .kalash, .ev, .g-item, .jharokha, .foot-crest, #toran2').forEach(el => io.observe(el));

  /* ---------- Cover ---------- */
  const cover = $('#cover');
  const openBtn = $('#openBtn');
  const audio = $('#music');
  const musicBtn = $('#musicBtn');
  if (C.music) { audio.src = C.music; }

  function openInvite() {
    if (openBtn.disabled) return;
    openBtn.disabled = true;
    if (C.music) {
      audio.play().then(() => { musicBtn.hidden = false; musicBtn.classList.add('playing'); }).catch(() => { musicBtn.hidden = false; musicBtn.classList.add('off'); });
    }
    openBtn.classList.add('pressed');
    const sr = openBtn.getBoundingClientRect();
    cover.style.setProperty('--hx', (sr.left + sr.width / 2) + 'px');
    cover.style.setProperty('--hy', (sr.top + sr.height / 2) + 'px');
    const max = Math.hypot(innerWidth, innerHeight) * 1.05;
    const dur = reduce ? 1 : 1500;
    const t0 = performance.now() + (reduce ? 0 : 250);
    document.body.classList.remove('locked');
    measure(); renderReveal(); renderRest();
    setTimeout(startIntro, reduce ? 0 : 450);
    const step = now => {
      const k = clamp((now - t0) / dur);
      cover.style.setProperty('--hole', (easeIO(k) * max).toFixed(1) + 'px');
      if (k < 1) requestAnimationFrame(step);
      else { cover.classList.add('gone'); startPetals(); }
    };
    requestAnimationFrame(step);
  }
  openBtn.addEventListener('click', openInvite);

  musicBtn.addEventListener('click', () => {
    if (audio.paused) { audio.play(); musicBtn.classList.add('playing'); musicBtn.classList.remove('off'); musicBtn.setAttribute('aria-label', 'Pause music'); }
    else { audio.pause(); musicBtn.classList.remove('playing'); musicBtn.classList.add('off'); musicBtn.setAttribute('aria-label', 'Play music'); }
  });

  /* ---------- Countdown ---------- */
  const target = new Date(C.weddingStart).getTime();
  const cd = { d: $('#cdD'), h: $('#cdH'), m: $('#cdM'), s: $('#cdS') };
  function tick() {
    let diff = Math.max(0, target - Date.now());
    const v = { d: Math.floor(diff / 864e5), h: Math.floor(diff / 36e5) % 24, m: Math.floor(diff / 6e4) % 60, s: Math.floor(diff / 1e3) % 60 };
    for (const k in v) {
      const txt = k === 'd' ? String(v[k]) : String(v[k]).padStart(2, '0');
      if (cd[k].textContent !== txt) {
        cd[k].textContent = txt;
        cd[k].classList.remove('tick'); void cd[k].offsetWidth; cd[k].classList.add('tick');
      }
    }
  }
  tick(); setInterval(tick, 1000);

  /* ---------- Calendar ---------- */
  const stamp = iso => new Date(iso).toISOString().replace(/[-:]|\.\d{3}/g, '');
  const location_ = `${C.venue.name}, ${C.venue.address.join(' ')}`;
  const gcal = ev => 'https://calendar.google.com/calendar/render?action=TEMPLATE' +
    `&text=${encodeURIComponent(`${ev.title} · ${bride} & ${groom}`)}` +
    `&dates=${stamp(ev.start)}/${stamp(ev.end)}` +
    `&details=${encodeURIComponent(`The wedding of ${bride} & ${groom}`)}` +
    `&location=${encodeURIComponent(location_)}`;
  function ics(ev) {
    const body = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Neha & Ashutosh//Invite//EN', 'BEGIN:VEVENT',
      `UID:${ev.id}-${stamp(ev.start)}@neha-ashutosh`, `DTSTAMP:${stamp(new Date().toISOString())}`,
      `DTSTART:${stamp(ev.start)}`, `DTEND:${stamp(ev.end)}`,
      `SUMMARY:${ev.title} · ${bride} & ${groom}`, `LOCATION:${location_.replace(/,/g, '\\,')}`,
      'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([body], { type: 'text/calendar' }));
    a.download = `${ev.id}.ics`;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  }
  let openMenu = null;
  const closeMenu = () => { if (openMenu) { openMenu.remove(); openMenu = null; $$('[data-cal]').forEach(b => b.setAttribute('aria-expanded', 'false')); } };
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-cal]');
    if (!b) { if (!e.target.closest('.cal-menu')) closeMenu(); return; }
    const was = b.getAttribute('aria-expanded') === 'true';
    closeMenu();
    if (was) return;
    const ev = C.events[+b.dataset.cal];
    const menu = document.createElement('div');
    menu.className = 'cal-menu';
    menu.innerHTML = `<a href="${esc(gcal(ev))}" target="_blank" rel="noopener">Google Calendar</a><button type="button">Apple / Outlook (.ics)</button>`;
    $('button', menu).addEventListener('click', () => { ics(ev); closeMenu(); });
    b.parentNode.appendChild(menu);
    b.setAttribute('aria-expanded', 'true');
    openMenu = menu;
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });

  /* ---------- Lightbox ---------- */
  const real = photos.map((p, i) => ({ ...p, i })).filter(p => p.src);
  const lb = $('#lightbox'), lbImg = $('#lbImg');
  let cur = 0;
  const show = k => { cur = (k + real.length) % real.length; lbImg.src = real[cur].src; lbImg.alt = real[cur].alt || ''; $('#lbCount').textContent = `${cur + 1} / ${real.length}`; };
  const openLb = i => { show(real.findIndex(p => p.i === i)); lb.hidden = false; document.body.style.overflow = 'hidden'; $('#lbClose').focus(); };
  const closeLb = () => { lb.hidden = true; document.body.style.overflow = ''; };
  $('#galleryGrid').addEventListener('click', e => { const g = e.target.closest('.g-item:not(.placeholder)'); if (g) openLb(+g.dataset.i); });
  $('#galleryGrid').addEventListener('keydown', e => { const g = e.target.closest('.g-item:not(.placeholder)'); if (g && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); openLb(+g.dataset.i); } });
  $('#lbClose').onclick = closeLb;
  $('#lbPrev').onclick = () => show(cur - 1);
  $('#lbNext').onclick = () => show(cur + 1);
  lb.addEventListener('click', e => { if (e.target === lb) closeLb(); });
  document.addEventListener('keydown', e => {
    if (lb.hidden) return;
    if (e.key === 'Escape') closeLb();
    if (e.key === 'ArrowLeft') show(cur - 1);
    if (e.key === 'ArrowRight') show(cur + 1);
  });
  let sx = 0;
  lb.addEventListener('touchstart', e => { sx = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener('touchend', e => { const dx = e.changedTouches[0].clientX - sx; if (Math.abs(dx) > 50) show(cur + (dx < 0 ? 1 : -1)); });

  /* ---------- RSVP ---------- */
  const form = $('#rsvpForm'), thanks = $('#thanks'), err = $('#rErr'), submit = $('#rSubmit');
  const nameIn = $('#rName'), msgIn = $('#rMsg'), gOut = $('#gCount'), gField = $('#guestsField');
  const KEY = 'neha-ashutosh-rsvp';
  let guests = 1;
  const setGuests = n => { guests = clamp(n, 1, C.rsvp.maxGuests); gOut.textContent = guests; };
  $('#gMinus').onclick = () => setGuests(guests - 1);
  $('#gPlus').onclick = () => setGuests(guests + 1);
  form.addEventListener('change', e => { if (e.target.name === 'attending') gField.hidden = e.target.value !== 'yes'; });
  const showErr = m => { err.textContent = m; err.hidden = !m; };
  nameIn.addEventListener('input', () => showErr(''));

  function done(reply, viaWhatsApp) {
    const firstName = reply.name.split(/[\s&,]+/)[0];
    $('#thanksTitle').textContent = reply.attending === 'yes' ? 'Thank you' : 'We will miss you';
    $('#thanksMsg').textContent = viaWhatsApp
      ? 'Your reply is ready in WhatsApp. Tap send there and it reaches us.'
      : reply.attending === 'yes'
        ? `We can't wait to celebrate with you, ${firstName}.`
        : `Thank you for letting us know, ${firstName}. You'll be in our hearts on the day.`;
    form.hidden = true; thanks.hidden = false;
    $('.stamp', thanks).style.animation = 'none'; void thanks.offsetWidth; $('.stamp', thanks).style.animation = '';
    try { localStorage.setItem(KEY, JSON.stringify(reply)); } catch (e) {}
  }

  form.addEventListener('submit', e => {
    e.preventDefault();
    const reply = {
      name: nameIn.value.trim(),
      attending: form.attending.value,
      guests: form.attending.value === 'yes' ? guests : 0,
      message: msgIn.value.trim()
    };
    if (!reply.name) { showErr('Please tell us your name.'); nameIn.focus(); return; }
    if (C.rsvp.endpoint) {
      submit.disabled = true; submit.textContent = 'Sending…';
      const body = new FormData();
      Object.entries(reply).forEach(([k, v]) => body.append(k, v));
      body.append('language', 'en');
      fetch(C.rsvp.endpoint, { method: 'POST', body, headers: { Accept: 'application/json' } })
        .then(r => { if (!r.ok) throw new Error(r.status); done(reply, false); })
        .catch(() => showErr('Your reply did not send. Check your connection and try again.'))
        .finally(() => { submit.disabled = false; submit.textContent = 'Send my reply'; });
      return;
    }
    const text = reply.attending === 'yes'
      ? `Namaste! ${reply.name} joyfully accepts the invitation to ${bride} & ${groom}'s wedding on ${C.dateLong}. Guests: ${reply.guests}.`
      : `Namaste! ${reply.name} regretfully cannot attend ${bride} & ${groom}'s wedding on ${C.dateLong}.`;
    const full = text + (reply.message ? `\n\n"${reply.message}"` : '');
    const num = String(C.rsvp.whatsapp || '').replace(/\D/g, '');
    window.open(`https://wa.me/${num}?text=${encodeURIComponent(full)}`, '_blank', 'noopener');
    done(reply, true);
  });

  $('#editReply').addEventListener('click', () => { thanks.hidden = true; form.hidden = false; nameIn.focus(); });

  try {
    const saved = JSON.parse(localStorage.getItem(KEY) || 'null');
    if (saved && saved.name) {
      nameIn.value = saved.name; msgIn.value = saved.message || '';
      form.querySelector(`[name=attending][value=${saved.attending === 'no' ? 'no' : 'yes'}]`).checked = true;
      gField.hidden = saved.attending === 'no';
      setGuests(saved.guests || 1);
    }
  } catch (e) {}

  /* ---------- Petals ---------- */
  function startPetals() {
    if (reduce) return;
    const cv = $('#petals'), ctx = cv.getContext('2d');
    const dpr = Math.min(2, devicePixelRatio || 1);
    let W, H;
    const size = () => { W = cv.width = innerWidth * dpr; H = cv.height = innerHeight * dpr; };
    size(); addEventListener('resize', size);
    const COLS = ['#e8862a', '#f2b632', '#c9445a', '#e7a0a6', '#d9b468'];
    const N = innerWidth < 700 ? 12 : 20;
    const ps = Array.from({ length: N }, (_, i) => ({
      x: Math.random() * W, y: -Math.random() * H * 1.2,
      r: (5 + Math.random() * 5) * dpr, vy: (0.35 + Math.random() * 0.5) * dpr,
      sw: Math.random() * Math.PI * 2, ss: 0.008 + Math.random() * 0.012,
      a: Math.random() * Math.PI, va: (Math.random() - 0.5) * 0.03,
      c: COLS[i % COLS.length]
    }));
    const frame = () => {
      if (!document.hidden) {
        ctx.clearRect(0, 0, W, H);
        ps.forEach(p => {
          p.y += p.vy; p.sw += p.ss; p.a += p.va;
          const x = p.x + Math.sin(p.sw) * 30 * dpr;
          if (p.y > H + 20) { p.y = -20; p.x = Math.random() * W; }
          ctx.save(); ctx.translate(x, p.y); ctx.rotate(p.a); ctx.scale(1, 0.55 + 0.45 * Math.abs(Math.sin(p.sw * 2)));
          ctx.fillStyle = p.c; ctx.globalAlpha = 0.75;
          ctx.beginPath(); ctx.moveTo(0, -p.r); ctx.quadraticCurveTo(p.r, 0, 0, p.r); ctx.quadraticCurveTo(-p.r, 0, 0, -p.r); ctx.fill();
          ctx.restore();
        });
      }
      requestAnimationFrame(frame);
    };
    frame();
  }

  /* ---------- Go ---------- */
  if (reduce) reveal.style.height = '100svh';
  const ready = document.fonts && document.fonts.load ? Promise.all([document.fonts.load('64px "Pinyon Script"'), document.fonts.ready]) : Promise.resolve();
  ready.then(() => { layoutArches(); measure(); renderReveal(); renderRest(); });
})();
