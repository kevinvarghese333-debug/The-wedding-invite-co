/* Small WebGL layers: water that moves inside a still painting, and a real moon that turns. */
window.GL = (() => {
  const VERT = 'attribute vec2 p;varying vec2 uv;void main(){uv=vec2(p.x*.5+.5,.5-p.y*.5);gl_Position=vec4(p,0.,1.);}';
  const WATER = `precision mediump float;varying vec2 uv;uniform sampler2D img,msk;uniform float t,horizon,useMask,amp;
  void main(){
    float water,sky=0.;
    if(useMask>.5){vec4 m=texture2D(msk,uv);water=m.r;sky=m.g;}else{water=smoothstep(horizon+.004,horizon+.03,uv.y);}
    float d=max(uv.y-horizon,0.);
    vec2 q=vec2((uv.x-.5)/(d+.05),1./(d+.035));
    float w=sin(q.y*1.5+t*1.15+sin(q.x*.55+t*.6)*1.7)+.6*sin(q.y*2.9-t*1.7+q.x*.37)+.35*sin(q.x*1.3+q.y*.8+t*.9);
    vec2 off=vec2(.0017,.0042)*w*amp*(.3+d*2.8);
    vec2 s=uv+off*water;
    s+=sky*vec2(sin(uv.y*7.+t*.11)*.0045+sin(uv.y*19.-t*.07)*.0016,sin(uv.x*5.+t*.09)*.0028);
    vec3 c=texture2D(img,s).rgb;
    float sp=pow(max(0.,sin(q.x*7.+w*2.2+t*1.7)*sin(q.y*4.3-t*1.3)),26.);
    c+=sp*water*vec3(1.,.88,.72)*.34*(.4+d*3.);
    gl_FragColor=vec4(c,1.);
  }`;
  const MOON = `precision mediump float;varying vec2 uv;uniform sampler2D img;uniform float spin;
  void main(){
    vec2 p=uv*2.-1.;float r2=dot(p,p);
    float edge=1.-smoothstep(.975,1.,sqrt(r2));
    float z=sqrt(max(1.-r2,0.));
    float lon=atan(p.x,z)/6.28318+spin,lat=asin(clamp(p.y,-1.,1.))/3.14159+.5;
    float m=texture2D(img,vec2(lon,lat)).r;
    float light=.7+.34*clamp(dot(normalize(vec3(p,z)),normalize(vec3(-.42,-.5,.76))),0.,1.);
    float v=(m*.62+.56)*light;
    vec3 c=vec3(v,v,v*.965);
    gl_FragColor=vec4(c*edge,edge);
  }`;

  function context(cv, alpha) {
    const gl = cv.getContext('webgl', { alpha, antialias: false, premultipliedAlpha: true, powerPreference: 'low-power' });
    return gl || null;
  }
  function program(gl, frag) {
    const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s; };
    const p = gl.createProgram();
    gl.attachShader(p, sh(gl.VERTEX_SHADER, VERT)); gl.attachShader(p, sh(gl.FRAGMENT_SHADER, frag));
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) return null;
    gl.useProgram(p);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const a = gl.getAttribLocation(p, 'p'); gl.enableVertexAttribArray(a); gl.vertexAttribPointer(a, 2, gl.FLOAT, false, 0, 0);
    return p;
  }
  function texture(gl, unit, img, repeat) {
    const t = gl.createTexture(); gl.activeTexture(gl.TEXTURE0 + unit); gl.bindTexture(gl.TEXTURE_2D, t);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
    const wrap = repeat ? gl.REPEAT : gl.CLAMP_TO_EDGE;
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wrap); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  }
  const image = src => new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = src; });

  const layers = [];
  function track(cv, layer) {
    layer.visible = false; layers.push(layer);
    if ('IntersectionObserver' in window) new IntersectionObserver(es => { layer.visible = es[0].isIntersecting; }, { rootMargin: '10%' }).observe(cv);
    else layer.visible = true;
  }

  async function water(cv, { src, mask, horizon, amp = 1, width }) {
    try {
      const gl = context(cv, false); if (!gl) return;
      const p = program(gl, WATER); if (!p) return;
      const [img, msk] = await Promise.all([image(src), mask ? image(mask) : null]);
      const k = Math.min(1, (width || img.width) / img.width);
      cv.width = Math.round(img.width * k); cv.height = Math.round(img.height * k);
      gl.viewport(0, 0, cv.width, cv.height);
      texture(gl, 0, img); if (msk) texture(gl, 1, msk);
      gl.uniform1i(gl.getUniformLocation(p, 'img'), 0); gl.uniform1i(gl.getUniformLocation(p, 'msk'), 1);
      gl.uniform1f(gl.getUniformLocation(p, 'horizon'), horizon); gl.uniform1f(gl.getUniformLocation(p, 'useMask'), msk ? 1 : 0);
      gl.uniform1f(gl.getUniformLocation(p, 'amp'), amp);
      const ut = gl.getUniformLocation(p, 't');
      track(cv, { draw(t) { gl.uniform1f(ut, t); gl.drawArrays(gl.TRIANGLES, 0, 3); } });
      gl.uniform1f(ut, 0); gl.drawArrays(gl.TRIANGLES, 0, 3);
      cv.dataset.live = '1';
    } catch (e) { cv.style.display = 'none'; }
  }

  async function moon(cv, src) {
    try {
      const gl = context(cv, true); if (!gl) return null;
      const p = program(gl, MOON); if (!p) return null;
      const img = await image(src);
      const size = Math.min(1024, Math.round(cv.clientWidth * Math.min(2, devicePixelRatio || 1)) || 720);
      cv.width = cv.height = size; gl.viewport(0, 0, size, size);
      texture(gl, 0, img, true);
      gl.uniform1i(gl.getUniformLocation(p, 'img'), 0);
      const us = gl.getUniformLocation(p, 'spin'); const state = { extra: 0 };
      track(cv, { draw(t) { gl.uniform1f(us, t * .006 + state.extra); gl.drawArrays(gl.TRIANGLES, 0, 3); } });
      cv.dataset.live = '1';
      return state;
    } catch (e) { cv.style.display = 'none'; return null; }
  }

  return { water, moon, tick(t) { for (const l of layers) if (l.visible) l.draw(t); } };
})();
