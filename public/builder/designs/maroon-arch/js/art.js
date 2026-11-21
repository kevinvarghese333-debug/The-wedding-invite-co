/* Line art drawn in code: crest, toran, kalash, mandala, Rawla skyline, event icons, wax seal.
   Everything is SVG so it stays sharp on any screen and can be drawn stroke by stroke. */
window.ART = (() => {
  const f = n => Math.round(n * 100) / 100;
  const rad = d => d * Math.PI / 180;

  /* Wax seal edge: a circle with soft, uneven drips */
  function sealEdge(r = 50) {
    let d = '';
    for (let i = 0; i <= 180; i++) {
      const t = (i / 180) * Math.PI * 2;
      const rr = r + 2.6 * Math.sin(9 * t) + 1.5 * Math.sin(23 * t + 1) + 1.1 * Math.sin(5 * t + 2);
      d += (i ? 'L' : 'M') + f(rr * Math.cos(t)) + ' ' + f(rr * Math.sin(t));
    }
    return d + 'Z';
  }

  function sealSymbol() {
    return `<symbol id="sealShape" viewBox="-60 -60 120 120">
      <path d="${sealEdge()}" fill="url(#waxGrad)"/>
      <circle r="38" fill="none" stroke="#3f0d14" stroke-opacity=".55" stroke-width="2"/>
      <circle r="35" fill="none" stroke="#d9b468" stroke-opacity=".6" stroke-width=".8"/>
      <text class="seal-mono" x="-7" y="14" text-anchor="middle">N</text>
      <text class="seal-mono" x="9" y="17" text-anchor="middle">A</text>
    </symbol>`;
  }

  /* Leaves and buds */
  const LEAF = 'M0 0 C7 -7 8 -18 0 -27 C-8 -18 -7 -7 0 0 Z';
  const RIB = 'M0 -2 L0 -23';
  const MANGO = 'M0 0 C6 -6 6 -20 -1 -32 C-6 -20 -6 -6 0 0 Z';

  function bud(x, y, s = 1, delay = 0) {
    let petals = '';
    for (let i = 0; i < 8; i++) {
      const a = rad(i * 45);
      petals += `<circle cx="${f(Math.cos(a) * 4.2 * s)}" cy="${f(Math.sin(a) * 4.2 * s)}" r="${f(3.2 * s)}"/>`;
    }
    return `<g transform="translate(${f(x)} ${f(y)})"><g class="pop bud" style="--d:${delay}s">${petals}<circle r="${f(2.6 * s)}" class="bud-c"/></g></g>`;
  }

  /* The crest: a Western laurel wreath woven with mango leaves and marigold buds,
     a ring of bandhani dots, a chhatri crown and a ribbon with the date in Roman numerals. */
  function crest({ ribbon = 'XXVIII · II · MMXXVII' } = {}) {
    const R = 170;
    let wreath = '';
    const branch = (from, to, dir) => {
      const steps = 15;
      for (let i = 0; i <= steps; i++) {
        const phi = from + (to - from) * (i / steps);
        const x = R * Math.cos(rad(phi)), y = R * Math.sin(rad(phi));
        const base = dir > 0 ? phi + 180 : phi;
        const delay = 0.5 + i * 0.07;
        [-1, 1].forEach(side => {
          const tilt = base + side * 38 * dir;
          const off = side * 5;
          const ox = x + Math.cos(rad(phi)) * off, oy = y + Math.sin(rad(phi)) * off;
          const mango = (i + (side > 0 ? 1 : 0)) % 3 === 0;
          wreath += `<g transform="translate(${f(ox)} ${f(oy)}) rotate(${f(tilt)})"><g class="pop leaf${mango ? ' mango' : ''}" style="--d:${f(delay + (side > 0 ? 0.03 : 0))}s"><path d="${mango ? MANGO : LEAF}"/><path class="rib" d="${RIB}"/></g></g>`;
        });
        if (i % 4 === 2) {
          const bx = (R + 16) * Math.cos(rad(phi)), by = (R + 16) * Math.sin(rad(phi));
          wreath += bud(bx, by, 1, delay + 0.2);
        }
      }
    };
    branch(104, 252, 1);   // left, bottom to top
    branch(76, -72, -1);   // right, bottom to top
    const stemL = arc(R, 104, 252), stemR = arc(R, 76, -72, true);

    let dots = '';
    for (let i = 0; i < 72; i++) {
      const a = rad(i * 5);
      dots += `<circle cx="${f(Math.cos(a) * 146)}" cy="${f(Math.sin(a) * 146)}" r="${i % 2 ? 1.1 : 1.8}"/>`;
    }

    return `<svg class="crest" viewBox="-240 -250 480 480" aria-hidden="true">
      <g class="crest-wreath">
        <path class="draw stem" pathLength="1" d="${stemL}" style="--d:.3s"/>
        <path class="draw stem" pathLength="1" d="${stemR}" style="--d:.3s"/>
        ${wreath}
      </g>
      <g class="crest-ring">
        <circle class="draw ring" pathLength="1" r="156" style="--d:0s" transform="rotate(-90)"/>
        <circle class="draw ring thin" pathLength="1" r="138" style="--d:.2s" transform="rotate(90)"/>
        <g class="dots fade" style="--d:1.1s">${dots}</g>
      </g>
      <g class="crest-crown">
        <path class="draw" pathLength="1" style="--d:.9s" d="M-40 -158 L40 -158 M-34 -158 L-34 -168 M34 -158 L34 -168 M-44 -168 L44 -168"/>
        <path class="draw" pathLength="1" style="--d:1.1s" d="M-30 -168 C-30 -190 -10 -198 0 -208 C10 -198 30 -190 30 -168"/>
        <path class="draw" pathLength="1" style="--d:1.3s" d="M-18 -168 C-18 -182 -6 -188 0 -196 C6 -188 18 -182 18 -168"/>
        <path class="draw" pathLength="1" style="--d:1.5s" d="M0 -208 L0 -222 M-6 -216 L6 -216"/>
        <circle class="pop dot" style="--d:1.7s" cy="-226" r="3.4"/>
        <circle class="pop dot" style="--d:1.6s" cx="-44" cy="-172" r="2.6"/>
        <circle class="pop dot" style="--d:1.6s" cx="44" cy="-172" r="2.6"/>
      </g>
      <g class="crest-ribbon"><g class="fade" style="--d:1.4s">
        <path class="rb-tail" d="M-118 156 L-150 162 L-136 174 L-152 188 L-112 184 Z"/>
        <path class="rb-tail" d="M118 156 L150 162 L136 174 L152 188 L112 184 Z"/>
        <path class="rb-band" d="M-120 152 Q0 186 120 152 L114 186 Q0 220 -114 186 Z"/>
        <path id="rbText" d="M-108 172 Q0 204 108 172" fill="none"/>
        <text class="rb-text"><textPath href="#rbText" startOffset="50%" text-anchor="middle">${ribbon}</textPath></text>
      </g></g>
    </svg>`;
  }

  function arc(r, a0, a1, ccw = false) {
    const p = a => `${f(r * Math.cos(rad(a)))} ${f(r * Math.sin(rad(a)))}`;
    const large = Math.abs(a1 - a0) > 180 ? 1 : 0;
    return `M${p(a0)} A${r} ${r} 0 ${large} ${ccw ? 0 : 1} ${p(a1)}`;
  }

  /* Marigold toran: swags of marigolds with mango-leaf tassels */
  function toran(width, small = false) {
    width = Math.max(320, width || 0);
    const n = Math.max(3, Math.round(width / (small ? 120 : 150)));
    const w = width / n, sag = small ? 30 : 42, H = small ? 110 : 150;
    let out = '';
    for (let i = 0; i < n; i++) {
      const x0 = i * w, x1 = (i + 1) * w, xm = (x0 + x1) / 2;
      let balls = '';
      const count = Math.max(4, Math.round(w / 11));
      for (let j = 0; j <= count; j++) {
        const t = j / count;
        const x = x0 + (x1 - x0) * t;
        const y = 6 + 4 * sag * t * (1 - t);
        balls += ball(x, y, j % 2 ? '#f2b632' : '#e8862a', 5.4);
      }
      out += `<g class="swag" style="--d:${f(0.1 + i * 0.08)}s;transform-origin:${f(xm)}px 0px"><g class="sway" style="--s:${f(4.5 + (i % 3) * 0.6)}s;transform-origin:${f(xm)}px 0px">${balls}</g></g>`;
    }
    // hanging strings at each node
    let strings = '';
    for (let i = 0; i <= n; i++) {
      const x = i * w;
      let s = '';
      const len = small ? 4 : 6;
      for (let j = 0; j < len; j++) s += ball(x, 8 + j * 10.5, j % 2 ? '#e8862a' : '#f2b632', 4.8);
      s += `<g transform="translate(${f(x)} ${f(8 + len * 10.5)})"><path class="mleaf" d="M0 0 C5 7 5 19 0 28 C-5 19 -5 7 0 0 Z"/><path class="mleaf" transform="rotate(28)" d="M0 0 C4 6 4 15 0 22 C-4 15 -4 6 0 0 Z"/><path class="mleaf" transform="rotate(-28)" d="M0 0 C4 6 4 15 0 22 C-4 15 -4 6 0 0 Z"/></g>`;
      strings += `<g class="swag" style="--d:${f(0.05 + i * 0.08)}s;transform-origin:${f(x)}px 0px"><g class="sway" style="--s:${f(3.6 + (i % 4) * 0.5)}s;transform-origin:${f(x)}px 0px">${s}</g></g>`;
    }
    return `<svg viewBox="0 0 ${f(width)} ${H}" width="${f(width)}" height="${H}"><path class="rope" d="M0 4 H${f(width)}"/>${out}${strings}</svg>`;
  }

  function ball(x, y, c, r) {
    return `<circle cx="${f(x)}" cy="${f(y)}" r="${r}" fill="${c}" stroke="#b9621a" stroke-width=".7"/><circle cx="${f(x - r * 0.3)}" cy="${f(y - r * 0.3)}" r="${f(r * 0.32)}" fill="#ffe2a0" opacity=".7"/>`;
  }

  /* Kalash with mango leaves and coconut, for the blessing */
  function kalash() {
    let leaves = '';
    [-62, -32, 0, 32, 62].forEach((a, i) =>
      leaves += `<path pathLength="1" style="--d:${f(0.9 + i * 0.08)}s" transform="translate(60 58) rotate(${a})" d="M0 0 C7 -8 7 -22 0 -34 C-7 -22 -7 -8 0 0 Z M0 -3 L0 -30"/>`);
    return `<svg viewBox="0 0 120 150" class="kalash-svg">
      <path pathLength="1" style="--d:0s" d="M36 72 C18 82 17 112 34 126 C46 136 74 136 86 126 C103 112 102 82 84 72 Z"/>
      <path pathLength="1" style="--d:.3s" d="M42 72 L45 62 L75 62 L78 72"/>
      <path pathLength="1" style="--d:.4s" d="M37 61 Q60 67 83 61"/>
      <path pathLength="1" style="--d:.5s" d="M24 94 Q60 106 96 94 M22 103 Q60 115 98 103"/>
      <path pathLength="1" style="--d:.6s" d="M45 132 L41 142 L79 142 L75 132"/>
      ${leaves}
      <path pathLength="1" style="--d:1.3s" d="M60 58 C46 58 46 30 60 26 C74 30 74 58 60 58 Z"/>
      <path pathLength="1" style="--d:1.5s" d="M60 26 L56 16 M60 26 L60 13 M60 26 L64 16"/>
      <g class="k-dots"><circle cx="60" cy="112" r="2.2"/><circle cx="48" cy="111" r="1.6"/><circle cx="72" cy="111" r="1.6"/><circle cx="60" cy="84" r="5" fill="none"/></g>
    </svg>`;
  }

  /* Mandala behind the countdown */
  function mandala() {
    const petal = (r0, r1, w) => `M0 ${-r0} C${w} ${-(r0 + (r1 - r0) * 0.35)} ${f(w * 0.55)} ${-(r1 - (r1 - r0) * 0.12)} 0 ${-r1} C${f(-w * 0.55)} ${-(r1 - (r1 - r0) * 0.12)} ${-w} ${-(r0 + (r1 - r0) * 0.35)} 0 ${-r0} Z`;
    const ring = (n, r0, r1, w, cls, off = 0) => {
      let s = '';
      for (let i = 0; i < n; i++) s += `<path class="${cls}" transform="rotate(${f(i * 360 / n + off)})" d="${petal(r0, r1, w)}"/>`;
      return s;
    };
    let dots = '';
    for (let i = 0; i < 64; i++) {
      const a = rad(i * 360 / 64);
      dots += `<circle cx="${f(Math.cos(a) * 262)}" cy="${f(Math.sin(a) * 262)}" r="2.2"/>`;
    }
    return `<svg viewBox="-300 -300 600 600">
      <g class="m-a">${ring(8, 14, 60, 18, 'p1')}<circle r="14"/>${ring(16, 64, 118, 14, 'p2')}<circle r="62"/></g>
      <g class="m-b"><circle r="122"/>${ring(24, 126, 190, 15, 'p1')}${ring(24, 132, 172, 7, 'p3', 7.5)}<circle r="196"/></g>
      <g class="m-c">${ring(40, 200, 248, 10, 'p2')}<circle r="252"/>${dots}<circle r="272"/></g>
    </svg>`;
  }

  /* Rawla Lohgarh, imagined: walls, chhatris, jharokha windows, a tower and trees */
  function skyline() {
    const paths = [];
    const add = (d, cls = '') => paths.push([d, cls]);
    const G = 206;
    const battl = (x0, x1, y, m = 9, h = 8) => {
      let d = `M${x0} ${y}`;
      for (let x = x0; x + m * 2 <= x1; x += m * 2) d += ` H${x + m} V${y - h} H${x + m * 2} V${y}`;
      return d + ` H${x1}`;
    };
    const win = (x, yb, w, h) =>
      `M${f(x - w / 2)} ${yb} V${f(yb - h * 0.55)} C${f(x - w / 2)} ${f(yb - h * 0.82)} ${f(x - w * 0.14)} ${f(yb - h * 0.86)} ${x} ${yb - h} C${f(x + w * 0.14)} ${f(yb - h * 0.86)} ${f(x + w / 2)} ${f(yb - h * 0.82)} ${f(x + w / 2)} ${f(yb - h * 0.55)} V${yb}`;
    const chhatri = (x, y, s = 1) => {
      const w = 20 * s, ph = 20 * s, dh = 22 * s;
      return `M${f(x - w)} ${y} V${f(y - ph)} M${f(x + w)} ${y} V${f(y - ph)} M${f(x - w - 6 * s)} ${f(y - ph)} H${f(x + w + 6 * s)} ` +
        `M${f(x - w + 2)} ${f(y - ph)} C${f(x - w + 2)} ${f(y - ph - dh * 0.75)} ${f(x - 5 * s)} ${f(y - ph - dh * 0.9)} ${x} ${f(y - ph - dh)} C${f(x + 5 * s)} ${f(y - ph - dh * 0.9)} ${f(x + w - 2)} ${f(y - ph - dh * 0.75)} ${f(x + w - 2)} ${f(y - ph)} ` +
        `M${x} ${f(y - ph - dh)} V${f(y - ph - dh - 9 * s)} M${x} ${f(y - ph - dh - 9 * s)} L${f(x + 9 * s)} ${f(y - ph - dh - 6 * s)} L${x} ${f(y - ph - dh - 3 * s)}`;
    };
    const tree = (x, r) => `M${x} ${G} V${G - r * 1.2} M${x - r} ${G - r * 1.6} a${r} ${r} 0 1 1 ${2 * r} 0 a${r} ${r} 0 1 1 ${-2 * r} 0 M${x - r * 1.5} ${G - r * 1.05} a${r * 0.7} ${r * 0.7} 0 1 1 ${r * 1.4} 0 a${r * 0.7} ${r * 0.7} 0 1 1 ${-r * 1.4} 0 M${x + r * 0.1} ${G - r * 1.05} a${r * 0.7} ${r * 0.7} 0 1 1 ${r * 1.4} 0 a${r * 0.7} ${r * 0.7} 0 1 1 ${-r * 1.4} 0`;

    add(`M0 ${G} H600`, 'ground');
    // left wall and chhatri
    add(`M14 ${G} V150` + battl(14, 172, 150).replace(/^M\S+ \S+/, '') + ` V${G}`);
    add(chhatri(64, 150, 0.9));
    add(win(100, G - 6, 14, 24) + ' ' + win(130, G - 6, 14, 24));
    add(tree(180, 14), 'tree');
    // main rawla
    add(`M196 ${G} V104 H404 V${G}`);
    add(battl(196, 404, 104, 8, 7));
    let w1 = '', w2 = '';
    for (let i = 0; i < 7; i++) {
      const x = 214 + i * 28.6;
      if (i !== 3) w1 += win(x, G - 8, 14, 30) + ' ';
      w2 += win(x, 162, 12, 24) + ' ';
    }
    add(w1);
    add(w2);
    add(`M300 ${G} V${G - 40} M282 ${G} V${G - 26} C282 ${G - 44} 318 ${G - 44} 318 ${G - 26} V${G}`); // main gate
    add(`M270 132 H330 M274 132 V112 H326 V132 M268 112 H332 ` + chhatri(300, 112, 0.6)); // jharokha balcony
    add(chhatri(212, 104, 0.7));
    add(chhatri(388, 104, 0.7));
    add(`M268 97 C268 72 290 62 300 50 C310 62 332 72 332 97 M262 97 H338 M300 50 V38 M300 38 L311 41 L300 44`); // big dome
    // tower
    add(tree(424, 12), 'tree');
    add(`M444 ${G} V122 H500 V${G} ` + battl(444, 500, 122, 7, 7));
    add(chhatri(472, 115, 0.85));
    add(win(472, 170, 12, 24) + ' ' + win(472, 196, 14, 26));
    // right wall
    add(`M500 158` + battl(500, 590, 158).replace(/^M\S+ \S+/, '') + ` V${G}`);
    add(tree(560, 15), 'tree');
    // birds
    add('M120 62 q6 -6 12 0 q6 -6 12 0 M150 44 q5 -5 10 0 q5 -5 10 0 M530 70 q5 -5 10 0 q5 -5 10 0', 'bird');

    const svg = paths.map(([d, cls], i) => `<path pathLength="1" class="${cls}" data-i="${i}" d="${d}"/>`).join('');
    return `<svg viewBox="0 0 600 214" preserveAspectRatio="xMidYMax meet">
      <defs><radialGradient id="sunGrad"><stop offset="0" stop-color="#ffe3a3"/><stop offset=".6" stop-color="#f2b25a"/><stop offset="1" stop-color="#f2b25a" stop-opacity="0"/></radialGradient></defs>
      <g class="sun"><circle cx="300" cy="120" r="80" fill="url(#sunGrad)" opacity=".55"/><circle cx="300" cy="120" r="34" fill="#f7cf7a"/></g>
      <rect class="sky-cut" x="0" y="${G}" width="600" height="20"/>
      <g class="lines">${svg}</g>
    </svg>`;
  }

  /* Event icons */
  function icon(type) {
    if (type === 'garland') {
      let balls = '';
      for (let i = 0; i <= 18; i++) {
        const t = i / 18;
        const x = 18 + 84 * t, y = 16 + 4 * 62 * t * (1 - t);
        balls += `<circle class="pop" style="--d:${f(0.2 + i * 0.04)}s" cx="${f(x)}" cy="${f(y)}" r="5" fill="${i % 2 ? '#f2b632' : '#e8862a'}"/>`;
      }
      return `<svg viewBox="0 0 120 120">${balls}
        <path class="ln" pathLength="1" style="--d:.9s" d="M60 94 C48 84 52 70 60 60 C61 68 70 72 67 84 C66 88 63 92 60 94 Z"/>
        <path class="ln" pathLength="1" style="--d:1.1s" d="M60 90 C56 86 57 80 60 76 C62 80 64 84 60 90 Z"/>
        <path class="ln" pathLength="1" style="--d:1.2s" d="M42 96 H78 L74 108 H46 Z M40 96 H80"/>
      </svg>`;
    }
    const lantern = (x, len, d) => `
      <path class="ln" pathLength="1" style="--d:${d}s" d="M${x} 0 V${len}"/>
      <path class="ln" pathLength="1" style="--d:${d + 0.2}s" d="M${x - 8} ${len} H${x + 8} L${x + 5} ${len + 6} H${x - 5} Z M${x - 10} ${len + 6} C${x - 15} ${len + 18} ${x - 15} ${len + 30} ${x - 6} ${len + 38} H${x + 6} C${x + 15} ${len + 30} ${x + 15} ${len + 18} ${x + 10} ${len + 6} Z M${x} ${len + 38} V${len + 46}"/>
      <circle class="glow" style="--d:${d + 0.6}s" cx="${x}" cy="${len + 22}" r="9"/>`;
    return `<svg viewBox="0 0 120 120">
      <path class="ln" pathLength="1" style="--d:.1s" d="M22 26 A16 16 0 1 0 40 48 A12.5 12.5 0 1 1 22 26 Z"/>
      <path class="pop star" style="--d:.5s" d="M96 22 l2 5 5 2 -5 2 -2 5 -2 -5 -5 -2 5 -2 Z"/>
      <path class="pop star" style="--d:.7s" d="M50 14 l1.5 3.5 3.5 1.5 -3.5 1.5 -1.5 3.5 -1.5 -3.5 -3.5 -1.5 3.5 -1.5 Z"/>
      ${lantern(62, 34, 0.3)}${lantern(88, 52, 0.5)}
    </svg>`;
  }

  return { crest, toran, kalash, mandala, skyline, icon, sealEdge, sealSymbol };
})();
