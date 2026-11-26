// LM/OS runtime: everything that moves on the page.
//   - home: a dithered USB stick that splits into three as you scroll
//   - projects: a 3D DJ deck; loading a USB plays it and lifts its card out as a hologram
//   - the boot loader, the TV channel switch between views, and the curved CRT glass
// The HTML it drives is rendered by the React components in /components; this file only
// wires behaviour onto it. startLmos() returns a function that stops everything.
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { PROJECTS, CHANNELS, BOOT_LINES, SCAN_LINES, CONTACT } from '@/data/site';

export function startLmos(){
const lifetime = new AbortController();
const timers = [];
let rafId = 0;
const on = (target, type, fn, opts) => target.addEventListener(type, fn, { ...(typeof opts === 'object' ? opts : {}), signal: lifetime.signal });
const every = (fn, ms) => { const id = setInterval(fn, ms); timers.push(id); return id; };



const $ = s => document.querySelector(s);
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const clamp01 = v => Math.max(0, Math.min(1, v));
const ease = t => t<.5 ? 4*t*t*t : 1 - Math.pow(-2*t+2, 3)/2;
const smooth = (a, b, v) => clamp01((v - a)/(b - a));

/* ---------- scrambled-letter hover ---------- */
const GLYPHS = '█▓▒░<>/\\#_=+01';
function scramble(el){
  if (el._busy || reduce) return; el._busy = true;
  const nodes = [...el.querySelectorAll('span')].filter(n => !n.children.length && n.textContent.trim()); const targets = nodes.length ? nodes : [el];
  const orig = targets.map(n => n.textContent); const t0 = performance.now(), dur = 380;
  el.classList.add('glitching');
  (function tick(now){
    const k = Math.min(1, (now - t0)/dur);
    targets.forEach((n, i) => { const s = orig[i]; const fixed = Math.floor(s.length * k);
      n.textContent = s.split('').map((ch, j) => j < fixed || ch === ' ' ? ch : GLYPHS[(Math.random()*GLYPHS.length)|0]).join(''); });
    if (k < 1) requestAnimationFrame(tick); else { targets.forEach((n,i) => n.textContent = orig[i]); el.classList.remove('glitching'); el._busy = false; }
  })(t0);
}
function wireScramble(root){ root.querySelectorAll('[data-scramble]').forEach(el => { if (el._wired) return; el._wired = true; on(el, 'focus', () => scramble(el)); }); }
wireScramble(document);

/* ---------- small HUD bits ---------- */
on(window, 'pointermove', e => { $('#mx').textContent = String(Math.round(e.clientX)).padStart(4,'0'); $('#my').textContent = String(Math.round(e.clientY)).padStart(4,'0'); });
const fmt = new Intl.DateTimeFormat('en-CA', { timeZone:'America/Toronto', hour:'2-digit', minute:'2-digit', second:'2-digit', hour12:false });
const tickClock = () => { $('#clock').textContent = 'MTL ' + fmt.format(new Date()); }; tickClock(); every(tickClock, 1000);
const SCAN = SCAN_LINES;
let scanShown = -1;
function setScan(n){ if (n === scanShown) return; scanShown = n;
  $('#scanlog').innerHTML = SCAN.slice(0, n).map(([a,b,h]) => `${a} <span class="${h?'hot':'ok'}">[${b}]</span>`).join('\n'); }
const barsEl = $('#bars');
let toastT; function toast(msg){ const t = $('#toast'); t.textContent = msg; t.hidden = false; clearTimeout(toastT); toastT = setTimeout(() => t.hidden = true, 2200); }
/* ---------- the curved tube ----------
   One SVG displacement map bends #screen (3D view, text, scrolling pages and the bottom bar) together.
   The curve is normalised so the corners stay put: it fills the whole window with no black rim. */
const SC = $('#scroller'), screenEl = $('#screen');
const CURVE = 0.05;
// the bulge fades out toward the bottom so the bottom bar stays almost straight
const bendFill = (u, v) => { const cx = u - .5, cy = v - .5, f = (1 + CURVE*(cx*cx + cy*cy)) / (1 + CURVE*0.5);
  const b = clamp01((v - 0.45)/0.55), w = 1 - 0.75*b*b*(3 - 2*b), g = 1 + (f - 1)*w; return [.5 + cx*g, .5 + cy*g]; };
let curved = false;
// where a point on the glass really sits on the flat page underneath
const toPage = (x, y) => { if (!curved) return [x, y]; const [u, v] = bendFill(x/innerWidth, y/innerHeight); return [u*innerWidth, v*innerHeight]; };
function buildCurve(){
  curved = matchMedia('(hover: hover) and (pointer: fine)').matches && innerWidth >= 860 && !reduce;
  screenEl.classList.toggle('curved', curved); if (!curved) return;
  const W = innerWidth, H = innerHeight, MW = Math.min(720, Math.ceil(W/2)), MH = Math.min(450, Math.ceil(H/2)), dx = new Float32Array(MW*MH), dy = new Float32Array(MW*MH); let m = 0;
  for (let j=0;j<MH;j++) for (let i=0;i<MW;i++){ const u = (i+.5)/MW, v = (j+.5)/MH, [su, sv] = bendFill(u, v), k = j*MW+i;
    dx[k] = (su - u)*W; dy[k] = (sv - v)*H; m = Math.max(m, Math.abs(dx[k]), Math.abs(dy[k])); }
  const S = m*2.1, c = document.createElement('canvas'); c.width = MW; c.height = MH; const x = c.getContext('2d'), img = x.createImageData(MW, MH);
  for (let k=0;k<MW*MH;k++){ img.data[k*4] = Math.round(255*(.5 + dx[k]/S)); img.data[k*4+1] = Math.round(255*(.5 + dy[k]/S)); img.data[k*4+2] = 128; img.data[k*4+3] = 255; }
  x.putImageData(img, 0, 0);
  const f = $('#crtf'), map = $('#crtmap');
  for (const el of [f, map]){ el.setAttribute('width', W); el.setAttribute('height', H); }
  map.setAttribute('href', c.toDataURL()); f.querySelector('feDisplacementMap').setAttribute('scale', S.toFixed(2));
}
buildCurve(); on(window, 'resize', buildCurve);
SC.focus({ preventScroll:true });
const navEl = document.querySelector('.bar nav');
const navEnd = () => navEl.classList.toggle('end', navEl.scrollLeft + navEl.clientWidth >= navEl.scrollWidth - 4);
navEnd(); on(navEl, 'scroll', navEnd); on(window, 'resize', navEnd);

// hovers and clicks follow what you see on the glass, not the flat page underneath
let pageX = -1, pageY = -1, hovEl = null;
function setHover(el){
  if (el === hovEl) return; if (hovEl) hovEl.classList.remove('hov'); hovEl = el;
  if (el){ el.classList.add('hov'); if (el.matches('[data-scramble]')) scramble(el); }
}
on(window, 'pointermove', e => {
  [pageX, pageY] = toPage(e.clientX, e.clientY);
  const t = document.elementFromPoint(pageX, pageY);
  setHover(t ? t.closest('a, button, .hbtn, [data-scramble]') : null);
});
on(window, 'click', e => {
  if (!curved || !e.isTrusted || e.detail === 0) return; // keyboard clicks are already in the right place
  const [qx, qy] = toPage(e.clientX, e.clientY), t = document.elementFromPoint(qx, qy);
  if (!t) return;
  e.stopPropagation(); e.preventDefault();
  t.dispatchEvent(new MouseEvent('click', { bubbles:true, cancelable:true, view:window, clientX:qx, clientY:qy }));
}, true);

/* crosshair that follows the mouse across the whole page */
const xh = $('#xh'), xv = xh.querySelector('path.v'), xhh = xh.querySelector('path.h'), xp = xh.querySelector('.p'), xt = xh.querySelector('.t');
let deckHot = false;
if (matchMedia('(hover: hover) and (pointer: fine)').matches){
  on(window, 'pointermove', e => {
    const [x, y] = toPage(e.clientX, e.clientY); xh.hidden = false;
    xv.setAttribute('d', `M${x} -40V${innerHeight + 40}`); xhh.setAttribute('d', `M-40 ${y}H${innerWidth + 40}`); xp.style.transform = `translate(${x}px, ${y}px)`;
    const flipX = x > innerWidth - 110, flipY = y > innerHeight - 70;
    xt.style.transform = `translate(${x + (flipX ? -92 : 14)}px, ${y + (flipY ? -44 : 12)}px)`;
    xt.textContent = `X:${Math.round(e.clientX)}PX\nY:${Math.round(e.clientY)}PX`;
    xh.classList.toggle('hot', !!hovEl || deckHot);
  });
  on(document.documentElement, 'mouseleave', () => { xh.hidden = true; });
}
on($('#ping'), 'click', async () => {
  const email = CONTACT.email;
  try { await navigator.clipboard.writeText(email); toast('Email copied: ' + email); } catch(e){ toast(email); }
});

/* ---------- views ---------- */
const SOON = Object.fromEntries(CHANNELS.filter(c => c.soon).map(c => [c.key, c.soon]));
const CHANNEL_KEYS = CHANNELS.map(c => c.key);
let view = 'home', current = 'home', firstRoute = true;
const keyFor = h => (h === 'projects' || PROJECTS.some(p => p.id === h)) ? 'projects' : SOON[h] ? h : 'home';
function applyView(key){
  const was = view; view = SOON[key] ? 'soon' : key;
  if (was === 'projects' && view !== 'projects') resetDeck();
  $('#home').hidden = view !== 'home'; $('#locks').hidden = view !== 'home'; $('#projects').hidden = view !== 'projects'; $('#soon').hidden = view !== 'soon';
  if (SOON[key]) $('#soonTitle').textContent = SOON[key];
  SC.scrollTo(0, 0);
  document.querySelectorAll('.bar nav a').forEach(a => a.dataset.view === key ? a.setAttribute('aria-current', 'page') : a.removeAttribute('aria-current'));
}
// an old TV changing channel: the picture squeezes to a line, then opens on the new page
function tvSwitch(key){
  const tv = $('#tv'), label = SOON[key] || (key === 'projects' ? 'Projects' : 'Index');
  $('#tvLabel').textContent = 'CH ' + String(CHANNEL_KEYS.indexOf(key) + 1).padStart(2, '0') + ' ' + label;
  tv.hidden = false; tv.className = 'out';
  return new Promise(res => setTimeout(() => { applyView(key); tv.className = 'in'; setTimeout(() => { tv.hidden = true; tv.className = ''; res(); }, 560); }, 470));
}
async function route(){
  const h = location.hash.slice(1), key = keyFor(h), proj = PROJECTS.find(p => p.id === h);
  if (key !== current){ current = key; if (firstRoute || reduce) applyView(key); else await tvSwitch(key); }
  firstRoute = false;
  if (proj && deckReady && loadedId !== proj.id) toggle(proj.id);
}
on(window, 'hashchange', route);
on($('#loadBtn'), 'click', () => { location.hash = 'projects'; });

/* ---------- boot screen ---------- */
const LINES = BOOT_LINES;
let modelsReady = false, revealStart = -1;
async function boot(){
  const el = $('#boot'), log = $('#log'), count = $('#count'), bar = $('#barline');
  el.hidden = false; log.innerHTML = ''; revealStart = -1;
  let skipped = false; const skip = () => { skipped = true; };
  on(window, 'keydown', skip, { once:true }); on(el, 'pointerdown', skip, { once:true });
  const minDur = reduce ? 300 : 1700, t0 = performance.now(); let shown = 0;
  const line = i => { const [a,b,hot] = LINES[i]; log.insertAdjacentHTML('beforeend', `${a} <span class="${hot?'hot':'ok'}">[${b}]</span>\n`); };
  await new Promise(res => {
    (function tick(now){
      const k = skipped && modelsReady ? 1 : Math.min(Math.min(1, (now - t0)/minDur), modelsReady ? 1 : 0.92);
      count.textContent = String(Math.round(k*100)).padStart(3,'0'); bar.style.width = (k*100) + '%';
      const want = Math.min(LINES.length, Math.floor(k * (LINES.length + 0.6)));
      while (shown < want) line(shown++);
      if (k >= 1){ while (shown < LINES.length) line(shown++); return setTimeout(res, skipped || reduce ? 0 : 260); }
      requestAnimationFrame(tick);
    })(t0);
  });
  window.removeEventListener('keydown', skip);
  if (!reduce) await inkWipe(() => { el.hidden = true; }); else el.hidden = true;
  revealStart = performance.now(); try { sessionStorage.setItem('lm-booted', '1'); } catch(e){}
}
function inkWipe(onCovered){
  const c = $('#wipe'); c.hidden = false;
  const W = 160, H = Math.max(90, Math.round(160 * innerHeight / innerWidth)); c.width = W; c.height = H;
  const x = c.getContext('2d'); const img = x.createImageData(W, H);
  const g = 24, rnd = []; for (let i=0;i<(g+1)*(g+1);i++) rnd.push(Math.random());
  const n = (u,v) => { const X = u*g, Y = v*g, xi = Math.floor(X), yi = Math.floor(Y), fx = X-xi, fy = Y-yi;
    const a = rnd[yi*(g+1)+xi], b = rnd[yi*(g+1)+xi+1], cc = rnd[(yi+1)*(g+1)+xi], d = rnd[(yi+1)*(g+1)+xi+1];
    const sx = fx*fx*(3-2*fx), sy = fy*fy*(3-2*fy); return a + (b-a)*sx + (cc-a)*sy + (a-b-cc+d)*sx*sy; };
  const field = new Float32Array(W*H);
  for (let j=0;j<H;j++) for (let i=0;i<W;i++){ const u = i/W, v = j/H; field[j*W+i] = v*0.75 + n(u*0.999, v*0.999)*0.6 + n((u*3)%1*0.999, (v*3)%1*0.999)*0.25; }
  return new Promise(res => {
    const t0 = performance.now(); let covered = false;
    (function tick(now){
      const t = (now - t0)/1000; let lo, hi;
      if (t < 0.55){ lo = -1; hi = (t/0.55)*1.7 - 0.1; }
      else { if (!covered){ covered = true; onCovered(); } lo = 1.6 - ((t-0.55)/0.7)*1.9; hi = 9; }
      for (let p=0;p<W*H;p++){ const o = p*4; img.data[o]=226; img.data[o+1]=65; img.data[o+2]=47; img.data[o+3] = field[p] > lo && field[p] < hi ? 255 : 0; }
      x.putImageData(img, 0, 0);
      if (t < 1.3) requestAnimationFrame(tick); else { c.hidden = true; res(); }
    })(t0);
  });
}
on($('#reboot'), 'click', () => {
  boot(); // shows the boot screen right away, the reset happens underneath it
  try { history.replaceState(null, '', location.href.split('#')[0]); } catch(e){}
  if (current !== 'home'){ current = 'home'; applyView('home'); } else SC.scrollTo(0, 0);
  resetDeck(); scanShown = -1;
});

/* ---------- three.js ---------- */
const canvas = $('#scene');
let renderer; try { renderer = new THREE.WebGLRenderer({ canvas, antialias:true, alpha:true }); } catch(e){ modelsReady = true; }
const clock = new THREE.Clock();

// home: dithered sticks
const homeScene = new THREE.Scene(), homeCam = new THREE.PerspectiveCamera(28, 1, 0.5, 300);
homeScene.add(new THREE.HemisphereLight('#ffffff', '#505050', 3.4));
const hKey = new THREE.DirectionalLight('#ffffff', 3.6); hKey.position.set(-10, 14, 18); homeScene.add(hKey);
const homeSticks = [];
// projects: the real deck
const emptyScene = new THREE.Scene();
const deckScene = new THREE.Scene(), deckCam = new THREE.PerspectiveCamera(30, 1, 0.5, 600);
let consoleRoot, screenMesh, screenCtx, screenTex, beam, SCR = null;
let holoA = 0; // 0 = hologram sits flat on the deck screen, 1 = fully projected
const SLOT = new THREE.Vector3(30.8, 4.72, -16.7); let surfaceY = 4.72;
const deckSticks = []; let loadedId = null, pending = null, busy = false, loadT = 0, screenMode = 'idle', deckReady = false;

let rt, post, postScene, postCam, rtScene, barrel, barrelScene; const BEND = 0.0;
if (renderer){
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2)); renderer.setClearColor(0x000000, 0);
  document.querySelector('.grid').hidden = true; // the grid is drawn in the curved pass instead
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  rt = new THREE.WebGLRenderTarget(4, 4, { minFilter:THREE.NearestFilter, magFilter:THREE.NearestFilter });
  post = new THREE.Mesh(new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute([-1,-1,0, 3,-1,0, -1,3,0], 3)),
    new THREE.ShaderMaterial({ transparent:true, depthTest:false,
      uniforms:{ tex:{ value: rt.texture }, cell:{ value: 6 }, res:{ value: new THREE.Vector2(1,1) }, grow:{ value: 0 }, red:{ value: new THREE.Color('#e2412f') }, ghost:{ value: new THREE.Color('#f1f1ee') } },
      vertexShader:'void main(){ gl_Position = vec4(position.xy, 0., 1.); }',
      fragmentShader:`uniform sampler2D tex; uniform float cell; uniform vec2 res; uniform float grow; uniform vec3 red; uniform vec3 ghost;
        void main(){
          vec2 id = floor(gl_FragCoord.xy / cell);
          vec4 c = texture2D(tex, (id + 0.5) * cell / res);
          if (c.a < 0.1) discard;
          float l = pow(dot(c.rgb, vec3(.299,.587,.114)), 1.0/2.2);
          float sat = max(c.r, max(c.g, c.b)) - min(c.r, min(c.g, c.b));
          vec2 f = fract(gl_FragCoord.xy / cell) - 0.5;
          float r = (0.14 + 0.4 * l) * grow;
          if (max(abs(f.x), abs(f.y)) > r) discard;
          gl_FragColor = vec4(sat > 0.45 ? red : ghost * (0.45 + 0.55 * l), 1.0);
        }` }));
  post.frustumCulled = false; postScene = new THREE.Scene(); postScene.add(post); postCam = new THREE.Camera();
  // final pass: bend the picture like a curved CRT tube, with a little colour fringing at the edges
  rtScene = new THREE.WebGLRenderTarget(4, 4, { type:THREE.HalfFloatType, samples:4 });
  barrel = new THREE.Mesh(post.geometry, new THREE.ShaderMaterial({ transparent:true, depthTest:false,
    uniforms:{ tex:{ value: rtScene.texture }, mode:{ value: 0 }, k:{ value: BEND }, res:{ value: new THREE.Vector2(1,1) }, dpr:{ value: 1 } },
    vertexShader:'varying vec2 vUv; void main(){ vUv = position.xy*0.5+0.5; gl_Position = vec4(position.xy, 0., 1.); }',
    fragmentShader:`uniform sampler2D tex; uniform float mode; uniform float k; uniform vec2 res; uniform float dpr; varying vec2 vUv;
      vec2 bend(vec2 uv, float s){ vec2 c = uv - 0.5; return 0.5 + c * (1.0 + k*s*dot(c,c)) * (1.0 - k*0.12); }
      // x: dot grid and guide lines behind the picture. y: edge rulers on top. Drawn before bending, so they bow with the glass.
      vec2 hud(vec2 uv){
        vec2 sz = res / dpr, px = uv * sz;
        vec2 g = mod(px, 12.0) - 6.0; float back = (1.0 - smoothstep(0.7, 1.4, length(g))) * 0.11;
        vec2 m = abs(mod(px + 48.0, 96.0) - 48.0); if (m.x < 0.6 || m.y < 0.6) back = max(back, 0.06);
        float fy = sz.y - px.y;
        float lenY = mod(fy, 120.0) < 1.0 ? 14.0 : (mod(fy, 24.0) < 1.0 ? 7.0 : 0.0);
        float lenX = mod(px.x, 120.0) < 1.0 ? 14.0 : (mod(px.x, 24.0) < 1.0 ? 7.0 : 0.0);
        float front = 0.0;
        if (px.x > 3.0 && px.x < 3.0 + lenY) front = 0.5;
        if (px.x < sz.x - 3.0 && px.x > sz.x - 3.0 - lenY) front = 0.5;
        if (fy > 3.0 && fy < 3.0 + lenX) front = 0.5;
        return vec2(back, front);
      }
      void main(){
        vec2 uv = bend(vUv, 1.0);
        vec4 c = texture2D(tex, uv);
        if (mode > 0.5){ vec2 o = (uv - 0.5) * 0.004; c.r = texture2D(tex, uv + o).r; c.b = texture2D(tex, uv - o).b; }
        float a = clamp(c.a, 0.0, 1.0);
        if (mode < 0.5) c.rgb = pow(max(c.rgb, 0.0), vec3(2.2));
        gl_FragColor = vec4(c.rgb, 1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
        vec2 h = hud(uv); vec3 ghost = vec3(0.945, 0.945, 0.933);
        vec3 col = mix(vec3(0.05, 0.05, 0.047), ghost, h.x);
        col = mix(col, gl_FragColor.rgb, a);
        col = mix(col, ghost, h.y);
        gl_FragColor = vec4(col, 1.0);
      }` }));
  barrel.frustumCulled = false; barrelScene = new THREE.Scene(); barrelScene.add(barrel);

  const pmrem = new THREE.PMREMGenerator(renderer);
  deckScene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture; deckScene.environmentIntensity = 0.5;
  deckScene.add(new THREE.HemisphereLight('#d9d4e6', '#111', 0.7));
  const key = new THREE.SpotLight('#fff1dc', 900, 0, 0.6, 0.7, 1.6); key.position.set(-30, 70, 40); deckScene.add(key, key.target);
  const rim = new THREE.SpotLight('#ff6a55', 500, 0, 0.5, 0.8, 1.6); rim.position.set(60, 40, -50); deckScene.add(rim, rim.target);
  const table = new THREE.Mesh(new THREE.PlaneGeometry(400, 260), new THREE.MeshStandardMaterial({ color:'#101010', roughness:.9 }));
  table.rotation.x = -Math.PI/2; table.position.y = -1.19; deckScene.add(table);
}

