/* Illustrations for the builder templates, drawn as inline SVG.
   Colours come from CSS variables (--accent, --soft, --flower, --leaf, --ink, --bg), so palettes and
   custom colours restyle the art without redrawing it. Gradients live once in DEFS. */

const f = (n: number) => Math.round(n * 10) / 10;

/* ---------- shared defs (gradients) ---------- */
export const DEFS = `<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false"><defs>
<linearGradient id="g-petal" x1="0" y1="1" x2="0" y2="0"><stop offset="0" style="stop-color:var(--flower)"/><stop offset="1" style="stop-color:var(--paper)"/></linearGradient>
<linearGradient id="g-petal-b" x1="0" y1="1" x2="0" y2="0"><stop offset="0" style="stop-color:var(--flower-deep)"/><stop offset="1" style="stop-color:var(--flower)"/></linearGradient>
<linearGradient id="g-leaf" x1="0" y1="0" x2="1" y2="1"><stop offset="0" style="stop-color:var(--leaf)"/><stop offset="1" style="stop-color:var(--leaf-deep)"/></linearGradient>
<linearGradient id="g-brass" x1="0" y1="0" x2="1" y2="0"><stop offset="0" style="stop-color:var(--accent-deep)"/><stop offset=".45" style="stop-color:var(--accent-light)"/><stop offset="1" style="stop-color:var(--accent-deep)"/></linearGradient>
<radialGradient id="g-flame" cx=".5" cy=".7" r=".6"><stop offset="0" stop-color="#fff6d6"/><stop offset=".45" stop-color="#ffc94a"/><stop offset="1" stop-color="#f07b1e"/></radialGradient>
<radialGradient id="g-glow" cx=".5" cy=".5" r=".5"><stop offset="0" style="stop-color:var(--accent);stop-opacity:.55"/><stop offset="1" style="stop-color:var(--accent);stop-opacity:0"/></radialGradient>
<radialGradient id="g-seal" cx=".4" cy=".35" r=".7"><stop offset="0" style="stop-color:var(--seal-light)"/><stop offset="1" style="stop-color:var(--seal)"/></radialGradient>
</defs></svg>`;

/* ---------- Thamara: lotus, lamps and a toran of mango leaves ---------- */
function lotus(cx: number, cy: number, s: number) {
  const petal = (len: number, w: number) => `M0 0 C ${f(w)} ${f(-len * 0.25)} ${f(w * 1.05)} ${f(-len * 0.68)} 0 ${f(-len)} C ${f(-w * 1.05)} ${f(-len * 0.68)} ${f(-w)} ${f(-len * 0.25)} 0 0Z`;
  const layer = (angles: number[], len: number, w: number, fill: string) =>
    angles
      .map(
        (a) =>
          `<g transform="rotate(${a})"><path d="${petal(len, w)}" fill="${fill}" stroke="var(--accent)" stroke-width="${f(1.1 / s)}"/><path d="M0 -4 L0 ${f(-len * 0.8)}" stroke="var(--accent)" stroke-width="${f(0.7 / s)}" opacity=".45"/></g>`
      )
      .join("");
  return `<g transform="translate(${cx} ${cy}) scale(${s})">${layer([-74, 74], 52, 15, "url(#g-petal-b)")}${layer([-50, 50], 64, 17, "url(#g-petal-b)")}${layer([-27, 27], 76, 18, "url(#g-petal)")}${layer([-11, 11], 82, 17, "url(#g-petal)")}${layer([0], 86, 16, "url(#g-petal)")}<ellipse cx="0" cy="-2" rx="16" ry="4" fill="var(--accent)" opacity=".85"/></g>`;
}

function bud(x: number, y: number, s: number, lean: number) {
  return `<g transform="translate(${x} ${y}) rotate(${lean}) scale(${s})"><path d="M0 0 C 2 20 0 40 -2 60" stroke="var(--leaf-deep)" stroke-width="2.4" fill="none"/><path d="M0 0 C 9 -6 10 -22 0 -36 C -10 -22 -9 -6 0 0Z" fill="url(#g-petal)" stroke="var(--accent)" stroke-width=".9"/><path d="M0 0 C 6 -6 6 -18 -1 -30" stroke="var(--accent)" stroke-width=".7" fill="none" opacity=".6"/></g>`;
}

