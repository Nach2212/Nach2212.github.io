// ─────────────────────────────────────────────────────────────
//  CONFIGURACIÓN DEL EVENTO — edita solo este archivo
//  Fechas en hora de Chile. Formato: 'AAAA-MM-DDTHH:MM'
// ─────────────────────────────────────────────────────────────
export const EVENTO = {
  nombre: 'Prueba de Evento',
  bajada: 'Mapping AR · Proyecto de título',
  lugar: 'Sala de pruebas · Concepción',
  // Zona horaria de Chile continental (en octubre rige horario de verano, UTC-3)
  zona: '-03:00',
  // Texto de la marca de agua de las fotos y videos
  marcaDeAgua: 'PRUEBA DE EVENTO · MAPPING AR',

  funciones: [
    {
      inicio: '2026-10-19T18:00',
      duracionMin: 25,
      titulo: 'Superficie',
      zona: 'Epipelágica · 0–200 m',
      fondo: 'assets/02-arrecife.jpg',
      descripcion: 'Arrecife de coral y medusas que flotan hacia el público.',
    },
    {
      inicio: '2026-10-19T18:40',
      duracionMin: 25,
      titulo: 'Penumbra',
      zona: 'Mesopelágica · 200–1.000 m',
      fondo: 'assets/03-carta.jpg',
      descripcion: 'Carta de corrientes del Golfo de Arauco y rutas de cetáceos.',
    },
    {
      inicio: '2026-10-19T19:20',
      duracionMin: 30,
      titulo: 'Abismo',
      zona: 'Batipelágica · 1.000–4.000 m',
      fondo: 'assets/01-abismo.jpg',
      descripcion: 'Se abre el vórtice y una ballena sale de la proyección.',
    },
  ],
}