async function loadModel(loader, name){
  return loader.loadAsync('/assets/models/' + name);
}
function fontsReady(){ return Promise.race([Promise.all(['700 40px Archivo','40px "Permanent Marker"'].map(s => document.fonts.load(s))), new Promise(r => setTimeout(r, 2500))]); }

function stickerTexture(p){
  const c = document.createElement('canvas'); c.width = 1024; c.height = 290; const x = c.getContext('2d');
  x.fillStyle = '#ece2c6'; x.fillRect(0,0,1024,290);
  x.fillStyle = 'rgba(0,0,0,.08)'; for (let i=0;i<1024;i+=6){ x.fillRect(i, 0, 3, Math.random()*8); x.fillRect(i, 290-Math.random()*8, 3, 8); }
  x.fillStyle = p.color; x.beginPath(); x.arc(70,145,34,0,Math.PI*2); x.fill();
  x.fillStyle = '#1d1622'; x.textBaseline = 'middle';
  const lines = (p.short || p.label).split('\n'); const size = lines.length > 1 ? 92 : 150;
  x.font = `${size}px "Permanent Marker", cursive`;
  lines.forEach((l,i) => x.fillText(l, 130, 145 + (i - (lines.length-1)/2) * size * 1.02, 860));
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
}
function makeStick(src, p){
  const model = src.clone(true);
  model.traverse(o => { if (o.isMesh){ o.material = o.material.clone(); o.userData.stick = p.id; } });
  const sticker = new THREE.Mesh(new THREE.PlaneGeometry(4.9, 1.38), new THREE.MeshStandardMaterial({ map: stickerTexture(p), roughness:.9 }));
  sticker.rotation.x = -Math.PI/2; sticker.position.set(0.3, 0.515, 0); sticker.userData.stick = p.id; model.add(sticker);
  const g = new THREE.Group(); g.add(model); return g;
}
// upright, plug down, sticker facing the viewer
// lying flat, sticker facing the viewer (the first stick starts like this)
const FLAT = new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.PI/2, 0, 0));
const UPRIGHT = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, Math.PI/2, 0)).multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, Math.PI/2)));

