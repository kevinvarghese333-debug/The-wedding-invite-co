/* ------------------------------------------------------------------
   The red pen doodles. Each one is plain SVG, so it stays sharp at any
   size and takes its colour from the CSS around it.
   Used on the page with <svg><use href="#d-name"/></svg>, and redrawn
   onto the picture a guest saves from their receipt.
------------------------------------------------------------------- */

window.DOODLES = {

  heart: '<path d="M50 85C35 71 14 59 13 38 12 24 23 16 34 18c8 1.500 13 7 16 14 3-8 10-14 19-14 12 0 20 10 18 23-2 17-22 30-36 45"/>',

  rings: '<path d="M61 56c1 14-9 26-23 27S12 74 11 60s9-26 23-27 26 9 27 23Z"/>' +
         '<path d="M54 56c1 10-7 19-17 20s-18-7-19-17 7-19 17-20 18 7 19 17Z"/>' +
         '<path d="M90 50c1 14-9 26-23 27S41 68 40 54s9-26 23-27 26 9 27 23Z"/>' +
         '<path d="M83 50c1 10-7 19-17 20s-18-7-19-17 7-19 17-20 18 7 19 17Z"/>' +
         '<path d="m56 26 5-8h11l5 7-10 10-11-9Zm5-8 5 7 6-7M56 26l21-1"/>',

  bow: '<path d="M50 41C41 31 23 17 12 22c-6 3-5 22 2 28 8 6 26-1 35-8"/>' +
       '<path d="M51 41c9-12 27-25 38-21 7 4 4 24-3 30-8 6-26-1-35-8"/>' +
       '<path d="M45 37c2-3 9-3 11 0 2 3 1 8-1 10-3 1-8 1-10-1-2-3-2-6 0-9Z"/>' +
       '<path d="M46 47c-6 11-16 25-24 39l10-4 4 10c6-14 12-30 15-44"/>' +
       '<path d="M55 47c5 11 11 23 17 37l-9-3-5 9c-3-14-6-28-8-40"/>' +
       '<path d="M20 30c6 4 14 8 22 10M80 28c-6 5-14 9-22 12"/>',

  coupe: '<path d="M23 31c0 15 15 22 27 22s27-7 27-22"/>' +
         '<path d="M23 31c10-5 44-5 54 0-10 4-44 4-54 0Z"/>' +
         '<path d="M30 40c10 3 30 3 40 0"/>' +
         '<path d="M50 53v30M35 87c8-4 22-4 30 0"/>' +
         '<circle cx="43" cy="20" r="2"/><circle cx="53" cy="13" r="2.600"/><circle cx="60" cy="22" r="1.700"/>',

  cake: '<path d="M18 84V63h64v21"/>' +
        '<path d="M18 66c3 7 9 7 12 0 3 7 9 7 12 0 3 7 9 7 12 0 3 7 9 7 12 0 3 7 13 7 16 0"/>' +
        '<path d="M28 63V45h44v18"/>' +
        '<path d="M28 48c3 5 8 5 11 0 3 5 8 5 11 0 3 5 8 5 11 0 3 5 8 5 11 0"/>' +
        '<path d="M38 45V31h24v14"/>' +
        '<path d="M11 87c20 2 58 2 78 0"/>' +
        '<path d="M50 26c-4-3-8-6-8-10 0-4 6-5 8-1 2-4 8-3 8 1 0 4-4 7-8 10Z"/>',

  bunny: '<path d="M34 53c-4 12 2 26 16 26s20-14 16-26c-4-10-28-10-32 0Z"/>' +
         '<path d="M40 45c-6-14-6-30 0-33 6 0 8 18 6 30M54 42c0-14 4-30 10-29 6 3 2 19-4 31"/>' +
         '<path d="M41 37c-2-8-1-15 1-18M62 20c1 6-1 13-4 18"/>' +
         '<circle class="dot" cx="43" cy="60" r="1.700"/><circle class="dot" cx="57" cy="60" r="1.700"/>' +
         '<path d="M48 65c1 1.500 3 1.500 4 0M50 66v3"/>' +
         '<path d="M31 44C20 54 13 74 18 93c6-6 12 0 18-6M69 44c11 10 18 30 13 49-6-6-12 0-18-6"/>' +
         '<path d="M36 87c8 4 20 4 28 0"/>',

  cat: '<path d="M22 40l2-25 16 13c6-2 14-2 20 0l16-13 2 25c6 16-6 30-28 30S16 56 22 40Z"/>' +
       '<circle class="dot" cx="38" cy="44" r="2.200"/><circle class="dot" cx="62" cy="44" r="2.200"/>' +
       '<path d="M47 51h6l-3 3-3-3ZM50 54c0 4-4 6-7 4M50 54c0 4 4 6 7 4"/>' +
       '<path d="M12 47l15 3M12 56l15-1M88 47l-15 3M88 56l-15-1"/>' +
       '<path d="M50 80 36 73v15l14-8 14 8V73l-14 7Z"/>',

  teddy: '<path d="M33 35c-2-14 9-23 19-23 12 0 22 10 20 24-2 12-12 16-20 16-10 0-18-6-19-17Z"/>' +
         '<path d="M37 20c-8-3-13 6-7 11M67 19c8-4 14 7 7 12"/>' +
         '<path d="M44 38c0-6 16-6 16 0 0 7-16 7-16 0Z"/>' +
         '<path d="M49 35h6l-3 3-3-3ZM52 38v3"/>' +
         '<circle class="dot" cx="43" cy="29" r="1.800"/><circle class="dot" cx="61" cy="29" r="1.800"/>' +
         '<path d="M37 53c-11 8-11 25-3 31 10 6 28 6 38 0 8-7 6-23-4-31"/>' +
         '<path d="M35 58c-10 2-16 10-12 16 4 4 10-2 14-8M69 58c10 2 16 10 12 16-4 4-10-2-14-8"/>' +
         '<path d="M35 85c-10 0-18 6-14 12 6 4 18 0 22-8M71 85c10 0 18 6 14 12-6 4-18 0-22-8"/>' +
         '<path d="M52 55 41 50v11l11-6 11 6V50l-11 5Z"/>',

  letter: '<path d="M14 31l72-5 4 50-74 5-2-50Z"/>' +
          '<path d="M14 31l36 27 36-32M16 81l24-33M90 76 62 47"/>' +
          '<path d="M50 66c-5-3-10-7-10-11 0-5 7-6 10-1 3-5 10-4 10 1 0 4-5 8-10 11Z"/>',

  camera: '<path d="M14 36c0-2 1-3 3-3h66c2 0 3 1 3 3v40c0 2-1 3-3 3H17c-2 0-3-1-3-3V36Z"/>' +
          '<path d="M66 56c0 9-7 16-16 16s-16-7-16-16 7-16 16-16 16 7 16 16Z"/>' +
          '<path d="M58 56c0 4-4 8-8 8s-8-4-8-8 4-8 8-8 8 4 8 8Z"/>' +
          '<path d="M21 40h13v9H21zM70 33v-6h11v6"/>' +
          '<circle class="dot" cx="76" cy="44" r="2"/>',

  croissant: '<path d="M12 63c2-26 26-42 44-40 20 2 34 22 34 44 0 6-6 8-10 4-8-12-18-18-30-18s-22 8-28 18c-4 6-10 0-10-8Z"/>' +
             '<path d="M30 35c4 10 4 18 2 24M46 25c0 10 0 20-2 27M62 25c-2 10-2 20-2 29M78 39c-4 8-6 16-6 22"/>',

  coffee: '<path d="M30 31l6 57c8 3 20 3 28 0l6-57"/>' +
          '<path d="M26 31h48v-8c-4-4-44-4-48 0v8Z"/>' +
          '<path d="M34 19l2-6h28l2 6"/>' +
          '<path d="M32 49c12 4 24 4 36 0l-3 24c-9 3-21 3-30 0l-3-24Z"/>' +
          '<path d="M50 68c-3-2-7-5-7-8 0-3 5-4 7-1 2-3 7-2 7 1 0 3-4 6-7 8Z"/>',

  spiral: '<path d="M50 50c4-4 10 0 8 6-2 6-12 6-16 0-6-8 0-20 12-20 14 0 20 14 16 24-6 14-24 18-36 8-12-10-10-30 2-40 14-10 36-8 46 6"/>',

  sparkles: '<path d="M44 12c2 18 7 26 24 28-17 2-22 10-24 28-2-18-7-26-24-28 17-2 22-10 24-28Z"/>' +
            '<path d="M76 60c1 8 3 11 11 12-8 1-10 4-11 12-1-8-3-11-11-12 8-1 10-4 11-12Z"/>' +
            '<circle class="dot" cx="20" cy="74" r="2.200"/><circle class="dot" cx="30" cy="84" r="1.500"/><circle class="dot" cx="80" cy="22" r="1.800"/>',

  plane: '<path d="M10 52l82-36-26 68-20-22-36-10Z"/>' +
         '<path d="M92 16 46 62l-2 19 11-11"/>',

  disco: '<path d="M50 6v14"/>' +
         '<path d="M81 52c0 17-14 31-31 31S19 69 19 52s14-31 31-31 31 14 31 31Z"/>' +
         '<path d="M50 21c-22 8-22 54 0 62M50 21c22 8 22 54 0 62M50 21v62"/>' +
         '<path d="M24 36c14 5 38 5 52 0M19 52c18 4 44 4 62 0M24 68c14-5 38-5 52 0"/>',

  xoxo: '<path d="M14 26l22 26M38 24 12 54"/>' +
        '<path d="M66 28c7 0 12 6 11 14-1 7-7 12-13 11-6-1-10-7-9-14 1-7 6-11 11-11Z"/>' +
        '<path d="M92 24l20 25M113 22 90 52"/>' +
        '<path d="M142 22c7 0 12 7 10 15-2 7-8 11-14 10-6-1-9-7-8-14 1-6 7-11 12-11Z"/>',

  pull: '<path d="M18 10c22-4 40 16 34 58"/><path d="M38 56l13 15 13-13"/>',

  receipt: '<path d="M24 12v76l9-6 9 6 8-6 9 6 8-6 9 6V12l-9 6-8-6-9 6-8-6-9 6-9-6Z"/>' +
           '<path d="M35 34h30M35 48h30M35 62h16"/>',

  calendar: '<path d="M16 26c20-2 48-2 68 0 2 18 2 40 0 58-20 2-48 2-68 0-2-18-2-40 0-58Z"/>' +
            '<path d="M16 42c20 1 48 1 68 0M33 15v18M67 15v18"/>' +
            '<path d="M50 74c-5-3-11-7-11-12 0-5 8-6 11-1 3-5 11-4 11 1 0 5-6 9-11 12Z"/>',

  tick: '<path d="M18 22c20-2 44-2 62 0 2 18 2 38 0 58-20 2-42 2-62 0-2-20-2-40 0-58Z"/>' +
        '<path d="M32 50l13 15 38-46"/>',

  ask: '<path d="M16 22c22-5 48-5 68 0 4 14 4 30 0 44-12 2-24 2-36 2L30 84l2-17c-6 0-11 0-16-1-3-14-3-30 0-44Z"/>' +
       '<path d="M41 38c1-6 6-9 11-8 6 1 9 6 7 11-2 4-9 5-9 12"/><circle class="dot" cx="50" cy="60" r="2"/>',

  pen: '<path d="M20 81l7-21 42-42c3-3 7-3 10 0l4 4c3 3 3 7 0 10L41 74l-21 7Z"/>' +
       '<path d="M27 60l14 14M62 25l14 14"/>',

  house: '<path d="M14 50 50 18l36 32"/><path d="M24 42v42h52V42"/>' +
         '<path d="M50 74c-5-3-11-7-11-12 0-5 8-6 11-1 3-5 11-4 11 1 0 5-6 9-11 12Z"/>'
};

