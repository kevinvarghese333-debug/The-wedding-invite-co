/* The sound bed is synthesised, so no audio file ships: sea wash, a low drone and slow plucked notes. */
window.Sound = (() => {
  let ctx, master, wet, timer, playing = false;
  const SCALE = [146.83, 164.81, 185, 220, 246.94, 293.66, 329.63, 370, 440, 493.88];   // D major pentatonic
  let step = 4;

  function noiseBuffer() {
    const b = ctx.createBuffer(1, ctx.sampleRate * 4, ctx.sampleRate), d = b.getChannelData(0);
    let last = 0; for (let i = 0; i < d.length; i++) { const w = Math.random() * 2 - 1; last = (last + .02 * w) / 1.02; d[i] = last * 3.5; }
    return b;
  }
  function sea() {
    const n = ctx.createBufferSource(); n.buffer = noiseBuffer(); n.loop = true;
    const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 520;
    const g = ctx.createGain(); g.gain.value = .16;
    const lfo = ctx.createOscillator(); lfo.frequency.value = .09;
    const depth = ctx.createGain(); depth.gain.value = .1; lfo.connect(depth); depth.connect(g.gain);
    n.connect(f); f.connect(g); g.connect(master); n.start(); lfo.start();
  }
  function drone() {
    [73.42, 110, 146.83].forEach((hz, i) => {
      const o = ctx.createOscillator(); o.type = 'sine'; o.frequency.value = hz;
      const g = ctx.createGain(); g.gain.value = [.05, .028, .018][i];
      const l = ctx.createOscillator(); l.frequency.value = .07 + i * .03;
      const d = ctx.createGain(); d.gain.value = g.gain.value * .5; l.connect(d); d.connect(g.gain);
      o.connect(g); g.connect(master); o.start(); l.start();
    });
  }
  function pluck(hz, when, level = .1) {
    const g = ctx.createGain(); g.gain.setValueAtTime(0, when); g.gain.linearRampToValueAtTime(level, when + .006); g.gain.exponentialRampToValueAtTime(.0001, when + 2.6);
    [[1, 1], [2.003, .38], [3.01, .14]].forEach(([m, a]) => {
      const o = ctx.createOscillator(); o.type = 'sine'; o.frequency.value = hz * m;
      const p = ctx.createGain(); p.gain.value = a; o.connect(p); p.connect(g); o.start(when); o.stop(when + 2.7);
    });
    g.connect(master); g.connect(wet);
  }
  function phrase() {
    if (!playing) return;
    step = Math.max(0, Math.min(SCALE.length - 1, step + [-2, -1, -1, 1, 1, 2][Math.random() * 6 | 0]));
    const now = ctx.currentTime + .05;
    pluck(SCALE[step], now, .085);
    if (Math.random() < .35) pluck(SCALE[Math.min(SCALE.length - 1, step + 2)], now + .24, .05);
    timer = setTimeout(phrase, 1100 + Math.random() * 1500);
  }
  function setup() {
    const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return false;
    ctx = new AC();
    master = ctx.createGain(); master.gain.value = 0; master.connect(ctx.destination);
    const delay = ctx.createDelay(1); delay.delayTime.value = .42;
    const fb = ctx.createGain(); fb.gain.value = .36; wet = ctx.createGain(); wet.gain.value = .34;
    wet.connect(delay); delay.connect(fb); fb.connect(delay); delay.connect(master);
    sea(); drone(); return true;
  }
  return {
    play() {
      if (!ctx && !setup()) return false;
      ctx.resume(); playing = true;
      master.gain.cancelScheduledValues(ctx.currentTime); master.gain.linearRampToValueAtTime(.8, ctx.currentTime + 2.4);
      clearTimeout(timer); timer = setTimeout(phrase, 900);
      return true;
    },
    pause() {
      playing = false; clearTimeout(timer);
      if (ctx) { master.gain.cancelScheduledValues(ctx.currentTime); master.gain.linearRampToValueAtTime(0, ctx.currentTime + .5); }
    },
    spark() {   // The flame catching
      if (!ctx) return;
      const now = ctx.currentTime; [293.66, 370, 440, 587.33].forEach((hz, i) => pluck(hz, now + i * .11, .1));
    },
  };
})();