if (renderer){
  const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
  Promise.all([loadModel(loader, 'console.glb'), loadModel(loader, 'usb.glb'), fontsReady()]).then(([c, u]) => {
    // home sticks: centre each on the body, stand them up
    PROJECTS.forEach((p, i) => {
      const s = makeStick(u.scene, p); s.children[0].position.x = 0.76; // centre the stick on its length
      const spin = new THREE.Group(); spin.add(s); s.quaternion.copy(UPRIGHT);
      homeScene.add(spin); homeSticks.push({ p, spin, stick: s, el: null });
    });
    // deck
    consoleRoot = c.scene; deckScene.add(consoleRoot);
    consoleRoot.traverse(o => { if (o.isMesh && o.name === 'console_screen') screenMesh = o; });
    setupScreen();
    const hit = new THREE.Raycaster(new THREE.Vector3(SLOT.x, 40, SLOT.z), new THREE.Vector3(0,-1,0)).intersectObject(consoleRoot, true)[0]; if (hit) surfaceY = SLOT.y = hit.point.y;
    buildDeckSticks(u.scene);
    const bb = new THREE.Box3().setFromObject(consoleRoot), mid = (bb.min.x + bb.max.x)/2;
    for (const k of ['wide', 'wideN']){ shots[k].pos.x = shots[k].look.x = mid; }
    for (const k of ['holo', 'holoN']){ shots[k].pos.x = shots[k].look.x = SCR.cx; }
    cam.pos.copy(shots.wide.pos); cam.look.copy(shots.wide.look);
    buildBeam(); beam.position.x = SCR.cx;
    modelsReady = true; deckReady = true; buildLocks(); resize(); route();
  }).catch(err => { console.error(err); modelsReady = true; toast('The 3D models did not load'); });
}

