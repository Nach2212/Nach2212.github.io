# Prueba de Evento · Mapping AR

Prototipo de web app para el evento del proyecto de título. Es estática, así que corre directo en **GitHub Pages**.

## Qué tiene
- **Inicio**: nombre, fecha, lugar y cuenta regresiva a la próxima función. Cuando una función está en curso, muestra cuánto le queda.
- **Funciones**: horarios con su estado (programada / en X min / en curso / terminada) y el fondo que se proyecta en cada una.
- **Cámara AR** (`ar/`): MindAR + three.js. Reconoce la proyección, muestra la escena y saca fotos o videos con el AR incluido.
- **Galería del evento** (compartida): todos ven las fotos y videos de todos, y se actualiza sola cada 15 s. Usa Supabase (ver abajo).
- **Mis capturas**: copia local en el teléfono de cada persona (IndexedDB).
- La cámara **no se congela** al sacar foto o video: aparece una miniatura en la esquina ("Subiendo…" → "En la galería ✓") y la animación sigue.
- **Registro de asistencia**: solo la maqueta, todavía inactiva.
- **Pantalla del proyector**: `proyector.html` (← → cambiar fondo, F pantalla completa).
- Se puede instalar como app desde el navegador ("Agregar a pantalla de inicio").

## Activar la galería compartida (5 min, gratis)
1. Crea una cuenta en https://supabase.com y un proyecto nuevo (región: São Paulo, la más cercana).
2. Abre **SQL Editor → New query**, pega el contenido de `supabase.sql` y aprieta **Run**.
3. Ve a **Project Settings → API** y copia el **Project URL** y la clave **anon public**.
4. Pégalos en `event.js`, en `galeria.supabaseUrl` y `galeria.supabaseAnonKey`.
5. Haz commit y push. Listo.

La clave *anon* puede ir en el código sin problema: con el SQL de arriba solo deja ver y subir fotos o videos a esa carpeta, no borrar.
Ojo: cualquiera con el link puede subir. Para el evento real conviene agregar moderación, por ejemplo aprobar antes de mostrar.

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
- Registro de asistencia: se puede guardar en una tabla del mismo Supabase.
- Moderación de la galería (aprobar antes de publicar).
- Si cambias un fondo, recompila `ar/targets/targets.mind` con el compilador de MindAR, respetando el orden: abismo, arrecife, carta, y después los 3 impresos.
