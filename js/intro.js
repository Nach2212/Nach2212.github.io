/*
 * Intro: el logo "Globo orbitado" se arma (núcleo → globo → órbita → nombre)
 * y luego da paso al sitio. Se muestra una vez por sesión, se salta con
 * click o tecla, y no aparece con "reducir movimiento".
 * main.js espera window.__logoIntro antes de lanzar la animación del hero.
 */
(function () {
    var KEY = 'ia-intro-v1';
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var seen = false, recreating = false;
    try {
        seen = sessionStorage.getItem(KEY) === '1';
        recreating = sessionStorage.getItem('isRecreating') === 'true';
    } catch (e) { /* storage bloqueado: mostrar igual */ }

    if (reduce || seen || recreating) {
        window.__logoIntro = Promise.resolve();
        return;
    }
    try { sessionStorage.setItem(KEY, '1'); } catch (e) {}

    var BG = '#030712';
    var svg =
        '<svg class="ia-mark" viewBox="4 28 196 144" aria-hidden="true">' +
        '<defs>' +
        '<radialGradient id="iaCore" gradientUnits="userSpaceOnUse" cx="91" cy="92" r="28">' +
        '<stop offset="0" stop-color="#CFFAFE"/><stop offset=".45" stop-color="#22D3EE"/><stop offset="1" stop-color="#2563EB"/></radialGradient>' +
        '<radialGradient id="iaGlow" gradientUnits="userSpaceOnUse" cx="100" cy="100" r="44">' +
        '<stop offset=".45" stop-color="#22D3EE" stop-opacity=".2"/><stop offset="1" stop-color="#22D3EE" stop-opacity="0"/></radialGradient>' +
        '</defs>' +
        '<g transform="rotate(-20 100 100)">' +
        '<path class="ia-draw ia-back" pathLength="1" d="M192 100A92 28 0 0 0 8 100" fill="none" stroke="#2563EB" stroke-opacity=".6" stroke-width="4" stroke-linecap="round"/>' +
        '</g>' +
        '<circle cx="100" cy="100" r="60" fill="' + BG + '"/>' +
        '<circle class="ia-draw ia-globe" pathLength="1" cx="100" cy="100" r="58" fill="none" stroke="#3B82F6" stroke-width="4" transform="rotate(-90 100 100)"/>' +
        '<path class="ia-draw ia-meridian" pathLength="1" d="M100 42A24 58 0 1 1 100 158A24 58 0 1 1 100 42" fill="none" stroke="#3B82F6" stroke-width="4"/>' +
        '<circle cx="100" cy="100" r="30" fill="' + BG + '"/>' +
        '<circle class="ia-glow" cx="100" cy="100" r="44" fill="url(#iaGlow)"/>' +
        '<circle class="ia-core" cx="100" cy="100" r="22" fill="url(#iaCore)"/>' +
        '<g transform="rotate(-20 100 100)">' +
        '<path class="ia-draw ia-gap" pathLength="1" d="M8 100A92 28 0 0 0 192 100" fill="none" stroke="' + BG + '" stroke-width="12"/>' +
        '<path class="ia-draw ia-front" pathLength="1" d="M8 100A92 28 0 0 0 192 100" fill="none" stroke="#2563EB" stroke-width="5" stroke-linecap="round"/>' +
        '<circle class="ia-sat" cx="192" cy="100" r="7" fill="#22D3EE"/>' +
        '</g>' +
        '</svg>';

    var ov = document.createElement('div');
    ov.id = 'ia-intro';
    ov.setAttribute('role', 'presentation');
    ov.innerHTML =
        '<div class="ia-lockup">' + svg +
        '<div class="ia-words"><span class="ia-name">IGNACIO AGUAYO</span>' +
        '<span class="ia-tag">CREATIVE TECHNOLOGIST</span></div></div>' +
        '<div class="ia-skip">SALTAR INTRO</div>';

    var body = document.body;
    body.appendChild(ov);
    // Mostrar el overlay de inmediato (sin el fade del body)
    body.style.transition = 'none';
    body.classList.remove('opacity-0');
    void body.offsetWidth;
    body.style.transition = '';

    var resolveIntro;
    window.__logoIntro = new Promise(function (r) { resolveIntro = r; });

    var finished = false;
    function finish() {
        if (finished) return;
        finished = true;
        ov.classList.add('ia-intro--out');
        resolveIntro();
        setTimeout(function () { ov.remove(); }, 800);
        window.removeEventListener('keydown', finish);
    }

    var loaded = new Promise(function (r) {
        if (document.readyState === 'complete') r();
        else window.addEventListener('load', r);
    });
    var minTime = new Promise(function (r) { setTimeout(r, 3700); });
    Promise.all([loaded, minTime]).then(finish);
    setTimeout(finish, 8000); // respaldo si "load" tarda demasiado

    ov.addEventListener('click', finish);
    window.addEventListener('keydown', finish);
})();