/* ---------- home: lock-on labels ---------- */
function buildLocks(){
  homeSticks.forEach(s => { s.el = document.querySelector(`[data-lock="${s.p.id}"]`); });
}

/* ---------- deck ---------- */
const STICK_SCALE = 1.4, PLUG = 2.46 * STICK_SCALE;
function buildDeckSticks(src){
  const homes = [ [-14, 30, -0.10], [1, 32, 0.06], [16, 30, 0.12] ];
  PROJECTS.forEach((p, i) => {
    const g = makeStick(src, p); g.scale.setScalar(STICK_SCALE);
    const [hx, hz, yaw] = homes[i];
    const home = { pos: new THREE.Vector3(hx, -1.19 + 0.44*STICK_SCALE, hz), quat: new THREE.Quaternion().setFromEuler(new THREE.Euler(0, yaw, 0)) };
    g.position.copy(home.pos); g.quaternion.copy(home.quat); deckScene.add(g);
    deckSticks.push({ p, group: g, home, hover: 0, atHome: true });
  });
  document.querySelectorAll('#crateList [data-pick]').forEach(b => on(b, 'click', () => toggle(b.dataset.pick)));
}
function buildBeam(){
  // a soft light cone rising off the screen, shown while the hologram is out
  const geo = new THREE.CylinderGeometry(9, 5.5, 22, 32, 1, true); geo.translate(0, 11, 0);
  const mat = new THREE.ShaderMaterial({ transparent:true, depthWrite:false, blending:THREE.AdditiveBlending, side:THREE.DoubleSide,
    uniforms:{ k:{ value:0 } }, vertexShader:'varying float vy; void main(){ vy = position.y/22.0; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); }',
    fragmentShader:'uniform float k; varying float vy; void main(){ gl_FragColor = vec4(vec3(0.75,0.85,1.0) * (1.0-vy) * 0.22 * k, 1.0); }' });
  beam = new THREE.Mesh(geo, mat); beam.position.set(0.15, 6.2, -14.2); beam.rotation.x = -0.32; deckScene.add(beam);
}
const tweens = [];
function tween(dur, fn){ return new Promise(res => { if (reduce){ fn(1); return res(); } tweens.push({ t0: clock.getElapsedTime(), dur, fn, res }); }); }
function stepTweens(now){ for (let i=tweens.length-1;i>=0;i--){ const tw = tweens[i]; const k = Math.min(1,(now-tw.t0)/tw.dur); tw.fn(k); if (k>=1){ tweens.splice(i,1); tw.res(); } } }
let deckGen = 0;
function resetDeck(){
  deckGen++; holoA = 0; tweens.splice(0).forEach(tw => tw.res()); busy = false; loadedId = null; pending = null; screenMode = 'idle'; hovered = null; deckHot = false;
  deckSticks.forEach(s => { s.group.position.copy(s.home.pos); s.group.quaternion.copy(s.home.quat); s.atHome = true; s.hover = 0; });
  const w = narrow ? shots.wideN : shots.wide; cam.pos.copy(w.pos); cam.look.copy(w.look);
  if (deckReady) syncUI();
}
async function insert(s){
  const gen = deckGen; s.atHome = false; const g = s.group, p0 = g.position.clone(), q0 = g.quaternion.clone(); const above = new THREE.Vector3(SLOT.x, surfaceY + PLUG + 9, SLOT.z);
  await tween(1.1, k => { const e = ease(k); const a = p0.clone().lerp(above, e); a.y += Math.sin(e*Math.PI)*8; g.position.copy(a); g.quaternion.slerpQuaternions(q0, UPRIGHT, Math.min(1, e*1.4)); });
  if (gen !== deckGen) return;
  await tween(0.45, k => { g.position.set(SLOT.x, surfaceY + PLUG + 9 - (9 + 1.8*STICK_SCALE)*k*k, SLOT.z); });
  if (gen !== deckGen) return;
  await tween(0.12, k => { g.position.y = surfaceY + PLUG - 1.8*STICK_SCALE + Math.sin(k*Math.PI)*0.25; });
}
async function removeStick(s){
  const gen = deckGen; await liftOut(s); if (gen !== deckGen) return; await flyHome(s);
}
function liftOut(s){ const g = s.group; return tween(0.35, k => { g.position.y = surfaceY + PLUG - 1.8*STICK_SCALE + (9 + 1.8*STICK_SCALE)*ease(k); }); }
async function flyHome(s){
  const g = s.group;
  const p0 = g.position.clone(), q0 = g.quaternion.clone();
  await tween(0.9, k => { const e = ease(k); const a = p0.clone().lerp(s.home.pos, e); a.y += Math.sin(e*Math.PI)*6; g.position.copy(a); g.quaternion.slerpQuaternions(q0, s.home.quat, e); });
  s.atHome = true;
}
async function toggle(id){
  if (busy || !deckReady) return; busy = true; const gen = deckGen;
  try{
    const cur = deckSticks.find(s => s.p.id === loadedId);
    const next = deckSticks.find(x => x.p.id === id);
    if (cur && cur.p.id === id){
      // eject only
      screenMode = 'eject'; if (holoA > 0.02 && !reduce) await new Promise(r => setTimeout(r, 450)); if (gen !== deckGen) return;
      await removeStick(cur); if (gen !== deckGen) return; loadedId = null; screenMode = 'idle'; syncUI(); setHash('projects'); return;
    }
    if (cur){
      // swap: the old stick pops out and flies home while the new one is already on its way in
      pending = id; screenMode = 'eject'; syncUI();
      if (holoA > 0.02 && !reduce) await new Promise(r => setTimeout(r, 300)); if (gen !== deckGen) return;
      await liftOut(cur); if (gen !== deckGen) return;
      loadedId = null; flyHome(cur); await insert(next); if (gen !== deckGen) return;
    } else { pending = id; syncUI(); await insert(next); if (gen !== deckGen) return; }
    pending = null; loadedId = id; loadT = clock.getElapsedTime(); screenMode = 'loading'; syncUI(); setHash(id);
  } finally { if (gen === deckGen) busy = false; }
}
function setHash(h){ try{ history.replaceState(null, '', '#' + h); }catch(e){} }
function syncUI(){
  PROJECTS.forEach(p => { const b = $('#pick-'+p.id); b.setAttribute('aria-pressed', String(p.id === loadedId || p.id === pending)); b.querySelector('.st').textContent = p.id === pending ? 'Loading' : p.id === loadedId ? 'Eject' : 'Load'; });
  const p = PROJECTS.find(x => x.id === loadedId), h = $('#holo'), q = PROJECTS.find(x => x.id === pending);
  $('#dsSlot').textContent = q ? 'Loading ' + q.tag : p ? p.tag : 'Empty'; $('#dsSlot').classList.toggle('hot', !!(p || q));
  $('#dsType').textContent = p ? p.made : '--'; $('#dsStack').textContent = p ? p.stack : '--'; $('#dsYear').textContent = p ? p.year : '--';
  if (!p) $('#dsTime').textContent = '00:00';
  $('#pvhint').textContent = q ? 'Loading ' + q.tag : p ? 'Projecting details' : 'Pick a USB to load it';
  h.querySelectorAll('[data-project]').forEach(card => { card.hidden = !p || card.dataset.project !== p.id; });
}