function pad(x: number, y: number, rx: number, ry: number) {
  return `<g transform="translate(${x} ${y})"><path d="M0 0 L${f(rx * 0.12)} ${f(-ry)} A${rx} ${ry} 0 1 1 ${f(-rx * 0.12)} ${f(-ry)} Z" fill="url(#g-leaf)" opacity=".92"/><path d="M0 0 L${f(-rx * 0.7)} ${f(ry * 0.5)} M0 0 L${f(rx * 0.75)} ${f(ry * 0.35)} M0 0 L0 ${f(ry * 0.9)}" stroke="var(--leaf)" stroke-width="1" opacity=".6"/></g>`;
}

export function lotusPond() {
  const waves = [0, 1, 2, 3]
    .map((i) => {
      const y = 132 + i * 5;
      const inset = 30 + i * 22;
      return `<path d="M${inset} ${y} Q ${180 - 60} ${y - 3} 180 ${y} T ${360 - inset} ${y}" stroke="var(--accent)" stroke-width="1" fill="none" opacity="${f(0.75 - i * 0.15)}"/>`;
    })
    .join("");
  return `<svg class="art art-pond" viewBox="0 0 360 156" aria-hidden="true">${waves}${pad(78, 136, 34, 9)}${pad(286, 134, 30, 8)}${bud(116, 128, 0.9, -12)}${bud(250, 130, 0.8, 14)}${lotus(180, 128, 0.95)}</svg>`;
}

export function lotusSmall() {
  return `<svg class="art art-divider" viewBox="0 0 240 40" aria-hidden="true"><path d="M10 30 H92 M148 30 H230" stroke="var(--accent)" stroke-width="1"/><circle cx="96" cy="30" r="1.8" fill="var(--accent)"/><circle cx="144" cy="30" r="1.8" fill="var(--accent)"/>${lotus(120, 32, 0.32)}</svg>`;
}

export function lamp() {
  const flame = (x: number, y: number, s: number, d: number) =>
    `<g transform="translate(${x} ${y}) scale(${s})"><path class="flame" style="animation-delay:${d}s" d="M0 0 C 6 -8 5 -16 0 -24 C -5 -16 -6 -8 0 0Z" fill="url(#g-flame)"/></g>`;
  return `<svg class="art art-lamp" viewBox="0 0 70 220" aria-hidden="true">
<circle cx="35" cy="22" r="26" fill="url(#g-glow)"/>
${flame(35, 30, 1, 0)}${flame(17, 36, 0.7, 0.3)}${flame(53, 36, 0.7, 0.6)}
<path d="M8 36 Q35 52 62 36 L58 32 Q35 42 12 32Z" fill="url(#g-brass)"/>
<path d="M33 44 H37 V190 H33Z" fill="url(#g-brass)"/>
<ellipse cx="35" cy="60" rx="7" ry="4" fill="url(#g-brass)"/><ellipse cx="35" cy="96" rx="9" ry="5" fill="url(#g-brass)"/><ellipse cx="35" cy="132" rx="7" ry="4" fill="url(#g-brass)"/><ellipse cx="35" cy="160" rx="10" ry="5.5" fill="url(#g-brass)"/>
<path d="M22 196 Q35 186 48 196 L52 204 H18Z" fill="url(#g-brass)"/><path d="M10 212 Q35 196 60 212 L62 218 H8Z" fill="url(#g-brass)"/>
</svg>`;
}

export function toran() {
  const parts: string[] = [];
  const yAt = (x: number) => {
    const seg = x <= 180 ? 0 : 1;
    const t = seg === 0 ? x / 180 : (x - 180) / 180;
    const [a, b, c] = seg === 0 ? [6, 24, 10] : [10, 24, 6];
    return (1 - t) * (1 - t) * a + 2 * (1 - t) * t * b + t * t * c;
  };
  for (let i = 0; i < 13; i++) {
    const x = 12 + i * 28;
    const y = yAt(x);
    if (i % 2 === 0) {
      parts.push(
        `<g transform="translate(${f(x)} ${f(y)})"><path d="M0 0 C 7 10 7 28 0 40 C -7 28 -7 10 0 0Z" fill="url(#g-leaf)"/><path d="M0 2 V36" stroke="var(--leaf)" stroke-width=".8" opacity=".7"/></g>`
      );
    } else {
      parts.push(
        `<g transform="translate(${f(x)} ${f(y + 6)})"><circle r="6.5" fill="var(--marigold)"/><circle r="6.5" fill="none" stroke="var(--marigold-deep)" stroke-width="2.4" stroke-dasharray="2 1.6"/><circle cy="12" r="5" fill="var(--marigold)"/><circle cy="12" r="5" fill="none" stroke="var(--marigold-deep)" stroke-width="2" stroke-dasharray="2 1.6"/><path d="M0 17 V24" stroke="var(--accent)" stroke-width=".8"/><circle cy="26" r="2.2" fill="var(--accent)"/></g>`
      );
    }
  }
  return `<svg class="art art-toran" viewBox="0 0 360 74" preserveAspectRatio="xMidYMin meet" aria-hidden="true"><path d="M0 6 Q90 24 180 10 Q270 24 360 6" stroke="var(--accent)" stroke-width="1.6" fill="none"/>${parts.join("")}</svg>`;
}

