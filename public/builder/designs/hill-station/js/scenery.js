/* Scenery drawn in code, so it stays sharp at any size:
   paper-cut hills with pines, gold stars, paper clouds, block-print patterns, the mandala, the route map. */
(() => {
  'use strict';
  const NS = 'http://www.w3.org/2000/svg';

  // a small seeded random, so the hills come out the same every visit
  const rng = seed => () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };

  /* ---------- hills ---------- */

  // One ridge with pines standing on it, as an SVG path string.
  function ridge(r, { base, amp, waves, pines, pineH, w = 1600, h = 700 }) {
    const ph = waves.map(() => r() * Math.PI * 2);
    const yAt = x => base - waves.reduce((s, f, i) => s + Math.sin(x / w * Math.PI * 2 * f + ph[i]) * amp / (i + 1), 0);
    let d = `M-40 ${h + 10} L-40 ${yAt(-40).toFixed(1)}`;
    for (let x = -30; x <= w + 40; x += 10) d += ` L${x} ${yAt(x).toFixed(1)}`;
    d += ` L${w + 40} ${h + 10} Z`;
    let trees = '';
    for (let i = 0; i < pines; i++) {
      const x = r() * (w + 60) - 30, s = pineH * (.55 + r() * .75), y = yAt(x) + s * .12;
      trees += pine(x, y, s);
    }
    return d + trees;
  }

  // A deodar: three stacked tiers and a little trunk.
  function pine(x, y, s) {
    const t = (top, bot, half) => `M${(x).toFixed(1)} ${(y - top).toFixed(1)} L${(x + half).toFixed(1)} ${(y - bot).toFixed(1)} L${(x - half).toFixed(1)} ${(y - bot).toFixed(1)} Z`;
    return ' ' + t(s, s * .45, s * .2) + ' ' + t(s * .72, s * .2, s * .27) + ' ' + t(s * .45, 0, s * .34) +
      ` M${(x - s * .04).toFixed(1)} ${y.toFixed(1)} h${(s * .08).toFixed(1)} v${(s * .1).toFixed(1)} h${(-s * .08).toFixed(1)} Z`;
  }

  /**
   * Fills a box with stacked hill layers, each its own <svg> so it can move on its own.
   * layers: [{ fill, base, amp, waves, pines, pineH, mist }]
   */
  function buildHills(box, layers, seed = 7) {
    const r = rng(seed);
    box.innerHTML = '';
    return layers.map((L, i) => {
      const svg = document.createElementNS(NS, 'svg');
      svg.setAttribute('viewBox', '0 0 1600 700');
      svg.setAttribute('preserveAspectRatio', 'xMidYMax slice');
      svg.classList.add('ridge');
      svg.style.zIndex = i;
      const id = `ps${seed}_${i}`;
      svg.innerHTML = `<defs><filter id="${id}" x="-5%" y="-20%" width="110%" height="140%"><feDropShadow dx="0" dy="-4" stdDeviation="${4 + i * 1.5}" flood-color="#030a1c" flood-opacity="${.45 + i * .05}"/></filter>
        <linearGradient id="${id}g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${L.top || L.fill}"/><stop offset=".6" stop-color="${L.fill}"/></linearGradient></defs>
        ${L.mist ? `<rect x="0" y="${L.base - 160}" width="1600" height="260" fill="url(#mist${seed})" opacity="${L.mist}"/>` : ''}
        <path filter="url(#${id})" fill="url(#${id}g)" stroke="${L.rim || '#9dbbe6'}" stroke-opacity="${.32 - i * .05}" stroke-width="1.6" d="${ridge(r, L)}"/>`;
      if (L.mist) svg.querySelector('defs').insertAdjacentHTML('beforeend', `<linearGradient id="mist${seed}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#cfe0f5" stop-opacity="0"/><stop offset=".55" stop-color="#cfe0f5" stop-opacity=".55"/><stop offset="1" stop-color="#cfe0f5" stop-opacity="0"/></linearGradient>`);
      box.append(svg);
      return svg;
    });
  }

  /* ---------- clouds: overlapping paper discs ---------- */

  function cloud(r, fill, shade) {
    const n = 5 + Math.floor(r() * 3);
    let circles = '';
    for (let i = 0; i < n; i++) {
      const x = 40 + i * (220 / (n - 1)), rad = 26 + Math.sin(i / (n - 1) * Math.PI) * (30 + r() * 22) + r() * 8;
      circles += `<circle cx="${x.toFixed(1)}" cy="${(108 - rad * .62).toFixed(1)}" r="${rad.toFixed(1)}"/>`;
    }
    const id = 'c' + Math.floor(r() * 1e9);
    return `<svg viewBox="0 0 300 130" aria-hidden="true"><defs><filter id="${id}"><feDropShadow dx="0" dy="5" stdDeviation="5" flood-color="#06122b" flood-opacity=".35"/></filter><clipPath id="${id}k"><rect x="0" y="0" width="300" height="108"/></clipPath></defs>
      <g filter="url(#${id})"><g fill="${fill}" clip-path="url(#${id}k)">${circles}</g><rect x="14" y="104" width="272" height="5" rx="2.5" fill="${shade}"/></g></svg>`;
  }

  function buildClouds(box, specs, seed = 3) {
    const r = rng(seed);
    box.innerHTML = '';
    return specs.map(s => {
      const d = document.createElement('div');
      d.className = 'cloud';
      d.style.cssText = `top:${s.top}%;width:${s.w}vmax;z-index:${s.z || 0}`;
      d.innerHTML = cloud(r, s.fill || '#eef2f9', s.shade || '#c8d4e8');
      box.append(d);
      return { el: d, ...s };
    });
  }

  /* ---------- stars: gold sparkles that twinkle ---------- */

  class Stars {
    constructor(canvas, { count = 90, sparkles = 14, seed = 11 } = {}) {
      this.c = canvas; this.ctx = canvas.getContext('2d');
      const r = rng(seed);
      this.items = Array.from({ length: count + sparkles }, (_, i) => ({
        x: r(), y: r() * .9, big: i < sparkles, s: i < sparkles ? 7 + r() * 13 : .6 + r() * 1.5,
        ph: r() * 6.28, sp: .6 + r() * 1.6, rot: r() * .5
      }));
      this.on = true;
      new IntersectionObserver(([e]) => { this.on = e.isIntersecting; }).observe(canvas);
      this.size();
    }
    size() {
      const d = Math.min(devicePixelRatio || 1, 2), w = this.c.clientWidth, h = this.c.clientHeight;
      this.w = w; this.h = h; this.c.width = w * d; this.c.height = h * d;
      this.ctx.setTransform(d, 0, 0, d, 0, 0);
    }
    draw(t, shift = 0) {
      if (!this.on) return;
      const { ctx, w, h } = this, unit = Math.min(w, h) / 700;
      ctx.clearRect(0, 0, w, h);
      for (const s of this.items) {
        const tw = .55 + .45 * Math.sin(t * s.sp + s.ph);
        const x = s.x * w, y = ((s.y * h - shift * (s.big ? .35 : .18)) % h + h) % h;
        if (s.big) {
          const R = s.s * unit * (.82 + .18 * tw);
          ctx.save(); ctx.translate(x, y); ctx.rotate(s.rot + Math.sin(t * .3 + s.ph) * .08);
          ctx.globalAlpha = .55 + .45 * tw;
          ctx.shadowColor = 'rgba(255,214,140,.7)'; ctx.shadowBlur = R * .9;
          ctx.fillStyle = '#e8c47a';
          ctx.beginPath();
          for (let k = 0; k < 8; k++) {
            const a = k * Math.PI / 4, rr = k % 2 ? R * .2 : (k % 4 ? R * .55 : R);
            ctx.lineTo(Math.sin(a) * rr, -Math.cos(a) * rr);
          }
          ctx.closePath(); ctx.fill(); ctx.restore();
        } else {
          ctx.globalAlpha = .25 + .6 * tw;
          ctx.fillStyle = '#f6e3b4';
          ctx.beginPath(); ctx.arc(x, y, s.s * Math.max(.8, unit), 0, 6.283); ctx.fill();
        }
      }
      ctx.globalAlpha = 1;
    }
  }

  /* ---------- block-print patterns as tiles ---------- */

  const tile = svg => `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;

  const rosette = (cx, cy, r, c) => {
    let p = '';
    for (let i = 0; i < 8; i++) {
      const a = i * Math.PI / 4;
      p += `<ellipse cx="${(cx + Math.sin(a) * r * .55).toFixed(2)}" cy="${(cy - Math.cos(a) * r * .55).toFixed(2)}" rx="${(r * .2).toFixed(2)}" ry="${(r * .45).toFixed(2)}" transform="rotate(${i * 45} ${(cx + Math.sin(a) * r * .55).toFixed(2)} ${(cy - Math.cos(a) * r * .55).toFixed(2)})"/>`;
    }
    return `<g fill="${c}">${p}<circle cx="${cx}" cy="${cy}" r="${r * .22}"/></g>`;
  };

  // an ogee lattice with rosettes, like a woven shawl
  const damask = (c, o) => tile(`<svg xmlns="${NS}" width="120" height="160" viewBox="0 0 120 160"><g opacity="${o}" fill="none" stroke="${c}" stroke-width="2.2"><path d="M0 0C0 40 60 40 60 80S0 120 0 160M120 0C120 40 60 40 60 80S120 120 120 160"/><path stroke-width="1" d="M8 0C8 36 66 42 66 80S8 124 8 160M112 0C112 36 54 42 54 80S112 124 112 160" opacity=".6"/></g><g opacity="${o}">${rosette(0, 80, 15, c)}${rosette(120, 80, 15, c)}${rosette(60, 0, 15, c)}${rosette(60, 160, 15, c)}<circle cx="60" cy="80" r="3" fill="${c}"/></g></svg>`);

  // small leaf sprigs in a half-drop, like hand block printing
  const buti = (c, o) => tile(`<svg xmlns="${NS}" width="96" height="96" viewBox="0 0 96 96"><g fill="${c}" opacity="${o}">
    <g transform="translate(24 26)"><path d="M0 14C-1 4 3-6 0-14" stroke="${c}" stroke-width="1.6" fill="none"/><path d="M0 2C-7 0-10-6-9-11c5 1 9 6 9 13Z"/><path d="M0-4c7-2 10-8 9-13-5 1-9 6-9 13Z"/><path d="M0 9c6 0 10-4 10-9-6 0-10 4-10 9Z"/><circle cx="0" cy="-15" r="2.4"/></g>
    <g transform="translate(72 74) rotate(30)"><path d="M0 14C-1 4 3-6 0-14" stroke="${c}" stroke-width="1.6" fill="none"/><path d="M0 2C-7 0-10-6-9-11c5 1 9 6 9 13Z"/><path d="M0-4c7-2 10-8 9-13-5 1-9 6-9 13Z"/><circle cx="0" cy="-15" r="2.4"/></g>
    <circle cx="72" cy="22" r="2"/><circle cx="24" cy="72" r="2"/></g></svg>`);

  // open line florals for the plum section
  const florals = (c, o) => tile(`<svg xmlns="${NS}" width="150" height="150" viewBox="0 0 150 150"><g fill="none" stroke="${c}" stroke-width="1.6" opacity="${o}" stroke-linecap="round">
    <g transform="translate(38 40)">${[0, 72, 144, 216, 288].map(a => `<path transform="rotate(${a})" d="M0 0C-9-8-8-20 0-24C8-20 9-8 0 0Z"/>`).join('')}<circle r="4"/></g>
    <g transform="translate(112 112) scale(.75)">${[0, 72, 144, 216, 288].map(a => `<path transform="rotate(${a})" d="M0 0C-9-8-8-20 0-24C8-20 9-8 0 0Z"/>`).join('')}<circle r="4"/></g>
    <path d="M60 64c14 6 24 18 30 36M96 70c-8 4-12 10-12 18M74 44c10-8 22-8 32 0"/></g></svg>`);

  /* ---------- the mandala around the RSVP button ---------- */

  function mandala(svg, gold) {
    let s = '';
    const ring = (n, r, shape, extra = '') => {
      let g = `<g class="m-ring" ${extra}>`;
      for (let i = 0; i < n; i++) g += `<g transform="rotate(${(i * 360 / n).toFixed(2)}) translate(0 ${-r})">${shape}</g>`;
      return g + '</g>';
    };
    s += `<circle r="96" fill="none" stroke="${gold}" stroke-width=".6" stroke-dasharray="1 3"/>`;
    s += ring(32, 86, `<path d="M0 -9C4 -4 4 4 0 9C-4 4 -4 -4 0 -9Z" fill="none" stroke="${gold}" stroke-width="1"/>`, 'data-spin="1"');
    s += ring(16, 72, `<path d="M0 -12C7 -5 6 6 0 10C-6 6 -7 -5 0 -12Z" fill="${gold}" opacity=".85"/><circle cy="-16" r="1.6" fill="${gold}"/>`, 'data-spin="-1"');
    s += `<circle r="60" fill="none" stroke="${gold}" stroke-width="1.2"/><circle r="56" fill="none" stroke="${gold}" stroke-width=".5"/>`;
    s += ring(48, 58, `<circle r="1" fill="${gold}"/>`, 'data-spin="1.5"');
    svg.innerHTML = s;
  }

  // sun rays behind the Instagram panel
  function rays(svg, c) {
    let s = '';
    for (let i = 0; i < 48; i++) {
      const L = i % 2 ? 78 : 96, w = i % 2 ? 3 : 4.5;
      s += `<path transform="rotate(${i * 7.5})" d="M${-w} -54L0 ${-L}L${w} -54Z" fill="${c}"/>`;
    }
    for (let i = 0; i < 24; i++) s += `<circle transform="rotate(${i * 15 + 3.75})" cy="-62" r="1.8" fill="${c}"/>`;
    svg.innerHTML = s;
  }

  // a row of scallops for the top edge of a section
  function scallops(n = 24) {
    const w = 1200 / n;
    let d = `M0 60V${30}`;
    for (let i = 0; i < n; i++) d += `a${w / 2} 30 0 0 1 ${w} 0`;
    return d + 'V60Z';
  }

  /* ---------- the route: hills, a winding road, the venue ---------- */

  function routeMap(svg, { gold, navy, tall }) {
    const r = rng(29);
    if (tall) return routeMapTall(svg, { gold, navy, r });
    const ridges = [
      { fill: '#2b4a7c', top: '#3c5f95', base: 300, amp: 60, waves: [1.2, 2.7, 5], pines: 26, pineH: 26, w: 1000, h: 560 },
      { fill: '#203d6b', top: '#2e4f84', base: 380, amp: 46, waves: [1.6, 3.1, 6], pines: 30, pineH: 32, w: 1000, h: 560 },
      { fill: navy, top: '#183460', base: 470, amp: 30, waves: [2, 4.4], pines: 34, pineH: 38, w: 1000, h: 560 }
    ];
    const road = 'M70 560C150 520 330 540 360 492S220 430 300 398S560 410 600 362S470 300 560 268S760 250 790 200';
    svg.innerHTML = `<defs>
        <filter id="rsh"><feDropShadow dx="0" dy="-3" stdDeviation="4" flood-color="#030a1c" flood-opacity=".5"/></filter>
        <mask id="roadMask" maskUnits="userSpaceOnUse"><path id="roadReveal" d="${road}" fill="none" stroke="#fff" stroke-width="16" pathLength="1" stroke-dasharray="1 1" stroke-dashoffset="1"/></mask>
      </defs>
      ${ridges.map((L, i) => `<path filter="url(#rsh)" fill="${L.fill}" d="${ridge(r, L)}" class="rm-ridge" data-i="${i}"/>`).join('')}
      <path d="${road}" fill="none" stroke="${gold}" stroke-opacity=".18" stroke-width="5" stroke-linecap="round"/>
      <path id="roadPath" d="${road}" fill="none" stroke="${gold}" stroke-width="3.2" stroke-linecap="round" stroke-dasharray="2 11" mask="url(#roadMask)"/>
      <image href="assets/hotel.webp" x="808" y="104" width="150" height="104" preserveAspectRatio="xMidYMax meet" class="rm-hotel"/>
      <g class="rm-pin" transform="translate(790 200)"><circle class="rm-pulse" r="10" fill="none" stroke="${gold}" stroke-width="2"/><circle r="5" fill="${gold}"/></g>`;
    return svg.querySelector('#roadPath');
  }

  // phones: the road climbs in switchbacks instead of running sideways
  function routeMapTall(svg, { gold, navy, r }) {
    const W = 600, H = 760;
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    const ridges = [
      { fill: '#2b4a7c', top: '#3c5f95', base: 330, amp: 60, waves: [1.2, 2.7, 5], pines: 18, pineH: 26, w: W, h: H },
      { fill: '#203d6b', top: '#2e4f84', base: 480, amp: 46, waves: [1.6, 3.1, 6], pines: 20, pineH: 34, w: W, h: H },
      { fill: navy, top: '#183460', base: 620, amp: 30, waves: [2, 4.4], pines: 22, pineH: 42, w: W, h: H }
    ];
    const road = 'M300 760C110 730 120 670 300 650S490 580 300 545S110 470 300 440S470 370 330 330';
    svg.innerHTML = `<defs>
        <filter id="rsh"><feDropShadow dx="0" dy="-3" stdDeviation="4" flood-color="#030a1c" flood-opacity=".5"/></filter>
        <mask id="roadMask" maskUnits="userSpaceOnUse"><path id="roadReveal" d="${road}" fill="none" stroke="#fff" stroke-width="16" pathLength="1" stroke-dasharray="1 1" stroke-dashoffset="1"/></mask>
      </defs>
      ${ridges.map((L, i) => `<path filter="url(#rsh)" fill="${L.fill}" d="${ridge(r, L)}" class="rm-ridge" data-i="${i}"/>`).join('')}
      <path d="${road}" fill="none" stroke="${gold}" stroke-opacity=".18" stroke-width="5" stroke-linecap="round"/>
      <path id="roadPath" d="${road}" fill="none" stroke="${gold}" stroke-width="3.4" stroke-linecap="round" stroke-dasharray="2 11" mask="url(#roadMask)"/>
      <image href="assets/hotel.webp" x="378" y="226" width="160" height="112" preserveAspectRatio="xMidYMax meet" class="rm-hotel"/>
      <g class="rm-pin" transform="translate(330 330)"><circle class="rm-pulse" r="10" fill="none" stroke="${gold}" stroke-width="2"/><circle r="5" fill="${gold}"/></g>`;
    return svg.querySelector('#roadPath');
  }

  window.Scenery = { buildHills, buildClouds, Stars, damask, buti, florals, mandala, rays, scallops, routeMap, rng };
})();