/* deck screen */
function setupScreen(){
  const c = document.createElement('canvas'); c.width = 1024; c.height = 576; screenCtx = c.getContext('2d');
  screenTex = new THREE.CanvasTexture(c); screenTex.colorSpace = THREE.SRGBColorSpace; screenTex.anisotropy = 8;
  consoleRoot.updateMatrixWorld(true);
  const pos = screenMesh.geometry.attributes.position, v = new THREE.Vector3(), w = [];
  for (let i=0;i<pos.count;i++){ v.fromBufferAttribute(pos, i).applyMatrix4(screenMesh.matrixWorld); w.push(v.clone()); }
  const xs = w.map(q=>q.x), zs = w.map(q=>q.z), x0 = Math.min(...xs), x1 = Math.max(...xs), z0 = Math.min(...zs), z1 = Math.max(...zs);
  const yAt = z => { const near = w.filter(q => Math.abs(q.z - z) < (z1 - z0)*0.05); return near.reduce((a, q) => a + q.y, 0) / near.length + 0.05; };
  SCR = { x0, x1, z0, z1, yb: yAt(z0), yf: yAt(z1), cx: (x0 + x1)/2 };
  screenMesh.geometry.setAttribute('uv', new THREE.Float32BufferAttribute(w.flatMap(q => [(q.x-x0)/(x1-x0), (z1-q.z)/(z1-z0)]), 2));
  screenMesh.material = new THREE.MeshBasicMaterial({ map: screenTex, toneMapped:false, polygonOffset:true, polygonOffsetFactor:-2, polygonOffsetUnits:-8 });
}
function wave(seed, n){ let h = 0; for (const ch of seed) h = (h*31 + ch.charCodeAt(0)) >>> 0; const out = [];
  for (let i=0;i<n;i++){ h = (h*1664525 + 1013904223) >>> 0; out.push(Math.max(.06, ((h>>>8)/16777216) * (0.35 + 0.65*Math.abs(Math.sin(i/37 + seed.length))))); } return out; }