export function doorPanel(side: "l" | "r") {
  // one leaf of a carved teak door with brass studs
  const studs: string[] = [];
  for (let r = 0; r < 4; r++)
    for (let c = 0; c < 2; c++) {
      const x = 22 + c * 58;
      const y = 40 + r * 108;
      studs.push(
        `<rect x="${x}" y="${y}" width="46" height="92" rx="3" fill="none" stroke="var(--door-line)" stroke-width="2"/><rect x="${x + 6}" y="${y + 6}" width="34" height="80" rx="2" fill="var(--door-inset)"/><circle cx="${x + 23}" cy="${y + 46}" r="7" fill="url(#g-brass)"/><circle cx="${x + 23}" cy="${y + 46}" r="2.5" fill="var(--accent-deep)"/>`
      );
    }
  const handle = side === "l" ? 136 : 4;
  return `<svg viewBox="0 0 140 480" preserveAspectRatio="none" aria-hidden="true"><rect width="140" height="480" fill="var(--door)"/>${studs.join("")}<rect x="${handle - 2}" y="210" width="6" height="60" rx="3" fill="url(#g-brass)"/><circle cx="${handle + 1}" cy="240" r="9" fill="none" stroke="var(--accent-light)" stroke-width="3"/></svg>`;
}

/* ---------- Verse: church arch, doves and olive branches ---------- */
function sprig(x: number, y: number, rot: number, s: number, mirror = false) {
  const leaves: string[] = [];
  for (let i = 0; i < 7; i++) {
    const t = i / 6;
    const px = t * 120;
    const py = -Math.sin(t * Math.PI * 0.9) * 14;
    const side = i % 2 === 0 ? -1 : 1;
    leaves.push(
      `<ellipse cx="${f(px + 4)}" cy="${f(py + side * 7)}" rx="11" ry="3.6" transform="rotate(${f(side * 32 - 10)} ${f(px + 4)} ${f(py + side * 7)})" fill="url(#g-leaf)"/>`
    );
    if (i % 3 === 1) leaves.push(`<circle cx="${f(px + 8)}" cy="${f(py - side * 6)}" r="2.6" fill="var(--accent)" opacity=".85"/>`);
  }
  return `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${mirror ? -s : s} ${s})"><path d="M0 0 Q 60 -20 128 -6" stroke="var(--leaf-deep)" stroke-width="1.6" fill="none"/>${leaves.join("")}</g>`;
}

function dove(x: number, y: number, s: number, mirror = false) {
  // a dove in flight, facing right: tail fan, round body, small head, one wing swept up and back
  return `<g transform="translate(${x} ${y}) scale(${mirror ? -s : s} ${s})" stroke="var(--accent)" stroke-width="1.1" stroke-linejoin="round" fill="var(--paper)">
<path d="M-24 5 L-44 -1 L-41 5 L-46 10 L-40 11 L-44 16 L-22 10 Z"/>
<path d="M-26 6 C -16 -2 0 -4 14 -2 C 18 -8 26 -10 31 -6 C 34 -3 34 1 31 3 L 39 5 L 30 6 C 24 13 10 16 -2 14 C -12 13 -20 11 -26 6 Z"/>
<path d="M 6 -1 C 0 -12 -10 -24 -30 -32 C -26 -26 -25 -20 -26 -16 C -30 -16 -33 -18 -36 -21 C -32 -12 -24 -6 -14 -2 C -8 0 0 0 6 -1 Z"/>
<path d="M-4 -4 C -10 -10 -18 -16 -26 -20 M-8 -2 C -14 -6 -22 -9 -30 -10" fill="none" stroke-width=".7" opacity=".6"/>
<circle cx="27" cy="-4" r="1.3" fill="var(--ink)" stroke="none"/>
</g>`;
}

