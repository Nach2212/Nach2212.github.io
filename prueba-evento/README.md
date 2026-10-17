# Prueba de Evento · Mapping AR

Prototipo de web app para el evento del proyecto de título. Es estática, así que corre directo en **GitHub Pages**.

## Qué tiene
- **Inicio**: nombre, fecha, lugar y cuenta regresiva a la próxima función. Cuando una función está en curso, muestra cuánto le queda.
- **Funciones**: horarios con su estado (programada / en X min / en curso / terminada) y el fondo que se proyecta en cada una.
- **Cámara AR** (`ar/`): MindAR + three.js. Reconoce la proyección, muestra la escena y saca fotos o videos con el AR incluido.
- **Galería**: las capturas quedan guardadas en el teléfono de cada persona (IndexedDB). También se pueden subir fotos o videos propios, compartir y borrar.
- **Registro de asistencia**: solo la maqueta, todavía inactiva.
- **Pantalla del proyector**: `proyector.html` (← → cambiar fondo, F pantalla completa).
- Se puede instalar como app desde el navegador ("Agregar a pantalla de inicio").

## Editar el evento
Todo se cambia en **`event.js`**: nombre, lugar, marca de agua y la lista de funciones (hora de inicio, duración, título, zona, imagen, descripción).

## Publicar
1. Sube esta carpeta a un repo, por ejemplo `prueba-evento`.
2. Settings → Pages → Deploy from branch → `main` / `(root)`.
3. Queda en `https://<usuario>.github.io/prueba-evento/`.

Tiene que ser https (Pages lo es), porque sin https el celular no entrega la cámara.

## Estructura
```
index.html  site.css  site.js  event.js   ← página del evento
assets/galeria.js                         ← galería local compartida entre páginas
ar/                                       ← cámara AR (MindAR) + targets/targets.mind
fondos/                                   ← imágenes para proyectar (1920×1080)
marcadores-impresos/                      ← respaldo para imprimir
proyector.html
```

## Próximos pasos
- Galería compartida y registro: necesitan un backend (Supabase o Firebase sirven, y tienen plan gratis).
- Si cambias un fondo, recompila `ar/targets/targets.mind` con el compilador de MindAR, respetando el orden: abismo, arrecife, carta, y después los 3 impresos.
