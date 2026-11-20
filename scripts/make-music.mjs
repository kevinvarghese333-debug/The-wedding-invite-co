// Generates the builder's built-in music: soft instrumental loops synthesised from scratch, so there are no
// licensing questions. Two are public-domain melodies (Pachelbel, Satie), two are original.
//   node scripts/make-music.mjs        (needs ffmpeg with libmp3lame)
// Writes public/builder/music/*.mp3
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";

const SR = 44100;
const OUT = path.join(path.dirname(new URL(import.meta.url).pathname), "..", "public", "builder", "music");
fs.mkdirSync(OUT, { recursive: true });

const NAMES = { C: 0, "C#": 1, Db: 1, D: 2, "D#": 3, Eb: 3, E: 4, F: 5, "F#": 6, Gb: 6, G: 7, "G#": 8, Ab: 8, A: 9, "A#": 10, Bb: 10, B: 11 };
const midi = (n) => {
  const m = /^([A-G][#b]?)(-?\d)$/.exec(n);
  return 12 * (Number(m[2]) + 1) + NAMES[m[1]];
};
const hz = (n) => 440 * Math.pow(2, ((typeof n === "number" ? n : midi(n)) - 69) / 12);

function track(seconds) {
  const len = Math.ceil(seconds * SR);
  return { L: new Float32Array(len), R: new Float32Array(len), len };
}

/* Instruments: additive partials with their own decays. pan -1..1 */
function addNote(buf, t0, dur, freq, amp, kind, pan = 0) {
  const presets = {
    box: { partials: [[1, 1, 2.2], [2, 0.22, 1.1], [3, 0.1, 0.6], [5.4, 0.06, 0.18], [8.9, 0.025, 0.08]], attack: 0.002, release: 0.4 },
    piano: { partials: [[1, 1, 3.2], [2, 0.42, 2.2], [3, 0.2, 1.5], [4, 0.12, 1.1], [5, 0.06, 0.8], [6, 0.035, 0.6], [7, 0.02, 0.45]], attack: 0.006, release: 0.35 },
    pad: { partials: [[1, 1, 99], [2, 0.45, 99], [3, 0.22, 99], [4, 0.12, 99], [5, 0.06, 99]], attack: 0.9, release: 1.4 },
  };
  const p = presets[kind];
  const start = Math.floor(t0 * SR);
  const ring = kind === "pad" ? dur + p.release : Math.min(dur + p.release, p.partials[0][2] * 2.2);
  const n = Math.min(Math.floor(ring * SR), buf.len - start);
  const gl = Math.cos(((pan + 1) * Math.PI) / 4);
  const gr = Math.sin(((pan + 1) * Math.PI) / 4);
  const hiCut = freq > 1000 ? 0.6 : 1;
  for (const [ratio, a, decay] of p.partials) {
    const f = freq * ratio * (kind === "piano" ? 1 + 0.0004 * ratio * ratio : 1);
    if (f > 16000) continue;
    const w = (2 * Math.PI * f) / SR;
    const amp2 = amp * a * (ratio > 2 ? hiCut : 1);
    const k = Math.exp(-1 / (decay * SR));
    let env = 1;
    for (let i = 0; i < n; i++) {
      const t = i / SR;
      let e = t < p.attack ? t / p.attack : 1;
      if (t > dur) e *= Math.max(0, 1 - (t - dur) / p.release);
      if (kind !== "pad") env *= k;
      else e *= 1 + 0.004 * Math.sin(2 * Math.PI * 5 * t); // gentle vibrato in amplitude
      const v = Math.sin(w * i + (kind === "pad" ? 0.003 * Math.sin(2 * Math.PI * 4.8 * t) * ratio : 0)) * amp2 * e * env;
      buf.L[start + i] += v * gl;
      buf.R[start + i] += v * gr;
    }
  }
}

/* A small Freeverb: four combs and two allpasses per channel. */
function reverb(buf, wet = 0.28, room = 0.84, damp = 0.25) {
  const combs = [1116, 1188, 1277, 1356, 1422, 1491];
  const aps = [556, 441, 341];
  const run = (x, spread) => {
    const out = new Float32Array(x.length);
    for (const d0 of combs) {
      const d = d0 + spread;
      const line = new Float32Array(d);
      let idx = 0;
      let store = 0;
      for (let i = 0; i < x.length; i++) {
        const y = line[idx];
        store = y * (1 - damp) + store * damp;
        line[idx] = x[i] * 0.015 + store * room;
        out[i] += y;
        idx = (idx + 1) % d;
      }
    }
    for (const d0 of aps) {
      const d = d0 + spread;
      const line = new Float32Array(d);
      let idx = 0;
      for (let i = 0; i < out.length; i++) {
        const b = line[idx];
        const v = out[i];
        line[idx] = v + b * 0.5;
        out[i] = b - v;
        idx = (idx + 1) % d;
      }
    }
    return out;
  };
  const wl = run(buf.L, 0);
  const wr = run(buf.R, 23);
  for (let i = 0; i < buf.len; i++) {
    buf.L[i] = buf.L[i] * (1 - wet * 0.5) + wl[i] * wet;
    buf.R[i] = buf.R[i] * (1 - wet * 0.5) + wr[i] * wet;
  }
}

function write(buf, name, fadeIn = 0.02, fadeOut = 3) {
  let peak = 0;
  for (let i = 0; i < buf.len; i++) peak = Math.max(peak, Math.abs(buf.L[i]), Math.abs(buf.R[i]));
  const g = 0.85 / (peak || 1);
  const data = Buffer.alloc(buf.len * 4);
  for (let i = 0; i < buf.len; i++) {
    const t = i / SR;
    let f = Math.min(1, t / fadeIn);
    const left = (buf.len - i) / SR;
    if (left < fadeOut) f *= left / fadeOut;
    data.writeInt16LE(Math.max(-32767, Math.min(32767, Math.round(buf.L[i] * g * f * 32767))), i * 4);
    data.writeInt16LE(Math.max(-32767, Math.min(32767, Math.round(buf.R[i] * g * f * 32767))), i * 4 + 2);
  }
  const header = Buffer.alloc(44);
  header.write("RIFF", 0);
  header.writeUInt32LE(36 + data.length, 4);
  header.write("WAVEfmt ", 8);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(2, 22);
  header.writeUInt32LE(SR, 24);
  header.writeUInt32LE(SR * 4, 28);
  header.writeUInt16LE(4, 32);
  header.writeUInt16LE(16, 34);
  header.write("data", 36);
  header.writeUInt32LE(data.length, 40);
  const wav = path.join(os.tmpdir(), `${name}.wav`);
  fs.writeFileSync(wav, Buffer.concat([header, data]));
  const mp3 = path.join(OUT, `${name}.mp3`);
  execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-i", wav, "-codec:a", "libmp3lame", "-b:a", "112k", "-ar", "44100", mp3]);
  fs.unlinkSync(wav);
  console.log(name, (fs.statSync(mp3).size / 1024).toFixed(0) + " KB");
}

/* ---------- Canon in D (Pachelbel), music box ---------- */
{
  const chords = [["D3", "maj"], ["A2", "maj"], ["B2", "min"], ["F#2", "min"], ["G2", "maj"], ["D2", "maj"], ["G2", "maj"], ["A2", "maj"]];
  const beat = 0.62; // seconds per quarter
  const bar = beat * 4;
  const cycles = 5;
  const buf = track(bar * 4 * cycles + 6);
  const v1 = ["F#5", "E5", "D5", "C#5", "B4", "A4", "B4", "C#5"];
  const v2 = ["D5", "C#5", "B4", "A4", "G4", "F#4", "G4", "E4"];
  const v3 = [
    ["D5", "F#5"], ["A5", "G5"], ["F#5", "D5"], ["F#5", "E5"], ["D5", "B4"], ["D5", "A5"], ["G5", "B5"], ["A5", "G5"],
  ];
  for (let c = 0; c < cycles; c++) {
    chords.forEach(([root, q], i) => {
      const t = (c * 8 + i) * beat * 2;
      const r = midi(root);
      const third = q === "maj" ? 4 : 3;
      addNote(buf, t, beat * 2, hz(r), 0.55, "piano", -0.15);
      const arp = [r + 12, r + 19, r + 24, r + 24 + third, r + 31, r + 24 + third, r + 24, r + 19];
      arp.forEach((m, k) => addNote(buf, t + (k * beat) / 4, beat / 4, hz(m + 12), 0.16, "box", 0.2 * Math.sin(k)));
      if (c === 1) addNote(buf, t, beat * 2, hz(v1[i]), 0.42, "box", 0.1);
      if (c === 2) addNote(buf, t, beat * 2, hz(v2[i]), 0.42, "box", 0.1);
      if (c === 3) v3[i].forEach((n, k) => addNote(buf, t + k * beat, beat, hz(n), 0.36, "box", 0.1));
      if (c === 4) {
        addNote(buf, t, beat * 2, hz(midi(v1[i]) + 12), 0.32, "box", 0.15);
        addNote(buf, t, beat * 2, hz(v1[i]), 0.3, "box", -0.1);
      }
    });
  }
  const end = cycles * 8 * beat * 2;
  ["D3", "A3", "D4", "F#4", "A4", "D5"].forEach((n, k) => addNote(buf, end + k * 0.12, 4, hz(n), 0.35, k < 2 ? "piano" : "box"));
  reverb(buf, 0.32);
  write(buf, "canon");
}

/* ---------- Gymnopédie No. 1 (Satie), soft piano ---------- */
{
  const beat = 0.86;
  const bar = beat * 3;
  const bars = 26;
  const buf = track(bar * bars + 6);
  for (let b = 0; b < bars; b++) {
    const t = b * bar;
    const g = b % 2 === 0;
    addNote(buf, t, bar, hz(g ? "G2" : "D2"), 0.5, "piano", -0.2);
    (g ? ["B3", "D4", "F#4"] : ["A3", "C#4", "F#4"]).forEach((n) => addNote(buf, t + beat, beat * 2, hz(n), 0.2, "piano", 0.1));
  }
  // melody: [bar, beat, note, beats]
  const phrase = [
    [0, 1, "F#5", 1], [0, 2, "A5", 1], [1, 0, "G5", 1], [1, 1, "F#5", 1], [1, 2, "C#5", 1], [2, 0, "B4", 1], [2, 1, "C#5", 1], [2, 2, "D5", 1],
    [3, 0, "A4", 3], [4, 0, "F#4", 6],
  ];
  const phrase2 = [
    [0, 1, "F#5", 1], [0, 2, "A5", 1], [1, 0, "G5", 1], [1, 1, "F#5", 1], [1, 2, "C#5", 1], [2, 0, "B4", 1], [2, 1, "C#5", 1], [2, 2, "D5", 1],
    [3, 0, "A4", 3], [4, 0, "C#5", 3], [5, 0, "F#5", 3], [6, 0, "E5", 6],
  ];
  const play = (p, startBar) => p.forEach(([b, k, n, len]) => addNote(buf, (startBar + b) * bar + k * beat, len * beat, hz(n), 0.42, "piano", 0.05));
  play(phrase, 4);
  play(phrase2, 12);
  play(phrase, 20);
  reverb(buf, 0.3, 0.86, 0.35);
  write(buf, "gymnopedie");
}

/* ---------- First Light (original), soft piano ---------- */
{
  const beat = 0.8;
  const prog = [["G2", "G3", "B3", "D4"], ["D2", "F#3", "A3", "D4"], ["E2", "G3", "B3", "E4"], ["C2", "G3", "C4", "E4"]];
  const melody = [
    // one bar per chord, [beat, note, beats]
    [[0, "D5", 2], [2, "B4", 2]],
    [[0, "A4", 1.5], [1.5, "F#4", 0.5], [2, "A4", 2]],
    [[0, "G4", 2], [2, "B4", 2]],
    [[0, "E5", 2], [2, "D5", 1], [3, "C5", 1]],
    [[0, "B4", 1], [1, "D5", 1], [2, "G5", 2]],
    [[0, "F#5", 2], [2, "E5", 1], [3, "D5", 1]],
    [[0, "E5", 2], [2, "B4", 2]],
    [[0, "C5", 2], [2, "D5", 2]],
  ];
  const rounds = 3;
  const buf = track(beat * 4 * 8 * rounds + beat * 8 + 6);
  for (let r = 0; r < rounds; r++) {
    for (let b = 0; b < 8; b++) {
      const t = (r * 8 + b) * beat * 4;
      const [bass, ...ch] = prog[b % 4];
      addNote(buf, t, beat * 4, hz(bass), 0.45, "piano", -0.2);
      [0, 1, 2, 1, 0, 1, 2, 1].forEach((k, i) => addNote(buf, t + (i * beat) / 2, beat / 2, hz(ch[k]), 0.16, "piano", 0.15));
      if (r > 0) melody[b].forEach(([k, n, len]) => addNote(buf, t + k * beat, len * beat, hz(r === 2 ? midi(n) + 12 : midi(n)), r === 2 ? 0.3 : 0.38, "piano", 0));
    }
  }
  const end = rounds * 8 * beat * 4;
  addNote(buf, end, beat * 4, hz("C2"), 0.4, "piano");
  ["G3", "C4", "E4"].forEach((n) => addNote(buf, end, beat * 4, hz(n), 0.18, "piano"));
  addNote(buf, end + beat * 4, beat * 4, hz("G2"), 0.4, "piano");
  ["G3", "B3", "D4", "G4"].forEach((n, k) => addNote(buf, end + beat * 4 + k * 0.08, beat * 4, hz(n), 0.2, "piano"));
  reverb(buf, 0.26, 0.85, 0.3);
  write(buf, "first-light");
}

/* ---------- Lanterns (original), strings pad and music box ---------- */
{
  const beat = 0.7;
  const prog = [["F2", ["A3", "C4", "E4"]], ["A2", ["G3", "C4", "E4"]], ["D2", ["F3", "A3", "C4"]], ["Bb1", ["F3", "A3", "D4"]]];
  const rounds = 4;
  const barLen = beat * 4 * 2; // two bars per chord
  const buf = track(barLen * 4 * rounds + 7);
  const sparkle = ["C6", "A5", "E5", "F5", "G5", "E5", "C5", "D5"];
  for (let r = 0; r < rounds; r++) {
    prog.forEach(([bass, ch], i) => {
      const t = (r * 4 + i) * barLen;
      addNote(buf, t, barLen, hz(bass), 0.32, "pad", -0.1);
      ch.forEach((n, k) => addNote(buf, t, barLen, hz(n), 0.12, "pad", k - 1));
      if (r > 0)
        for (let k = 0; k < 8; k++) {
          const m = midi(sparkle[(k + i * 3) % sparkle.length]);
          addNote(buf, t + k * beat, beat, hz(m - (i === 2 ? 0 : 0)), 0.11, "box", Math.sin(k * 1.7) * 0.6);
        }
      if (r >= 2) addNote(buf, t, barLen, hz(midi(ch[2]) + 12), 0.2, "box", 0);
    });
  }
  const end = rounds * 4 * barLen;
  addNote(buf, end, 5, hz("F2"), 0.32, "pad");
  ["A3", "C4", "F4"].forEach((n) => addNote(buf, end, 5, hz(n), 0.12, "pad"));
  addNote(buf, end + 0.4, 2, hz("C6"), 0.12, "box");
  reverb(buf, 0.36, 0.88, 0.3);
  write(buf, "lanterns", 1.2, 4);
}