export function archTop() {
  return `<svg class="art art-arch" viewBox="0 0 200 92" aria-hidden="true">
<path d="M100 4 V34 M90 13 H110" stroke="var(--accent)" stroke-width="1.6" stroke-linecap="round"/>
<circle cx="100" cy="13" r="15" fill="none" stroke="var(--accent)" stroke-width=".6" opacity=".6"/>
${dove(58, 70, 0.72)}${dove(142, 70, 0.72, true)}
</svg>`;
}

export function oliveBase() {
  return `<svg class="art art-olive" viewBox="0 0 320 70" aria-hidden="true">${sprig(160, 40, 192, 1)}${sprig(160, 40, -12, 1, false)}<circle cx="160" cy="40" r="3" fill="var(--accent)"/></svg>`;
}

export function oliveDivider() {
  return `<svg class="art art-divider" viewBox="0 0 240 40" aria-hidden="true">${sprig(120, 22, 180, 0.55)}${sprig(120, 22, 0, 0.55)}<circle cx="120" cy="22" r="2.6" fill="var(--accent)"/></svg>`;
}

/* ---------- Peony: watercolour-style peonies and leaves ---------- */
function peony(cx: number, cy: number, r: number, rot = 0) {
  const ring = (n: number, len: number, wid: number, off: number, fill: string, op = 1) => {
    const out: string[] = [];
    for (let i = 0; i < n; i++) {
      const a = off + (360 / n) * i;
      const l = len * (0.9 + ((i * 37) % 10) / 50);
      out.push(
        `<path transform="rotate(${f(a)})" d="M0 0 C ${f(wid)} ${f(-l * 0.2)} ${f(wid * 1.2)} ${f(-l * 0.8)} ${f(wid * 0.45)} ${f(-l)} Q ${f(wid * 0.2)} ${f(-l * 1.08)} 0 ${f(-l * 0.96)} Q ${f(-wid * 0.2)} ${f(-l * 1.08)} ${f(-wid * 0.45)} ${f(-l)} C ${f(-wid * 1.2)} ${f(-l * 0.8)} ${f(-wid)} ${f(-l * 0.2)} 0 0Z" fill="${fill}" stroke="var(--flower-deep)" stroke-width=".6" stroke-opacity=".5" opacity="${op}"/>`
      );
    }
    return out.join("");
  };
  return `<g transform="translate(${cx} ${cy}) rotate(${rot}) scale(${f(r / 60)})">${ring(9, 60, 22, 0, "url(#g-petal-b)", 0.9)}${ring(8, 48, 20, 20, "url(#g-petal)")}${ring(7, 34, 16, 8, "url(#g-petal-b)", 0.85)}${ring(5, 20, 12, 30, "url(#g-petal)")}<circle r="5" fill="var(--flower-deep)" opacity=".6"/></g>`;
}

function leaf(x: number, y: number, len: number, rot: number) {
  return `<g transform="translate(${x} ${y}) rotate(${rot})"><path d="M0 0 C ${f(len * 0.25)} ${f(-len * 0.2)} ${f(len * 0.7)} ${f(-len * 0.18)} ${len} 0 C ${f(len * 0.7)} ${f(len * 0.18)} ${f(len * 0.25)} ${f(len * 0.2)} 0 0Z" fill="url(#g-leaf)"/><path d="M2 0 H${f(len * 0.9)}" stroke="var(--leaf)" stroke-width=".8" opacity=".7"/></g>`;
}

function filler(x: number, y: number) {
  const dots = [
    [0, 0],
    [8, -6],
    [-6, -9],
    [4, -16],
    [14, 4],
    [-12, 2],
  ];
  return `<g transform="translate(${x} ${y})">${dots.map(([a, b]) => `<circle cx="${a}" cy="${b}" r="2.4" fill="var(--paper)" stroke="var(--flower-deep)" stroke-width=".5" stroke-opacity=".5"/>`).join("")}</g>`;
}

export function peonyCorner(flip = false) {
  const t = flip ? ` transform="scale(-1 -1) translate(-260 -220)"` : "";
  return `<svg class="art art-corner${flip ? " art-corner-b" : ""}" viewBox="0 0 260 220" aria-hidden="true"><g${t}>
${leaf(40, 120, 90, -20)}${leaf(110, 40, 80, 40)}${leaf(150, 100, 70, 10)}${leaf(30, 60, 70, -70)}${leaf(120, 140, 60, 60)}
${filler(170, 70)}${filler(70, 160)}
${peony(70, 70, 66, 10)}${peony(150, 54, 38, 40)}${peony(60, 150, 30, -20)}
</g></svg>`;
}

