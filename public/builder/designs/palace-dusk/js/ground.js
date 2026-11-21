/* The road. One small WebGL pass that lays a painted tile on the ground plane and slides it
   towards the camera, so the road really rushes past instead of just zooming a picture. */
(() => {
  'use strict';
  const VS = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
  const FS = `precision highp float;
    uniform sampler2D tex; uniform vec2 res; uniform vec3 fog;
    uniform float hz, k, off, halfTile, len, fogNear, fogFar;
    void main(){
      float y = res.y - gl_FragCoord.y;
      float d = y - hz;
      if (d < .5) { gl_FragColor = vec4(0.); return; }
      float z = k / d;                                   // z = 1 at the bottom edge of the screen
      float a = abs((gl_FragCoord.x - res.x * .5) * z) / halfTile;
      // past the tile's edge, keep folding back over the lawn so a second road never appears
      if (a > .8) { float t = mod((a - .8) / .2, 2.); a = .8 + .2 * (t < 1. ? t : 2. - t); }
      float s = gl_FragCoord.x < res.x * .5 ? -1. : 1.;
      vec3 c = texture2D(tex, vec2(.5 + s * a * .5, (z + off) / len)).rgb;
      gl_FragColor = vec4(mix(c, fog, smoothstep(fogNear, fogFar, z)), 1.);
    }`;

  class Ground {
    constructor(canvas, src, fog) {
      this.canvas = canvas; this.fog = fog; this.ready = false;
      const gl = this.gl = canvas.getContext('webgl', { antialias: false, alpha: true, premultipliedAlpha: true, powerPreference: 'low-power' });
      if (!gl) { canvas.classList.add('no-gl'); return; }
      const sh = (t, s) => { const o = gl.createShader(t); gl.shaderSource(o, s); gl.compileShader(o); return o; };
      const pr = this.pr = gl.createProgram();
      gl.attachShader(pr, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, FS)); gl.linkProgram(pr); gl.useProgram(pr);
      gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
      const at = gl.getAttribLocation(pr, 'p'); gl.enableVertexAttribArray(at); gl.vertexAttribPointer(at, 2, gl.FLOAT, false, 0, 0);
      this.u = {}; for (const n of ['res', 'fog', 'hz', 'k', 'off', 'halfTile', 'len', 'fogNear', 'fogFar']) this.u[n] = gl.getUniformLocation(pr, n);
      const img = new Image();
      let done; this.loaded = new Promise(r => { done = r; });
      img.onerror = () => done();
      img.onload = () => {
        gl.bindTexture(gl.TEXTURE_2D, gl.createTexture());
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img);
        gl.generateMipmap(gl.TEXTURE_2D);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
        const an = gl.getExtension('EXT_texture_filter_anisotropic');
        if (an) gl.texParameterf(gl.TEXTURE_2D, an.TEXTURE_MAX_ANISOTROPY_EXT, Math.min(8, gl.getParameter(an.MAX_TEXTURE_MAX_ANISOTROPY_EXT)));
        this.ready = true; done();
      };
      img.src = src;
    }
    size(w, h, dpr) {
      this.dpr = dpr; this.canvas.width = Math.round(w * dpr); this.canvas.height = Math.round(h * dpr);
      if (this.gl) this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    }
    draw(o) {
      if (!this.ready) return;
      const { gl, u, dpr, canvas } = this;
      gl.uniform2f(u.res, canvas.width, canvas.height); gl.uniform3fv(u.fog, this.fog);
      gl.uniform1f(u.hz, o.hz * dpr); gl.uniform1f(u.k, o.k * dpr); gl.uniform1f(u.off, o.off);
      gl.uniform1f(u.halfTile, o.halfTile * dpr); gl.uniform1f(u.len, o.len);
      gl.uniform1f(u.fogNear, o.fogNear); gl.uniform1f(u.fogFar, o.fogFar);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }
  }
  window.Ground = Ground;
})();
