import { EVENTO } from './event.js'
import { listar, guardar, borrar } from './assets/galeria.js'

const $ = (id) => document.getElementById(id)
const pad = (n) => String(n).padStart(2, '0')

/* ───────── Datos del evento ───────── */
const funciones = EVENTO.funciones.map((f) => {
  const inicio = new Date(`${f.inicio}:00${EVENTO.zona}`)
  return { ...f, inicio, fin: new Date(inicio.getTime() + f.duracionMin * 60000) }
}).sort((a, b) => a.inicio - b.inicio)

const fmtHora = (d) => d.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit', hourCycle: 'h23', timeZone: 'America/Santiago' })
const fmtFecha = (d) => d.toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'America/Santiago' })

$('nombre').textContent = EVENTO.nombre
$('bajada').textContent = EVENTO.bajada
$('lugar').textContent = EVENTO.lugar
if (funciones.length) {
  const f = fmtFecha(funciones[0].inicio)
  $('fecha').textContent = f.charAt(0).toUpperCase() + f.slice(1)
}

/* ───────── Lista de funciones ───────── */
const lista = $('listaFunciones')
lista.innerHTML = funciones.map((f, i) => `
  <li class="fn" data-i="${i}">
    <div class="fn-img" style="background-image:url('${f.fondo}')" role="img" aria-label="Fondo proyectado de ${f.titulo}"></div>
    <div class="fn-body">
      <div class="fn-top">
        <span class="fn-time">${fmtHora(f.inicio)}–${fmtHora(f.fin)}</span>
        <span class="chip soon" data-chip>Programada</span>
      </div>
      <h3 class="fn-title">${f.titulo}</h3>
      <span class="fn-zone">${f.zona}</span>
      <p class="fn-desc">${f.descripcion}</p>
    </div>
  </li>`).join('')

$('regFuncion').innerHTML = funciones.map((f) => `<option>${fmtHora(f.inicio)} · ${f.titulo}</option>`).join('')

/* ───────── Cuenta regresiva + estados ───────── */
function tick() {
  const now = Date.now()
  const live = funciones.find((f) => now >= f.inicio && now < f.fin)
  const next = funciones.find((f) => f.inicio > now)
  const box = document.querySelector('.countdown')

  let target = null
  if (live) {
    box.classList.add('live')
    $('cdLabel').textContent = 'En curso · termina en'
    $('cdTitle').textContent = live.titulo
    target = live.fin
  } else if (next) {
    box.classList.remove('live')
    $('cdLabel').textContent = next === funciones[0] ? 'Primera función en' : 'Próxima función en'
    $('cdTitle').textContent = `${next.titulo} · ${fmtHora(next.inicio)}`
    target = next.inicio
  } else {
    box.classList.remove('live')
    $('cdLabel').textContent = 'El evento terminó'
    $('cdTitle').textContent = 'Gracias por venir'
  }

  let s = target ? Math.max(0, Math.floor((target - now) / 1000)) : 0
  const h = Math.floor(s / 3600); s -= h * 3600
  const m = Math.floor(s / 60); s -= m * 60
  $('cdH').textContent = pad(Math.min(h, 99)); $('cdM').textContent = pad(m); $('cdS').textContent = pad(s)
  // más de 99 horas: mostrar días en la etiqueta
  $('cdH').nextElementSibling.textContent = h > 99 ? `horas (${Math.floor(h / 24)} días)` : 'horas'

  lista.querySelectorAll('.fn').forEach((li) => {
    const f = funciones[+li.dataset.i]
    const chip = li.querySelector('[data-chip]')
    li.classList.remove('live', 'done')
    if (now >= f.fin) { li.classList.add('done'); chip.className = 'chip done'; chip.textContent = 'Terminada' }
    else if (now >= f.inicio) { li.classList.add('live'); chip.className = 'chip live'; chip.textContent = 'En curso' }
    else if (f === next) {
      const mins = Math.ceil((f.inicio - now) / 60000)
      chip.className = 'chip next'
      chip.textContent = mins <= 90 ? `En ${mins} min` : 'Próxima'
    } else { chip.className = 'chip soon'; chip.textContent = 'Programada' }
  })
}
tick()
setInterval(tick, 1000)

/* ───────── Galería ───────── */
const grid = $('grid'), vacio = $('vacio')
let urls = []
let items = []

