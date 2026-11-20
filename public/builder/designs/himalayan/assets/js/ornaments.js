/* Drawn ornaments: arch bands, gold oval frames, the RSVP mandala. All SVG, so they stay
   sharp at any size and need no image files. */
window.Ornaments = (function () {
  const NS = 'http://www.w3.org/2000/svg';

  /* One cusped arch, 120 wide. Repeated across the page edge. */
  const CURVE = 'M0 72A20 20 0 0 1 20 46A20 20 0 0 1 40 26Q52 20 60 6Q68 20 80 26A20 20 0 0 1 100 46A20 20 0 0 1 120 72';

  let uid = 0;
  function arches(el) {
    const fill = el.dataset.arches;
    const line = el.dataset.line;
    const id = 'arch' + ++uid;
    el.innerHTML =
      `<svg xmlns="${NS}" preserveAspectRatio="none"><defs>` +
      `<pattern id="${id}" width="120" height="100" patternUnits="userSpaceOnUse">` +
      `<path d="${CURVE}V100H0Z" fill="${fill}"/>` +
      `<path d="${CURVE}" fill="none" stroke="${line}" stroke-width="2"/>` +
      `</pattern></defs><rect width="100%" height="100%" fill="url(#${id})"/></svg>`;
  }

  function ovalFrame() {
    return (
      `<svg class="oval-frame" viewBox="0 0 400 500" aria-hidden="true">` +
      `<ellipse class="of-beads" cx="200" cy="250" rx="194" ry="244"/>` +
      `<ellipse class="of-line of-draw" pathLength="1" cx="200" cy="250" rx="184" ry="234" stroke-width="5"/>` +
      `<ellipse class="of-line of-draw" pathLength="1" cx="200" cy="250" rx="174" ry="224" stroke-width="1.5"/>` +
      `<g class="of-crown"><path d="M200-8c11 15 16 25 16 35 0 8-7 15-16 21-9-6-16-13-16-21 0-10 5-20 16-35z"/>` +
      `<path d="M178 46c-15-1-26-8-33-21 13-3 24 1 33 10zM222 46c15-1 26-8 33-21-13-3-24 1-33 10z"/></g>` +
      `<g class="of-crown" transform="rotate(180 200 250)"><path d="M200-8c11 15 16 25 16 35 0 8-7 15-16 21-9-6-16-13-16-21 0-10 5-20 16-35z"/>` +
      `<path d="M178 46c-15-1-26-8-33-21 13-3 24 1 33 10zM222 46c15-1 26-8 33-21-13-3-24 1-33 10z"/></g>` +
      `</svg>`
    );
  }

  function ring(svg, r, count, petal, attrs) {
    let out = '';
    for (let i = 0; i < count; i++) {
      out += `<path d="${petal}" transform="rotate(${(360 / count) * i}) translate(0 ${-r})" ${attrs}/>`;
    }
    svg.insertAdjacentHTML('beforeend', out);
  }

  function mandala(svg) {
    const gold = 'fill="none" stroke="#b58a34" stroke-width="1.6"';
    const solid = 'fill="#d9b25f"';
    const pink = 'fill="#f6c9dc" stroke="#b58a34" stroke-width="1.4"';
    ring(svg, 214, 24, 'M0 34C-17 12-17-9 0-34 17-9 17 12 0 34z', pink);
    ring(svg, 214, 24, 'M0 22C-8 8-8-6 0-22 8-6 8 8 0 22z', solid);
    ring(svg, 246, 48, 'M0 3a3 3 0 1 0 0-6 3 3 0 0 0 0 6z', solid);
    ring(svg, 176, 16, 'M0 32C-26 14-26-10 0-32 26-10 26 14 0 32z', gold);
    ring(svg, 176, 16, 'M0 18C-11 8-11-6 0-18 11-6 11 8 0 18z', 'fill="#d6337f"');
    svg.insertAdjacentHTML('beforeend',
      '<circle r="232" fill="none" stroke="#b58a34" stroke-width="1.5"/>' +
      '<circle r="190" fill="none" stroke="#b58a34" stroke-width="1"/>' +
      '<circle r="150" fill="#fbe4ee" stroke="#d9b25f" stroke-width="2"/>');
  }

  return { arches, ovalFrame, mandala };
})();
