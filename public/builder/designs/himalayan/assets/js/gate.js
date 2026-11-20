/* The bell gate and the music. Ringing the bell is the guest's first tap, which is what lets
   the browser start audio. It fires `invite:open` when the scene should begin. */
(function () {
  const cfg = window.INVITE;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const skip = location.search.includes('skip');
  const root = document.documentElement;

  /* ---------- Music ---------- */
  const button = document.getElementById('music');
  const audio = new Audio();
  audio.src = cfg.music;
  audio.loop = true;
  audio.preload = 'auto';

  function paint(playing) {
    button.setAttribute('aria-pressed', String(playing));
    button.setAttribute('aria-label', playing ? 'Pause music' : 'Play music');
  }

  function play(fade) {
    audio.volume = fade ? 0 : .6;
    const started = audio.play();
    if (started) {
      started.then(() => {
        paint(true);
        if (fade) gsap.to(audio, { volume: .6, duration: 3.5, ease: 'sine.out' });
      }).catch(() => paint(false));
    }
  }

  button.addEventListener('click', () => {
    if (audio.paused) play(false);
    else {
      gsap.killTweensOf(audio);
      audio.pause();
      paint(false);
    }
  });

  /* ---------- The bell's sound, synthesised so there's no file to load ---------- */
  function strike() {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    const ctx = new AC();
    const now = ctx.currentTime;
    const out = ctx.createGain();
    out.gain.value = .32;
    out.connect(ctx.destination);
    [[523, 1, 3.2], [1046, .55, 2.4], [1568, .3, 1.7], [2437, .16, 1.1], [3400, .09, .7]].forEach(([f, level, decay], i) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.frequency.value = f * (1 + (i % 2 ? .0016 : -.0012));
      g.gain.setValueAtTime(0, now);
      g.gain.linearRampToValueAtTime(level, now + .006);
      g.gain.exponentialRampToValueAtTime(.0001, now + decay);
      o.connect(g).connect(out);
      o.start(now);
      o.stop(now + decay + .05);
    });
    setTimeout(() => ctx.close(), 3600);
  }

  /* ---------- The gate ---------- */
  const gate = document.getElementById('gate');
  const bell = document.getElementById('bell');
  const bellImg = bell.querySelector('img');

  function begin() {
    button.hidden = false;
    window.dispatchEvent(new Event('invite:open'));
  }

  if (skip) {
    gate.remove();
    button.hidden = false;
    paint(false);
    window.addEventListener('load', () => window.dispatchEvent(new Event('invite:open')));
    return;
  }

  window.scrollTo(0, 0);
  paint(false);

  let idle = null;
  if (!reduce) {
    gsap.set(bellImg, { rotation: -1.6 });
    idle = gsap.to(bellImg, { rotation: 1.6, duration: 2.2, ease: 'sine.inOut', yoyo: true, repeat: -1 });
  }

  let rung = false;
  function ring() {
    if (rung) return;
    rung = true;
    if (idle) idle.kill();
    play(true);
    strike();

    root.classList.add('opening');
    root.classList.remove('gated');

    if (reduce) {
      gate.remove();
      begin();
      return;
    }

    const tl = gsap.timeline({
      onComplete() {
        root.classList.remove('opening');
        gate.remove();
      },
    });

    tl.to(bellImg, { rotation: 8, duration: .16, ease: 'power2.out' })
      .to(bellImg, { rotation: -6.5, duration: .34, ease: 'sine.inOut' })
      .to(bellImg, { rotation: 5, duration: .32, ease: 'sine.inOut' })
      .to(bellImg, { rotation: -3, duration: .3, ease: 'sine.inOut' })
      .to(bellImg, { rotation: 0, duration: .28, ease: 'sine.out' });

    tl.fromTo('.ripples i', { scale: .06, opacity: .85 }, {
      scale: 1, opacity: 0, duration: 1.7, ease: 'power2.out', stagger: .22,
    }, .1);

    tl.to('.gate-hint', { opacity: 0, duration: .3 }, 0);
    tl.to('.toran-l', { xPercent: -105, duration: 1.3, ease: 'power3.inOut' }, .8);
    tl.to('.toran-r', { xPercent: 105, duration: 1.3, ease: 'power3.inOut' }, .8);
    tl.to(bell, { yPercent: -112, duration: 1.1, ease: 'power3.in' }, .95);
    tl.to(gate, { backgroundColor: 'transparent', opacity: 0, duration: 1, ease: 'sine.inOut' }, 1.35);
    tl.call(begin, null, 1.5);
  }

  bell.addEventListener('click', ring);
})();