const waves = {}; PROJECTS.forEach(p => waves[p.id] = wave(p.label, 900));
function drawScreen(now, holoK){
  const x = screenCtx, W = 1024, H = 576, F = 'Archivo, sans-serif'; if ('fontStretch' in x) x.fontStretch = 'semi-condensed';
  x.fillStyle = '#0b0a0c'; x.fillRect(0,0,W,H); x.textAlign = 'left';
  x.fillStyle = '#1b1a1d'; x.fillRect(0,0,W,52); x.font = `600 26px ${F}`; x.fillStyle = '#9a96a0'; x.fillText('USB 1', 22, 35); x.fillText('LUCA MAIOLO', W-180, 35);
  const p = PROJECTS.find(q => q.id === loadedId);
  if (screenMode === 'loading' && now - loadT > 0.9) screenMode = 'playing';
  if (!p || screenMode === 'idle' || screenMode === 'eject'){
    x.textAlign = 'center'; x.fillStyle = '#ecebee'; x.font = `700 64px ${F}`; const nx = PROJECTS.find(q => q.id === pending); x.fillText(nx ? 'Loading ' + nx.label : screenMode === 'eject' ? 'Ejecting' : 'No USB', W/2, 270, W-80);
    x.font = `500 32px ${F}`; x.fillStyle = '#9a96a0'; x.fillText('Insert a USB to load a project', W/2, 322);
    for (let i=0;i<24;i++){ const v = (Math.sin(now*2.2 + i*.55)+1)/2; x.fillStyle = i<19 ? '#d8d6d0' : '#e2412f'; x.globalAlpha = .2 + v*.5; x.fillRect(W/2 - 168 + i*14, 400, 10, 26); }
    x.globalAlpha = 1;
  } else if (screenMode === 'loading'){
    const k = Math.min(1, (now-loadT)/0.9); x.textAlign = 'center'; x.fillStyle = '#ecebee'; x.font = `700 48px ${F}`; x.fillText('Loading ' + p.label, W/2, 270, W-80);
    x.fillStyle = '#2a292d'; x.fillRect(212, 310, 600, 14); x.fillStyle = '#e2412f'; x.fillRect(212, 310, 600*k, 14);
  } else {
    x.fillStyle = p.color; x.fillRect(22, 74, 10, 110);
    x.fillStyle = '#f3f2f5'; x.font = `700 78px ${F}`; x.fillText(p.label, 50, 138, W-80);
    x.fillStyle = '#a3a0a8'; x.font = `500 38px ${F}`; x.fillText(p.kind + ' · ' + p.stack, 50, 182, W-80);
    // short summary on the screen itself
    x.fillStyle = '#d9d7dd'; x.font = `500 30px ${F}`;
    wrap(x, p.what, 50, 246, W-100, 36, 3);
    const wy = 450, wh = 96, data = waves[p.id], off = ((now - loadT) * 60) | 0;
    x.fillStyle = '#151417'; x.fillRect(0, wy-62, W, 124);
    for (let i=0;i<W/4;i++){ const v = data[(i + off) % data.length]; x.fillStyle = i < W/8 ? '#e2412f' : '#6f6c75'; x.fillRect(i*4, wy - v*wh/2, 3, v*wh); }
    x.fillStyle = '#ffffff'; x.fillRect(W/2-1, wy-62, 3, 124);
    x.fillStyle = holoK > .05 ? '#e2412f' : '#9a96a0'; x.font = `600 26px ${F}`; x.textAlign = 'right';
    x.fillText(holoK > .05 ? 'Hologram on' : 'Projecting details', W-22, 556);
  }
  screenTex.needsUpdate = true;
}
function wrap(x, text, X, Y, maxW, lh, maxLines){ const words = text.split(' '); let line = '', n = 0;
  for (const w of words){ const t = line ? line + ' ' + w : w; if (x.measureText(t).width > maxW && line){ x.fillText(n === maxLines-1 ? line + '…' : line, X, Y + n*lh); if (++n >= maxLines) return; line = w; } else line = t; }
  if (line) x.fillText(line, X, Y + n*lh); }

