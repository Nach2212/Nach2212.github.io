# Portafolio — Ignacio Aguayo

Sitio personal de **Ignacio Aguayo**, Creative Technologist (Concepción, Chile).
Publicado en [nach2212.github.io](https://nach2212.github.io) vía GitHub Pages.

## Estructura

```
index.html          Página principal (bilingüe ES/EN)
ar/                 Tarjeta de presentación en Realidad Aumentada
js/translations.js  Textos en español e inglés
js/main.js          Lógica: starfield, modales, filtros, idioma, easter egg
src/input.css       CSS fuente (Tailwind + estilos personalizados)
css/styles.css      CSS compilado (generado, no editar a mano)
assets/             Imágenes, GIFs y CV
```

## Desarrollo

El CSS se compila con Tailwind CSS v3. Después de editar HTML, JS o `src/input.css`:

```bash
npx -y tailwindcss@3.4.17 -c tailwind.config.js -i src/input.css -o css/styles.css --minify
```

o con npm:

```bash
npm install
npm run build:css   # compilar una vez
npm run watch:css   # recompilar al guardar
npm run serve       # servidor local en http://localhost:8080
```

> **Importante:** `css/styles.css` es un archivo generado. Si agregas clases
> de Tailwind nuevas en el HTML o JS, debes recompilar antes de hacer push.
