import * as THREE from 'three';
import { MindARThree } from 'mindar-image-three';
import { buildWhale, buildJellies, buildCalib } from './scenes.js';
import { guardar } from '../assets/galeria.js';
import { subir, conectada } from '../assets/nube.js';
import { EVENTO } from '../event.js';

/* ───────── Config (se puede ajustar por URL: ?cf=0.0001&beta=0.001&miss=5&warm=5&wm=Texto) ───────── */
const q = new URLSearchParams(location.search);
const num = (k, d) => (q.has(k) ? parseFloat(q.get(k)) : d);
const CFG = {
  filterMinCF: num('cf', 0.0001),   // menor = más suave (menos temblor, más lag)
  filterBeta: num('beta', 0.001),   // mayor = menos lag al mover rápido
  missTolerance: num('miss', 5),
  warmupTolerance: num('warm', 5),
};
const WATERMARK = q.get('wm') || EVENTO.marcaDeAgua || 'MAPPING AR · prueba';
const MAX_REC_S = 30;

// El orden = orden en que se compilaron en targets/targets.mind
// Fondos 16:9 (1920×1080) → aspect = 1080/1920. Portal del Abismo: centro (960,560), radio vertical 250 px.
const A169 = 1080 / 1920;
const px2y = (py) => -(py / 1080 - 0.5) * A169;
const TARGETS = [
  { name: 'Abismo 🐋', build: (g) => buildWhale(g, { portal: { x: 0, y: px2y(560), ry: 245 / 1920 } }) },
  { name: 'Arrecife 🪼', build: (g) => buildJellies(g, { aspect: A169 }) },
  { name: 'Carta 🧭', build: (g) => buildCalib(g, { aspect: A169 }) },
  // marcadores cuadrados de respaldo (para pruebas impresas)
  { name: 'Ballena (impreso)', build: (g) => buildWhale(g) },
  { name: 'Medusas (impreso)', build: (g) => buildJellies(g) },
  { name: 'Calibración (impreso)', build: (g) => buildCalib(g) },
];

/* ───────── DOM ───────── */
const $ = (id) => document.getElementById(id);
const container = $('ar');
const ui = {
  intro: $('intro'), hud: $('hud'), status: $('status'), debug: $('debug'), loading: $('loading'),
  shutter: $('btnShutter'), mode: $('btnMode'), dbgBtn: $('btnDebug'), hint: $('hint'), rec: $('recTimer'),
  flash: $('flash'), snaps: $('snaps'),
};

let mindar, renderer, scene, camera;
const anchors = [];
let activeIdx = -1;

/* ───────── Arranque ───────── */
$('btnStart').addEventListener('click', start);

async function start() {
  ui.intro.hidden = true;
  ui.loading.hidden = false;
  try {
    mindar = new MindARThree({
      container,
      imageTargetSrc: 'targets/targets.mind',
      maxTrack: 1,
      uiLoading: 'no', uiScanning: 'no', uiError: 'no',
      ...CFG,
    });
    ({ renderer, scene, camera } = mindar);
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    scene.add(new THREE.HemisphereLight(0xdff6ff, 0x203040, 1.6));
    const sun = new THREE.DirectionalLight(0xffffff, 1.4); sun.position.set(0.5, 1, 1.2); scene.add(sun);

    TARGETS.forEach((t, i) => {
      const anchor = mindar.addAnchor(i);
      const exp = t.build(anchor.group);
      anchor.onTargetFound = () => { activeIdx = i; exp.onFound?.(); setStatus(`✨ ${t.name}`, true); jitter.length = 0; };
      anchor.onTargetLost = () => { if (activeIdx === i) activeIdx = -1; exp.onLost?.(); setStatus('Buscando marcador…', false); };
      anchors.push({ anchor, exp });
    });

    await mindar.start();
    ui.loading.hidden = true;
    ui.hud.hidden = false;

    const clock = new THREE.Clock();
    renderer.setAnimationLoop(() => {
      const dt = Math.min(clock.getDelta(), 0.05), t = clock.elapsedTime;
      for (const { anchor, exp } of anchors) if (anchor.group.visible) exp.update(t, dt);
      renderer.render(scene, camera);
      afterRender(dt);
    });
  } catch (err) {
    console.error(err);
    ui.loading.hidden = true;
    ui.intro.hidden = false;
    alert('No se pudo abrir la cámara 😕\n\n' + (err?.message || err) + '\n\nRevisa que la página esté en https y que diste permiso de cámara.');
  }
}

