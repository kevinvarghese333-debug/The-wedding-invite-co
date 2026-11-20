(function () {
  'use strict';

  var C = window.INVITE;
  var root = document.documentElement;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var clamp01 = function (v) { return v < 0 ? 0 : v > 1 ? 1 : v; };
  var easeOut = function (t) { return 1 - Math.pow(1 - t, 3); };
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  root.classList.remove('js-pending');
  root.classList.add('js', 'locked');
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  window.scrollTo(0, 0);

  /* ---------------- Text from config.js ---------------- */

  var FLAGS = {
    gb: '<svg viewBox="0 0 60 36"><rect width="60" height="36" fill="#012169"/><path d="M0 0l60 36M60 0 0 36" stroke="#fff" stroke-width="7"/><path d="M0 0l60 36M60 0 0 36" stroke="#c8102e" stroke-width="3"/><path d="M30 0v36M0 18h60" stroke="#fff" stroke-width="12"/><path d="M30 0v36M0 18h60" stroke="#c8102e" stroke-width="7"/></svg>',
    es: '<svg viewBox="0 0 60 36"><rect width="60" height="36" fill="#c60b1e"/><rect y="9" width="60" height="18" fill="#ffc400"/></svg>',
    fr: '<svg viewBox="0 0 60 36"><rect width="60" height="36" fill="#fff"/><rect width="20" height="36" fill="#002395"/><rect x="40" width="20" height="36" fill="#ed2939"/></svg>'
  };

  var binds = {
    groomFirst: C.couple.groom.first,
    groomLast: C.couple.groom.last,
    brideFirst: C.couple.bride.first,
    brideLast: C.couple.bride.last,
    venue: C.event.venue,
    place: C.event.place,
    trackTitle: C.music.title,
    trackArtist: C.music.artist
  };
  $$('[data-bind]').forEach(function (el) { el.textContent = binds[el.dataset.bind]; });
  if (!C.rsvp) $('#rsvp').remove();
  document.title = C.couple.groom.first + ' & ' + C.couple.bride.first;

  var fill = function (s) {
    return s.replace(/\{groom\}/g, C.couple.groom.first).replace(/\{bride\}/g, C.couple.bride.first);
  };
  var formatDate = function (locale, date) {
    return new Intl.DateTimeFormat(locale, { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' })
      .format(new Date((date || C.event.date) + 'T12:00:00Z'));
  };

  var store = {
    get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) { /* private mode */ } }
  };

  var slots = $('#slots');
  var seal = $('#seal');     // kept: the envelope leaves the page once opened
  var firstLang = C.languages[C.defaultLanguage] || C.languages[Object.keys(C.languages)[0]];
  firstLang.schedule.forEach(function () {
    var li = document.createElement('li');
    li.className = 'slot rv';
    li.innerHTML = '<p class="slot-time"></p><h3 class="slot-title"></h3><p class="slot-text"></p>';
    slots.appendChild(li);
  });

  var lang = '';
  var rsvp = null;

  function applyLanguage(key) {
    var L = C.languages[key];
    lang = key;
    root.lang = key;
    $$('[data-t]').forEach(function (el) { el.textContent = fill(L[el.dataset.t]); });
    $$('[data-date]').forEach(function (el) { el.textContent = formatDate(L.locale); });
    $$('.slot', slots).forEach(function (li, i) {
      var s = L.schedule[i];
      if (!s) return;
      $('.slot-time', li).textContent = s.time;
      $('.slot-title', li).textContent = s.title;
      $('.slot-text', li).textContent = fill(s.text);
    });
    seal.setAttribute('aria-label', L.openLabel);
    // Long script titles step down so they stay inside the frame
    var title = $('#countTitle');
    title.style.fontSize = L.countdownTitle.length > 11 ? 'clamp(31px, 9vw, 46px)' : '';
    $('#langFlag').innerHTML = FLAGS[L.flag] || '';
    $('#langCode').textContent = L.code;
    $$('.lang-option').forEach(function (o) {
      o.setAttribute('aria-current', String(o.dataset.lang === key));
    });
    store.set('invite-lang', key);
    if (rsvp) rsvp.paint();
    relayout();
  }

  /* ---------------- Language menu ---------------- */

  var langBtn = $('#langBtn');
  var langList = $('#langList');
  var langKeys = Object.keys(C.languages);

  langKeys.forEach(function (key) {
    var L = C.languages[key];
    var li = document.createElement('li');
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'lang-option';
    b.dataset.lang = key;
    b.innerHTML = '<span class="flag">' + (FLAGS[L.flag] || '') + '</span><span></span>';
    b.lastChild.textContent = L.name;
    b.addEventListener('click', function () { applyLanguage(key); toggleLang(false); langBtn.focus(); });
    li.appendChild(b);
    langList.appendChild(li);
  });
  if (langKeys.length < 2) $('#lang').hidden = true;

  function toggleLang(open) {
    langList.hidden = !open;
    langBtn.setAttribute('aria-expanded', String(open));
  }
  langBtn.addEventListener('click', function (e) { e.stopPropagation(); toggleLang(langList.hidden); });
  document.addEventListener('click', function (e) {
    if (!langList.hidden && !$('#lang').contains(e.target)) toggleLang(false);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !langList.hidden) { toggleLang(false); langBtn.focus(); }
  });

  /* ---------------- Hand-drawn lines ---------------- */

  function seeded(seed) {
    var s = seed;
    return function () { s = (s * 16807) % 2147483647; return s / 2147483647; };
  }
  function smooth(pts) {
    var d = 'M' + pts[0][0].toFixed(1) + ' ' + pts[0][1].toFixed(1);
    for (var i = 0; i < pts.length - 1; i++) {
      var p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
      d += 'C' + (p1[0] + (p2[0] - p0[0]) / 6).toFixed(1) + ' ' + (p1[1] + (p2[1] - p0[1]) / 6).toFixed(1) + ' ' +
        (p2[0] - (p3[0] - p1[0]) / 6).toFixed(1) + ' ' + (p2[1] - (p3[1] - p1[1]) / 6).toFixed(1) + ' ' +
        p2[0].toFixed(1) + ' ' + p2[1].toFixed(1);
    }
    return d;
  }
  // Walks a rounded rectangle, nudging each point so it reads as a pen line
  function wobblyRect(x, y, w, h, r, amp, seed) {
    var rnd = seeded(seed), pts = [], step = 26;
    var ph1 = rnd() * 6.28, ph2 = rnd() * 6.28, t = 0;
    function add(px, py, nx, ny) {
      t += 1;
      var o = amp * (Math.sin(t * .19 + ph1) + .55 * Math.sin(t * .47 + ph2));
      pts.push([px + nx * o, py + ny * o]);
    }
    function line(x1, y1, x2, y2, nx, ny) {
      var n = Math.max(2, Math.round(Math.hypot(x2 - x1, y2 - y1) / step));
      for (var i = 0; i < n; i++) add(x1 + (x2 - x1) * i / n, y1 + (y2 - y1) * i / n, nx, ny);
    }
    function arc(cx, cy, a0) {
      for (var i = 0; i < 6; i++) {
        var a = a0 + (Math.PI / 2) * i / 6;
        add(cx + Math.cos(a) * r, cy + Math.sin(a) * r, Math.cos(a), Math.sin(a));
      }
    }
    line(x + r, y, x + w - r, y, 0, -1);
    arc(x + w - r, y + r, -Math.PI / 2);
    line(x + w, y + r, x + w, y + h - r, 1, 0);
    arc(x + w - r, y + h - r, 0);
    line(x + w - r, y + h, x + r, y + h, 0, 1);
    arc(x + r, y + h - r, Math.PI / 2);
    line(x, y + h - r, x, y + r, -1, 0);
    arc(x + r, y + r, Math.PI);
    // Pen overshoots where the line meets its start, as in a real sketch
    pts.push([x + r + 16, y - amp * .9]);
    pts.push([x + r + 34, y + amp * .7]);
    return smooth(pts);
  }
  function vine(x, h, amp, seed) {
    var rnd = seeded(seed), pts = [], p1 = rnd() * 6.28, p2 = rnd() * 6.28;
    for (var y = -6; y <= h + 6; y += 56) {
      pts.push([x + amp * (Math.sin(y * .0052 + p1) + .5 * Math.sin(y * .0131 + p2)), y]);
    }
    return smooth(pts);
  }
  function svgPath(svg, d, stroke, width) {
    var p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    p.setAttribute('d', d);
    p.setAttribute('stroke', stroke);
    p.setAttribute('stroke-width', width);
    p.setAttribute('pathLength', '1');
    p.style.strokeDasharray = '1 1';
    svg.appendChild(p);
    return p;
  }

  var frames = [
    { box: $('#frame'), svg: $('#frameLines'), seeds: [77, 319], paths: [], top: 0 }
  ];
  if (C.rsvp) frames.push({ box: $('#rsvpFrame'), svg: $('#rsvpLines'), seeds: [151, 463], paths: [], top: 0 });
  var schedule = $('#schedule'), vines = $('#vines');
  var vinePaths = [];

  function drawLines() {
    frames.forEach(function (f) {
      var w = f.box.clientWidth, h = f.box.clientHeight, r = Math.min(w, h) * .17;
      f.svg.setAttribute('viewBox', '0 0 ' + w + ' ' + h);
      f.svg.innerHTML = '';
      f.paths = [
        svgPath(f.svg, wobblyRect(5, 5, w - 10, h - 10, r, 1.7, f.seeds[0]), '#5e6248', 1.5),
        svgPath(f.svg, wobblyRect(11, 12, w - 23, h - 24, r * .9, 1.9, f.seeds[1]), '#b8757a', 1)
      ];
    });
    var sw = schedule.clientWidth, sh = schedule.clientHeight;
    var inset = Math.max(20, sw * .075);
    vines.setAttribute('viewBox', '0 0 ' + sw + ' ' + sh);
    vines.innerHTML = '';
    vinePaths = [
      svgPath(vines, vine(inset, sh, 5, 41), '#5e6248', 1.5),
      svgPath(vines, vine(inset + 9, sh, 4, 97), '#b8757a', 1),
      svgPath(vines, vine(sw - inset, sh, 5, 233), '#5e6248', 1.5),
      svgPath(vines, vine(sw - inset - 9, sh, 4, 511), '#b8757a', 1)
    ];
  }

  /* ---------------- Scroll: roses arrive as the page moves ---------------- */

  var blooms = $$('.bloom').map(function (el) {
    var d = el.dataset;
    return {
      el: el,
      img: $('img', el),
      x: +d.x || 0, y: +d.y || 0, r: +d.r || 0,
      s: d.s ? +d.s : .84,
      a: d.a ? +d.a : .98,
      b: d.b ? +d.b : .5,
      drift: +d.drift || 0,
      auto: 'auto' in d,
      end: d.end ? +d.end : 0,
      delay: +d.delay || 0,
      top: 0, h: 0
    };
  });
  var vline = $('#vline');
  var vlineTop = 0, schedTop = 0, schedH = 0, maxY = 0;
  var cur = 0, ticking = false, autoStart = 0;
  var opened = false;

  function measure() {
    var sy = window.scrollY;
    maxY = document.documentElement.scrollHeight - window.innerHeight;
    blooms.forEach(function (b) {
      var r = b.el.getBoundingClientRect();
      b.top = r.top + sy;
      b.h = r.height;
    });
    vlineTop = vline.getBoundingClientRect().top + sy;
    frames.forEach(function (f) { f.top = f.box.getBoundingClientRect().top + sy; });
    var sr = schedule.getBoundingClientRect();
    schedTop = sr.top + sy;
    schedH = sr.height;
  }

  function relayout() {
    drawLines();
    measure();
    render(cur, performance.now());
  }

  function place(b, p, driftPx) {
    var e = easeOut(p), k = 1 - e;
    b.img.style.transform =
      'translate3d(' + (b.x * k).toFixed(2) + '%,calc(' + (b.y * k).toFixed(2) + '% + ' + driftPx.toFixed(1) + 'px),0) ' +
      'rotate(' + (b.r * k).toFixed(2) + 'deg) scale(' + (b.s + (1 - b.s) * e).toFixed(4) + ')';
    b.img.style.opacity = clamp01(p * 1.7).toFixed(3);
  }

  function render(y, now) {
    var vh = window.innerHeight;
    var animating = false;

    blooms.forEach(function (b) {
      var center = b.top + b.h / 2 - y;
      var driftPx = reduced ? 0 : (center - vh / 2) * b.drift;
      var p;
      if (b.auto) {
        if (!autoStart) p = 0;
        else {
          p = reduced ? 1 : clamp01((now - autoStart - b.delay) / 1700);
          if (p < 1) animating = true;
        }
      } else if (reduced) {
        p = (b.top - y) < vh ? 1 : 0;
      } else if (b.end) {
        // Last flowers finish blooming exactly as the page runs out
        p = clamp01(1 - (maxY - y) / (vh * b.end));
      } else {
        p = clamp01((b.a * vh - (b.top - y)) / ((b.a - b.b) * vh));
      }
      place(b, p, driftPx);
    });

    var lineP = clamp01((vh * .92 - (vlineTop - y)) / (vh * .3));
    vline.style.transform = 'scaleY(' + lineP.toFixed(3) + ')';

    frames.forEach(function (f) {
      var frameP = reduced ? 1 : clamp01((vh * .9 - (f.top - y)) / (vh * .55));
      f.paths.forEach(function (p) {
        p.style.strokeDashoffset = (1 - frameP).toFixed(4);
        p.style.opacity = frameP > 0 ? 1 : 0;
      });
    });
    var vineP = reduced ? 1 : clamp01((vh * .96 - (schedTop - y)) / (schedH + vh * .1));
    vinePaths.forEach(function (p) {
      p.style.strokeDashoffset = (1 - vineP).toFixed(4);
      p.style.opacity = vineP > 0 ? 1 : 0;
    });

    root.classList.toggle('scrolled', y > 40);
    return animating;
  }

  function loop(now) {
    var target = window.scrollY;
    cur += (target - cur) * (reduced ? 1 : .15);
    if (Math.abs(target - cur) < .4) cur = target;
    var animating = render(cur, now);
    if (cur !== target || animating) requestAnimationFrame(loop);
    else ticking = false;
  }
  function kick() {
    if (!ticking) { ticking = true; requestAnimationFrame(loop); }
  }
  window.addEventListener('scroll', kick, { passive: true });
  window.addEventListener('resize', function () { relayout(); kick(); });
  window.addEventListener('load', relayout);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(relayout);

  /* ---------------- Text reveals ---------------- */

  function watchReveals() {
    var els = $$('.rv');
    if (!('IntersectionObserver' in window)) {
      els.forEach(function (el) { el.classList.add('in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px' });
    els.forEach(function (el) { io.observe(el); });
  }

  /* ---------------- Countdown ---------------- */

  var target = new Date(C.event.start).getTime();
  var cd = { days: $('#cdDays'), hours: $('#cdHours'), minutes: $('#cdMinutes'), seconds: $('#cdSeconds') };
  function setNum(el, v) {
    if (el.textContent === v) return;
    el.textContent = v;
    el.classList.remove('flip');
    void el.offsetWidth;
    el.classList.add('flip');
  }
  function pad(n) { return n < 10 ? '0' + n : String(n); }
  function tick() {
    var left = Math.max(0, target - Date.now());
    setNum(cd.days, String(Math.floor(left / 864e5)));
    setNum(cd.hours, pad(Math.floor(left / 36e5) % 24));
    setNum(cd.minutes, pad(Math.floor(left / 6e4) % 60));
    setNum(cd.seconds, pad(Math.floor(left / 1e3) % 60));
  }
  tick();
  setInterval(tick, 1000);

  /* ---------------- Music ---------------- */

  var audio = new Audio();
  var player = $('#player');
  var seek = $('#seek'), vol = $('#vol');
  var tNow = $('#tNow'), tLeft = $('#tLeft');
  var btnPlay = $('#btnPlay'), playIcon = $('#playIcon');
  var sound = $('#sound'), soundIcon = $('#soundIcon');
  var listen = $('#listen');
  var audioReady = false, seeking = false, resumeOnReturn = false;

  listen.href = C.music.link; if (!C.music.link) listen.style.display = 'none';
  audio.loop = true;
  audio.preload = 'auto';

  function clock(s) {
    s = Math.max(0, Math.floor(s || 0));
    return Math.floor(s / 60) + ':' + pad(s % 60);
  }
  function total() { return isFinite(audio.duration) && audio.duration > 0 ? audio.duration : C.music.seconds; }
  function paintTime() {
    var t = audio.currentTime || 0, d = total();
    tNow.textContent = clock(t);
    tLeft.textContent = '-' + clock(d - t);
    if (!seeking) seek.value = Math.round((t / d) * 1000);
    seek.style.setProperty('--v', (seek.value / 10) + '%');
  }
  function paintState() {
    var playing = !audio.paused;
    playIcon.setAttribute('href', playing ? '#i-pause' : '#i-play');
    btnPlay.setAttribute('aria-label', playing ? 'Pause' : 'Play');
    soundIcon.setAttribute('href', playing ? '#i-sound-on' : '#i-sound-off');
    sound.setAttribute('aria-label', playing ? 'Pause music' : 'Play music');
    sound.setAttribute('aria-pressed', String(playing));
  }
  function setAvailable(ok) {
    audioReady = ok;
    sound.hidden = !ok;
    player.classList.toggle('no-audio', !ok);
  }
  function loadApplePreview() {
    if (!C.music.appleTrackId) return setAvailable(false);
    fetch('https://itunes.apple.com/lookup?id=' + C.music.appleTrackId + '&country=us')
      .then(function (r) { return r.json(); })
      .then(function (j) {
        var url = j.results && j.results[0] && j.results[0].previewUrl;
        if (!url) return setAvailable(false);
        audio.src = url;
        setAvailable(true);
      })
      .catch(function () { setAvailable(false); });
  }
  var triedFile = false;
  audio.addEventListener('error', function () {
    if (C.music.file && !triedFile) { triedFile = true; loadApplePreview(); }
    else setAvailable(false);
  });
  if (C.music.file) { audio.src = C.music.file; setAvailable(true); }
  else loadApplePreview();

  function play() {
    if (!audioReady) return false;
    var p = audio.play();
    if (p && p.catch) p.catch(function () { paintState(); });
    return true;
  }
  function togglePlay() {
    if (!audio.paused) { audio.pause(); return; }
    if (!play()) listen.click();    // no audio available: open the song instead
  }

  audio.addEventListener('play', paintState);
  audio.addEventListener('pause', paintState);
  audio.addEventListener('timeupdate', paintTime);
  audio.addEventListener('durationchange', paintTime);
  btnPlay.addEventListener('click', togglePlay);
  sound.addEventListener('click', togglePlay);
  $('#btnBack').addEventListener('click', function () { audio.currentTime = 0; paintTime(); });
  $('#btnFwd').addEventListener('click', function () {
    if (audioReady) audio.currentTime = (audio.currentTime + 10) % total();
    paintTime();
  });
  seek.addEventListener('input', function () {
    seeking = true;
    seek.style.setProperty('--v', (seek.value / 10) + '%');
    tNow.textContent = clock(seek.value / 1000 * total());
    tLeft.textContent = '-' + clock(total() * (1 - seek.value / 1000));
  });
  seek.addEventListener('change', function () {
    seeking = false;
    if (audioReady && isFinite(audio.duration)) audio.currentTime = seek.value / 1000 * audio.duration;
    paintTime();
  });
  vol.addEventListener('input', function () {
    audio.volume = vol.value / 100;
    vol.style.setProperty('--v', vol.value + '%');
  });
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) { resumeOnReturn = !audio.paused; audio.pause(); }
    else if (resumeOnReturn) { resumeOnReturn = false; play(); }
  });

  /* ---------------- RSVP ---------------- */

  function setupRsvp() {
    var R = C.rsvp;
    var box = $('#rsvpFrame'), form = $('#rsvpForm'), done = $('#rsvpDone');
    var name = $('#rsvpName'), note = $('#rsvpNote'), yes = $('#rsvpYes');
    var error = $('#rsvpError'), send = $('#rsvpSend');
    var guestsRow = $('#rsvpGuestsRow'), count = $('#rsvpCount');
    var less = $('#rsvpLess'), more = $('#rsvpMore');
    var reopen = $('#rsvpReopen');
    var maxGuests = Math.max(1, +R.maxGuests || 1);
    var guests = 1, sending = false, last = null;
    var L = function () { return C.languages[lang]; };

    function setGuests(n) {
      guests = Math.min(maxGuests, Math.max(1, n));
      count.textContent = guests;
      less.disabled = guests === 1;
      more.disabled = guests === maxGuests;
    }
    function showError(text, field) {
      error.textContent = text;
      error.hidden = false;
      if (field) {
        if (field === name) name.setAttribute('aria-invalid', 'true');
        field.focus();
      }
    }
    function clearError() {
      error.hidden = true;
      name.removeAttribute('aria-invalid');
    }
    function setSending(on) {
      sending = on;
      send.disabled = on;
      send.textContent = on ? L().rsvpSending : L().rsvpSend;
    }

    function paint() {
      var by = $('#rsvpBy');
      by.hidden = !R.deadline;
      if (R.deadline) by.textContent = L().rsvpBy.replace('{date}', formatDate(L().locale, R.deadline));
      if (sending) send.textContent = L().rsvpSending;
      if (!error.hidden) clearError();
      if (!last) return;
      var firstName = last.reply.name.split(/\s+/)[0];
      var coming = last.reply.attending === 'yes';
      $('#rsvpDoneTitle').textContent = last.url ? L().rsvpAlmost : L().rsvpThanks;
      $('#rsvpDoneText').textContent = last.url ? L().rsvpHandoff
        : (coming ? L().rsvpDoneYes : L().rsvpDoneNo).replace('{name}', firstName);
    }

    function showDone(reply, url) {
      last = { reply: reply, url: url };
      reopen.hidden = !url;
      if (url) {
        reopen.href = url;
        if (/^https:/.test(url)) { reopen.target = '_blank'; reopen.rel = 'noopener'; }
        else { reopen.removeAttribute('target'); reopen.removeAttribute('rel'); }
      }
      paint();
      form.hidden = true;
      done.hidden = false;
      box.classList.add('is-done');
      done.focus({ preventScroll: true });
      box.scrollIntoView({ block: 'center', behavior: reduced ? 'auto' : 'smooth' });
      if (url) reopen.click();    // a real link opens more reliably in phone in-app browsers
    }

    // Written for the couple, so it uses the invitation's main language
    function replyText(reply) {
      var D = C.languages[C.defaultLanguage] || L();
      var lines = [
        'RSVP: ' + C.couple.groom.first + ' & ' + C.couple.bride.first,
        reply.name + ': ' + (reply.attending === 'yes' ? D.rsvpYes : D.rsvpNo)
      ];
      if (reply.attending === 'yes') lines.push(D.rsvpGuests + ': ' + reply.guests);
      if (reply.message) lines.push(reply.message);
      return lines.join('\n');
    }
    function appLink(reply) {
      var text = encodeURIComponent(replyText(reply));
      if (R.whatsapp) return 'https://wa.me/' + String(R.whatsapp).replace(/\D/g, '') + '?text=' + text;
      var subject = encodeURIComponent('RSVP from ' + reply.name);
      return 'mailto:' + R.email + '?subject=' + subject + '&body=' + text;
    }

    function postReply(reply) {
      var body = new FormData();
      Object.keys(reply).forEach(function (k) { body.append(k, reply[k]); });
      setSending(true);
      fetch(R.endpoint, { method: 'POST', body: body, headers: { Accept: 'application/json' } })
        .then(function (r) {
          if (!r.ok) throw new Error('RSVP endpoint answered ' + r.status);
          setSending(false);
          showDone(reply, null);
        })
        .catch(function () {
          setSending(false);
          showError(L().rsvpErrSend);
        });
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (sending) return;
      clearError();
      var picked = $('input[name=attending]:checked', form);
      var who = name.value.trim();
      if (!who) return showError(L().rsvpErrName, name);
      if (!picked) return showError(L().rsvpErrAttending, yes);

      var coming = picked.value === 'yes';
      var reply = {
        name: who,
        attending: picked.value,
        guests: coming ? guests : 0,
        message: note.value.trim(),
        language: lang
      };
      if (R.endpoint) return postReply(reply);
      if (R.whatsapp || R.email) return showDone(reply, appLink(reply));
      // Never tell a guest a reply was sent when it has nowhere to go
      showError('Replies are not connected yet. Add an endpoint, WhatsApp number or email under rsvp in js/config.js.');
    });

    form.addEventListener('change', function (e) {
      if (e.target.name !== 'attending') return;
      guestsRow.hidden = !yes.checked || maxGuests === 1;
      if (!error.hidden) clearError();
    });
    name.addEventListener('input', function () { if (!error.hidden) clearError(); });
    less.addEventListener('click', function () { setGuests(guests - 1); });
    more.addEventListener('click', function () { setGuests(guests + 1); });
    $('#rsvpChange').addEventListener('click', function () {
      last = null;
      done.hidden = true;
      form.hidden = false;
      box.classList.remove('is-done');
      name.focus({ preventScroll: true });
      box.scrollIntoView({ block: 'center', behavior: reduced ? 'auto' : 'smooth' });
    });
    if ('ResizeObserver' in window) new ResizeObserver(function () { relayout(); }).observe(box);

    setGuests(1);
    return { paint: paint };
  }
  if (C.rsvp) rsvp = setupRsvp();

  /* ---------------- Opening the envelope ---------------- */

  var gate = $('#gate');

  function finishOpening() {
    gate.remove();
    root.classList.remove('locked');
    root.classList.add('opened');
    opened = true;
    relayout();
    watchReveals();
    autoStart = performance.now();
    kick();
  }

  seal.addEventListener('click', function () {
    if (seal.dataset.used) return;
    seal.dataset.used = '1';
    play();      // inside the tap, so phones allow the sound to start

    if (reduced) {
      gate.classList.add('s-fade');
      setTimeout(finishOpening, 520);
      return;
    }
    var steps = [
      [0, 's-press'], [150, 's-crack'], [560, 's-open'], [1180, 's-behind'],
      [1700, 's-rise'], [2640, 's-zoom']
    ];
    steps.forEach(function (s) {
      setTimeout(function () { gate.classList.add(s[1]); }, s[0]);
    });
    setTimeout(finishOpening, 3720);
  });

  /* ---------------- Start ---------------- */

  var saved = store.get('invite-lang');
  var startLang = C.languages[saved] ? saved : (C.languages[C.defaultLanguage] ? C.defaultLanguage : langKeys[0]);
  applyLanguage(startLang);
  $('#letter').appendChild($('#heroInner').cloneNode(true)).removeAttribute('id');
  paintTime();
  paintState();
}());