async function pintarGaleria() {
  urls.forEach((u) => URL.revokeObjectURL(u)); urls = []
  try { items = await listar() } catch { items = [] }
  vacio.hidden = items.length > 0
  grid.hidden = items.length === 0
  grid.innerHTML = ''
  for (const it of items) {
    const u = URL.createObjectURL(it.blob); urls.push(u)
    const b = document.createElement('button')
    b.className = 'tile'; b.type = 'button'
    b.setAttribute('aria-label', `${it.tipo === 'video' ? 'Video' : 'Foto'} del ${new Date(it.fecha).toLocaleString('es-CL')}`)
    b.innerHTML = it.tipo === 'video'
      ? `<video src="${u}#t=0.1" muted playsinline preload="metadata"></video><span class="tag">Video</span>`
      : `<img src="${u}" alt="" loading="lazy"><span class="tag">${it.origen === 'ar' ? 'AR' : 'Foto'}</span>`
    b.onclick = () => abrir(it, u)
    grid.appendChild(b)
  }
}

$('subir').addEventListener('change', async (e) => {
  const files = [...e.target.files]
  for (const f of files) {
    const tipo = f.type.startsWith('video') ? 'video' : 'foto'
    try { await guardar(f, tipo, 'subida') } catch (err) { console.warn(err) }
  }
  e.target.value = ''
  pintarGaleria()
})

/* Visor */
const visor = $('visor')
let actual = null
function abrir(it, url) {
  actual = { it, url }
  $('visorMedia').innerHTML = it.tipo === 'video'
    ? `<video src="${url}" controls playsinline autoplay loop></video>`
    : `<img src="${url}" alt="Captura">`
  visor.showModal()
}
$('vClose').onclick = () => visor.close()
visor.addEventListener('close', () => { $('visorMedia').innerHTML = '' })
$('vDelete').onclick = async () => { if (!actual) return; await borrar(actual.it.id); visor.close(); pintarGaleria() }
$('vShare').onclick = async () => {
  if (!actual) return
  const { it, url } = actual
  const ext = it.tipo === 'video' ? (it.mime?.includes('mp4') ? 'mp4' : 'webm') : 'jpg'
  const file = new File([it.blob], `prueba-evento-${it.fecha}.${ext}`, { type: it.mime || it.blob.type })
  try {
    if (navigator.canShare?.({ files: [file] })) { await navigator.share({ files: [file], title: EVENTO.nombre }); return }
  } catch (err) { if (err?.name === 'AbortError') return }
  const a = document.createElement('a'); a.href = url; a.download = file.name; document.body.appendChild(a); a.click(); a.remove()
}

pintarGaleria()
window.addEventListener('pageshow', pintarGaleria) // al volver desde la cámara

/* ───────── Pestaña activa según scroll ───────── */
const tabs = [...document.querySelectorAll('.tabbar a[data-sec]')]
const io = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (e.isIntersecting) tabs.forEach((t) => t.classList.toggle('on', t.dataset.sec === e.target.id))
  })
}, { rootMargin: '-45% 0px -50% 0px' })
;['inicio', 'funciones', 'como', 'galeria'].forEach((id) => { const el = $(id); if (el) io.observe(el) })

/* ───────── Sonar de fondo ───────── */
const cv = $('sonar'), cx = cv.getContext('2d')
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
let W = 0, H = 0, dpr = 1
function resize() { dpr = Math.min(devicePixelRatio || 1, 2); W = cv.width = innerWidth * dpr; H = cv.height = innerHeight * dpr }
resize(); addEventListener('resize', resize)
const motas = Array.from({ length: 70 }, () => ({ x: Math.random(), y: Math.random(), r: Math.random() * 1.6 + .4, v: Math.random() * .00012 + .00004 }))
function draw(t) {
  cx.clearRect(0, 0, W, H)
  const ox = W * .82, oy = H * .18
  for (let i = 0; i < 4; i++) {
    const p = ((t / 6000) + i / 4) % 1
    cx.beginPath(); cx.arc(ox, oy, p * Math.max(W, H) * .9, 0, Math.PI * 2)
    cx.strokeStyle = `rgba(143,243,255,${(1 - p) * .14})`; cx.lineWidth = 1.5 * dpr; cx.stroke()
  }
  cx.fillStyle = 'rgba(220,245,255,.5)'
  for (const m of motas) {
    m.y -= m.v * (reduce ? 0 : 16); if (m.y < -0.02) m.y = 1.02
    cx.beginPath(); cx.arc(m.x * W, m.y * H, m.r * dpr, 0, Math.PI * 2); cx.fill()
  }
  if (!reduce) requestAnimationFrame(draw)
}
requestAnimationFrame(draw)