export function peonyDivider() {
  return `<svg class="art art-divider" viewBox="0 0 240 44" aria-hidden="true"><path d="M14 24 H96 M144 24 H226" stroke="var(--accent)" stroke-width="1"/>${leaf(118, 24, 26, 200)}${leaf(122, 24, 26, -20)}${peony(120, 22, 15)}</svg>`;
}

/* ---------- Midnight: moon and stars ---------- */
function rand(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export function starfield(n = 70, seed = 7) {
  const r = rand(seed);
  const stars: string[] = [];
  for (let i = 0; i < n; i++) {
    const x = f(r() * 400);
    const y = f(r() * 600);
    const size = r();
    const d = f(r() * 4);
    if (size > 0.9) {
      stars.push(`<path class="tw" style="animation-delay:${d}s" transform="translate(${x} ${y})" d="M0 -5 L1 -1 L5 0 L1 1 L0 5 L-1 1 L-5 0 L-1 -1Z" fill="var(--accent-light)"/>`);
    } else {
      stars.push(`<circle class="tw" style="animation-delay:${d}s" cx="${x}" cy="${y}" r="${f(0.5 + size * 1.2)}" fill="var(--star)"/>`);
    }
  }
  return `<svg class="art art-stars" viewBox="0 0 400 600" preserveAspectRatio="xMidYMid slice" aria-hidden="true">${stars.join("")}</svg>`;
}

let moons = 0;
export function moon() {
  const id = `m-crescent-${++moons % 1000}`;
  return `<svg class="art art-moon" viewBox="0 0 200 200" aria-hidden="true"><defs><mask id="${id}" maskUnits="userSpaceOnUse" x="0" y="0" width="200" height="200"><rect width="200" height="200" fill="#fff" style="visibility:visible"/><circle cx="122" cy="84" r="50" fill="#000" style="visibility:visible"/></mask></defs>
<circle cx="100" cy="100" r="96" fill="url(#g-glow)"/>
<circle cx="100" cy="100" r="58" fill="url(#g-brass)" mask="url(#${id})"/>
<path d="M150 40 L172 60 L166 92" fill="none" stroke="var(--accent-light)" stroke-width=".7" opacity=".7"/>
<path transform="translate(150 40)" d="M0 -6 L1.2 -1.2 L6 0 L1.2 1.2 L0 6 L-1.2 1.2 L-6 0 L-1.2 -1.2Z" fill="var(--accent-light)"/>
<circle cx="172" cy="60" r="2" fill="var(--accent-light)"/><circle cx="166" cy="92" r="1.6" fill="var(--accent-light)"/>
</svg>`;
}

export function starDivider() {
  return `<svg class="art art-divider" viewBox="0 0 240 30" aria-hidden="true"><path d="M20 15 H104 M136 15 H220" stroke="var(--accent)" stroke-width=".8"/><path transform="translate(120 15)" d="M0 -9 L2 -2 L9 0 L2 2 L0 9 L-2 2 L-9 0 L-2 -2Z" fill="var(--accent)"/><circle cx="108" cy="15" r="1.5" fill="var(--accent)"/><circle cx="132" cy="15" r="1.5" fill="var(--accent)"/></svg>`;
}

/* ---------- Minimal: fine lines ---------- */
export function lineDivider() {
  return `<svg class="art art-divider" viewBox="0 0 240 20" aria-hidden="true"><path d="M60 10 H180" stroke="var(--accent)" stroke-width=".8"/><circle cx="120" cy="10" r="3" fill="none" stroke="var(--accent)" stroke-width=".8"/></svg>`;
}

/* ---------- Wax seal for envelope openings ---------- */
export function seal(initials: string) {
  const scallops: string[] = [];
  for (let i = 0; i < 18; i++) {
    const a = (i / 18) * Math.PI * 2;
    scallops.push(`<circle cx="${f(50 + Math.cos(a) * 40)}" cy="${f(50 + Math.sin(a) * 40)}" r="9" fill="url(#g-seal)"/>`);
  }
  return `<svg class="seal-svg" viewBox="0 0 100 100" aria-hidden="true">${scallops.join("")}<circle cx="50" cy="50" r="41" fill="url(#g-seal)"/><circle cx="50" cy="50" r="31" fill="none" stroke="var(--seal-line)" stroke-width="1.4" stroke-dasharray="1.5 2.5"/><text x="50" y="${initials.length > 3 ? 57 : 59}" text-anchor="middle" font-size="${initials.length > 3 ? 20 : 26}" fill="var(--seal-line)" style="font-family:var(--f-script)">${initials}</text></svg>`;
}
