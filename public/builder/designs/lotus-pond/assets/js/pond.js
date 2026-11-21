/* Malavika & Hari · the pond.
   One WebGL surface for the whole first screen: dark water that ripples where you touch it,
   their photo surfacing through it at the end of the opening, and mist rolling over it on scroll. */
(() => {
  'use strict';

  const MAX_DROPS = 12;
  const canvas = document.getElementById('pond');

  const api = {
    ok: false,
    reveal: 0,       // 0 water … 1 their photo
    mist: 0,         // 0 clear … 1 lost in the mist
    shade: 0,        // darkens the bottom of the photo under the names
    zoom: 1,
    center: [.5, .6], // where the photo surfaces from, in canvas uv
    addDrop() {},
    usePhotos() { return Promise.resolve(false); },
    render() {},
    clock: () => performance.now() / 1000
  };
  window.Pond = api;

  const fail = () => document.documentElement.classList.add('no-gl');
  if (!canvas || matchMedia('(prefers-reduced-motion: reduce)').matches) return fail();
  const gl = canvas.getContext('webgl', { antialias: false, alpha: false, preserveDrawingBuffer: false });
  if (!gl) return fail();

  const VERT = `
    attribute vec2 aPos;
    varying vec2 vUv;
    void main() {
      vUv = vec2(aPos.x * .5 + .5, .5 - aPos.y * .5); // y down, like the page
      gl_Position = vec4(aPos, 0., 1.);
    }`;

  const FRAG = `
    precision highp float;
    varying vec2 vUv;
    uniform vec2 uRes;
    uniform float uTime, uReveal, uMist, uZoom, uHasPhoto, uShade;
    uniform vec2 uCenter, uFocus, uPhotoSize;
    uniform sampler2D uPhoto;
    uniform vec4 uDrops[${MAX_DROPS}];

    float hash(vec2 p) { p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
    float noise(vec2 p) {
      vec2 i = floor(p), f = fract(p), u = f * f * (3. - 2. * f);
      return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
    }
    float fbm(vec2 p) {
      float v = 0., a = .5;
      for (int i = 0; i < 4; i++) { v += a * noise(p); p = p * 2.03 + 17.1; a *= .5; }
      return v;
    }

    // Height of the surface: rings spreading from every drop
    float waves(vec2 p, float aspect) {
      float h = 0.;
      for (int i = 0; i < ${MAX_DROPS}; i++) {
        vec4 d = uDrops[i];
        float age = uTime - d.z;
        if (d.w > 0. && age > 0. && age < 8.) {
          float r = length(p - vec2(d.x * aspect, d.y));
          float x = r - age * .26;
          float env = x > 0. ? exp(-x * x * 900.) : exp(-x * x * 26.);
          h += d.w * sin(x * 92.) * env * exp(-age * .7) / (1. + r * 4.);
        }
      }
      return h;
    }

    void main() {
      float aspect = uRes.x / uRes.y;
      vec2 p = vec2(vUv.x * aspect, vUv.y);
      float t = uTime;

      float e = 1.5 / uRes.y;
      float h = waves(p, aspect);
      vec2 g = vec2(waves(p + vec2(e, 0.), aspect) - h, waves(p + vec2(0., e), aspect) - h) / e;
      vec3 n = normalize(vec3(-g, 1.));

      // Water: deep teal, a dusk sky caught near the top, slow drifting light
      vec2 q = p * 2.2 + g * .05;
      float w1 = fbm(q + vec2(t * .025, t * .018));
      float w2 = fbm(q * 1.6 + w1 * 1.5 - vec2(t * .02, 0.));
      vec3 deep = vec3(.016, .074, .07), shallow = vec3(.045, .2, .185), dusk = vec3(.27, .13, .21);
      float sky = smoothstep(.8, 0., vUv.y + (w2 - .5) * .3 - g.y * .02);
      vec3 water = mix(deep, shallow, w2 * .85);
      water = mix(water, dusk, sky * .5);
      water += vec3(1., .78, .86) * pow(w2, 5.) * .3 * (.35 + sky);

      // Their photo, cover-fitted around the faces
      float B = uPhotoSize.x / uPhotoSize.y;
      vec2 s = aspect > B ? vec2(1., B / aspect) : vec2(aspect / B, 1.);
      vec2 cuv = clamp(uFocus - s * .5, vec2(0.), vec2(1.) - s) + vUv * s;
      cuv = uFocus + (cuv - uFocus) / uZoom;
      vec3 photo = texture2D(uPhoto, cuv + g * .006).rgb;

      // The photo surfaces from the lotus outwards, behind a soft, uneven edge
      float dist = length(p - vec2(uCenter.x * aspect, uCenter.y));
      float edge = (fbm(p * 4. + t * .12) - .5) * .22;
      float R = uReveal * (length(vec2(aspect, 1.)) + .4);
      float m = (1. - smoothstep(R - .24, R, dist + edge)) * uHasPhoto;
      float rim = exp(-pow((dist + edge - R + .1) * 12., 2.)) * step(.001, uReveal) * (1. - smoothstep(.8, 1., uReveal));

      vec3 col = mix(water, photo, m);

      // Light on the ripples
      vec3 L = normalize(vec3(-.35, -.6, .72));
      float spec = pow(max(dot(reflect(-L, n), vec3(0., 0., 1.)), 0.), 36.);
      col += spec * mix(vec3(1., .82, .9) * .6, vec3(.3), m);
      col += rim * vec3(.96, .6, .74) * .45 * uHasPhoto;

      vec2 v = vUv - .5;
      col *= 1. - dot(v, v) * mix(1., .35, m);

      // Shade the bottom of the photo so the names read over it
      float sh = smoothstep(.42, 1., vUv.y) * .78 + smoothstep(.2, 0., vUv.y) * .35;
      col = mix(col, vec3(.024, .09, .086), sh * m * uShade);

      // Mist rolls up from the bottom on scroll
      float fog = fbm(p * 2.4 + vec2(t * .05, -t * .02));
      float f = smoothstep(0., .4, uMist * 1.7 - (1. - vUv.y) * .7 + (fog - .5) * .7);
      col = mix(col, vec3(.961, .933, .918), f);

      gl_FragColor = vec4(col, 1.);
    }`;

  function shader(type, src) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
    return s;
  }

  let prog;
  try {
    prog = gl.createProgram();
    gl.attachShader(prog, shader(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, shader(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog));
  } catch (err) {
    console.warn('Pond shader failed, using the still photo', err);
    return fail();
  }
  gl.useProgram(prog);

  // One triangle that covers the screen
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const aPos = gl.getAttribLocation(prog, 'aPos');
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

  const U = {};
  ['uRes', 'uTime', 'uReveal', 'uMist', 'uZoom', 'uHasPhoto', 'uShade', 'uCenter', 'uFocus', 'uPhotoSize', 'uPhoto', 'uDrops']
    .forEach(k => { U[k] = gl.getUniformLocation(prog, k === 'uDrops' ? 'uDrops[0]' : k); });

  const tex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, 1, 1, 0, gl.RGB, gl.UNSIGNED_BYTE, new Uint8Array([10, 40, 40]));
  gl.uniform1i(U.uPhoto, 0);

  const drops = new Float32Array(MAX_DROPS * 4);
  let next = 0;
  const t0 = performance.now();
  const now = () => (performance.now() - t0) / 1000;
  api.clock = now;

  api.addDrop = (u, v, amp = .02) => {
    drops.set([u, v, now(), amp], next * 4);
    next = (next + 1) % MAX_DROPS;
    wake();
  };

  /* ---------- Photos: a wide one for landscape screens, a tall one for phones ---------- */

  let photos = null, current = null, hasPhoto = 0, size = [1, 1], focus = [.5, .5];
  const cache = {};

  function load(key) {
    if (!cache[key]) {
      cache[key] = new Promise((resolve, reject) => {
        const img = new Image();
        img.decoding = 'async';
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = photos[key].src;
      });
    }
    return cache[key];
  }

  function pickPhoto() {
    if (!photos) return Promise.resolve(false);
    const key = canvas.clientWidth >= canvas.clientHeight ? 'wide' : 'tall';
    if (key === current) return Promise.resolve(true);
    current = key;
    return load(key).then(img => {
      if (current !== key) return true;
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img);
      size = [img.naturalWidth, img.naturalHeight];
      focus = photos[key].focus;
      hasPhoto = 1;
      wake();
      return true;
    }).catch(() => false);
  }

  api.usePhotos = p => { photos = p; return pickPhoto(); };

  /* ---------- Size and drawing ---------- */

  function resize() {
    const dpr = Math.min(devicePixelRatio || 1, 1.5);
    const w = Math.round(canvas.clientWidth * dpr), h = Math.round(canvas.clientHeight * dpr);
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
      gl.viewport(0, 0, w, h);
    }
    pickPhoto();
  }

  function draw() {
    gl.uniform2f(U.uRes, canvas.width, canvas.height);
    gl.uniform1f(U.uTime, now());
    gl.uniform1f(U.uReveal, api.reveal);
    gl.uniform1f(U.uMist, api.mist);
    gl.uniform1f(U.uShade, api.shade);
    gl.uniform1f(U.uZoom, api.zoom);
    gl.uniform1f(U.uHasPhoto, hasPhoto);
    gl.uniform2f(U.uCenter, api.center[0], api.center[1]);
    gl.uniform2f(U.uFocus, focus[0], focus[1]);
    gl.uniform2f(U.uPhotoSize, size[0], size[1]);
    gl.uniform4fv(U.uDrops, drops);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }
  api.render = draw;

  // Draw only while the pond is on screen and the tab is visible
  let visible = true, raf = 0;
  function frame() {
    raf = 0;
    draw();
    // Fully misted over: nothing moves, so stop until something changes
    if (visible && !document.hidden && api.mist < .999) raf = requestAnimationFrame(frame);
  }
  function wake() { if (!raf && visible && !document.hidden) raf = requestAnimationFrame(frame); }
  api.wake = wake;

  new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) wake(); }).observe(canvas);
  document.addEventListener('visibilitychange', wake);
  new ResizeObserver(() => { resize(); wake(); }).observe(canvas);
  canvas.addEventListener('webglcontextlost', e => { e.preventDefault(); api.ok = false; fail(); });

  resize();
  api.ok = true;
  wake();
})();