/* ---------- sizes and cameras ---------- */
let narrow = false;
function resize(){
  if (!renderer) return; const w = innerWidth, h = innerHeight; renderer.setSize(w, h, false); narrow = w < 860;
  const bw = renderer.domElement.width, bh = renderer.domElement.height, cp = (narrow ? 5 : 6) * renderer.getPixelRatio();
  rtScene.setSize(bw, bh); barrel.material.uniforms.res.value.set(bw, bh); barrel.material.uniforms.dpr.value = renderer.getPixelRatio();
  rt.setSize(Math.ceil(bw/cp), Math.ceil(bh/cp)); post.material.uniforms.res.value.set(Math.ceil(bw/cp)*cp, Math.ceil(bh/cp)*cp); post.material.uniforms.cell.value = cp;
  homeCam.aspect = deckCam.aspect = w/h; homeCam.updateProjectionMatrix(); deckCam.updateProjectionMatrix();
}
on(window, 'resize', resize);
const shots = {
  wide:  { pos: new THREE.Vector3(4, 66, 108), look: new THREE.Vector3(4, 0, 6) },
  focus: { pos: new THREE.Vector3(14, 40, 30), look: new THREE.Vector3(14, 5, -14) },
  holo:  { pos: new THREE.Vector3(10, 34, 58), look: new THREE.Vector3(10, 26, -12) },
  wideN: { pos: new THREE.Vector3(4, 120, 178), look: new THREE.Vector3(6, 0, 14) },
  focusN:{ pos: new THREE.Vector3(15, 52, 40), look: new THREE.Vector3(15, 4, -14) },
  holoN: { pos: new THREE.Vector3(10, 48, 78), look: new THREE.Vector3(10, 30, -12) },
};
const cam = { pos: shots.wide.pos.clone(), look: shots.wide.look.clone() };

/* ---------- picking on the deck ---------- */
const ray = new THREE.Raycaster(), ptr = new THREE.Vector2(); let hovered = null;
function stickAt(e){
  ptr.set(e.clientX/innerWidth*2 - 1, 1 - e.clientY/innerHeight*2); ray.setFromCamera(ptr, deckCam);
  const objs = []; deckSticks.forEach(s => s.group.traverse(o => { if (o.isMesh) objs.push(o); }));
  const hit = ray.intersectObjects(objs, false)[0]; return hit ? deckSticks.find(s => s.p.id === hit.object.userData.stick) : null;
}
const isBackdrop = el => !el || el === document.body || el === SC || el === screenEl || el.id === 'scene' || el.classList.contains('pv');
on(window, 'pointermove', e => { if (view !== 'projects') return;
  const [x, y] = toPage(e.clientX, e.clientY);
  if (e.pointerType !== 'mouse' || !isBackdrop(document.elementFromPoint(x, y))){ hovered = null; deckHot = false; return; }
  hovered = stickAt({ clientX:x, clientY:y }); deckHot = !!hovered; });
on(window, 'click', e => { if (view !== 'projects' || !isBackdrop(e.target)) return; const s = stickAt(e); if (s) toggle(s.p.id); });

// CSS matrix3d that maps a w x h box onto any four corners (TL, TR, BR, BL)
function quadMatrix(w, h, q){
  const src = [[0,0],[w,0],[w,h],[0,h]], A = [], B = [];
  for (let i=0;i<4;i++){ const [x, y] = src[i], [u, v] = q[i];
    A.push([x, y, 1, 0, 0, 0, -u*x, -u*y]); B.push(u); A.push([0, 0, 0, x, y, 1, -v*x, -v*y]); B.push(v); }
  for (let i=0;i<8;i++){ let m = i; for (let r=i+1;r<8;r++) if (Math.abs(A[r][i]) > Math.abs(A[m][i])) m = r;
    [A[i], A[m]] = [A[m], A[i]]; [B[i], B[m]] = [B[m], B[i]];
    for (let r=0;r<8;r++){ if (r === i) continue; const f = A[r][i]/A[i][i]; for (let c=i;c<8;c++) A[r][c] -= f*A[i][c]; B[r] -= f*B[i]; } }
  const H = B.map((b, i) => b/A[i][i]);
  return `matrix3d(${H[0]},${H[3]},0,${H[6]},${H[1]},${H[4]},0,${H[7]},0,0,1,0,${H[2]},${H[5]},0,1)`;
}
const toScreenPx = (x, y, z) => { tmp.set(x, y, z).project(deckCam); return [(tmp.x*.5+.5)*innerWidth, (-tmp.y*.5+.5)*innerHeight]; };

