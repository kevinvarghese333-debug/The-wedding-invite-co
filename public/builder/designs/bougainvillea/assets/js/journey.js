/* Joel & Maria — the heart journey.
   Every scene sits on one paper world. Each tap moves the camera to the
   next stop while a heart travels a dashed trail that draws itself ahead. */
(() => {
  const C = window.INVITE;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const params = new URLSearchParams(location.search);

  const stage = $('#stage'), world = $('#world'), scenesEl = $('#scenes');
  const heart = $('#heart'), trail = $('#trail'), paperBg = $('#paperBg');
  const nextBtn = $('#nextBtn'), backBtn = $('#backBtn'), controls = $('#controls');

  /* ── helpers ─────────────────────────────────────────── */
  const esc = s => String(s ?? '').replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
  const t = s => esc(s).replace(/\[([^\]]+)\]/g, '<span class="ph">$1</span>');   // [placeholder] → styled
  const isPh = s => /\[[^\]]+\]/.test(s || '');
  const IST = { timeZone: 'Asia/Kolkata' };
  const fmt = (d, o) => new Intl.DateTimeFormat('en-IN', { ...IST, ...o }).format(d);
  const D = new Date(C.date);
  const couple = `${C.groom.name} & ${C.bride.name}`;
  const words = (text, cls = '') => {
    if (/\[[^\]]+\]/.test(text)) return `<span class="w" style="--i:0">${t(text)}</span>`;   // keep placeholders whole
    let i = 0;
    return text.split('\n').map(line => line.split(/\s+/).filter(Boolean)
      .map(w => `<span class="w" style="--i:${i++}">${t(w)}</span>`).join(' ')).join('<br>');
  };
  const ART = { arch: [731, 863], column: [368, 686], altar: [850, 1156], chapel: [697, 913], reception: [667, 885], corner: [665, 822], bells: [638, 1454], couple: [952, 1111], 'couple-lake': [860, 1137] };
  // art starts as an empty placeholder of the right shape (so layout never shifts);
  // the real file is swapped in scene by scene, opening first
  const art = n => `<img class="art" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${ART[n][0]} ${ART[n][1]}'/%3E" data-src="assets/art/${n}.webp" width="${ART[n][0]}" height="${ART[n][1]}" alt="" decoding="async">`;
  const loadArt = el => $$('img[data-src]', el).forEach(i => { i.src = i.dataset.src; i.removeAttribute('data-src'); });
  const LEAF = cls => `<svg class="leaf ${cls}" viewBox="0 0 60 16" aria-hidden="true"><path d="M1 8c14 0 30-.5 57 0"/><path d="M15 8c3-5 8-6 12-5-3 4-7 5-12 5zM15 8c3 5 8 6 12 5-3-4-7-5-12-5zM33 8c3-5 8-6 12-5-3 4-7 5-12 5zM33 8c3 5 8 6 12 5-3-4-7-5-12-5z" style="fill:rgba(111,138,106,.22)"/></svg>`;
  const ICON = {
    cal: '<svg viewBox="0 0 24 24"><rect x="3.5" y="5" width="17" height="15" rx="2"/><path d="M3.5 10h17M8 3v4M16 3v4"/></svg>',
    clock: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/></svg>',
    pin: '<svg viewBox="0 0 24 24"><path d="M12 21s-7-6.5-7-12a7 7 0 0 1 14 0c0 5.5-7 12-7 12z"/><circle cx="12" cy="9" r="2.5"/></svg>',
    dress: '<svg viewBox="0 0 24 24"><path d="M9 3l3 3 3-3M9 3 6 5l1.5 4L5 21h14l-2.5-12L18 5l-3-2"/></svg>',
    arrow: '<svg viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
    camera: '<svg viewBox="0 0 24 24"><path d="M3.5 8h4l1.6-2.5h5.8L16.5 8h4v11h-17z"/><circle cx="12" cy="13" r="3.6"/></svg>',
    bed: '<svg viewBox="0 0 24 24"><path d="M3 19V7M3 15h18v4M21 15v-3a3 3 0 0 0-3-3h-7v6"/><circle cx="7" cy="11.5" r="1.8"/></svg>',
    car: '<svg viewBox="0 0 24 24"><path d="M4 16v-4l2-5h12l2 5v4zM4 16v2.5M20 16v2.5M4 12h16"/><circle cx="7.5" cy="14" r=".6"/><circle cx="16.5" cy="14" r=".6"/></svg>',
    chat: '<svg viewBox="0 0 24 24"><path d="M4 5h16v11H11l-5 4v-4H4z"/><path d="M8 9.5h8M8 12.5h5"/></svg>',
    sun: '<svg viewBox="0 0 48 48"><circle cx="24" cy="24" r="8.5"/><path d="M24 6v5M24 37v5M6 24h5M37 24h5M11.3 11.3l3.5 3.5M33.2 33.2l3.5 3.5M11.3 36.7l3.5-3.5M33.2 14.8l3.5-3.5"/></svg>'
  };
  const ORD = ['One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight'];

  /* maps + calendar */
  const mapsQuery = ev => isPh(ev.venue) ? 'Kerala, India' : `${ev.venue}, ${ev.address}`;
  const mapsLink = ev => ev.maps || `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(mapsQuery(ev))}`;
  const utc = iso => new Date(iso).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  function addToCalendar(ev) {
    const title = `${couple} — ${ev.name}`, loc = `${ev.venue}, ${ev.address}`;
    if (/iPad|iPhone|iPod|Macintosh/.test(navigator.userAgent) && 'ontouchend' in document) {
      const ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//WeddingInvite//Invite//EN', 'BEGIN:VEVENT',
        `UID:${utc(ev.start)}-${ev.name.replace(/\W/g, '')}@invite`, `DTSTAMP:${utc(new Date().toISOString())}`,
        `DTSTART:${utc(ev.start)}`, `DTEND:${utc(ev.end)}`, `SUMMARY:${title}`, `LOCATION:${loc.replace(/,/g, '\\,')}`,
        'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
      const a = document.createElement('a');
      a.href = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' }));
      a.download = `${ev.name}.ics`; a.click();
    } else {
      open(`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${utc(ev.start)}/${utc(ev.end)}&location=${encodeURIComponent(loc)}`, '_blank', 'noopener');
    }
  }

  /* scalloped photo-print paper */
  function printPaper(wide = false) {
    const PW = wide ? 248 : 200, PH = wide ? 200 : 248;
    const x0 = 4, y0 = 4, x1 = PW - 4, y1 = PH - 4, r = 6.7;
    const nx = wide ? 19 : 15, ny = wide ? 15 : 19;
    let d = `M${x0},${y0}`;
    for (let i = 1; i <= nx; i++) d += ` A${r},${r} 0 0 1 ${(x0 + (x1 - x0) * i / nx).toFixed(2)},${y0}`;
    for (let i = 1; i <= ny; i++) d += ` A${r},${r} 0 0 1 ${x1},${(y0 + (y1 - y0) * i / ny).toFixed(2)}`;
    for (let i = 1; i <= nx; i++) d += ` A${r},${r} 0 0 1 ${(x1 - (x1 - x0) * i / nx).toFixed(2)},${y1}`;
    for (let i = 1; i <= ny; i++) d += ` A${r},${r} 0 0 1 ${x0},${(y1 - (y1 - y0) * i / ny).toFixed(2)}`;
    const id = 'pp' + Math.random().toString(36).slice(2, 7);
    return `<svg class="paper" viewBox="0 0 ${PW} ${PH}" preserveAspectRatio="none" aria-hidden="true">
      <defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fffaf0"/><stop offset="1" stop-color="#f1e4c9"/></linearGradient></defs>
      <path d="${d}Z" fill="url(#${id})" stroke="rgba(160,120,60,.35)" stroke-width=".6"/>
      <rect x="12" y="12" width="${PW - 24}" height="${PH - 24}" fill="none" stroke="#b48a42" stroke-width=".7" stroke-dasharray="1 2.2" opacity=".75"/>
    </svg>`;
  }

  /* venue card: a hand-drawn route instead of an embedded Google map
     (house style: never embed the Maps iframe; draw the way, link out for directions) */
  function routeArt() {
    const evs = C.events.slice(0, 2);
    const hm = ev => fmt(new Date(ev.start), { hour: 'numeric', minute: '2-digit', hour12: true }).replace(':00', '').toUpperCase();
    const tree = (x, y, s = 1) => `<g class="tree" transform="translate(${x} ${y}) scale(${s})"><path d="M0 0v-9"/><circle cx="0" cy="-12" r="5.5"/><circle cx="-4" cy="-8" r="4"/><circle cx="4.2" cy="-8.5" r="4"/></g>`;
    const palm = (x, y, s = 1) => `<g class="palm" transform="translate(${x} ${y}) scale(${s})"><path d="M0 0c1-6 0-12-2-18"/><path d="M-2-18c-5-2-9 0-11 3M-2-18c-4-4-8-5-12-4M-2-18c3-4 8-5 12-3M-2-18c4-1 8 1 10 5M-2-18c0-4-1-7-4-9"/></g>`;
    const pin = (i, x, y, gold, glyph, label, time, lx, ly, anchor) => `
      <g class="mpin${gold ? ' gold' : ''}" data-vtab="${i}" transform="translate(${x} ${y})">
        <ellipse class="halo" cx="0" cy="0" rx="11" ry="4.5"/>
        <path class="pdrop" d="M0 0C-4-7-11-12-11-20A11 11 0 1 1 11-20C11-12 4-7 0 0Z"/>
        <g class="glyph" transform="translate(0 -20)">${glyph}</g>
        <text class="plabel" x="${lx}" y="${ly}" text-anchor="${anchor}">${esc(label.toUpperCase())}</text>
        <text class="ptime" x="${lx}" y="${ly + 12}" text-anchor="${anchor}">${esc(time)}</text>
      </g>`;
    const CHURCH = '<path d="M0-6.5v13M-4.2-2.5h8.4"/>';
    const GLASS = '<path d="M-3.5-5.5h7l-.6 4a2.9 2.9 0 0 1-5.8 0zM0 1.4v4M-2.4 5.4h4.8"/>';
    return `<svg class="routemap" viewBox="0 0 320 210" data-active="0" role="img" aria-label="Illustrated route between the venues">
      <path class="water" d="M-10 178C40 162 82 198 142 186S252 160 330 182V220H-10Z"/>
      <path class="wave" d="M26 198q7-3.5 14 0t14 0M170 196q7-3.5 14 0t14 0M262 186q7-3.5 14 0t14 0M98 208q7-3.5 14 0t14 0"/>
      <g class="boat" transform="translate(222 197)"><path d="M-11 0h22l-4 4h-14z"/><path d="M0 0v-11l7 9"/></g>
      <path class="lane" d="M-10 52C40 60 70 44 128 62S200 92 232 97M150 210C156 180 170 150 165 122M290 0C286 30 300 60 296 84"/>
      <g class="roads">
        <path class="edge" d="M-10 118C50 100 100 140 165 122S270 78 330 88M232 97C238 86 244 74 246 62M104 121C98 134 90 146 84 156"/>
        <path class="road" d="M-10 118C50 100 100 140 165 122S270 78 330 88M232 97C238 86 244 74 246 62M104 121C98 134 90 146 84 156"/>
        <path class="mid" d="M-10 118C50 100 100 140 165 122S270 78 330 88"/>
      </g>
      ${tree(36, 84)}${tree(48, 88, .8)}${tree(150, 92, .9)}${tree(204, 152)}${tree(282, 120, .85)}${tree(268, 44, .8)}
      ${palm(28, 176, .9)}${palm(134, 180)}${palm(300, 176, .85)}
      <path class="journey" d="M246 62C244 74 238 86 232 97S200 112 165 122S118 118 104 121S90 146 84 156"/>
      <text class="town" x="14" y="30">Kottayam</text>
      <g class="compass" transform="translate(298 26)"><circle r="10"/><path d="M0-7l2.6 7H-2.6z"/><text y="-12.5" text-anchor="middle">N</text></g>
      ${evs[0] ? pin(0, 246, 62, false, CHURCH, evs[0].name, hm(evs[0]), -16, -30, 'end') : ''}
      ${evs[1] ? pin(1, 84, 156, true, GLASS, evs[1].name, hm(evs[1]), 16, -16, 'start') : ''}
    </svg>`;
  }

  /* burgundy wax seal with gold initials */
  // the couple's own wax seal (photo, cut out to transparent webp; original in source-art/wax-seal-jc.webp)
  const waxSeal = () => `<img class="wax" src="assets/img/wax-seal.webp" width="560" height="560" alt="" decoding="async">`;
  function waxSealSvg() {   // older drawn seal, kept as a fallback
    let d = '';
    for (let i = 0, N = 30; i <= N; i++) {
      const a = (i / N) * Math.PI * 2;
      const r = 46 + Math.sin(a * 5 + 1.3) * 1.7 + Math.sin(a * 9) * 1.1 + (i % 3 === 0 ? 1.3 : 0);
      d += (i ? 'L' : 'M') + (50 + Math.cos(a) * r).toFixed(2) + ',' + (50 + Math.sin(a) * r).toFixed(2);
    }
    const id = 'w' + Math.random().toString(36).slice(2, 7);
    return `<svg viewBox="0 0 100 100" aria-hidden="true"><defs>
      <radialGradient id="${id}a" cx="36%" cy="30%" r="78%"><stop offset="0" stop-color="#c45a70"/><stop offset=".36" stop-color="#982b42"/><stop offset=".76" stop-color="#6e1a2d"/><stop offset="1" stop-color="#4a0f1d"/></radialGradient>
      <radialGradient id="${id}b" cx="60%" cy="65%" r="60%"><stop offset="0" stop-color="#7a1e33"/><stop offset="1" stop-color="#a8384f"/></radialGradient></defs>
      <path d="${d}Z" fill="url(#${id}a)"/>
      <circle cx="50" cy="50" r="33" fill="url(#${id}b)" stroke="#5a1424" stroke-width="1.2"/>
      <circle cx="50" cy="50" r="29.5" fill="none" stroke="#e8c98a" stroke-width=".6" opacity=".7" stroke-dasharray="1 2.3"/>
      <text x="43" y="59" font-family="Tangerine" font-weight="700" font-size="31" text-anchor="middle" fill="#e2c07a">${esc(C.initials[0])}</text>
      <text x="58" y="65" font-family="Tangerine" font-weight="700" font-size="31" text-anchor="middle" fill="#e2c07a">${esc(C.initials[1])}</text>
    </svg>`;
  }

  /* ── scenes ──────────────────────────────────────────── */
  const guest = (params.get('to') || '').trim().slice(0, 60) || C.defaultGuest;
  const dayLong = fmt(D, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).replace(/^(\w+)/, '$1,').replace(',,', ',');
  const timeStr = fmt(D, { hour: 'numeric', minute: '2-digit', hour12: true }).replace(':00', '').toUpperCase();
  const [Y, M, DAY] = new Intl.DateTimeFormat('en-CA', { ...IST, year: 'numeric', month: '2-digit', day: '2-digit' }).format(D).split('-').map(Number);
  const dots = `${String(DAY).padStart(2, '0')} · ${String(M).padStart(2, '0')} · ${Y}`;
  const ev0 = C.events[0];

  function calendar() {
    const first = new Date(Date.UTC(Y, M - 1, 1)).getUTCDay();
    const days = new Date(Date.UTC(Y, M, 0)).getUTCDate();
    let cells = '';
    for (let i = 0; i < first; i++) cells += '<span></span>';
    for (let d = 1; d <= days; d++) {
      cells += d === DAY
        // the heart rests just outside the grid, level with the day (left or right side,
        // whichever is nearer), so the trail never has to cut across other dates
        ? `<span class="is-day"><b>${d}</b><i data-stop style="position:absolute;left:${(first + d - 1) % 7 < 3 ? -((first + d - 1) % 7) * 100 - 72 : (7 - (first + d - 1) % 7) * 100 + 72}%;top:50%;width:1px;height:1px"></i></span>`
        : `<span>${d}</span>`;
    }
    return `<div class="calendar fade rv" style="--d:.35s"><div class="wd">${'SMTWTFS'.split('').map(c => `<span>${c}</span>`).join('')}</div><div class="grid">${cells}</div></div>`;
  }

  const SCENES = [
    { id: 'opening', label: 'The Invitation', fixed: true, html: `
      ${art('arch').replace('class="art"', 'class="art arch"')}
      <i data-stop data-hang style="position:absolute;left:50%;top:calc(var(--t) + var(--a) * .312);width:1px;height:1px"></i>
      <div class="copy layer-text">
        <p class="eyebrow track rv" style="--d:.7s;--tr:.17em">Together with their families</p>
        <h1 class="names">
          <span class="script"><span class="ink rv" style="--d:1.1s">${esc(C.groom.name)}</span></span>
          <span class="weds track rv" style="--d:1.9s;--tr:.4em">weds</span>
          <span class="script"><span class="ink rv" style="--d:2.2s">${esc(C.bride.name)}</span></span>
        </h1>
        <p class="tagline words rv" style="--d:2.9s">${words(C.tagline)}</p>
      </div>
      <div class="date layer-text"><span class="caps track rv" style="--d:3.3s;--tr:.34em">${dots}</span><span class="sub fade rv" style="--d:3.7s">${esc(dayLong)}</span></div>` },

    { id: 'welcome', label: 'Welcome', fixed: true, html: `
      <div class="col l grow rv" style="--d:.2s">${art('column')}</div>
      <div class="col r grow rv" style="--d:.35s">${art('column')}</div>
      <div class="couple rv">${art('couple-lake')}</div>
      <div class="copy layer-text">
        <i data-stop style="position:absolute;right:3cqw;top:2cqh;width:1px;height:1px"></i>
        <p class="hello script"><span class="ink rv" style="--d:.2s">Welcome</span></p>
        <p class="dear rise rv" style="--d:.7s">Dear <b>${esc(guest)}</b></p>
        <p class="fullnames rise rv" style="--d:1s">${t(C.groom.full)}<span class="amp">&amp;</span>${t(C.bride.full)}</p>
        <p class="body words rv" style="--d:1.4s">${words(C.welcome.join('\n'))}</p>
        <div class="when"><strong class="rise rv" style="--d:2s">${esc(dayLong)}</strong><span class="caps track rv" style="--d:2.2s;--tr:.3em">${esc(timeStr)} onwards</span>${C.welcomePlace ? `<span class="place fade rv" style="--d:2.4s">${t(C.welcomePlace)}</span>` : ''}</div>
      </div>` },

    { id: 'savedate', label: 'Save the Date', fixed: true, html: `
      <div class="altar rise rv" style="--d:.6s">${art('altar')}</div>
      <div class="copy layer-text">
        <h2 class="title track rv" style="--tr:.22em">Save the Date</h2>
        ${calendar()}
        <p class="month track rv" style="--d:.9s;--tr:.2em">${esc(fmt(D, { month: 'long' }))} ${Y}</p>
        <p class="event track rv" style="--d:1.2s;--tr:.18em">${esc(ev0.name)}</p>
        <p class="time rise rv" style="--d:1.5s">${esc(timeStr)} onwards</p>
        <p class="venue rise rv" style="--d:1.7s">${t(ev0.venue)}${isPh(ev0.address) && isPh(ev0.venue) ? '' : ', ' + t(ev0.address)}</p>
        <div class="countdown fade rv" style="--d:2s" data-countdown>
          <div><b data-cd="d">00</b><span>Days</span></div><div><b data-cd="h">00</b><span>Hours</span></div>
          <div><b data-cd="m">00</b><span>Mins</span></div><div><b data-cd="s">00</b><span>Secs</span></div>
        </div>
      </div>` },

    { id: 'story', label: 'Our Story', html: `
      <header class="vhead layer-text">
        <p class="eyebrow track rv" style="--tr:.3em">${esc(C.story.eyebrow)}</p>
        <h2 class="script"><span class="ink rv" style="--d:.3s">Our Story</span></h2>
        <p class="quote words rv" style="--d:.9s">${words(C.story.quote)}</p>
      </header>
      ${C.story.chapters.map((ch, i) => `
      <div class="beat chapter ${i % 2 ? 'is-right' : 'is-left'}">
        <article class="print rb">
          <div class="print-frame" style="--tilt:${i % 2 ? 2.4 : -2.2}deg">
            ${printPaper()}
            ${ch.photo
              ? `<div class="ph-photo"><img src="${esc(ch.photo)}" alt="" loading="lazy" style="object-position:${esc(ch.focus || '50% 40%')}"></div>`
              : `<div class="ph-photo ph-empty"><svg viewBox="0 0 120 120" aria-hidden="true"><path d="M44 52c-8-7-20-1-17 9 2 7 10 12 17 17 7-5 15-10 17-17 3-10-9-16-17-9z"/><path d="M78 40c-6-5-15-1-13 7 1 5 7 9 13 13 6-4 12-8 13-13 2-8-7-12-13-7z"/><path class="notes" d="M88 74v16a4 4 0 1 1-3-4V74l12-3v15a4 4 0 1 1-3-4V76zM30 88c8 6 20 8 30 4M66 98c6 2 13 1 18-2"/></svg><span>Photo coming soon</span></div>`}
            <i class="mount tl"></i><i class="mount tr"></i><i class="mount bl"></i><i class="mount br"></i>
            <p class="cap"><span class="ink rb" style="--d:.6s">Chapter ${ORD[i] || i + 1}</span></p>
          </div>
          <p class="title words rb" style="--d:.9s">${words(ch.title)}</p>
          ${ch.text ? `<p class="blurb fade rb" style="--d:1.2s">${t(ch.text)}</p>` : `<p class="meta fade rb" style="--d:1.2s">${t(ch.place)} · ${t(ch.year)}</p>`}
        </article>
        <div class="emblem rb">${LEAF('l')}<div class="ring"><i class="stop" data-stop data-swing="${i % 2 ? 'l' : 'r'}"></i></div>${LEAF('r')}</div>
      </div>`).join('')}` },

    { id: 'families', label: 'With Families', html: `
      <header class="vhead layer-text">
        <h2 class="script" style="font-size:min(14cqw,6.6cqh)"><span class="ink rv">Two Families,</span><br><span class="ink rv" style="--d:.5s">One Heart</span></h2>
        <p class="quote words rv" style="--d:1s">${words('Where two worlds embrace in love, honour and joy')}</p>
      </header>
      ${[['Groom’s family', C.groom, 'son'], ['Bride’s family', C.bride, 'daughter']].map(([who, p, rel], i) => `
      <div class="beat">
        <div class="fam">
          <p class="who track rb" style="--tr:.26em">${who}</p>
          <p class="parents rise rb" style="--d:.3s">${t(p.parents)}</p>
          <p class="invite words rb" style="--d:.6s">${words(`cordially invite you to celebrate the wedding of their beloved ${rel}`)}</p>
          <p class="child script"><span class="ink rb" style="--d:1.1s">${esc(p.name)}</span></p>
          <p class="house fade rb" style="--d:1.5s">${t(p.house)}</p>
          <p class="line fade rb" style="--d:1.8s">“${t(p.line)}”</p>
        </div>
        <div class="emblem rb">${LEAF('l')}<div class="ring"><i class="stop" data-stop data-swing="${i ? 'r' : 'l'}"></i></div>${LEAF('r')}</div>
      </div>`).join('')}
      ${(C.familyPhotos || []).length ? `
      <div class="beat fam-photos">
        <div class="fam"><p class="who track rb" style="--tr:.26em">Both our families</p></div>
        <div class="snaps">${C.familyPhotos.map((ph, i) => `
          <div class="snap rb" style="--d:${.25 + i * .35}s">
            <div class="print-frame wide" style="--tilt:${i % 2 ? 2.2 : -1.8}deg">
              ${printPaper(true)}
              <div class="ph-photo"><img src="${esc(ph.photo)}" alt="" loading="lazy" style="object-position:${esc(ph.focus || '50% 45%')}"></div>
              <i class="mount tl"></i><i class="mount tr"></i><i class="mount bl"></i><i class="mount br"></i>
            </div>
          </div>`).join('')}
        </div>
        <div class="emblem rb">${LEAF('l')}<div class="ring"><i class="stop" data-stop data-swing="r"></i></div>${LEAF('r')}</div>
      </div>` : ''}` },

    { id: 'ceremonies', label: 'The Ceremonies', html: `
      <div class="corner drop rv">${art('corner')}</div>
      <div class="bells drop rv" style="--d:.3s">${art('bells')}</div>
      <header class="vhead layer-text">
        <h2 class="script"><span class="ink rv" style="--d:.4s">Ceremonies</span></h2>
        <p class="quote words rv" style="--d:1s">${words((C.lines || {}).ceremonies || 'Join us as we say “I do” before God and those we love')}</p>
      </header>
      ${C.events.map((ev, i) => {
        const s = new Date(ev.start);
        // one event per view: painting, then the facts, centred, with room to breathe
        return `
      <div class="beat">
        <div class="evc">
          <div class="ev-art bloom rb">
            <p class="num">${String(i + 1).padStart(2, '0')}</p>
            <div class="pic"><span class="glow"></span>${art(ev.art || 'chapel')}</div>
          </div>
          <h3 class="rise rb" style="--d:.3s">${esc(ev.name)}</h3>
          <p class="when rise rb" style="--d:.45s">${esc(fmt(s, { weekday: 'long', day: 'numeric', month: 'long' }))} · ${esc(fmt(s, { hour: 'numeric', minute: '2-digit', hour12: true }).toUpperCase())}</p>
          <p class="where rise rb" style="--d:.6s">${t(ev.venue)}<small>${t(ev.address)}</small></p>
          ${ev.dress ? `<p class="dress rise rb" style="--d:.7s">Dress code · ${t(ev.dress)}</p>` : ''}
          <div class="acts rise rb" style="--d:.85s">
            <a class="pill pill-gold" href="${esc(mapsLink(ev))}" target="_blank" rel="noopener">${ICON.pin}Directions</a>
            <button class="pill pill-line" data-cal="${i}">${ICON.cal}Save to calendar</button>
          </div>
        </div>
        <div class="emblem rb">${LEAF('l')}<div class="ring"><i class="stop" data-stop data-swing="${i % 2 ? 'l' : 'r'}"></i></div>${LEAF('r')}</div>
      </div>`; }).join('')}` },

    { id: 'venue', label: 'Where Forever Begins', fixed: true, cls: 'vscene-lite', html: `
      <header class="vhead layer-text">
        <p class="eyebrow track rv" style="--tr:.3em">The venue</p>
        <h2 class="script" style="font-size:min(15cqw,7cqh)"><span class="ink rv" style="--d:.3s">Where Forever Begins</span></h2>
      </header>
      ${C.events.length > 1 ? `<div class="tabs fade rv" style="--d:.8s">${C.events.map((ev, i) => `<button data-vtab="${i}" aria-pressed="${!i}">${esc(ev.name.split(' ').pop())}</button>`).join('')}</div>` : ''}
      <div class="mapcard bloom rv" style="--d:.5s">
        <i class="pinstop" data-stop></i>
        ${routeArt()}
        <p class="map-note">Illustration · not to scale</p>
        <p class="vname"></p><p class="vaddr"></p>
        <div class="acts"><a class="pill pill-gold pill-dir" data-dir target="_blank" rel="noopener">${ICON.pin}Get directions on Google Maps</a></div>
      </div>` },

    { id: 'goodtoknow', label: 'Good to Know', html: (() => {
      const I = C.info || {}, w = I.weather || {};
      const notes = (I.notes || []).filter(n => n.text);
      const fill = txt => t(txt).replace('{hashtag}', `<b class="hashtag">${esc(C.hashtag)}</b>`);
      return `
      <header class="vhead layer-text">
        <p class="eyebrow track rv" style="--tr:.3em">Before you pack</p>
        <h2 class="script"><span class="ink rv" style="--d:.3s">Good to Know</span></h2>
        <p class="quote words rv" style="--d:.9s">${words('A few little things to make the day easy')}</p>
      </header>
      <div class="beat">
        <article class="note note-sun rise rb">
          <div class="sun">${ICON.sun}</div>
          <p class="kick">${esc(w.title || 'Weather')}</p>
          <p class="temp">${esc(w.temp || '')}</p>
          <p class="sub">${esc(w.sub || '')}</p>
          <p class="body">${t(w.text || '')}</p>
          ${(w.tips || []).length ? `<div class="chips">${w.tips.map(x => `<span>${esc(x)}</span>`).join('')}</div>` : ''}
          <div class="forecast" hidden></div>
        </article>
        <div class="emblem rb">${LEAF('l')}<div class="ring"><i class="stop" data-stop data-swing="r"></i></div>${LEAF('r')}</div>
      </div>
      <div class="beat">
        <article class="note note-list rise rb">
          ${notes.map(n => `
          <div class="row">${ICON[n.icon] || ICON.chat}<div>
            <h3>${esc(n.title)}</h3><p>${fill(n.text)}</p>
            ${n.icon === 'camera' ? `<button type="button" class="pill pill-line copy-tag">Copy ${esc(C.hashtag)}</button>` : ''}
            ${n.icon === 'chat' ? '<a class="pill pill-gold wa" target="_blank" rel="noopener" hidden></a>' : ''}
          </div></div>`).join('')}
        </article>
        <div class="emblem rb">${LEAF('l')}<div class="ring"><i class="stop" data-stop data-swing="l"></i></div>${LEAF('r')}</div>
      </div>`; })() },

    { id: 'rsvp', label: 'Will You Join Us', fixed: true, cls: 'formscene', html: `
      <header class="vhead layer-text">
        <p class="eyebrow track rv" style="--tr:.3em">Kindly reply by ${esc(fmt(new Date(C.rsvpBy + 'T12:00:00+05:30'), { day: 'numeric', month: 'long' }))}</p>
        <h2 class="script" style="font-size:min(15cqw,7cqh)"><span class="ink rv" style="--d:.3s">Will You<br>Join Us?</span></h2>
        ${(C.lines || {}).rsvp ? `<p class="rsvp-line fade rv" style="--d:.7s">${t(C.lines.rsvp)}</p>` : ''}
      </header>
      <div class="draw-heart"><svg viewBox="0 0 160 145"><path pathLength="1" d="M80 24C106 2 146 16 146 50c0 30-34 58-66 82C48 108 14 80 14 50 14 16 54 2 80 24z"/></svg><i class="stop" data-stop></i></div>
      <div class="paper-card rise rv" style="--d:.6s">
        <form novalidate>
          <label class="field"><span>Your name</span><input name="name" autocomplete="name" placeholder="As it should appear on the guest list" maxlength="80"></label>
          <div class="field"><span class="label">Will you attend?</span>
            <div class="choice" data-group="attending"><button type="button" data-v="yes" aria-pressed="true">Joyfully accept</button><button type="button" data-v="no" aria-pressed="false">Regretfully decline</button></div></div>
          <div class="row2 if-yes">
            <div><span class="label">Guests</span><div class="stepper"><button type="button" data-step="-1" aria-label="Fewer guests">−</button><output>1</output><button type="button" data-step="1" aria-label="More guests">+</button></div></div>
            <div><span class="label">Attending</span><div class="choice" data-group="events" data-multi>${C.events.map(ev => `<button type="button" data-v="${esc(ev.name)}" aria-pressed="true">${esc(ev.name.split(' ').pop())}</button>`).join('')}</div></div>
          </div>
          <label class="field" style="margin-top:1.5cqh"><span>A note for the couple <i style="text-transform:none;letter-spacing:0">(optional)</i></span><textarea name="message" rows="2" maxlength="300" placeholder="Your wishes…"></textarea></label>
          <div class="submit-row"><span class="note-by">${C.sheetUrl ? '' : 'Preview: replies are not saved yet'}</span><button class="btn btn-wine submit" type="submit"><span>Send RSVP</span></button></div>
        </form>
        <div class="done"><p class="script" data-done-title></p><p data-done-text></p></div>
      </div>` },

    { id: 'blessing', label: 'Leave a Blessing', fixed: true, cls: 'formscene', html: `
      <header class="vhead layer-text">
        <p class="eyebrow track rv" style="--tr:.3em">For the couple</p>
        <h2 class="script" style="font-size:min(15cqw,7cqh)"><span class="ink rv" style="--d:.3s">Leave a Blessing</span></h2>
        <p class="quote words rv" style="--d:.9s">${words('A few words they will keep forever')}</p>
      </header>
      <div class="paper-card bless-card rise rv" style="--d:.6s;margin-top:3.4cqh">
        <i data-stop style="position:absolute;left:50%;top:-1.2cqw;width:1px;height:1px"></i>
        <form novalidate>
          <label class="field"><span>Your blessing</span><textarea name="message" rows="4" maxlength="280" placeholder="May your home be filled with…"></textarea></label>
          <div class="submit-row" style="align-items:flex-end">
            <label class="field" style="flex:1;margin-top:0"><span>From</span><input name="name" autocomplete="name" maxlength="60" placeholder="Your name"></label>
            <button class="seal-btn submit" type="submit" aria-label="Seal and send your blessing">${waxSeal()}<small>Seal &amp; send</small></button>
          </div>
        </form>
        <div class="stamp">${waxSeal()}</div>
      </div>
      <p class="preview-note fade rv" style="--d:1s">${C.sheetUrl ? '' : 'Preview: blessings stay on this device until the Sheet is connected'}</p>` },

    { id: 'wishes', label: 'Warm Blessings', fixed: true, html: `
      <header class="vhead layer-text">
        <p class="eyebrow track rv" style="--tr:.3em">From the people we love</p>
        <h2 class="script" style="font-size:min(16cqw,7.4cqh)"><span class="ink rv" style="--d:.3s">Warm Blessings</span></h2>
      </header>
      <div class="emblem fade rv" style="height:7cqh">${LEAF('l')}<div class="ring"><i class="stop" data-stop></i></div>${LEAF('r')}</div>
      <div class="wall fade rv" style="--d:.6s;margin-top:0"><div class="wall-track"></div><p class="wall-empty" hidden>Be the first to leave a blessing.</p></div>` },

    { id: 'thanks', label: 'Thank You', fixed: true, html: `
      <div class="watercolour fade rv" style="--d:.3s"><img src="assets/img/thanks-watercolour.webp" width="1100" height="1474" alt="" loading="lazy" decoding="async"></div>
      <div class="corner-a drop rv">${art('corner')}</div>
      <div class="copy">
        <p class="big script"><span class="ink rv" style="--d:.2s">Thank You</span></p>
        <p class="line words rv" style="--d:.9s">${words((C.lines || {}).closing || 'for being part of our story.\nWe can’t wait to celebrate with you.')}</p>
        <div class="heartstop"><i class="stop" data-stop></i></div>
        <p class="names script"><span class="ink rv" style="--d:1.6s">${esc(couple)}</span></p>
        <p class="tag track rv" style="--d:2.1s;--tr:.24em">${esc(C.hashtag)}</p>
        <div class="acts fade rv" style="--d:2.5s"><button class="btn btn-ghost" data-replay>Replay</button><button class="btn btn-wine" data-share>Share</button></div>
      </div>` }
  ];

  scenesEl.innerHTML = SCENES.map((s, i) =>
    `<section class="scene ${s.fixed ? 'fixed' : 'vscene'} ${s.id} ${s.cls || ''}" data-id="${s.id}" data-i="${i}" aria-label="${esc(s.label)}">${s.html}</section>`).join('');
  const sceneEls = $$('.scene', scenesEl);
  loadArt(sceneEls[0]);

  /* ── layout: scenes, stops, trail ────────────────────── */
  let W = 0, H = 0, S = 0;
  let stops = [];          // { el, scene, beat, x, y, camX, camY, len, hang }
  let total = 0, lead = [0, 0];

  /* ── trail routing ───────────────────────────────────────
     The trail must never run across words, cards or buttons. Everything
     readable is collected as a box; each hop between two stops tries a
     family of smooth routes (centripetal Catmull-Rom through a few
     waypoints) and keeps the one that crosses the least, then the shortest. */
  let routeSig = '', routePts = null, routeMs = 0;
  function collectObstacles(wr) {
    const out = [];
    const add = (r, w) => {
      if (r.width < 1 || r.height < 1) return;
      out.push({ x0: r.left - wr.left - 6, y0: r.top - wr.top - 6, x1: r.right - wr.left + 6, y1: r.bottom - wr.top + 6, w });
    };
    $$('.scene :is(p, h2, h3, li, .label, .field > span, .calendar span)').forEach(el => {
      if (el.closest('[hidden], .wall')) return;
      const rg = document.createRange(); rg.selectNodeContents(el);
      [...rg.getClientRects()].forEach(r => add(r, 1));
    });
    $$('.scene :is(.paper-card, .mapcard, .print-frame, .note, .btn, .pill, .countdown, .tabs, .wall)').forEach(el => add(el.getBoundingClientRect(), 1));
    $$('.scene :is(img, .leaf)').forEach(el => { if (!el.closest('.print-frame, .mapcard')) add(el.getBoundingClientRect(), el.classList.contains('leaf') ? 1.6 : .22); });
    return out;
  }
  function reflect(a, b) { return [2 * a[0] - b[0], 2 * a[1] - b[1]]; }
  function crSeg(p0, p1, p2, p3) {
    p0 = p0 || reflect(p1, p2); p3 = p3 || reflect(p2, p1);
    const d = (a, b) => Math.sqrt(Math.hypot(b[0] - a[0], b[1] - a[1])) || 1e-3;
    const d1 = d(p0, p1), d2 = d(p1, p2), d3 = d(p2, p3);
    const c1 = [0, 1].map(j => (d1 * d1 * p2[j] - d2 * d2 * p0[j] + (2 * d1 * d1 + 3 * d1 * d2 + d2 * d2) * p1[j]) / (3 * d1 * (d1 + d2)));
    const c2 = [0, 1].map(j => (d3 * d3 * p1[j] - d2 * d2 * p3[j] + (2 * d3 * d3 + 3 * d3 * d2 + d2 * d2) * p2[j]) / (3 * d3 * (d3 + d2)));
    return [c1, c2, p2];
  }
  function route({ stops, obs, worldH, S, W, H, SH }) {
    const heightAt = x => {
      const si = Math.floor(x / S), into = x - si * S;
      const h = i => SH[i] ?? H;
      return into <= W ? h(si) : Math.max(h(si), h(si + 1));
    };
    const G = 40, grid = new Map();
    obs.forEach(o => {
      for (let gx = Math.floor(o.x0 / G); gx <= Math.floor(o.x1 / G); gx++)
        for (let gy = Math.floor(o.y0 / G); gy <= Math.floor(o.y1 / G); gy++) {
          const key = gx * 4096 + gy; (grid.get(key) || grid.set(key, []).get(key)).push(o);
        }
    });
    const hops = [];
    for (let k = 1; k < stops.length; k++) {
      const A = stops[k - 1], B = stops[k];
      const a = [A.x, A.y], b = [B.x, B.y];
      const cost = (wps, limit, px) => {
        const L = [undefined, a, ...wps, b, undefined];
        let c = 0, len = 0;
        for (let i = 1; i < L.length - 2; i++) {
          const p1 = L[i], [c1, c2, p2] = crSeg(L[i - 1], p1, L[i + 1], L[i + 2]);
          const n = Math.max(4, Math.ceil(Math.hypot(p2[0] - p1[0], p2[1] - p1[1]) / px));
          let q = p1;
          for (let j = 1; j <= n; j++) {
            const t = j / n, u = 1 - t;
            const x = u * u * u * p1[0] + 3 * u * u * t * c1[0] + 3 * u * t * t * c2[0] + t * t * t * p2[0];
            const y = u * u * u * p1[1] + 3 * u * u * t * c1[1] + 3 * u * t * t * c2[1] + t * t * t * p2[1];
            const step = Math.hypot(x - q[0], y - q[1]); len += step; q = [x, y];
            if (Math.hypot(x - a[0], y - a[1]) < 34 || Math.hypot(x - b[0], y - b[1]) < 34) continue;
            const cell = grid.get(Math.floor(x / G) * 4096 + Math.floor(y / G));
            if (cell) for (const o of cell) if (x > o.x0 && x < o.x1 && y > o.y0 && y < o.y1) c += o.w * step;
            if (y < 10 || y > Math.min(worldH, heightAt(x)) - 10) c += .6 * step;
          }
          if (c + len * .02 > limit) return Infinity;
        }
        return c + len * .02 + wps.length * 4;
      };
      const C = [[]];
      if (A.scene === B.scene) {
        const left = A.scene * S, dy = B.y - A.y;
        const xs = [.05, .12, .25, .5, .75, .88, .95].map(f => left + W * f);
        // leave A level with it, just below it, or part-way down; arrive the same ways at B
        const ya = [A.y + 26, A.y + dy * .14, A.y + dy * .3], yb = [B.y, B.y + 26, B.y - dy * .14, B.y - dy * .3];
        xs.forEach(x => C.push([[x, A.y + dy * .5]]));
        ya.forEach(y1 => yb.forEach(y2 => xs.forEach(x1 => xs.forEach(x2 => C.push([[x1, y1], [x2, y2]])))));
      } else {
        const lA = A.scene * S, lB = B.scene * S, gx = lA + W + (S - W) / 2;
        const span = (y, h) => Array.from({ length: 9 }, (_, i) => Math.max(H * .04, Math.min(h - H * .04, y - H * .42 + H * .84 * i / 8)));
        const fine = y => [-34, -20, 20, 34].map(o => y + o);
        const yA = [...span(A.y, SH[A.scene]), ...fine(A.y)], yB = [...span(B.y, SH[B.scene]), ...fine(B.y)];
        yA.forEach(y => C.push([[gx, y]]));
        yA.forEach(y1 => yB.forEach(y2 => {
          C.push([[lA + W * .95, y1], [lB + W * .05, y2]]);
          C.push([[A.x, y1], [lA + W * .96, y1], [lB + W * .04, y2]]);
          C.push([[lA + W * .96, y1], [lB + W * .04, y2], [B.x, y2]]);
        }));
      }
      // coarse pass over every route; then, for the best few, try leaving A and
      // reaching B straight from just above or below (clear of the emblem leaves)
      const near = (p, s) => [null, [p.x, p.y + s * 50], [p.x - W * .13, p.y + s * 42], [p.x + W * .13, p.y + s * 42]];
      const ends = q => [...near(q, 1), ...near(q, -1).slice(1)];
      const top = C.map(wps => [cost(wps, Infinity, 30), wps]).sort((m, n) => m[0] - n[0]).slice(0, 8);
      const more = [];
      top.forEach(([, wps]) => ends(A).forEach(da => ends(B).forEach(ab => {
        if (!da && !ab) return;
        const w = [...(da ? [da] : []), ...wps, ...(ab ? [ab] : [])];
        more.push([cost(w, Infinity, 30), w]);
      })));
      const rough = [...top, ...more].sort((m, n) => m[0] - n[0]).slice(0, 14);
      let best = C[0], bestC = Infinity;
      for (const [, wps] of rough) { const c = cost(wps, bestC, 7); if (c < bestC) { bestC = c; best = wps; } }
      hops.push([a, ...best, b]);
    }
    return hops;
  }

  function layout() {
    const r = stage.getBoundingClientRect();
    W = r.width; H = r.height; S = Math.round(W * 1.45);
    stage.style.setProperty('--W', W + 'px');
    stage.style.setProperty('--H', H + 'px');
    sceneEls.forEach((s, i) => { s.style.left = i * S + 'px'; });
    const worldW = (sceneEls.length - 1) * S + W;
    const worldH = Math.max(H, ...sceneEls.map(s => s.offsetHeight));
    world.style.width = worldW + 'px'; world.style.height = worldH + 'px';
    trail.setAttribute('width', worldW); trail.setAttribute('height', worldH);

    // stops in reading order, measured with text at its final tracking
    stage.classList.add('is-measuring');
    const wr = world.getBoundingClientRect();
    stops = [];
    sceneEls.forEach((s, si) => {
      $$('[data-stop]', s).forEach((el, j) => {
        const b = el.getBoundingClientRect();
        const x = b.left - wr.left + b.width / 2, y = b.top - wr.top + b.height / 2;
        const maxY = Math.max(0, s.offsetHeight - H);
        // first stop of a scrolling scene sits lower, so the scene's heading stays in view
        const camY = s.classList.contains('fixed') ? 0 : Math.min(maxY, Math.max(0, y - H * (j ? 0.7 : 0.8)));
        stops.push({ el, scene: si, beat: el.closest('.beat'), x, y, camX: si * S, camY, swing: el.dataset.swing, hang: el.hasAttribute('data-hang') });
      });
    });
    const obs = collectObstacles(wr);
    stage.classList.remove('is-measuring');

    lead = [stops[0].x - W * 0.75, stops[0].y - H * 0.05];
    // re-route only when something actually moved (image loads usually change nothing)
    const sig = hash([ROUTE_V, W, H, worldH, ...stops.map(st => `${st.x | 0},${st.y | 0}`), ...obs.map(o => `${o.x0 | 0},${o.y0 | 0},${o.x1 | 0},${o.y1 | 0}`)].join('|'));
    if (sig !== routeSig) {
      routeSig = sig;
      const input = { stops: stops.map(s => ({ x: s.x, y: s.y, scene: s.scene })), obs, worldH, S, W, H, SH: sceneEls.map(e => e.offsetHeight) };
      const saved = cacheGet(sig);
      if (saved) routePts = saved;
      else if (background && routeWorker()) {
        // first visit: the heavy routing runs off the main thread while the intro plays
        routePts = null; routing = true;
        routeWorker().onmessage = e => {
          if (e.data.sig !== routeSig) return;
          routing = false; routePts = e.data.pts; routeMs = e.data.ms; cachePut(sig, routePts);
          buildTrail(); render();
          if (queued) { const q = queued; queued = null; go(...q); }
        };
        routeWorker().postMessage({ sig, input });
      } else {
        const t0 = performance.now(); routing = false; routePts = route(input); routeMs = performance.now() - t0; cachePut(sig, routePts);
      }
    }
    buildTrail();
  }

  /* each hop is its own small path: completed hops are plain dashes, the hop
     being travelled reveals its dashes up to the heart, later hops stay hidden.
     (Much cheaper than masking one path the size of the whole world.) */
  const hopEls = [], hopStart = [];
  let shownHop = -1;
  const f1 = n => n.toFixed(1);
  function buildTrail() {
    const segs = [`M${f1(lead[0])},${f1(lead[1])} C${f1(lead[0] + W * .3)},${f1(lead[1] - H * .12)} ${f1(stops[0].x - W * .25)},${f1(stops[0].y - H * .1)} ${f1(stops[0].x)},${f1(stops[0].y)}`];
    (routePts || []).forEach(list => {
      let sg = `M${f1(list[0][0])},${f1(list[0][1])}`;
      for (let i = 0; i < list.length - 1; i++) {
        const [c1, c2, p2] = crSeg(list[i - 1], list[i], list[i + 1], list[i + 2]);
        sg += ` C${f1(c1[0])},${f1(c1[1])} ${f1(c2[0])},${f1(c2[1])} ${f1(p2[0])},${f1(p2[1])}`;
      }
      segs.push(sg);
    });
    while (hopEls.length < segs.length) {
      const p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      p.setAttribute('class', 'trail-path'); trail.appendChild(p); hopEls.push(p);
    }
    while (hopEls.length > segs.length) { hopEls.pop().remove(); hopStart.pop(); }
    let acc = 0;
    stops.forEach(s => { s.len = undefined; });
    segs.forEach((d, k) => { hopEls[k].setAttribute('d', d); hopStart[k] = acc; acc += hopEls[k].getTotalLength(); stops[k].len = acc; });
    total = acc; shownHop = -1;
  }

  /* routing helpers: version, tiny hash, saved routes, worker */
  const ROUTE_V = 'r3';
  let routing = false, queued = null, background = false, worker;
  function hash(s) { let h = 5381; for (let i = 0; i < s.length; i++) h = (h * 33 ^ s.charCodeAt(i)) >>> 0; return h.toString(36) + s.length.toString(36); }
  function cacheGet(sig) { try { const c = JSON.parse(localStorage.getItem('jc-route')); return c && c.sig === sig ? c.pts : null; } catch (e) { return null; } }
  function cachePut(sig, pts) { try { localStorage.setItem('jc-route', JSON.stringify({ sig, pts })); } catch (e) {} }
  function routeWorker() {
    if (worker !== undefined) return worker;
    try {
      const src = `${reflect}\n${crSeg}\n${route}\nonmessage = e => { const t0 = performance.now(); const pts = route(e.data.input); postMessage({ sig: e.data.sig, pts, ms: performance.now() - t0 }); };`;
      worker = new Worker(URL.createObjectURL(new Blob([src], { type: 'text/javascript' })));
      worker.onerror = () => {   // fall back to routing here
        worker = null; if (!routing) return;
        routing = false; const sig = routeSig; routeSig = ''; background = false; layout(); render();
        if (queued) { const q = queued; queued = null; go(...q); }
      };
    } catch (e) { worker = null; }
    return worker;
  }

  /* ── state + rendering ───────────────────────────────── */
  const state = { len: 0, camX: 0, camY: 0 };
  let cur = -1, moving = false, tween = null;

  function render() {
    world.style.transform = `translate3d(${-state.camX}px, ${-state.camY}px, 0)`;
    paperBg.style.transform = `translate3d(${-(state.camX % 640)}px, ${-(state.camY % 964)}px, 0)`;
    const len = Math.max(0, Math.min(total, state.len));
    let k = hopStart.length - 1;
    while (k > 0 && hopStart[k] >= len) k--;
    if (k < 0) return;
    if (k !== shownHop) {
      hopEls.forEach((el, i) => { el.style.visibility = i <= k ? '' : 'hidden'; if (i < k) el.style.strokeDasharray = ''; });
      shownHop = k;
    }
    const l = len - hopStart[k], n = Math.floor(l / 9.5), rest = l - n * 9.5;
    hopEls[k].style.strokeDasharray = `${'4.5 5 '.repeat(n)}${Math.min(4.5, rest).toFixed(2)} 99999`;
    const p = hopEls[k].getPointAtLength(l);
    heart.style.transform = `translate3d(${p.x}px, ${p.y}px, 0)`;
    // only paint scenes near the camera
    const lo = state.camX - W * 1.1, hi = state.camX + W * 2.1;
    sceneEls.forEach((s, i) => s.classList.toggle('is-far', i * S + W < lo || i * S > hi));
  }

  const live = si => sceneEls[si].classList.add('is-live');
  const reach = st => st && st.beat && st.beat.classList.add('is-reached');

  function setHeartMode(mode) {
    heart.classList.toggle('is-hanging', mode === 'hang');
    heart.classList.toggle('is-idle', mode === 'idle');
  }

  function updateCtrl() {
    const next = stops[cur + 1];
    backBtn.hidden = cur <= 0;
    controls.classList.toggle('is-done', cur >= stops.length - 1);
    const label = $('span', nextBtn);
    controls.classList.toggle('is-compact', started);
    nextBtn.setAttribute('aria-label', started ? 'Continue' : 'Open invitation');
    if (moving) { if (!started) label.textContent = 'Following…'; nextBtn.classList.add('is-moving'); return; }
    nextBtn.classList.remove('is-moving');
    label.textContent = started ? 'Continue' : 'Open invitation';
    nextBtn.classList.toggle('is-down', !!next && cur >= 0 && next.scene === stops[cur].scene);
    // menu
    const si = stops[Math.max(0, cur)].scene;
    $$('#menuList button').forEach((b, i) => b.setAttribute('aria-current', String(i === si)));
  }

  function arrive(k) {
    const st = stops[k];
    $$('.beat.is-here').forEach(b => b.classList.remove('is-here'));
    if (st.beat) st.beat.classList.add('is-here');
    if (st.el.dataset.num) $('.heart-num', heart).textContent = st.el.dataset.num;
    heart.classList.toggle('has-num', !!st.el.dataset.num);
    setHeartMode(st.hang ? 'hang' : 'idle');
    HOOKS[SCENES[st.scene].id]?.arrive?.(sceneEls[st.scene], st);
  }

  function go(k, opts = {}) {
    const { instant = false } = opts;
    if (k < 0 || k >= stops.length) return;
    if (stops[k].len === undefined) { queued = [k, opts]; return; }   // route still being worked out
    if (tween) tween.kill();
    heart.classList.remove('has-num');
    const from = cur >= 0 ? stops[cur] : null, to = stops[k];
    const prevScene = from ? from.scene : -1;
    if (from && from.beat && k > cur) from.beat.classList.add('is-passed');
    cur = k;
    setHeartMode('move');
    if (prevScene !== to.scene && prevScene >= 0) HOOKS[SCENES[prevScene].id]?.leave?.(sceneEls[prevScene]);
    if (instant || reduce) {
      Object.assign(state, { len: to.len, camX: to.camX, camY: to.camY });
      live(to.scene); for (let j = 0; j <= k; j++) reach(stops[j]);
      render(); moving = false; arrive(k); updateCtrl(); return;
    }
    const s0 = { ...state }, dLen = Math.abs(to.len - s0.len);
    const dur = Math.min(3, 1.5 + dLen / 1800);
    const eHeart = gsap.parseEase('power2.inOut'), eCam = gsap.parseEase('power3.inOut');
    let liveDone = false, reachDone = false;
    moving = true; updateCtrl();
    const p = { v: 0 };
    tween = gsap.to(p, {
      v: 1, duration: dur, ease: 'none',
      onUpdate() {
        const a = eHeart(p.v), c = eCam(p.v);
        state.len = s0.len + (to.len - s0.len) * a;
        state.camX = s0.camX + (to.camX - s0.camX) * c;
        state.camY = s0.camY + (to.camY - s0.camY) * c;
        if (!liveDone && p.v > .4) { liveDone = true; live(to.scene); }
        if (!reachDone && p.v > .45) { reachDone = true; reach(to); }
        render();
      },
      onComplete() { moving = false; tween = null; arrive(k); updateCtrl(); if (pending) relayout(); }
    });
  }

  let started = false;
  function next() {
    if (moving) return;
    if (!started) { started = true; startMusic(); }
    if (HOOKS[SCENES[stops[cur]?.scene]?.id]?.next?.()) return;
    go(cur + 1);
  }
  function back() { if (!moving && cur > 0) go(cur - 1); }
  const firstStopOf = si => stops.findIndex(s => s.scene === si);

  /* ── scene hooks ─────────────────────────────────────── */
  const HOOKS = {};

  HOOKS.savedate = {
    init(s) {
      const cd = Object.fromEntries($$('[data-cd]', s).map(b => [b.dataset.cd, b]));
      const tick = () => {
        let ms = Math.max(0, D - Date.now());
        const d = Math.floor(ms / 864e5); ms -= d * 864e5;
        const h = Math.floor(ms / 36e5); ms -= h * 36e5;
        const m = Math.floor(ms / 6e4); ms -= m * 6e4;
        cd.d.textContent = String(d).padStart(2, '0'); cd.h.textContent = String(h).padStart(2, '0');
        cd.m.textContent = String(m).padStart(2, '0'); cd.s.textContent = String(Math.floor(ms / 1e3)).padStart(2, '0');
      };
      tick(); setInterval(tick, 1000);
    },
    arrive(s) { $('.calendar', s).classList.add('is-marked'); }
  };

  HOOKS.ceremonies = {
    init(s) { $$('[data-cal]', s).forEach(b => b.addEventListener('click', () => addToCalendar(C.events[+b.dataset.cal]))); }
  };

  HOOKS.venue = (() => {
    let s0, curTab = -1;
    function pick(i) {
      if (i === curTab) return; curTab = i;
      const ev = C.events[i];
      $$('.tabs [data-vtab]', s0).forEach(b => b.setAttribute('aria-pressed', String(+b.dataset.vtab === i)));
      $('.routemap', s0).dataset.active = i;
      $('.vname', s0).innerHTML = t(ev.venue);
      $('.vaddr', s0).innerHTML = t(ev.address);
      $('[data-dir]', s0).href = mapsLink(ev);
    }
    return {
      init(s) {
        s0 = s;
        $$('[data-vtab]', s).forEach(b => b.addEventListener('click', () => pick(+b.dataset.vtab)));
        pick(0);
      }
    };
  })();

  /* Sheet backend (Google Apps Script) */
  async function send(payload) {
    if (!C.sheetUrl) return { ok: true, preview: true };
    try {
      await fetch(C.sheetUrl, { method: 'POST', body: JSON.stringify(payload), headers: { 'Content-Type': 'text/plain;charset=utf-8' } });
      return { ok: true };
    } catch (e) { return { ok: false }; }
  }
  function choiceGroups(form) {
    $$('.choice', form).forEach(g => g.addEventListener('click', e => {
      const b = e.target.closest('button'); if (!b) return;
      if (g.hasAttribute('data-multi')) b.setAttribute('aria-pressed', String(b.getAttribute('aria-pressed') !== 'true'));
      else $$('button', g).forEach(x => x.setAttribute('aria-pressed', String(x === b)));
      g.dispatchEvent(new Event('change', { bubbles: true }));
    }));
  }
  const picked = (form, name) => $$(`[data-group="${name}"] [aria-pressed="true"]`, form).map(b => b.dataset.v);
  const shake = el => gsap.fromTo(el, { x: -7 }, { x: 0, duration: .55, ease: 'elastic.out(1,.3)' });
  const stagePoint = el => { const r = el.getBoundingClientRect(), s = stage.getBoundingClientRect(); return [r.left - s.left + r.width / 2, r.top - s.top + r.height / 2]; };

  HOOKS.goodtoknow = {
    init(s) {
      const I = C.info || {};
      const copy = $('.copy-tag', s);
      copy?.addEventListener('click', async () => {
        const label = copy.textContent;
        try { await navigator.clipboard.writeText(C.hashtag); copy.textContent = 'Copied ♥'; }
        catch (_) { copy.textContent = 'Press and hold to copy'; }
        setTimeout(() => { copy.textContent = label; }, 2200);
      });
      const c = I.contact || {}, wa = $('.wa', s);
      if (wa && c.whatsapp) {
        wa.href = `https://wa.me/${c.whatsapp.replace(/\D/g, '')}`;
        wa.innerHTML = `${ICON.chat}${esc(c.name ? `Message ${c.name}` : 'Chat on WhatsApp')}`;
        wa.hidden = false;
      }
      // live forecast for the wedding day, about two weeks out
      const f = I.forecast;
      if (!f || f.lat == null || f.lon == null) return;
      const away = (Date.parse(`${f.from}T00:00:00+05:30`) - Date.now()) / 864e5;
      if (away > 15 || away < -2) return;
      const q = new URLSearchParams({ latitude: f.lat, longitude: f.lon, timezone: 'Asia/Kolkata', start_date: f.from, end_date: f.to,
        daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max' });
      fetch(`https://api.open-meteo.com/v1/forecast?${q}`).then(r => r.ok ? r.json() : null).then(d => {
        const dl = d && d.daily; if (!dl) return;
        const sky = c => c === 0 ? 'Sunny' : c <= 2 ? 'Partly cloudy' : c === 3 ? 'Cloudy' : c <= 48 ? 'Hazy' : c >= 95 ? 'Thunderstorms' : (c >= 51 && c <= 67) || (c >= 80 && c <= 82) ? 'Showers' : 'Rain';
        const rows = dl.time.map((day, i) => dl.temperature_2m_max[i] == null ? '' :
          `<div><b>${esc(new Date(`${day}T12:00:00+05:30`).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', timeZone: 'Asia/Kolkata' }))}</b><span>${Math.round(dl.temperature_2m_max[i])}° / ${Math.round(dl.temperature_2m_min[i])}°</span><small>${sky(dl.weather_code[i])}${dl.precipitation_probability_max[i] != null ? ` · ${dl.precipitation_probability_max[i]}% rain` : ''}</small></div>`).join('');
        if (!rows) return;
        const box = $('.forecast', s);
        box.innerHTML = `<p class="fc-head">Forecast for the day</p><div class="fc-days">${rows}</div>`;
        box.hidden = false; relayout();
      }).catch(() => {});
    }
  };

  HOOKS.rsvp = {
    init(s) {
      const form = $('form', s), out = $('output', form), done = $('.done', s);
      choiceGroups(form);
      form.addEventListener('change', () => $('.if-yes', form).classList.toggle('is-off', picked(form, 'attending')[0] !== 'yes'));
      $$('[data-step]', form).forEach(b => b.addEventListener('click', () => { out.textContent = Math.min(12, Math.max(1, +out.textContent + +b.dataset.step)); }));
      form.addEventListener('submit', async e => {
        e.preventDefault();
        const F = k => form.elements.namedItem(k);
        const name = F('name').value.trim();
        if (!name) { F('name').focus(); shake(F('name')); return; }
        const attending = picked(form, 'attending')[0], yes = attending === 'yes';
        const btn = $('.submit', form); btn.disabled = true; $('span', btn).textContent = 'Sending…';
        const res = await send({ type: 'rsvp', name, attending, guests: yes ? +out.textContent : 0,
          events: yes ? picked(form, 'events').join(', ') : '', phone: '', message: F('message').value.trim() });
        $('[data-done-title]', done).textContent = yes ? 'See you there!' : 'You’ll be missed';
        $('[data-done-text]', done).textContent = res.preview
          ? `Thank you, ${name}. (Preview: this reply was not saved. Replies reach the couple once their Google Sheet is connected.)`
          : yes ? `Thank you, ${name}. We can’t wait to celebrate with you.` : `Thank you, ${name}. We’ll hold you close in our hearts on the day.`;
        gsap.to(form, { opacity: 0, y: -14, duration: .35, onComplete: () => {
          form.style.display = 'none'; done.classList.add('show');
          gsap.fromTo($$('p', done), { opacity: 0, y: 10 }, { opacity: 1, y: 0, stagger: .14, duration: .6 });
          $('.draw-heart', s).classList.add('is-filled');
          const [x, y] = stagePoint($('.draw-heart', s)); Petals.burst(x, y, 80, .8);
        } });
      });
    }
  };

  HOOKS.blessing = {
    init(s) {
      const form = $('form', s), card = $('.bless-card', s), stamp = $('.stamp', s);
      form.addEventListener('submit', async e => {
        e.preventDefault();
        const F = k => form.elements.namedItem(k);
        const name = F('name').value.trim(), message = F('message').value.trim();
        if (!message || !name) { (message ? F('name') : F('message')).focus(); shake(card); return; }
        const btn = $('.submit', form); btn.disabled = true;
        const b = { name, message, at: new Date().toISOString() };
        await send({ type: 'blessing', ...b });
        Wall.add(b);
        gsap.timeline()
          .fromTo(stamp, { opacity: 0, scale: 2.4, rotate: -30 }, { opacity: 1, scale: 1, rotate: -10, duration: .55, ease: 'back.out(2.4)' })
          .call(() => { const [x, y] = stagePoint(stamp); Petals.burst(x, y, 60, .7); })
          .to(card, { y: -24, opacity: 0, duration: .5, ease: 'power2.in' }, '+=.7')
          .call(() => { form.reset(); gsap.set(stamp, { opacity: 0 }); btn.disabled = false; })
          .to(card, { y: 0, opacity: 1, duration: .6, ease: 'power3.out' }, '+=.2')
          .call(() => { if (!moving && SCENES[stops[cur].scene].id === 'blessing') go(cur + 1); });
      });
    }
  };

  const Wall = (() => {
    const KEY = 'jc-blessings';
    let track, empty, marquee;
    const local = () => { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) { return []; } };
    function noteEl(b, i) {
      const n = document.createElement('div'); n.className = 'wnote';
      n.style.setProperty('--r', ((i * 37) % 7 - 3) * .9 + 'deg');
      const p = document.createElement('p'); p.textContent = b.message;
      const c = document.createElement('cite'); c.textContent = b.name;
      n.append(p, c); return n;
    }
    function loop() {
      if (marquee) marquee.kill();
      gsap.set(track, { y: 0 });
      const extra = track.scrollHeight - track.parentElement.clientHeight;
      if (extra > 10 && !reduce) marquee = gsap.to(track, { y: -extra, duration: extra / 16, ease: 'none', repeat: -1, yoyo: true, repeatDelay: 2 });
    }
    function render(list) { track.innerHTML = ''; list.forEach((b, i) => track.append(noteEl(b, i))); empty.hidden = list.length > 0; loop(); }
    return {
      async init(s) {
        track = $('.wall-track', s); empty = $('.wall-empty', s);
        if (!C.sheetUrl) return render(local());
        try {
          const r = await fetch(C.sheetUrl + (C.sheetUrl.includes('?') ? '&' : '?') + 'action=blessings');
          render((await r.json()).blessings || []);
        } catch (e) { render([]); }
      },
      add(b) {
        if (!C.sheetUrl) { const l = local(); l.unshift(b); try { localStorage.setItem(KEY, JSON.stringify(l.slice(0, 50))); } catch (e) {} }
        track.prepend(noteEl(b, track.children.length)); empty.hidden = true; loop();
      }
    };
  })();
  HOOKS.wishes = { init: s => Wall.init(s) };

  HOOKS.thanks = {
    init(s) {
      $('[data-replay]', s).addEventListener('click', () => { Petals.rain(0); $$('.is-live, .is-reached, .is-passed').forEach(e => e.classList.remove('is-live', 'is-reached', 'is-passed')); go(0); });
      $('[data-share]', s).addEventListener('click', async () => {
        const url = location.origin + location.pathname;
        if (navigator.share) { try { await navigator.share({ title: `${couple} · You are invited`, url }); } catch (e) {} }
        else { try { await navigator.clipboard.writeText(url); $('[data-share]', s).textContent = 'Link copied'; } catch (e) {} }
      });
    },
    arrive() { Petals.shower(50); Petals.rain(.25); },
    leave() { Petals.rain(0); }
  };

  sceneEls.forEach((s, i) => HOOKS[SCENES[i].id]?.init?.(s));

  /* ── menu ────────────────────────────────────────────── */
  const menu = $('#menu'), menuBtn = $('#menuBtn');
  $('#menuList').innerHTML = SCENES.map((s, i) => `<li><button data-go="${i}"><span class="num">${String(i + 1).padStart(2, '0')}</span>${esc(s.label)}<span class="here">♥</span></button></li>`).join('');
  function toggleMenu(on) {
    menu.hidden = !on; menuBtn.setAttribute('aria-expanded', String(on));
    if (on) gsap.fromTo('.menu-card', { opacity: 0, scale: .92 }, { opacity: 1, scale: 1, duration: .35, ease: 'back.out(1.6)' });
  }
  menuBtn.addEventListener('click', () => toggleMenu(menu.hidden));
  menu.addEventListener('click', e => {
    const b = e.target.closest('[data-go]');
    if (b) { toggleMenu(false); if (!started) { started = true; startMusic(); } go(firstStopOf(+b.dataset.go)); }
    else if (e.target === menu) toggleMenu(false);
  });

  /* ── input ───────────────────────────────────────────── */
  nextBtn.addEventListener('click', next);
  backBtn.addEventListener('click', back);
  addEventListener('keydown', e => {
    if (e.target.closest('input, textarea, button, a')) return;
    if (['ArrowRight', 'ArrowDown', ' ', 'PageDown', 'Enter'].includes(e.key)) { e.preventDefault(); next(); }
    if (['ArrowLeft', 'ArrowUp', 'PageUp'].includes(e.key)) { e.preventDefault(); back(); }
    if (e.key === 'Escape') toggleMenu(false);
  });
  let sw = null;
  stage.addEventListener('pointerdown', e => {
    if (e.target.closest('form, .map, .menu, .wall, a, button')) return;
    sw = [e.clientX, e.clientY, Date.now()];
  });
  stage.addEventListener('pointerup', e => {
    if (!sw) return;
    const dx = e.clientX - sw[0], dy = e.clientY - sw[1], dt = Date.now() - sw[2]; sw = null;
    if (dt > 700 || Math.max(Math.abs(dx), Math.abs(dy)) < 45) return;
    if (Math.abs(dx) > Math.abs(dy) ? dx < 0 : dy < 0) next(); else back();
  });

  /* ── music ───────────────────────────────────────────── */
  const music = $('#music'), musicBtn = $('#musicBtn');
  if (C.music) { music.src = C.music; musicBtn.hidden = false; }
  function startMusic() {
    if (!C.music) return;
    music.volume = 0; music.play().then(() => gsap.to(music, { volume: .55, duration: 2.5 })).catch(() => musicBtn.classList.add('is-muted'));
  }
  musicBtn.addEventListener('click', () => {
    if (music.paused) { music.play(); musicBtn.classList.remove('is-muted'); musicBtn.setAttribute('aria-label', 'Pause music'); }
    else { music.pause(); musicBtn.classList.add('is-muted'); musicBtn.setAttribute('aria-label', 'Play music'); }
  });

  /* ── boot ────────────────────────────────────────────── */
  // fonts and lazy photos can shift the layout after boot: re-measure when idle
  let pending = false, booted = false;
  let rlT;
  function relayout() { clearTimeout(rlT); rlT = setTimeout(doRelayout, 120); }
  function doRelayout() {
    if (!booted) return;
    if (moving) { pending = true; return; }
    pending = false; layout();
    if (cur >= 0) { const s = stops[cur]; Object.assign(state, { len: s.len, camX: s.camX, camY: s.camY }); render(); }
  }
  if (document.fonts) document.fonts.addEventListener('loadingdone', relayout);
  addEventListener('load', relayout);
  $$('img:not(.art)', scenesEl).forEach(i => i.addEventListener('load', relayout));

  let rt;
  addEventListener('resize', () => {
    clearTimeout(rt);
    rt = setTimeout(() => { if (tween) tween.progress(1); layout(); Petals.size(); if (cur >= 0) go(cur, { instant: true }); }, 160);
  });


  window.__journey = { go, stops: () => stops, state, layout, routeMs: () => routeMs, obstacles: () => { const wr = world.getBoundingClientRect(); stage.classList.add('is-measuring'); const o = collectObstacles(wr); stage.classList.remove('is-measuring'); return o; } };   // handy for testing

  const FONTS = ['700 40px Tangerine', '500 20px Cinzel', '600 20px Cinzel', '500 20px "Cormorant Garamond"', '600 20px "Cormorant Garamond"', 'italic 500 20px "Cormorant Garamond"', '600 12px Montserrat'];
  const ready = Promise.race([
    Promise.all([
      document.fonts ? Promise.all(FONTS.map(f => document.fonts.load(f).catch(() => {}))).then(() => document.fonts.ready) : Promise.resolve(),
      ...$$('img', sceneEls[0]).filter(i => !i.complete).map(i => new Promise(r => { i.onload = i.onerror = r; }))
    ]),
    new Promise(r => setTimeout(r, 6000))   // never hold the invite hostage to a slow file
  ]);
  ready.then(() => {
    const jump = SCENES.findIndex(s => '#' + s.id === location.hash);
    background = jump <= 0;
    layout(); booted = true; background = false;
    // the rest of the art streams in behind the intro, nearest scenes first
    sceneEls.slice(1, 3).forEach(loadArt);
    setTimeout(() => sceneEls.slice(3).forEach(loadArt), 700);
    // deep link: #story, #ceremonies … (handy for previews)
    if (jump > 0) { started = true; sceneEls.forEach((s, i) => { if (i <= jump) live(i); }); go(firstStopOf(jump), { instant: true }); return; }
    // intro: the heart flies in and comes to rest under the arch
    state.len = 0; state.camX = 0; state.camY = 0; render();
    live(0);
    moving = true; updateCtrl(); $('span', nextBtn).textContent = 'Open invitation'; nextBtn.classList.add('is-moving');
    gsap.to(state, { len: stops[0].len, duration: reduce ? 0 : 2.6, delay: reduce ? 0 : .7, ease: 'power2.inOut', onUpdate: render,
      onComplete() { cur = 0; moving = false; arrive(0); updateCtrl(); if (pending) relayout(); } });
  });
})();
