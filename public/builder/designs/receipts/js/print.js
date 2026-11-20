/* The thermal printer: draws each receipt onto a canvas, and makes its noises.
   Receipt.render() turns one entry from config.js into a finished strip of paper.
   Sound has no audio files: the buzz, the rip and the stamp are all synthesised. */

window.Receipt = (function () {
  var PAPER = '#FBFAF5', INK = '#211F1D', MONO = '"Sometype Mono", ui-monospace, Menlo, monospace';
  var MARGIN = 18;   // room around the paper for its baked-in shadow

  function loadImage(src) {
    return new Promise(function (ok, no) {
      var im = new Image();
      im.onload = function () { ok(im); };
      im.onerror = no;
      im.src = src;
    });
  }

  /* A small photo, tone-mapped for a printer that only knows ink or no ink.
     Stretches the histogram, lifts the shadows so faces survive, sharpens,
     then Atkinson dithers. Returns one flag per dot. */
  function dither(im, cols, rows) {
    var c = document.createElement('canvas');
    c.width = cols; c.height = rows;
    var x = c.getContext('2d', { willReadFrequently: true });
    var target = cols / rows, sw = im.width, sh = im.height;
    if (sw / sh > target) sw = sh * target; else sh = sw / target;
    x.imageSmoothingQuality = 'high';
    x.drawImage(im, (im.width - sw) / 2, (im.height - sh) * .42, sw, sh, 0, 0, cols, rows);
    var px = x.getImageData(0, 0, cols, rows).data, n = cols * rows;
    var L = new Float32Array(n), hist = new Uint32Array(256), i;
    for (i = 0; i < n; i++) {
      var v = .3 * px[i * 4] + .59 * px[i * 4 + 1] + .11 * px[i * 4 + 2];
      L[i] = v;
      hist[v | 0]++;
    }
    var lo = 0, hi = 255, acc = 0;
    while (lo < 254 && (acc += hist[lo]) < n * .012) lo++;
    acc = 0;
    while (hi > lo + 1 && (acc += hist[hi]) < n * .006) hi--;

    // Local contrast: compare each dot with a blurred copy
    var blur = new Float32Array(n), R = Math.max(2, Math.round(cols / 60));
    for (var y = 0; y < rows; y++) {
      for (var xx = 0; xx < cols; xx++) {
        var s = 0, k = 0;
        for (var d = -R; d <= R; d += R) {
          for (var e = -R; e <= R; e += R) {
            var X = xx + d, Y = y + e;
            if (X >= 0 && X < cols && Y >= 0 && Y < rows) { s += L[Y * cols + X]; k++; }
          }
        }
        blur[y * cols + xx] = s / k;
      }
    }
    for (i = 0; i < n; i++) {
      var t = (L[i] + (L[i] - blur[i]) * .9 - lo) / (hi - lo);
      t = Math.min(1, Math.max(0, t));
      L[i] = Math.pow(t, .58) * 255;     // lift the shadows
    }
    var ink = new Uint8Array(n), taps = [[1, 0], [2, 0], [-1, 1], [0, 1], [1, 1], [0, 2]];
    for (y = 0; y < rows; y++) {
      for (xx = 0; xx < cols; xx++) {
        i = y * cols + xx;
        var old = L[i], on = old < 128;
        ink[i] = on ? 1 : 0;
        var err = (old - (on ? 0 : 255)) / 8;
        for (var q = 0; q < 6; q++) {
          var tx = xx + taps[q][0], ty = y + taps[q][1];
          if (tx >= 0 && tx < cols && ty < rows) L[ty * cols + tx] += err;
        }
      }
    }
    return ink;
  }

  function paperPath(w, h, s) {
    // Torn along the top, punched along the bottom like the edge of a stamp
    var p = new Path2D(), step = 7 * s, x = 0, up = true;
    p.moveTo(0, 5 * s);
    while (x < w) {
      x = Math.min(w, x + step);
      p.lineTo(x, (up ? 0 : 5 * s) + (x * 7 % 3) * .4 * s);
      up = !up;
    }
    p.lineTo(w, h);
    var holes = Math.round(w / (24 * s)), hw = w / holes, r = hw * .29;
    for (var i = holes - 1; i >= 0; i--) {
      var cx = i * hw + hw / 2;
      p.lineTo(cx + r, h);
      p.arc(cx, h, r, 0, Math.PI, true);
      p.lineTo(i * hw, h);
    }
    p.closePath();
    return p;
  }

  function barcode(x, seed, left, top, width, height) {
    var u = Math.max(1, width / 118), a = left, r = seed * 9301 + 49297;
    x.fillStyle = INK;
    while (a < left + width) {
      r = (r * 9301 + 49297) % 233280;
      var bar = u * (1 + r % 3);
      r = (r * 9301 + 49297) % 233280;
      x.fillRect(a, top, Math.min(bar, left + width - a), height);
      a += bar + u * (1 + r % 2);
    }
  }

  function dashed(x, left, right, y, s) {
    x.fillStyle = INK;
    for (var a = left; a < right; a += 7 * s) x.fillRect(a, y, 4 * s, Math.max(1, s));
  }

  // w is the paper's width in CSS pixels. Returns everything the page needs to place it.
  function render(spec, w, seed) {
    var dpr = Math.min(3, window.devicePixelRatio || 1), s = w / 300;
    var pad = 20 * s, inner = w - pad * 2;
    var photoH = Math.round(inner * 1.02);
    var lines = spec.items.length;
    var h = Math.round(
      22 * s + 18 * s + 16 * s + 16 * s + 22 * s + photoH + 22 * s +
      lines * 21 * s + 16 * s + 30 * s + 12 * s + 34 * s + 30 * s
    );

    var c = document.createElement('canvas');
    var cw = w + MARGIN * 2, ch = h + MARGIN * 2;
    c.width = Math.round(cw * dpr);
    c.height = Math.round(ch * dpr);
    c.style.width = cw + 'px';
    c.style.height = ch + 'px';
    var x = c.getContext('2d');
    x.scale(dpr, dpr);
    x.translate(MARGIN, MARGIN);

    var edge = paperPath(w, h, s);
    x.save();
    x.shadowColor = 'rgba(70,52,30,.34)';
    x.shadowBlur = 12;
    x.shadowOffsetY = 5;
    x.fillStyle = PAPER;
    x.fill(edge);
    x.restore();
    x.save();
    x.clip(edge);

    var y = 34 * s, mid = w / 2;
    x.fillStyle = INK;
    x.textBaseline = 'alphabetic';
    x.textAlign = 'center';
    x.font = '700 ' + 15 * s + 'px ' + MONO;
    x.fillText(spec.head, mid, y);
    y += 17 * s;
    x.font = '500 ' + 11.5 * s + 'px ' + MONO;
    x.fillText(spec.label.toUpperCase(), mid, y);
    y += 12 * s;
    dashed(x, pad, w - pad, y, s);
    y += 22 * s;
    x.textAlign = 'left';
    x.font = '700 ' + 14 * s + 'px ' + MONO;
    x.fillText(spec.title.toUpperCase(), pad, y);
    y += 10 * s;

    // Photo: dots land on whole device pixels so the dither stays crisp
    var dot = Math.max(1, Math.round(dpr * .72));
    var left = Math.round(pad * dpr), top = Math.round(y * dpr);
    var cols = Math.floor(inner * dpr / dot), rows = Math.floor(photoH * dpr / dot);
    var ink = spec.image ? dither(spec.image, cols, rows) : new Uint8Array(cols * rows);
    x.save();
    x.setTransform(1, 0, 0, 1, Math.round(MARGIN * dpr), Math.round(MARGIN * dpr));
    x.fillStyle = INK;
    for (var r = 0; r < rows; r++) {
      var run = -1;
      for (var q = 0; q <= cols; q++) {
        var on = q < cols && ink[r * cols + q];
        if (on && run < 0) run = q;
        if (!on && run >= 0) {
          x.fillRect(left + run * dot, top + r * dot, (q - run) * dot, dot);
          run = -1;
        }
      }
    }
    x.restore();
    y += photoH + 19 * s;

    x.fillStyle = INK;
    x.font = '400 ' + 11.5 * s + 'px ' + MONO;
    x.fillText(spec.when, pad, y);
    y += 24 * s;

    x.font = '500 ' + 12.5 * s + 'px ' + MONO;
    spec.items.forEach(function (it) {
      var lw = x.measureText(it[0]).width, rw = x.measureText(it[1]).width;
      x.textAlign = 'left';
      x.fillText(it[0], pad, y);
      x.textAlign = 'right';
      x.fillText(it[1], w - pad, y);
      x.textAlign = 'left';
      for (var a = pad + lw + 6 * s; a < w - pad - rw - 6 * s; a += 5 * s) x.fillRect(a, y - 1.5 * s, Math.max(1, 1.2 * s), Math.max(1, 1.2 * s));
      y += 21 * s;
    });
    y -= 6 * s;
    dashed(x, pad, w - pad, y, s);
    y += 25 * s;
    x.font = '700 ' + 16 * s + 'px ' + MONO;
    x.textAlign = 'left';
    x.fillText(spec.total[0], pad, y);
    x.textAlign = 'right';
    x.fillText(spec.total[1], w - pad, y);
    y += 13 * s;
    barcode(x, seed + 1, pad, y, inner, 26 * s);
    x.restore();

    return { canvas: c, width: w, height: h, margin: MARGIN };
  }

  return { render: render, load: loadImage, margin: MARGIN };
}());