/* The viewBox of each doodle, when it is not the usual square */
window.DOODLE_BOX = { xoxo: '0 0 165 76' };

/* ------------------------------------------------------------------
   Line boil: the shimmer of hand-drawn animation. Each doodle is drawn
   three times with its points nudged a little, then the three drawings
   are cycled about seven times a second. The nudge depends only on
   where a point sits, so lines that touch stay joined.
------------------------------------------------------------------- */
window.Doodle = (function () {
  var NS = 'http://www.w3.org/2000/svg';
  var FRAMES = 3, live = [], reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  function nudge(x, y, f, amp) {
    return [
      x + amp * Math.sin(y * .19 + x * .07 + f * 2.1),
      y + amp * Math.cos(x * .17 - y * .05 + f * 2.7)
    ];
  }

  // Turns a path into absolute curves so every point can be moved on its own
  function wobble(d, f, amp) {
    var t = d.match(/[a-zA-Z]|-?\d*\.?\d+/g), i = 0, out = [];
    var x = 0, y = 0, sx = 0, sy = 0, px = 0, py = 0, cmd = '', last = '';
    var n = function () { return parseFloat(t[i++]); };
    var P = function (a, b) { var p = nudge(a, b, f, amp); return p[0].toFixed(1) + ' ' + p[1].toFixed(1); };
    while (i < t.length) {
      if (/[a-zA-Z]/.test(t[i])) cmd = t[i++];
      var rel = cmd === cmd.toLowerCase(), c = cmd.toUpperCase(), ox = rel ? x : 0, oy = rel ? y : 0;
      if (c === 'M') {
        x = n() + ox; y = n() + oy; sx = x; sy = y;
        out.push('M' + P(x, y));
        cmd = rel ? 'l' : 'L';
      } else if (c === 'L' || c === 'H' || c === 'V') {
        if (c !== 'V') x = n() + ox;
        if (c !== 'H') y = n() + oy;
        out.push('L' + P(x, y));
      } else if (c === 'C') {
        var a = n() + ox, b = n() + oy, e = n() + ox, g = n() + oy;
        x = n() + ox; y = n() + oy;
        out.push('C' + P(a, b) + ' ' + P(e, g) + ' ' + P(x, y));
        px = e; py = g;
      } else if (c === 'S') {
        var r1 = last === 'C' || last === 'S' ? 2 * x - px : x;
        var r2 = last === 'C' || last === 'S' ? 2 * y - py : y;
        var e2 = n() + ox, g2 = n() + oy;
        x = n() + ox; y = n() + oy;
        out.push('C' + P(r1, r2) + ' ' + P(e2, g2) + ' ' + P(x, y));
        px = e2; py = g2;
      } else if (c === 'Z') {
        x = sx; y = sy;
        out.push('L' + P(x, y));
      } else { i++; }
      last = c;
    }
    return out.join('');
  }

  function frameMarkup(name, f, amp) {
    return window.DOODLES[name]
      .replace(/ d="([^"]+)"/g, function (m, d) { return ' pathLength="1" d="' + wobble(d, f, amp) + '"'; });
  }

  // <svg class="dd" data-d="cat"> becomes a three-frame drawing
  function mount(svg) {
    var name = svg.getAttribute('data-d'), box = window.DOODLE_BOX[name] || '0 0 100 100';
    var amp = (parseFloat(box.split(' ')[2]) / 100) * .85, out = '';
    for (var f = 0; f < FRAMES; f++) out += '<g class="f' + f + '">' + frameMarkup(name, f, amp) + '</g>';
    svg.setAttribute('viewBox', box);
    svg.setAttribute('aria-hidden', 'true');
    svg.innerHTML = out;
    svg.dataset.f = 0;
    svg._paths = [].slice.call(svg.querySelectorAll('path'));
    svg._dots = [].slice.call(svg.querySelectorAll('circle'));
    setDraw(svg, 0);
    live.push(svg);
    return svg;
  }

  // p runs from 0 (nothing on the paper) to 1 (fully drawn)
  function setDraw(svg, p) {
    if (svg._p === p) return;
    svg._p = p;
    svg.style.opacity = p > .002 ? 1 : 0;
    var off = 1 - p;
    for (var i = 0; i < svg._paths.length; i++) svg._paths[i].style.strokeDashoffset = off;
    for (var j = 0; j < svg._dots.length; j++) svg._dots[j].style.opacity = p > .8 ? 1 : 0;
  }

  // Tween-friendly: gsap can animate .p on this
  function handle(svg) {
    return { get p() { return svg._p || 0; }, set p(v) { setDraw(svg, v); } };
  }

  var seen = 'IntersectionObserver' in window ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { e.target._seen = e.isIntersecting; });
  }, { rootMargin: '10%' }) : null;

  function start() {
    if (seen) live.forEach(function (s) { seen.observe(s); });
    if (reduce) return;
    var n = 0;
    setInterval(function () {
      n = (n + 1) % FRAMES;
      for (var i = 0; i < live.length; i++) {
        var s = live[i];
        if ((s._seen || !seen) && s._p > 0) s.dataset.f = (n + i) % FRAMES;
      }
    }, 140);
  }

  return { mount: mount, setDraw: setDraw, handle: handle, start: start, wobble: wobble };
}());