function setStatus(text, found) { ui.status.textContent = text; ui.status.classList.toggle('found', found); }

/* ───────── Captura: compone cámara + AR en un canvas ───────── */
const cap = document.createElement('canvas');
const ctx = cap.getContext('2d');

function sizeCapture() {
  const r = container.getBoundingClientRect();
  const longSide = Math.min(1920, Math.max(r.width, r.height) * Math.min(devicePixelRatio || 1, 2));
  const k = longSide / Math.max(r.width, r.height);
  cap.width = Math.round(r.width * k / 2) * 2;     // dimensiones pares (H.264)
  cap.height = Math.round(r.height * k / 2) * 2;
}

function composite() {
  const c = container.getBoundingClientRect();
  const k = cap.width / c.width;
  const draw = (el, w, h) => {
    const r = el.getBoundingClientRect();
    ctx.drawImage(el, 0, 0, w, h, (r.left - c.left) * k, (r.top - c.top) * k, r.width * k, r.height * k);
  };
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, cap.width, cap.height);
  const v = mindar.video;
  if (v?.videoWidth) draw(v, v.videoWidth, v.videoHeight);
  const gl = renderer.domElement;
  draw(gl, gl.width, gl.height);
  // marca de agua
  const s = cap.width / 400;
  ctx.font = `700 ${Math.round(11 * s)}px system-ui, sans-serif`;
  ctx.fillStyle = 'rgba(255,255,255,.88)'; ctx.shadowColor = 'rgba(0,0,0,.6)'; ctx.shadowBlur = 6 * s;
  ctx.fillText(WATERMARK, 14 * s, cap.height - 16 * s);
  ctx.shadowBlur = 0;
}

let pendingPhoto = false;
let recorder = null, recChunks = [], recStart = 0, recording = false;
let mode = 'photo';