window.Sound = (function () {
  var ctx = null, out = null, buzzGain = null, on = true;
  try { on = localStorage.getItem('invite-sound') !== 'off'; } catch (e) {}

  function noise(seconds) {
    var b = ctx.createBuffer(1, ctx.sampleRate * seconds, ctx.sampleRate), d = b.getChannelData(0);
    for (var i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    return b;
  }

  // Browsers only allow sound after a tap, so this runs when the bow is untied
  function unlock() {
    var AC = window.AudioContext || window.webkitAudioContext;
    if (ctx || !AC) return;
    ctx = new AC();
    out = ctx.createGain();
    out.gain.value = on ? 1 : 0;
    out.connect(ctx.destination);

    // The print head: filtered noise chopped into quick steps
    var src = ctx.createBufferSource();
    src.buffer = noise(2);
    src.loop = true;
    var band = ctx.createBiquadFilter();
    band.type = 'bandpass'; band.frequency.value = 2300; band.Q.value = .9;
    var chop = ctx.createGain();
    chop.gain.value = .55;
    var step = ctx.createOscillator();
    step.type = 'square'; step.frequency.value = 34;
    var depth = ctx.createGain();
    depth.gain.value = .45;
    step.connect(depth); depth.connect(chop.gain);
    buzzGain = ctx.createGain();
    buzzGain.gain.value = 0;
    src.connect(band); band.connect(chop); chop.connect(buzzGain); buzzGain.connect(out);
    src.start(); step.start();
  }

  function buzz(level) {
    if (!ctx) return;
    buzzGain.gain.setTargetAtTime(level * .1, ctx.currentTime, .03);
  }

  function burst(freqFrom, freqTo, time, gain) {
    if (!ctx) return;
    var t = ctx.currentTime, src = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    src.buffer = noise(time + .05);
    f.type = 'bandpass'; f.Q.value = .7;
    f.frequency.setValueAtTime(freqFrom, t);
    f.frequency.exponentialRampToValueAtTime(freqTo, t + time);
    g.gain.setValueAtTime(gain, t);
    g.gain.exponentialRampToValueAtTime(.001, t + time);
    src.connect(f); f.connect(g); g.connect(out);
    src.start(t);
  }

  function rip() { burst(4200, 900, .2, .2); }
  function thump() { burst(320, 90, .16, .55); }

  function toggle() {
    on = !on;
    try { localStorage.setItem('invite-sound', on ? 'on' : 'off'); } catch (e) {}
    if (out) out.gain.value = on ? 1 : 0;
    if (ctx && ctx.state === 'suspended') ctx.resume();
    return on;
  }

  return { unlock: unlock, buzz: buzz, rip: rip, thump: thump, toggle: toggle, get on() { return on; } };
}());