/* ---------- loop ---------- */
const tmp = new THREE.Vector3();
let last = performance.now();
function frame(now){
  const t = clock.getElapsedTime(); stepTweens(t);
  const rawDt = Math.min(0.25, (now - last)/1000), dt = Math.min(0.05, rawDt); last = now;
  const maxScroll = Math.max(1, SC.scrollHeight - SC.clientHeight), sp = clamp01(SC.scrollTop / maxScroll);
  const grow = revealStart < 0 ? 0 : reduce ? 1 : 1 - Math.pow(1 - clamp01((now - revealStart)/900), 3);

  if (view === 'home' && homeSticks.length){
    // 0 to .3: one stick. .3 to .7: the others slide out. after .7: lock-on labels.
    const split = ease(smooth(0.18, 0.62, sp)), labels = smooth(0.55, 0.8, sp);
    const spread = narrow ? 3.1 : 6.2, d = narrow ? 34 : 26;
    // at the end the three sticks, their labels and the Load button all have to fit between the pinned panels,
    // so on short windows the camera backs off until they do
    const band = Math.max(150, innerHeight - (narrow ? 300 : 360)), fit = 9.6 / (2 * Math.min(0.62, band/innerHeight) * Math.tan(THREE.MathUtils.degToRad(14)));
    const camZ = d + split*(narrow ? 6 : 4), camEnd = Math.max(camZ, fit);
    homeCam.position.set(0, 2.5 + split*1.2, camZ + (camEnd - camZ)*labels); homeCam.lookAt(0, split*0.4 - labels*(narrow ? 2.6 : 1.4), 0);
    const locks = [];
    homeSticks.forEach((s, i) => {
      const off = (i - 1) * spread * split;
      // no spin, so the stickers always face you: each stick bobs slowly up and down, a little out of step
      const bob = reduce ? 0 : Math.sin(now/1000 * 1.6 + i * 1.3) * 0.22;
      s.spin.position.set(off, bob, i === 1 ? 0 : -1.5*split); s.spin.rotation.y = 0;
      // the first stick lies flat on the opening screen and turns upright as the others slide out, to match them
      if (i === 1) s.stick.quaternion.slerpQuaternions(FLAT, UPRIGHT, split);
      s.spin.visible = i === 1 || split > 0.01;
      s.spin.scale.setScalar(i === 1 ? 1 : Math.max(0.001, split));
      if (s.el){ tmp.set(off, -3.9, s.spin.position.z).project(homeCam); const top = new THREE.Vector3(off, 4.2, s.spin.position.z).project(homeCam);
        locks.push({ el: s.el, x: (tmp.x*.5+.5)*innerWidth, y: (-tmp.y*.5+.5)*innerHeight, yt: (-top.y*.5+.5)*innerHeight }); }
    });
    // all three brackets share one top and bottom line, so the labels sit level
    if (locks.length){
      const y = Math.max(...locks.map(l => l.y)), yt = Math.min(...locks.map(l => l.yt));
      const bw = Math.min(130, (spread*0.55/ (homeCam.position.z*0.5)) * innerHeight * 0.9);
      locks.forEach(l => { l.el.style.transform = `translate(${l.x}px, ${y + 8}px) translate(-50%, 0)`; l.el.style.opacity = labels;
        const box = l.el.querySelector('.box'); box.style.width = bw + 'px'; box.style.height = (y - yt + 12) + 'px'; box.style.top = (yt - y - 14) + 'px'; });
    }
    $('#found').textContent = String(split > 0.95 ? 3 : split > 0.4 ? 2 : 1);
    setScan(1 + (split > 0.2) + (split > 0.6) + (split > 0.95) + (labels > 0.5) + (labels > 0.95));
    post.material.uniforms.grow.value = grow;
    renderer.toneMapping = THREE.NoToneMapping;
    renderer.setRenderTarget(rt); renderer.clear(); renderer.render(homeScene, homeCam);
    renderer.setRenderTarget(rtScene); renderer.clear(); renderer.render(postScene, postCam);
    barrel.material.uniforms.mode.value = 0;
    renderer.setRenderTarget(null); renderer.clear(); renderer.render(barrelScene, postCam);
  } else if (view === 'soon' && renderer){
    renderer.setRenderTarget(rtScene); renderer.clear(); renderer.render(emptyScene, postCam); barrel.material.uniforms.mode.value = 1; renderer.toneMapping = THREE.NoToneMapping;
    renderer.setRenderTarget(null); renderer.clear(); renderer.render(barrelScene, postCam);
  } else if (view === 'projects' && consoleRoot){
    // the hologram lifts off by itself a moment after the track starts playing
    const wantHolo = loadedId && screenMode === 'playing' && t - loadT > 1.3 ? 1 : 0;
    holoA = reduce ? wantHolo : clamp01(holoA + (wantHolo ? rawDt/1.2 : -rawDt/0.55));
    const holoK = ease(holoA);
    const base = loadedId && screenMode !== 'eject' ? (narrow ? shots.focusN : shots.focus) : (narrow ? shots.wideN : shots.wide);
    const hs = narrow ? shots.holoN : shots.holo;
    const wantPos = base.pos.clone().lerp(hs.pos, holoK), wantLook = base.look.clone().lerp(hs.look, holoK);
    cam.pos.lerp(wantPos, reduce ? 1 : 0.06); cam.look.lerp(wantLook, reduce ? 1 : 0.06);
    deckCam.position.copy(cam.pos); deckCam.lookAt(cam.look);
    deckSticks.forEach(s => { const want = (s === hovered && s.p.id !== loadedId && !busy) ? 1 : 0; s.hover += (want - s.hover)*0.15; if (s.atHome) s.group.position.y = s.home.pos.y + s.hover*1.2; });
    beam.material.uniforms.k.value = holoK; beam.visible = holoK > 0.01;
    drawScreen(t, holoK);
    // hologram: starts exactly on the deck screen's four corners, then unfolds to a flat panel in the middle
    const h = $('#holo'), hw = h.offsetWidth, hh = h.offsetHeight;
    const from = [toScreenPx(SCR.x0, SCR.yb, SCR.z0), toScreenPx(SCR.x1, SCR.yb, SCR.z0), toScreenPx(SCR.x1, SCR.yf, SCR.z1), toScreenPx(SCR.x0, SCR.yf, SCR.z1)];
    // final spot: centred over the screen, its bottom edge floating just above the screen's top edge
    const topY = Math.min(from[0][1], from[1][1]), midX = (from[0][0] + from[1][0])/2;
    const L = Math.max(16, Math.min(innerWidth - 16 - hw, midX - hw/2)), T = Math.max(20, Math.min(topY - hh - 18, innerHeight - 70 - hh));
    const to = [[L, T], [L + hw, T], [L + hw, T + hh], [L, T + hh]];
    if (holoK > 0) h.style.transform = quadMatrix(hw, hh, from.map((a, i) => [a[0] + (to[i][0] - a[0])*holoK, a[1] + (to[i][1] - a[1])*holoK]));
    const flick = holoK > 0 && holoK < 1 && !reduce ? (Math.random() < 0.12 ? 0.6 : 1) : 1;
    h.style.opacity = Math.min(1, holoK*2.5) * flick; h.classList.toggle('on', holoK > 0.9);
    $('#pvhint').style.opacity = holoK > 0.1 ? 0 : 1;
    document.querySelector('.crate').style.opacity = 1 - holoK*0.85;
    $('#deckstat').style.opacity = $('#meter').style.opacity = 1 - holoK*0.85; $('#pvtitle').style.opacity = 1 - smooth(0, 0.3, holoK);
    const playing = loadedId && screenMode === 'playing';
    if (playing){ const el = Math.floor(t - loadT); $('#dsTime').textContent = String(Math.floor(el/60)).padStart(2,'0') + ':' + String(el%60).padStart(2,'0'); }
    const wv = loadedId ? waves[loadedId] : null, off = ((t - loadT) * 60) | 0;
    [...barsEl.children].forEach((b, i) => { const v = playing ? Math.min(1, wv[(off + i*7) % wv.length] * (1.25 - i*0.03)) : 0.06 + 0.05*Math.abs(Math.sin(t*2 + i*0.6)); b.style.height = (v*100).toFixed(0) + '%'; });
    $('#mtState').textContent = playing ? 'Playing' : loadedId ? 'Cueing' : 'Standby';
    renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = (0.2 + 0.85*grow) * (1 - 0.6*holoK);
    renderer.setRenderTarget(rtScene); renderer.clear(); renderer.render(deckScene, deckCam);
    barrel.material.uniforms.mode.value = 1;
    renderer.setRenderTarget(null); renderer.clear(); renderer.render(barrelScene, postCam);
  }
  rafId = requestAnimationFrame(frame);
}

/* ---------- start ---------- */
let seen = false; try { seen = sessionStorage.getItem('lm-booted') === '1'; } catch(e){}
if (!seen) boot(); else { revealStart = performance.now(); }
route();
if (renderer){ resize(); rafId = requestAnimationFrame(frame); }

document.querySelectorAll('#holo [data-eject]').forEach(b => on(b, 'click', () => toggle(loadedId)));

return function stopLmos(){
  lifetime.abort();
  timers.forEach(clearInterval);
  cancelAnimationFrame(rafId);
  if (renderer) renderer.dispose();
};
}
