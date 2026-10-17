// Galería compartida del evento (Supabase Storage, vía su API REST, sin librerías).
// Se activa cuando pegas tu URL y tu clave "anon" en event.js → EVENTO.galeria.
// Si no está configurada, todo sigue funcionando y las capturas solo quedan en el teléfono.

import { EVENTO } from '../event.js'

const cfg = EVENTO.galeria || {}
const URL_BASE = (cfg.supabaseUrl || '').replace(/\/+$/, '')
const KEY = cfg.supabaseAnonKey || ''
const BUCKET = cfg.bucket || 'galeria'
const MAX_MB = 50

export const conectada = () => Boolean(URL_BASE && KEY)

const headers = (extra = {}) => ({ apikey: KEY, Authorization: `Bearer ${KEY}`, ...extra })
const limpiarMime = (t) => (t || '').split(';')[0].trim() || 'application/octet-stream'
const extDe = (mime) => ({ 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'video/mp4': 'mp4', 'video/webm': 'webm', 'video/quicktime': 'mov' }[mime] || 'bin')

export const urlPublica = (nombre) => `${URL_BASE}/storage/v1/object/public/${BUCKET}/${encodeURIComponent(nombre)}`

/** Sube una foto o video. Devuelve la URL pública. */
export async function subir(blob) {
  if (!conectada()) throw new Error('Galería compartida no configurada')
  if (blob.size > MAX_MB * 1024 * 1024) throw new Error(`El archivo pesa más de ${MAX_MB} MB`)
  const mime = limpiarMime(blob.type)
  const nombre = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${extDe(mime)}`
  const res = await fetch(`${URL_BASE}/storage/v1/object/${BUCKET}/${nombre}`, {
    method: 'POST',
    headers: headers({ 'Content-Type': mime, 'x-upsert': 'false', 'cache-control': '31536000' }),
    body: blob,
  })
  if (!res.ok) throw new Error(`No se pudo subir (${res.status}): ${await res.text().catch(() => '')}`)
  return urlPublica(nombre)
}

/** Lista lo último que subió la gente, lo más nuevo primero. */
export async function listarNube(limite = 60) {
  if (!conectada()) return []
  const res = await fetch(`${URL_BASE}/storage/v1/object/list/${BUCKET}`, {
    method: 'POST',
    headers: headers({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ prefix: '', limit: limite, offset: 0, sortBy: { column: 'created_at', order: 'desc' } }),
  })
  if (!res.ok) throw new Error(`No se pudo leer la galería (${res.status})`)
  const items = await res.json()
  return items
    .filter((o) => o.name && !o.name.startsWith('.'))
    .map((o) => {
      const mime = o.metadata?.mimetype || ''
      return {
        url: urlPublica(o.name),
        tipo: mime.startsWith('video') || /\.(mp4|webm|mov)$/i.test(o.name) ? 'video' : 'foto',
        fecha: new Date(o.created_at || Date.now()).getTime(),
      }
    })
}
