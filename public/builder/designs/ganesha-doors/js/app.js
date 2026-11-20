(function () {
  'use strict';

  var C = window.INVITE;
  var root = document.documentElement;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var IST = 'Asia/Kolkata';

  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

  /* ---------------- Fill the page from config.js ---------------- */

  var binds = {
    brideFirst: C.couple.bride.first,
    groomFirst: C.couple.groom.first,
    brideParents: C.parents.bride,
    groomParents: C.parents.groom,
    venue: C.wedding.venue,
    place: C.wedding.place
  };
  $$('[data-bind]').forEach(function (el) { el.textContent = binds[el.dataset.bind]; });

  var start = new Date(C.wedding.start);
  var part = function (date, opts) {
    return new Intl.DateTimeFormat('en-IN', Object.assign({ timeZone: IST }, opts)).format(date);
  };
  $('#dateDay').textContent = part(start, { weekday: 'long' });
  $('#dateNum').textContent = part(start, { day: 'numeric' });
  $('#dateMonth').textContent = part(start, { month: 'long' }) + ' ' + part(start, { year: 'numeric' });
  $('#dateTime').textContent = 'Pheras at ' + part(start, { hour: 'numeric', minute: '2-digit', hour12: true }).toUpperCase();
  $('#map').href = C.wedding.map;
  document.title = C.couple.bride.first + ' & ' + C.couple.groom.first;

  var rites = $('#rites');
  C.ceremonies.forEach(function (c) {
    var li = document.createElement('li');
    li.className = 'rite';
    li.innerHTML = '<span class="spine" aria-hidden="true"><i></i><b></b></span><span class="node" aria-hidden="true"></span><div class="rite-body"></div>';
    [['rite-when', c.day + ', ' + c.time], ['rite-title', c.title], ['rite-place', c.place]].forEach(function (p) {
      var el = document.createElement('p');
      el.className = p[0];
      el.textContent = p[1];
      if (p[0] === 'rite-title') el.setAttribute('data-plain', '');
      $('.rite-body', li).appendChild(el);
    });
    rites.appendChild(li);
  });

  /* ---------------- Letters that arrive one at a time ---------------- */

  function split(el) {
    var text = el.textContent, i = 0;
    var sr = document.createElement('span');
    sr.className = 'sr';
    sr.textContent = text;
    var shown = document.createElement('span');
    shown.setAttribute('aria-hidden', 'true');
    text.split(' ').forEach(function (word, n) {
      if (n) shown.appendChild(document.createTextNode(' '));
      var w = document.createElement('span');
      w.className = 'w';
      Array.from(word).forEach(function (letter) {
        var c = document.createElement('span');
        c.className = 'ch';
        c.style.setProperty('--i', i++);
        c.textContent = letter;
        w.appendChild(c);
      });
      shown.appendChild(w);
    });
    el.textContent = '';
    el.appendChild(sr);
    el.appendChild(shown);
  }
  // Cinzel Decorative fuses pairs like HE and OO; separate letters keep them apart
  $$('[data-split], [data-plain], .hn').forEach(split);

  // Everything marked for it rises in as it reaches the screen
  (function () {
    var items = $$('.rv, [data-split], .tablet');
    if (reduced || !('IntersectionObserver' in window)) {
      items.forEach(function (el) { el.classList.add('in'); });
      return;
    }
    // Neighbours follow each other instead of arriving together
    $$('.sec').forEach(function (sec) {
      $$('.rv', sec).forEach(function (el, n) { el.style.setProperty('--d', Math.min(n, 6) * 90 + 'ms'); });
    });
    var seen = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('in');
        seen.unobserve(e.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -7% 0px' });
    items.forEach(function (el) { seen.observe(el); });
  })();

  /* ---------------- Geometry ---------------- */

  var hero = $('#hero'), temple = $('#temple'), idol = $('#idol');
  var NICHE_Y = 346;   // centre of the niche, in temple artwork pixels

  // How far the large idol sits from the niche while it is being drawn
  function layout() {
    var h = hero.getBoundingClientRect(), t = temple.getBoundingClientRect();
    var nicheY = t.top - h.top + NICHE_Y * (t.width / 944);
    root.style.setProperty('--dy', (h.height * 0.42 - nicheY) + 'px');
  }
  layout();
  window.addEventListener('resize', layout);

  /* ---------------- The gold trace ---------------- */

  function trace(duration) {
    var L = window.GANESH_LINES;
    if (!L) return Promise.resolve();
    var box = idol.getBoundingClientRect();
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var main = $('#lineMain'), glow = $('#lineGlow'), spark = $('#lineSpark');
    var w = idol.offsetWidth, h = idol.offsetHeight;

    main.width = Math.round(w * dpr); main.height = Math.round(h * dpr);
    glow.width = Math.round(w / 2); glow.height = Math.round(h / 2);
    var pad = 0.09, sw = w * (1 + pad * 2), sh = h * (1 + pad * 2);
    spark.width = Math.round(sw * dpr); spark.height = Math.round(sh * dpr);

    var m = main.getContext('2d'), g = glow.getContext('2d'), s = spark.getContext('2d');
    var k = main.width / L.w, kg = glow.width / L.w, ks = (w * dpr) / L.w;
    m.setTransform(k, 0, 0, k, 0, 0);
    g.setTransform(kg, 0, 0, kg, 0, 0);
    [m, g].forEach(function (c) { c.lineCap = 'round'; c.lineJoin = 'round'; });

    // The line weight is set in screen pixels so it looks the same at any size
    var unit = L.w / w;
    function stroke(flat, t0, t1, width, head) {
      var p = [], l = [0], total = 0;
      for (var i = 0; i < flat.length; i += 2) p.push([flat[i], flat[i + 1]]);
      for (var j = 1; j < p.length; j++) {
        total += Math.hypot(p[j][0] - p[j - 1][0], p[j][1] - p[j - 1][1]);
        l.push(total);
      }
      return { p: p, l: l, n: total, t0: t0, t1: t1, w: width * unit, head: head, seg: 1, x: p[0][0], y: p[0][1], done: false };
    }

    var strokes = [
      stroke(L.a, 0, 0.5, 1.5, true),
      stroke(L.b, 0, 0.5, 1.5, true)
    ];
    L.i.forEach(function (flat, n) {
      var begin = 0.2 + 0.56 * (n / L.i.length);
      var line = stroke(flat, begin, 0, 1, false);
      line.t1 = Math.min(0.86, begin + 0.05 + line.n / 5200);
      strokes.push(line);
    });
    // The eyes are opened last, and quietly
    (L.e || []).forEach(function (flat) { strokes.push(stroke(flat, 0.87, 0.99, 1.15, false)); });

    function draw(st, target) {
      [m, g].forEach(function (c) { c.beginPath(); c.moveTo(st.x, st.y); });
      var x = st.x, y = st.y;
      while (st.seg < st.p.length && st.l[st.seg] <= target) {
        x = st.p[st.seg][0]; y = st.p[st.seg][1];
        m.lineTo(x, y); g.lineTo(x, y);
        st.seg++;
      }
      if (st.seg < st.p.length) {
        var a = st.p[st.seg - 1], b = st.p[st.seg];
        var f = (target - st.l[st.seg - 1]) / ((st.l[st.seg] - st.l[st.seg - 1]) || 1);
        x = a[0] + (b[0] - a[0]) * f; y = a[1] + (b[1] - a[1]) * f;
        m.lineTo(x, y); g.lineTo(x, y);
      }
      st.x = x; st.y = y;
      m.lineWidth = st.w; m.strokeStyle = '#ffeec6'; m.stroke();
      g.lineWidth = st.w * 3.4; g.strokeStyle = 'rgba(255,186,84,.8)'; g.stroke();
    }

    // Soft round sprite for the spark and its embers
    var dot = document.createElement('canvas');
    dot.width = dot.height = 64;
    var dc = dot.getContext('2d'), grad = dc.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, 'rgba(255,250,232,1)');
    grad.addColorStop(0.22, 'rgba(255,214,130,.9)');
    grad.addColorStop(1, 'rgba(255,170,60,0)');
    dc.fillStyle = grad; dc.fillRect(0, 0, 64, 64);

    var embers = [];
    var ox = sw * dpr * (pad / (1 + pad * 2)), oy = sh * dpr * (pad / (1 + pad * 2));

    return new Promise(function (resolve) {
      var t0 = 0;
      function frame(now) {
        if (skipped) return resolve();
        if (!t0) t0 = now;
        var t = Math.min(1, (now - t0) / duration);

        s.setTransform(1, 0, 0, 1, 0, 0);
        s.clearRect(0, 0, spark.width, spark.height);
        s.globalCompositeOperation = 'lighter';

        strokes.forEach(function (st) {
          if (st.done || t < st.t0) return;
          var f = Math.min(1, (t - st.t0) / (st.t1 - st.t0));
          var eased = f < 0.5 ? 2 * f * f : 1 - Math.pow(-2 * f + 2, 2) / 2;
          draw(st, eased * st.n);
          if (f >= 1) st.done = true;
          if (!st.done) {
            var px = st.x * ks + ox, py = st.y * ks + oy;
            var size = (st.head ? 34 : 9) * dpr;
            s.drawImage(dot, px - size / 2, py - size / 2, size, size);
            if (st.head) for (var i = 0; i < 2; i++) {
              embers.push({ x: px, y: py, vx: (Math.random() - 0.5) * 1.4 * dpr, vy: (Math.random() - 0.1) * 1.3 * dpr, life: 1 });
            }
          }
        });

        for (var e = embers.length - 1; e >= 0; e--) {
          var p = embers[e];
          p.x += p.vx; p.y += p.vy; p.life -= 0.03;
          if (p.life <= 0) { embers.splice(e, 1); continue; }
          var d = 9 * p.life * dpr;
          s.globalAlpha = p.life;
          s.drawImage(dot, p.x - d / 2, p.y - d / 2, d, d);
        }
        s.globalAlpha = 1;

        if (t < 1) requestAnimationFrame(frame);
        else resolve();
      }
      requestAnimationFrame(frame);
    });
  }

  /* ---------------- Temple bell ---------------- */

  var audio = null;
  function bell(volume) {
    if (!audio) return;
    var now = audio.currentTime;
    [[1, 1, 3.4], [2.01, 0.55, 2.4], [2.76, 0.4, 1.8], [5.4, 0.18, 1], [8.93, 0.08, 0.6]].forEach(function (p) {
      var osc = audio.createOscillator(), amp = audio.createGain();
      osc.frequency.value = 610 * p[0];
      amp.gain.setValueAtTime(0.0001, now);
      amp.gain.exponentialRampToValueAtTime(volume * p[1], now + 0.006);
      amp.gain.exponentialRampToValueAtTime(0.0001, now + p[2]);
      osc.connect(amp); amp.connect(audio.destination);
      osc.start(now); osc.stop(now + p[2] + 0.05);
    });
  }

  /* ---------------- Falling petals ---------------- */

  var petals = (function () {
    var canvas = $('#petals'), ctx = canvas.getContext('2d');
    var list = [], running = false, inView = true, dpr = 1, W = 0, H = 0;
    var colours = ['#fbf3e4', '#f6e7cf', '#f2c56b', '#e9a23b', '#a3233f'];

    function size() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = canvas.clientWidth; H = canvas.clientHeight;
      canvas.width = W * dpr; canvas.height = H * dpr;
    }
    function add(x, y, burst) {
      var a = Math.random() * Math.PI * 2, v = burst ? 0.6 + Math.random() * 2 : 0;
      list.push({
        x: x, y: y,
        vx: Math.cos(a) * v, vy: burst ? Math.sin(a) * v - 1 : 0.4 + Math.random() * 0.5,
        r: 4 + Math.random() * 5, c: colours[(Math.random() * colours.length) | 0],
        spin: Math.random() * 6.28, ds: 0.02 + Math.random() * 0.05,
        sway: Math.random() * 6.28
      });
    }
    function frame() {
      if (!list.length || !inView) { running = false; return; }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      for (var i = list.length - 1; i >= 0; i--) {
        var p = list[i];
        p.vy = Math.min(p.vy + 0.012, 1.25);
        p.vx *= 0.985;
        p.sway += 0.02; p.spin += p.ds;
        p.x += p.vx + Math.sin(p.sway) * 0.35;
        p.y += p.vy;
        if (p.y > H + 12) { list.splice(i, 1); continue; }
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.spin * 0.4);
        ctx.scale(Math.max(0.22, Math.abs(Math.cos(p.spin))), 1);
        ctx.fillStyle = p.c;
        ctx.beginPath();
        ctx.moveTo(0, -p.r);
        ctx.quadraticCurveTo(p.r * 0.85, 0, 0, p.r);
        ctx.quadraticCurveTo(-p.r * 0.85, 0, 0, -p.r);
        ctx.fill();
        ctx.restore();
      }
      requestAnimationFrame(frame);
    }
    function go() { if (!running) { running = true; requestAnimationFrame(frame); } }

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (e) {
        inView = e[0].isIntersecting;
        if (inView && list.length) go();
      }).observe(hero);
    }
    window.addEventListener('resize', size);
    return {
      shower: function (x, y) {
        if (reduced) return;
        size();
        for (var i = 0; i < 44; i++) add(x, y, true);
        for (var j = 0; j < 26; j++) add(Math.random() * W, -20 - Math.random() * H * 0.7, false);
        go();
      }
    };
  })();

  /* ---------------- The opening sequence ---------------- */

  var gate = $('#gate'), seal = $('#seal'), skipButton = $('#skip'), main = $('#main');
  var skipped = false, finished = false, wake = null;

  function stage(name) { root.dataset.stage = name; }
  function wait(ms) {
    return new Promise(function (resolve) {
      var id = setTimeout(done, ms);
      wake = done;
      function done() { clearTimeout(id); wake = null; resolve(); }
    });
  }

  function finish() {
    if (finished) return;
    finished = true;
    if (gate) { gate.remove(); gate = null; }
    stage('done');
    root.classList.add('landed');
    root.classList.remove('locked');
    $$('.hn').forEach(function (el) { el.classList.add('in'); });
    idol.style.willChange = 'auto';
  }

  function land() {
    var t = temple.getBoundingClientRect(), h = hero.getBoundingClientRect();
    petals.shower(t.width * 0.5, t.top - h.top + NICHE_Y * (t.width / 944));
    bell(0.16);
    finish();
    $('.hero-names').focus({ preventScroll: true });
  }

  function open() {
    if (seal.dataset.used) return;
    seal.dataset.used = '1';

    // Started inside the tap, so phones allow the bell
    var AC = window.AudioContext || window.webkitAudioContext;
    if (AC) { try { audio = new AC(); audio.resume(); } catch (e) { audio = null; } }

    if (reduced) { bell(0.12); finish(); return; }

    bell(0.09);
    stage('open');
    wait(2050)
      .then(function () {
        if (gate) { gate.remove(); gate = null; }
        if (skipped) return null;
        stage('trace');
        return trace(2200);
      })
      .then(function () {
        if (skipped) return null;
        stage('reveal');
        return wait(2600);
      })
      .then(function () {
        if (skipped) return null;
        stage('place');
        return wait(3900);
      })
      .then(function () { if (!skipped) land(); });
  }

  seal.addEventListener('click', open);
  // Go straight to the end with no transitions. Reading the style forces the
  // browser to apply the end state before transitions are switched back on.
  function jump() {
    skipped = true;
    root.classList.add('jump');
    finish();
    if (wake) wake();
    window.getComputedStyle(idol).transform;
    root.classList.remove('jump');
  }

  skipButton.addEventListener('click', function () {
    jump();
    $('.hero-names').focus({ preventScroll: true });
  });

  // A link straight to a section, such as #rsvp, skips the opening
  if (location.hash && $(location.hash)) {
    jump();
    requestAnimationFrame(function () { $(location.hash).scrollIntoView(); });
  }

  /* ---------------- The lotus opens with the scroll ---------------- */

  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var smooth = function (t) { return t * t * (3 - 2 * t); };

  var bloom = (function () {
    var L = window.LOTUS, sec = $('#bloom'), stage = $('#bloomStage'), canvas = $('#bloomCanvas');
    var lineEl = $('#bloomLine');
    function still() { sec.classList.add('still'); return { update: function () {}, size: function () {} }; }
    if (!L || reduced || !canvas.getContext) return still();

    var ctx = canvas.getContext('2d'), sheet = new Image(), ready = false, shown = -1, K = 1;
    var B = L.base, Hb = 292, Rb = 120;   // the closed bud: height and half width

    // Each petal, in the order it is painted:
    // [base offset, tip offset (both in bud half widths), tip height, narrowing, opens from, opens to]
    var plan = {
      p_lowl:  [-.5, -.95, .5, .62, 0, .56],
      p_lowr:  [.5, .95, .5, .62, 0, .56],
      p_top:   [0, 0, 1.02, .7, .22, .8],
      p_backl: [-.45, -.06, 1, .55, .16, .72],
      p_rb:    [.45, .06, 1, .55, .16, .72],
      p_backr: [.25, .02, 1, .6, .22, .8],
      p_farr:  [.72, .14, .96, .5, .1, .66],
      p_farl:  [-.72, -.14, .96, .5, .1, .66],
      p_midl:  [-.25, -.02, 1, .7, .28, .84],
      p_lowsl: [-.82, -.36, .9, .5, .04, .6],
      p_lowsr: [.82, .36, .9, .5, .04, .6],
      p_innl:  [-.4, -.04, .98, .95, .36, .92],
      p_innr:  [.4, .04, .98, .95, .36, .92],
      p_frl:   [-.26, -.03, .97, 1.06, .42, 1],
      p_frr:   [.26, .03, .97, 1.06, .42, 1]
    };

    function mul(a, b) {
      return [
        a[0] * b[0] + a[2] * b[1], a[1] * b[0] + a[3] * b[1],
        a[0] * b[2] + a[2] * b[3], a[1] * b[2] + a[3] * b[3],
        a[0] * b[4] + a[2] * b[5] + a[4], a[1] * b[4] + a[3] * b[5] + a[5]
      ];
    }
    var move = function (x, y) { return [1, 0, 0, 1, x, y]; };
    var turn = function (a) { var c = Math.cos(a), s = Math.sin(a); return [c, s, -s, c, 0, 0]; };
    var size2 = function (x, y) { return [x, 0, 0, y, 0, 0]; };
    var chain = function () { return Array.prototype.reduce.call(arguments, mul); };

    L.parts.forEach(function (p) {
      var c = plan[p.n];
      if (!c) return;
      var vx = p.tip[0] - B[0], vy = p.tip[1] - B[1];
      p.len = Math.hypot(vx, vy);
      p.ang = Math.atan2(vx, -vy);
      p.ox = c[0] * Rb;
      var bx = c[1] * Rb - p.ox, by = -c[2] * Hb;
      p.budLen = Math.hypot(bx, by);
      p.budAng = Math.atan2(bx, -by);
      p.narrow = c[3]; p.t0 = c[4]; p.t1 = c[5];
    });

    function petal(p, t) {
      var o = smooth(clamp((t - p.t0) / (p.t1 - p.t0), 0, 1)), c = 1 - o;
      var ang = p.ang + (p.budAng - p.ang) * c;
      var along = 1 + (p.budLen / p.len - 1) * c, across = 1 + (p.narrow - 1) * c;
      return chain(move(B[0] + p.ox * c, B[1]), turn(ang), size2(across, along), turn(-p.ang), move(-B[0], -B[1]));
    }
    // A leaf opens out from the point where its stalk starts
    function grow(pivot, tilt, from, e) {
      var s = from + (1 - from) * e;
      return chain(move(pivot[0], pivot[1]), turn(tilt * (1 - e)), size2(s, s), move(-pivot[0], -pivot[1]));
    }

    function draw(t) {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      var leaf = smooth(clamp((t - 0.04) / 0.52, 0, 1)), side = smooth(clamp((t - 0.24) / 0.5, 0, 1));
      var pod = smooth(clamp((t - 0.5) / 0.42, 0, 1));
      L.parts.forEach(function (p) {
        var m = null, a = 1;
        if (p.n === 'left') { m = grow(L.plant, 0.62, 0.22, leaf); a = clamp(leaf * 3, 0, 1); }
        else if (p.n === 'right') { m = grow(L.plant, -0.56, 0.22, leaf); a = clamp(leaf * 3, 0, 1); }
        else if (p.n === 'bud') { m = grow([345.6, 906], 0.42, 0.2, side); a = clamp(side * 3, 0, 1); }
        else if (p.n === 'pod') {
          var s = 0.3 + 0.7 * pod, cy = 348;
          m = chain(move(B[0], cy), size2(s, s), move(-B[0], -cy));
          a = clamp(pod * 3, 0, 1);
        }
        else if (plan[p.n]) m = petal(p, t);
        if (a <= 0) return;
        if (!m) m = [1, 0, 0, 1, 0, 0];
        ctx.globalAlpha = a;
        ctx.setTransform(K * m[0], K * m[1], K * m[2], K * m[3], K * m[4], K * m[5]);
        ctx.drawImage(sheet, p.sx, p.sy, p.w, p.h, p.x, p.y, p.w, p.h);
      });
      ctx.globalAlpha = 1;
    }

    function size() {
      var w = stage.clientWidth, h = stage.clientHeight, dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      K = canvas.width / L.w;
      ctx.imageSmoothingQuality = 'high';
      var pin = stage.parentNode.getBoundingClientRect(), st = stage.getBoundingClientRect();
      lineEl.style.setProperty('--lh', (st.top - pin.top + (B[1] - Hb) * (w / L.w) + 2) + 'px');
      shown = -1;
    }

    function update(vh) {
      var r = sec.getBoundingClientRect();
      if (r.bottom < -80 || r.top > vh * 1.15) return;
      var travel = r.height - vh, start = vh * 0.62;
      var p = clamp((start - r.top) / (start + travel), 0, 1);
      lineEl.style.setProperty('--f', clamp(p / 0.2, 0, 1).toFixed(3));
      var t = clamp((p - 0.17) / 0.75, 0, 1);
      stage.style.setProperty('--g', t.toFixed(3));
      lineEl.style.setProperty('--lo', clamp(1 - t * 3.2, 0, 1).toFixed(3));
      if (ready && Math.abs(t - shown) > 0.0005) { shown = t; draw(t); }
    }

    // Fetched once the reader is getting close
    function load() {
      sheet.onload = function () { ready = true; size(); onScroll(); };
      sheet.onerror = function () { sec.classList.add('still'); };
      sheet.src = 'assets/lotus-parts.webp';
    }
    if ('IntersectionObserver' in window) {
      var near = new IntersectionObserver(function (e) {
        if (!e[0].isIntersecting) return;
        near.disconnect();
        load();
      }, { rootMargin: '150% 0px' });
      near.observe(sec);
    } else load();

    return { update: update, size: size };
  })();

  /* ---------------- Motion tied to the scroll ---------------- */

  var backdrop = $('#backdrop'), ticking = false;
  var spines = $$('.spine').map(function (el) { return { el: el, li: el.parentNode, f: -1 }; });

  function scrollWork() {
    ticking = false;
    var vh = window.innerHeight;
    if (reduced) {
      spines.forEach(function (s) { s.el.style.setProperty('--f', 1); s.li.classList.add('on'); });
      return;
    }
    var y = window.scrollY;
    if (y < hero.offsetHeight) backdrop.style.transform = 'translateY(' + (y * 0.18).toFixed(1) + 'px)';

    // Each piece of the line fills as it passes two thirds of the way up the
    // screen. When it is full the next ceremony lights up.
    var mark = vh * 0.7;
    spines.forEach(function (s) {
      var r = s.el.getBoundingClientRect();
      var f = clamp((mark - r.top) / r.height, 0, 1);
      if (f === s.f) return;
      s.f = f;
      s.el.style.setProperty('--f', f.toFixed(3));
      s.el.classList.toggle('go', f > 0 && f < 1);
      s.li.classList.toggle('on', f >= 1);
    });
    bloom.update(vh);
  }
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(scrollWork);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', function () { bloom.size(); onScroll(); });
  onScroll();

  /* ---------------- Countdown ---------------- */

  var pad = function (n) { return n < 10 ? '0' + n : String(n); };
  function tick() {
    var left = start.getTime() - Date.now();
    if (left <= 0) {
      $('#ticks').hidden = true;
      $('#cdDone').hidden = false;
      return false;
    }
    var sec = Math.floor(left / 1000);
    $('#cdD').textContent = Math.floor(sec / 86400);
    $('#cdH').textContent = pad(Math.floor(sec % 86400 / 3600));
    $('#cdM').textContent = pad(Math.floor(sec % 3600 / 60));
    var s = $('#cdS');
    s.textContent = pad(sec % 60);
    if (!reduced && s.animate) s.animate([{ transform: 'translateY(-16%)', opacity: 0.35 }, { transform: 'none', opacity: 1 }], { duration: 320, easing: 'ease-out' });
    return true;
  }
  if (tick()) {
    var clock = setInterval(function () { if (!tick()) clearInterval(clock); }, 1000);
  }

  /* ---------------- RSVP: no database, the reply goes out by WhatsApp ---------------- */

  (function () {
    var R = C.rsvp;
    var tablet = $('#tablet'), form = $('#rsvpForm'), done = $('#rsvpDone');
    var name = $('#rsvpName'), note = $('#rsvpNote'), yes = $('#rsvpYes');
    var error = $('#rsvpError'), guestsRow = $('#rsvpGuestsRow'), count = $('#rsvpCount');
    var less = $('#rsvpLess'), more = $('#rsvpMore'), reopen = $('#rsvpReopen');
    var maxGuests = Math.max(1, +R.maxGuests || 1), guests = 1;

    if (R.deadline) {
      $('#rsvpBy').textContent = 'Please reply by ' + part(new Date(R.deadline + 'T12:00:00+05:30'), { day: 'numeric', month: 'long', year: 'numeric' });
    } else {
      $('#rsvpBy').hidden = true;
    }

    function setGuests(n) {
      guests = Math.min(maxGuests, Math.max(1, n));
      count.textContent = guests;
      less.disabled = guests === 1;
      more.disabled = guests === maxGuests;
    }
    function showError(text, field) {
      error.textContent = text;
      error.hidden = false;
      if (field === name) name.setAttribute('aria-invalid', 'true');
      if (field) field.focus();
    }
    function clearError() {
      error.hidden = true;
      name.removeAttribute('aria-invalid');
    }
    function message(who, coming) {
      var lines = [
        'RSVP for ' + C.couple.bride.first + ' & ' + C.couple.groom.first + "'s wedding",
        'Name: ' + who,
        'Reply: ' + (coming ? 'Joyfully accepts' : 'Regretfully declines')
      ];
      if (coming) lines.push('Guests: ' + guests);
      if (note.value.trim()) lines.push('Note: ' + note.value.trim());
      return lines.join('\n');
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      clearError();
      var picked = $('input[name=attending]:checked', form);
      var who = name.value.trim();
      if (!who) return showError('Enter your name.', name);
      if (!picked) return showError('Choose whether you can come.', yes);

      var number = String(R.whatsapp || '').replace(/\D/g, '');
      var url = 'https://wa.me/' + number + '?text=' + encodeURIComponent(message(who, picked.value === 'yes'));
      reopen.href = url;
      $('#rsvpDoneText').textContent = number
        ? 'Your reply is written. Press send in WhatsApp.'
        : 'Your reply is written. Choose who to send it to in WhatsApp, then press send.';
      form.hidden = true;
      done.hidden = false;
      tablet.classList.add('is-done');
      done.focus({ preventScroll: true });
      tablet.scrollIntoView({ block: 'center', behavior: reduced ? 'auto' : 'smooth' });
      reopen.click();   // a real link opens more reliably in phone in-app browsers
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
      done.hidden = true;
      form.hidden = false;
      tablet.classList.remove('is-done');
      name.focus({ preventScroll: true });
    });
    setGuests(1);
  })();
})();
