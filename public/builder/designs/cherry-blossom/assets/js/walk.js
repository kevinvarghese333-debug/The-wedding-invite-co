/* Sneha & Jerin: the walk.
   One WebGL surface. You push in along the rose path, the arched door swings open onto the
   blossom aisle, and you carry on down the aisle until the garden blooms to white.
   Each photo has a depth map, so near things rush past faster than far ones. */
(() => {
  'use strict';

  const root = document.documentElement;
  const canvas = document.getElementById('walk');

  const api = {
    ok: false,
    zoomA: 1,    // along the rose path
    zoomB: 1,    // down the aisle
    open: 0,     // 0 door shut … 1 fully open
    white: 0,    // 0 garden … 1 white paper
    px: 0, py: 0, // camera sway
    ready: Promise.resolve(false),
    render() {},
    resize() {}
  };
  window.Walk = api;

  const fail = () => root.classList.add('no-gl');
  if (!canvas || matchMedia('(prefers-reduced-motion: reduce)').matches || /[?&]nogl\b/.test(location.search)) return fail();
  const gl = canvas.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'high-performance' });
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
    uniform vec2 uRes, uPar;
    uniform float uZoomA, uZoomB, uOpen, uWhite;
    uniform sampler2D uA, uDA, uB, uDB;

    const vec2 SIZE = vec2(736., 1104.);       // both photos share this shape
    const vec2 FOCUS_A = vec2(.5034, .4530);   // the middle of the door
    const vec2 FOCUS_B = vec2(.5000, .5000);   // the end of the aisle
    const float CX = 370.5, TOP = 337., BOTTOM = 667., R = 72.; // the door's opening, in photo pixels

    // Canvas position to an offset in the photo, cropped to cover like object-fit
    vec2 fit(vec2 uv) {
      float ca = uRes.x / uRes.y, ia = SIZE.x / SIZE.y;
      vec2 s = ca > ia ? vec2(1., ia / ca) : vec2(ca / ia, 1.);
      return (uv - .5) * s;
    }

    // Move toward the focus. Bright depth is near, so it scales up faster and slides out of frame.
    vec2 dolly(vec2 p, vec2 focus, float zoom, sampler2D depth, float k, float ref) {
      vec2 rel = .5 + p - focus;
      vec2 uv = focus + rel / zoom;
      float d = texture2D(depth, uv).r;
      for (int i = 0; i < 2; i++) {
        float z = 1. + (zoom - 1.) * (1. + k * (d - ref));
        uv = focus + rel / max(z, .05);
        d = texture2D(depth, uv).r;
      }
      return clamp(uv + uPar * (d - .35), .001, .999);
    }

    void main() {
      vec2 p = fit(vUv);

      // The rose path
      vec2 uvA = dolly(p, FOCUS_A, uZoomA, uDA, .75, .1);
      vec2 ip = uvA * SIZE;
      float cy = TOP + R;
      float dx = ip.x - CX;
      float sd = ip.y < cy ? length(ip - vec2(CX, cy)) - R : max(abs(dx) - R, ip.y - BOTTOM);
      float soft = 1.1 / max(uZoomA, 1.);
      float inDoor = smoothstep(soft, -soft, sd);

      // The two door leaves fold back toward their hinges
      float gap = uOpen * R;
      float paneX = (abs(dx) - gap) / max(R - gap, .01) * R;
      vec2 paneUv = vec2((CX + sign(dx) * paneX) / SIZE.x, uvA.y);
      vec3 a = texture2D(uA, uvA).rgb;
      vec3 pane = texture2D(uA, paneUv).rgb * (1. - uOpen * .35);
      a = mix(a, pane, inDoor * step(.001, uOpen));

      // The aisle, seen through the door and then all around you
      vec2 uvB = dolly(p, FOCUS_B, uZoomB, uDB, .85, .2);
      vec3 b = texture2D(uB, uvB).rgb;
      float through = inDoor * smoothstep(gap + soft, gap - soft, abs(dx)) * step(.001, uOpen);
      vec3 col = mix(a, b, through);

      // White paper blooms outward from the end of the aisle
      float r = length((vUv - vec2(.5, .5)) * vec2(1., 1.15));
      float w = smoothstep(0., 1., uWhite * 2.1 - r * 1.3);
      col = mix(col, vec3(1.), w);

      gl_FragColor = vec4(col, 1.);
    }`;

  const shader = (type, src) => {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
    return s;
  };

  const SOURCES = ['assets/img/scene-door.jpg', 'assets/img/depth-door.jpg', 'assets/img/scene-aisle.jpg', 'assets/img/depth-aisle.jpg'];
  const load = src => new Promise((resolve, reject) => {
    const im = new Image();
    im.onload = () => resolve(im);
    im.onerror = reject;
    im.src = src;
  });

  let images = null, U = null, W = 0, H = 0;

  function setup() {
    const prog = gl.createProgram();
    gl.attachShader(prog, shader(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, shader(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog));
    gl.useProgram(prog);

    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const pos = gl.getAttribLocation(prog, 'aPos');
    gl.enableVertexAttribArray(pos);
    gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);

    U = {};
    ['uRes', 'uPar', 'uZoomA', 'uZoomB', 'uOpen', 'uWhite', 'uA', 'uDA', 'uB', 'uDB'].forEach(n => { U[n] = gl.getUniformLocation(prog, n); });

    images.forEach((im, i) => {
      gl.activeTexture(gl.TEXTURE0 + i);
      gl.bindTexture(gl.TEXTURE_2D, gl.createTexture());
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, im);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    });
    gl.uniform1i(U.uA, 0);
    gl.uniform1i(U.uDA, 1);
    gl.uniform1i(U.uB, 2);
    gl.uniform1i(U.uDB, 3);
  }

  api.resize = () => {
    const dpr = Math.min(1.75, devicePixelRatio || 1);
    const w = Math.round(canvas.clientWidth * dpr), h = Math.round(canvas.clientHeight * dpr);
    if (w === W && h === H) return;
    W = w; H = h;
    canvas.width = w; canvas.height = h;
    gl.viewport(0, 0, w, h);
  };

  api.render = () => {
    if (!api.ok) return;
    gl.uniform2f(U.uRes, W, H);
    gl.uniform2f(U.uPar, api.px, api.py);
    gl.uniform1f(U.uZoomA, api.zoomA);
    gl.uniform1f(U.uZoomB, api.zoomB);
    gl.uniform1f(U.uOpen, api.open);
    gl.uniform1f(U.uWhite, api.white);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };

  api.ready = Promise.all(SOURCES.map(load)).then(list => {
    images = list;
    setup();
    api.ok = true;
    api.resize();
    api.render();
    canvas.classList.add('on');
    return true;
  }).catch(err => {
    console.warn('Walk scene unavailable', err);
    fail();
    return false;
  });

  addEventListener('resize', () => { api.resize(); api.render(); });

  // Phones can drop the GPU context when the browser is backgrounded
  canvas.addEventListener('webglcontextlost', e => { e.preventDefault(); api.ok = false; });
  canvas.addEventListener('webglcontextrestored', () => {
    if (!images) return;
    setup();
    W = H = 0;
    api.ok = true;
    api.resize();
    api.render();
  });
})();
