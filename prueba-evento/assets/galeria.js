// Galería local: guarda fotos y videos en el navegador de cada persona (IndexedDB).
// La usan la cámara AR (ar/) y la página principal. No sube nada a internet.

const DB = 'prueba-evento', STORE = 'capturas', VERSION = 1

let dbPromise = null
function open() {
  if (dbPromise) return dbPromise
  dbPromise = new Promise((resolve, reject) => {
    if (!('indexedDB' in window)) return reject(new Error('Este navegador no permite guardar archivos.'))
    const req = indexedDB.open(DB, VERSION)
    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains(STORE)) {
        const s = db.createObjectStore(STORE, { keyPath: 'id', autoIncrement: true })
        s.createIndex('fecha', 'fecha')
      }
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
  return dbPromise
}

function tx(mode, fn) {
  return open().then((db) => new Promise((resolve, reject) => {
    const t = db.transaction(STORE, mode)
    const out = fn(t.objectStore(STORE))
    t.oncomplete = () => resolve(out && 'result' in out ? out.result : out)
    t.onerror = () => reject(t.error)
    t.onabort = () => reject(t.error)
  }))
}

/** Guarda un Blob. tipo: 'foto' | 'video'. origen: 'ar' | 'subida' */
export function guardar(blob, tipo, origen = 'ar') {
  return tx('readwrite', (s) => s.add({ blob, tipo, origen, mime: blob.type, fecha: Date.now() }))
}

/** Lista todas las capturas, la más nueva primero */
export function listar() {
  return tx('readonly', (s) => s.getAll()).then((items) => (items || []).sort((a, b) => b.fecha - a.fecha))
}

export function borrar(id) {
  return tx('readwrite', (s) => s.delete(id))
}