function afterRender(dt) {
  if (pendingPhoto) {
    pendingPhoto = false;
    sizeCapture(); composite();
    cap.toBlob((b) => capturaLista(b, 'image'), 'image/jpeg', 0.9);
  }
  if (recording) {
    composite();
    const s = (performance.now() - recStart) / 1000;
    ui.rec.textContent = `● ${String(Math.floor(s / 60)).padStart(2, '0')}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
    if (s >= MAX_REC_S) stopRecording();
  }
  updateDebug(dt);
}

function flash() { ui.flash.classList.add('on'); requestAnimationFrame(() => requestAnimationFrame(() => ui.flash.classList.remove('on'))); }

function pickMime() {
  const opts = ['video/mp4;codecs=avc1', 'video/mp4', 'video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm'];
  return opts.find((m) => window.MediaRecorder?.isTypeSupported?.(m)) || '';
}

function startRecording() {
  if (!cap.captureStream || !window.MediaRecorder) { alert('Este navegador no permite grabar video 😕 Prueba con Chrome o Safari actualizado.'); return; }
  sizeCapture(); composite();
  const stream = cap.captureStream(30);
  const mimeType = pickMime();
  recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 6_000_000 });
  recChunks = [];
  recorder.ondataavailable = (e) => e.data.size && recChunks.push(e.data);
  recorder.onstop = () => {
    const type = recorder.mimeType || mimeType || 'video/webm';
    capturaLista(new Blob(recChunks, { type }), 'video');
    stream.getTracks().forEach((t) => t.stop());
  };
  recorder.start(250);
  recStart = performance.now();
  recording = true;
  ui.shutter.classList.add('recording'); ui.rec.hidden = false; ui.mode.disabled = true;
}

function stopRecording() {
  if (!recording) return;
  recording = false;
  recorder.stop();
  ui.shutter.classList.remove('recording'); ui.rec.hidden = true; ui.mode.disabled = false;
}

ui.shutter.addEventListener('click', () => {
  if (!mindar) return;
  if (mode === 'photo') { flash(); pendingPhoto = true; }
  else recording ? stopRecording() : startRecording();
});

ui.mode.addEventListener('click', () => {
  mode = mode === 'photo' ? 'video' : 'photo';
  ui.shutter.classList.toggle('video', mode === 'video');
  ui.mode.textContent = mode === 'photo' ? '🎥' : '📷';
  ui.mode.setAttribute('aria-label', mode === 'photo' ? 'Cambiar a video' : 'Cambiar a foto');
  ui.hint.textContent = mode === 'photo' ? 'Toca para foto · cambia a 🎥 para grabar' : `Toca para grabar (máx ${MAX_REC_S}s) · toca otra vez para parar`;
});

/* ───────── Captura sin interrumpir la experiencia ─────────
   La foto o el video se guarda en el teléfono y se sube a la galería del evento.
   No se abre ninguna ventana: solo aparece una miniatura en la esquina y la animación sigue. */
function capturaLista(blob, kind) {
  if (!blob) return;
  const tipo = kind === 'image' ? 'foto' : 'video';
  const url = URL.createObjectURL(blob);
  const toast = document.createElement('a');
  toast.className = 'snap';
  toast.href = '../#galeria';
  toast.setAttribute('aria-label', 'Ver en la galería');
  toast.innerHTML = (kind === 'image' ? `<img src="${url}" alt="">` : `<video src="${url}" muted playsinline autoplay loop></video>`)
    + `<span class="snap-txt">Guardando…</span>`;
  ui.snaps.prepend(toast);
  // máximo 3 miniaturas a la vista
  [...ui.snaps.children].slice(3).forEach((n) => n.remove());
  const txt = toast.querySelector('.snap-txt');

  const local = guardar(blob, tipo, 'ar').catch((e) => { console.warn(e); return null; });
  const nube = conectada() ? subir(blob).then(() => true).catch((e) => { console.warn(e); return false; }) : Promise.resolve(null);
  if (conectada()) txt.textContent = 'Subiendo…';

  Promise.all([local, nube]).then(([okLocal, okNube]) => {
    if (okNube === true) { txt.textContent = 'En la galería ✓'; toast.classList.add('ok'); }
    else if (okNube === false) { txt.textContent = 'Guardada en tu teléfono'; toast.classList.add('warn'); }
    else { txt.textContent = okLocal !== null ? 'Guardada ✓' : 'No se pudo guardar'; toast.classList.add(okLocal !== null ? 'ok' : 'warn'); }
    setTimeout(() => { toast.classList.add('out'); setTimeout(() => { toast.remove(); URL.revokeObjectURL(url); }, 400); }, 4000);
  });
}

/* ───────── Panel de debug (FPS + temblor del tracking) ───────── */
let dbgOn = q.has('debug'), frames = 0, acc = 0, fps = 0;
const jitter = [];
const tmp = new THREE.Vector3();
ui.debug.hidden = !dbgOn;
ui.dbgBtn?.classList.toggle('on', dbgOn);
ui.dbgBtn?.addEventListener('click', () => { dbgOn = !dbgOn; ui.debug.hidden = !dbgOn; ui.dbgBtn.classList.toggle('on', dbgOn); });

function updateDebug(dt) {
  frames++; acc += dt;
  if (acc >= 0.5) { fps = frames / acc; frames = 0; acc = 0; }
  let jit = '—';
  if (activeIdx >= 0) {
    const g = anchors[activeIdx].anchor.group;
    const scale = new THREE.Vector3().setFromMatrixScale(g.matrixWorld).x || 1;
    tmp.setFromMatrixPosition(g.matrixWorld).divideScalar(scale);
    jitter.push(tmp.clone()); if (jitter.length > 30) jitter.shift();
    if (jitter.length > 5) {
      const m = jitter.reduce((a, p) => a.add(p), new THREE.Vector3()).divideScalar(jitter.length);
      const sd = Math.sqrt(jitter.reduce((a, p) => a + p.distanceToSquared(m), 0) / jitter.length);
      jit = (sd * 100).toFixed(2) + '% del ancho';
    }
  }
  if (!dbgOn) return;
  const v = mindar?.video;
  ui.debug.textContent =
    `fps      ${fps.toFixed(0)}\n` +
    `marcador ${activeIdx >= 0 ? TARGETS[activeIdx].name : '—'}\n` +
    `temblor  ${jit}\n` +
    `cámara   ${v?.videoWidth || 0}×${v?.videoHeight || 0}\n` +
    `filtro   cf=${CFG.filterMinCF} β=${CFG.filterBeta}`;
}
